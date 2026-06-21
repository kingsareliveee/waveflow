import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function download() {
  if (process.platform === 'win32') {
    console.log('[ytdlp-download] Windows detected. Skipping binary download.');
    process.exit(0);
  }

  const binDir = path.join(__dirname, 'bin');
  const binPath = path.join(binDir, 'yt-dlp');

  if (!fs.existsSync(binDir)) {
    fs.mkdirSync(binDir, { recursive: true });
  }

  const url = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp';
  console.log(`[ytdlp-download] Downloading yt-dlp binary from ${url} to ${binPath}...`);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch latest yt-dlp: ${response.statusText} (${response.status})`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(binPath, buffer);
    console.log(`[ytdlp-download] Download complete. Size: ${buffer.length} bytes.`);
    
    try {
      fs.chmodSync(binPath, '755');
      console.log('[ytdlp-download] Executable permissions set (755).');
    } catch (chmodErr) {
      console.warn('[ytdlp-download] Warning: Failed to chmod binary:', chmodErr.message);
    }
    
    process.exit(0);
  } catch (err) {
    console.error('[ytdlp-download] Download failed:', err.message);
    process.exit(1);
  }
}

download();
