import React from "react";
import { GlassCard } from "../components/GlassCard";
import { MOCK_DATA } from "../utils/mockData";

export const Home: React.FC = () => {
  return (
    <div className="flex flex-col gap-10">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Good Evening</h1>
        <p className="text-text-secondary">Jump back in to your favorite tunes.</p>
      </header>

      <section>
        <h2 className="text-xl font-semibold text-white mb-6">Featured Playlists</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {MOCK_DATA.featuredPlaylists.map((playlist) => (
            <GlassCard
              key={playlist.id}
              title={playlist.title}
              subtitle={playlist.subtitle}
              imageUrl={playlist.imageUrl}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-6">Recently Played</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {MOCK_DATA.recentlyPlayed.map((album) => (
            <GlassCard
              key={album.id}
              title={album.title}
              subtitle={album.subtitle}
              imageUrl={album.imageUrl}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
