import { useEffect, useRef, useState } from "react";
import type { Rect } from "../utils/positioning";

interface TargetState {
  rect: Rect | null;
  /** True once resolution finished (element found OR we gave up). */
  found: boolean;
  /** True if we gave up without finding the element (bad/late selector). */
  missing: boolean;
}

const INITIAL: TargetState = { rect: null, found: false, missing: false };

function readRect(el: Element): Rect {
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

function inViewport(el: Element): boolean {
  const r = el.getBoundingClientRect();
  return (
    r.top >= 0 &&
    r.left >= 0 &&
    r.bottom <= window.innerHeight &&
    r.right <= window.innerWidth
  );
}

/**
 * Resolve a target element by selector and track its rect.
 *
 * Fast path: if the element already exists, we measure and show the tooltip
 * immediately (no artificial delay), then scroll it into view only if needed.
 * Slow path: if it's not in the DOM yet, a MutationObserver waits for it. If it
 * never appears within `missingMs`, we give up and report `missing` so the
 * caller can warn the developer and fall back to a centered step.
 */
export function useTargetElement(
  selector: string | undefined,
  scroll: boolean,
  missingMs = 2500,
): TargetState {
  const [state, setState] = useState<TargetState>(INITIAL);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!selector) {
      setState({ rect: null, found: true, missing: false }); // centered step
      return;
    }
    setState(INITIAL);

    let cancelled = false;
    let observer: MutationObserver | null = null;
    let giveUp: ReturnType<typeof setTimeout> | null = null;
    const settleTimers: ReturnType<typeof setTimeout>[] = [];

    const measure = () => {
      const el = document.querySelector(selector);
      if (!el || cancelled) return;
      setState({ rect: readRect(el), found: true, missing: false });
    };

    const onFound = (el: Element) => {
      if (cancelled) return;
      // Show immediately at the current position…
      measure();
      // …then scroll into view only if it isn't already fully visible,
      // re-measuring a couple of times as the smooth scroll settles.
      if (scroll && !inViewport(el)) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        for (const ms of [120, 280, 460]) {
          settleTimers.push(setTimeout(measure, ms));
        }
      }
    };

    const existing = document.querySelector(selector);
    if (existing) {
      onFound(existing);
    } else {
      observer = new MutationObserver(() => {
        const el = document.querySelector(selector);
        if (!el) return;
        observer?.disconnect();
        observer = null;
        if (giveUp) clearTimeout(giveUp);
        onFound(el);
      });
      observer.observe(document.body, { childList: true, subtree: true });
      giveUp = setTimeout(() => {
        observer?.disconnect();
        if (cancelled) return;
        // Developer-facing warning — the selector never matched anything.
        console.warn(
          `[react-guided-journey] Tour step target not found: "${selector}". ` +
            "Showing the step centered. Did you add the matching " +
            "data-onboarding/data-tour attribute, or is the element on a " +
            "different route?",
        );
        setState({ rect: null, found: true, missing: true });
      }, missingMs);
    }

    const sync = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(measure);
    };
    window.addEventListener("resize", sync);
    window.addEventListener("scroll", sync, true);

    return () => {
      cancelled = true;
      observer?.disconnect();
      if (giveUp) clearTimeout(giveUp);
      for (const t of settleTimers) clearTimeout(t);
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", sync);
      window.removeEventListener("scroll", sync, true);
    };
  }, [selector, scroll, missingMs]);

  return state;
}
