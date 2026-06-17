import { useEffect, useRef } from "react";
import { useOnboardingContext, useStore } from "../context";
import type { TourConfig } from "../types";

function routeMatches(tour: TourConfig, pathname: string): boolean {
  if (!tour.route) return false;
  switch (tour.routeMatchMode ?? "exact") {
    case "startsWith":
      return pathname.startsWith(tour.route);
    case "regex":
      return new RegExp(tour.route).test(pathname);
    default:
      return pathname === tour.route;
  }
}

function roleAllowed(roles: string[] | undefined, role: string | undefined) {
  if (!roles || roles.length === 0) return true;
  return role != null && roles.includes(role);
}

/**
 * Route-aware behaviour: starts a pending "show me how" tour after navigation,
 * and auto-launches tours flagged `autoLaunch` the first time their route is
 * visited. Consumers wire `currentPath` from their router into the provider.
 */
export function usePageTour() {
  const { hydrated, pendingTourId, tourRunning, seenTours, startTour } =
    useStore();
  const { config } = useOnboardingContext();
  const { currentPath, role, tours, autoLaunchDelay } = config;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // "Show me how": start the pending tour once we land on its route.
  useEffect(() => {
    if (!hydrated || !pendingTourId || tourRunning) return;
    const tour = tours.find((t) => t.id === pendingTourId);
    if (!tour || !routeMatches(tour, currentPath)) return;

    timerRef.current = setTimeout(
      () => startTour(pendingTourId),
      autoLaunchDelay,
    );
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [
    currentPath,
    hydrated,
    pendingTourId,
    tourRunning,
    tours,
    autoLaunchDelay,
    startTour,
  ]);

  // Auto-launch first-visit tours.
  useEffect(() => {
    if (!hydrated || pendingTourId || tourRunning) return;

    const tour = tours.find(
      (t) =>
        t.autoLaunch &&
        routeMatches(t, currentPath) &&
        roleAllowed(t.roles, role),
    );
    if (!tour || seenTours.includes(tour.id)) return;

    timerRef.current = setTimeout(() => startTour(tour.id), autoLaunchDelay);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [
    currentPath,
    role,
    tours,
    autoLaunchDelay,
    hydrated,
    pendingTourId,
    tourRunning,
    seenTours,
    startTour,
  ]);
}
