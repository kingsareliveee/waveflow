import { exec, spawn } from "child_process";
import { promisify } from "util";
import ytSearch from "yt-search";

const execPromise = promisify(exec);

const vevoBlacklist = new Set();

export class YoutubeService {
  static async search(query) {
    if (!query) throw new Error("Search query is empty");
    const result = await ytSearch(query);
    return result.videos.slice(0, 15).map((video) => ({
      title: video.title,
      artist: video.author.name,
      videoId: video.videoId,
      duration: video.duration.timestamp,
      thumbnail: video.thumbnail || video.image || "",
    }));
  }

  static streamAudioToResponse(videoId, res) {
    if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      if (!res.headersSent) res.status(400).json({ error: "Invalid Video ID" });
      return;
    }

    if (vevoBlacklist.has(videoId)) {
      console.log(`\n--- Blocked Stream Request: ${videoId} (Blacklisted) ---`);
      if (!res.headersSent) res.status(403).json({ error: "Protected VEVO video cannot be streamed." });
      return;
    }

    // ── Diagnostic state ──
    const requestStart = performance.now();
    let firstByteReceivedAt = null;
    let firstByteSentAt = null;
    let totalBytesStreamed = 0;
    let peakMemoryUsage = 0;
    let headersSent = false;
    let errorOutput = "";

    console.log(`\n--- New Stream Request ---`);
    console.log(`[STREAM] videoId: ${videoId}`);
    console.log(`[STREAM] request started at: ${new Date().toISOString()}`);

    // ── yt-dlp args optimized for low-latency streaming ──
    const ytDlpArgs = [
      "-f", "bestaudio[ext=webm]/bestaudio/best", // prefer webm opus (smaller, faster start)
      "-o", "-",                                    // pipe to stdout — NO disk writes
      "--no-update",                                // skip update check
      "--no-playlist",                              // never expand playlists
      "--no-check-certificates",                    // skip TLS cert verification (faster handshake)
      "--no-cache-dir",                             // no disk cache
      "--no-part",                                  // no .part files
      `https://www.youtube.com/watch?v=${videoId}`
    ];
    console.log(`[STREAM] spawn: yt-dlp ${ytDlpArgs.join(" ")}`);

    const command = spawn("yt-dlp", ytDlpArgs, {
      stdio: ["ignore", "pipe", "pipe"],           // stdin ignored, stdout+stderr piped
      windowsHide: true,                           // hide console window on Windows
    });

    // ── Stream stdout → HTTP response (true streaming, no buffering) ──
    command.stdout.on("data", (chunk) => {
      // Track peak RSS memory
      const currentMem = process.memoryUsage.rss();
      if (currentMem > peakMemoryUsage) peakMemoryUsage = currentMem;

      if (!headersSent) {
        firstByteReceivedAt = performance.now();

        // Set headers on first data chunk — Express handles chunked transfer
        // encoding automatically when res.write() is used without Content-Length.
        // Do NOT set Transfer-Encoding manually; Express/Node handle it.
        res.setHeader("Content-Type", "audio/webm");
        res.setHeader("Accept-Ranges", "none");
        res.setHeader("Cache-Control", "no-store");
        res.setHeader("X-Content-Type-Options", "nosniff");
        headersSent = true;

        firstByteSentAt = performance.now();
        console.log(`[STREAM] ✓ first byte received: ${(firstByteReceivedAt - requestStart).toFixed(0)}ms after request`);
        console.log(`[STREAM] ✓ first byte sent to client: ${(firstByteSentAt - requestStart).toFixed(0)}ms after request`);
      }

      totalBytesStreamed += chunk.length;

      // Write chunk directly to response — no intermediate buffering.
      // If the client is slow, Node's backpressure on the writable stream
      // will naturally pause the readable (yt-dlp stdout).
      const canContinue = res.write(chunk);
      if (!canContinue) {
        // Backpressure: pause reading from yt-dlp until client drains
        command.stdout.pause();
        res.once("drain", () => {
          command.stdout.resume();
        });
      }
    });

    // ── Capture stderr for diagnostics (not buffered in memory — capped) ──
    command.stderr.on("data", (data) => {
      const msg = data.toString();
      // Cap error output to prevent unbounded memory growth
      if (errorOutput.length < 4096) {
        errorOutput += msg.slice(0, 4096 - errorOutput.length);
      }
      if (msg.trim()) console.log(`[STREAM] yt-dlp stderr: ${msg.trim()}`);
    });

    // ── Process exit ──
    command.on("close", (code) => {
      const elapsed = performance.now() - requestStart;
      const memMB = (peakMemoryUsage / (1024 * 1024)).toFixed(1);

      console.log(`[STREAM] ── Stream Complete ──`);
      console.log(`[STREAM]   exit code:          ${code}`);
      console.log(`[STREAM]   total bytes:         ${totalBytesStreamed.toLocaleString()}`);
      console.log(`[STREAM]   total duration:      ${(elapsed / 1000).toFixed(2)}s`);
      console.log(`[STREAM]   peak memory (RSS):   ${memMB} MB`);
      if (firstByteReceivedAt) {
        console.log(`[STREAM]   first byte latency:  ${(firstByteReceivedAt - requestStart).toFixed(0)}ms`);
      }
      console.log(`[STREAM] ──────────────────────\n`);

      // code === null → killed via signal (client disconnect)
      if (code !== 0 && code !== null) {
        if (totalBytesStreamed === 0) {
          console.error(`[STREAM] ERROR: yt-dlp failed with code ${code}, 0 bytes streamed. Blacklisting.`);
          vevoBlacklist.add(videoId);

          if (!headersSent) {
            res.status(403).json({ error: "Protected video. Stream failed." });
          } else {
            res.end();
          }
        } else {
          console.error(`[STREAM] WARNING: yt-dlp exited ${code} after ${totalBytesStreamed} bytes.`);
          if (headersSent) res.end();
        }
      } else {
        if (headersSent) res.end();
      }
    });

    // ── Handle spawn errors (e.g. yt-dlp not found) ──
    command.on("error", (err) => {
      console.error(`[STREAM] FATAL: Failed to spawn yt-dlp:`, err.message);
      if (!headersSent) {
        res.status(500).json({ error: "Streaming backend unavailable." });
      }
    });

    // ── Handle client disconnect: kill yt-dlp immediately ──
    res.on("close", () => {
      if (!command.killed) {
        command.kill("SIGKILL");
        console.log(`[STREAM] Client disconnected — yt-dlp killed (${totalBytesStreamed.toLocaleString()} bytes streamed)`);
      }
    });
  }

  static async getSongDetails(videoId) {
    if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      throw new Error("Invalid Video ID");
    }
    const command = `yt-dlp --dump-json --no-update "https://www.youtube.com/watch?v=${videoId}"`;
    const { stdout } = await execPromise(command);
    const json = JSON.parse(stdout.trim());
    return {
      title: json.title,
      artist: json.uploader || json.channel || "Unknown Artist",
      videoId: json.id,
      duration: json.duration_string,
      thumbnail: json.thumbnail || (json.thumbnails && json.thumbnails[json.thumbnails.length - 1].url) || "",
    };
  }
}
