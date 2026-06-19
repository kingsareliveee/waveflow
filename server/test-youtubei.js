import { Innertube } from 'youtubei.js';
import { Readable } from 'stream';
import fs from 'fs';

async function test() {
  try {
    console.log("Initializing Innertube...");
    const youtube = await Innertube.create();
    console.log("Innertube initialized successfully.");

    const videoId = "ANNvmgrboDM"; // a lofi track video id
    console.log(`Fetching info for video: ${videoId}`);
    const info = await youtube.getInfo(videoId);
    console.log("Basic Info Title:", info.basic_info.title);
    console.log("Basic Info Author:", info.basic_info.author);
    console.log("Downloading stream...");
    const stream = await youtube.download(videoId, { type: 'audio', quality: 'best' });
    console.log("Stream obtained successfully. Converting to Node stream...");
    
    const nodeStream = Readable.fromWeb(stream);
    const writeStream = fs.createWriteStream("test_audio.mp4");
    
    nodeStream.pipe(writeStream);
    
    await new Promise((resolve, reject) => {
      writeStream.on('finish', () => {
        console.log("Audio download finished successfully.");
        resolve();
      });
      writeStream.on('error', (err) => {
        console.error("Audio download error:", err);
        reject(err);
      });
    });
  } catch (err) {
    console.error("Test failed:", err);
  }
}

test();
