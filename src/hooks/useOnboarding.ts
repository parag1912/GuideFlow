import { useMemo } from "react";
import { useOnboardingContext, useStore } from "../context";
import type { JourneyConfig, TourConfig } from "../types";

function roleAllowed(roles: string[] | undefined, role: string | undefined) {
  if (!roles || roles.length === 0) return true;
  return role != null && roles.includes(role);
}

export function selectJourney(
  journeys: JourneyConfig[] | undefined,
  role: string | undefined,
): JourneyConfig | null {
  if (!journeys || journeys.length === 0) return null;
  return (
    journeys.find((j) => roleAllowed(j.roles, role) && j.roles?.length) ??
    journeys.find((j) => !j.roles || j.roles.length === 0) ??
    null
  );
}

/**
 * Primary consumer hook. Exposes store state + actions plus derived,
 * role-aware values (the active journey, progress, available tours).
 */
export function useOnboarding() {
  const store = useStore();
  const { config } = useOnboardingContext();
  const { role, tours, journeys, discoveries, onNavigate } = config;

  const journey = useMemo(
    () => selectJourney(journeys, role),
    [journeys, role],
  );

  const toursForRole = useMemo(
    () => tours.filter((t) => roleAllowed(t.roles, role)),
    [tours, role],
  );

  const discoveriesForRole = useMemo(
    () => (discoveries ?? []).filter((d) => roleAllowed(d.roles, role)),
    [discoveries, role],
  );

  const totalSteps = journey?.steps.length ?? 0;
  const completedCount = useMemo(() => {
    if (!journey) return 0;
    const ids = new Set(journey.steps.map((s) => s.id));
    return store.completedSteps.filter((id) => ids.has(id)).length;
  }, [journey, store.completedSteps]);

  const progressPercent =
    totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;
  const onboardingCompleted = totalSteps > 0 && completedCount >= totalSteps;

  function getTourById(id: string): TourConfig | undefined {
    return tours.find((t) => t.id === id);
  }

  return {
    ...store,
    role,
    journey,
    toursForRole,
    discoveriesForRole,
    totalSteps,
    completedCount,
    progressPercent,
    onboardingCompleted,
    getTourById,
    navigate: onNavigate,
  };
}
