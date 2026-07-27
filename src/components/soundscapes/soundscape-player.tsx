"use client";

import { AlertCircle, MapPin, Pause, Play, Volume2, Waves } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Badge, Button, Select } from "@/components/ui";

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
  const [hasAudioError, setHasAudioError] = useState(false);
  const [volume, setVolume] = useState(0.6);
  const audioRef = useRef<HTMLAudioElement>(null);

  const selected = useMemo(
    () => soundscapes.find((soundscape) => soundscape.id === selectedId) ?? soundscapes[0],
    [selectedId, soundscapes]
  );

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
  }, [volume, selectedId]);

  async function togglePlayback() {
    if (!audioRef.current) return;

    if (audioRef.current.paused) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        setHasAudioError(false);
      } catch {
        setIsPlaying(false);
        setHasAudioError(true);
      }
      return;
    }

    audioRef.current.pause();
    setIsPlaying(false);
  }

  function updateVolume(nextVolume: number) {
    setVolume(nextVolume);
  }

  if (!selected) {
    return (
      <div className="rounded-[28px] bg-surface-elevated/90 p-8 text-center shadow-panel">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-info-soft text-info">
          <Waves aria-hidden="true" size={24} />
        </div>
        <h2 className="mt-4 text-section-title text-content">No soundscapes active</h2>
        <p className="mt-2 text-sm text-content-muted">Add active city ambience samples in seed data.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <section className="overflow-hidden rounded-[28px] bg-surface-inverse text-content-inverse shadow-panel">
        <div className="p-5 md:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-brand-soft">Street Soundscape</p>
              <h2 className="mt-1 text-section-title">{selected.title}</h2>
              <p className="mt-2 inline-flex items-center gap-1 text-sm text-stone-300">
                <MapPin aria-hidden="true" size={15} />
                {selected.city.name}
              </p>
            </div>
            <Button className="bg-white text-content hover:bg-brand-soft" onClick={togglePlayback} type="button">
              {isPlaying ? <Pause aria-hidden="true" size={17} /> : <Play aria-hidden="true" size={17} />}
              {isPlaying ? "Pause" : "Play"}
            </Button>
          </div>

          <div className="mt-8 flex h-28 items-end gap-2 rounded-app bg-white/10 p-4" aria-hidden="true">
            {Array.from({ length: 28 }).map((_, index) => (
              <span
                className={`w-full rounded-full bg-brand-soft transition ${
                  isPlaying ? "animate-pulse" : "opacity-45"
                }`}
                key={index}
                style={{ height: `${22 + ((index * 17) % 72)}%`, animationDelay: `${index * 35}ms` }}
              />
            ))}
          </div>

          <div className="mt-5 grid gap-3">
            <Select
              className="border-white/20 bg-white/10 text-white"
              onChange={(event) => {
                audioRef.current?.pause();
                setSelectedId(event.target.value);
                setIsPlaying(false);
                setHasAudioError(false);
              }}
              value={selected.id}
            >
              {soundscapes.map((soundscape) => (
                <option className="text-content" key={soundscape.id} value={soundscape.id}>
                  {soundscape.city.name} - {soundscape.title}
                </option>
              ))}
            </Select>

            <label className="grid gap-2 text-sm">
              <span className="flex items-center justify-between gap-3 text-stone-200">
                <span className="inline-flex items-center gap-2">
                  <Volume2 aria-hidden="true" size={17} />
                  Volume
                </span>
                <span>{Math.round(volume * 100)}%</span>
              </span>
              <input
                className="accent-[#4f9b66]"
                max={1}
                min={0}
                onChange={(event) => updateVolume(Number(event.target.value))}
                step={0.05}
                type="range"
                value={volume}
              />
            </label>
          </div>

          {hasAudioError ? (
            <div className="mt-4 flex items-start gap-2 rounded-app bg-danger-soft p-3 text-sm text-danger">
              <AlertCircle aria-hidden="true" className="mt-0.5 shrink-0" size={16} />
              This audio source could not be played. Check the sample URL or replace it with a licensed file.
            </div>
          ) : null}

          <audio
            onEnded={() => setIsPlaying(false)}
            onError={() => {
              setIsPlaying(false);
              setHasAudioError(true);
            }}
            ref={audioRef}
            src={selected.audioUrl}
          />
        </div>
      </section>

      <aside className="rounded-[28px] bg-surface-elevated/92 p-5 shadow-panel">
        <p className="text-sm font-semibold uppercase text-brand-strong">Available cities</p>
        <div className="mt-4 space-y-2">
          {soundscapes.map((soundscape) => (
            <button
              className={`w-full rounded-app border px-3 py-3 text-left text-sm transition ${
                soundscape.id === selected.id
                  ? "border-brand bg-brand-soft text-brand-strong"
                  : "border-line bg-surface-elevated text-content-muted hover:border-brand"
              }`}
              key={soundscape.id}
              onClick={() => {
                audioRef.current?.pause();
                setSelectedId(soundscape.id);
                setIsPlaying(false);
                setHasAudioError(false);
              }}
              type="button"
            >
              <span className="block font-bold">{soundscape.city.name}</span>
              <span className="mt-1 block">{soundscape.title}</span>
            </button>
          ))}
        </div>
        <div className="mt-5 rounded-app bg-surface-muted p-4">
          <Badge variant="info">Attribution</Badge>
          <p className="mt-3 text-xs leading-5 text-content-muted">{selected.attribution}</p>
        </div>
      </aside>
    </div>
  );
}
