import { exec, spawn } from "child_process";
import { promisify } from "util";
import https from "https";
import ytSearch from "yt-search";
import { Innertube } from "youtubei.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import play from "play-dl";
import { Readable } from "stream";


const execPromise = promisify(exec);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let YTDLP_COMMAND = "yt-dlp";
let YTDLP_EXEC = "yt-dlp";

async function ensureYtDlp() {
  if (process.platform === 'win32') {
    console.log('[STREAM DIAGNOSTICS] Windows detected. Using global yt-dlp.');
    return "yt-dlp";
  }

  const binDir = path.join(__dirname, "..", "bin");
  const binPath = path.join(binDir, "yt-dlp");

  if (fs.existsSync(binPath)) {
    try {
      const stats = fs.statSync(binPath);
      if (stats.size > 1024 * 1024) { // Needs to be at least 1MB
        console.log(`[STREAM DIAGNOSTICS] yt-dlp binary exists at ${binPath} (Size: ${stats.size} bytes).`);
        try {
          fs.chmodSync(binPath, '755');
          console.log('[STREAM DIAGNOSTICS] Executable permissions set (755).');
        } catch (chmodErr) {
          console.warn('[STREAM DIAGNOSTICS] Failed to chmod binary:', chmodErr.message);
        }
        return binPath;
      } else {
        console.warn(`[STREAM DIAGNOSTICS] Existing binary is too small (${stats.size} bytes). Re-downloading...`);
        try {
          fs.unlinkSync(binPath);
        } catch (e) {}
      }
    } catch (err) {
      console.error('[STREAM DIAGNOSTICS] Existing binary check/chmod failed:', err.message);
    }
  }

  if (!fs.existsSync(binDir)) {
    fs.mkdirSync(binDir, { recursive: true });
  }

  const url = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp';
  console.log(`[STREAM DIAGNOSTICS] yt-dlp missing. Downloading binary from ${url} to ${binPath}...`);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch latest yt-dlp: ${response.statusText} (${response.status})`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(binPath, buffer);
    console.log(`[STREAM DIAGNOSTICS] Download complete. Size: ${buffer.length} bytes.`);
    
    try {
      fs.chmodSync(binPath, '755');
      console.log('[STREAM DIAGNOSTICS] Executable permissions set (755).');
    } catch (chmodErr) {
      console.warn('[STREAM DIAGNOSTICS] Failed to chmod binary:', chmodErr.message);
    }
    
    return binPath;
  } catch (err) {
    console.error('[STREAM DIAGNOSTICS] Download failed:', err.message, err);
    return "yt-dlp";
  }
}

const localYtDlpPath = path.join(__dirname, "..", "bin", "yt-dlp");

ensureYtDlp().then((resolvedPath) => {
  YTDLP_COMMAND = resolvedPath;
  YTDLP_EXEC = resolvedPath.includes(" ") ? `"${resolvedPath}"` : resolvedPath;
  console.log("YTDLP_COMMAND =", YTDLP_COMMAND);
  console.log("local exists =", fs.existsSync(localYtDlpPath));
  
  exec(`${YTDLP_EXEC} --version`, (err, stdout, stderr) => {
    if (err) {
      console.error(`[STREAM DIAGNOSTICS] Failed to execute resolved yt-dlp --version:`, err.message);
      console.error(`[STREAM DIAGNOSTICS] Full error stack:`, err);
    } else {
      console.log(`[STREAM DIAGNOSTICS] yt-dlp version check success: ${stdout.trim()}`);
    }
  });
}).catch((err) => {
  console.error("[STREAM DIAGNOSTICS] Failed to ensure yt-dlp binary:", err.message, err);
});

const vevoBlacklist = new Set();
const playlistCache = new Map();
const searchCache = new Map();

let youtubeInstance = null;
let isInitializing = false;

async function getYoutube() {
  if (youtubeInstance) return youtubeInstance;
  if (isInitializing) {
    // Wait a short time if already initializing
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (youtubeInstance) return youtubeInstance;
  }
  isInitializing = true;
  try {
    console.log("[YOUTUBEJS] Initializing Innertube...");
    youtubeInstance = await Innertube.create();
    console.log("[YOUTUBEJS] Innertube initialized successfully.");
  } catch (err) {
    console.error("[YOUTUBEJS] Failed to initialize Innertube:", err.message);
  } finally {
    isInitializing = false;
  }
  return youtubeInstance;
}

// Pre-initialize on import
getYoutube().catch(() => {});

// Similar artists map for taste picker & recommendation engine
export const RELATED_ARTISTS_MAP = {
  "Arijit Singh": ["Jubin Nautiyal", "KK", "Mohit Chauhan", "Atif Aslam", "Mithoon"],
  "Karan Aujla": ["Shubh", "AP Dhillon", "Sidhu Moosewala", "Gurinder Gill", "Diljit Dosanjh", "Prem Dhillon", "Navaan Sandhu"],
  "AP Dhillon": ["Karan Aujla", "Shubh", "Sidhu Moosewala", "Diljit Dosanjh", "Gurinder Gill"],
  "Shubh": ["Karan Aujla", "AP Dhillon", "Sidhu Moosewala", "Diljit Dosanjh"],
  "Sidhu Moosewala": ["Karan Aujla", "Shubh", "AP Dhillon", "Diljit Dosanjh"],
  "Diljit Dosanjh": ["Karan Aujla", "Shubh", "AP Dhillon", "Sidhu Moosewala", "Gurinder Gill"],
  "Talha Anjum": ["Talha Yunus", "Jokhay", "Rap Demon", "JJ47", "Umair"],
  "Talha Yunus": ["Talha Anjum", "Jokhay", "Rap Demon", "JJ47", "Umair"],
  "Atif Aslam": ["Arijit Singh", "Jubin Nautiyal", "KK", "Mohit Chauhan"],
  "Jubin Nautiyal": ["Arijit Singh", "KK", "Mohit Chauhan", "Atif Aslam"],
  "KK": ["Arijit Singh", "Jubin Nautiyal", "Mohit Chauhan", "Atif Aslam"],
  "Mohit Chauhan": ["Arijit Singh", "Jubin Nautiyal", "KK", "Atif Aslam"],
  "The Weeknd": ["Drake", "Travis Scott", "Post Malone", "Don Toliver"],
  "Drake": ["The Weeknd", "Travis Scott", "Post Malone", "Don Toliver"],
  "Travis Scott": ["The Weeknd", "Drake", "Post Malone", "Don Toliver"],
  "Post Malone": ["The Weeknd", "Drake", "Travis Scott", "Don Toliver"],
  "Don Toliver": ["The Weeknd", "Drake", "Travis Scott", "Post Malone"],
  "Seedhe Maut": ["Divine", "Badshah", "Talha Anjum", "Rap Demon"],
  "Divine": ["Seedhe Maut", "Badshah", "Talha Anjum", "Rap Demon"],
  "Badshah": ["Divine", "Yo Yo Honey Singh", "King", "Diljit Dosanjh"],
  "King": ["Badshah", "Anuv Jain", "The Local Train"],
  "Anuv Jain": ["The Local Train", "King", "Mohit Chauhan"],
  "The Local Train": ["Anuv Jain", "King", "Mohit Chauhan"],
  "Jordan Sandhu": ["Karan Aujla", "AP Dhillon", "Shubh", "Prem Dhillon", "Diljit Dosanjh"]
};

// Static artist metadata with Spotify CDN images
export const ARTIST_SEEDS = [
  // Indian (70%)
  { name: "Arijit Singh", genre: "Bollywood", language: "Hindi", image: "https://yt3.googleusercontent.com/DcEzZrPCQRSSs47rMbdJ3UJkQUCN3X8SKf8aCnvOgd2BmPihAz-0jBGJgEVh9_P8EiSBVNyixDs=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "Karan Aujla", genre: "Punjabi", language: "Punjabi", image: "https://yt3.googleusercontent.com/Da4zbrS4XLxzb3xVNT14aKr22aBg1blJCuCBppbYglO_uDmElYopgoDk7XV6UWNxthI96XOYrw=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "AP Dhillon", genre: "Punjabi", language: "Punjabi", image: "https://yt3.googleusercontent.com/Xu6Ve0v8QGPKbg5M0r6OplEBIYsrJFP26yhs-fYxlYgrrQMG9SYAPeMVqnBs_6ZBzaKGLJZh0A=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "Shubh", genre: "Punjabi", language: "Punjabi", image: "https://yt3.googleusercontent.com/97CgNnarowX8Nr0wpZCNg4x--k63vT2NZSNLpjTtBvNlYgFJJIAbiLUrABnok6sM8zk2bUIJ=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "Sidhu Moosewala", genre: "Punjabi", language: "Punjabi", image: "https://yt3.ggpht.com/ytc/AIdro_kiQJ0Hhp0O-tdaY1dy81-gSNujjccUlWstnpFr686ZlMk=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "Diljit Dosanjh", genre: "Punjabi", language: "Punjabi", image: "https://yt3.googleusercontent.com/7EYXXMXY594V8y4sZT2aawmdKgDAGTu5jNm9C-HpR3jY9cZJ0NMxS__nZKBdWZ1PUpJPjc2BAA=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "Gurinder Gill", genre: "Punjabi", language: "Punjabi", image: "https://yt3.googleusercontent.com/hWoKZMzI1IgMcjeKVNPtGOL2UKuBHXfqwEMTNMLIZuZvL5s7Bx69T_bVZMvU-rvd2lQ5r04R=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "Prem Dhillon", genre: "Punjabi", language: "Punjabi", image: "https://yt3.googleusercontent.com/WyNcsd5_HkKIT6KLJHjo-bIL3ayXnBKRBSYFpV2B8QWB-PjkiDg5O7peyZVKv2_ErONKtwne=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "Navaan Sandhu", genre: "Punjabi", language: "Punjabi", image: "https://yt3.googleusercontent.com/AOQavD8FMS7qkudtgL_j5oD-l1tCupjPPpK9qXFezekHfED_YLbxfOG_upKvvc3Vfk4eAD-7TA=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "Badshah", genre: "Pop", language: "Hindi", image: "https://yt3.googleusercontent.com/-9oGvXUOGtVCmGynMpDFsgufXGL_IRKYxjF3bff8_qnIazQDrIa2MXDT5-xAKAA6rIEC8x2EfiM=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "Divine", genre: "Hip-Hop", language: "Hindi", image: "https://yt3.googleusercontent.com/0tKOgElQgxy07H34hgX5gY4xiBVuRDkfhaobb1Ty5wn0ma1kNz_1GEhp84NMpM1UvPG70y60=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "Seedhe Maut", genre: "Hip-Hop", language: "Hindi", image: "https://yt3.googleusercontent.com/DUcKt_1YaJ_48_T_hlxWg285BGKkTfwNdzKRV82G-gHZVerUQ8FD8Dl2hkqHLUirrJDnG4C3RA=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "King", genre: "Pop", language: "Hindi", image: "https://yt3.googleusercontent.com/zXNttSOqO-WhRBCImfU_U_SVCrEmk4GUENAM5F_hf7n704lMA6I2fvXvTrw1D_Sf8Lq7Gkz46Q=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "Anuv Jain", genre: "Indie", language: "Hindi", image: "https://yt3.googleusercontent.com/jD_fMyavCIO4L4N8PYYTBmR5_BbZmczV5dzOjvuWH4z3XQ1kjJm5HAhyEmQk2xD90dlPUo1DX7o=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "Jubin Nautiyal", genre: "Bollywood", language: "Hindi", image: "https://yt3.googleusercontent.com/H2Ml5UObbCePh2hgUmfLLV3d7NoNO6pqgloMKOMD30sGvOSyBGzeZoNBm_hOwzAzGMHn2Lpn=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "KK", genre: "Bollywood", language: "Hindi", image: "https://yt3.ggpht.com/Ps9ycmE_wn6q3qk0oPX5p7SWreuGJh0ANSs6y3OzcoHL75wuA9XDAoUqZmigbPxL-wEhmVjc=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "Mohit Chauhan", genre: "Bollywood", language: "Hindi", image: "https://yt3.ggpht.com/iHlTfXwk3wCV5hwHWFJXZeNSSwHWU1KqvdkH3mP0eStfxHiiLL7QA7qAmKDpPJDW_z-NuxMrzaA=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "A.R. Rahman", genre: "Bollywood", language: "Hindi", image: "https://yt3.ggpht.com/ytc/AIdro_lfa_HP-vAmKA1j5Q2CBioDqVyClEr6sXREMMM-E7zYFU8=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "Pritam", genre: "Bollywood", language: "Hindi", image: "https://yt3.ggpht.com/H06fZaJ6OD2hmXPfumbn1GfvWQn9OOlUOzvn8LAwnhzCG035pLlYAICFkpS0K2q1oKhMAxPyCA=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "Yo Yo Honey Singh", genre: "Pop", language: "Hindi", image: "https://yt3.googleusercontent.com/2uUjDK69h-ijAxl6a_XrmKqLdL3ECr78FXXkUWERGJAHpSH0p3DEiNdlOuaR8LT3QCCF9P_ghg=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "The Local Train", genre: "Indie", language: "Hindi", image: "https://yt3.googleusercontent.com/N0lxjAH4Vd1YetT_NXAk12MP2XKHwGpsLch-H3SA745OL18vWAHR1WYvc0RoTWvzYPpLq3bI=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "Mithoon", genre: "Bollywood", language: "Hindi", image: "https://yt3.ggpht.com/LY5pMz1qb3KPmUjFXSDhxTKGpwGaQIVOBLpOw9L-eRvvwy9nMgDZIdNrHVLpeTGNw-uDOJqg=s88-c-k-c0x00ffffff-no-rj-mo" },
  
  // Pakistani (20%)
  { name: "Talha Anjum", genre: "Urdu Rap", language: "Urdu", image: "https://yt3.googleusercontent.com/zGaJjNDJcPtVAS_1iwOT-Ka4HH8U2eRkZld2d8FNxwvfMePFRSjew-Qi3H4JbkHTaHliAAEQPQ=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "Talha Yunus", genre: "Urdu Rap", language: "Urdu", image: "https://yt3.googleusercontent.com/BgHUQfg1LdkodiDQJ0RXPyrREow5IVOfprCoCJjJ0j-FLCUsKkpgVF2yO1Dsyifaupi3dLAbeQ=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "Atif Aslam", genre: "Bollywood", language: "Hindi", image: "https://ui-avatars.com/api/?name=Atif%20Aslam&background=random&color=fff" },
  { name: "Jokhay", genre: "Urdu Rap", language: "Urdu", image: "https://yt3.googleusercontent.com/zGaJjNDJcPtVAS_1iwOT-Ka4HH8U2eRkZld2d8FNxwvfMePFRSjew-Qi3H4JbkHTaHliAAEQPQ=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "Rap Demon", genre: "Urdu Rap", language: "Urdu", image: "https://yt3.googleusercontent.com/zIFSP-3jIETep8hRKl60GGDcBCTgiUE88kw25CL_HbDj0BSn0YiF8DxXCU2136UvYW9_6XjcNQ=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "JJ47", genre: "Urdu Rap", language: "Urdu", image: "https://yt3.googleusercontent.com/SUkQ16yH5HUnCvJD-i5wHaO37OlvjOymo9rUmXlvM3lFVwqKbG28xYLIazUTEKL4g6YOhHIANPM=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "Umair", genre: "Urdu Rap", language: "Urdu", image: "https://yt3.ggpht.com/z2GOzYjNTVTf0Wgba0cLCeSmG3TLU0mcaGSPVolo31gkPugfZpySVKwPGwVRimxo8MdwYt8vzw=s88-c-k-c0x00ffffff-no-rj-mo" },

  // International (10%)
  { name: "The Weeknd", genre: "Pop", language: "English", image: "https://yt3.googleusercontent.com/WHvw1ak1FcJaHeEiTmG2iN0dqEjjPxAtT_tA8ruJ3MlNr9I-RHsAur1iAenYeQN_d6LNPH2Z8Ic=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "Drake", genre: "Hip-Hop", language: "English", image: "https://yt3.ggpht.com/ytc/AIdro_lCPp6jFXJWIVHM0fIK5HofL3nyLOsmhu1Ek2OwyppYlOM=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "Travis Scott", genre: "Hip-Hop", language: "English", image: "https://yt3.ggpht.com/ytc/AIdro_lYT_V7ztsYEvILayV7Ey_fgzx2VYpeLJxFXf1TO0rjPH8=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "Post Malone", genre: "Pop", language: "English", image: "https://yt3.googleusercontent.com/CYKmEPOqcWMzKWbANlT9ok3-mkYxdiAMCh-YaXW8a19qfuT4ZQEar0OkIa8Rkd1tFSQO1Yq3bDA=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "Don Toliver", genre: "Hip-Hop", language: "English", image: "https://yt3.googleusercontent.com/SsuKZm4BYUk8FCKSkgCW65gvbZ8-yEAoFrHUA_H0PMctOdSyPqtnsVESUckRNMH7Pa9mO6-E4wQ=s88-c-k-c0x00ffffff-no-rj-mo" }
];

function secondsToDuration(sec) {
  if (!sec || sec <= 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export class YoutubeService {
  static async search(query) {
    if (!query) throw new Error("Search query is empty");
    
    // Check Cache
    if (searchCache.has(query)) {
      const cached = searchCache.get(query);
      if (Date.now() - cached.timestamp < 15 * 60 * 1000) { // 15 mins cache
        return cached.data;
      }
    }

    try {
      // Use yt-search package directly to prevent event loop blocking from Innertube
      const result = await ytSearch(query);
      const parsedResults = {
        songs: (result.videos || []).slice(0, 15).map((v) => ({
          videoId: v.videoId,
          title: v.title,
          artist: v.author?.name || "Unknown Artist",
          duration: v.duration?.timestamp || "",
          thumbnail: v.thumbnail || v.image || "",
        })),
        playlists: (result.playlists || []).slice(0, 10).map((p) => ({
          id: p.listId || p.id,
          title: p.title,
          author: p.author?.name || "YouTube",
          thumbnail: p.thumbnail || p.image || "",
          videoCount: p.videoCount ? `${p.videoCount} videos` : "Playlist",
        })),
        artists: (result.accounts || []).slice(0, 6).map((a) => ({
          id: a.id,
          name: a.name || a.title,
          thumbnail: a.thumbnail || a.image || "",
          verified: a.verified || false,
        })),
      };

      if (parsedResults.playlists.length === 0) {
        try {
          const youtube = await getYoutube();
          if (youtube) {
            const innerPlaylists = await youtube.search(query, { type: 'playlist' });
            if (innerPlaylists && innerPlaylists.playlists && innerPlaylists.playlists.length > 0) {
              parsedResults.playlists = innerPlaylists.playlists.slice(0, 10).map((p) => {
                const id = p.content_id || p.id || "";
                const title = p.metadata?.metadata_parts?.[0]?.text?.text || p.title?.toString() || "Playlist";
                const author = p.metadata?.metadata_parts?.[1]?.text?.text || p.author?.name || p.author?.toString() || "YouTube";
                const thumbnail = p.content_image?.primary_thumbnail?.image?.[0]?.url || p.thumbnails?.[0]?.url || "";
                const videoCount = p.content_image?.primary_thumbnail?.overlays?.[0]?.badges?.[0]?.text || p.video_count?.toString() || "Playlist";
                return {
                  id,
                  title,
                  author,
                  thumbnail,
                  videoCount
                };
              }).filter(p => p.id);
            }
          }
        } catch (innerErr) {
          console.error("[YOUTUBEJS] Innertube playlist fallback search failed:", innerErr.message);
        }
      }
      
      searchCache.set(query, { timestamp: Date.now(), data: parsedResults });
      return parsedResults;
    } catch (err) {
      console.error("[YOUTUBEJS] yt-search failed:", err.message);
      throw err;
    }
  }

  static async getPlaylist(playlistId) {
    if (!playlistId) throw new Error("Playlist ID is empty");

    if (playlistCache.has(playlistId)) {
      const cached = playlistCache.get(playlistId);
      if (Date.now() - cached.timestamp < 10 * 60 * 1000) { // 10 minutes cache
        return cached.data;
      }
    }

    try {
      const youtube = await getYoutube();
      if (!youtube) throw new Error("Innertube not available");

      const pl = await youtube.getPlaylist(playlistId);
      const songs = (pl.videos || []).map((v) => ({
        videoId: v.id,
        title: v.title?.text || "Unknown Title",
        artist: v.author?.name || v.author?.text || "Unknown Artist",
        thumbnail: v.thumbnails?.[0]?.url || "",
        duration: v.duration?.text || "",
      }));

      const data = {
        id: playlistId,
        title: pl.title || "YouTube Playlist",
        author: pl.author?.name || "YouTube",
        thumbnail: pl.thumbnails?.[0]?.url || (songs[0] && songs[0].thumbnail) || "",
        songs,
      };

      playlistCache.set(playlistId, { timestamp: Date.now(), data });
      return data;
    } catch (err) {
      console.error("[YOUTUBEJS] getPlaylist failed, falling back to yt-dlp flat playlist:", err.message);
      
      const command = `${YTDLP_EXEC} --flat-playlist --dump-single-json --no-update "https://www.youtube.com/playlist?list=${playlistId}"`;
      const { stdout } = await execPromise(command);
      const json = JSON.parse(stdout.trim());
      
      const songs = (json.entries || []).map((e) => ({
        videoId: e.id,
        title: e.title || "Unknown Title",
        artist: e.uploader || json.uploader || "Unknown Artist",
        thumbnail: e.thumbnails?.[0]?.url || "",
        duration: secondsToDuration(e.duration),
      }));

      const data = {
        id: playlistId,
        title: json.title || "YouTube Playlist",
        author: json.uploader || "YouTube",
        thumbnail: json.thumbnails?.[0]?.url || (songs[0] && songs[0].thumbnail) || "",
        songs,
      };

      playlistCache.set(playlistId, { timestamp: Date.now(), data });
      return data;
    }
  }

  static async getRecommendations(artistsCsv, genresCsv, languagesCsv) {
    const selectedArtists = artistsCsv ? artistsCsv.split(",") : [];
    const selectedGenres = genresCsv ? genresCsv.split(",") : [];
    const selectedLanguages = languagesCsv ? languagesCsv.split(",") : [];

    // 1. Build Recommended Artists (based on related mapping)
    const recArtistNames = new Set();
    selectedArtists.forEach(name => {
      const related = RELATED_ARTISTS_MAP[name];
      if (related) {
        related.forEach(r => {
          if (!selectedArtists.includes(r)) recArtistNames.add(r);
        });
      }
    });

    // Populate with default seeds if empty
    if (recArtistNames.size === 0) {
      ARTIST_SEEDS.slice(0, 6).forEach(a => {
        if (!selectedArtists.includes(a.name)) recArtistNames.add(a.name);
      });
    }

    const recommendedArtists = Array.from(recArtistNames)
      .slice(0, 10)
      .map(name => {
        const seed = ARTIST_SEEDS.find(s => s.name === name);
        return {
          id: name, // Use name as ID for simplicity
          name,
          thumbnail: seed ? seed.image : "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop",
          verified: true
        };
      });

    // 2. Build Recommended Songs
    // Search YouTube for "hits" or "mix" of a couple of user's selected artists
    const artistToSearch = selectedArtists[Math.floor(Math.random() * selectedArtists.length)] || "Arijit Singh";
    const songQuery = `${artistToSearch} hits songs`;
    let recommendedSongs = [];
    try {
      const searchRes = await this.search(songQuery);
      recommendedSongs = searchRes.songs || [];
    } catch (err) {
      console.error("[RECOMMENDATIONS] Songs search failed:", err.message);
    }

    // 3. Build Recommended Playlists / Albums
    // Search for playlist based on genre or language
    const preferredGenre = selectedGenres[0] || "Bollywood";
    const preferredLang = selectedLanguages[0] || "Hindi";
    const playlistQuery = `${preferredLang} ${preferredGenre} playlist`;
    let recommendedPlaylists = [];
    try {
      const playlistSearch = await this.search(playlistQuery);
      recommendedPlaylists = playlistSearch.playlists || [];
    } catch (err) {
      console.error("[RECOMMENDATIONS] Playlists search failed:", err.message);
    }
    
    // Recommended Albums (represented as Mixes or Albums playlists)
    const albumQuery = `${artistToSearch} full album`;
    let recommendedAlbums = [];
    try {
      const albumSearch = await this.search(albumQuery);
      recommendedAlbums = albumSearch.playlists || [];
    } catch (err) {
      console.error("[RECOMMENDATIONS] Albums search failed:", err.message);
    }

    return {
      songs: recommendedSongs.slice(0, 10),
      artists: recommendedArtists,
      playlists: recommendedPlaylists.slice(0, 5),
      albums: recommendedAlbums.slice(0, 5),
      metadata: {
        forYouArtist: artistToSearch,
        trendingGenre: preferredGenre
      }
    };
  }

  static async fallbackToInvidious(videoId, req, res) {
    req.streamTrace = req.streamTrace || [];
    req.streamTrace.push(`[TRACE] Entering Invidious fallback`);
    console.log(`[STREAM FALLBACK] Attempting Invidious fallback for videoId: ${videoId}`);
    
    if (res.headersSent) {
      console.log(`[STREAM FALLBACK] Headers already sent, aborting Invidious fallback for videoId: ${videoId}`);
      return;
    }

    try {
      const instancesRes = await fetch("https://api.invidious.io/instances.json?sort_by=type,health");
      if (!instancesRes.ok) throw new Error("Failed to fetch Invidious instances list");
      const instancesData = await instancesRes.json();
      
      const instances = [];
      for (const item of instancesData) {
        const info = item[1];
        if (info && info.type === "https" && info.monitor && !info.monitor.down && info.uri) {
          if (!info.uri.includes("onion") && !info.uri.includes("i2p")) {
            instances.push(info.uri);
          }
        }
      }

      console.log(`[STREAM FALLBACK] Found ${instances.length} active HTTPS Invidious instances.`);
      
      let audioUrl = null;
      let successfulInstance = "";
      
      for (const instance of instances.slice(0, 15)) {
        console.log(`[STREAM FALLBACK] Trying Invidious instance: ${instance}`);
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 4000);
          const response = await fetch(`${instance}/api/v1/videos/${videoId}`, { signal: controller.signal });
          clearTimeout(timeout);
          
          if (response.ok) {
            const videoData = await response.json();
            if (videoData.adaptiveFormats && videoData.adaptiveFormats.length > 0) {
              const audioFormats = videoData.adaptiveFormats.filter(f => f.type && f.type.startsWith("audio/"));
              if (audioFormats.length > 0) {
                const bestAudio = audioFormats[0];
                audioUrl = bestAudio.url.startsWith("http") ? bestAudio.url : `${instance}${bestAudio.url}`;
                successfulInstance = instance;
                console.log(`[STREAM FALLBACK] Successfully extracted URL from Invidious (${successfulInstance})`);
                break;
              }
            }
          }
        } catch (e) {
          console.warn(`[STREAM FALLBACK] Instance ${instance} failed:`, e.message);
        }
      }

      if (!audioUrl) {
        throw new Error("All tested Invidious instances failed to return audio stream URL");
      }

      console.log(`[STREAM FALLBACK] Proxying Invidious stream URL: ${audioUrl.substring(0, 60)}...`);
      const parsedUrl = new URL(audioUrl);
      const headers = { ...req.headers };
      delete headers.host;

      const options = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
        method: "GET",
        headers: headers,
        rejectUnauthorized: false
      };

      const proxyReq = https.request(options, (proxyRes) => {
        console.log(`[STREAM FALLBACK] Invidious proxy response status: ${proxyRes.statusCode}`);
        console.log(`[STREAM FALLBACK] Invidious proxy content-type: ${proxyRes.headers['content-type']}`);

        if (proxyRes.statusCode >= 400) {
          throw new Error(`Invidious proxy request returned error code: ${proxyRes.statusCode}`);
        }

        const responseHeaders = {};
        
        let contentType = proxyRes.headers['content-type'] || '';
        if (contentType.includes("mp4") || contentType.includes("m4a")) {
          contentType = "audio/mp4";
        } else {
          contentType = "audio/webm";
        }
        responseHeaders['content-type'] = contentType;
        
        if (proxyRes.headers['content-length']) {
          responseHeaders['content-length'] = proxyRes.headers['content-length'];
        }
        if (proxyRes.headers['content-range']) {
          responseHeaders['content-range'] = proxyRes.headers['content-range'];
        }
        if (proxyRes.headers['accept-ranges']) {
          responseHeaders['accept-ranges'] = proxyRes.headers['accept-ranges'];
        } else {
          responseHeaders['accept-ranges'] = 'bytes';
        }
        if (proxyRes.headers['cache-control']) {
          responseHeaders['cache-control'] = proxyRes.headers['cache-control'];
        } else {
          responseHeaders['cache-control'] = 'no-store';
        }
        
        responseHeaders['access-control-allow-origin'] = '*';
        responseHeaders['access-control-allow-headers'] = 'Range, Content-Type';
        responseHeaders['access-control-expose-headers'] = 'Content-Range, Content-Length, Accept-Ranges';

        if (res.headersSent) return;
        res.writeHead(proxyRes.statusCode, responseHeaders);
        proxyRes.pipe(res);
      });

      proxyReq.on("error", (err) => {
        req.streamTrace.push(`[TRACE] Invidious failed: proxy error: ${err.message}`);
        console.error(`[STREAM FALLBACK] Invidious proxy request error:`, err.message);
        if (res.headersSent) return;
        res.status(500).json({ error: "Streaming backend unavailable.", trace: req.streamTrace });
      });

      res.on("close", () => {
        proxyReq.destroy();
      });

      proxyReq.end();

    } catch (err) {
      req.streamTrace.push(`[TRACE] Invidious failed: ${err.message}`);
      console.error(`[STREAM FALLBACK] Invidious fallback failed completely:`, err.message);
      if (res.headersSent) return;
      res.status(500).json({ error: "Streaming backend unavailable.", trace: req.streamTrace });
    }
  }

  static async fallbackToYoutubeiOrPlayDl(videoId, req, res) {
    req.streamTrace = req.streamTrace || [];
    req.streamTrace.push(`[TRACE] Entering play-dl fallback`);
    console.log(`[STREAM FALLBACK] Attempting youtubei.js/play-dl fallback for videoId: ${videoId}`);
    
    if (res.headersSent) {
      console.log(`[STREAM FALLBACK] Headers already sent, aborting fallback for videoId: ${videoId}`);
      return;
    }

    // Try play-dl first
    try {
      console.log(`[STREAM FALLBACK] Trying play-dl extraction...`);
      const streamInfo = await play.stream(`https://www.youtube.com/watch?v=${videoId}`);
      if (streamInfo && streamInfo.stream) {
        console.log(`[STREAM FALLBACK] play-dl stream obtained. Content-type: ${streamInfo.type || 'audio/webm'}`);
        if (res.headersSent) return;
        
        let contentType = streamInfo.type || "audio/webm";
        if (contentType.includes("mp4") || contentType.includes("m4a")) {
          contentType = "audio/mp4";
        } else {
          contentType = "audio/webm";
        }
        
        res.setHeader("Content-Type", contentType);
        res.setHeader("Accept-Ranges", "none");
        res.setHeader("Cache-Control", "no-store");
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Access-Control-Allow-Origin", "*");
        
        req.streamTrace.push(`[TRACE] play-dl success`);
        streamInfo.stream.pipe(res);
        
        streamInfo.stream.on('error', (err) => {
          console.error(`[STREAM FALLBACK] play-dl stream read error:`, err);
          if (!res.headersSent) {
            res.end();
          }
        });
        return; // Success!
      } else {
        throw new Error("play-dl returned empty stream");
      }
    } catch (playErr) {
      req.streamTrace.push(`[TRACE] play-dl failed: ${playErr.message}`);
      console.error(`[STREAM FALLBACK] play-dl extraction failed:`, playErr.message);
    }

    // Try youtubei.js fallback
    try {
      req.streamTrace.push(`[TRACE] Entering youtubei fallback`);
      console.log(`[STREAM FALLBACK] Trying youtubei.js extraction...`);
      const youtube = await getYoutube();
      if (!youtube) throw new Error("youtubei.js not initialized");

      const stream = await youtube.download(videoId, { type: 'audio', quality: 'best' });
      if (stream) {
        console.log(`[STREAM FALLBACK] youtubei.js stream obtained successfully.`);
        if (res.headersSent) return;
        res.setHeader("Content-Type", "audio/webm");
        res.setHeader("Accept-Ranges", "none");
        res.setHeader("Cache-Control", "no-store");
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Access-Control-Allow-Origin", "*");

        req.streamTrace.push(`[TRACE] youtubei success`);
        const nodeStream = Readable.fromWeb(stream);
        nodeStream.pipe(res);
        
        nodeStream.on('error', (err) => {
          console.error(`[STREAM FALLBACK] youtubei.js stream read error:`, err);
          if (!res.headersSent) {
            res.end();
          }
        });
        return; // Success!
      } else {
        throw new Error("youtubei.js download returned empty stream");
      }
    } catch (ytErr) {
      req.streamTrace.push(`[TRACE] youtubei failed: ${ytErr.message}`);
      console.error(`[STREAM FALLBACK] youtubei.js extraction failed:`, ytErr.message);
    }

    // If play-dl and youtubei failed:
    console.log(`[STREAM FALLBACK] play-dl and youtubei both failed. Trying Invidious fallback...`);
    await YoutubeService.fallbackToInvidious(videoId, req, res);
  }

  static async streamAudioToResponse(videoId, req, res) {
    req.streamTrace = [];
    if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      if (res.headersSent) return;
      res.status(400).json({ error: "Invalid Video ID" });
      return;
    }

    if (vevoBlacklist.has(videoId)) {
      console.log(`\n--- Blocked Stream Request: ${videoId} (Blacklisted) ---`);
      if (res.headersSent) return;
      res.status(403).json({ error: "Protected VEVO video cannot be streamed." });
      return;
    }

    const fallbackToYtDlp = () => {
      req.streamTrace.push(`[TRACE] Entering yt-dlp piping`);
      if (res.headersSent) {
        console.log(`[STREAM DEBUG] fallbackToYtDlp called but headers already sent. Aborting.`);
        return;
      }

      const requestStart = performance.now();
      let firstByteReceivedAt = null;
      let firstByteSentAt = null;
      let totalBytesStreamed = 0;
      let peakMemoryUsage = 0;
      let headersSent = false;
      let errorOutput = "";

      console.log(`\n--- Falling Back to yt-dlp Stream ---`);
      console.log(`[STREAM] videoId: ${videoId}`);
      console.log(`[STREAM DEBUG] Spawning fallback yt-dlp binary: ${YTDLP_COMMAND}`);

      const ytDlpArgs = [
        "-f", "bestaudio[ext=webm]/bestaudio/best",
        "-o", "-",
        "--no-update",
        "--no-playlist",
        "--no-check-certificates",
        "--no-cache-dir",
        "--no-part",
        `https://www.youtube.com/watch?v=${videoId}`
      ];

      const command = spawn(YTDLP_COMMAND, ytDlpArgs, {
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true,
      });

      command.stdout.on("data", (chunk) => {
        const currentMem = process.memoryUsage.rss();
        if (currentMem > peakMemoryUsage) peakMemoryUsage = currentMem;

        if (!headersSent && !res.headersSent) {
          firstByteReceivedAt = performance.now();
          res.setHeader("Content-Type", "audio/webm");
          res.setHeader("Accept-Ranges", "none");
          res.setHeader("Cache-Control", "no-store");
          res.setHeader("X-Content-Type-Options", "nosniff");
          res.setHeader("Access-Control-Allow-Origin", "*");
          headersSent = true;
          firstByteSentAt = performance.now();
        }

        totalBytesStreamed += chunk.length;
        if (!res.writableEnded) {
          const canContinue = res.write(chunk);
          if (!canContinue) {
            command.stdout.pause();
            res.once("drain", () => {
              command.stdout.resume();
            });
          }
        }
      });

      command.stderr.on("data", (data) => {
        const msg = data.toString();
        if (errorOutput.length < 4096) {
          errorOutput += msg.slice(0, 4096 - errorOutput.length);
        }
      });

      command.on("close", (code) => {
        console.log(`[STREAM DEBUG] fallbackToYtDlp closed with code: ${code} for videoId: ${videoId}`);
        if (code !== 0 && code !== null) {
          console.error(`[STREAM ERROR STACK] fallbackToYtDlp process exited with code ${code} for videoId: ${videoId}. Error output (last 4KB): ${errorOutput}`);
          if (totalBytesStreamed === 0) {
            req.streamTrace.push(`[TRACE] yt-dlp piping failed: exit code ${code}, error: ${errorOutput.slice(-100)}`);
            console.log(`[STREAM] fallbackToYtDlp failed to stream any bytes. Trying play-dl/youtubei fallback...`);
            YoutubeService.fallbackToYoutubeiOrPlayDl(videoId, req, res);
          } else {
            if (res.headersSent) return;
            res.end();
          }
        } else {
          if (res.headersSent) return;
          res.end();
        }
      });

      command.on("error", (err) => {
        req.streamTrace.push(`[TRACE] yt-dlp piping failed: spawn error ${err.message}`);
        console.error(`[STREAM ERROR STACK] fallbackToYtDlp spawn error for videoId: ${videoId}:`);
        console.error(JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
        YoutubeService.fallbackToYoutubeiOrPlayDl(videoId, req, res);
      });

      res.on("close", () => {
        if (!command.killed) {
          command.kill("SIGKILL");
        }
      });
    };

    try {
      req.streamTrace.push(`[TRACE] Entering Direct yt-dlp extraction`);
      console.log(`[STREAM] Fetching direct stream URL for seeking support...`);
      const command = `${YTDLP_EXEC} -f "bestaudio[ext=webm]/bestaudio/best" -g "https://www.youtube.com/watch?v=${videoId}"`;
      console.log(`[STREAM DEBUG] Running command to extract direct URL for videoId: ${videoId}: ${command}`);
      
      let stdout;
      try {
        const result = await execPromise(command);
        stdout = result.stdout;
      } catch (execErr) {
        console.error(`[STREAM ERROR STACK] execPromise failed to execute command for videoId: ${videoId}`);
        console.error(JSON.stringify(execErr, Object.getOwnPropertyNames(execErr), 2));
        throw execErr;
      }

      const lines = stdout.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
      const directUrl = lines.find(line => line.startsWith("http"));
      console.log(`[STREAM DEBUG] Extracted stream URL for videoId ${videoId}: ${directUrl}`);

      if (!directUrl) {
        throw new Error("Invalid/empty stream URL returned by yt-dlp");
      }

      const parsedUrl = new URL(directUrl);
      if (!parsedUrl.hostname.includes("googlevideo.com") && !parsedUrl.hostname.includes("youtube.com") && !parsedUrl.hostname.includes("ytimg.com")) {
        throw new Error(`Extracted stream URL is not a recognized YouTube domain: ${parsedUrl.hostname}`);
      }

      console.log(`[STREAM] Direct URL found: ${directUrl.substring(0, 60)}...`);
      const headers = { ...req.headers };
      delete headers.host;

      const options = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
        method: "GET",
        headers: headers,
        rejectUnauthorized: false
      };

      const proxyReq = https.request(options, (proxyRes) => {
        console.log(`[STREAM DEBUG] Google Video response status for videoId ${videoId}: ${proxyRes.statusCode}`);
        console.log(`[STREAM DEBUG] Raw content-type returned from Google for videoId ${videoId}: ${proxyRes.headers['content-type']}`);
        
        if (proxyRes.statusCode >= 400) {
          console.warn(`[STREAM WARNING] Google Video returned status ${proxyRes.statusCode} for videoId ${videoId}. Falling back to yt-dlp piping.`);
          proxyReq.destroy();
          fallbackToYtDlp();
          return;
        }

        const responseHeaders = {};
        
        let contentType = proxyRes.headers['content-type'] || '';
        if (contentType.includes("mp4") || contentType.includes("m4a")) {
          contentType = "audio/mp4";
        } else {
          contentType = "audio/webm";
        }
        responseHeaders['content-type'] = contentType;
        
        if (proxyRes.headers['content-length']) {
          responseHeaders['content-length'] = proxyRes.headers['content-length'];
        }
        if (proxyRes.headers['content-range']) {
          responseHeaders['content-range'] = proxyRes.headers['content-range'];
        }
        if (proxyRes.headers['accept-ranges']) {
          responseHeaders['accept-ranges'] = proxyRes.headers['accept-ranges'];
        } else {
          responseHeaders['accept-ranges'] = 'bytes';
        }
        if (proxyRes.headers['cache-control']) {
          responseHeaders['cache-control'] = proxyRes.headers['cache-control'];
        } else {
          responseHeaders['cache-control'] = 'no-store';
        }
        
        responseHeaders['access-control-allow-origin'] = '*';
        responseHeaders['access-control-allow-headers'] = 'Range, Content-Type';
        responseHeaders['access-control-expose-headers'] = 'Content-Range, Content-Length, Accept-Ranges';

        if (res.headersSent) {
          console.log(`[STREAM DEBUG] Headers already sent, aborting writeHead for videoId: ${videoId}`);
          return;
        }
        res.writeHead(proxyRes.statusCode, responseHeaders);
        proxyRes.pipe(res);
      });

      proxyReq.on("error", (err) => {
        req.streamTrace.push(`[TRACE] Direct yt-dlp failed: proxy error ${err.message}`);
        console.error(`[STREAM ERROR STACK] Proxy request error for videoId: ${videoId}:`);
        console.error(JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
        fallbackToYtDlp();
      });

      res.on("close", () => {
        proxyReq.destroy();
      });

      proxyReq.end();

    } catch (err) {
      req.streamTrace.push(`[TRACE] Direct yt-dlp extraction failed: ${err.message || String(err)}`);
      console.error(`[STREAM ERROR STACK] Failed to fetch direct stream URL for videoId: ${videoId}:`);
      console.error(err);
      
      const errMsg = err?.message || '';
      const errStr = typeof err === 'string' ? err : (JSON.stringify(err) || '');
      if (errMsg.includes("confirm you're not a bot") || errStr.includes("confirm you're not a bot")) {
        console.warn("[STREAM] YouTube bot check detected on direct URL extraction. Immediately switching to play-dl/youtubei fallback...");
        YoutubeService.fallbackToYoutubeiOrPlayDl(videoId, req, res);
      } else {
        fallbackToYtDlp();
      }
    }
  }

  static async getSongDetails(videoId) {
    if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      throw new Error("Invalid Video ID");
    }
     const command = `${YTDLP_EXEC} --dump-json --no-update "https://www.youtube.com/watch?v=${videoId}"`;
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
