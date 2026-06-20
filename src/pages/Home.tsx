import React, { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "../components/GlassCard";
import { CompactTrackRow } from "../components/CompactTrackRow";
import { useRecentlyPlayed } from "../hooks/useRecentlyPlayed";
import { useLikedSongs } from "../hooks/useLikedSongs";
import { usePlaylists } from "../hooks/usePlaylists";
import { usePlayerStore, type Song } from "../store/usePlayerStore";
import { useAuth } from "../hooks/useAuth";
import { Play, Sparkles, LogIn, TrendingUp } from "lucide-react";

/* ── Animated waveform visualizer (hero) ─────────────────── */
const HeroWaveform: React.FC = () => (
  <div className="flex items-end gap-[3px]" style={{ height: 56 }}>
    {Array.from({ length: 24 }).map((_, i) => (
      <div
        key={i}
        className="waveform-bar rounded-sm"
        style={{
          width: 3,
          height: `${30 + Math.abs(Math.sin(i * 0.7)) * 70}%`,
          opacity: 0.6 + Math.abs(Math.sin(i * 0.5)) * 0.4,
        }}
      />
    ))}
  </div>
);

/* ── Section heading ─────────────────────────────────────── */
const SectionHeader: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
  <div className="flex items-center gap-2 mb-5">
    <span style={{ color: "var(--accent)" }}>{icon}</span>
    <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">{title}</h2>
  </div>
);

/* ── Mood pills ──────────────────────────────────────────── */
const MOODS = ["Focus", "Energize", "Chill", "Sleep", "Happy", "Workout", "Late Night"];

/* ── Card entrance animation ─────────────────────────────── */
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  }),
};

/* ── Home page ───────────────────────────────────────────── */
export const Home: React.FC = () => {
  const { user, loginWithGoogle } = useAuth();
  const { recentlyPlayed } = useRecentlyPlayed();
  const { likedSongs } = useLikedSongs();
  const { playlists } = usePlaylists();
  const { setCurrentSong, setQueue, togglePlay, currentSong } = usePlayerStore();
  const [activeMood, setActiveMood] = useState<string | null>(null);

  const handlePlaySong = (song: Song, queue?: Song[]) => {
    if (currentSong?.videoId === song.videoId) {
      togglePlay();
    } else {
      setCurrentSong(song);
      if (queue) setQueue(queue);
    }
  };

  const likedList = Object.values(likedSongs);

  // Time-based greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex flex-col gap-10 md:gap-12 pb-8">

      {/* ── Hero Section ───────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative rounded-3xl overflow-hidden p-7 md:p-10"
        style={{
          background: "linear-gradient(135deg, rgba(var(--accent-rgb),0.10) 0%, rgba(255,255,255,0.02) 60%, rgba(0,0,0,0) 100%)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Ambient blob */}
        <div
          className="absolute -top-12 -right-12 w-64 h-64 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(var(--accent-rgb),0.15) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          {/* Text */}
          <div className="flex flex-col gap-4">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide w-fit"
              style={{
                background: "rgba(var(--accent-rgb),0.10)",
                color: "var(--accent)",
                border: "1px solid rgba(var(--accent-rgb),0.20)",
              }}
            >
              <Sparkles className="w-3 h-3" />
              Premium Sound Experience
            </div>

            <div>
              <h1
                className="font-bold text-white leading-tight"
                style={{ fontSize: "clamp(26px, 4vw, 42px)", fontFamily: "'Outfit', sans-serif" }}
              >
                {greeting},
              </h1>
              <h1
                className="font-bold leading-tight"
                style={{
                  fontSize: "clamp(26px, 4vw, 42px)",
                  fontFamily: "'Outfit', sans-serif",
                  color: "var(--accent)",
                }}
              >
                What will you play?
              </h1>
            </div>

            <p className="text-sm text-white/40 max-w-xs">
              Discover, stream, and feel every note.
            </p>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                const first = recentlyPlayed[0] || likedList[0];
                if (first) handlePlaySong(first, recentlyPlayed.slice(1));
              }}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-sm font-bold text-black transition-all w-fit"
              style={{
                background: "var(--accent)",
                boxShadow: "0 0 24px var(--accent-glow)",
              }}
            >
              <Play className="w-4 h-4 fill-current" />
              Play Trending
            </motion.button>
          </div>

          {/* Waveform visualizer */}
          <div
            className="flex-shrink-0 p-5 rounded-2xl hidden md:flex items-center justify-center"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.05)",
              minWidth: 160,
            }}
          >
            <HeroWaveform />
          </div>
        </div>
      </motion.section>

      {/* ── Mood Pills ─────────────────────────────────── */}
      <section>
        <SectionHeader icon={<Sparkles className="w-4 h-4" />} title="Pick a Mood" />
        <div className="flex flex-wrap gap-2.5">
          {MOODS.map((mood) => {
            const isActive = activeMood === mood;
            return (
              <motion.button
                key={mood}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setActiveMood(isActive ? null : mood)}
                className="px-5 py-2 rounded-full text-sm font-medium transition-all"
                style={
                  isActive
                    ? {
                        background: "var(--accent)",
                        color: "#000",
                        boxShadow: "0 0 16px var(--accent-glow)",
                      }
                    : {
                        background: "rgba(255,255,255,0.05)",
                        color: "rgba(255,255,255,0.65)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }
                }
              >
                {mood}
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* ── Not signed in ──────────────────────────────── */}
      {!user && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl p-8 md:p-10 flex flex-col items-center text-center gap-5"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(var(--accent-rgb),0.10)" }}
          >
            <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="22" stroke="var(--accent)" strokeWidth="1.5" strokeOpacity="0.4"/>
              <circle cx="24" cy="24" r="4" fill="var(--accent)"/>
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Unlock Your Music</h2>
            <p className="text-sm text-white/40 max-w-xs">
              Sign in to access your playlists, liked songs, and listening history.
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
      )}

      {/* ── Signed in content ──────────────────────────── */}
      {user && (
        <>
          {/* Continue Listening */}
          {recentlyPlayed.length > 0 && (
            <section>
              <SectionHeader icon={<TrendingUp className="w-4 h-4" />} title="Continue Listening" />
              <div className="flex flex-col gap-1">
                {recentlyPlayed.slice(0, 6).map((song, i) => (
                  <motion.div
                    key={song.videoId}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                  >
                    <CompactTrackRow
                      song={song}
                      index={i}
                      onClick={() => handlePlaySong(song, recentlyPlayed.slice(i + 1))}
                    />
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Liked Songs */}
          {likedList.length > 0 && (
            <section>
              <SectionHeader
                icon={
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                }
                title="Liked Songs"
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
                {likedList.slice(0, 10).map((song, i) => (
                  <motion.div
                    key={song.videoId}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                  >
                    <GlassCard
                      title={song.title}
                      subtitle={song.artist}
                      imageUrl={song.thumbnail}
                      song={song}
                      onClick={() => handlePlaySong(song, likedList.slice(i + 1))}
                    />
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Playlists */}
          {playlists.length > 0 && (
            <section>
              <SectionHeader
                icon={<svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>}
                title="Your Playlists"
              />
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

          {/* Empty state */}
          {recentlyPlayed.length === 0 && likedList.length === 0 && playlists.length === 0 && (
            <div
              className="rounded-3xl p-10 text-center"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <p className="text-white/30 text-sm">
                Search for a song to start your journey →
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
