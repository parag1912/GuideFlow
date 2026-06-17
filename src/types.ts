/**
 * Public type surface for react-guided-journey.
 *
 * The library is intentionally role-agnostic and router-agnostic: roles are
 * plain strings supplied by the consumer, and navigation is delegated through
 * an `onNavigate` callback. Nothing here is tied to a specific auth system or
 * router.
 */

export type TourPlacement =
  | "top"
  | "top-start"
  | "top-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "right"
  | "center";

export type RouteMatchMode = "exact" | "startsWith" | "regex";

/** A single step inside a guided tour. */
export interface TourStep {
  /** Stable id, unique within the tour. Used as the React remount key. */
  id: string;
  /** CSS selector for the element to spotlight. Omit for a centered step. */
  target?: string;
  title: string;
  /** Body content. String or any React node. */
  content: React.ReactNode;
  placement?: TourPlacement;
  /** Override the default tooltip width (px) for this step. */
  width?: number;
  /** Extra padding (px) around the spotlight cutout. */
  spotlightPadding?: number;
  /** Scroll the target into view before showing. Defaults to true. */
  scrollIntoView?: boolean;
  /**
   * Run before this step is shown. May be async (e.g. open a menu, await a
   * fetch). The step waits for the returned promise before measuring.
   */
  onBeforeStep?: () => void | Promise<void>;
  /** Run after the user leaves this step (next / prev / skip / finish). */
  onAfterStep?: () => void;
}

/** A complete guided tour. */
export interface TourConfig {
  id: string;
  title: string;
  description?: string;
  steps: TourStep[];
  /** Route this tour belongs to (for auto-launch + "show me how"). */
  route?: string;
  routeMatchMode?: RouteMatchMode;
  /** Roles allowed to see/auto-launch this tour. Empty = everyone. */
  roles?: string[];
  /** Auto-launch this tour the first time its route is visited. */
  autoLaunch?: boolean;
  /** Checklist step id to mark complete when this tour finishes. */
  checklistStepId?: string;
}

/** A task in the getting-started checklist. */
export interface ChecklistStep {
  id: string;
  title: string;
  description?: string;
  /** Route the step lives on (renders a "Go" button). */
  route?: string;
  /** Tour to launch for this step (renders a "Show me how" button). */
  tourId?: string;
  /**
   * Custom action button — for tasks that aren't a tour or a route (e.g. open a
   * modal, scroll to a section, trigger the help center). Shown when there's no
   * tourId. The button label is yours.
   */
  action?: { label: string; onClick: () => void };
  order: number;
  /** Optional icon name/key resolved by the consumer's render function. */
  icon?: string;
}

/** A role-specific onboarding journey: a titled checklist of steps. */
export interface JourneyConfig {
  /** Roles this journey applies to. Empty = default/fallback journey. */
  roles?: string[];
  checklistTitle: string;
  welcome?: {
    title: string;
    body: React.ReactNode;
    primaryLabel?: string;
  };
  steps: ChecklistStep[];
}

/** Where a discovery tip renders. `inline` = in the document flow. */
export type DiscoveryPlacement =
  | "inline"
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left";

/** A discovery "tip" — a small dismissible highlight for a feature/page. */
export interface DiscoveryConfig {
  id: string;
  title: string;
  body: React.ReactNode;
  /** Leading icon (emoji string or any React node). */
  icon?: React.ReactNode;
  /** Position. Floating variants render as a fixed pinned card. Default inline. */
  placement?: DiscoveryPlacement;
  /** Optional accent color for this tip (defaults to the theme primary). */
  accent?: string;
  /** Optional call-to-action button. */
  action?: { label: string; onClick: () => void };
  /** Roles allowed to see it. Empty = everyone. */
  roles?: string[];
}

/** Theme tokens injected as CSS variables on the document root. */
export interface OnboardingTheme {
  primary?: string;
  primaryContrast?: string;
  surface?: string;
  text?: string;
  textMuted?: string;
  border?: string;
  radius?: string;
  backdrop?: string;
}

/**
 * The minimal state shape that must be persisted. Maps cleanly to a single DB
 * row — `completedSteps`, `seenTours` and `dismissedDiscoveries` are id arrays.
 */
export interface PersistedState {
  welcomeSeen: boolean;
  completedSteps: string[];
  /** Tours that were completed OR dismissed — gate for auto-launch. */
  seenTours: string[];
  dismissedDiscoveries: string[];
}

/** Full runtime state (persisted fields + transient UI/runtime fields). */
export interface OnboardingState extends PersistedState {
  hydrated: boolean;
  activeTourId: string | null;
  activeStepIndex: number;
  tourRunning: boolean;
  /** Tour to start once navigation to its route completes. */
  pendingTourId: string | null;
  checklistOpen: boolean;
  helpCenterOpen: boolean;
}

export interface OnboardingActions {
  hydrate: (state: Partial<PersistedState>) => void;
  reset: () => void;
  markWelcomeSeen: () => void;
  completeStep: (stepId: string) => void;
  startTour: (tourId: string) => void;
  /** End the active tour. Optionally mark a paired checklist step complete. */
  endTour: (checklistStepId?: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  dismissTour: (tourId: string) => void;
  setPendingTour: (tourId: string | null) => void;
  toggleChecklist: () => void;
  setChecklistOpen: (open: boolean) => void;
  dismissDiscovery: (discoveryId: string) => void;
  setHelpCenterOpen: (open: boolean) => void;
}

/** Async-friendly persistence adapter. Default impl is localStorage. */
export interface PersistenceAdapter {
  load: () => PersistedState | null | Promise<PersistedState | null>;
  save: (state: PersistedState) => void | Promise<void>;
  clear?: () => void | Promise<void>;
}

/** Lifecycle callbacks fired by the system. */
export interface OnboardingCallbacks {
  onTourStart?: (tourId: string) => void;
  onTourComplete?: (tourId: string) => void;
  onTourSkip?: (tourId: string, atStepIndex: number) => void;
  onStepChange?: (tourId: string, stepIndex: number, step: TourStep) => void;
  onStepComplete?: (stepId: string) => void;
  onChecklistComplete?: () => void;
}

/** Configuration passed to the provider. */
export interface OnboardingConfig {
  /** All available tours. */
  tours: TourConfig[];
  /** Role-specific journeys (checklists). */
  journeys?: JourneyConfig[];
  /** Inline discovery banners. */
  discoveries?: DiscoveryConfig[];
  /** Current user's role (plain string). Used to filter tours/journeys. */
  role?: string;
  /** Stable user id — used to namespace persistence. */
  userId?: string | number;
  /** Current router path. The consumer wires this from their router. */
  currentPath: string;
  /** Navigate to a route. The consumer wires this from their router. */
  onNavigate?: (route: string) => void;
  /** Persistence adapter. Defaults to a namespaced localStorage adapter. */
  persistence?: PersistenceAdapter;
  /** Lifecycle callbacks. */
  callbacks?: OnboardingCallbacks;
  /** Theme tokens — injected as CSS variables, no stylesheet edit needed. */
  theme?: OnboardingTheme;
  /** Default tooltip width in px. Defaults to 320. */
  tooltipWidth?: number;
  /** Delay before auto-launching a tour on route arrival (ms). Default 600. */
  autoLaunchDelay?: number;
  /**
   * Duration (ms) of the transition between tour steps — the spotlight glide
   * and tooltip fade/zoom. Lower = snappier, higher = more relaxed.
   * Default 220. Set 0 to disable animation.
   */
  transitionMs?: number;
  /**
   * Show a visible in-tooltip warning when a step's target selector can't be
   * found (helps you debug missing `data-*` attributes). Always logs to the
   * console regardless. Default false.
   */
  debug?: boolean;
}
