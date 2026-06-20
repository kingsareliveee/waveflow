import React from "react";
import { Play } from "lucide-react";
import { SongContextMenu } from "./SongContextMenu";
import type { Song } from "../store/usePlayerStore";

interface CompactTrackRowProps {
  song: Song;
  index?: number;
  onClick: () => void;
}

export const CompactTrackRow: React.FC<CompactTrackRowProps> = ({ song, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="flex items-center gap-3 md:gap-4 p-2 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer"
    >
      <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden relative flex-shrink-0">
        <img 
          src={song.thumbnail} 
          alt={song.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Play className="w-5 h-5 text-white fill-current ml-0.5" />
        </div>
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-sm md:text-base font-semibold text-white truncate">
          {song.title}
        </span>
        <span className="text-xs md:text-sm text-text-secondary truncate mt-0.5">
          {song.artist}
        </span>
      </div>

      <div className="flex-shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
        <SongContextMenu song={song} />
      </div>
    </div>
  );
};
