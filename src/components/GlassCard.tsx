import React from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { cn } from "../utils/cn";

interface GlassCardProps {
  title: string;
  subtitle: string;
  imageUrl: string;
  className?: string;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ title, subtitle, imageUrl, className, onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={cn(
        "group relative p-4 rounded-2xl glass-panel premium-shadow cursor-pointer overflow-hidden transition-all duration-500 hover:bg-white/10",
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
