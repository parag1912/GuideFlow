import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import { createLocalStorageAdapter } from "./persistence/localStorage";
import { createStore, type Store } from "./store/store";
import type {
  OnboardingActions,
  OnboardingConfig,
  OnboardingState,
  PersistenceAdapter,
} from "./types";

interface ContextValue {
  store: Store;
  adapter: PersistenceAdapter;
  config: Required<Pick<OnboardingConfig, "tooltipWidth" | "autoLaunchDelay">> &
    OnboardingConfig;
}

const OnboardingContext = createContext<ContextValue | null>(null);

export function useOnboardingContext(): ContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error(
      "react-guided-journey: components must be rendered inside <OnboardingProvider>.",
    );
  }
  return ctx;
}

/** Subscribe to a slice of store state. */
export function useStoreSelector<T>(
  selector: (state: OnboardingState & OnboardingActions) => T,
): T {
  const { store } = useOnboardingContext();
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
    () => selector(store.getState()),
  );
}

/** Access the full store state + actions. */
export function useStore(): OnboardingState & OnboardingActions {
  return useStoreSelector((s) => s);
}

export const OnboardingContextProvider = OnboardingContext.Provider;

/**
 * Build the context value once per provider lifetime. Re-creating the store on
 * every render would drop state, so it lives in a ref keyed by user id.
 */
export function useBuildContextValue(config: OnboardingConfig): ContextValue {
  const tourMapRef = useRef<Map<string, OnboardingConfig["tours"][number]>>(
    new Map(),
  );
  tourMapRef.current = new Map(config.tours.map((t) => [t.id, t]));

  // Persistence + callbacks are stable for the store's lifetime; we read the
  // latest config through refs so callbacks always see current props.
  const configRef = useRef(config);
  configRef.current = config;

  const storeRef = useRef<Store | null>(null);
  const adapterRef = useRef<PersistenceAdapter | null>(null);
  const keyRef = useRef<string | number | undefined>(config.userId);

  if (!storeRef.current || keyRef.current !== config.userId) {
    keyRef.current = config.userId;
    adapterRef.current =
      config.persistence ?? createLocalStorageAdapter(config.userId);
    storeRef.current = createStore({
      adapter: adapterRef.current,
      getTour: (id) => tourMapRef.current.get(id),
      callbacks: {
        onTourStart: (id) => configRef.current.callbacks?.onTourStart?.(id),
        onTourComplete: (id) =>
          configRef.current.callbacks?.onTourComplete?.(id),
        onTourSkip: (id, i) => configRef.current.callbacks?.onTourSkip?.(id, i),
        onStepChange: (id, i, step) =>
          configRef.current.callbacks?.onStepChange?.(id, i, step),
        onStepComplete: (id) =>
          configRef.current.callbacks?.onStepComplete?.(id),
        onChecklistComplete: () =>
          configRef.current.callbacks?.onChecklistComplete?.(),
      },
    });
  }

  return useMemo(
    () => ({
      store: storeRef.current as Store,
      adapter: adapterRef.current as PersistenceAdapter,
      config: {
        ...config,
        tooltipWidth: config.tooltipWidth ?? 320,
        autoLaunchDelay: config.autoLaunchDelay ?? 600,
      },
    }),
    [config],
  );
}
