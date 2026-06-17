import { useOnboarding } from "../hooks/useOnboarding";

export function WelcomeModal() {
  const { journey, welcomeSeen, hydrated, markWelcomeSeen, setChecklistOpen } =
    useOnboarding();

  if (!hydrated || welcomeSeen || !journey?.welcome) return null;
  const { title, body, primaryLabel } = journey.welcome;

  const start = () => {
    markWelcomeSeen();
    setChecklistOpen(true);
  };

  return (
    <div className="rgj-root">
      <div className="rgj-backdrop rgj-backdrop-dark" aria-hidden="true" />
      <div
        className="rgj-welcome rgj-in"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <h2 className="rgj-welcome-title">{title}</h2>
        <div className="rgj-welcome-body">{body}</div>
        <div className="rgj-welcome-actions">
          <button
            type="button"
            className="rgj-skip"
            onClick={() => markWelcomeSeen()}
          >
            Skip for now
          </button>
          <button
            type="button"
            className="rgj-btn rgj-btn-primary"
            onClick={start}
          >
            {primaryLabel ?? "Get started"}
          </button>
        </div>
      </div>
    </div>
  );
}
