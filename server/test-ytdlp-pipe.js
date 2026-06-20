import { spawn } from 'child_process';
import fs from 'fs';

async function test() {
  const videoId = "ANNvmgrboDM";
  const command = spawn("yt-dlp", ["-f", "bestaudio", "-o", "-", "--no-update", `https://www.youtube.com/watch?v=${videoId}`]);
  const writeStream = fs.createWriteStream("test_ytdlp.mp3");
  
  command.stdout.pipe(writeStream);
  
  command.stderr.on('data', (data) => console.log(`stderr: ${data.toString()}`));
  
  command.on('close', (code) => {
    console.log(`yt-dlp exited with code ${code}`);
  });
}

test();
