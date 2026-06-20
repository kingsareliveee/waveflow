import React from "react";
import { usePlaylists } from "../hooks/usePlaylists";
import { useLikedSongs } from "../hooks/useLikedSongs";
import { useAuth } from "../hooks/useAuth";
import { GlassCard } from "../components/GlassCard";
import { Heart, ArrowRight, Music, ListMusic, Disc, Mic2, TrendingUp } from "lucide-react";

export const Library: React.FC = () => {
  const { user, loginWithGoogle } = useAuth();
  const { playlists } = usePlaylists();
  const { likedSongs } = useLikedSongs();

  const likedCount = Object.keys(likedSongs).length;
  const playlistCount = playlists.length;

  const libraryItems = [
    { icon: Music, label: "Songs from library", count: `${likedCount} songs` },
    { icon: TrendingUp, label: "My top music", count: "50 songs" },
    { icon: ListMusic, label: "Playlists", count: `${playlistCount} playlists` },
    { icon: Disc, label: "Albums", count: "0 albums" },
    { icon: Mic2, label: "Artists", count: "0 artists" },
  ];

  if (!user) {
    return (
      <div className="flex flex-col gap-8 pb-6">
        <header className="flex items-center justify-between md:hidden mb-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">Library</h1>
        </header>

        <div className="bg-[#1A1A1F] border border-white/5 rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-4 max-w-lg mx-auto mt-8 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
            <Music className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Your Music Library</h2>
          <p className="text-text-secondary text-sm">
            Sign in to view your playlists, liked songs, albums, and artists.
          </p>
          <button
            onClick={loginWithGoogle}
            className="px-6 py-2.5 bg-primary hover:bg-primary/95 text-white font-semibold rounded-full transition-all cursor-pointer"
          >
            Login with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-6">
      {/* Header (Mobile only) */}
      <header className="flex items-center justify-between md:hidden mb-2">
        <h1 className="text-2xl font-bold tracking-tight text-white">Library</h1>
      </header>

      {/* Liked Music Card */}
      <div className="bg-[#1A1A1F] rounded-2xl p-5 md:p-6 flex flex-col justify-between cursor-pointer hover:bg-white/5 transition-colors border border-white/5 shadow-xl relative overflow-hidden group">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary fill-current" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white">Liked music</h2>
          </div>
          <ArrowRight className="w-5 h-5 text-text-secondary group-hover:text-white transition-colors" />
        </div>
        <p className="text-text-secondary font-medium">{likedCount} songs</p>
      </div>

      {/* Playlists Section */}
      {playlists.length > 0 && (
        <section>
          <h2 className="text-xl md:text-2xl font-bold text-primary mb-4">Your Playlists</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {playlists.map((playlist) => (
              <GlassCard
                key={playlist.id}
                title={playlist.name}
                subtitle={`${playlist.songs?.length || 0} songs`}
                imageUrl={
                  playlist.songs && playlist.songs.length > 0
                    ? playlist.songs[0].thumbnail
                    : "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=300&auto=format&fit=crop"
                }
              />
            ))}
          </div>
        </section>
      )}

      {/* Also in your Library */}
      <section>
        <h2 className="text-xl md:text-2xl font-bold text-primary mb-4">Also in your Library</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {libraryItems.map((item, index) => (
            <div 
              key={index}
              className="bg-[#1A1A1F] rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-3 cursor-pointer hover:bg-white/5 transition-colors border border-white/5"
            >
              <item.icon className="w-6 h-6 text-text-secondary md:mb-0 mb-1" />
              <div className="flex flex-col">
                <span className="font-semibold text-white">{item.label}</span>
                <span className="text-xs text-text-secondary">{item.count}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
