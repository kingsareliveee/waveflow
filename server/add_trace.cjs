const fs = require('fs');

const path = 'c:\\Users\\anuj\\Music\\music webapp\\server\\services\\youtubeService.js';
let content = fs.readFileSync(path, 'utf8');

// Normalize line endings to \n
content = content.replace(/\r\n/g, '\n');

const replacements = [
  {
    target: `  static async fallbackToInvidious(videoId, req, res) {\n    console.log(\`[STREAM FALLBACK] Attempting Invidious fallback for videoId: \${videoId}\`);`,
    replacement: `  static async fallbackToInvidious(videoId, req, res) {\n    req.streamTrace = req.streamTrace || [];\n    req.streamTrace.push(\`[TRACE] Entering Invidious fallback\`);\n    console.log(\`[STREAM FALLBACK] Attempting Invidious fallback for videoId: \${videoId}\`);`
  },
  {
    target: `      proxyReq.on("error", (err) => {\n        console.error(\`[STREAM FALLBACK] Invidious proxy request error:\`, err.message);\n        if (res.headersSent) return;\n        res.status(500).json({ error: "Streaming backend unavailable." });\n      });`,
    replacement: `      proxyReq.on("error", (err) => {\n        req.streamTrace.push(\`[TRACE] Invidious failed: proxy error: \${err.message}\`);\n        console.error(\`[STREAM FALLBACK] Invidious proxy request error:\`, err.message);\n        if (res.headersSent) return;\n        res.status(500).json({ error: "Streaming backend unavailable.", trace: req.streamTrace });\n      });`
  },
  {
    target: `    } catch (err) {\n      console.error(\`[STREAM FALLBACK] Invidious fallback failed completely:\`, err.message);\n      if (res.headersSent) return;\n      res.status(500).json({ error: "Streaming backend unavailable." });\n    }`,
    replacement: `    } catch (err) {\n      req.streamTrace.push(\`[TRACE] Invidious failed: \${err.message}\`);\n      console.error(\`[STREAM FALLBACK] Invidious fallback failed completely:\`, err.message);\n      if (res.headersSent) return;\n      res.status(500).json({ error: "Streaming backend unavailable.", trace: req.streamTrace });\n    }`
  },
  {
    target: `  static async fallbackToYoutubeiOrPlayDl(videoId, req, res) {\n    console.log(\`[STREAM FALLBACK] Attempting youtubei.js/play-dl fallback for videoId: \${videoId}\`);`,
    replacement: `  static async fallbackToYoutubeiOrPlayDl(videoId, req, res) {\n    req.streamTrace = req.streamTrace || [];\n    req.streamTrace.push(\`[TRACE] Entering play-dl fallback\`);\n    console.log(\`[STREAM FALLBACK] Attempting youtubei.js/play-dl fallback for videoId: \${videoId}\`);`
  },
  {
    target: `        res.setHeader("Access-Control-Allow-Origin", "*");\n        \n        streamInfo.stream.pipe(res);`,
    replacement: `        res.setHeader("Access-Control-Allow-Origin", "*");\n        \n        req.streamTrace.push(\`[TRACE] play-dl success\`);\n        streamInfo.stream.pipe(res);`
  },
  {
    target: `    } catch (playErr) {\n      console.error(\`[STREAM FALLBACK] play-dl extraction failed:\`, playErr.message);\n    }`,
    replacement: `    } catch (playErr) {\n      req.streamTrace.push(\`[TRACE] play-dl failed: \${playErr.message}\`);\n      console.error(\`[STREAM FALLBACK] play-dl extraction failed:\`, playErr.message);\n    }`
  },
  {
    target: `    // Try youtubei.js fallback\n    try {\n      console.log(\`[STREAM FALLBACK] Trying youtubei.js extraction...\`);`,
    replacement: `    // Try youtubei.js fallback\n    try {\n      req.streamTrace.push(\`[TRACE] Entering youtubei fallback\`);\n      console.log(\`[STREAM FALLBACK] Trying youtubei.js extraction...\`);`
  },
  {
    target: `        res.setHeader("Access-Control-Allow-Origin", "*");\n\n        const nodeStream = Readable.fromWeb(stream);`,
    replacement: `        res.setHeader("Access-Control-Allow-Origin", "*");\n\n        req.streamTrace.push(\`[TRACE] youtubei success\`);\n        const nodeStream = Readable.fromWeb(stream);`
  },
  {
    target: `    } catch (ytErr) {\n      console.error(\`[STREAM FALLBACK] youtubei.js extraction failed:\`, ytErr.message);\n    }`,
    replacement: `    } catch (ytErr) {\n      req.streamTrace.push(\`[TRACE] youtubei failed: \${ytErr.message}\`);\n      console.error(\`[STREAM FALLBACK] youtubei.js extraction failed:\`, ytErr.message);\n    }`
  },
  {
    target: `  static async streamAudioToResponse(videoId, req, res) {\n    if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {`,
    replacement: `  static async streamAudioToResponse(videoId, req, res) {\n    req.streamTrace = [];\n    if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {`
  },
  {
    target: `    const fallbackToYtDlp = () => {\n      if (res.headersSent) {`,
    replacement: `    const fallbackToYtDlp = () => {\n      req.streamTrace.push(\`[TRACE] Entering yt-dlp piping\`);\n      if (res.headersSent) {`
  },
  {
    target: `        if (code !== 0 && code !== null) {\n          console.error(\`[STREAM ERROR STACK] fallbackToYtDlp process exited with code \${code} for videoId: \${videoId}. Error output (last 4KB): \${errorOutput}\`);\n          if (totalBytesStreamed === 0) {`,
    replacement: `        if (code !== 0 && code !== null) {\n          console.error(\`[STREAM ERROR STACK] fallbackToYtDlp process exited with code \${code} for videoId: \${videoId}. Error output (last 4KB): \${errorOutput}\`);\n          if (totalBytesStreamed === 0) {\n            req.streamTrace.push(\`[TRACE] yt-dlp piping failed: exit code \${code}, err: \${errorOutput.slice(-100)}\`);`
  },
  {
    target: `      command.on("error", (err) => {\n        console.error(\`[STREAM ERROR STACK] fallbackToYtDlp spawn error for videoId: \${videoId}:\`);\n        console.error(JSON.stringify(err, Object.getOwnPropertyNames(err), 2));\n        YoutubeService.fallbackToYoutubeiOrPlayDl(videoId, req, res);\n      });`,
    replacement: `      command.on("error", (err) => {\n        req.streamTrace.push(\`[TRACE] yt-dlp piping failed: spawn err \${err.message}\`);\n        console.error(\`[STREAM ERROR STACK] fallbackToYtDlp spawn error for videoId: \${videoId}:\`);\n        console.error(JSON.stringify(err, Object.getOwnPropertyNames(err), 2));\n        YoutubeService.fallbackToYoutubeiOrPlayDl(videoId, req, res);\n      });`
  },
  {
    target: `    try {\n      console.log(\`[STREAM] Fetching direct stream URL for seeking support...\`);`,
    replacement: `    try {\n      req.streamTrace.push(\`[TRACE] Entering Direct yt-dlp extraction\`);\n      console.log(\`[STREAM] Fetching direct stream URL for seeking support...\`);`
  },
  {
    target: `      proxyReq.on("error", (err) => {\n        console.error(\`[STREAM ERROR STACK] Proxy request error for videoId: \${videoId}:\`);\n        console.error(JSON.stringify(err, Object.getOwnPropertyNames(err), 2));\n        fallbackToYtDlp();\n      });`,
    replacement: `      proxyReq.on("error", (err) => {\n        req.streamTrace.push(\`[TRACE] Direct yt-dlp proxy failed: \${err.message}\`);\n        console.error(\`[STREAM ERROR STACK] Proxy request error for videoId: \${videoId}:\`);\n        console.error(JSON.stringify(err, Object.getOwnPropertyNames(err), 2));\n        fallbackToYtDlp();\n      });`
  },
  {
    target: `    } catch (err) {\n      console.error(\`[STREAM ERROR STACK] Failed to fetch direct stream URL for videoId: \${videoId}:\`);\n      console.error(err);\n      \n      const errMsg = err?.message || '';\n      const errStr = typeof err === 'string' ? err : (JSON.stringify(err) || '');\n      if (errMsg.includes("confirm you're not a bot") || errStr.includes("confirm you're not a bot")) {\n        console.warn("[STREAM] YouTube bot check detected on direct URL extraction. Immediately switching to play-dl/youtubei fallback...");\n        YoutubeService.fallbackToYoutubeiOrPlayDl(videoId, req, res);\n      } else {`,
    replacement: `    } catch (err) {\n      req.streamTrace.push(\`[TRACE] Direct yt-dlp extraction failed: \${err.message || String(err)}\`);\n      console.error(\`[STREAM ERROR STACK] Failed to fetch direct stream URL for videoId: \${videoId}:\`);\n      console.error(err);\n      \n      const errMsg = err?.message || '';\n      const errStr = typeof err === 'string' ? err : (JSON.stringify(err) || '');\n      if (errMsg.includes("confirm you're not a bot") || errStr.includes("confirm you're not a bot")) {\n        console.warn("[STREAM] YouTube bot check detected on direct URL extraction. Immediately switching to play-dl/youtubei fallback...");\n        YoutubeService.fallbackToYoutubeiOrPlayDl(videoId, req, res);\n      } else {`
  }
];

let success = true;
replacements.forEach((r, i) => {
  if (content.includes(r.target)) {
    content = content.replace(r.target, r.replacement);
    console.log(`Replacement \${i + 1} succeeded.`);
  } else {
    console.log(`Replacement \${i + 1} FAILED. Target not found.`);
    // Try to see what it's missing by matching a substring
    const firstLine = r.target.split('\\n')[0];
    if (content.includes(firstLine)) {
       console.log(\`  First line found: \${firstLine}\`);
    }
    success = false;
  }
});

if (success) {
  // Convert back to CRLF before writing on Windows (if original was CRLF, but letting Node handle it is fine)
  fs.writeFileSync(path, content, 'utf8');
  console.log('File successfully updated.');
} else {
  console.log('Skipping file write due to failed replacements.');
}
