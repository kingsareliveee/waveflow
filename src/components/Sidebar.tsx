import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Search, Library, Heart, Music2 } from "lucide-react";
import { cn } from "../utils/cn";

export const Sidebar: React.FC = () => {
  return (
    <div className="h-full flex flex-col py-6 px-4 bg-transparent text-text-secondary">
      <div className="flex items-center gap-3 px-4 mb-10 text-white">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
          <Music2 className="w-5 h-5 text-black" fill="currentColor" />
        </div>
        <span className="font-semibold text-lg tracking-tight">Aura Music</span>
      </div>

      <nav className="flex flex-col gap-2">
        <NavItem to="/" icon={<Home className="w-5 h-5" />} label="Home" />
        <NavItem to="/search" icon={<Search className="w-5 h-5" />} label="Search" />
        <NavItem to="/library" icon={<Library className="w-5 h-5" />} label="Library" />
      </nav>

      <div className="mt-8 pt-6 border-t border-border-subtle">
        <nav className="flex flex-col gap-2">
          <NavItem to="/liked" icon={<Heart className="w-5 h-5" />} label="Liked Songs" />
        </nav>
      </div>

      <div className="mt-auto">
        <div className="px-4 py-3 text-xs text-text-secondary/50">
          Premium High-Fidelity
        </div>
      </div>
    </div>
  );
};

const NavItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm",
        isActive 
          ? "bg-white/10 text-white" 
          : "hover:text-white hover:bg-white/5"
      )
    }
  >
    {icon}
    {label}
  </NavLink>
);
