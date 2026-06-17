import { useEffect, useState } from "react";
import { OnboardingProvider, useOnboarding } from "react-guided-journey";
import "react-guided-journey/styles.css";
import { THEMES, discoveries, journeys, tours } from "./config";
import { Demo } from "./Demo";
import { Docs } from "./Docs";

type View = "demo" | "docs";

// The Docs sub-nav uses in-page anchors (#install, #tours, …), so while you're
// reading the docs the hash is usually a section id, not "#docs". Treat any
// non-empty hash other than the demo's "#" as the docs view — that's what makes
// a refresh keep you on Docs instead of bouncing back to the demo.
function viewFromHash(): View {
  const h = window.location.hash.replace(/^#/, "");
  return h !== "" && h !== "demo" ? "docs" : "demo";
}

/**
 * Animated brand mark: a "guided journey" — a marker travels a dashed route
 * toward a pulsing destination node. Stroke uses the live accent color.
 */
function LogoMark() {
  return (
    <svg
      className="logo-mark"
      viewBox="0 0 32 32"
      width="28"
      height="28"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="rgj-logo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--accent)" />
          <stop offset="1" stopColor="#d946ef" />
        </linearGradient>
      </defs>
      <rect
        x="1.5"
        y="1.5"
        width="29"
        height="29"
        rx="8.5"
        fill="url(#rgj-logo)"
        opacity="0.16"
        stroke="url(#rgj-logo)"
        strokeWidth="1.3"
      />
      <path
        id="rgj-route"
        d="M8 23 C 9 13, 23 21, 24 9"
        fill="none"
        stroke="url(#rgj-logo)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeDasharray="3 4.5"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="15"
          to="0"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </path>
      {/* destination node */}
      <circle cx="24" cy="9" r="3" fill="var(--accent)">
        <animate
          attributeName="r"
          values="3;4.4;3"
          dur="2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="1;0.55;1"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
      {/* traveling marker */}
      <circle r="2.3" fill="#fff">
        <animateMotion dur="2.6s" repeatCount="indefinite" rotate="auto">
          <mpath href="#rgj-route" />
        </animateMotion>
      </circle>
    </svg>
  );
}

function ScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setPct(max > 0 ? (h.scrollTop / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return <div className="scroll-progress" style={{ width: `${pct}%` }} />;
}

function Topbar({ view, setView }: { view: View; setView: (v: View) => void }) {
  // Hide the sticky header while a tour runs so the spotlight never clashes
  // with it (a common pattern — fixed app chrome steps aside during a tour).
  const { tourRunning } = useOnboarding();
  return (
    <nav className={`topbar ${tourRunning ? "topbar-hidden" : ""}`}>
      <div className="topbar-inner">
        <span className="brand">
          <LogoMark />
          <span className="brand-text">guided-journey</span>
        </span>
        <div className="tabs">
          <button
            type="button"
            className={view === "demo" ? "tab tab-on" : "tab"}
            onClick={() => setView("demo")}
          >
            Demo
          </button>
          <button
            type="button"
            className={view === "docs" ? "tab tab-on" : "tab"}
            onClick={() => setView("docs")}
          >
            Docs
          </button>
        </div>
        <a
          className="topbar-cta"
          href="https://www.npmjs.com/package/react-guided-journey"
          target="_blank"
          rel="noreferrer"
        >
          npm ↗
        </a>
      </div>
    </nav>
  );
}

export function App() {
  const [accent, setAccent] = useState(THEMES[0].color);
  const [speed, setSpeed] = useState(220); // tour step transition (ms)
  const [view, setView] = useState<View>(viewFromHash);

  useEffect(() => {
    document.documentElement.style.setProperty("--rgj-primary", accent);
    document.documentElement.style.setProperty("--accent", accent);
  }, [accent]);

  // Keep the view in sync if the hash changes by other means (back/forward,
  // a manually edited URL). In-page doc anchors keep us on "docs", which is
  // correct. replaceState (used by tab clicks below) doesn't fire this.
  useEffect(() => {
    const onHashChange = () => setView(viewFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // Switch tabs: reflect the view in the URL hash (so a refresh restores the
  // same view) and reset the shared window scroll. Both views scroll the same
  // document, so without this the second view inherits the first's scroll
  // position (e.g. scroll the demo to the bottom, open Docs, land at the bottom).
  const selectView = (next: View) => {
    setView(next);
    window.history.replaceState(null, "", next === "docs" ? "#docs" : "#");
    window.scrollTo(0, 0);
  };

  return (
    <OnboardingProvider
      renderDefaultUI={view === "demo"}
      config={{
        tours,
        journeys,
        discoveries,
        userId: "demo-user",
        currentPath: "/",
        onNavigate: () => {},
        tooltipWidth: 340,
        transitionMs: speed,
        debug: true,
        callbacks: {
          onChecklistComplete: () =>
            console.log("🎉 onboarding complete callback fired"),
        },
      }}
    >
      <ScrollProgress />
      <Topbar view={view} setView={selectView} />

      <main className={`view ${view === "docs" ? "view-docs" : ""}`} key={view}>
        {view === "demo" ? (
          <Demo
            accent={accent}
            setAccent={setAccent}
            speed={speed}
            setSpeed={setSpeed}
          />
        ) : (
          <Docs />
        )}
      </main>

      <footer className="footer">
        <div className="footer-links">
          <a
            href="https://github.com/AlpeshB08/react-guided-journey"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <a
            href="https://www.npmjs.com/package/react-guided-journey"
            target="_blank"
            rel="noreferrer"
          >
            npm
          </a>
          <a
            className="coffee"
            href="https://github.com/sponsors/AlpeshB08"
            target="_blank"
            rel="noreferrer"
          >
            ♥ Sponsor
          </a>
        </div>
        <div className="footer-copy">
          © {new Date().getFullYear()} Alpesh Baraiya · Released under the{" "}
          <a
            href="https://opensource.org/licenses/MIT"
            target="_blank"
            rel="noreferrer"
          >
            MIT License
          </a>{" "}
          — free to use, modify and ship.
        </div>
        <div className="footer-keys">
          Press <kbd>Esc</kbd> to exit a tour, <kbd>→</kbd>/<kbd>←</kbd> to
          navigate
        </div>
      </footer>
    </OnboardingProvider>
  );
}
