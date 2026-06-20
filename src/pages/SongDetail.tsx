import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Play, Pause, Heart, Clock, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { usePlayerStore, type Song } from "../store/usePlayerStore";
import { SyncedLyrics } from "../components/SyncedLyrics";
import { useLikedSongs } from "../hooks/useLikedSongs";
import { SongContextMenu } from "../components/SongContextMenu";
import { cn } from "../utils/cn";
import { extractDominantColor, applyAmbientColor } from "../utils/colorExtractor";

export const SongDetail: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dominantColor, setDominantColor] = useState<string>("rgba(var(--accent-rgb),0.15)");

  const { currentSong, isPlaying, setCurrentSong, togglePlay } = usePlayerStore();
  const { isLiked, toggleLike } = useLikedSongs();

  useEffect(() => {
    console.log("[DEBUG] SongDetail mounted");
    return () => console.log("[DEBUG] SongDetail unmounted");
  }, []);

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
      setDominantColor(`rgba(${rgb.r},${rgb.g},${rgb.b},0.18)`);
    });
  }, [song?.thumbnail]);

  const handlePlayMainSong = () => {
    if (!song) return;
    if (currentSong?.videoId === song.videoId) {
      togglePlay();
    } else {
      setCurrentSong(song);
    }
  };

  const isCurrentSong = currentSong?.videoId === song?.videoId;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] gap-3 text-white/40">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  if (error || !song) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="text-sm font-medium text-red-400/80">{error || "Song not found"}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 max-w-5xl pb-8">

      {/* ── Gradient header backdrop ───────────────────── */}
      <div
        className="absolute top-0 left-0 right-0 h-80 pointer-events-none z-0"
        style={{
          background: `linear-gradient(180deg, ${dominantColor} 0%, transparent 100%)`,
          transition: "background 0.8s ease",
        }}
      />

      {/* ── Hero ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col md:flex-row gap-8 items-end"
      >
        {/* Artwork */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden flex-shrink-0"
          style={{
            boxShadow: `0 16px 48px rgba(var(--ambient-r),var(--ambient-g),var(--ambient-b),0.40), 0 8px 24px rgba(0,0,0,0.6)`,
          }}
        >
          <img
            src={song.thumbnail}
            alt={song.title}
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Info */}
        <div className="flex flex-col gap-2 relative z-10">
          <span
            className="text-xs font-semibold uppercase tracking-[0.15em] text-white/30"
          >
            Single
          </span>
          <h1
            className="font-bold text-white tracking-tight leading-tight"
            style={{
              fontSize: "clamp(24px, 4vw, 48px)",
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            {song.title}
          </h1>
          <div className="flex items-center gap-2 text-sm text-white/40 flex-wrap">
            <span className="font-semibold text-white/70 hover:text-white cursor-pointer transition-colors">
              {song.artist}
            </span>
            <span>•</span>
            <span>YouTube Audio</span>
            <span>•</span>
            <span>{song.duration}</span>
          </div>
        </div>
      </motion.div>

      {/* ── Action bar ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="relative z-10 flex items-center gap-5"
      >
        {/* Play */}
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={handlePlayMainSong}
          className="w-14 h-14 rounded-full flex items-center justify-center text-black"
          style={{
            background: "var(--accent)",
            boxShadow: "0 0 24px var(--accent-glow), 0 4px 16px rgba(0,0,0,0.4)",
          }}
        >
          {isCurrentSong && isPlaying ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 fill-current ml-0.5" />
          )}
        </motion.button>

        {/* Like */}
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => song && toggleLike(song)}
          className="transition-colors"
          style={{
            color: isLiked(song.videoId) ? "var(--accent)" : "rgba(255,255,255,0.35)",
          }}
        >
          <Heart
            className="w-8 h-8"
            fill={isLiked(song.videoId) ? "currentColor" : "none"}
          />
        </motion.button>

        {/* Context menu */}
        {song && (
          <SongContextMenu
            song={song}
            className="[&>button]:w-10 [&>button]:h-10 [&>button>svg]:w-6 [&>button>svg]:h-6"
          />
        )}
      </motion.div>

      {/* ── Track table ───────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="relative z-10"
      >
        {/* Header */}
        <div
          className="grid gap-4 px-4 py-2 mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-white/30"
          style={{
            gridTemplateColumns: "20px 1fr 140px 80px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <span className="text-center">#</span>
          <span>Title</span>
          <span className="hidden md:block">Source</span>
          <div className="flex justify-end pr-8">
            <Clock className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Row */}
        <div
          onClick={handlePlayMainSong}
          className="grid gap-4 px-4 py-3.5 rounded-xl cursor-pointer group items-center transition-all"
          style={{ gridTemplateColumns: "20px 1fr 140px 80px" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.04)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <span className="text-center text-white/30 text-sm group-hover:hidden">1</span>
          <span className="text-center text-white hidden group-hover:flex items-center justify-center">
            {isCurrentSong && isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
          </span>

          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
              <img src={song.thumbnail} alt={song.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col min-w-0">
              <span
                className={cn(
                  "text-sm font-semibold truncate transition-colors",
                  isCurrentSong && isPlaying ? "" : "text-white"
                )}
                style={isCurrentSong && isPlaying ? { color: "var(--accent)" } : {}}
              >
                {song.title}
              </span>
              <span className="text-xs text-white/35 truncate">{song.artist}</span>
            </div>
          </div>

          <span className="hidden md:block text-sm text-white/30">YouTube</span>
          <span className="text-right text-sm text-white/30 pr-8">{song.duration}</span>
        </div>
      </motion.div>

      {/* ── Synced Lyrics ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="relative z-10"
      >
        <SyncedLyrics song={song} isCurrentSong={isCurrentSong} />
      </motion.div>
    </div>
  );
};
