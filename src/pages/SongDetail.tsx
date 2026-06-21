import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Play, Pause, Heart, Loader2, ArrowLeft,
  Share2, Shuffle, Repeat, Repeat1, SkipBack, SkipForward,
  UserPlus, Info, Check, X, Copy
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePlayerStore, type Song } from "../store/usePlayerStore";
import { SyncedLyrics } from "../components/SyncedLyrics";
import { useLikedSongs } from "../hooks/useLikedSongs";
import { SongContextMenu } from "../components/SongContextMenu";
import { InteractiveSeekBar } from "../components/InteractiveSeekBar";
import { extractDominantColor, applyAmbientColor } from "../utils/colorExtractor";
import toast from "react-hot-toast";

// Helper to generate reliable artist avatars
const artistAvatar = (name: string, bg = "1a1a2e") =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=256&background=${bg}&color=fff&bold=true&format=svg`;

const ARTIST_SEEDS = [
  { name: "Arijit Singh", genre: "Bollywood", language: "Hindi", image: artistAvatar("Arijit Singh", "6c1a4d") },
  { name: "Karan Aujla", genre: "Punjabi", language: "Punjabi", image: artistAvatar("Karan Aujla", "1a4d6c") },
  { name: "AP Dhillon", genre: "Punjabi", language: "Punjabi", image: artistAvatar("AP Dhillon", "1a6c4d") },
  { name: "Shubh", genre: "Punjabi", language: "Punjabi", image: artistAvatar("Shubh", "4d1a6c") },
  { name: "Sidhu Moosewala", genre: "Punjabi", language: "Punjabi", image: artistAvatar("Sidhu Moosewala", "6c4d1a") },
  { name: "Diljit Dosanjh", genre: "Punjabi", language: "Punjabi", image: artistAvatar("Diljit Dosanjh", "1a6c6c") },
  { name: "Talha Anjum", genre: "Urdu Rap", language: "Urdu", image: artistAvatar("Talha Anjum", "6c1a1a") },
  { name: "The Weeknd", genre: "Pop", language: "English", image: artistAvatar("The Weeknd", "2d1a4d") },
  { name: "Drake", genre: "Hip-Hop", language: "English", image: artistAvatar("Drake", "1a2d4d") },
  { name: "Travis Scott", genre: "Hip-Hop", language: "English", image: artistAvatar("Travis Scott", "4d2d1a") }
];

export const SongDetail: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dominantColor, setDominantColor] = useState<string>("rgba(20,20,20,0.8)");
  const [isFollowing, setIsFollowing] = useState(false);
  const [isAlbumSaved, setIsAlbumSaved] = useState(false);

  // Load initial following and album saved states
  useEffect(() => {
    if (!song) return;
    const cleanArtist = song.artist.replace(/\s*-Topic/gi, "").trim();
    const prefArtists = localStorage.getItem("musick-pref-artists")?.split(",") || [];
    const followedArtists = JSON.parse(localStorage.getItem("musick-followed-artists") || "[]");
    const isPref = prefArtists.some((name: string) => name.toLowerCase() === cleanArtist.toLowerCase());
    const isFollowed = followedArtists.some((a: any) => a.artist_name.toLowerCase() === cleanArtist.toLowerCase());
    setIsFollowing(isPref || isFollowed);

    const albumName = song.title.includes("Lofi") || song.title.includes("Chill") ? "Lofi Chill Album" : `${song.title} - Single`;
    const savedAlbums = JSON.parse(localStorage.getItem("musick-saved-albums") || "[]");
    const isSaved = savedAlbums.some((a: any) => a.album_name.toLowerCase() === albumName.toLowerCase());
    setIsAlbumSaved(isSaved);
  }, [song]);

  const handleFollowToggle = () => {
    if (!song) return;
    const cleanArtist = song.artist.replace(/\s*-Topic/gi, "").trim();
    const followedArtists = JSON.parse(localStorage.getItem("musick-followed-artists") || "[]");
    
    let updated;
    if (isFollowing) {
      updated = followedArtists.filter((a: any) => a.artist_name.toLowerCase() !== cleanArtist.toLowerCase());
      // Also remove from pref-artists to be consistent
      const prefArtists = localStorage.getItem("musick-pref-artists")?.split(",") || [];
      const updatedPref = prefArtists.filter((name: string) => name.toLowerCase() !== cleanArtist.toLowerCase());
      localStorage.setItem("musick-pref-artists", updatedPref.join(","));
      toast.success(`Unfollowed ${cleanArtist}`);
    } else {
      updated = [...followedArtists, {
        id: cleanArtist,
        artist_name: cleanArtist,
        image_url: meta.artistImage,
        created_at: new Date().toISOString()
      }];
      toast.success(`Followed ${cleanArtist}`);
    }
    
    localStorage.setItem("musick-followed-artists", JSON.stringify(updated));
    setIsFollowing(!isFollowing);
  };

  const handleAlbumSaveToggle = () => {
    if (!song) return;
    const albumName = song.title.includes("Lofi") || song.title.includes("Chill") ? "Lofi Chill Album" : `${song.title} - Single`;
    const savedAlbums = JSON.parse(localStorage.getItem("musick-saved-albums") || "[]");
    
    let updated;
    if (isAlbumSaved) {
      updated = savedAlbums.filter((a: any) => a.album_name.toLowerCase() !== albumName.toLowerCase());
      toast.success(`Removed ${albumName} from Saved Albums`);
    } else {
      updated = [...savedAlbums, {
        id: albumName,
        album_name: albumName,
        artist_name: meta.artistName,
        cover_image: song.thumbnail,
        created_at: new Date().toISOString()
      }];
      toast.success(`Saved ${albumName} to Albums`);
    }
    
    localStorage.setItem("musick-saved-albums", JSON.stringify(updated));
    setIsAlbumSaved(!isAlbumSaved);
  };

  // Related songs state
  const [relatedSongs, setRelatedSongs] = useState<Song[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  const {
    currentSong,
    isPlaying,
    setCurrentSong,
    setQueue,
    togglePlay,
    playNext,
    playPrevious,
    isShuffle,
    toggleShuffle,
    repeatMode,
    toggleRepeat
  } = usePlayerStore();

  const { isLiked, toggleLike } = useLikedSongs();

  // Load song details
  useEffect(() => {
    if (!videoId) return;
    const fetchSongDetails = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/song/${videoId}`);
        if (!res.ok) throw new Error("Failed to fetch song details");
        const data = await res.json();
        setSong(data);
      } catch {
        setError("Failed to load song details.");
      } finally {
        setLoading(false);
      }
    };
    fetchSongDetails();
  }, [videoId]);

  // Extract dominant color from artwork
  useEffect(() => {
    if (!song?.thumbnail) return;
    extractDominantColor(song.thumbnail).then((rgb) => {
      applyAmbientColor(rgb);
      setDominantColor(`rgba(${rgb.r},${rgb.g},${rgb.b},0.35)`);
    });
  }, [song?.thumbnail]);

  // Fetch related songs by the same artist dynamically!
  useEffect(() => {
    if (!song?.artist) return;
    const fetchRelated = async () => {
      setRelatedLoading(true);
      try {
        const cleanArtist = song.artist.replace(/\s*-Topic/gi, "").trim();
        const res = await fetch(`/api/search?q=${encodeURIComponent(cleanArtist)}`);
        if (res.ok) {
          const data = await res.json();
          // Map backend search results (songs is an array now because of our updates!)
          const songsList = data.songs || data || [];
          setRelatedSongs(songsList.filter((s: Song) => s.videoId !== song.videoId).slice(0, 6));
        }
      } catch (err) {
        console.error("Failed to load related songs:", err);
      } finally {
        setRelatedLoading(false);
      }
    };
    fetchRelated();
  }, [song?.artist, song?.videoId]);

  const handlePlaySong = (targetSong: Song) => {
    if (currentSong?.videoId === targetSong.videoId) {
      togglePlay();
    } else {
      setCurrentSong(targetSong);
      // Set remaining related songs as queue
      const idx = relatedSongs.findIndex(s => s.videoId === targetSong.videoId);
      if (idx !== -1) {
        setQueue(relatedSongs.slice(idx + 1));
      }
    }
  };

  const handlePlayMainSong = () => {
    if (!song) return;
    if (currentSong?.videoId === song.videoId) {
      togglePlay();
    } else {
      setCurrentSong(song);
      setQueue(relatedSongs);
    }
  };

  const [showShareMenu, setShowShareMenu] = useState(false);

  const handleShare = async () => {
    if (!song) return;
    const url = window.location.href;
    const shareData = {
      title: `${song.title} — ${song.artist}`,
      text: `🎵 Listen to ${song.title} by ${song.artist} on Musick`,
      url,
    };

    // Try Web Share API first (Android native share sheet, nearby share, etc.)
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err: any) {
        if (err.name === "AbortError") return; // user dismissed — no toast needed
      }
    }

    // Fallback: show share menu
    setShowShareMenu(true);
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Link copied!");
      setShowShareMenu(false);
    });
  };

  const shareLinks = song ? [
    {
      label: "WhatsApp",
      icon: "💬",
      url: `https://wa.me/?text=${encodeURIComponent(`🎵 ${song.title} by ${song.artist}\n${window.location.href}`)}`,
    },
    {
      label: "Telegram",
      icon: "✈️",
      url: `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`🎵 ${song.title} by ${song.artist}`)}`,
    },
    {
      label: "Twitter/X",
      icon: "𝕏",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`🎵 ${song.title} by ${song.artist}`)}&url=${encodeURIComponent(window.location.href)}`,
    },
    {
      label: "Discord",
      icon: "🎮",
      url: `https://discord.com/channels/@me`,
      onClick: handleCopyLink,
    },
  ] : [];

  const isCurrentSong = currentSong?.videoId === song?.videoId;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] gap-3 text-white/40">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
        <span className="text-sm">Loading song details...</span>
      </div>
    );
  }

  if (error || !song) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="text-sm font-medium text-red-400/80">{error || "Song not found"}</div>
        <button onClick={() => navigate("/")} className="text-sm text-accent underline">
          Go Home
        </button>
      </div>
    );
  }

  // Generate deterministic premium metadata
  const meta = (() => {
    const seed = ARTIST_SEEDS.find(a => a.name.toLowerCase() === song.artist.toLowerCase() || song.artist.toLowerCase().includes(a.name.toLowerCase()));
    const artistName = seed ? seed.name : song.artist.replace(/\s*-Topic/gi, "").trim();
    const genre = seed ? seed.genre : (song.title.toLowerCase().includes("lofi") ? "Lofi" : "Bollywood");
    const language = seed ? seed.language : "Hindi";
    const artistImage = seed ? seed.image : "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop";
    
    const hash = song.title.length + song.artist.length;
    const views = ((hash * 123456) % 90000000 + 1000000).toLocaleString();
    const year = 2020 + (hash % 7);
    
    const mood = song.title.toLowerCase().includes("lofi") || song.title.toLowerCase().includes("chill") ? "Relaxed / Chill" : "Energetic / Happy";
    const theme = song.title.toLowerCase().includes("love") || song.title.toLowerCase().includes("pyar") ? "Romantic" : "Vibe / Life";

    return {
      artistName,
      genre,
      language,
      artistImage,
      views,
      year,
      mood,
      theme,
      followers: ((hash * 98765) % 8000000 + 200000).toLocaleString(),
      bio: `${artistName} is a prominent music creator known for delivering soul-stirring melodies and top-chart hits. With a unique fusion of modern rhythms and traditional vocals, they continue to define modern sound vibes.`,
      dna: [
        { name: artistName, role: "Main Artist", image: artistImage },
        { name: hash % 2 === 0 ? "Pritam" : "Ikky", role: "Composer", image: "https://i.scdn.co/image/ab6761610000e5eb4e5e783457a419b4e542ecb9" },
        { name: hash % 3 === 0 ? "Amitabh Bhattacharya" : "Jaani", role: "Lyricist", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop" },
        { name: hash % 4 === 0 ? "Karan Aujla" : "Mithoon", role: "Producer", image: "https://i.scdn.co/image/ab6761610000e5eb3dbfbf27fb0cf0e4d2bfb267" }
      ],
      credits: [
        { name: artistName, role: "Singer / Performer", image: artistImage },
        { name: hash % 2 === 0 ? "Pritam" : "Ikky", role: "Composer", image: "https://i.scdn.co/image/ab6761610000e5eb4e5e783457a419b4e542ecb9" },
        { name: hash % 3 === 0 ? "Amitabh Bhattacharya" : "Lyricist", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop" },
        { name: "Sony Music India", role: "Music Label", image: "https://yt3.ggpht.com/42o3XIW1j5zmzsFeZs3ND4QwaXXrnpK9vqftcEuEdbgNhPbltXRktcSmyJ12-gSRqKch93Ir=s88-c-k-c0x00ffffff-no-rj-mo" }
      ]
    };
  })();

  return (
    <div className="flex flex-col gap-10 md:gap-14 max-w-5xl pb-16 relative">
      {/* ── Share Menu Modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {showShareMenu && (
          <>
            <motion.div
              className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShareMenu(false)}
            />
            <motion.div
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[201] w-[90vw] max-w-sm rounded-3xl p-5 flex flex-col gap-4"
              style={{ background: "rgba(18,18,18,0.98)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 24px 80px rgba(0,0,0,0.8)" }}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-base">Share</span>
                <button onClick={() => setShowShareMenu(false)} className="w-7 h-7 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {shareLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.onClick ? undefined : link.url}
                    target={link.onClick ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    onClick={link.onClick}
                    className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all hover:bg-white/8 active:scale-95"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <span className="text-xl">{link.icon}</span>
                    <span className="text-sm font-semibold text-white/80">{link.label}</span>
                  </a>
                ))}
              </div>
              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-2.5 w-full py-3 rounded-2xl text-sm font-bold text-black transition-all active:scale-98"
                style={{ background: "var(--accent)" }}
              >
                <Copy className="w-4 h-4" />
                Copy Link
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Spotify style Blurred Cover Backdrop ───────────────────── */}
      <div className="absolute top-0 left-0 right-0 h-[600px] overflow-hidden pointer-events-none z-0 rounded-b-[40px]">
        <img
          src={song.thumbnail}
          alt={song.title}
          className="w-full h-full object-cover scale-150 blur-[80px] opacity-45"
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${dominantColor} 0%, rgba(5,5,5,0.92) 80%, #050505 100%)`,
          }}
        />
      </div>

      {/* ── Sticky/Top Header Section ─────────────────────────────────── */}
      <div className="relative z-10 flex items-center justify-between w-full">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold text-white/50 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </motion.button>

        <div className="hidden sm:flex flex-col items-center max-w-[50%]">
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-white/30">Playing From Search</span>
          <span className="text-sm font-bold text-white truncate max-w-full">{song.title}</span>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => toggleLike(song)}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 backdrop-blur-md text-white/60 hover:text-white transition-all"
            style={{ color: isLiked(song.videoId) ? "var(--accent)" : "" }}
          >
            <Heart className="w-5 h-5" fill={isLiked(song.videoId) ? "currentColor" : "none"} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleShare}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 backdrop-blur-md text-white/60 hover:text-white transition-all"
          >
            <Share2 className="w-5 h-5" />
          </motion.button>
          <SongContextMenu song={song} className="[&>button]:w-10 [&>button]:h-10 [&>button]:rounded-full [&>button]:bg-white/5 [&>button]:hover:bg-white/10 [&>button]:backdrop-blur-md" />
        </div>
      </div>

      {/* ── Main Hero Section (Large Art + Meta) ─────────────────────────── */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center mt-2">
        {/* Cover Art */}
        <div className="col-span-1 md:col-span-5 flex justify-center">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-3xl overflow-hidden shadow-2xl"
            style={{
              boxShadow: `0 24px 80px rgba(var(--ambient-r),var(--ambient-g),var(--ambient-b),0.35), 0 8px 32px rgba(0,0,0,0.5)`,
            }}
          >
            <img src={song.thumbnail} alt={song.title} className="w-full h-full object-cover select-none" />
          </motion.div>
        </div>

        {/* Text Info & Controls */}
        <div className="col-span-1 md:col-span-7 flex flex-col gap-5 text-left">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-accent font-inter">
                {meta.genre}
              </span>
              <span className="text-white/20">•</span>
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-white/40">
                {meta.language}
              </span>
            </div>
            <h1
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight font-outfit"
            >
              {song.title}
            </h1>
            <div className="flex items-center gap-2.5 text-sm text-white/50 font-medium">
              <span className="text-white/80 hover:text-white transition-colors cursor-pointer font-semibold">
                {meta.artistName}
              </span>
              <span>•</span>
              <span>Single</span>
              <span>•</span>
              <span>{meta.year}</span>
              <span>•</span>
              <span className="tabular-nums">{meta.views} Views</span>
            </div>
          </div>

          {/* Interactive Seek Bar */}
          <div className="w-full mt-2">
            <InteractiveSeekBar showLabels={true} className="w-full" />
          </div>

          {/* Player Controls (Shuffle, Back, Play/Pause, Next, Repeat) */}
          <div className="flex items-center gap-6 mt-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleShuffle}
              className="text-white/40 hover:text-white transition-colors"
              style={{ color: isShuffle ? "var(--accent)" : "" }}
            >
              <Shuffle className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={playPrevious}
              className="text-white/70 hover:text-white transition-colors"
            >
              <SkipBack className="w-6 h-6 fill-current" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={handlePlayMainSong}
              className="w-16 h-16 rounded-full flex items-center justify-center text-black font-bold"
              style={{
                background: "var(--accent)",
                boxShadow: "0 0 24px var(--accent-glow), 0 4px 16px rgba(0,0,0,0.3)",
              }}
            >
              {isCurrentSong && isPlaying ? (
                <Pause className="w-7 h-7 fill-current" />
              ) : (
                <Play className="w-7 h-7 fill-current ml-0.5" />
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={playNext}
              className="text-white/70 hover:text-white transition-colors"
            >
              <SkipForward className="w-6 h-6 fill-current" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleRepeat}
              className="text-white/40 hover:text-white transition-colors"
              style={{ color: repeatMode !== "none" ? "var(--accent)" : "" }}
            >
              {repeatMode === "one" ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* ── Spotify Lyrics Section ─────────────────────────────────── */}
      <div className="relative z-10 w-full">
        <SyncedLyrics song={song} isCurrentSong={isCurrentSong} />
      </div>

      {/* ── About the Song & Song DNA Section ──────────────────────────── */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        {/* About Song */}
        <div
          className="p-6 md:p-8 rounded-3xl flex flex-col gap-4 text-left"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-accent" />
            <h3 className="text-base font-bold text-white tracking-wide uppercase">About This Song</h3>
          </div>
          <p className="text-sm text-white/50 leading-relaxed">
            {meta.bio}
          </p>
          <div className="grid grid-cols-2 gap-4 mt-2 border-t border-white/5 pt-4">
            <div>
              <span className="block text-[10px] uppercase text-white/20 font-bold tracking-widest">Theme</span>
              <span className="text-sm font-semibold text-white/80">{meta.theme}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase text-white/20 font-bold tracking-widest">Mood</span>
              <span className="text-sm font-semibold text-white/80">{meta.mood}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase text-white/20 font-bold tracking-widest">Genre</span>
              <span className="text-sm font-semibold text-white/80">{meta.genre}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase text-white/20 font-bold tracking-widest">Release Year</span>
              <span className="text-sm font-semibold text-white/80">{meta.year}</span>
            </div>
          </div>
        </div>

        {/* Song DNA */}
        <div
          className="p-6 md:p-8 rounded-3xl flex flex-col gap-4 text-left"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <h3 className="text-base font-bold text-white tracking-wide uppercase">Song DNA</h3>
          <div className="grid grid-cols-2 gap-5 mt-2">
            {meta.dna.map((person, index) => (
              <div key={index} className="flex items-center gap-3.5 group">
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-white/10">
                  <img src={person.image} alt={person.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-white truncate leading-tight group-hover:text-accent transition-colors">
                    {person.name}
                  </span>
                  <span className="text-[10px] uppercase text-white/30 font-semibold tracking-wider mt-0.5">
                    {person.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── About the Artist Section ─────────────────────────────────── */}
      <div className="relative z-10 w-full">
        <div
          className="rounded-3xl overflow-hidden text-left relative"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          {/* Artist cover background */}
          <div className="h-44 md:h-52 w-full overflow-hidden relative">
            <img src={meta.artistImage} alt={meta.artistName} className="w-full h-full object-cover blur-sm brightness-50" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] to-transparent" />
            <div className="absolute bottom-4 left-6 md:left-8 flex items-center gap-4">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-white/20 flex-shrink-0">
                <img src={meta.artistImage} alt={meta.artistName} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col gap-0.5">
                <h3 className="text-xl md:text-3xl font-extrabold text-white font-outfit">{meta.artistName}</h3>
                <span className="text-xs text-white/50">{meta.followers} Followers</span>
              </div>
            </div>
          </div>

          {/* Description & Action */}
          <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <p className="text-sm text-white/40 max-w-xl leading-relaxed">
              {meta.bio}
            </p>
            <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleAlbumSaveToggle}
                className="flex items-center gap-2.5 px-6 py-2.5 rounded-full text-xs font-bold text-white font-inter"
                style={{
                  background: isAlbumSaved ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.15)"
                }}
              >
                {isAlbumSaved ? "Album Saved" : "Save Album"}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleFollowToggle}
                className="flex items-center gap-2.5 px-6 py-2.5 rounded-full text-xs font-bold text-black font-inter"
                style={{
                  background: isFollowing ? "rgba(255,255,255,0.1)" : "var(--accent)",
                  color: isFollowing ? "white" : "black",
                  border: isFollowing ? "1px solid rgba(255,255,255,0.2)" : "none"
                }}
              >
                {isFollowing ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    Follow
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Related Songs (More Like This) Section ──────────────────────────── */}
      {relatedSongs.length > 0 && (
        <div className="relative z-10 w-full text-left">
          <h3 className="text-base font-bold text-white tracking-wide uppercase mb-5">
            More Like This
          </h3>
          {relatedLoading ? (
            <div className="flex items-center gap-2 text-white/40 py-4 text-sm">
              <Loader2 className="w-4 h-4 animate-spin text-accent" />
              <span>Fetching similar tracks...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 md:gap-5">
              {relatedSongs.map((s) => (
                <motion.div
                  key={s.videoId}
                  whileHover={{ y: -4 }}
                  onClick={() => handlePlaySong(s)}
                  className="rounded-2xl p-3 flex flex-col gap-2 cursor-pointer group transition-all"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                >
                  <div className="aspect-square rounded-xl overflow-hidden relative">
                    <img src={s.thumbnail} alt={s.title} className="w-full h-full object-cover" />
                    {/* Hover play icon */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="w-8 h-8 text-white fill-current" />
                    </div>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-white truncate leading-tight group-hover:text-accent transition-colors">
                      {s.title}
                    </span>
                    <span className="text-[10px] text-white/30 truncate mt-0.5">{s.artist}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Credits Section ────────────────────────────────────────── */}
      <div className="relative z-10 w-full text-left">
        <h3 className="text-base font-bold text-white tracking-wide uppercase mb-5">Credits</h3>
        <div
          className="rounded-3xl p-6 md:p-8 flex flex-col gap-4"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {meta.credits.map((c, index) => (
              <div key={index} className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
                    <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-sm font-semibold text-white">{c.name}</span>
                </div>
                <span className="text-xs text-white/40 font-medium">{c.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
