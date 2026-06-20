import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { BottomPlayer } from "../components/BottomPlayer";
import { BottomNavBar } from "../components/BottomNavBar";
import { MobileProfile } from "../components/MobileProfile";

export const MainLayout: React.FC = () => {
  useEffect(() => {
    console.log("[DEBUG] MainLayout mounted");
    return () => console.log("[DEBUG] MainLayout unmounted");
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <aside className="w-64 flex-shrink-0 bg-[#1A1A1F] border-r border-white/5 hidden md:block z-40">
        <Sidebar />
      </aside>

      <main className="flex-1 overflow-y-auto relative pb-40 md:pb-32">
        {/* Sticky Mobile Header */}
        <div className="md:hidden sticky top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center justify-between">
          <span className="font-bold text-white text-lg tracking-tight">Aura Music</span>
          <MobileProfile />
        </div>

        <div className="px-4 md:px-6 py-6 md:py-8 max-w-7xl mx-auto min-h-full">
          <Outlet />
        </div>
      </main>

      {/* Floating Bottom Player */}
      <div className="fixed bottom-16 md:bottom-6 left-2 right-2 md:left-72 md:right-6 z-[60] pointer-events-none">
        <div className="pointer-events-auto">
          <BottomPlayer />
        </div>
      </div>

      <BottomNavBar />
    </div>
  );
};
