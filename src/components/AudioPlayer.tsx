"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, Keyboard } from "lucide-react";
import { motion } from "framer-motion";

const tracks = [
  {
    title: "Canción 1",
    src: "/music/track1.mp3",
  },
  {
    title: "Canción 2",
    src: "/music/track2.mp3",
  },
  {
    title: "Canción 3",
    src: "/music/track3.mp3",
  },
  {
    title: "Canción 4",
    src: "/music/track4.mp3",
  },
];

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const currentTrack = tracks[currentTrackIndex];

  // Play / Pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    setIsPlaying((prev) => !prev);
  };

  // Next
  const nextTrack = () => {
    setCurrentTrackIndex((i) => (i + 1) % tracks.length);
  };

  // Previous
  const prevTrack = () => {
    setCurrentTrackIndex((i) => (i - 1 + tracks.length) % tracks.length);
  };

  // Update progress bar
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (!audio.duration) return;
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    audio.addEventListener("timeupdate", updateProgress);
    return () => audio.removeEventListener("timeupdate", updateProgress);
  }, []);

  // Cargar solo cuando cambia la pista (no al pausar/reanudar)
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.load();
  }, [currentTrackIndex]);

  // Reproducir o pausar según el estado y la pista actual
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [currentTrackIndex, isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setCurrentTrackIndex((i) => (i + 1) % tracks.length);
    };

    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, []);

  // Set volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Atajo de teclado: Alt + M (o Ctrl/Cmd + Alt + M) pausa/despausa la música
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!event.altKey) return;
      if (event.code !== "KeyM") return;

      event.preventDefault();
      event.stopPropagation();
      setIsPlaying((prev) => !prev);
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, []);

  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percent = clickX / width;

    audioRef.current.currentTime = percent * audioRef.current.duration;
  };

  return (
    <div className="card w-full max-w-sm bg-base-200 shadow-xl">
      <div className="card-body gap-4">
        {/* Title */}
        <h2 className="text-base font-bold text-base-content justify-center truncate text-center">
          {currentTrack.title}
        </h2>

        {/* Progress bar */}
        <div
          onClick={handleScrub}
          className="w-full bg-base-300 h-2 rounded-full cursor-pointer overflow-hidden"
        >
          <div
            className="bg-primary h-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Volume Control */}
        <motion.div
          className="flex items-center gap-3 w-full"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Volume2 size={20} className="text-base-content" />
          <motion.input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="range range-primary flex-1"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300 }}
          />
        </motion.div>

        {/* Controls */}
        <div className="card-actions justify-center">
          <button onClick={prevTrack} className="btn btn-ghost btn-circle">
            <SkipBack size={22} />
          </button>

          <button onClick={togglePlay} className="btn btn-primary btn-circle">
            {isPlaying ? <Pause size={22} /> : <Play size={22} />}
          </button>

          <button onClick={nextTrack} className="btn btn-ghost btn-circle">
            <SkipForward size={22} />
          </button>
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-base-content/60">
          <span className="inline-flex items-center gap-1">
            <Keyboard size={13} />
            <kbd className="kbd kbd-xs">Alt</kbd>+<kbd className="kbd kbd-xs">N</kbd> Nueva tarea
          </span>
          <span>
            <kbd className="kbd kbd-xs">Alt</kbd>+<kbd className="kbd kbd-xs">M</kbd> Pausa/Play
          </span>
        </div>
      </div>

      {/* Audio element */}
      <audio ref={audioRef}>
        <source src={currentTrack.src} />
      </audio>
    </div>
  );
}
