"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "arena-favorite-club";
const CHANGE_EVENT = "arena-favorite-club-change";

function readFavoriteClubId(): number | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return null;
  }

  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function writeFavoriteClubId(value: number | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (value === null) {
    window.localStorage.removeItem(STORAGE_KEY);
  } else {
    window.localStorage.setItem(STORAGE_KEY, String(value));
  }

  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

export function useFavoriteClub() {
  const [favoriteClubId, setFavoriteClubIdState] = useState<number | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    setFavoriteClubIdState(readFavoriteClubId());
    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const sync = () => {
      setFavoriteClubIdState(readFavoriteClubId());
    };

    window.addEventListener("storage", sync);
    window.addEventListener(CHANGE_EVENT, sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(CHANGE_EVENT, sync);
    };
  }, []);

  const setFavoriteClubId = useCallback((value: number | null) => {
    setFavoriteClubIdState(value);
    writeFavoriteClubId(value);
  }, []);

  return {
    favoriteClubId,
    setFavoriteClubId,
    hasLoaded,
  };
}
