import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AnimatePresence } from "framer-motion";
import { MainLayout } from "./layouts/MainLayout";
import { Home } from "./pages/Home";
import { Search } from "./pages/Search";
import { Library } from "./pages/Library";
import { SongDetail } from "./pages/SongDetail";
import { useAuth } from "./hooks/useAuth";
import { AudioProvider } from "./components/AudioProvider";
import { SplashScreen } from "./components/SplashScreen";
import { ThemeProvider } from "./contexts/ThemeContext";

const SPLASH_KEY = "musick-splash-shown";

function AppInner() {
  const { loading } = useAuth();
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    try {
      return !sessionStorage.getItem(SPLASH_KEY);
    } catch {
      return true;
    }
  });

  const handleSplashComplete = () => {
    try { sessionStorage.setItem(SPLASH_KEY, "1"); } catch {}
    setShowSplash(false);
  };

  useEffect(() => {
    console.log("[DEBUG] App mounted");
    return () => console.log("[DEBUG] App unmounted");
  }, []);

  return (
    <>
      {/* Toaster */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#141414",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            fontSize: "14px",
            fontFamily: "'Inter', sans-serif",
          },
          duration: 3000,
        }}
      />

      {/* Splash screen (once per session) */}
      <AnimatePresence mode="wait">
        {showSplash && (
          <SplashScreen key="splash" onComplete={handleSplashComplete} />
        )}
      </AnimatePresence>

      {/* Loading state */}
      {!showSplash && loading && (
        <div className="h-screen w-screen flex items-center justify-center" style={{ background: "#050505" }}>
          <div className="flex items-end gap-[3px]" style={{ height: 32 }}>
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className="waveform-bar"
                style={{
                  width: 3,
                  height: `${Math.random() * 60 + 40}%`,
                  animationDelay: `${i * 0.07}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main app */}
      {!showSplash && !loading && (
        <AudioProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="search" element={<Search />} />
                <Route path="library" element={<Library />} />
                <Route path="song/:videoId" element={<SongDetail />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AudioProvider>
      )}
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}

export default App;
