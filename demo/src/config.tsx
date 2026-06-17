import type {
  DiscoveryConfig,
  JourneyConfig,
  TourConfig,
} from "react-guided-journey";

export const tours: TourConfig[] = [
  {
    id: "product-tour",
    title: "Product tour",
    description: "A guided walkthrough of this page.",
    route: "/",
    checklistStepId: "take-tour",
    steps: [
      {
        id: "hero",
        target: "[data-tour='hero']",
        title: "This is a real tour 👋",
        content:
          "Everything you see is rendered by react-guided-journey. Use Next / Back, the arrow keys, or Esc to exit.",
        placement: "bottom",
      },
      {
        id: "stats",
        target: "[data-tour='stats']",
        title: "Spotlight + measure-then-show",
        content:
          "The tooltip measures its real height before positioning, so it never clips — even with longer copy that wraps across several lines like this one.",
        placement: "bottom",
      },
      {
        id: "theme",
        target: "[data-tour='theme']",
        title: "Fully themeable",
        content: "Pick an accent — the whole system re-themes live.",
        placement: "top",
      },
      {
        id: "tips",
        target: "[data-tour='tips']",
        title: "Discovery tips",
        content:
          "Drop dismissible tips anywhere — inline or pinned to a corner, with their own icon, accent and CTA.",
        placement: "top",
      },
      {
        id: "install",
        target: "[data-tour='install']",
        title: "That's it!",
        content: "Two imports and a provider. Copy the snippet to start.",
        placement: "top",
      },
    ],
  },
];

export const journeys: JourneyConfig[] = [
  {
    checklistTitle: "Getting started",
    welcome: {
      title: "Welcome to react-guided-journey 👋",
      body: "A complete onboarding system in one tiny package — tours, a checklist, a help center and discovery tips. Take the quick tour to see it all.",
      primaryLabel: "Show me around",
    },
    steps: [
      {
        id: "take-tour",
        title: "Take the product tour",
        description: "See the spotlight + tooltips in action.",
        tourId: "product-tour",
        order: 1,
      },
      {
        id: "try-theme",
        title: "Try a different theme",
        description: "Pick an accent color.",
        order: 2,
        action: {
          label: "Take me there",
          onClick: () =>
            document
              .getElementById("theme")
              ?.scrollIntoView({ behavior: "smooth", inline: "start" }),
        },
      },
      {
        id: "open-help",
        title: "Open the help center",
        description: "Replay any tour anytime.",
        order: 3,
        action: {
          label: "Open it",
          onClick: () =>
            window.dispatchEvent(new CustomEvent("rgj-demo:open-help")),
        },
      },
    ],
  },
];

export const discoveries: DiscoveryConfig[] = [
  {
    id: "tip-help",
    icon: "✨",
    title: "Need a refresher?",
    body: "Open the Help Center anytime to replay tours or jump to key pages.",
    placement: "bottom-left",
    accent: "#d946ef",
  },
];

export const THEMES = [
  { name: "Indigo", color: "#4f46e5" },
  { name: "Emerald", color: "#059669" },
  { name: "Rose", color: "#e11d48" },
  { name: "Amber", color: "#d97706" },
  { name: "Sky", color: "#0284c7" },
  { name: "Violet", color: "#7c3aed" },
];
