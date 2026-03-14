"use client";

import { useRef, useState } from "react";

export default function LeclercSoundboard() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (playing) {
      audio.pause();
      audio.currentTime = 0;
      setPlaying(false);
      return;
    }

    void audio.play().then(() => {
      setPlaying(true);
    }).catch(() => {
      setPlaying(false);
    });
  };

  return (
    <div className="rounded-2xl border border-[#FF9F6A]/25 bg-[linear-gradient(160deg,#17100E,#090909)] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#FFB48A]">Audio</p>
          <h2 className="mt-2 font-display text-2xl font-black italic text-white">Leclerc clip</h2>
        </div>
        <button
          type="button"
          onClick={toggleAudio}
          className="inline-flex items-center gap-2 rounded-full border border-[#FF9F6A]/35 bg-black/30 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:border-[#FF9F6A]/60"
        >
          <span className="material-icons text-base">{playing ? "stop" : "play_arrow"}</span>
          {playing ? "Stop" : "Play"}
        </button>
      </div>
      <audio
        ref={audioRef}
        src="/audio/leclerc-kid-made-with-Voicemod.mp3"
        onEnded={() => setPlaying(false)}
      />
    </div>
  );
}
