import { type ReactNode, useEffect, useState } from "react";
import { CodeBlock } from "./ui";

const SECTIONS = [
  { id: "requirements", label: "Requirements" },
  { id: "install", label: "Installation" },
  { id: "structure", label: "Project structure" },
  { id: "quickstart", label: "Provider & config" },
  { id: "tours", label: "Tours" },
  { id: "checklist", label: "Checklist (journeys)" },
  { id: "autolaunch", label: "Welcome & auto-launch" },
  { id: "roles", label: "Roles & access" },
  { id: "tips", label: "Discovery tips" },
  { id: "theming", label: "Theming" },
  { id: "persistence", label: "Persistence" },
  { id: "api", label: "API & hooks" },
  { id: "custom-ui", label: "Custom UI" },
];

export function Docs() {
  const [active, setActive] = useState("install");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    for (const s of SECTIONS) {
      const el = document.getElementById(s.id);
      if (!el) continue;
      const io = new IntersectionObserver(
        ([e]) => e.isIntersecting && setActive(s.id),
        { rootMargin: "-25% 0px -65% 0px" },
      );
      io.observe(el);
      observers.push(io);
    }
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <div className="docs">
      <aside className="docs-nav">
        <p className="docs-nav-title">Documentation</p>
        <nav>
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={active === s.id ? "docs-link-on" : ""}
            >
              {s.label}
            </a>
          ))}
        </nav>
        <a
          className="docs-gh"
          href="https://www.npmjs.com/package/react-guided-journey"
          target="_blank"
          rel="noreferrer"
        >
          ↗ npm package
        </a>
      </aside>

      <article className="docs-body">
        <Doc id="requirements" title="Requirements">
          <p>
            react-guided-journey is a <b>React</b> library — it renders with
            React and React DOM, so it works in any React-based app or
            framework, but not in non-React frameworks.
          </p>
          <PropsTable
            head={["Requirement", "Version", "Notes"]}
            rows={[
              [
                "react",
                ">= 18",
                "Peer dependency. Uses useSyncExternalStore (React 18+).",
              ],
              [
                "react-dom",
                ">= 18",
                "Peer dependency. Tooltips/tips are portaled to <body>.",
              ],
              [
                "A bundler",
                "any",
                "Vite, Webpack, Next, Remix, etc. — ships ESM + CJS + types.",
              ],
              [
                "TypeScript",
                "optional",
                "Fully typed; works fine in plain JS too.",
              ],
            ]}
          />
          <p>
            <b>Runtime dependencies: zero.</b> The store is a tiny internal{" "}
            <Code>useSyncExternalStore</Code> implementation — no Redux, no
            Zustand, nothing added to your bundle but the library itself (&lt;
            12&nbsp;kb gzipped).
          </p>
          <ul className="doc-list">
            <li>
              <b>Works with:</b> Vite, Create React App, Next.js (App or Pages
              router), Remix, Gatsby, React Router, TanStack Router — anything
              React.
            </li>
            <li>
              <b>Not for:</b> Vue, Angular, Svelte, or vanilla JS (it's
              React-only).
            </li>
            <li>
              <b>SSR:</b> safe — the localStorage adapter no-ops on the server,
              and overlays mount on the client.
            </li>
          </ul>
        </Doc>

        <Doc id="install" title="Installation">
          <p>React 18+ is the only peer dependency.</p>
          <CodeBlock lang="bash" code="npm install react-guided-journey" />
          <p>Import the stylesheet once, at your app's entry point:</p>
          <CodeBlock
            lang="ts"
            code={`// src/main.tsx (or App root)
import "react-guided-journey/styles.css";`}
          />
          <Callout>
            Forgetting this import is the #1 reason tours "don't show up" — the
            components render, but unstyled (invisible).
          </Callout>
        </Doc>

        <Doc id="structure" title="Project structure (recommended)">
          <p>
            The library is config-driven. The React-standard approach is to keep
            your tour/journey definitions in plain data files and mount one
            provider near the root. Nothing here is required — it's just the
            convention that scales best.
          </p>
          <FileTree
            lines={[
              "src/",
              "├─ onboarding/",
              "│  ├─ tours.ts         # TourConfig[]  — your guided tours",
              "│  ├─ journeys.ts      # JourneyConfig[] — checklist + welcome",
              "│  ├─ discoveries.ts   # DiscoveryConfig[] — tips",
              "│  └─ index.ts         # re-export all three",
              "├─ providers/",
              "│  └─ AppProviders.tsx # <OnboardingProvider> lives here",
              "└─ main.tsx            # imports styles.css once",
            ]}
          />
          <p>
            <b>Where each thing goes:</b>
          </p>
          <ul className="doc-list">
            <li>
              <b>Provider</b> — once, near the root, <i>inside</i> your router
              so it can read the path. Wrap your whole app.
            </li>
            <li>
              <b>Tours / journeys / discoveries</b> — plain data arrays in their
              own files, passed to the provider's <Code>config</Code>.
            </li>
            <li>
              <b>Tour targets</b> — add a <Code>data-tour="…"</Code> attribute
              to the component you want to spotlight, wherever it lives.
            </li>
            <li>
              <b>&lt;DiscoveryBanner /&gt;</b> — drop it on the page where that
              tip belongs (it self-hides once dismissed).
            </li>
            <li>
              <b>Default UI</b> (checklist pill, help center, welcome modal) —
              rendered automatically by the provider. No placement needed.
            </li>
          </ul>
        </Doc>

        <Doc id="quickstart" title="Provider & config">
          <p>
            Mount <b>one</b> provider near the root of your app,{" "}
            <b>inside your router</b> (it reads the router's hooks). Everything
            that should show tours/checklist/help goes inside it — i.e. your
            whole app. The nesting is always{" "}
            <b>Router → OnboardingProvider → App</b>. Here's the complete{" "}
            <Code>main.tsx</Code>:
          </p>
          <CodeBlock
            code={`// src/main.tsx
import { createRoot } from "react-dom/client";
import { BrowserRouter, useLocation, useNavigate } from "react-router-dom";
import { OnboardingProvider } from "react-guided-journey";
import "react-guided-journey/styles.css";
import App from "./App";
import { tours, journeys } from "./onboarding/config";

// Wrapper so we can read the router hooks (it must be inside the router).
function AppProviders({ children }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  return (
    <OnboardingProvider
      config={{
        tours,
        journeys,
        currentPath: pathname,   // from the router
        onNavigate: navigate,    // from the router
        // role:   user?.role,   // optional
        // userId: user?.id,     // optional (keeps each user's progress)
      }}
    >
      {children}
    </OnboardingProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AppProviders>
      <App />
    </AppProviders>
  </BrowserRouter>,
);`}
          />
          <Callout>
            Order matters: <Code>&lt;BrowserRouter&gt;</Code> →{" "}
            <Code>&lt;AppProviders&gt;</Code> (the provider) →{" "}
            <Code>&lt;App /&gt;</Code>. The provider must be inside the router,
            and your app inside the provider.
          </Callout>
          <p className="mt-4">
            That's the whole wiring — the welcome modal, checklist pill, help
            center and tours now render automatically. Add a{" "}
            <Code>data-tour</Code> attribute to anything you want a tour to
            point at (see{" "}
            <a className="docs-link" href="#tours">
              Tours
            </a>
            ).
          </p>
          <p>
            <b>What every config prop does:</b>
          </p>
          <PropsTable
            rows={[
              [
                "tours",
                "TourConfig[]",
                "Your guided tours (spotlight walkthroughs). Required.",
              ],
              [
                "journeys",
                "JourneyConfig[]",
                "Checklists + welcome modal, optionally per role.",
              ],
              [
                "discoveries",
                "DiscoveryConfig[]",
                "Tip definitions rendered by <DiscoveryBanner>.",
              ],
              [
                "role",
                "string?",
                "Current user's role. Filters which tours/journeys show. Omit = everyone.",
              ],
              [
                "userId",
                "string | number?",
                "Namespaces saved state so each user resumes their own progress.",
              ],
              [
                "currentPath",
                "string",
                "Your router's current path — powers auto-launch & navigate-then-tour. Required.",
              ],
              [
                "onNavigate",
                "(route) => void",
                "Your router's navigate — used by 'Show me how' to change pages first.",
              ],
              [
                "persistence",
                "PersistenceAdapter?",
                "Where to save state. Defaults to localStorage; pass your own for a DB.",
              ],
              [
                "theme",
                "OnboardingTheme?",
                "Theme tokens (primary, radius…) injected as CSS variables.",
              ],
              [
                "callbacks",
                "OnboardingCallbacks?",
                "onTourComplete, onStepChange, onChecklistComplete, etc.",
              ],
              [
                "transitionMs",
                "number?",
                "Speed (ms) of the step-to-step glide/fade. Default 220; 0 disables.",
              ],
              [
                "tooltipWidth",
                "number?",
                "Default tooltip width in px (override per-step with step.width). Default 320.",
              ],
              [
                "debug",
                "boolean?",
                "Show a visible warning in-tooltip when a step's target isn't found.",
              ],
            ]}
          />
          <Callout>
            Render the provider <b>inside</b> your <Code>&lt;Router&gt;</Code>,
            so <Code>useLocation</Code> / <Code>useNavigate</Code> are
            available.
          </Callout>
        </Doc>

        <Doc id="tours" title="Tours">
          <p>
            Define tours as a data array (e.g. <Code>onboarding/tours.ts</Code>)
            and pass it to the provider. A tour is steps tied to a route; set{" "}
            <Code>autoLaunch</Code> to start it on first visit.
          </p>
          <CodeBlock
            code={`// onboarding/tours.ts
import type { TourConfig } from "react-guided-journey";

export const tours: TourConfig[] = [{
  id: "dashboard",
  title: "Dashboard tour",
  route: "/",                     // where this tour runs
  autoLaunch: true,               // start on first visit to the route
  roles: ["admin"],               // optional — who sees it
  checklistStepId: "see-dashboard", // mark this task done when finished
  steps: [{
    id: "stats",
    target: "[data-tour='stats']", // any CSS selector
    title: "Your stats",
    content: "These update live.",
    placement: "bottom",           // top|bottom|left|right|*-start|*-end|center
    width: 320,                    // optional per-step width
    onBeforeStep: async () => openSidebar(), // awaited before highlighting
    onAfterStep: () => closeSidebar(),
  }],
}];`}
          />
          <p>
            Then mark the element to spotlight — anywhere in your component
            tree:
          </p>
          <CodeBlock
            lang="tsx"
            code={`// components/StatsCard.tsx
<section data-tour="stats">…</section>`}
          />
          <p>
            <b>
              Where the <Code>data-tour</Code> attribute goes:
            </b>{" "}
            on the JSX of the component you want to spotlight — <i>not</i> in
            the tour config. The config only holds the matching selector (
            <Code>target: "[data-tour='stats']"</Code>); the attribute itself
            lives on the real element, wherever that component renders.
          </p>
          <ul className="doc-list">
            <li>
              <b>Async / lazily-rendered targets</b> — elements that only appear
              after a data fetch are handled automatically. A{" "}
              <Code>MutationObserver</Code> waits for the element to mount, so
              you don't need timeouts or any extra config.
            </li>
            <li>
              <b>Step not showing? Turn on debug.</b> Set{" "}
              <Code>debug: true</Code> in the provider config while developing.
              When a step's <Code>target</Code> selector can't be found in the
              DOM, the tooltip shows a visible warning (and it always logs to
              the console) — so a typo'd selector or a missing{" "}
              <Code>data-tour</Code> attribute is obvious instead of silent.
            </li>
          </ul>
        </Doc>

        <Doc id="checklist" title="Checklist (journeys)">
          <p>
            A journey is a getting-started checklist plus an optional welcome
            modal. Keep it in <Code>onboarding/journeys.ts</Code>. A task with a{" "}
            <Code>tourId</Code> shows a "Show me how" button; finishing that
            tour ticks the task off.
          </p>
          <CodeBlock
            code={`// onboarding/journeys.ts
import type { JourneyConfig } from "react-guided-journey";

export const journeys: JourneyConfig[] = [{
  roles: ["admin"],          // omit for everyone (see "Roles & access")
  checklistTitle: "Getting started",
  welcome: { title: "Welcome 👋", body: "Let's set up.", primaryLabel: "Start" },
  steps: [
    { id: "see-dashboard", title: "Take the tour", tourId: "dashboard", order: 1 },
    { id: "invite-team",   title: "Invite your team", route: "/team", order: 2 },
  ],
}];`}
          />
          <p>
            The checklist pill, progress bar and welcome modal render
            automatically — you don't place them anywhere.
          </p>
        </Doc>

        <Doc id="autolaunch" title="Welcome & auto-launch">
          <p>
            A journey's <Code>welcome</Code> modal and a tour's{" "}
            <Code>autoLaunch</Code> are <b>independent</b> — they're configured
            in different places and don't wait on each other. Knowing exactly
            how they interact saves a lot of "why did the tour fire over the
            welcome popup?" confusion.
          </p>
          <ul className="doc-list">
            <li>
              If a journey defines <Code>welcome</Code> <i>and</i> a tour on the
              same route has <Code>autoLaunch: true</Code>, <b>both trigger</b>.
              Auto-launch does <b>not</b> wait for the welcome modal to be
              closed first.
            </li>
            <li>
              Auto-launch is <b>not</b> gated behind <Code>welcomeSeen</Code> —
              it fires as soon as the route is matched (after{" "}
              <Code>autoLaunchDelay</Code>, default 600&nbsp;ms), regardless of
              whether the welcome has been seen.
            </li>
            <li>
              The only gate is <Code>seenTours</Code>: a tour lands there once
              it's <b>completed or dismissed</b>, and won't auto-launch again.
              The welcome modal has no effect on that gate.
            </li>
          </ul>
          <Callout>
            Want "Welcome → checklist → Show me how → tour" rather than a tour
            firing on top of the welcome? Keep <Code>autoLaunch: false</Code>{" "}
            and let the checklist's "Show me how" button start the tour.
          </Callout>
          <p className="mt-4">
            <b>Pick the flow you want:</b>
          </p>
          <div className="ptable-wrap">
            <table className="ptable">
              <thead>
                <tr>
                  <th>Goal</th>
                  <th>Config</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Welcome → checklist → "Show me how" → tour</td>
                  <td>
                    Define <Code>welcome</Code>, set{" "}
                    <Code>autoLaunch: false</Code>
                  </td>
                </tr>
                <tr>
                  <td>Tour auto-starts, no welcome</td>
                  <td>
                    <Code>autoLaunch: true</Code>, don't define{" "}
                    <Code>welcome</Code>
                  </td>
                </tr>
                <tr>
                  <td>Welcome → "Start" click → tour immediately</td>
                  <td>
                    <Code>renderDefaultUI={"{false}"}</Code> + custom modal
                    calling <Code>startTour()</Code>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Doc>

        <Doc id="roles" title="Roles & access">
          <p>
            Roles are plain strings <i>you</i> define — the library never
            assumes an auth system. You pass the current user's role once via{" "}
            <Code>config.role</Code>, and each tour / journey / tip declares
            which roles may see it.
          </p>
          <PropsTable
            rows={[
              [
                "roles omitted / []",
                "everyone",
                "No role restriction — shown to all users (single-role apps can ignore roles entirely).",
              ],
              [
                'roles: ["admin"]',
                "single role",
                "Only users whose role === 'admin' see it.",
              ],
              [
                'roles: ["admin","owner"]',
                "multiple roles",
                "Shown if the user's role is any of the listed roles.",
              ],
            ]}
            head={["roles value", "Meaning", "Behaviour"]}
          />
          <p>
            <b>Single-role / no-roles app?</b> Just omit <Code>role</Code> and
            the <Code>roles</Code> field everywhere — everything shows to
            everyone.
          </p>
          <Callout className="mb-4">
            <b>Gotcha — undefined role vs. empty roles.</b> If a tour/journey
            declares <Code>roles</Code> but <Code>config.role</Code> is{" "}
            <Code>undefined</Code> (e.g. your auth's <Code>user?.role</Code>{" "}
            hasn't loaded yet), <b>nothing matches and no content shows</b> —
            silently. Omitting <Code>roles</Code> (or <Code>roles: []</Code>)
            means <i>everyone</i>; an <i>undefined</i> role checked against a{" "}
            <i>defined</i> <Code>roles</Code> list means <i>no-one</i>. If a
            journey "won't appear", log <Code>config.role</Code> and confirm
            it's one of the journey's <Code>roles</Code>. In a single-role app,
            drop the <Code>roles</Code> field from your tours/journeys entirely
            so a missing role can never gate them out.
          </Callout>
          <CodeBlock
            code={`// Multi-role: pick the journey + tours for this user
<OnboardingProvider config={{ ...config, role: user.role }}>

// Single-role app: omit role entirely — all content shows
<OnboardingProvider config={{ tours, journeys, currentPath, ... }}>`}
          />
          <p>
            When multiple journeys match, the most specific role-matched journey
            wins, falling back to the first journey with no <Code>roles</Code>.
          </p>
        </Doc>

        <Doc id="tips" title="Discovery tips">
          <p>
            Small dismissible highlights for a feature or page. Define them in{" "}
            <Code>onboarding/discoveries.ts</Code>, then drop a{" "}
            <Code>&lt;DiscoveryBanner /&gt;</Code> on the page where the tip
            belongs. Inline or pinned to a corner; each has its own icon, accent
            and optional CTA. Dismissals persist.
          </p>
          <CodeBlock
            code={`// onboarding/discoveries.ts
export const discoveries = [{
  id: "new-reports",
  icon: "🎉",
  title: "New: Reports",
  body: "Export your data as CSV.",
  placement: "bottom-right", // inline | bottom-right | bottom-left | top-right | top-left
  accent: "#059669",
  roles: ["admin"],          // optional
  action: { label: "Show me", onClick: () => navigate("/reports") },
}];`}
          />
          <CodeBlock
            lang="tsx"
            code={`// ReportsPage.tsx — place where the tip should appear
import { DiscoveryBanner } from "react-guided-journey";

<DiscoveryBanner id="new-reports" />`}
          />
          <p>
            Inline tips sit in the document flow; floating ones are portaled to{" "}
            <Code>&lt;body&gt;</Code>, so a sticky header can't hide them.
          </p>
        </Doc>

        <Doc id="theming" title="Theming">
          <p>Three ways, easiest first:</p>
          <p>
            <b>
              1. The <Code>theme</Code> prop
            </b>{" "}
            — pass it to the provider, no stylesheet edit:
          </p>
          <CodeBlock
            code={`<OnboardingProvider config={{
  ...config,
  theme: { primary: "#e11d48", radius: "8px", surface: "#fff" },
}}>`}
          />
          <p>
            <b>2. Override CSS variables</b> in a stylesheet loaded after the
            library's:
          </p>
          <CodeBlock
            lang="css"
            code={`:root {
  --rgj-primary: #e11d48;
  --rgj-radius: 8px;
  --rgj-surface: #ffffff;
  --rgj-text: #111827;
}`}
          />
          <p>
            <b>3. Auto-adopt your brand tokens</b> — the defaults fall back to{" "}
            <Code>--brand</Code>, <Code>--color-primary</Code>,{" "}
            <Code>--color-surface</Code> and <Code>--radius</Code> if you
            already define them. So if your design system uses those, the
            widgets match your palette with <b>zero config</b>.
          </p>
        </Doc>

        <Doc id="persistence" title="Persistence">
          <p>
            Progress is saved so users resume where they left off. The entire
            saved shape is just four fields:
          </p>
          <PropsTable
            head={["Field", "Type", "Meaning"]}
            rows={[
              ["welcomeSeen", "boolean", "Has the welcome modal been shown."],
              ["completedSteps", "string[]", "Finished checklist task ids."],
              [
                "seenTours",
                "string[]",
                "Tours completed or dismissed (gates auto-launch).",
              ],
              ["dismissedDiscoveries", "string[]", "Tip ids the user closed."],
            ]}
          />
          <p>
            <b>Default:</b> a <Code>localStorage</Code> adapter, namespaced by{" "}
            <Code>userId</Code> (so each user has their own progress, and signed
            -out users don't collide). No setup required.
          </p>
          <Callout>
            <b>
              <Code>userId</Code> matters in multi-user apps.
            </b>{" "}
            Omit it and every user on that device shares the <i>same</i>{" "}
            localStorage key — if user A finishes a tour, user B sees it as
            already seen. Pass <Code>userId: user.id</Code> so each person gets
            their own namespace. When <Code>userId</Code> changes (a different
            user logs in), state automatically switches to that user's namespace
            — the previous user's progress doesn't linger or carry over.
          </Callout>
          <p className="mt-4">
            <b>Persist to your backend</b> by implementing a{" "}
            <Code>PersistenceAdapter</Code>. Both <Code>load</Code> and{" "}
            <Code>save</Code> may be synchronous or return a Promise — the
            provider awaits <Code>load</Code> on mount and calls{" "}
            <Code>save</Code> whenever a persisted field changes (debounced to
            real changes only):
          </p>
          <CodeBlock
            code={`import type { PersistenceAdapter, PersistedState } from "react-guided-journey";

const adapter: PersistenceAdapter = {
  // Called once on mount. Return null to start fresh.
  async load(): Promise<PersistedState | null> {
    const res = await fetch(\`/api/onboarding/\${userId}\`);
    if (!res.ok) return null;          // 404 → first-time user
    return res.json();
  },

  // Called on every persisted change. Fire-and-forget; errors won't crash UI.
  async save(state: PersistedState): Promise<void> {
    await fetch(\`/api/onboarding/\${userId}\`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    });
  },

  // Optional — called by reset().
  async clear(): Promise<void> {
    await fetch(\`/api/onboarding/\${userId}\`, { method: "DELETE" });
  },
};

<OnboardingProvider config={{ ...config, persistence: adapter }} />`}
          />
          <Callout>
            Because the shape is four plain id-arrays, it maps to a single DB
            row / document — no schema gymnastics. You can also keep
            localStorage and sync to your API in the background from{" "}
            <Code>save</Code>.
          </Callout>
        </Doc>

        <Doc id="api" title="API & hooks">
          <p>
            Call <Code>useOnboarding()</Code> anywhere inside the provider to
            drive it from your own UI (a custom "Help" button, etc.):
          </p>
          <CodeBlock
            code={`import { useOnboarding } from "react-guided-journey";

function HelpButton() {
  const { startTour, setHelpCenterOpen, progressPercent } = useOnboarding();
  return <button onClick={() => setHelpCenterOpen(true)}>Help</button>;
}

// Available: startTour, endTour, dismissTour, toggleChecklist,
// setHelpCenterOpen, completeStep, reset
// Derived: journey, progressPercent, completedCount, onboardingCompleted`}
          />
          <p>
            Want a fully custom look? Set{" "}
            <Code>renderDefaultUI={"{false}"}</Code> and compose your own UI —
            see{" "}
            <a className="docs-link" href="#custom-ui">
              Custom UI
            </a>{" "}
            below.
          </p>
        </Doc>

        <Doc id="custom-ui" title="Custom UI & programmatic control">
          <p>
            Set <Code>renderDefaultUI={"{false}"}</Code> on the provider to drop
            the built-in surfaces and build your own. Exactly three components
            stop rendering — <Code>&lt;WelcomeModal /&gt;</Code>,{" "}
            <Code>&lt;Checklist /&gt;</Code> and{" "}
            <Code>&lt;HelpCenter /&gt;</Code>.{" "}
            <Code>&lt;TourRenderer /&gt;</Code> <b>always</b> renders — the
            provider mounts it for you regardless, so tours keep working even
            with your own UI.
          </p>
          <PropsTable
            head={["Component", "Renders when", "What it is"]}
            rows={[
              [
                "<WelcomeModal/>",
                "renderDefaultUI",
                "First-run welcome popup.",
              ],
              [
                "<Checklist />",
                "renderDefaultUI",
                "Getting-started checklist pill + panel.",
              ],
              [
                "<HelpCenter />",
                "renderDefaultUI",
                "Help center panel (replay any tour).",
              ],
              [
                "<TourRenderer/>",
                "always",
                "Tour spotlight + tooltip. Mounted by the provider — you don't add it.",
              ],
            ]}
          />
          <p>
            All four are exported, so you can also mount them individually if
            you want some defaults but not others. Drive everything from{" "}
            <Code>useOnboarding()</Code>:
          </p>
          <CodeBlock
            lang="tsx"
            code={`import { OnboardingProvider, useOnboarding } from "react-guided-journey";

function CustomWelcome() {
  const { welcomeSeen, markWelcomeSeen, startTour, setChecklistOpen } =
    useOnboarding();
  if (welcomeSeen) return null;

  return (
    <div className="my-modal">
      <h2>Welcome 👋</h2>
      <button onClick={() => { markWelcomeSeen(); startTour("dashboard"); }}>
        Start the tour
      </button>
      <button onClick={() => { markWelcomeSeen(); setChecklistOpen(true); }}>
        Later — show me the checklist
      </button>
    </div>
  );
}

<OnboardingProvider renderDefaultUI={false} config={config}>
  <App />
  <CustomWelcome />
  {/* No <TourRenderer /> needed — the provider renders it for you. */}
</OnboardingProvider>`}
          />
          <Callout>
            Handy actions on <Code>useOnboarding()</Code>:{" "}
            <Code>startTour(id)</Code>, <Code>markWelcomeSeen()</Code>,{" "}
            <Code>setChecklistOpen(open)</Code>, <Code>toggleChecklist()</Code>,{" "}
            <Code>setHelpCenterOpen(open)</Code>, <Code>completeStep(id)</Code>{" "}
            and <Code>reset()</Code>.
          </Callout>

          <h3 className="doc-subhead">
            Starting a tour on another route (navigate-then-tour)
          </h3>
          <p>
            Calling <Code>startTour(id)</Code> directly only works when you're
            already on the tour's <Code>route</Code> — its target elements have
            to be in the DOM. To kick off a tour that lives on a{" "}
            <i>different</i> route, use <Code>setPendingTour(id)</Code> instead:
            the library navigates there (via your <Code>onNavigate</Code>) and
            auto-starts the tour the moment the route matches.
          </p>
          <CodeBlock
            lang="tsx"
            code={`const { setPendingTour, navigate } = useOnboarding();

// From anywhere — even a different page. Navigates, then starts the tour
// once its route is matched:
setPendingTour("billing-tour");

// navigate is just your router's navigate (config.onNavigate), re-exposed
// so you don't reach for window.history directly:
navigate("/settings/billing");`}
          />
          <Callout>
            The built-in checklist's "Show me how" button already uses this
            exact flow (<Code>startTour</Code> when on-route, otherwise{" "}
            <Code>setPendingTour</Code> + navigate). Reach for{" "}
            <Code>setPendingTour</Code> only when wiring a tour into your own
            UI.
          </Callout>
        </Doc>

        <div className="docs-foot">
          That's everything. Questions or bugs →{" "}
          <a href="https://github.com" target="_blank" rel="noreferrer">
            open an issue
          </a>
          .
        </div>
      </article>
    </div>
  );
}

function Doc({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="doc-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function Code({ children }: { children: ReactNode }) {
  return <code className="inline-code">{children}</code>;
}

function Callout({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`callout ${className}`}>💡 {children}</div>;
}

function FileTree({ lines }: { lines: string[] }) {
  return (
    <pre className="filetree">
      <code>{lines.join("\n")}</code>
    </pre>
  );
}

function PropsTable({
  className,
  rows,
  head = ["Prop", "Type", "What it does"],
}: {
  className?: string;
  rows: string[][];
  head?: string[];
}) {
  return (
    <div className={`ptable-wrap ${className}`}>
      <table className="ptable">
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]}>
              <td>
                <code className="inline-code">{r[0]}</code>
              </td>
              <td className="ptable-type">{r[1]}</td>
              <td>{r[2]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
