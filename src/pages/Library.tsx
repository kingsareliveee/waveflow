import React from "react";
import { motion } from "framer-motion";
import { usePlaylists } from "../hooks/usePlaylists";
import { useLikedSongs } from "../hooks/useLikedSongs";
import { useAuth } from "../hooks/useAuth";
import { GlassCard } from "../components/GlassCard";
import { usePlayerStore } from "../store/usePlayerStore";
import { Heart, Play, Music, Disc, Mic2, TrendingUp, ListMusic, LogIn } from "lucide-react";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  }),
};

export const Library: React.FC = () => {
  const { user, loginWithGoogle } = useAuth();
  const { playlists } = usePlaylists();
  const { likedSongs } = useLikedSongs();
  const { setCurrentSong, setQueue } = usePlayerStore();

  const likedList = Object.values(likedSongs);
  const likedCount = likedList.length;
  const playlistCount = playlists.length;

  const libraryItems = [
    { icon: Music, label: "Liked Songs", count: `${likedCount} songs`, color: "#E89CB0" },
    { icon: TrendingUp, label: "Top Tracks", count: "50 songs", color: "#5FA8FF" },
    { icon: ListMusic, label: "Playlists", count: `${playlistCount} playlists`, color: "#8BCFC6" },
    { icon: Disc, label: "Albums", count: "0 albums", color: "#E4C16F" },
    { icon: Mic2, label: "Artists", count: "0 artists", color: "#E89CB0" },
  ];

  if (!user) {
    return (
      <div className="flex flex-col gap-8 pb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center text-center gap-6 py-16"
        >
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(var(--accent-rgb),0.08)", border: "1px solid rgba(var(--accent-rgb),0.15)" }}
          >
            <Music className="w-9 h-9" style={{ color: "var(--accent)" }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Your Music Library</h1>
            <p className="text-sm text-white/40 max-w-xs">
              Sign in to access your playlists, liked songs, albums, and artists.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={loginWithGoogle}
            className="flex items-center gap-2.5 px-7 py-3 rounded-full text-sm font-bold text-black"
            style={{ background: "var(--accent)" }}
          >
            <LogIn className="w-4 h-4" />
            Sign in with Google
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 pb-6">

      {/* ── Header ─────────────────────────────────────── */}
      <motion.h1
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-white tracking-tight md:hidden"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        Library
      </motion.h1>

      {/* ── Liked Songs Hero ───────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative rounded-3xl p-7 md:p-8 overflow-hidden cursor-pointer group"
        style={{
          background: "linear-gradient(135deg, rgba(232,156,176,0.18) 0%, rgba(95,168,255,0.10) 50%, rgba(255,255,255,0.02) 100%)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
        onClick={() => {
          const first = likedList[0];
          if (first) {
            setCurrentSong(first);
            setQueue(likedList.slice(1));
          }
        }}
      >
        {/* Background blob */}
        <div
          className="absolute -top-10 -right-10 w-56 h-56 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(232,156,176,0.20) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(232,156,176,0.15)" }}
            >
              <Heart className="w-7 h-7" style={{ color: "#E89CB0" }} fill="currentColor" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white">Liked Songs</h2>
              <p className="text-sm text-white/40 mt-0.5">{likedCount} songs</p>
            </div>
          </div>

          {likedCount > 0 && (
            <motion.div
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              className="w-12 h-12 rounded-full flex items-center justify-center text-black opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: "var(--accent)" }}
            >
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* ── Playlists ──────────────────────────────────── */}
      {playlists.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-5">
            <ListMusic className="w-4 h-4" style={{ color: "var(--accent)" }} />
            <h2 className="text-lg font-bold text-white">Your Playlists</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
            {playlists.map((playlist, i) => (
              <motion.div
                key={playlist.id}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
              >
                <GlassCard
                  title={playlist.name}
                  subtitle={`${playlist.songs?.length || 0} songs`}
                  imageUrl={
                    playlist.songs && playlist.songs.length > 0
                      ? playlist.songs[0].thumbnail
                      : "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=300&auto=format&fit=crop"
                  }
                />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ── Library grid ───────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-5">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="var(--accent)" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
          <h2 className="text-lg font-bold text-white">Your Collection</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {libraryItems.map((item, i) => (
            <motion.div
              key={item.label}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer group transition-all"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.04)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.02)")
              }
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${item.color}15` }}
              >
                <item.icon className="w-5 h-5" style={{ color: item.color }} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-white/80 group-hover:text-white transition-colors truncate text-sm">
                  {item.label}
                </span>
                <span className="text-xs text-white/30">{item.count}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};
