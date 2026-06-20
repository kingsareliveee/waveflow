import ytdl from "@distube/ytdl-core";
import fs from "fs";

async function test() {
  try {
    const videoId = "kJQP7kiw5Fk";
    console.log("Fetching stream with ytdl-core...");
    const stream = ytdl(`https://www.youtube.com/watch?v=${videoId}`, { filter: 'audioonly' });
    const writeStream = fs.createWriteStream("test_ytdl.mp3");
    stream.pipe(writeStream);
    stream.on('info', (info) => console.log("Stream info obtained."));
    stream.on('error', (err) => console.error("Stream error:", err));
    writeStream.on('finish', () => console.log("Download finished."));
  } catch(e) {
    console.error(e);
  }
}

test();
