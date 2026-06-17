import { type ReactNode, useEffect, useRef } from "react";
import {
  OnboardingContextProvider,
  useBuildContextValue,
  useOnboardingContext,
  useStore,
} from "../context";
import { usePageTour } from "../hooks/usePageTour";
import { DEFAULT_PERSISTED } from "../persistence/localStorage";
import type { OnboardingConfig } from "../types";
import { Checklist } from "./Checklist";
import { HelpCenter } from "./HelpCenter";
import { TourRenderer } from "./TourRenderer";
import { WelcomeModal } from "./WelcomeModal";

interface ProviderProps {
  config: OnboardingConfig;
  children: ReactNode;
  /**
   * Render the built-in checklist, help center, welcome modal and tour overlay.
   * Set false to compose your own UI from the exported components/hooks.
   * The tour overlay always renders. Defaults to true.
   */
  renderDefaultUI?: boolean;
}

const THEME_VARS: Record<string, string> = {
  primary: "--rgj-primary",
  primaryContrast: "--rgj-primary-contrast",
  surface: "--rgj-surface",
  text: "--rgj-text",
  textMuted: "--rgj-text-muted",
  border: "--rgj-border",
  radius: "--rgj-radius",
  backdrop: "--rgj-backdrop",
};

function Runtime({ renderDefaultUI }: { renderDefaultUI: boolean }) {
  const store = useStore();
  const { adapter, config } = useOnboardingContext();
  const hydratedRef = useRef(false);

  // Inject theme tokens + transition timing as CSS variables on the root.
  useEffect(() => {
    const root = document.documentElement;
    const applied: string[] = [];
    const theme = config.theme;
    if (theme) {
      for (const [key, cssVar] of Object.entries(THEME_VARS)) {
        const value = theme[key as keyof typeof theme];
        if (value != null) {
          root.style.setProperty(cssVar, value);
          applied.push(cssVar);
        }
      }
    }
    if (config.transitionMs != null) {
      root.style.setProperty("--rgj-anim", `${config.transitionMs}ms`);
      applied.push("--rgj-anim");
    }
    return () => {
      for (const cssVar of applied) root.style.removeProperty(cssVar);
    };
  }, [config.theme, config.transitionMs]);

  // Hydrate persisted state once (supports sync + async adapters).
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    const apply = (loaded: Awaited<ReturnType<typeof adapter.load>>) =>
      store.hydrate(loaded ?? DEFAULT_PERSISTED);

    const result = adapter.load();
    if (result instanceof Promise) result.then(apply);
    else apply(result);
  }, [adapter, store]);

  usePageTour();

  return (
    <>
      <TourRenderer />
      {renderDefaultUI && (
        <>
          <WelcomeModal />
          <Checklist />
          <HelpCenter />
        </>
      )}
    </>
  );
}

export function OnboardingProvider({
  config,
  children,
  renderDefaultUI = true,
}: ProviderProps) {
  const value = useBuildContextValue(config);
  return (
    <OnboardingContextProvider value={value}>
      {children}
      <Runtime renderDefaultUI={renderDefaultUI} />
    </OnboardingContextProvider>
  );
}
