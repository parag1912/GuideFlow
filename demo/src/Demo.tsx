import { type ReactNode, useEffect, useRef } from "react";
import { DiscoveryBanner, useOnboarding } from "react-guided-journey";
import { THEMES } from "./config";
import { PlacementPlayground, TipsPlayground } from "./playgrounds";
import { CodeBlock, CountUp, Reveal } from "./ui";

const FEATURES = [
  [
    "🔦",
    "Spotlight tours",
    "Box-shadow cutout, smooth transitions, measure-then-show tooltips that never clip.",
  ],
  [
    "🧭",
    "Smart placement",
    "Auto-flips on overflow, clamps to viewport, arrow re-anchors. Mobile → bottom sheet.",
  ],
  [
    "✅",
    "Progress checklist",
    "A getting-started journey with a collapsible pill, progress bar and 'show me how'.",
  ],
  [
    "💾",
    "DB-ready persistence",
    "Four id-arrays. Default localStorage, or plug in your own async backend.",
  ],
  [
    "⌨️",
    "Keyboard & a11y",
    "Esc / arrow keys, aria-live step announcements, focusable controls.",
  ],
  [
    "⏳",
    "Async targets",
    "Waits for elements rendered after a fetch via MutationObserver — no brittle timeouts.",
  ],
  [
    "🪝",
    "Lifecycle hooks",
    "onBeforeStep (async), onAfterStep, onTourComplete, onChecklistComplete & more.",
  ],
  [
    "💡",
    "Discovery tips",
    "Dismissible tips — inline or pinned, with dynamic icon, accent and a CTA.",
  ],
  [
    "🎨",
    "Themeable",
    "Pure CSS variables, a theme prop, or auto-adopt your brand tokens.",
  ],
] as const;

const SPEEDS = [
  { label: "Slow", ms: 500 },
  { label: "Normal", ms: 220 },
  { label: "Fast", ms: 110 },
  { label: "Instant", ms: 0 },
];

export function Demo({
  accent,
  setAccent,
  speed,
  setSpeed,
}: {
  accent: string;
  setAccent: (c: string) => void;
  speed: number;
  setSpeed: (ms: number) => void;
}) {
  const o = useOnboarding();
  const heroRef = useRef<HTMLDivElement>(null);

  // Checklist "Open it" action dispatches this; open the help center + tick it.
  const { setHelpCenterOpen, completeStep, helpCenterOpen } = o;
  useEffect(() => {
    const open = () => setHelpCenterOpen(true);
    window.addEventListener("rgj-demo:open-help", open);
    return () => window.removeEventListener("rgj-demo:open-help", open);
  }, [setHelpCenterOpen]);
  useEffect(() => {
    if (helpCenterOpen) completeStep("open-help");
  }, [helpCenterOpen, completeStep]);

  // Subtle mouse parallax on the hero blobs.
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--px", `${x * 26}px`);
      el.style.setProperty("--py", `${y * 26}px`);
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div className="page">
      <DiscoveryBanner id="tip-help" />

      {/* Hero */}
      <header className="hero" data-tour="hero" ref={heroRef}>
        <div className="hero-blob hero-blob-a" />
        <div className="hero-blob hero-blob-b" />
        <div className="hero-content">
          <span className="badge">
            ⚡ zero dependencies · headless · &lt; 12kb
          </span>
          <h1>
            react-<span className="grad">guided-journey</span>
          </h1>
          <p className="tagline">
            A complete React onboarding system — guided tours, a progress
            checklist, a help center and discovery tips. Not just a tooltip
            library. Try every feature right here. 👇
          </p>
          <div className="hero-cta">
            <button
              type="button"
              className="cta cta-primary"
              onClick={() => o.startTour("product-tour")}
            >
              ▶ Start the product tour
            </button>
            <button
              type="button"
              className="cta"
              onClick={() => o.setHelpCenterOpen(true)}
            >
              ❓ Open help center
            </button>
          </div>
        </div>
      </header>

      {/* Controls */}
      <Reveal>
        <section className="card">
          <SectionHead
            title="🎮 Live controls"
            sub="Every button below drives the real library — nothing is faked. Start here."
          />
          <div className="grid">
            <Ctl
              icon="▶"
              label="Product tour"
              hint="Spotlight walkthrough"
              onClick={() => o.startTour("product-tour")}
            />
            <Ctl
              icon="✅"
              label="Toggle checklist"
              hint="Progress tracker"
              onClick={() => o.toggleChecklist()}
            />
            <Ctl
              icon="❓"
              label="Help center"
              hint="Replay any tour"
              onClick={() => o.setHelpCenterOpen(true)}
            />
            <Ctl
              icon="👋"
              label="Replay welcome"
              hint="Resets demo state"
              onClick={() => o.reset()}
            />
            <Ctl
              icon="♻️"
              label="Reset all state"
              hint="Clears localStorage"
              onClick={() => o.reset()}
            />
          </div>

          <div className="speed-row">
            <span className="field-label">Tour speed</span>
            <div className="chips">
              {SPEEDS.map((s) => (
                <button
                  type="button"
                  key={s.ms}
                  className={`chip ${speed === s.ms ? "chip-on" : ""}`}
                  onClick={() => setSpeed(s.ms)}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <span className="speed-hint">
              <code>transitionMs: {speed}</code> — controls the step glide.
              Start a tour and hit Next to feel it.
            </span>
          </div>
        </section>
      </Reveal>

      {/* Stats */}
      <Reveal>
        <section className="stats-section card">
          <SectionHead
            title="📊 Why teams reach for it"
            sub="One dependency-free package that replaces three (a tour lib + a checklist lib + a tooltip lib) — and stays out of your bundle and your router's way."
          />
          <div className="stats" data-tour="stats">
            <Stat
              n={<CountUp to={0} />}
              label="Runtime dependencies"
              sub="React is the only peer dep"
            />
            <Stat
              n={<CountUp to={4} />}
              label="Persisted state fields"
              sub="maps to one DB row"
            />
            <Stat
              n={<CountUp to={5} />}
              label="Built-in surfaces"
              sub="tour · checklist · help · tips · modal"
            />
            <Stat
              n={<CountUp to={100} suffix="%" />}
              label="Router & role agnostic"
              sub="works with any stack"
            />
          </div>
        </section>
      </Reveal>

      {/* Theme */}
      <Reveal>
        <section className="card" id="theme" data-tour="theme">
          <SectionHead
            title="🎨 Theme it live"
            sub="Pick any accent — the entire system (tours, checklist, tips, help center) re-themes instantly."
          />
          <div className="swatches">
            {THEMES.map((t) => (
              <button
                type="button"
                key={t.color}
                className={`swatch ${accent === t.color ? "swatch-on" : ""}`}
                style={{ background: t.color }}
                onClick={() => {
                  setAccent(t.color);
                  o.completeStep("try-theme");
                }}
                aria-label={t.name}
              />
            ))}
          </div>
          <div className="info-row">
            <Info icon="🎯" title="Auto-adopts your brand">
              Defaults fall back to your existing CSS tokens —{" "}
              <code>--brand</code>, <code>--color-primary</code>,{" "}
              <code>--radius</code> — so it inherits your palette with zero
              config.
            </Info>
            <Info icon="🎨" title="Or set it explicitly">
              Pass a <code>theme</code> prop, or override any{" "}
              <code>--rgj-*</code> variable. Current accent:{" "}
              <code className="accent-pill" style={{ color: accent }}>
                {accent}
              </code>
            </Info>
          </div>
        </section>
      </Reveal>

      {/* Placement playground */}
      <Reveal>
        <section className="card">
          <SectionHead
            title="🧭 Placement playground"
            sub="A tour step's tooltip can sit on any side of its target. This visual shows how the tooltip glides and the arrow re-anchors as the placement changes — pick a side, or let it auto-cycle. The real product tour uses these same placements."
          />
          <PlacementPlayground />
        </section>
      </Reveal>

      {/* Tips playground */}
      <Reveal>
        <section className="card" data-tour="tips">
          <SectionHead
            title="💡 Discovery tips — build one live"
            sub="Tips are small dismissible highlights for a feature or page. Change the placement, icon, accent and copy below — the preview and the config code update live. Add one per page, with whatever content fits that page."
          />
          <TipsPlayground />
        </section>
      </Reveal>

      {/* Features */}
      <Reveal>
        <section>
          <SectionHead
            title="✨ Everything included"
            sub="One package replaces a tour library + a checklist library + a tooltip library. Hover a card."
          />
          <div className="features">
            {FEATURES.map(([icon, title, body]) => (
              <div className="feature" key={title}>
                <div className="feature-ico">{icon}</div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Live state */}
      <Reveal>
        <section className="card">
          <SectionHead
            title="🗃️ Live persisted state"
            sub="This is the entire saved shape — four fields that map cleanly to a single database row. It's saved on every change and restored on load."
          />
          <div className="state-wrap">
            <pre className="state">
              {JSON.stringify(
                {
                  welcomeSeen: o.welcomeSeen,
                  completedSteps: o.completedSteps,
                  seenTours: o.seenTours,
                  dismissedDiscoveries: o.dismissedDiscoveries,
                },
                null,
                2,
              )}
            </pre>
            <ul className="state-legend">
              <li>
                <b>welcomeSeen</b> — has the welcome modal been shown
              </li>
              <li>
                <b>completedSteps</b> — finished checklist tasks
              </li>
              <li>
                <b>seenTours</b> — tours completed or dismissed (gates
                auto-launch)
              </li>
              <li>
                <b>dismissedDiscoveries</b> — tips the user closed
              </li>
            </ul>
          </div>
          <div className="state-note">
            💾 Saved to <code>localStorage</code> by default —{" "}
            <b>refresh the page</b> and you'll resume exactly here. Swap in an
            async adapter to persist to your backend instead.
          </div>
        </section>
      </Reveal>

      {/* Install */}
      <Reveal>
        <section className="card" data-tour="install">
          <SectionHead
            title="📦 Install & integrate"
            sub="Two imports and a provider."
          />
          <CodeBlock lang="bash" code="npm install react-guided-journey" />
          <CodeBlock
            code={`import { OnboardingProvider } from "react-guided-journey";
import "react-guided-journey/styles.css";

<OnboardingProvider
  config={{
    tours,
    journeys,
    role: user.role,
    userId: user.id,
    currentPath: location.pathname, // from your router
    onNavigate: navigate,           // from your router
  }}
>
  <App />
</OnboardingProvider>`}
          />
        </section>
      </Reveal>
    </div>
  );
}

function SectionHead({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="sec-head">
      <h2>{title}</h2>
      <p className="muted">{sub}</p>
    </div>
  );
}

function Ctl({
  icon,
  label,
  hint,
  onClick,
}: {
  icon: string;
  label: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button type="button" className="control" onClick={onClick}>
      <span className="control-ico">{icon}</span>
      <span className="control-label">{label}</span>
      <span className="control-hint">{hint}</span>
    </button>
  );
}

function Stat({
  n,
  label,
  sub,
}: {
  n: ReactNode;
  label: string;
  sub?: string;
}) {
  return (
    <div className="stat">
      <div className="stat-n">{n}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

function Info({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="info">
      <span className="info-ico">{icon}</span>
      <div>
        <p className="info-title">{title}</p>
        <p className="info-body">{children}</p>
      </div>
    </div>
  );
}
