import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function download() {
  if (process.platform === 'win32') {
    console.log('[ytdlp-download] Windows detected. Skipping binary download.');
    process.exit(0);
  }

  const binDir = path.join(__dirname, 'server', 'bin');
  const binPath = path.join(binDir, 'yt-dlp');

  if (!fs.existsSync(binDir)) {
    fs.mkdirSync(binDir, { recursive: true });
  }

  const url = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp';
  console.log(`[ytdlp-download] Downloading yt-dlp binary from ${url} to ${binPath}...`);

  const file = fs.createWriteStream(binPath);
  
  const request = (targetUrl) => {
    https.get(targetUrl, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        console.log(`[ytdlp-download] Redirecting to: ${res.headers.location}`);
        request(res.headers.location);
      } else if (res.statusCode === 200) {
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log('[ytdlp-download] Download complete.');
          try {
            fs.chmodSync(binPath, '755');
            console.log('[ytdlp-download] Executable permissions set.');
          } catch (chmodErr) {
            console.error('[ytdlp-download] Error setting permissions:', chmodErr.message);
          }
          process.exit(0);
        });
      } else {
        console.error(`[ytdlp-download] Failed with status code: ${res.statusCode}`);
        process.exit(1);
      }
    }).on('error', (err) => {
      console.error('[ytdlp-download] Error requesting binary:', err.message);
      process.exit(1);
    });
  };

  request(url);
}

download();
