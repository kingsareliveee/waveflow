/**
 * AudioEngine — Singleton audio playback module.
 *
 * Creates exactly ONE HTMLAudioElement at module load time.
 * This element lives outside React's component tree, so it is
 * never unmounted/remounted during route navigation.
 *
 * All playback control flows through this module.
 */

export interface AudioEngineCallbacks {
  onTimeUpdate?: (currentTime: number) => void;
  onDurationChange?: (duration: number) => void;
  onCanPlay?: () => void;
  onLoadStart?: () => void;
  onEnded?: () => void;
  onError?: (error: string) => void;
  onPlay?: () => void;
  onPause?: () => void;
}

class AudioEngineClass {
  private audio: HTMLAudioElement;
  private callbacks: AudioEngineCallbacks = {};
  private currentVideoId: string | null = null;

  constructor() {
    this.audio = new Audio();
    this.audio.preload = "auto";

    // Wire up native audio events → callbacks
    this.audio.addEventListener("timeupdate", () => {
      this.callbacks.onTimeUpdate?.(this.audio.currentTime);
    });

    this.audio.addEventListener("durationchange", () => {
      if (this.audio.duration && isFinite(this.audio.duration)) {
        this.callbacks.onDurationChange?.(this.audio.duration);
      }
    });

    this.audio.addEventListener("canplay", () => {
      this.callbacks.onCanPlay?.();
    });

    this.audio.addEventListener("loadstart", () => {
      this.callbacks.onLoadStart?.();
    });

    this.audio.addEventListener("ended", () => {
      this.callbacks.onEnded?.();
    });

    this.audio.addEventListener("error", () => {
      const mediaError = this.audio.error;
      const message = mediaError
        ? `MediaError code ${mediaError.code}: ${mediaError.message || "Unknown error"}`
        : "Unknown audio error";
      this.callbacks.onError?.(message);
    });

    this.audio.addEventListener("play", () => {
      this.callbacks.onPlay?.();
    });

    this.audio.addEventListener("pause", () => {
      this.callbacks.onPause?.();
    });

    console.log("[AudioEngine] element created — this should appear exactly once");
  }

  /**
   * Register callbacks. Call once from AudioProvider on mount.
   */
  setCallbacks(cb: AudioEngineCallbacks) {
    this.callbacks = cb;
  }

  /**
   * Load a new stream URL for the given videoId.
   * Skips if the same videoId is already loaded (prevents duplicate stream requests).
   */
  load(videoId: string, streamUrl: string) {
    if (this.currentVideoId === videoId) {
      console.log(`[AudioEngine] skip load — already loaded videoId=${videoId}`);
      return;
    }

    console.log(`[STREAM TRIGGER] audioEngine.load() — videoId=${videoId}, prev=${this.currentVideoId}`);
    console.trace("[STREAM TRIGGER] audioEngine.load call stack");
    this.currentVideoId = videoId;
    console.log(`[PLAYER] audio.src changed`);
    this.audio.src = streamUrl;
    console.log(`[PLAYER] audio.load called`);
    this.audio.load();
  }

  /**
   * Start playback. Returns a promise that resolves when playback starts.
   */
  async play(): Promise<void> {
    console.log(`[PLAYER] play() called`);
    try {
      await this.audio.play();
    } catch (err: any) {
      // AbortError is normal (e.g. play interrupted by new load)
      if (err.name !== "AbortError") {
        console.error("[AudioEngine] play error:", err);
        this.callbacks.onError?.(`Playback failed: ${err.message}`);
      }
    }
  }

  /**
   * Pause playback.
   */
  pause() {
    console.log(`[PLAYER] pause() called`);
    this.audio.pause();
  }

  /**
   * Seek to a specific time in seconds.
   */
  seek(time: number) {
    if (isFinite(time) && time >= 0) {
      console.log(`[SEEK] oldTime=${this.audio.currentTime} newTime=${time} duration=${this.audio.duration}`);
      this.audio.currentTime = time;
    }
  }

  /**
   * Set volume (0 to 1).
   */
  setVolume(volume: number) {
    this.audio.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Get the currently loaded videoId.
   */
  getCurrentVideoId(): string | null {
    return this.currentVideoId;
  }

  /**
   * Get the current time of the audio element.
   */
  getCurrentTime(): number {
    return this.audio.currentTime;
  }

  /**
   * Check if the audio is currently seeking.
   */
  isSeeking(): boolean {
    return this.audio.seeking;
  }

  /**
   * Get the duration of the audio element.
   */
  getDuration(): number {
    return this.audio.duration || 0;
  }

  /**
   * Get the ready state of the audio element.
   */
  getReadyState(): number {
    return this.audio.readyState;
  }

  /**
   * Unload current source.
   */
  unload() {
    this.audio.pause();
    console.log(`[PLAYER] audio.unload called — removing src (was=${this.currentVideoId})`);
    this.audio.removeAttribute("src");
    console.log(`[PLAYER] audio.load called (reset after unload)`);
    this.audio.load(); // reset the element
    this.currentVideoId = null;
  }

  /**
   * Full cleanup — only call on app shutdown (practically never).
   */
  destroy() {
    this.unload();
    this.callbacks = {};
  }
}

// ── Module-level singleton ──
// Created once when this module is first imported.
// Survives all React re-renders and route navigations.
export const audioEngine = new AudioEngineClass();
