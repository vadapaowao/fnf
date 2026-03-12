"use client";

import { useRef } from "react";

type WinnerHypeButtonProps = {
  driver: string;
  className?: string;
};

const MAX_VERSTAPPEN_PATTERN = [440, 440, 440, 440, 554, 659];
const DEFAULT_PATTERN = [392, 440, 494, 587];

function playTone(context: AudioContext, frequency: number, start: number, duration: number) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "square";
  oscillator.frequency.value = frequency;

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.11, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.01);
}

function resolvePattern(driver: string) {
  const normalized = driver.trim().toLowerCase();
  if (normalized.includes("max") && normalized.includes("verstappen")) {
    return MAX_VERSTAPPEN_PATTERN;
  }
  return DEFAULT_PATTERN;
}

function resolveChant(driver: string) {
  const normalized = driver.trim().toLowerCase();
  if (normalized.includes("max") && normalized.includes("verstappen")) {
    return "Do do do do Max Verstappen";
  }
  return `${driver} wins`;
}

export default function WinnerHypeButton({ driver, className }: WinnerHypeButtonProps) {
  const audioContextRef = useRef<AudioContext | null>(null);

  const playWinnerHype = async () => {
    if (typeof window === "undefined") {
      return;
    }

    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) {
      return;
    }

    const context = audioContextRef.current ?? new AudioContextClass();
    audioContextRef.current = context;
    if (context.state === "suspended") {
      await context.resume();
    }

    const pattern = resolvePattern(driver);
    const beat = 0.16;
    const start = context.currentTime + 0.03;
    pattern.forEach((frequency, index) => {
      playTone(context, frequency, start + index * beat, beat * 0.72);
    });

    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(resolveChant(driver));
      utterance.rate = 1;
      utterance.pitch = 1.05;
      utterance.volume = 0.85;
      window.speechSynthesis.cancel();
      window.setTimeout(() => window.speechSynthesis.speak(utterance), Math.round((pattern.length + 0.2) * beat * 1000));
    }
  };

  return (
    <button
      type="button"
      onClick={playWinnerHype}
      className={className ?? ""}
      title="Play winner hype sound"
      aria-label={`Play winner hype for ${driver}`}
    >
      {driver}
    </button>
  );
}
