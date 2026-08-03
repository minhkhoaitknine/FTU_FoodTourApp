"use client";

import { AlertCircle, ChevronDown, ChevronUp, Music2, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type BackgroundTrack = {
  fileName: string;
  title: string;
  url: string;
  mimeType: string;
};

type MusicState = {
  enabled: boolean;
  isCollapsed: boolean;
  volume: number;
  trackIndex: number;
};

const STORAGE_KEY = "foodtour-background-music";
const DEFAULT_VOLUME = 0.45;

export function BackgroundMusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const hasHydratedRef = useRef(false);
  const failedTracksRef = useRef(new Set<string>());
  const [tracks, setTracks] = useState<BackgroundTrack[]>([]);
  const [trackIndex, setTrackIndex] = useState(0);
  const [enabled, setEnabled] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const [isPlaying, setIsPlaying] = useState(false);
  const [needsGesture, setNeedsGesture] = useState(false);
  const [message, setMessage] = useState("");

  const currentTrack = tracks[trackIndex] ?? null;
  const statusLabel = useMemo(() => {
    if (message) return message;
    if (!enabled) return "Muted";
    if (needsGesture) return "Tap to start";
    return isPlaying ? "Playing" : "Ready";
  }, [enabled, isPlaying, message, needsGesture]);

  const tryPlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    try {
      await audio.play();
      setIsPlaying(true);
      setNeedsGesture(false);
      setMessage("");
    } catch {
      setIsPlaying(false);
      setNeedsGesture(true);
      setMessage("");
    }
  }, [currentTrack]);

  const moveToNextTrack = useCallback(() => {
    if (tracks.length === 0) return;
    failedTracksRef.current.clear();
    setMessage("");
    setTrackIndex((current) => (current + 1) % tracks.length);
  }, [tracks.length]);

  const moveToPreviousTrack = useCallback(() => {
    if (tracks.length === 0) return;
    failedTracksRef.current.clear();
    setMessage("");
    setTrackIndex((current) => (current - 1 + tracks.length) % tracks.length);
  }, [tracks.length]);

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => {
      const stored = readStoredState();
      if (stored) {
        setEnabled(stored.enabled);
        setIsCollapsed(stored.isCollapsed);
        setVolume(stored.volume);
        setTrackIndex(stored.trackIndex);
      }
      hasHydratedRef.current = true;
    }, 0);

    return () => window.clearTimeout(hydrationTimer);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadTracks() {
      try {
        const response = await fetch("/api/background-music", { cache: "no-store" });
        const payload = (await response.json()) as {
          ok?: boolean;
          tracks?: BackgroundTrack[];
        };

        if (!isMounted) return;
        const nextTracks = payload.ok && Array.isArray(payload.tracks) ? payload.tracks : [];
        setTracks(nextTracks);
        setTrackIndex((current) => (nextTracks.length > 0 ? current % nextTracks.length : 0));
        setMessage(nextTracks.length > 0 ? "" : "No music files");
      } catch {
        if (isMounted) setMessage("Music unavailable");
      }
    }

    void loadTracks();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (!hasHydratedRef.current) return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        enabled,
        isCollapsed,
        volume,
        trackIndex
      } satisfies MusicState)
    );
  }, [enabled, isCollapsed, trackIndex, volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (!enabled) {
      audio.pause();
      return;
    }

    const playTimer = window.setTimeout(() => {
      void tryPlay();
    }, 0);

    return () => window.clearTimeout(playTimer);
  }, [currentTrack, enabled, tryPlay]);

  useEffect(() => {
    if (!enabled || !needsGesture) return;

    function resumeAfterGesture() {
      void tryPlay();
    }

    window.addEventListener("pointerdown", resumeAfterGesture);
    window.addEventListener("keydown", resumeAfterGesture);
    return () => {
      window.removeEventListener("pointerdown", resumeAfterGesture);
      window.removeEventListener("keydown", resumeAfterGesture);
    };
  }, [enabled, needsGesture, tryPlay]);

  async function toggleEnabled() {
    const nextEnabled = !enabled;
    setEnabled(nextEnabled);
    setMessage("");

    if (!nextEnabled) {
      audioRef.current?.pause();
      setIsPlaying(false);
      setNeedsGesture(false);
      return;
    }

    await tryPlay();
  }

  function updateVolume(nextVolume: number) {
    setVolume(nextVolume);
    if (nextVolume > 0 && !enabled) setEnabled(true);
  }

  function selectTrack(nextIndex: number) {
    failedTracksRef.current.clear();
    setMessage("");
    setTrackIndex(nextIndex);
  }

  function handleTrackEnded() {
    failedTracksRef.current.clear();
    moveToNextTrack();
  }

  function handleTrackError() {
    if (!currentTrack || tracks.length === 0) return;

    failedTracksRef.current.add(currentTrack.fileName);
    if (failedTracksRef.current.size >= tracks.length) {
      setIsPlaying(false);
      setNeedsGesture(false);
      setMessage("No playable tracks");
      return;
    }

    setMessage("Skipped broken track");
    moveToNextTrack();
  }

  return (
    <section
      aria-label="Background music player"
      className={`fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] left-3 z-toast rounded-[22px] border border-white/65 bg-surface-elevated/[0.65] p-3 text-content shadow-overlay backdrop-blur-xl transition-[width] duration-normal ease-app lg:bottom-5 lg:left-5 ${
        isCollapsed ? "w-[min(13.5rem,calc(100vw-1.5rem))]" : "w-[min(18.5rem,calc(100vw-1.5rem))]"
      }`}
    >
      <div className="flex items-center gap-3">
        <button
          aria-label={enabled ? "Turn background music off" : "Turn background music on"}
          className={`grid size-11 shrink-0 place-items-center rounded-app transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-success/20 ${
            enabled
              ? "bg-brand text-content-inverse hover:bg-brand-strong"
              : "bg-surface-muted text-content-muted hover:text-content"
          }`}
          onClick={toggleEnabled}
          type="button"
        >
          {enabled ? <Volume2 aria-hidden="true" size={20} /> : <VolumeX aria-hidden="true" size={20} />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {message ? (
              <AlertCircle aria-hidden="true" className="shrink-0 text-warning" size={14} />
            ) : (
              <Music2 aria-hidden="true" className="shrink-0 text-brand-strong" size={14} />
            )}
            <p className="truncate text-sm font-bold">{currentTrack?.title ?? "Tastetrail music"}</p>
          </div>
          <p className="mt-0.5 text-xs font-semibold text-content-muted">{statusLabel}</p>
        </div>

        <button
          aria-label={isCollapsed ? "Expand music controls" : "Collapse music controls"}
          className="grid size-9 shrink-0 place-items-center rounded-app-sm bg-surface-muted text-content-muted transition hover:text-content focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-success/20"
          onClick={() => setIsCollapsed((value) => !value)}
          title={isCollapsed ? "Expand" : "Collapse"}
          type="button"
        >
          {isCollapsed ? <ChevronUp aria-hidden="true" size={18} /> : <ChevronDown aria-hidden="true" size={18} />}
        </button>
      </div>

      {!isCollapsed ? (
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-[2.75rem_1fr_2.75rem] gap-2">
            <button
              aria-label="Previous background music track"
              className="grid min-h-10 place-items-center rounded-app bg-surface-muted text-content-muted transition hover:text-content disabled:opacity-40"
              disabled={tracks.length <= 1}
              onClick={moveToPreviousTrack}
              type="button"
            >
              <SkipBack aria-hidden="true" size={17} />
            </button>
            <select
              aria-label="Choose background music track"
              className="min-h-10 rounded-app border border-line bg-surface-elevated px-3 text-xs font-semibold text-content shadow-sm focus:border-brand focus:outline-none focus:ring-4 focus:ring-success/20"
              disabled={tracks.length === 0}
              onChange={(event) => selectTrack(Number(event.target.value))}
              value={trackIndex}
            >
              {tracks.length > 0 ? (
                tracks.map((track, index) => (
                  <option key={track.fileName} value={index}>
                    {track.title}
                  </option>
                ))
              ) : (
                <option value={0}>No tracks</option>
              )}
            </select>
            <button
              aria-label="Next background music track"
              className="grid min-h-10 place-items-center rounded-app bg-surface-muted text-content-muted transition hover:text-content disabled:opacity-40"
              disabled={tracks.length <= 1}
              onClick={moveToNextTrack}
              type="button"
            >
              <SkipForward aria-hidden="true" size={17} />
            </button>
          </div>

          <label className="grid gap-1.5 text-xs font-semibold text-content-muted">
            <span className="flex items-center justify-between">
              <span>Volume</span>
              <span>{Math.round(volume * 100)}%</span>
            </span>
            <input
              aria-label="Background music volume"
              className="h-2 accent-brand"
              max={1}
              min={0}
              onChange={(event) => updateVolume(Number(event.target.value))}
              step={0.05}
              type="range"
              value={volume}
            />
          </label>
        </div>
      ) : null}

      <audio
        onEnded={handleTrackEnded}
        onError={handleTrackError}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        preload="auto"
        ref={audioRef}
        src={currentTrack?.url}
      />
    </section>
  );
}

function readStoredState() {
  if (typeof window === "undefined") return null;

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (!rawValue) return null;
    const parsed = JSON.parse(rawValue) as Partial<MusicState>;

    return {
      enabled: typeof parsed.enabled === "boolean" ? parsed.enabled : true,
      isCollapsed: typeof parsed.isCollapsed === "boolean" ? parsed.isCollapsed : false,
      volume: clampVolume(parsed.volume),
      trackIndex: Number.isInteger(parsed.trackIndex) && parsed.trackIndex !== undefined ? parsed.trackIndex : 0
    } satisfies MusicState;
  } catch {
    return null;
  }
}

function clampVolume(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) return DEFAULT_VOLUME;
  return Math.min(1, Math.max(0, value));
}
