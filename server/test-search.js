import { Innertube } from 'youtubei.js';

async function run() {
  console.log("Initializing Innertube...");
  const youtube = await Innertube.create();
  
  console.log("Searching playlists with type option...");
  const searchResults = await youtube.search("Arijit Singh", { type: 'playlist' });
  
  console.log("Playlists count:", searchResults.playlists?.length);
  if (searchResults.playlists?.length > 0) {
    const pl = searchResults.playlists[0];
    console.log("Keys of first playlist:", Object.keys(pl));
    console.log("First Playlist Full:", JSON.stringify(pl, (k, v) => {
      if (k === 'actions' || k === 'client' || k === 'context') return undefined;
      return v;
    }, 2));
  }
}

run().catch(console.error);
