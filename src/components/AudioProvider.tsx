import { useEffect, useRef } from "react";
import { audioEngine } from "../lib/audioEngine";
import { usePlayerStore } from "../store/usePlayerStore";
import { useRecentlyPlayed } from "../hooks/useRecentlyPlayed";

/**
 * AudioProvider — bridges the singleton AudioEngine with the Zustand player store.
 *
 * Mount this component ABOVE <BrowserRouter> so it never unmounts during
 * route navigation. It contains no UI — just wiring logic.
 *
 * Responsibilities:
 * 1. When `currentSong` changes (by videoId) → load new stream
 * 2. When `isPlaying` changes → play/pause
 * 3. When `volume` changes → update engine volume
 * 4. Forward engine events → Zustand store (currentTime, duration, etc.)
 */
export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logPlay } = useRecentlyPlayed();

  // ── CRITICAL FIX: stabilize logPlay reference ──
  // logPlay is a new function every render (not memoized in useRecentlyPlayed).
  // If used directly in a useEffect dependency array, the effect re-runs on
  // every render, which tears down + recreates the Zustand subscription,
  // causing the "initial state" block to re-fire → duplicate stream request.
  const logPlayRef = useRef(logPlay);
  logPlayRef.current = logPlay;

  // We use refs for store actions to avoid stale closures in callbacks.
  // The callbacks are registered once on mount and must always call fresh actions.
  const storeRef = useRef(usePlayerStore.getState());

  useEffect(() => {
    // Subscribe to Zustand store to keep ref current
    const unsub = usePlayerStore.subscribe((state) => {
      storeRef.current = state;
    });
    return unsub;
  }, []);

  // ── Wire AudioEngine callbacks → Zustand store (runs once on mount) ──
  useEffect(() => {
    audioEngine.setCallbacks({
      onTimeUpdate: (time) => {
        storeRef.current.setCurrentTime(time);
      },
      onDurationChange: (dur) => {
        storeRef.current.setDuration(dur);
      },
      onCanPlay: () => {
        // If the store says we should be playing, start playback
        if (storeRef.current.isPlaying) {
          audioEngine.play();
        }
      },
      onEnded: () => {
        storeRef.current.playNext();
      },
      onError: (errorMsg) => {
        console.error("[AudioProvider] audio error:", errorMsg);
        // Auto-skip to next song after error
        setTimeout(() => {
          storeRef.current.playNext();
        }, 3000);
      },
      onPlay: () => {
        // Sync store if audio started playing externally
        if (!storeRef.current.isPlaying) {
          storeRef.current.setIsPlaying(true);
        }
      },
      onPause: () => {
        // Sync store if audio paused externally
        if (storeRef.current.isPlaying) {
          storeRef.current.setIsPlaying(false);
        }
      },
    });

    // Set initial volume
    audioEngine.setVolume(usePlayerStore.getState().volume);

    return () => {
      audioEngine.setCallbacks({});
    };
  }, []);

  // ── React to currentSong changes ──
  // Use a ref to track the previously loaded videoId so we only fire
  // a new stream request when the videoId actually changes.
  const loadedVideoIdRef = useRef<string | null>(null);

  useEffect(() => {
    console.log("[STREAM TRIGGER] AudioProvider song-subscription effect MOUNTED");

    const unsub = usePlayerStore.subscribe(
      (state) => {
        const song = state.currentSong;

        if (!song) {
          if (loadedVideoIdRef.current !== null) {
            audioEngine.unload();
            loadedVideoIdRef.current = null;
          }
          return;
        }

        // Only load if videoId actually changed
        if (song.videoId !== loadedVideoIdRef.current) {
          console.log(`[STREAM TRIGGER] Zustand subscription fired — new videoId: ${song.videoId}, prev: ${loadedVideoIdRef.current}`);
          console.trace("[STREAM TRIGGER] call stack");
          const streamUrl = `/api/stream/${song.videoId}`;
          loadedVideoIdRef.current = song.videoId;
          audioEngine.load(song.videoId, streamUrl);

          // Log recently played (use ref to avoid stale closure)
          logPlayRef.current(song);
        }
      }
    );
    
    // Handle initial state (if a song is already set before this mounts)
    const initialState = usePlayerStore.getState();
    if (initialState.currentSong && initialState.currentSong.videoId !== loadedVideoIdRef.current) {
      console.log(`[STREAM TRIGGER] Initial state load — videoId: ${initialState.currentSong.videoId}, prev: ${loadedVideoIdRef.current}`);
      console.trace("[STREAM TRIGGER] initial state call stack");
      const streamUrl = `/api/stream/${initialState.currentSong.videoId}`;
      loadedVideoIdRef.current = initialState.currentSong.videoId;
      audioEngine.load(initialState.currentSong.videoId, streamUrl);
      logPlayRef.current(initialState.currentSong);
    }

    return () => {
      console.log("[STREAM TRIGGER] AudioProvider song-subscription effect CLEANUP — unsub + resetting loadedVideoIdRef");
      unsub();
      // NOTE: Do NOT reset loadedVideoIdRef here — that would cause
      // the re-mounted effect to think no song is loaded and re-fire.
    };
  }, []); // ← FIXED: no dependencies. logPlay accessed via ref.

  // ── React to isPlaying changes ──
  useEffect(() => {
    const unsub = usePlayerStore.subscribe(
      (state) => {
        if (!state.currentSong) return;

        if (state.isPlaying) {
          // Only call play if we have data ready, otherwise onCanPlay handles it
          if (audioEngine.getReadyState() >= 3) {
            audioEngine.play();
          }
        } else {
          audioEngine.pause();
        }
      }
    );
    return unsub;
  }, []);

  // ── React to volume changes ──
  useEffect(() => {
    const unsub = usePlayerStore.subscribe(
      (state) => {
        audioEngine.setVolume(state.volume);
      }
    );
    return unsub;
  }, []);

  // No UI — just renders children
  return <>{children}</>;
};
