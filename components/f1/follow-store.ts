"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type FollowEntityType = "race" | "driver" | "team";

export type FollowedEntity = {
  key: string;
  type: FollowEntityType;
  id: string;
  label: string;
  subtitle: string;
  href: string;
  accentColor?: string;
  season?: string;
  updatedAt: number;
};

type FollowPayload = Omit<FollowedEntity, "key" | "updatedAt">;

type FollowStoreState = {
  items: FollowedEntity[];
  hasLoaded: boolean;
  setHasLoaded: (hasLoaded: boolean) => void;
  isFollowed: (type: FollowEntityType, id: string) => boolean;
  toggle: (payload: FollowPayload) => void;
  hydrateLegacy: () => void;
};

const STORAGE_KEY = "arena-follows";
const LEGACY_STORAGE_KEY = "arena-f1-following";

function buildKey(type: FollowEntityType, id: string) {
  return `${type}:${id}`;
}

function sanitizeEntity(value: unknown): FollowedEntity | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<FollowedEntity>;

  if (
    typeof candidate.type !== "string" ||
    typeof candidate.id !== "string" ||
    typeof candidate.label !== "string" ||
    typeof candidate.subtitle !== "string" ||
    typeof candidate.href !== "string"
  ) {
    return null;
  }

  if (candidate.type !== "race" && candidate.type !== "driver" && candidate.type !== "team") {
    return null;
  }

  return {
    key: buildKey(candidate.type, candidate.id),
    type: candidate.type,
    id: candidate.id,
    label: candidate.label,
    subtitle: candidate.subtitle,
    href: candidate.href,
    accentColor: typeof candidate.accentColor === "string" ? candidate.accentColor : undefined,
    season: typeof candidate.season === "string" ? candidate.season : undefined,
    updatedAt: typeof candidate.updatedAt === "number" && Number.isFinite(candidate.updatedAt) ? candidate.updatedAt : Date.now()
  };
}

function parseStoredItems(raw: string | null): FollowedEntity[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => sanitizeEntity(item))
      .filter((item): item is FollowedEntity => item !== null)
      .sort((left, right) => right.updatedAt - left.updatedAt);
  } catch {
    return [];
  }
}

const useFollowStore = create<FollowStoreState>()(
  persist(
    (set, get) => ({
      items: [],
      hasLoaded: false,
      setHasLoaded: (hasLoaded) => set({ hasLoaded }),
      isFollowed: (type, id) => get().items.some((item) => item.key === buildKey(type, id)),
      toggle: (payload) =>
        set((state) => {
          const key = buildKey(payload.type, payload.id);
          const exists = state.items.some((item) => item.key === key);
          const items = exists
            ? state.items.filter((item) => item.key !== key)
            : [
                {
                  ...payload,
                  key,
                  updatedAt: Date.now()
                },
                ...state.items.filter((item) => item.key !== key)
              ].sort((left, right) => right.updatedAt - left.updatedAt);

          return { items };
        }),
      hydrateLegacy: () => {
        if (typeof window === "undefined") {
          return;
        }

        if (window.localStorage.getItem(STORAGE_KEY) !== null) {
          return;
        }

        const legacyItems = parseStoredItems(window.localStorage.getItem(LEGACY_STORAGE_KEY));

        if (legacyItems.length === 0) {
          return;
        }

        window.localStorage.removeItem(LEGACY_STORAGE_KEY);
        set({ items: legacyItems });
      }
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.hydrateLegacy();
        state?.setHasLoaded(true);
      }
    }
  )
);

export function useFollowedEntities() {
  const items = useFollowStore((state) => state.items);
  const hasLoaded = useFollowStore((state) => state.hasLoaded);
  const isFollowed = useFollowStore((state) => state.isFollowed);
  const toggle = useFollowStore((state) => state.toggle);

  useEffect(() => {
    if (useFollowStore.persist.hasHydrated()) {
      useFollowStore.getState().setHasLoaded(true);
    }

    const sync = (event: StorageEvent) => {
      if (event.key && event.key !== STORAGE_KEY && event.key !== LEGACY_STORAGE_KEY) {
        return;
      }

      void useFollowStore.persist.rehydrate();
    };

    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener("storage", sync);
    };
  }, []);

  return {
    items,
    count: items.length,
    hasLoaded,
    isFollowed,
    toggle
  };
}
