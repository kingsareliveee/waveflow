import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Home, Search, Library, Heart, Music2, LogIn, LogOut, Plus } from "lucide-react";
import { cn } from "../utils/cn";
import { useAuth } from "../hooks/useAuth";
import { CreatePlaylistModal } from "./CreatePlaylistModal";

export const Sidebar: React.FC = () => {
  const { user, loginWithGoogle, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        <NavItem to="/search" icon={<Search className="w-5 h-5" />} label="Explore" />
        <NavItem to="/library" icon={<Library className="w-5 h-5" />} label="Library" />
      </nav>

      <div className="mt-8 pt-6 border-t border-border-subtle">
        <nav className="flex flex-col gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-4 px-4 py-3 w-full rounded-xl hover:text-white transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Playlist
          </button>
          <NavItem to="/liked" icon={<Heart className="w-5 h-5" />} label="Liked Songs" />
        </nav>
      </div>

      <div className="mt-auto pt-6 border-t border-border-subtle">
        {user ? (
          <button
            onClick={logout}
            className="flex items-center gap-4 px-4 py-3 w-full rounded-xl hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        ) : (
          <button
            onClick={loginWithGoogle}
            className="flex items-center gap-4 px-4 py-3 w-full rounded-xl hover:text-white transition-colors"
          >
            <LogIn className="w-5 h-5" />
            Login
          </button>
        )}
      </div>

      <CreatePlaylistModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
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
          ? "bg-[#1A1A1F] text-primary" 
          : "hover:text-white hover:bg-[#1A1A1F]/50"
      )
    }
  >
    {icon}
    {label}
  </NavLink>
);
