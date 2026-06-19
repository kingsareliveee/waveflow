import React from "react";
import { GlassCard } from "../components/GlassCard";
import { MOCK_DATA } from "../utils/mockData";

export const Library: React.FC = () => {
  return (
    <div className="flex flex-col gap-10">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Your Library</h1>
        <div className="flex gap-4 mt-6">
          <button className="px-6 py-2 rounded-full bg-white text-black font-medium text-sm transition-transform hover:scale-105">
            Playlists
          </button>
          <button className="px-6 py-2 rounded-full bg-white/10 text-white font-medium text-sm hover:bg-white/20 transition-all">
            Artists
          </button>
          <button className="px-6 py-2 rounded-full bg-white/10 text-white font-medium text-sm hover:bg-white/20 transition-all">
            Albums
          </button>
        </div>
      </header>

      <section>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {/* Liked Songs Special Card */}
          <div className="group relative p-6 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-800 premium-shadow cursor-pointer overflow-hidden transition-all duration-500 hover:scale-[1.02] flex flex-col justify-end aspect-square">
            <h3 className="text-3xl font-bold text-white mb-2 z-10">Liked<br/>Songs</h3>
            <p className="text-white/80 text-sm z-10">248 songs</p>
          </div>
          
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
    </div>
  );
};
