import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OnboardingProvider } from "../components/OnboardingProvider";
import type { JourneyConfig, TourConfig } from "../types";
import { useOnboarding } from "./useOnboarding";

const tours: TourConfig[] = [
  {
    id: "dash",
    title: "Dashboard",
    steps: [{ id: "a", title: "A", content: "a" }],
  },
];

const journeys: JourneyConfig[] = [
  {
    checklistTitle: "Getting started",
    steps: [
      { id: "step-1", title: "One", order: 1 },
      { id: "step-2", title: "Two", order: 2 },
    ],
  },
];

function Probe() {
  const o = useOnboarding();
  return (
    <div>
      <span data-testid="total">{o.totalSteps}</span>
      <span data-testid="done">{o.completedCount}</span>
      <span data-testid="running">{String(o.tourRunning)}</span>
      <span data-testid="completed">{String(o.onboardingCompleted)}</span>
      <button type="button" onClick={() => o.startTour("dash")}>
        start
      </button>
      <button type="button" onClick={() => o.completeStep("step-1")}>
        done1
      </button>
      <button type="button" onClick={() => o.completeStep("step-2")}>
        done2
      </button>
    </div>
  );
}

function renderApp() {
  return render(
    <OnboardingProvider
      renderDefaultUI={false}
      config={{ tours, journeys, currentPath: "/", userId: "test-user" }}
    >
      <Probe />
    </OnboardingProvider>,
  );
}

describe("useOnboarding (integration)", () => {
  it("derives the role-less journey and its progress", async () => {
    renderApp();
    await waitFor(() =>
      expect(screen.getByTestId("total").textContent).toBe("2"),
    );
    expect(screen.getByTestId("done").textContent).toBe("0");
    expect(screen.getByTestId("completed").textContent).toBe("false");
  });

  it("starts a tour via the hook", async () => {
    renderApp();
    fireEvent.click(screen.getByText("start"));
    await waitFor(() =>
      expect(screen.getByTestId("running").textContent).toBe("true"),
    );
  });

  it("tracks progress and flips onboardingCompleted when all steps done", async () => {
    renderApp();
    fireEvent.click(screen.getByText("done1"));
    fireEvent.click(screen.getByText("done2"));
    await waitFor(() =>
      expect(screen.getByTestId("completed").textContent).toBe("true"),
    );
    expect(screen.getByTestId("done").textContent).toBe("2");
  });
});
