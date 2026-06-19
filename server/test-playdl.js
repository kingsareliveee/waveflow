import play from 'play-dl';
import fs from 'fs';

async function test() {
  try {
    const videoUrl = 'https://www.youtube.com/watch?v=ANNvmgrboDM';
    console.log("Fetching stream using play-dl for:", videoUrl);
    const stream = await play.stream(videoUrl);
    console.log("Stream fetched successfully. Type:", stream.type);
    console.log("Stream URL length:", stream.url.length);
    console.log("Piping stream to test_playdl.mp3...");
    const writeStream = fs.createWriteStream("test_playdl.mp3");
    stream.stream.pipe(writeStream);
    
    await new Promise((resolve, reject) => {
      writeStream.on('finish', () => {
        console.log("Stream piped successfully.");
        resolve();
      });
      writeStream.on('error', (err) => {
        console.error("Stream pipe failed:", err);
        reject(err);
      });
    });
  } catch (err) {
    console.error("Test failed:", err);
  }
}

test();
