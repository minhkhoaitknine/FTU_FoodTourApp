"use client";

import { Pause, Play, Volume2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";

type Soundscape = {
  id: string;
  title: string;
  audioUrl: string;
  attribution: string;
  city: {
    name: string;
  };
};

type SoundscapePlayerProps = {
  soundscapes: Soundscape[];
};

export function SoundscapePlayer({ soundscapes }: SoundscapePlayerProps) {
  const [selectedId, setSelectedId] = useState(soundscapes[0]?.id ?? "");
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.6);
  const audioRef = useRef<HTMLAudioElement>(null);

  const selected = useMemo(
    () => soundscapes.find((soundscape) => soundscape.id === selectedId) ?? soundscapes[0],
    [selectedId, soundscapes]
  );

  async function togglePlayback() {
    if (!audioRef.current) return;

    if (audioRef.current.paused) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
      return;
    }

    audioRef.current.pause();
    setIsPlaying(false);
  }

  function updateVolume(nextVolume: number) {
    setVolume(nextVolume);
    if (audioRef.current) audioRef.current.volume = nextVolume;
  }

  if (!selected) {
    return (
      <div className="rounded-[28px] bg-white/90 p-5 shadow-panel">
        <h2 className="text-2xl font-bold">Street Soundscape</h2>
        <p className="mt-2 text-sm text-stone-600">No soundscape samples are active.</p>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] bg-ink p-5 text-white shadow-panel">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-clay-100">Street Soundscape</p>
          <h2 className="mt-1 text-2xl font-bold">{selected.title}</h2>
          <p className="mt-1 text-sm text-stone-300">{selected.city.name}</p>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-ink"
          onClick={togglePlayback}
          type="button"
        >
          {isPlaying ? <Pause size={17} /> : <Play size={17} />}
          {isPlaying ? "Pause" : "Play"}
        </button>
      </div>

      <div className="mt-4 grid gap-3">
        <select
          className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm outline-none"
          onChange={(event) => {
            setSelectedId(event.target.value);
            setIsPlaying(false);
          }}
          value={selected.id}
        >
          {soundscapes.map((soundscape) => (
            <option className="text-ink" key={soundscape.id} value={soundscape.id}>
              {soundscape.city.name} - {soundscape.title}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-3 text-sm">
          <Volume2 size={17} />
          <input
            className="w-full"
            max={1}
            min={0}
            onChange={(event) => updateVolume(Number(event.target.value))}
            step={0.05}
            type="range"
            value={volume}
          />
        </label>
      </div>

      <audio
        onEnded={() => setIsPlaying(false)}
        onError={() => setIsPlaying(false)}
        ref={audioRef}
        src={selected.audioUrl}
      />
      <p className="mt-4 text-xs leading-5 text-stone-300">{selected.attribution}</p>
    </div>
  );
}
