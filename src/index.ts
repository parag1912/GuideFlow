// Components

export { Checklist } from "./components/Checklist";
export { DiscoveryBanner } from "./components/DiscoveryBanner";
export { HelpCenter } from "./components/HelpCenter";
export { OnboardingProvider } from "./components/OnboardingProvider";
export { TourRenderer } from "./components/TourRenderer";
export { WelcomeModal } from "./components/WelcomeModal";
// Low-level context access (for custom UI)
export { useOnboardingContext, useStore, useStoreSelector } from "./context";
// Hooks
export { useOnboarding } from "./hooks/useOnboarding";
export { usePageTour } from "./hooks/usePageTour";
export { useTargetElement } from "./hooks/useTargetElement";
// Persistence
export {
  createLocalStorageAdapter,
  DEFAULT_PERSISTED,
} from "./persistence/localStorage";

// Types
export type {
  ChecklistStep,
  DiscoveryConfig,
  DiscoveryPlacement,
  JourneyConfig,
  OnboardingActions,
  OnboardingCallbacks,
  OnboardingConfig,
  OnboardingState,
  OnboardingTheme,
  PersistedState,
  PersistenceAdapter,
  RouteMatchMode,
  TourConfig,
  TourPlacement,
  TourStep,
} from "./types";
