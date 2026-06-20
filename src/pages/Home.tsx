import React from "react";
import { GlassCard } from "../components/GlassCard";
import { CompactTrackRow } from "../components/CompactTrackRow";
import { useRecentlyPlayed } from "../hooks/useRecentlyPlayed";
import { useLikedSongs } from "../hooks/useLikedSongs";
import { usePlaylists } from "../hooks/usePlaylists";
import { usePlayerStore, type Song } from "../store/usePlayerStore";
import { useAuth } from "../hooks/useAuth";
import { Music, Heart, ListMusic, History } from "lucide-react";
import { cn } from "../utils/cn";

const CATEGORIES = ["Podcasts", "Romance", "Workout", "Relaxing", "Punjabi", "Chill"];

export const Home: React.FC = () => {
  const { user, loginWithGoogle } = useAuth();
  const { recentlyPlayed } = useRecentlyPlayed();
  const { likedSongs } = useLikedSongs();
  const { playlists } = usePlaylists();
  const { setCurrentSong, togglePlay, currentSong } = usePlayerStore();

  const handlePlaySong = (song: Song) => {
    if (currentSong?.videoId === song.videoId) {
      togglePlay();
    } else {
      setCurrentSong(song);
    }
  };

  const likedList = Object.values(likedSongs);

  return (
    <div className="flex flex-col gap-8 md:gap-10 pb-6">
      {/* Category Pills */}
      <div className="flex overflow-x-auto hide-scrollbar gap-3 -mx-4 px-4 md:mx-0 md:px-0">
        {CATEGORIES.map((cat, i) => (
          <button 
            key={i}
            className={cn(
              "whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-colors",
              "bg-[#1A1A1F] hover:bg-white/10 text-white border border-white/5"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {!user ? (
        <div className="bg-[#1A1A1F] border border-white/5 rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-4 max-w-lg mx-auto mt-8 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
            <Music className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Unlock Your Personalized Music</h2>
          <p className="text-text-secondary text-sm">
            Sign in to track your recently played tracks, curate playlists, and save your favorite songs.
          </p>
          <button
            onClick={loginWithGoogle}
            className="px-6 py-2.5 bg-primary hover:bg-primary/95 text-white font-semibold rounded-full transition-all cursor-pointer"
          >
            Login with Google
          </button>
        </div>
      ) : (
        <>
          {/* 1. Continue Listening (Recently Played - first 4 songs) */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-primary mb-4 flex items-center gap-2">
              <History className="w-5 h-5" />
              Continue Listening
            </h2>
            {recentlyPlayed.length > 0 ? (
              <div className="flex flex-col gap-1">
                {recentlyPlayed.slice(0, 4).map((song) => (
                  <CompactTrackRow 
                    key={song.videoId} 
                    song={song} 
                    onClick={() => handlePlaySong(song)} 
                  />
                ))}
              </div>
            ) : (
              <div className="bg-[#1A1A1F]/40 border border-white/5 rounded-2xl p-6 text-center text-text-secondary text-sm">
                No songs played yet. Start searching to play some music!
              </div>
            )}
          </section>

          {/* 2. Liked Songs */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-primary mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Your Liked Songs
            </h2>
            {likedList.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {likedList.slice(0, 10).map((song) => (
                  <GlassCard
                    key={song.videoId}
                    title={song.title}
                    subtitle={song.artist}
                    imageUrl={song.thumbnail}
                    song={song}
                    onClick={() => handlePlaySong(song)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-[#1A1A1F]/40 border border-white/5 rounded-2xl p-6 text-center text-text-secondary text-sm">
                No liked songs yet. Click the heart icon on any track to save it here.
              </div>
            )}
          </section>

          {/* 3. User Playlists */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-primary mb-4 flex items-center gap-2">
              <ListMusic className="w-5 h-5" />
              Your Playlists
            </h2>
            {playlists.length > 0 ? (
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
            ) : (
              <div className="bg-[#1A1A1F]/40 border border-white/5 rounded-2xl p-6 text-center text-text-secondary text-sm">
                No playlists created yet. Create a playlist from the sidebar to organize your library.
              </div>
            )}
          </section>

          {/* 4. Recently Played (Rest of history / full history) */}
          {recentlyPlayed.length > 4 && (
            <section>
              <h2 className="text-xl md:text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                <History className="w-5 h-5" />
                Recently Played
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {recentlyPlayed.slice(4).map((song, i) => (
                  <GlassCard
                    key={`${song.videoId}-${i}`}
                    title={song.title}
                    subtitle={song.artist}
                    imageUrl={song.thumbnail}
                    song={song}
                    onClick={() => handlePlaySong(song)}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};
