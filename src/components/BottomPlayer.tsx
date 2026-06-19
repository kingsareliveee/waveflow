import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat, Shuffle, Loader2 } from "lucide-react";
import { usePlayerStore } from "../store/usePlayerStore";
import { cn } from "../utils/cn";

export const BottomPlayer: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    currentSong,
    isPlaying,
    volume,
    currentTime,
    duration,
    isShuffle,
    repeatMode,
    setIsPlaying,
    setVolume,
    setCurrentTime,
    setDuration,
    togglePlay,
    toggleShuffle,
    toggleRepeat,
    playNext,
    playPrevious,
  } = usePlayerStore();

  // Handle source and play/pause state synchronization
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentSong) {
      const streamUrl = `/api/stream/${currentSong.videoId}`;
      const expectedUrl = window.location.origin + streamUrl;

      if (audio.src !== expectedUrl) {
        setIsLoading(true);
        setError("");
        audio.src = streamUrl;
        audio.load();
      }

      if (isPlaying) {
        audio.play().catch((err) => {
          console.error("Audio playback error:", err);
          setIsPlaying(false);
          setError("Playback failed. Re-trying...");
        });
      } else {
        audio.pause();
      }
    } else {
      audio.src = "";
      audio.pause();
    }
  }, [currentSong, isPlaying, setIsPlaying]);

  // Synchronize volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Helper to format time
  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // HTML5 Audio event handlers
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsLoading(false);
    }
  };

  const handleAudioError = (e: any) => {
    console.error("Audio tag error:", e);
    setIsLoading(false);
    setError("Failed to stream audio. Skipping to next song...");
    setTimeout(() => {
      setError("");
      playNext();
    }, 3000);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || duration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newVolume = Math.min(Math.max(clickX / width, 0), 1);
    setVolume(newVolume);
  };

  const toggleMute = () => {
    setVolume(volume > 0 ? 0 : 0.8);
  };

  return (
    <div className="h-full px-6 flex items-center justify-between relative">
      {/* Invisible HTML5 Audio Tag */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={playNext}
        onError={handleAudioError}
      />

      {/* Playback error overlay */}
      {error && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full px-4 py-1.5 bg-red-900/90 text-white text-xs rounded-t-lg z-50 backdrop-blur-md border border-red-500/25">
          {error}
        </div>
      )}

      {/* Current Song Info */}
      <div className="flex items-center gap-4 w-1/4 min-w-[200px]">
        {currentSong ? (
          <>
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-surface flex-shrink-0 shadow-md relative group">
              <img
                src={currentSong.thumbnail}
                alt={currentSong.title}
                className="w-full h-full object-cover"
              />
              {isLoading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              )}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium text-white truncate cursor-pointer hover:underline">
                {currentSong.title}
              </span>
              <span className="text-xs text-text-secondary truncate cursor-pointer hover:underline hover:text-white transition-colors">
                {currentSong.artist}
              </span>
            </div>
          </>
        ) : (
          <div className="text-sm text-text-secondary">No song playing</div>
        )}
      </div>

      {/* Playback Controls */}
      <div className="flex flex-col items-center justify-center flex-1 max-w-2xl px-8">
        <div className="flex items-center gap-6 mb-2">
          <button
            className={cn(
              "transition-colors",
              isShuffle ? "text-white" : "text-text-secondary hover:text-white"
            )}
            onClick={toggleShuffle}
          >
            <Shuffle className="w-4 h-4" />
          </button>
          <button
            className="text-text-secondary hover:text-white transition-colors"
            onClick={playPrevious}
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          <button
            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
            onClick={togglePlay}
            disabled={!currentSong}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-1" />
            )}
          </button>

          <button
            className="text-text-secondary hover:text-white transition-colors"
            onClick={playNext}
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
          
          <button
            className={cn(
              "transition-colors relative",
              repeatMode !== "none" ? "text-white" : "text-text-secondary hover:text-white"
            )}
            onClick={toggleRepeat}
          >
            <Repeat className="w-4 h-4" />
            {repeatMode === "one" && (
              <span className="absolute -top-1.5 -right-1.5 text-[7px] bg-white text-black font-bold rounded-full w-3 h-3 flex items-center justify-center scale-90">
                1
              </span>
            )}
            {repeatMode === "all" && (
              <span className="absolute -top-1.5 -right-1.5 text-[7px] bg-white text-black font-bold rounded-full w-3 h-3 flex items-center justify-center scale-90">
                A
              </span>
            )}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full flex items-center gap-3">
          <span className="text-xs text-text-secondary w-10 text-right">
            {formatTime(currentTime)}
          </span>
          <div
            className="flex-1 h-1.5 bg-white/10 rounded-full cursor-pointer relative group"
            onClick={handleSeek}
          >
            <div
              className="absolute left-0 top-0 bottom-0 bg-white rounded-full group-hover:bg-white transition-all"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-lg transform translate-x-1/2" />
            </div>
          </div>
          <span className="text-xs text-text-secondary w-10">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Volume & Extras */}
      <div className="flex items-center justify-end gap-4 w-1/4 min-w-[150px]">
        <button
          className="text-text-secondary hover:text-white transition-colors"
          onClick={toggleMute}
        >
          <Volume2 className="w-5 h-5" />
        </button>
        <div
          className="w-24 h-1.5 bg-white/10 rounded-full cursor-pointer relative group"
          onClick={handleVolumeChange}
        >
          <div
            className="absolute left-0 top-0 bottom-0 bg-white rounded-full group-hover:bg-white transition-colors"
            style={{ width: `${volume * 100}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-lg transform translate-x-1/2" />
          </div>
        </div>
      </div>
    </div>
  );
};
