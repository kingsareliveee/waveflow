import React, { useState, useRef, useEffect } from "react";
import { LogIn, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export const MobileProfile: React.FC = () => {
  const { user, loginWithGoogle, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) {
    return (
      <button
        onClick={loginWithGoogle}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1A1A1F] hover:bg-white/10 text-white text-xs font-semibold border border-white/5 transition-all cursor-pointer"
      >
        <LogIn className="w-3.5 h-3.5" />
        <span>Login with Google</span>
      </button>
    );
  }

  const avatarUrl = user.user_metadata?.avatar_url;
  const fullName = user.user_metadata?.full_name || "User";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full overflow-hidden border border-primary/40 focus:outline-none flex items-center justify-center bg-[#1A1A1F] cursor-pointer"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
        ) : (
          <UserIcon className="w-4 h-4 text-white" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[#1A1A1F] border border-white/5 rounded-xl py-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-2 border-b border-white/5">
            <p className="text-[10px] uppercase tracking-wider text-text-secondary">Logged in as</p>
            <p className="text-sm font-semibold text-white truncate">{fullName}</p>
          </div>
          <button
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};
