import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Play, Pause, Heart, MoreHorizontal, Clock, Loader2 } from "lucide-react";
import { usePlayerStore, type Song } from "../store/usePlayerStore";

export const SongDetail: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { currentSong, isPlaying, setCurrentSong, togglePlay } = usePlayerStore();

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
      } catch (err) {
        console.error(err);
        setError("Failed to load song details.");
      } finally {
        setLoading(false);
      }
    };

    fetchSongDetails();
  }, [videoId]);

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
      <div className="flex items-center justify-center min-h-[50vh] gap-3 text-text-secondary">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="text-lg">Loading song details...</span>
      </div>
    );
  }

  if (error || !song) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="text-red-500 text-lg font-medium">{error || "Song not found"}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-8 items-end">
        <div className="w-56 h-56 rounded-xl shadow-2xl overflow-hidden flex-shrink-0 bg-surface border border-border-subtle">
          <img 
            src={song.thumbnail} 
            alt={song.title} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-widest text-text-secondary mb-2">Single</span>
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-6 line-clamp-2">{song.title}</h1>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <span className="font-semibold text-white hover:underline cursor-pointer">{song.artist}</span>
            <span>•</span>
            <span>YouTube Audio</span>
            <span>•</span>
            <span>{song.duration}</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-6 mt-4">
        <button 
          onClick={handlePlayMainSong}
          className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-xl cursor-pointer"
        >
          {isCurrentSong && isPlaying ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 fill-current ml-1" />
          )}
        </button>
        <button className="text-text-secondary hover:text-white transition-colors cursor-pointer">
          <Heart className="w-8 h-8" />
        </button>
        <button className="text-text-secondary hover:text-white transition-colors cursor-pointer">
          <MoreHorizontal className="w-8 h-8" />
        </button>
      </div>

      {/* Songs Table */}
      <div className="w-full mt-6">
        <div className="grid grid-cols-[16px_1fr_minmax(120px,200px)_minmax(60px,100px)] gap-4 px-4 py-2 border-b border-border-subtle text-sm text-text-secondary uppercase tracking-wider mb-4">
          <span className="text-center">#</span>
          <span>Title</span>
          <span className="hidden md:block">Source</span>
          <div className="flex justify-end pr-8"><Clock className="w-4 h-4" /></div>
        </div>

        {/* Track Row */}
        <div 
          onClick={handlePlayMainSong}
          className="grid grid-cols-[16px_1fr_minmax(120px,200px)_minmax(60px,100px)] gap-4 px-4 py-3 hover:bg-white/5 rounded-xl transition-colors group cursor-pointer items-center"
        >
          <span className="text-center text-text-secondary text-sm group-hover:hidden">1</span>
          <span className="text-center text-white hidden group-hover:flex items-center justify-center">
            {isCurrentSong && isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
          </span>
          <div className="flex flex-col">
            <span className="text-white font-medium truncate">{song.title}</span>
            <span className="text-text-secondary text-sm truncate">{song.artist}</span>
          </div>
          <span className="hidden md:block text-text-secondary text-sm">YouTube</span>
          <span className="text-right text-text-secondary text-sm pr-8">{song.duration}</span>
        </div>
      </div>
    </div>
  );
};
