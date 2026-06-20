import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { MainLayout } from "./layouts/MainLayout";
import { Home } from "./pages/Home";
import { Search } from "./pages/Search";
import { Library } from "./pages/Library";
import { SongDetail } from "./pages/SongDetail";
import { useAuth } from "./hooks/useAuth";
import { AudioProvider } from "./components/AudioProvider";

function App() {
  const { loading } = useAuth(); // Mounts the auth hook to listen to session changes globally

  useEffect(() => {
    console.log("[DEBUG] App mounted");
    return () => console.log("[DEBUG] App unmounted");
  }, []);

  if (loading) {
    console.log("[DEBUG] App rendering: loading state");
    return <div className="h-screen w-screen bg-background flex items-center justify-center text-white">Loading...</div>;
  }

  console.log("[DEBUG] App rendering: full tree (BrowserRouter + AudioProvider)");

  return (
    <>
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#333', color: '#fff' } }} />
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
    </>
  );
}

export default App;
