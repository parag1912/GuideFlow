/**
 * Minimal usage example (react-router). This file is illustrative — it is not
 * built or published; it lives here as copy-paste documentation.
 */
import {
  DiscoveryBanner,
  type JourneyConfig,
  OnboardingProvider,
  type TourConfig,
  useOnboarding,
} from "react-guided-journey";
import "react-guided-journey/styles.css";
import { useLocation, useNavigate } from "react-router-dom";

const tours: TourConfig[] = [
  {
    id: "dashboard",
    title: "Dashboard tour",
    description: "Get oriented on your home screen.",
    route: "/",
    autoLaunch: true,
    checklistStepId: "see-dashboard",
    steps: [
      {
        id: "stats",
        target: "[data-tour='stats']",
        title: "Your stats",
        content: "Key numbers update live here.",
        placement: "bottom",
      },
      {
        id: "create",
        target: "[data-tour='create-btn']",
        title: "Create anything",
        content: "Start a new program from this button.",
        placement: "left",
        width: 280,
      },
    ],
  },
];

const journeys: JourneyConfig[] = [
  {
    roles: ["admin"],
    checklistTitle: "Getting started",
    welcome: {
      title: "Welcome to Acme 👋",
      body: "Let's get your workspace set up in a few quick steps.",
      primaryLabel: "Show me around",
    },
    steps: [
      {
        id: "see-dashboard",
        title: "Take the dashboard tour",
        description: "Learn the home screen.",
        route: "/",
        tourId: "dashboard",
        order: 1,
      },
      {
        id: "invite-team",
        title: "Invite your team",
        route: "/settings/team",
        order: 2,
      },
    ],
  },
];

function HelpButton() {
  const { setHelpCenterOpen } = useOnboarding();
  return (
    <button type="button" onClick={() => setHelpCenterOpen(true)}>
      Help
    </button>
  );
}

export function App({ role }: { role: string }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <OnboardingProvider
      config={{
        tours,
        journeys,
        discoveries: [
          {
            id: "new-reports",
            title: "New: Reports",
            body: "Export your data as CSV from the Reports tab.",
          },
        ],
        role,
        userId: "user-123",
        currentPath: pathname,
        onNavigate: navigate,
        callbacks: {
          onTourComplete: (id) => console.log("completed tour", id),
          onChecklistComplete: () => console.log("onboarding done 🎉"),
        },
      }}
    >
      <HelpButton />
      <DiscoveryBanner id="new-reports" />
      {/* ...the rest of your app... */}
    </OnboardingProvider>
  );
}
