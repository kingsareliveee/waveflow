import React, { useState, useEffect } from "react";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import { GlassCard } from "../components/GlassCard";
import { usePlayerStore, type Song } from "../store/usePlayerStore";

export const Search: React.FC = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { setCurrentSong, setQueue } = usePlayerStore();

  const performSearch = async (searchTerm: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
      if (!res.ok) throw new Error("Search request failed");
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch search results. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      performSearch(query);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  const handlePlaySong = (song: Song, index: number) => {
    setCurrentSong(song);
    // Set the rest of the search results as the upcoming queue
    const remainingResults = results.slice(index + 1);
    setQueue(remainingResults);
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="relative max-w-2xl">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <SearchIcon className="h-6 w-6 text-text-secondary" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="block w-full pl-12 pr-4 py-4 bg-white/5 border border-border-subtle rounded-2xl text-white placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-white/20 focus:bg-white/10 transition-all text-lg"
          placeholder="What do you want to listen to?"
        />
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-text-secondary">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Searching YouTube...</span>
        </div>
      )}

      {error && (
        <div className="text-red-500 font-medium">{error}</div>
      )}

      {!loading && !error && results.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-white mb-6">Search Results</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {results.map((song, idx) => (
              <GlassCard
                key={song.videoId}
                title={song.title}
                subtitle={song.artist}
                imageUrl={song.thumbnail}
                onClick={() => handlePlaySong(song, idx)}
              />
            ))}
          </div>
        </section>
      )}

      {!loading && !error && results.length === 0 && (
        <section>
          <h2 className="text-xl font-semibold text-white mb-6">Start Typing to Search</h2>
          <p className="text-text-secondary text-sm">
            Type your query to search for songs on YouTube (results auto-load after 300ms).
          </p>
        </section>
      )}
    </div>
  );
};
