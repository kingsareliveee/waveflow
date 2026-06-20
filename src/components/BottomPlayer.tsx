import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Pause, SkipBack, SkipForward, Loader2, Heart } from "lucide-react";
import { usePlayerStore } from "../store/usePlayerStore";
import { useLikedSongs } from "../hooks/useLikedSongs";
import { audioEngine } from "../lib/audioEngine";
import { cn } from "../utils/cn";

/**
 * BottomPlayer — UI-only playback controls.
 *
 * This component contains NO <audio> element and NO playback logic.
 * All audio state (currentTime, duration, isPlaying) comes from the
 * Zustand store, which is kept in sync by AudioProvider + AudioEngine.
 *
 * Navigation uses React Router's useNavigate() instead of window.location.href
 * to prevent full page reloads that would destroy the React tree.
 */
export const BottomPlayer: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading] = useState(false);

  // Debug: track mount/unmount lifecycle
  useEffect(() => {
    console.log("[DEBUG] BottomPlayer mounted");
    return () => console.log("[DEBUG] BottomPlayer unmounted");
  }, []);

  const { isLiked, toggleLike } = useLikedSongs();

  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    playNext,
    playPrevious,
  } = usePlayerStore();

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (duration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * duration;
    audioEngine.seek(newTime);
  };

  if (!currentSong) return null;

  return (
    <div className="h-[60px] md:h-[72px] bg-[#1A1A1F]/95 backdrop-blur-xl rounded-xl md:rounded-2xl border border-white/5 flex items-center justify-between px-3 md:px-4 relative overflow-hidden shadow-2xl transition-all hover:bg-[#1A1A1F]">
      {/* Thin Progress Bar at Bottom */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 cursor-pointer group"
        onClick={handleSeek}
      >
        <div
          className="h-full bg-primary relative group-hover:bg-primary/80 transition-colors"
          style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
        />
      </div>

      {/* Left: Thumbnail & Info */}
      <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0 pr-4">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-md md:rounded-lg overflow-hidden bg-surface flex-shrink-0 relative group">
          <img
            src={currentSong.thumbnail}
            alt={currentSong.title}
            className="w-full h-full object-cover"
          />
          {isLoading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Loader2 className="w-4 h-4 md:w-5 md:h-5 text-white animate-spin" />
            </div>
          )}
        </div>
        
        <div className="flex flex-col min-w-0">
          <span 
            className="text-sm md:text-base font-semibold text-white truncate cursor-pointer hover:underline"
            onClick={() => navigate(`/song/${currentSong.videoId}`)}
          >
            {currentSong.title}
          </span>
          <span 
            className="text-xs text-text-secondary truncate cursor-pointer hover:underline hover:text-white transition-colors"
            onClick={() => navigate(`/song/${currentSong.videoId}`)}
          >
            {currentSong.artist}
          </span>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
        <button
          onClick={() => toggleLike(currentSong)}
          className="p-2 text-text-secondary hover:text-white hover:scale-110 transition-all"
        >
          <Heart 
            className={cn("w-5 h-5 md:w-6 md:h-6", isLiked(currentSong.videoId) && "fill-primary text-primary")} 
          />
        </button>

        {/* Desktop only controls */}
        <div className="hidden md:flex items-center gap-4 mr-2">
          <button
            className="text-text-secondary hover:text-white transition-colors"
            onClick={playPrevious}
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>
        </div>

        <button
          className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center hover:scale-105 transition-transform text-white"
          onClick={togglePlay}
          disabled={!currentSong}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 md:w-8 md:h-8 fill-current" />
          ) : (
            <Play className="w-6 h-6 md:w-8 md:h-8 fill-current ml-1" />
          )}
        </button>

        {/* Desktop only controls */}
        <div className="hidden md:flex items-center gap-4 ml-2">
          <button
            className="text-text-secondary hover:text-white transition-colors"
            onClick={playNext}
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
};
