import { describe, expect, it, vi } from "vitest";
import type { OnboardingCallbacks, PersistedState, TourConfig } from "../types";
import { createStore } from "./store";

const TOUR: TourConfig = {
  id: "t1",
  title: "Tour 1",
  steps: [
    { id: "s1", title: "Step 1", content: "a" },
    { id: "s2", title: "Step 2", content: "b" },
  ],
};

function setup(callbacks: OnboardingCallbacks = {}) {
  const saved: PersistedState[] = [];
  const adapter = {
    load: () => null,
    save: (s: PersistedState) => {
      saved.push(s);
    },
    clear: vi.fn(),
  };
  const store = createStore({
    adapter,
    callbacks,
    getTour: (id) => (id === TOUR.id ? TOUR : undefined),
  });
  store.getState().hydrate({});
  return { store, saved, adapter };
}

describe("onboarding store", () => {
  it("hydrates to defaults and marks hydrated", () => {
    const { store } = setup();
    const s = store.getState();
    expect(s.hydrated).toBe(true);
    expect(s.completedSteps).toEqual([]);
    expect(s.seenTours).toEqual([]);
    expect(s.tourRunning).toBe(false);
  });

  it("completeStep adds once and fires onStepComplete", () => {
    const onStepComplete = vi.fn();
    const { store } = setup({ onStepComplete });
    store.getState().completeStep("x");
    store.getState().completeStep("x"); // dedup
    expect(store.getState().completedSteps).toEqual(["x"]);
    expect(onStepComplete).toHaveBeenCalledTimes(1);
  });

  it("runs a tour: start → next → prev → end", () => {
    const cb = {
      onTourStart: vi.fn(),
      onTourComplete: vi.fn(),
      onStepChange: vi.fn(),
    };
    const { store } = setup(cb);
    store.getState().startTour("t1");
    expect(store.getState().tourRunning).toBe(true);
    expect(store.getState().activeStepIndex).toBe(0);
    expect(cb.onTourStart).toHaveBeenCalledWith("t1");

    store.getState().nextStep();
    expect(store.getState().activeStepIndex).toBe(1);
    store.getState().prevStep();
    expect(store.getState().activeStepIndex).toBe(0);

    store.getState().endTour("paired-step");
    const s = store.getState();
    expect(s.tourRunning).toBe(false);
    expect(s.seenTours).toContain("t1");
    expect(s.completedSteps).toContain("paired-step");
    expect(cb.onTourComplete).toHaveBeenCalledWith("t1");
  });

  it("dismissTour records seenTours and fires onTourSkip with step index", () => {
    const onTourSkip = vi.fn();
    const { store } = setup({ onTourSkip });
    store.getState().startTour("t1");
    store.getState().nextStep();
    store.getState().dismissTour("t1");
    expect(store.getState().seenTours).toContain("t1");
    expect(store.getState().tourRunning).toBe(false);
    expect(onTourSkip).toHaveBeenCalledWith("t1", 1);
  });

  it("dismissDiscovery is idempotent", () => {
    const { store } = setup();
    store.getState().dismissDiscovery("tip");
    store.getState().dismissDiscovery("tip");
    expect(store.getState().dismissedDiscoveries).toEqual(["tip"]);
  });

  it("persists only on persisted-field changes, not transient ones", () => {
    const { store, saved } = setup();
    saved.length = 0;
    store.getState().startTour("t1"); // transient → no save
    expect(saved.length).toBe(0);
    store.getState().completeStep("x"); // persisted → save
    expect(saved.length).toBe(1);
    expect(saved[0].completedSteps).toEqual(["x"]);
  });

  it("reset clears state and calls adapter.clear", () => {
    const { store, adapter } = setup();
    store.getState().completeStep("x");
    store.getState().reset();
    expect(store.getState().completedSteps).toEqual([]);
    expect(adapter.clear).toHaveBeenCalled();
  });

  it("notifies subscribers on change", () => {
    const { store } = setup();
    const listener = vi.fn();
    const unsub = store.subscribe(listener);
    store.getState().completeStep("x");
    expect(listener).toHaveBeenCalled();
    unsub();
    listener.mockClear();
    store.getState().completeStep("y");
    expect(listener).not.toHaveBeenCalled();
  });
});
