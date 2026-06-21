import React, { useState, useEffect } from "react";
import { Search, Check, Sparkles, LogOut, Loader2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

interface Artist {
  name: string;
  genre: string;
  language: string;
  image: string;
}

const RELATED_ARTISTS_MAP: Record<string, string[]> = {
  "Arijit Singh": ["Jubin Nautiyal", "KK", "Mohit Chauhan", "Atif Aslam", "Mithoon"],
  "Karan Aujla": ["Shubh", "AP Dhillon", "Sidhu Moosewala", "Gurinder Gill", "Diljit Dosanjh", "Prem Dhillon", "Navaan Sandhu"],
  "AP Dhillon": ["Karan Aujla", "Shubh", "Sidhu Moosewala", "Diljit Dosanjh", "Gurinder Gill"],
  "Shubh": ["Karan Aujla", "AP Dhillon", "Sidhu Moosewala", "Diljit Dosanjh"],
  "Sidhu Moosewala": ["Karan Aujla", "Shubh", "AP Dhillon", "Diljit Dosanjh"],
  "Diljit Dosanjh": ["Karan Aujla", "Shubh", "AP Dhillon", "Sidhu Moosewala", "Gurinder Gill"],
  "Talha Anjum": ["Talha Yunus", "Jokhay", "Rap Demon", "JJ47", "Umair"],
  "Talha Yunus": ["Talha Anjum", "Jokhay", "Rap Demon", "JJ47", "Umair"],
  "Atif Aslam": ["Arijit Singh", "Jubin Nautiyal", "KK", "Mohit Chauhan"],
  "Jubin Nautiyal": ["Arijit Singh", "KK", "Mohit Chauhan", "Atif Aslam"],
  "KK": ["Arijit Singh", "Jubin Nautiyal", "Mohit Chauhan", "Atif Aslam"],
  "Mohit Chauhan": ["Arijit Singh", "Jubin Nautiyal", "KK", "Atif Aslam"],
  "The Weeknd": ["Drake", "Travis Scott", "Post Malone", "Don Toliver"],
  "Drake": ["The Weeknd", "Travis Scott", "Post Malone", "Don Toliver"],
  "Travis Scott": ["The Weeknd", "Drake", "Post Malone", "Don Toliver"],
  "Post Malone": ["The Weeknd", "Drake", "Travis Scott", "Don Toliver"],
  "Don Toliver": ["The Weeknd", "Drake", "Travis Scott", "Post Malone"],
  "Seedhe Maut": ["Divine", "Badshah", "Talha Anjum", "Rap Demon"],
  "Divine": ["Seedhe Maut", "Badshah", "Talha Anjum", "Rap Demon"],
  "Badshah": ["Divine", "Yo Yo Honey Singh", "King", "Diljit Dosanjh"],
  "King": ["Badshah", "Anuv Jain", "The Local Train"],
  "Anuv Jain": ["The Local Train", "King", "Mohit Chauhan"],
  "The Local Train": ["Anuv Jain", "King", "Mohit Chauhan"],
  "Jordan Sandhu": ["Karan Aujla", "AP Dhillon", "Shubh", "Prem Dhillon", "Diljit Dosanjh"]
};

const ARTIST_SEEDS: Artist[] = [
  // Indian (70%)
  { name: "Arijit Singh", genre: "Bollywood", language: "Hindi", image: "https://yt3.googleusercontent.com/DcEzZrPCQRSSs47rMbdJ3UJkQUCN3X8SKf8aCnvOgd2BmPihAz-0jBGJgEVh9_P8EiSBVNyixDs=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "Karan Aujla", genre: "Punjabi", language: "Punjabi", image: "https://yt3.googleusercontent.com/Da4zbrS4XLxzb3xVNT14aKr22aBg1blJCuCBppbYglO_uDmElYopgoDk7XV6UWNxthI96XOYrw=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "AP Dhillon", genre: "Punjabi", language: "Punjabi", image: "https://yt3.googleusercontent.com/Xu6Ve0v8QGPKbg5M0r6OplEBIYsrJFP26yhs-fYxlYgrrQMG9SYAPeMVqnBs_6ZBzaKGLJZh0A=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "Shubh", genre: "Punjabi", language: "Punjabi", image: "https://yt3.googleusercontent.com/97CgNnarowX8Nr0wpZCNg4x--k63vT2NZSNLpjTtBvNlYgFJJIAbiLUrABnok6sM8zk2bUIJ=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "Sidhu Moosewala", genre: "Punjabi", language: "Punjabi", image: "https://yt3.ggpht.com/ytc/AIdro_kiQJ0Hhp0O-tdaY1dy81-gSNujjccUlWstnpFr686ZlMk=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "Diljit Dosanjh", genre: "Punjabi", language: "Punjabi", image: "https://yt3.googleusercontent.com/7EYXXMXY594V8y4sZT2aawmdKgDAGTu5jNm9C-HpR3jY9cZJ0NMxS__nZKBdWZ1PUpJPjc2BAA=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "Gurinder Gill", genre: "Punjabi", language: "Punjabi", image: "https://yt3.googleusercontent.com/hWoKZMzI1IgMcjeKVNPtGOL2UKuBHXfqwEMTNMLIZuZvL5s7Bx69T_bVZMvU-rvd2lQ5r04R=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "Prem Dhillon", genre: "Punjabi", language: "Punjabi", image: "https://yt3.googleusercontent.com/WyNcsd5_HkKIT6KLJHjo-bIL3ayXnBKRBSYFpV2B8QWB-PjkiDg5O7peyZVKv2_ErONKtwne=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "Navaan Sandhu", genre: "Punjabi", language: "Punjabi", image: "https://yt3.googleusercontent.com/AOQavD8FMS7qkudtgL_j5oD-l1tCupjPPpK9qXFezekHfED_YLbxfOG_upKvvc3Vfk4eAD-7TA=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "Badshah", genre: "Pop", language: "Hindi", image: "https://yt3.googleusercontent.com/-9oGvXUOGtVCmGynMpDFsgufXGL_IRKYxjF3bff8_qnIazQDrIa2MXDT5-xAKAA6rIEC8x2EfiM=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "Divine", genre: "Hip-Hop", language: "Hindi", image: "https://yt3.googleusercontent.com/0tKOgElQgxy07H34hgX5gY4xiBVuRDkfhaobb1Ty5wn0ma1kNz_1GEhp84NMpM1UvPG70y60=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "Seedhe Maut", genre: "Hip-Hop", language: "Hindi", image: "https://yt3.googleusercontent.com/DUcKt_1YaJ_48_T_hlxWg285BGKkTfwNdzKRV82G-gHZVerUQ8FD8Dl2hkqHLUirrJDnG4C3RA=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "King", genre: "Pop", language: "Hindi", image: "https://yt3.googleusercontent.com/zXNttSOqO-WhRBCImfU_U_SVCrEmk4GUENAM5F_hf7n704lMA6I2fvXvTrw1D_Sf8Lq7Gkz46Q=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "Anuv Jain", genre: "Indie", language: "Hindi", image: "https://yt3.googleusercontent.com/jD_fMyavCIO4L4N8PYYTBmR5_BbZmczV5dzOjvuWH4z3XQ1kjJm5HAhyEmQk2xD90dlPUo1DX7o=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "Jubin Nautiyal", genre: "Bollywood", language: "Hindi", image: "https://yt3.googleusercontent.com/H2Ml5UObbCePh2hgUmfLLV3d7NoNO6pqgloMKOMD30sGvOSyBGzeZoNBm_hOwzAzGMHn2Lpn=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "KK", genre: "Bollywood", language: "Hindi", image: "https://yt3.ggpht.com/4XC6r7BS8SiH0RRyXnaXaDzl1Iv7PeFxEVv0khdfaarlR0kKQFysVU3VdMfWQSczstia9w2mv38=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "Mohit Chauhan", genre: "Bollywood", language: "Hindi", image: "https://yt3.ggpht.com/iHlTfXwk3wCV5hwHWFJXZeNSSwHWU1KqvdkH3mP0eStfxHiiLL7QA7qAmKDpPJDW_z-NuxMrzaA=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "A.R. Rahman", genre: "Bollywood", language: "Hindi", image: "https://yt3.ggpht.com/ytc/AIdro_lfa_HP-vAmKA1j5Q2CBioDqVyClEr6sXREMMM-E7zYFU8=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "Pritam", genre: "Bollywood", language: "Hindi", image: "https://yt3.ggpht.com/H06fZaJ6OD2hmXPfumbn1GfvWQn9OOlUOzvn8LAwnhzCG035pLlYAICFkpS0K2q1oKhMAxPyCA=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "Yo Yo Honey Singh", genre: "Pop", language: "Hindi", image: "https://yt3.googleusercontent.com/2uUjDK69h-ijAxl6a_XrmKqLdL3ECr78FXXkUWERGJAHpSH0p3DEiNdlOuaR8LT3QCCF9P_ghg=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "The Local Train", genre: "Indie", language: "Hindi", image: "https://yt3.googleusercontent.com/N0lxjAH4Vd1YetT_NXAk12MP2XKHwGpsLch-H3SA745OL18vWAHR1WYvc0RoTWvzYPpLq3bI=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "Mithoon", genre: "Bollywood", language: "Hindi", image: "https://yt3.ggpht.com/LY5pMz1qb3KPmUjFXSDhxTKGpwGaQIVOBLpOw9L-eRvvwy9nMgDZIdNrHVLpeTGNw-uDOJqg=s88-c-k-c0x00ffffff-no-rj-mo" },
  
  // Pakistani (20%)
  { name: "Talha Anjum", genre: "Urdu Rap", language: "Urdu", image: "https://yt3.googleusercontent.com/zGaJjNDJcPtVAS_1iwOT-Ka4HH8U2eRkZld2d8FNxwvfMePFRSjew-Qi3H4JbkHTaHliAAEQPQ=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "Talha Yunus", genre: "Urdu Rap", language: "Urdu", image: "https://yt3.googleusercontent.com/BgHUQfg1LdkodiDQJ0RXPyrREow5IVOfprCoCJjJ0j-FLCUsKkpgVF2yO1Dsyifaupi3dLAbeQ=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "Atif Aslam", genre: "Bollywood", language: "Hindi", image: "https://ui-avatars.com/api/?name=Atif%20Aslam&background=random&color=fff" },
  { name: "Jokhay", genre: "Urdu Rap", language: "Urdu", image: "https://yt3.googleusercontent.com/zGaJjNDJcPtVAS_1iwOT-Ka4HH8U2eRkZld2d8FNxwvfMePFRSjew-Qi3H4JbkHTaHliAAEQPQ=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "Rap Demon", genre: "Urdu Rap", language: "Urdu", image: "https://yt3.googleusercontent.com/zIFSP-3jIETep8hRKl60GGDcBCTgiUE88kw25CL_HbDj0BSn0YiF8DxXCU2136UvYW9_6XjcNQ=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "JJ47", genre: "Urdu Rap", language: "Urdu", image: "https://yt3.googleusercontent.com/SUkQ16yH5HUnCvJD-i5wHaO37OlvjOymo9rUmXlvM3lFVwqKbG28xYLIazUTEKL4g6YOhHIANPM=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "Umair", genre: "Urdu Rap", language: "Urdu", image: "https://yt3.ggpht.com/z2GOzYjNTVTf0Wgba0cLCeSmG3TLU0mcaGSPVolo31gkPugfZpySVKwPGwVRimxo8MdwYt8vzw=s88-c-k-c0x00ffffff-no-rj-mo" },

  // International (10%)
  { name: "The Weeknd", genre: "Pop", language: "English", image: "https://yt3.googleusercontent.com/WHvw1ak1FcJaHeEiTmG2iN0dqEjjPxAtT_tA8ruJ3MlNr9I-RHsAur1iAenYeQN_d6LNPH2Z8Ic=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "Drake", genre: "Hip-Hop", language: "English", image: "https://yt3.ggpht.com/ytc/AIdro_lCPp6jFXJWIVHM0fIK5HofL3nyLOsmhu1Ek2OwyppYlOM=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "Travis Scott", genre: "Hip-Hop", language: "English", image: "https://yt3.ggpht.com/ytc/AIdro_lYT_V7ztsYEvILayV7Ey_fgzx2VYpeLJxFXf1TO0rjPH8=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "Post Malone", genre: "Pop", language: "English", image: "https://yt3.googleusercontent.com/CYKmEPOqcWMzKWbANlT9ok3-mkYxdiAMCh-YaXW8a19qfuT4ZQEar0OkIa8Rkd1tFSQO1Yq3bDA=s88-c-k-c0x00ffffff-no-rj-mo" },
  { name: "Don Toliver", genre: "Hip-Hop", language: "English", image: "https://yt3.googleusercontent.com/SsuKZm4BYUk8FCKSkgCW65gvbZ8-yEAoFrHUA_H0PMctOdSyPqtnsVESUckRNMH7Pa9mO6-E4wQ=s88-c-k-c0x00ffffff-no-rj-mo" }
];

export const OnboardingTastePicker: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { user, logout } = useAuth();
  const [visibleArtists, setVisibleArtists] = useState<Artist[]>([]);
  const [selectedArtists, setSelectedArtists] = useState<Artist[]>([]);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Artist[]>([]);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Preference scores
  const [preferenceScores, setPreferenceScores] = useState<Record<string, number>>({});

  useEffect(() => {
    // Show 15 default seed artists to start
    setVisibleArtists(ARTIST_SEEDS.slice(0, 15));
  }, []);

  // Sync preference scoring engine
  useEffect(() => {
    const scores: Record<string, number> = {};
    selectedArtists.forEach((a) => {
      // Each selection gives +10 points to its genre and language
      scores[a.genre] = (scores[a.genre] || 0) + 10;
      scores[a.language] = (scores[a.language] || 0) + 10;
    });
    setPreferenceScores(scores);
  }, [selectedArtists]);

  const toggleSelectArtist = (artist: Artist) => {
    const isSelected = selectedArtists.some((a) => a.name === artist.name);

    if (isSelected) {
      setSelectedArtists(selectedArtists.filter((a) => a.name !== artist.name));
    } else {
      setSelectedArtists([...selectedArtists, artist]);

      // Smart Artist Expansion: immediately find related artists
      const relatedNames = RELATED_ARTISTS_MAP[artist.name];
      if (relatedNames) {
        const toAdd: Artist[] = [];
        relatedNames.forEach((name) => {
          // Find in original seeds pool
          const match = ARTIST_SEEDS.find((s) => s.name === name);
          if (match && !visibleArtists.some((v) => v.name === name)) {
            toAdd.push(match);
          }
        });

        if (toAdd.length > 0) {
          setVisibleArtists((prev) => [...prev, ...toAdd]);
        }
      }
    }
  };

  const handleQueryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }

    // Filter local visible/seed pool first
    const localMatches = ARTIST_SEEDS.filter((a) =>
      a.name.toLowerCase().includes(val.toLowerCase())
    );

    // If search term has some length and no local matches, or we want online results, query backend
    if (val.trim().length > 2) {
      setSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(val)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.artists && data.artists.length > 0) {
            const online: Artist[] = data.artists.map((a: any) => {
              // Try to map genre & language from seed pool if matching, else default
              const seedMatch = ARTIST_SEEDS.find(
                (s) => s.name.toLowerCase() === a.name.toLowerCase()
              );
              return {
                name: a.name,
                genre: seedMatch?.genre || "Pop",
                language: seedMatch?.language || "English",
                image: a.thumbnail || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop",
              };
            });
            // Merge local matches and online
            const combined = [...localMatches];
            online.forEach((o) => {
              if (!combined.some((c) => c.name.toLowerCase() === o.name.toLowerCase())) {
                combined.push(o);
              }
            });
            setSearchResults(combined);
          } else {
            setSearchResults(localMatches);
          }
        } else {
          setSearchResults(localMatches);
        }
      } catch (err) {
        console.error("Onboarding search failed:", err);
        setSearchResults(localMatches);
      } finally {
        setSearching(false);
      }
    } else {
      setSearchResults(localMatches);
    }
  };

  const handleSubmit = async () => {
    if (selectedArtists.length < 5 || !user) return;
    setSubmitting(true);

    try {
      // 1. Re-fetch the current session to ensure auth headers are fresh
      //    This fixes 403 errors caused by stale session tokens after OAuth redirect
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        console.warn("[Onboarding] Session not ready, retrying once...");
        // Wait a bit and retry once
        await new Promise(resolve => setTimeout(resolve, 1500));
        const { data: retrySession } = await supabase.auth.getSession();
        if (!retrySession.session) {
          console.error("[Onboarding] Session still unavailable after retry");
          // Don't block the user — save to localStorage and complete onboarding
          saveLocalPreferences();
          toast.success("Preferences saved! Welcome to Musick.");
          onComplete();
          return;
        }
      }

      const currentUserId = sessionData.session?.user?.id || user.id;

      // 2. Store preferences in Supabase
      const payload = selectedArtists.map((a) => ({
        user_id: currentUserId,
        artist_name: a.name,
        genre: a.genre,
        language: a.language,
      }));

      console.log("========== ONBOARDING DEBUG ==========");
      console.log("AUTH USER ID:", currentUserId);
      console.log("SESSION USER ID:", sessionData.session?.user?.id);
      console.log("PAYLOAD:", payload);
      console.log("======================================");

      const { error } = await supabase.from("user_artist_preferences").insert(payload);
      if (error) {
        console.error("SUPABASE INSERT ERROR:", error);
        // Don't block UX on DB errors — preferences are still saved locally
        if (error.code !== '23505') { // ignore duplicate key errors
          toast.error(`Sync issue: ${error.message}. Saved locally instead.`);
        }
      }

      // 3. Always save locally regardless of Supabase result
      saveLocalPreferences();

      toast.success("Preferences saved! Welcome to Musick.");
      onComplete();
    } catch (err: any) {
      console.error("[Onboarding] Unexpected error:", err);
      // Fallback: save locally and continue
      saveLocalPreferences();
      toast.success("Preferences saved locally! Welcome to Musick.");
      onComplete();
    } finally {
      setSubmitting(false);
    }
  };

  const saveLocalPreferences = () => {
    const topGenre = Object.entries(preferenceScores)
      .filter(([key]) => ["Bollywood", "Punjabi", "Urdu Rap", "Hip-Hop", "Indie", "Pop"].includes(key))
      .sort((a, b) => b[1] - a[1])[0]?.[0] || "Bollywood";

    const topLang = Object.entries(preferenceScores)
      .filter(([key]) => ["Hindi", "Punjabi", "Urdu", "English"].includes(key))
      .sort((a, b) => b[1] - a[1])[0]?.[0] || "Hindi";

    localStorage.setItem("musick-pref-genre", topGenre);
    localStorage.setItem("musick-pref-lang", topLang);
    localStorage.setItem(
      "musick-pref-artists",
      selectedArtists.map((a) => a.name).join(",")
    );
  };

  const displayList = query ? searchResults : visibleArtists;

  return (
    <div className="fixed inset-0 z-[1000] flex flex-col h-screen w-screen bg-[#050505] overflow-y-auto px-5 py-6 md:px-12 md:py-10">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent/5 filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#8BCFC6]/5 filter blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-6xl mx-auto mb-8 z-10">
        <div className="flex items-center gap-3">
          <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="22" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>
            <circle cx="24" cy="24" r="4" fill="var(--accent)"/>
          </svg>
          <span className="font-bold tracking-[0.18em] text-white uppercase text-sm font-outfit">
            MUSICK
          </span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-xs font-semibold text-white/50 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-xl"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>

      {/* Hero content */}
      <div className="flex-1 w-full max-w-3xl mx-auto flex flex-col items-center justify-center text-center z-10 gap-4 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide bg-accent/10 text-accent border border-accent/20">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          Customize Your Sound
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight font-outfit">
          Choose Your Vibe
        </h1>
        <p className="text-sm md:text-base text-white/40 max-w-md leading-relaxed">
          Select at least <span className="text-white font-semibold">5 artists</span> to build your personalized taste profile. We will tailor recommendations instantly.
        </p>

        {/* Search bar */}
        <div className="w-full max-w-md relative mt-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search artists..."
            value={query}
            onChange={handleQueryChange}
            className="w-full pl-11 pr-10 py-3 bg-white/5 hover:bg-white/8 focus:bg-white/8 text-white rounded-2xl outline-none border border-white/8 focus:border-accent/40 transition-all text-sm"
          />
          {searching && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent animate-spin" />
          )}
        </div>
      </div>

      {/* Selection Progress Float */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#121212]/90 backdrop-blur-md px-6 py-3.5 rounded-full border border-white/10 shadow-2xl flex items-center gap-6 min-w-[280px] justify-between max-w-[90vw]">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
            Selected Artists
          </span>
          <span className="text-sm font-extrabold text-white">
            {selectedArtists.length} / 5
          </span>
        </div>
        <button
          onClick={handleSubmit}
          disabled={selectedArtists.length < 5 || submitting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-black disabled:bg-white/10 disabled:text-white/30 transition-all font-inter"
          style={{
            background: selectedArtists.length >= 5 ? "var(--accent)" : "rgba(255,255,255,0.06)",
            boxShadow: selectedArtists.length >= 5 ? "0 0 16px var(--accent-glow)" : "none",
          }}
        >
          {submitting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              Continue
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      {/* Artist circular grid */}
      <div className="w-full max-w-5xl mx-auto z-10 pb-24">
        <motion.div
          layout
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6 md:gap-8 justify-items-center"
        >
          <AnimatePresence mode="popLayout">
            {displayList.map((artist) => {
              const isSelected = selectedArtists.some((a) => a.name === artist.name);
              return (
                <motion.div
                  layout
                  key={artist.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                  className="flex flex-col items-center gap-3 cursor-pointer group"
                  onClick={() => toggleSelectArtist(artist)}
                >
                  {/* Photo container */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden flex-shrink-0 transition-transform">
                    {/* Ring overlay when selected */}
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 transition-all duration-300"
                      style={{
                        borderColor: isSelected ? "var(--accent)" : "transparent",
                        boxShadow: isSelected ? "inset 0 0 12px rgba(var(--accent-rgb),0.4), 0 0 16px var(--accent-glow)" : "none",
                        zIndex: 2,
                      }}
                      animate={{ scale: isSelected ? 1.04 : 1 }}
                    />

                    {/* Image */}
                    <img
                      src={artist.image}
                      alt={artist.name}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          artist.name
                        )}&background=0D8ABC&color=fff`;
                      }}
                      className="w-full h-full object-cover select-none transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Checkmark overlay */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.7 }}
                          className="absolute inset-0 bg-black/40 flex items-center justify-center z-10"
                        >
                          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-black shadow-lg">
                            <Check className="w-5 h-5" strokeWidth={3} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Name */}
                  <span className="text-xs font-semibold text-center text-white/70 group-hover:text-white transition-colors truncate max-w-full px-1">
                    {artist.name}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {displayList.length === 0 && (
          <div className="text-center text-white/30 text-sm py-12">
            No artists found. Try a different search.
          </div>
        )}
      </div>
    </div>
  );
};
