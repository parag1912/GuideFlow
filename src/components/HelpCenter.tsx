import { useOnboarding } from "../hooks/useOnboarding";

export function HelpCenter() {
  const {
    helpCenterOpen,
    setHelpCenterOpen,
    setChecklistOpen,
    toursForRole,
    seenTours,
    startTour,
    journey,
    completedCount,
    totalSteps,
    progressPercent,
  } = useOnboarding();

  if (!helpCenterOpen) return null;

  const launch = (tourId: string) => {
    setHelpCenterOpen(false);
    startTour(tourId);
  };

  return (
    <div className="rgj-root">
      <button
        type="button"
        aria-label="Close help center"
        className="rgj-backdrop"
        onClick={() => setHelpCenterOpen(false)}
      />
      <aside className="rgj-help" role="dialog" aria-label="Help center">
        <div className="rgj-help-head">
          <h2 className="rgj-help-title">Help Center</h2>
          <button
            type="button"
            className="rgj-close"
            aria-label="Close"
            onClick={() => setHelpCenterOpen(false)}
          >
            ✕
          </button>
        </div>

        <div className="rgj-help-body">
          {journey && (
            <div className="rgj-help-progress">
              <div className="rgj-help-progress-head">
                <span>{journey.checklistTitle}</span>
                <span>
                  {completedCount}/{totalSteps}
                </span>
              </div>
              <div className="rgj-progress">
                <div
                  className="rgj-progress-bar"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <button
                type="button"
                className="rgj-btn rgj-btn-block"
                onClick={() => {
                  setHelpCenterOpen(false);
                  setChecklistOpen(true);
                }}
              >
                Open checklist
              </button>
            </div>
          )}

          {toursForRole.length > 0 && (
            <div>
              <p className="rgj-help-section">Available tours</p>
              <div className="rgj-tour-list">
                {toursForRole.map((tour) => {
                  const seen = seenTours.includes(tour.id);
                  return (
                    <div key={tour.id} className="rgj-tour-card">
                      <div className="rgj-tour-info">
                        <p className="rgj-tour-name">{tour.title}</p>
                        {tour.description && (
                          <p className="rgj-tour-desc">{tour.description}</p>
                        )}
                        {seen && (
                          <span className="rgj-tour-done">✓ Completed</span>
                        )}
                      </div>
                      <button
                        type="button"
                        className="rgj-btn rgj-btn-sm"
                        onClick={() => launch(tour.id)}
                      >
                        {seen ? "Replay" : "Start"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
