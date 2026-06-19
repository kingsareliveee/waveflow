import { exec } from "child_process";
import { promisify } from "util";
import ytSearch from "yt-search";

const execPromise = promisify(exec);

export class YoutubeService {
  static async search(query) {
    if (!query) throw new Error("Search query is empty");
    const result = await ytSearch(query);
    return result.videos.slice(0, 15).map((video) => ({
      title: video.title,
      artist: video.author.name,
      videoId: video.videoId,
      duration: video.duration.timestamp,
      thumbnail: video.thumbnail || video.image || "",
    }));
  }

  static async getStreamUrl(videoId) {
    if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      throw new Error("Invalid Video ID");
    }
    const command = `yt-dlp -f bestaudio -g --no-update "https://www.youtube.com/watch?v=${videoId}"`;
    const { stdout } = await execPromise(command);
    const url = stdout.trim();
    if (!url || !url.startsWith("http")) {
      throw new Error("Failed to extract stream URL");
    }
    return url;
  }

  static async getSongDetails(videoId) {
    if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      throw new Error("Invalid Video ID");
    }
    const command = `yt-dlp --dump-json --no-update "https://www.youtube.com/watch?v=${videoId}"`;
    const { stdout } = await execPromise(command);
    const json = JSON.parse(stdout.trim());
    return {
      title: json.title,
      artist: json.uploader || json.channel || "Unknown Artist",
      videoId: json.id,
      duration: json.duration_string,
      thumbnail: json.thumbnail || (json.thumbnails && json.thumbnails[json.thumbnails.length - 1].url) || "",
    };
  }
}
