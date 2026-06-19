async function test() {
  try {
    const videoId = "ANNvmgrboDM";
    // List of public Invidious instances to try
    const instances = [
      "https://invidious.io.lol",
      "https://yewtu.be",
      "https://invidious.flokinet.to",
      "https://invidious.projectsegfau.lt",
      "https://iv.ggtyler.dev"
    ];

    let data = null;
    let successfulInstance = "";

    for (const instance of instances) {
      console.log(`Trying instance: ${instance}`);
      try {
        const res = await fetch(`${instance}/api/v1/videos/${videoId}`);
        if (res.ok) {
          data = await res.json();
          successfulInstance = instance;
          break;
        }
      } catch (e) {
        console.warn(`Instance ${instance} failed:`, e.message);
      }
    }

    if (data) {
      console.log("Successfully fetched video details from:", successfulInstance);
      console.log("Title:", data.title);
      console.log("Author:", data.author);
      console.log("Adaptive Formats found:", data.adaptiveFormats ? data.adaptiveFormats.length : 0);
      
      // Filter for audio-only format
      const audioFormats = data.adaptiveFormats.filter(f => f.type.startsWith("audio/"));
      console.log("Audio formats available:", audioFormats.map(f => `${f.container} - ${f.audioSampleRate}Hz - ${f.bitrate}bps`));
      
      // Get the audio URL (it's either direct or needs instance prepended)
      const bestAudio = audioFormats[0];
      const audioUrl = bestAudio.url.startsWith("http") ? bestAudio.url : `${successfulInstance}${bestAudio.url}`;
      console.log("Direct audio stream URL:", audioUrl);
    } else {
      console.error("All Invidious instances failed.");
    }
  } catch (err) {
    console.error("Test failed:", err);
  }
}

test();
