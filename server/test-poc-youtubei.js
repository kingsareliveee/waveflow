import { Innertube } from 'youtubei.js';
import { Readable } from 'stream';
import fs from 'fs';

async function testPoc() {
  console.log("--- YouTubei.js Proof of Concept ---");
  try {
    const youtube = await Innertube.create();
    const videoId = "kJQP7kiw5Fk";
    
    console.log(`1. Fetching info for video: ${videoId}`);
    const info = await youtube.getInfo(videoId);
    console.log(`2. Title: ${info.basic_info.title}`);
    
    console.log("3. Requesting audio stream...");
    const stream = await youtube.download(videoId, { type: 'audio', quality: 'best' });
    
    console.log("4. Stream obtained, starting download...");
    const nodeStream = Readable.fromWeb(stream);
    const writeStream = fs.createWriteStream("poc_youtubei_audio.m4a");
    
    let downloadedBytes = 0;
    nodeStream.on('data', chunk => {
      downloadedBytes += chunk.length;
    });

    nodeStream.pipe(writeStream);
    
    await new Promise((resolve, reject) => {
      writeStream.on('finish', () => {
        console.log(`5. Download success. Total bytes: ${downloadedBytes}`);
        resolve();
      });
      writeStream.on('error', (err) => {
        console.error("6. Download error:", err);
        reject(err);
      });
    });
  } catch (err) {
    console.error("POC Error:", err.message);
  }
}

testPoc();
