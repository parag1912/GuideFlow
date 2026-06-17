import type { PersistedState, PersistenceAdapter } from "../types";

export const DEFAULT_PERSISTED: PersistedState = {
  welcomeSeen: false,
  completedSteps: [],
  seenTours: [],
  dismissedDiscoveries: [],
};

/** Shape of the legacy state some early adopters may have on disk. */
interface LegacyState {
  completedTours?: string[];
  dismissedTours?: string[];
}

function migrate(raw: unknown): PersistedState {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_PERSISTED };
  const obj = raw as Partial<PersistedState> & LegacyState;

  // Merge any legacy completed/dismissed tour lists into `seenTours`.
  const seenTours = Array.isArray(obj.seenTours)
    ? obj.seenTours
    : [...(obj.completedTours ?? []), ...(obj.dismissedTours ?? [])];

  return {
    welcomeSeen: Boolean(obj.welcomeSeen),
    completedSteps: Array.isArray(obj.completedSteps) ? obj.completedSteps : [],
    seenTours: Array.from(new Set(seenTours)),
    dismissedDiscoveries: Array.isArray(obj.dismissedDiscoveries)
      ? obj.dismissedDiscoveries
      : [],
  };
}

/**
 * A localStorage-backed adapter namespaced by user id. Safe in SSR/non-browser
 * environments (no-ops when `localStorage` is unavailable).
 */
export function createLocalStorageAdapter(
  userId: string | number = "anon",
  keyPrefix = "rgj",
): PersistenceAdapter {
  const key = `${keyPrefix}_${userId}`;
  const available =
    typeof window !== "undefined" && typeof window.localStorage !== "undefined";

  return {
    load() {
      if (!available) return null;
      try {
        const raw = window.localStorage.getItem(key);
        return raw ? migrate(JSON.parse(raw)) : null;
      } catch {
        return null;
      }
    },
    save(state) {
      if (!available) return;
      try {
        window.localStorage.setItem(key, JSON.stringify(state));
      } catch {
        // quota / privacy mode — ignore
      }
    },
    clear() {
      if (!available) return;
      try {
        window.localStorage.removeItem(key);
      } catch {
        // ignore
      }
    },
  };
}
