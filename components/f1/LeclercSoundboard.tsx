"use client";

import { useEffect, useRef, useState } from "react";

type LeclercSoundboardProps = {
  src: string;
};

export default function LeclercSoundboard({ src }: LeclercSoundboardProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    setError(null);

    if (isPlaying) {
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
      return;
    }

    try {
      audio.currentTime = 0;
      await audio.play();
      setIsPlaying(true);
    } catch {
      setError("Tap again if the browser blocks audio on the first interaction.");
      setIsPlaying(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[#FF9F6A]/28 bg-[radial-gradient(circle_at_top_right,rgba(255,159,106,0.16),transparent_44%),linear-gradient(145deg,#19100E_0%,#090909_100%)] p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#FFB48A]">Audio</p>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlayback}
          className="inline-flex items-center gap-2 rounded-full border border-[#FF9F6A]/35 bg-[#1A0D0B] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white transition-colors hover:border-[#FF9F6A]/55 hover:bg-[#23110E]"
        >
          <span className="material-icons text-base">{isPlaying ? "stop_circle" : "play_circle"}</span>
          {isPlaying ? "Stop audio" : "Play audio"}
        </button>

        <div className="flex items-end gap-1">
          {[14, 22, 18, 28, 16].map((height, index) => (
            <span
              key={height}
              className={`w-1.5 rounded-full bg-[#FFB48A]/80 transition-all duration-300 ${isPlaying ? "animate-pulse" : "opacity-50"}`}
              style={{ height, animationDelay: `${index * 120}ms` }}
            />
          ))}
        </div>
      </div>

      {error ? <p className="mt-3 text-xs text-[#FFD0B5]">Browser blocked it. Tap again.</p> : null}

      <audio ref={audioRef} preload="metadata" src={src} />
    </div>
  );
}
