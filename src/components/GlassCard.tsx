import React from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { cn } from "../utils/cn";
import { SongContextMenu } from "./SongContextMenu";
import type { Song } from "../store/usePlayerStore";

interface GlassCardProps {
  title: string;
  subtitle: string;
  imageUrl: string;
  className?: string;
  onClick?: () => void;
  song?: Song;
}

export const GlassCard: React.FC<GlassCardProps> = ({ title, subtitle, imageUrl, className, onClick, song }) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={cn(
        "group relative p-3 md:p-4 rounded-[20px] bg-[#1A1A1F] border border-white/5 cursor-pointer overflow-hidden transition-all duration-300 hover:bg-white/5",
        className
      )}
      onClick={onClick}
    >
      <div className="relative aspect-square rounded-xl overflow-hidden mb-4 shadow-lg">
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Context Menu Overlay */}
        {song && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <SongContextMenu song={song} className="bg-black/40 backdrop-blur-md rounded-full shadow-lg" />
          </div>
        )}
        {/* Play Button Overlay */}
        <div className="absolute bottom-3 right-3 w-12 h-12 bg-white rounded-full flex items-center justify-center opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-xl">
          <Play className="w-6 h-6 text-black fill-current ml-1" />
        </div>
      </div>
      
      <div className="flex flex-col">
        <h3 className="text-base font-semibold text-white truncate tracking-tight mb-1">
          {title}
        </h3>
        <p className="text-sm text-text-secondary truncate line-clamp-2 whitespace-normal">
          {subtitle}
        </p>
      </div>
    </motion.div>
  );
};
