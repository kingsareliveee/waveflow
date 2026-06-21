import { YoutubeService } from "../services/youtubeService.js";

export const searchSongs = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: "Query parameter 'q' is required" });
    }
    const results = await YoutubeService.search(q);
    res.json(results);
  } catch (error) {
    console.error("Search controller error:", error);
    res.status(500).json({ error: "Failed to search songs" });
  }
};

export const streamAudio = async (req, res) => {
  try {
    const { videoId } = req.params;
    YoutubeService.streamAudioToResponse(videoId, res);
  } catch (error) {
    console.error("Stream controller error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to stream audio" });
    }
  }
};

export const getSongDetails = async (req, res) => {
  try {
    const { videoId } = req.params;
    const song = await YoutubeService.getSongDetails(videoId);
    res.json(song);
  } catch (error) {
    console.error("Song details controller error:", error);
    res.status(500).json({ error: "Failed to fetch song details" });
  }
};

export const getRelatedSongs = async (req, res) => {
  res.json([]);
};

export const getPlaylistDetails = async (req, res) => {
  try {
    const { playlistId } = req.params;
    if (!playlistId) {
      return res.status(400).json({ error: "Playlist ID is required" });
    }
    const playlist = await YoutubeService.getPlaylist(playlistId);
    res.json(playlist);
  } catch (error) {
    console.error("Playlist details controller error:", error);
    res.status(500).json({ error: "Failed to fetch playlist details" });
  }
};

export const getPersonalizedRecommendations = async (req, res) => {
  try {
    const { artists, genres, languages } = req.query;
    const recommendations = await YoutubeService.getRecommendations(artists, genres, languages);
    res.json(recommendations);
  } catch (error) {
    console.error("Recommendations controller error:", error);
    res.status(500).json({ error: "Failed to fetch recommendations" });
  }
};
