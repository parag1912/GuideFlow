import { type ReactNode, useEffect, useState } from "react";
import { CodeBlock } from "./ui";

/* ----------------------------------------------- Placement playground */

type Side = "top" | "right" | "bottom" | "left";
const SIDES: Side[] = ["top", "right", "bottom", "left"];

const OFFSET: Record<Side, string> = {
  bottom: "translate(-50%, calc(-50% + 86px))",
  top: "translate(-50%, calc(-50% - 86px))",
  left: "translate(calc(-50% - 150px), -50%)",
  right: "translate(calc(-50% + 150px), -50%)",
};

export function PlacementPlayground() {
  const [side, setSide] = useState<Side>("bottom");
  const [auto, setAuto] = useState(true);

  // Auto-cycle through placements until the user interacts.
  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => {
      setSide((s) => SIDES[(SIDES.indexOf(s) + 1) % SIDES.length]);
    }, 1900);
    return () => clearInterval(t);
  }, [auto]);

  return (
    <div className="pp">
      <div className="pp-stage" onMouseEnter={() => setAuto(false)}>
        <div className="pp-target">Target</div>
        <div className="pp-tip" style={{ transform: OFFSET[side] }}>
          <span className={`pp-arrow pp-arrow-${side}`} />
          <strong>placement: "{side}"</strong>
          <span>The tooltip glides; the arrow re-anchors.</span>
        </div>
      </div>
      <div className="pp-controls">
        {SIDES.map((s) => (
          <button
            type="button"
            key={s}
            className={`chip ${side === s ? "chip-on" : ""}`}
            onClick={() => {
              setAuto(false);
              setSide(s);
            }}
          >
            {s}
          </button>
        ))}
        <button
          type="button"
          className={`chip ${auto ? "chip-on" : ""}`}
          onClick={() => setAuto((a) => !a)}
        >
          {auto ? "⏸ auto" : "▶ auto"}
        </button>
      </div>
      <p className="pp-note">
        Placements also support <code>top-start</code>, <code>bottom-end</code>,
        and <code>center</code>. On overflow they auto-flip; on mobile they
        become a bottom sheet.
      </p>
    </div>
  );
}

/* --------------------------------------------------- Tips playground */

const ICONS = ["💡", "🎉", "✨", "🚀", "⚡", "🔔", "🎁", "📊"];
const ACCENTS = ["#4f46e5", "#059669", "#e11d48", "#d97706", "#0284c7", "#d946ef"];
const PLACEMENTS = [
  "inline",
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
] as const;

export function TipsPlayground() {
  const [icon, setIcon] = useState("🎉");
  const [accent, setAccent] = useState("#059669");
  const [placement, setPlacement] =
    useState<(typeof PLACEMENTS)[number]>("bottom-right");
  const [title, setTitle] = useState("New: Reports");
  const [body, setBody] = useState("Export your data as CSV from the new tab.");

  const floating = placement !== "inline";

  // The tip card itself (no fixed-position float classes — it's positioned
  // within the mock window frame below so it can't overlap the real page UI).
  const card = (
    <div
      className="rgj-discovery"
      style={{ ["--rgj-tip" as string]: accent, width: 300 }}
      role="status"
    >
      <span className="rgj-discovery-icon">{icon}</span>
      <div className="rgj-discovery-main">
        <p className="rgj-discovery-title">{title || "Tip title"}</p>
        <div className="rgj-discovery-text">{body || "Tip body text."}</div>
        <button
          type="button"
          className="rgj-btn rgj-btn-sm rgj-btn-primary rgj-discovery-action"
        >
          Got it
        </button>
      </div>
      <button type="button" className="rgj-close" aria-label="dismiss">
        ✕
      </button>
    </div>
  );

  const code = `{
  id: "new-feature",
  icon: "${icon}",
  title: "${title}",
  body: "${body}",
  placement: "${placement}",
  accent: "${accent}",${
    floating ? `\n  action: { label: "Got it", onClick: () => {} },` : ""
  }
}`;

  return (
    <div className="tp">
      <div className="tp-controls">
        <Field label="Placement">
          <div className="chips">
            {PLACEMENTS.map((p) => (
              <button
                type="button"
                key={p}
                className={`chip ${placement === p ? "chip-on" : ""}`}
                onClick={() => setPlacement(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Icon">
          <div className="chips">
            {ICONS.map((i) => (
              <button
                type="button"
                key={i}
                className={`icon-chip ${icon === i ? "icon-chip-on" : ""}`}
                onClick={() => setIcon(i)}
              >
                {i}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Accent">
          <div className="chips">
            {ACCENTS.map((c) => (
              <button
                type="button"
                key={c}
                className={`swatch swatch-sm ${accent === c ? "swatch-on" : ""}`}
                style={{ background: c }}
                onClick={() => setAccent(c)}
                aria-label={c}
              />
            ))}
          </div>
        </Field>
        <Field label="Title">
          <input
            className="tp-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>
        <Field label="Body">
          <input
            className="tp-input"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </Field>
      </div>

      {/* Preview inside a mock app window — the tip pins to the chosen corner
          of THIS frame (not the real viewport), so it never overlaps page UI. */}
      <div className="tip-frame">
        <div className="tip-frame-bar">
          <span className="tip-frame-dots">
            <i /> <i /> <i />
          </span>
          <span className="tip-frame-url">your-app.com</span>
        </div>
        <div className={`tip-stage ${floating ? `tip-at-${placement}` : "tip-inline"}`}>
          {card}
        </div>
      </div>

      <CodeBlock code={code} lang="ts" />
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="field">
      <span className="field-label">{label}</span>
      {children}
    </div>
  );
}
