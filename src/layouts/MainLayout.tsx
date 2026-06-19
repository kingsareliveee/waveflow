import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { BottomPlayer } from "../components/BottomPlayer";

export const MainLayout: React.FC = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <aside className="w-64 flex-shrink-0 glass-panel border-r border-t-0 border-b-0 border-l-0 hidden md:block z-40">
        <Sidebar />
      </aside>

      <main className="flex-1 overflow-y-auto relative pb-28">
        <div className="px-6 py-8 max-w-7xl mx-auto min-h-full">
          <Outlet />
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 h-24 glass-panel border-t z-50">
        <BottomPlayer />
      </div>
    </div>
  );
};
