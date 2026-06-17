import { useOnboardingContext } from "../context";
import { useOnboarding } from "../hooks/useOnboarding";
import type { TourConfig } from "../types";
import { cn } from "../utils/cn";

function onRoute(tour: TourConfig, path: string): boolean {
  if (!tour.route) return true;
  switch (tour.routeMatchMode ?? "exact") {
    case "startsWith":
      return path.startsWith(tour.route);
    case "regex":
      return new RegExp(tour.route).test(path);
    default:
      return path === tour.route;
  }
}

export function Checklist() {
  const {
    journey,
    checklistOpen,
    toggleChecklist,
    setChecklistOpen,
    completedSteps,
    completedCount,
    totalSteps,
    progressPercent,
    onboardingCompleted,
    getTourById,
    startTour,
    setPendingTour,
    navigate,
  } = useOnboarding();
  const { config } = useOnboardingContext();

  if (!journey) return null;

  const launch = (tourId: string) => {
    const tour = getTourById(tourId);
    if (!tour) return;
    if (!tour.route || onRoute(tour, config.currentPath)) {
      startTour(tourId);
    } else {
      setPendingTour(tourId);
      navigate?.(tour.route);
    }
  };

  // Collapsed pill.
  if (!checklistOpen) {
    return (
      <button
        type="button"
        className="rgj-pill"
        onClick={() => setChecklistOpen(true)}
      >
        <span className="rgj-pill-ring">{progressPercent}%</span>
        <span className="rgj-pill-label">
          {onboardingCompleted ? "All set!" : journey.checklistTitle}
        </span>
      </button>
    );
  }

  const steps = [...journey.steps].sort((a, b) => a.order - b.order);

  return (
    <div
      className="rgj-checklist"
      role="dialog"
      aria-label={journey.checklistTitle}
    >
      <div className="rgj-checklist-head">
        <div>
          <p className="rgj-checklist-title">{journey.checklistTitle}</p>
          <p className="rgj-checklist-sub">
            {completedCount} of {totalSteps} complete
          </p>
        </div>
        <button
          type="button"
          className="rgj-close"
          aria-label="Minimize checklist"
          onClick={() => toggleChecklist()}
        >
          ✕
        </button>
      </div>

      <div className="rgj-progress">
        <div
          className="rgj-progress-bar"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <ul className="rgj-checklist-list">
        {steps.map((s) => {
          const done = completedSteps.includes(s.id);
          return (
            <li key={s.id} className={cn("rgj-task", done && "rgj-task-done")}>
              <span className="rgj-check">{done ? "✓" : ""}</span>
              <div className="rgj-task-body">
                <p className="rgj-task-title">{s.title}</p>
                {s.description && (
                  <p className="rgj-task-desc">{s.description}</p>
                )}
              </div>
              {!done && (
                <div className="rgj-task-actions">
                  {s.tourId ? (
                    <button
                      type="button"
                      className="rgj-btn rgj-btn-sm"
                      onClick={() => launch(s.tourId as string)}
                    >
                      Show me how
                    </button>
                  ) : (
                    s.action && (
                      <button
                        type="button"
                        className="rgj-btn rgj-btn-sm"
                        onClick={() => {
                          setChecklistOpen(false);
                          s.action?.onClick();
                        }}
                      >
                        {s.action.label}
                      </button>
                    )
                  )}
                  {s.route && (
                    <button
                      type="button"
                      className="rgj-btn rgj-btn-sm rgj-btn-ghost"
                      onClick={() => {
                        setChecklistOpen(false);
                        navigate?.(s.route as string);
                      }}
                    >
                      Go
                    </button>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
