import { DEFAULT_PERSISTED } from "../persistence/localStorage";
import type {
  OnboardingActions,
  OnboardingCallbacks,
  OnboardingState,
  PersistedState,
  PersistenceAdapter,
  TourConfig,
} from "../types";

type Listener = () => void;

export interface Store {
  getState: () => OnboardingState & OnboardingActions;
  subscribe: (listener: Listener) => () => void;
}

interface StoreDeps {
  adapter: PersistenceAdapter;
  callbacks: OnboardingCallbacks;
  /** Resolve a tour by id (for firing step/tour lifecycle callbacks). */
  getTour: (id: string) => TourConfig | undefined;
}

const PERSISTED_KEYS: (keyof PersistedState)[] = [
  "welcomeSeen",
  "completedSteps",
  "seenTours",
  "dismissedDiscoveries",
];

function pickPersisted(state: OnboardingState): PersistedState {
  return {
    welcomeSeen: state.welcomeSeen,
    completedSteps: state.completedSteps,
    seenTours: state.seenTours,
    dismissedDiscoveries: state.dismissedDiscoveries,
  };
}

/**
 * A tiny dependency-free store (the same contract zustand exposes) so the
 * library ships with zero runtime dependencies. Consumed via
 * `useSyncExternalStore`.
 */
export function createStore(deps: StoreDeps): Store {
  const { adapter, callbacks, getTour } = deps;
  const listeners = new Set<Listener>();

  let state: OnboardingState & OnboardingActions;

  const emit = () => {
    for (const l of listeners) l();
  };

  const persist = (prev: OnboardingState) => {
    const next = state;
    // Only write when a persisted field actually changed.
    const changed = PERSISTED_KEYS.some((k) => prev[k] !== next[k]);
    if (changed) void adapter.save(pickPersisted(next));
  };

  const set = (
    partial: Partial<OnboardingState>,
    options?: { persist?: boolean },
  ) => {
    const prev = state;
    state = { ...state, ...partial };
    if (options?.persist !== false) persist(prev);
    emit();
  };

  const fireStepChange = (tourId: string | null, index: number) => {
    if (!tourId) return;
    const tour = getTour(tourId);
    const step = tour?.steps[index];
    if (tour && step) callbacks.onStepChange?.(tourId, index, step);
  };

  const initial: OnboardingState = {
    ...DEFAULT_PERSISTED,
    hydrated: false,
    activeTourId: null,
    activeStepIndex: 0,
    tourRunning: false,
    pendingTourId: null,
    checklistOpen: false,
    helpCenterOpen: false,
  };

  const actions: OnboardingActions = {
    hydrate(persisted) {
      set(
        { ...DEFAULT_PERSISTED, ...persisted, hydrated: true },
        { persist: false },
      );
    },

    reset() {
      void adapter.clear?.();
      set({ ...DEFAULT_PERSISTED }, { persist: false });
    },

    markWelcomeSeen() {
      if (state.welcomeSeen) return;
      set({ welcomeSeen: true });
    },

    completeStep(stepId) {
      if (state.completedSteps.includes(stepId)) return;
      set({ completedSteps: [...state.completedSteps, stepId] });
      callbacks.onStepComplete?.(stepId);
    },

    startTour(tourId) {
      set(
        {
          activeTourId: tourId,
          activeStepIndex: 0,
          tourRunning: true,
          pendingTourId: null,
          checklistOpen: false,
          helpCenterOpen: false,
        },
        { persist: false },
      );
      callbacks.onTourStart?.(tourId);
      fireStepChange(tourId, 0);
    },

    endTour(checklistStepId) {
      const tourId = state.activeTourId;
      const seenTours =
        tourId && !state.seenTours.includes(tourId)
          ? [...state.seenTours, tourId]
          : state.seenTours;
      const completedSteps =
        checklistStepId && !state.completedSteps.includes(checklistStepId)
          ? [...state.completedSteps, checklistStepId]
          : state.completedSteps;

      set({
        seenTours,
        completedSteps,
        activeTourId: null,
        activeStepIndex: 0,
        tourRunning: false,
      });
      if (tourId) callbacks.onTourComplete?.(tourId);
      if (checklistStepId) callbacks.onStepComplete?.(checklistStepId);
    },

    nextStep() {
      const next = state.activeStepIndex + 1;
      set({ activeStepIndex: next }, { persist: false });
      fireStepChange(state.activeTourId, next);
    },

    prevStep() {
      const next = Math.max(0, state.activeStepIndex - 1);
      set({ activeStepIndex: next }, { persist: false });
      fireStepChange(state.activeTourId, next);
    },

    goToStep(index) {
      set({ activeStepIndex: Math.max(0, index) }, { persist: false });
      fireStepChange(state.activeTourId, Math.max(0, index));
    },

    dismissTour(tourId) {
      const atStep = state.activeStepIndex;
      const seenTours = state.seenTours.includes(tourId)
        ? state.seenTours
        : [...state.seenTours, tourId];
      set({
        seenTours,
        activeTourId: null,
        activeStepIndex: 0,
        tourRunning: false,
      });
      callbacks.onTourSkip?.(tourId, atStep);
    },

    setPendingTour(tourId) {
      set({ pendingTourId: tourId }, { persist: false });
    },

    toggleChecklist() {
      set({ checklistOpen: !state.checklistOpen }, { persist: false });
    },

    setChecklistOpen(open) {
      set({ checklistOpen: open }, { persist: false });
    },

    dismissDiscovery(discoveryId) {
      if (state.dismissedDiscoveries.includes(discoveryId)) return;
      set({
        dismissedDiscoveries: [...state.dismissedDiscoveries, discoveryId],
      });
    },

    setHelpCenterOpen(open) {
      set({ helpCenterOpen: open }, { persist: false });
    },
  };

  state = { ...initial, ...actions };

  return {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
