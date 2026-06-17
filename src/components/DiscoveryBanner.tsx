import { createPortal } from "react-dom";
import { useOnboarding } from "../hooks/useOnboarding";
import { cn } from "../utils/cn";

interface DiscoveryBannerProps {
  /** Discovery id to render. Hidden once dismissed. */
  id: string;
}

/**
 * A discovery "tip" — a small dismissible highlight for a feature or page.
 * Renders inline by default, or as a fixed floating card pinned to a corner
 * (placement: "bottom-right" | "bottom-left" | "top-right" | "top-left").
 * Title, body, icon and accent are all data-driven from the discovery config,
 * so the same component covers any page with different content.
 */
export function DiscoveryBanner({ id }: DiscoveryBannerProps) {
  const { discoveriesForRole, dismissedDiscoveries, dismissDiscovery } =
    useOnboarding();

  const d = discoveriesForRole.find((x) => x.id === id);
  if (!d || dismissedDiscoveries.includes(id)) return null;

  const placement = d.placement ?? "inline";
  const floating = placement !== "inline";

  const card = (
    <div
      className={cn(
        "rgj-discovery",
        floating && "rgj-discovery-float",
        floating && `rgj-discovery-${placement}`,
      )}
      role="status"
      style={d.accent ? { ["--rgj-tip" as string]: d.accent } : undefined}
    >
      {d.icon != null && <span className="rgj-discovery-icon">{d.icon}</span>}
      <div className="rgj-discovery-main">
        <p className="rgj-discovery-title">{d.title}</p>
        <div className="rgj-discovery-text">{d.body}</div>
        {d.action && (
          <button
            type="button"
            className="rgj-btn rgj-btn-sm rgj-btn-primary rgj-discovery-action"
            onClick={() => {
              d.action?.onClick();
              dismissDiscovery(id);
            }}
          >
            {d.action.label}
          </button>
        )}
      </div>
      <button
        type="button"
        className="rgj-close"
        aria-label="Dismiss tip"
        onClick={() => dismissDiscovery(id)}
      >
        ✕
      </button>
    </div>
  );

  // Floating tips are portaled to <body> so an ancestor's stacking context
  // (e.g. a parent with a CSS transform/animation) can't trap them behind
  // other fixed UI like a sticky header.
  return floating ? createPortal(card, document.body) : card;
}
