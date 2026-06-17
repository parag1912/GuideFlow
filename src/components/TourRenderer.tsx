import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useOnboardingContext } from "../context";
import { useOnboarding } from "../hooks/useOnboarding";
import { useTargetElement } from "../hooks/useTargetElement";
import type { TourConfig } from "../types";
import { cn } from "../utils/cn";
import { computePosition, type Rect } from "../utils/positioning";

const FALLBACK_HEIGHT = 240;

/** Build a clip-path that darkens the whole screen except a hole at `r`. */
function holeClip(r: Rect, pad: number, vpW: number, vpH: number): string {
  const t = Math.max(0, r.top - pad);
  const l = Math.max(0, r.left - pad);
  const right = Math.min(vpW, r.left + r.width + pad);
  const b = Math.min(vpH, r.top + r.height + pad);
  // Rectangular "donut" via a bridge on the left edge.
  return (
    `polygon(0px 0px, 0px ${vpH}px, ${l}px ${vpH}px, ${l}px ${t}px, ` +
    `${right}px ${t}px, ${right}px ${b}px, ${l}px ${b}px, ${l}px ${vpH}px, ` +
    `${vpW}px ${vpH}px, ${vpW}px 0px)`
  );
}

interface TourLayerProps {
  tour: TourConfig;
  stepIndex: number;
  baseWidth: number;
  debug: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

/**
 * Persistent tour overlay. A single dark layer (clip-path hole at the target)
 * stays mounted for the whole tour — so the screen never flashes between steps.
 * The highlight ring and tooltip are keyed per step, so on each step change
 * they CROSSFADE in at the new target's position (no sliding/gliding motion).
 * Fade duration is `--rgj-anim` (the `transitionMs` config prop).
 */
function TourLayer({
  tour,
  stepIndex,
  baseWidth,
  debug,
  onNext,
  onPrev,
  onSkip,
}: TourLayerProps) {
  const step = tour.steps[stepIndex];
  const total = tour.steps.length;
  const isFirst = stepIndex === 0;
  const isLast = stepIndex >= total - 1;

  // Run an async onBeforeStep (e.g. open a menu) before resolving the target.
  const [preparedFor, setPreparedFor] = useState<string | null>(
    step.onBeforeStep ? null : step.id,
  );
  useEffect(() => {
    let cancelled = false;
    if (!step.onBeforeStep) {
      setPreparedFor(step.id);
      return;
    }
    setPreparedFor(null);
    Promise.resolve(step.onBeforeStep()).finally(() => {
      if (!cancelled) setPreparedFor(step.id);
    });
    return () => {
      cancelled = true;
    };
  }, [step]);
  const prepared = preparedFor === step.id;

  const { rect, found, missing } = useTargetElement(
    prepared ? step.target : undefined,
    step.scrollIntoView !== false,
  );

  const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const onResize = () =>
      setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Keep the last resolved rect so the dim's hole stays on the previous target
  // while the next one resolves (no flicker to a full-screen hole).
  const [lastRect, setLastRect] = useState<Rect | null>(null);
  useEffect(() => {
    if (rect) setLastRect(rect);
  }, [rect]);
  const curRect = found ? rect : lastRect;

  // Measure-then-show the tooltip, reset per step (the tooltip remounts each
  // step via its key, so we re-measure for the new content before revealing).
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(FALLBACK_HEIGHT);
  const [measured, setMeasured] = useState(false);
  // Re-hide and re-measure whenever the step changes (the value of stepIndex
  // isn't read in the body, but it IS the intended trigger).
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-run on step change
  useEffect(() => {
    setMeasured(false);
  }, [stepIndex]);
  useLayoutEffect(() => {
    if (measured || !tooltipRef.current) return;
    const h = tooltipRef.current.offsetHeight;
    if (h > 0) {
      setHeight(h);
      setMeasured(true);
    }
  });

  // Keyboard navigation (latest handlers via ref so we don't re-bind).
  const nav = useRef({ onNext, onPrev, onSkip, isFirst });
  nav.current = { onNext, onPrev, onSkip, isFirst };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        nav.current.onSkip();
      } else if (e.key === "ArrowRight" || e.key === "Enter") {
        e.preventDefault();
        nav.current.onNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (!nav.current.isFirst) nav.current.onPrev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const pad = step.spotlightPadding ?? 8;
  const clip = curRect ? holeClip(curRect, pad, vp.w, vp.h) : undefined;
  const ring = curRect
    ? {
        top: curRect.top - pad,
        left: curRect.left - pad,
        width: curRect.width + pad * 2,
        height: curRect.height + pad * 2,
      }
    : null;

  const pos = computePosition(
    curRect,
    step.placement ?? "bottom",
    vp.w,
    vp.h,
    height,
    step.width ?? baseWidth,
  );

  return createPortal(
    <div className="rgj-root" role="presentation">
      {/* Click anywhere outside the tooltip skips the tour. */}
      <button
        type="button"
        aria-label="Skip tour"
        className="rgj-backdrop-btn"
        onClick={onSkip}
      />

      {/* Constant dark layer with a hole at the target (never flashes). */}
      <div
        aria-hidden="true"
        className="rgj-dim2"
        style={clip ? { clipPath: clip } : undefined}
      />

      {/* Highlight ring — keyed per step so it crossfades in at the new spot. */}
      {ring && (
        <div
          key={stepIndex}
          aria-hidden="true"
          className="rgj-ring"
          style={ring}
        />
      )}

      {/* Tooltip — keyed per step so it crossfades in (no slide). */}
      <div
        key={`t-${stepIndex}`}
        ref={tooltipRef}
        role="dialog"
        aria-modal="false"
        aria-labelledby="rgj-title"
        className={cn("rgj-tooltip", measured ? "rgj-in" : "rgj-hidden")}
        style={{
          top: pos.tooltip.top,
          left: pos.tooltip.left,
          width: pos.tooltip.width,
        }}
      >
        {pos.arrow && (
          <span
            aria-hidden="true"
            className={`rgj-arrow rgj-arrow-${pos.arrow.edge}`}
            style={
              pos.arrow.edge === "top" || pos.arrow.edge === "bottom"
                ? { left: pos.arrow.offset }
                : { top: pos.arrow.offset }
            }
          />
        )}

        <div className="rgj-header">
          <span className="rgj-badge">
            {stepIndex + 1} / {total}
          </span>
          <button
            type="button"
            className="rgj-close"
            onClick={onSkip}
            aria-label="Close tour"
          >
            ✕
          </button>
        </div>

        <div className="rgj-body">
          <h3 id="rgj-title" className="rgj-step-title">
            {step.title}
          </h3>
          <div className="rgj-step-content">{step.content}</div>
          {missing && debug && (
            <div className="rgj-warn" role="alert">
              ⚠ Target not found: <code>{step.target}</code>
              <span>
                Add the matching attribute/selector, or check the route. (This
                notice only shows when <code>debug</code> is on.)
              </span>
            </div>
          )}
        </div>

        <div className="rgj-footer">
          <button type="button" className="rgj-skip" onClick={onSkip}>
            Skip tour
          </button>
          <div className="rgj-actions">
            {!isFirst && (
              <button type="button" className="rgj-btn" onClick={onPrev}>
                Back
              </button>
            )}
            <button
              type="button"
              className="rgj-btn rgj-btn-primary"
              onClick={onNext}
            >
              {isLast ? "Finish" : "Next"}
            </button>
          </div>
        </div>

        <div className="rgj-dots" aria-hidden="true">
          {Array.from({ length: total }).map((_, i) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: dots are positional
              key={i}
              className={cn("rgj-dot", i === stepIndex && "rgj-dot-active")}
            />
          ))}
        </div>
      </div>

      <div className="rgj-sr-only" aria-live="polite">
        {`Step ${stepIndex + 1} of ${total}: ${step.title}. Tour: ${tour.title}.`}
      </div>
    </div>,
    document.body,
  );
}

export function TourRenderer() {
  const {
    tourRunning,
    activeTourId,
    activeStepIndex,
    getTourById,
    nextStep,
    prevStep,
    endTour,
    dismissTour,
  } = useOnboarding();
  const { config } = useOnboardingContext();

  const tour = activeTourId ? getTourById(activeTourId) : undefined;

  if (!tourRunning || !tour) return null;
  const step = tour.steps[activeStepIndex];
  if (!step) return null;

  const isLast = activeStepIndex >= tour.steps.length - 1;

  const handleNext = () => {
    step.onAfterStep?.();
    if (isLast) endTour(tour.checklistStepId);
    else nextStep();
  };
  const handlePrev = () => {
    step.onAfterStep?.();
    prevStep();
  };
  const handleSkip = () => {
    step.onAfterStep?.();
    dismissTour(tour.id);
  };

  return (
    <TourLayer
      tour={tour}
      stepIndex={activeStepIndex}
      baseWidth={config.tooltipWidth}
      debug={config.debug ?? false}
      onNext={handleNext}
      onPrev={handlePrev}
      onSkip={handleSkip}
    />
  );
}
