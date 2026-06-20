import React, { useState, useEffect, useRef } from "react";
import { Search as SearchIcon, X, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "../components/GlassCard";
import { usePlayerStore, type Song } from "../store/usePlayerStore";

const GENRES = [
  "Lofi Hip Hop", "Synthwave", "Ambient", "Jazz Fusion",
  "Post-Rock", "Indie Folk", "Electronic", "Classical",
  "R&B", "Soul", "Drum & Bass", "Acoustic",
];

// Skeleton card
const SkeletonCard: React.FC<{ delay: number }> = ({ delay }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay, duration: 0.3 }}
    className="rounded-[20px] overflow-hidden"
    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
  >
    <div className="aspect-square skeleton" />
    <div className="p-4 flex flex-col gap-2">
      <div className="skeleton h-3 rounded-full w-3/4" />
      <div className="skeleton h-2.5 rounded-full w-1/2" />
    </div>
  </motion.div>
);

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  }),
};

const RECENT_KEY = "musick-recent-searches";
const MAX_RECENT = 6;

function loadRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]"); } catch { return []; }
}
function saveRecent(term: string, prev: string[]) {
  const next = [term, ...prev.filter((s) => s !== term)].slice(0, MAX_RECENT);
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch {}
  return next;
}

export const Search: React.FC = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>(loadRecent);
  const inputRef = useRef<HTMLInputElement>(null);

  const { setCurrentSong, setQueue } = usePlayerStore();

  // Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Search with debounce
  const performSearch = async (searchTerm: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
      if (!res.ok) throw new Error("Search request failed");
      const data = await res.json();
      setResults(data);
      setRecentSearches((prev) => saveRecent(searchTerm, prev));
    } catch {
      setError("Couldn't load results. Try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(() => performSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handlePlaySong = (song: Song, index: number) => {
    setCurrentSong(song);
    setQueue(results.slice(index + 1));
  };

  const handleRecentClick = (term: string) => {
    setQuery(term);
    inputRef.current?.focus();
  };

  const clearRecent = () => {
    setRecentSearches([]);
    try { localStorage.removeItem(RECENT_KEY); } catch {}
  };

  const hasQuery = query.trim().length > 0;

  return (
    <div className="flex flex-col gap-8 pb-6">

      {/* ── Search bar ──────────────────────────────────── */}
      <div className="relative">
        <SearchIcon
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
          style={{ color: "rgba(255,255,255,0.30)" }}
        />
        <input
          ref={inputRef}
          type="text"
          id="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search songs, artists, albums..."
          autoComplete="off"
          className="w-full pl-12 pr-20 py-4 text-white text-base rounded-2xl outline-none transition-all"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: query ? "1px solid rgba(var(--accent-rgb),0.40)" : "1px solid rgba(255,255,255,0.06)",
            boxShadow: query ? "0 0 0 3px rgba(var(--accent-rgb),0.08)" : "none",
            caretColor: "var(--accent)",
            fontFamily: "'Inter', sans-serif",
          }}
          onFocus={(e) => {
            e.currentTarget.style.border = "1px solid rgba(var(--accent-rgb),0.40)";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(var(--accent-rgb),0.08)";
          }}
          onBlur={(e) => {
            if (!query) {
              e.currentTarget.style.border = "1px solid rgba(255,255,255,0.06)";
              e.currentTarget.style.boxShadow = "none";
            }
          }}
        />

        {/* Ctrl+K hint / clear button */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {query ? (
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={() => setQuery("")}
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.60)" }}
            >
              <X className="w-3.5 h-3.5" />
            </motion.button>
          ) : (
            <kbd
              className="hidden sm:flex items-center px-2 py-1 rounded-md text-[10px] font-medium"
              style={{
                background: "rgba(255,255,255,0.05)",
                color: "rgba(255,255,255,0.25)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              Ctrl+K
            </kbd>
          )}
        </div>
      </div>

      {/* ── Empty state (no query) ─────────────────────── */}
      <AnimatePresence mode="wait">
        {!hasQuery && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-8"
          >
            {/* Recent searches */}
            {recentSearches.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4" style={{ color: "var(--accent)" }} />
                    Recent Searches
                  </h2>
                  <button
                    onClick={clearRecent}
                    className="text-xs text-white/30 hover:text-white transition-colors"
                  >
                    Clear
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term) => (
                    <motion.button
                      key={term}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleRecentClick(term)}
                      className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-white/60 hover:text-white transition-colors"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.07)",
                      }}
                    >
                      <Clock className="w-3.5 h-3.5 opacity-50" />
                      {term}
                    </motion.button>
                  ))}
                </div>
              </section>
            )}

            {/* Genre pills */}
            <section>
              <h2 className="text-base font-semibold text-white flex items-center gap-2 mb-4">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="var(--accent)" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
                Browse Genres
              </h2>
              <div className="flex flex-wrap gap-2">
                {GENRES.map((genre) => (
                  <motion.button
                    key={genre}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setQuery(genre)}
                    className="px-4 py-2 rounded-full text-sm font-medium text-white/60 hover:text-white transition-colors"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    {genre}
                  </motion.button>
                ))}
              </div>
            </section>
          </motion.div>
        )}

        {/* ── Loading state ──────────────────────────────── */}
        {hasQuery && loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <SkeletonCard key={i} delay={i * 0.04} />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Error ─────────────────────────────────────── */}
        {hasQuery && !loading && error && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm font-medium px-4 py-3 rounded-xl"
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.15)",
              color: "rgba(239,68,68,0.85)",
            }}
          >
            {error}
          </motion.div>
        )}

        {/* ── Results ───────────────────────────────────── */}
        {hasQuery && !loading && !error && results.length > 0 && (
          <motion.section
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="var(--accent)" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
              Search Results
              <span className="text-sm font-normal text-white/30 ml-1">({results.length})</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {results.map((song, idx) => (
                <motion.div
                  key={song.videoId}
                  custom={idx}
                  initial="hidden"
                  animate="visible"
                  variants={cardVariants}
                >
                  <GlassCard
                    title={song.title}
                    subtitle={song.artist}
                    imageUrl={song.thumbnail}
                    song={song}
                    onClick={() => handlePlaySong(song, idx)}
                  />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* ── No results ─────────────────────────────────── */}
        {hasQuery && !loading && !error && results.length === 0 && (
          <motion.div
            key="no-results"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4 py-16 text-center"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <SearchIcon className="w-6 h-6 text-white/20" />
            </div>
            <div>
              <p className="font-semibold text-white/50">No results for "{query}"</p>
              <p className="text-sm text-white/25 mt-1">Try a different search term</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
