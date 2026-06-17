# GuideFlow – Onboarding Knowledge Hub

A centralized workspace for onboarding documentation, setup guides, meeting notes, and checklists — built to help new team members ramp up faster.

---

## Problem Statement

When a new student, intern, engineer, or open-source contributor joins a team, they rarely have a clear path forward. Setup guides live in email threads. Meeting notes are buried in Slack. Project documentation is scattered across Google Docs, wikis, and GitHub READMEs. The result: days or weeks spent hunting for context instead of doing meaningful work.

GuideFlow solves this by giving teams a single, searchable workspace for all onboarding knowledge.

---

## Solution

GuideFlow centralizes onboarding documents, project guides, meeting notes, and task checklists into one organized hub. New team members can search across everything, track their onboarding progress, and use AI-generated summaries to quickly understand long documents — without waiting on someone to walk them through it.

---

## Key Features

- **Workspace-based document organization** — group documents by team, project, or onboarding phase
- **Create, edit, and manage onboarding documents** — rich text editing with a clean, focused interface
- **Full-text search across documents** — find any guide, note, or checklist instantly
- **Onboarding checklist progress tracking** — track completed steps and see what's left at a glance
- **AI-assisted document summaries** — paste in a long doc and get a concise summary powered by the OpenAI API
- **Responsive web interface** — works on desktop and mobile without degradation
- **Basic analytics** — surface frequently searched topics and highlight incomplete onboarding steps

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript |
| Styling | HTML / CSS (responsive) |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Search | FlexSearch or PostgreSQL full-text search |
| AI Summaries | OpenAI API (optional) |

---

## Architecture Overview

```
┌─────────────────────────────────┐
│         React + TypeScript      │  ← Frontend UI, checklist, search bar, editor
└────────────────┬────────────────┘
                 │ REST API
┌────────────────▼────────────────┐
│         Node.js / Express       │  ← Auth, document CRUD, search routing
└────────────────┬────────────────┘
                 │
       ┌─────────┴─────────┐
       │                   │
┌──────▼──────┐    ┌───────▼────────┐
│  PostgreSQL  │    │  Search Layer  │  ← FlexSearch (client) or PG full-text
│  (docs, users│    │                │
│  checklists) │    └───────┬────────┘
└─────────────┘            │
                   ┌────────▼────────┐
                   │  OpenAI API     │  ← Optional: document summarization
                   └─────────────────┘
```

---

## Impact / Why This Matters

GuideFlow is designed with measurable outcomes in mind:

- **500+ seeded documents** available in the demo workspace to test search and navigation at scale
- **Target query latency under 200ms** for full-text search across the document corpus
- **Goal of 50–60% reduction in information lookup time** based on usability testing benchmarks
- Helps new users complete structured onboarding without relying on synchronous help from teammates

These targets reflect realistic engineering goals, not marketing claims.

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- An OpenAI API key (optional, for AI summaries)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/guideflow.git
cd guideflow
```

### 2. Install dependencies

```bash
# Frontend
cd client
npm install

# Backend
cd ../server
npm install
```

### 3. Set up environment variables

Copy the example env file and fill in your values:

```bash
cp server/.env.example server/.env
```

```env
DATABASE_URL=postgresql://user:password@localhost:5432/guideflow
OPENAI_API_KEY=your_openai_key_here   # optional
PORT=4000
```

### 4. Run database migrations and seed data

```bash
cd server
npm run migrate
npm run seed        # loads 500+ sample onboarding documents
```

### 5. Start the development servers

```bash
# Backend (from /server)
npm run dev         # http://localhost:4000

# Frontend (from /client)
npm run dev         # http://localhost:5173
```

---

## Future Improvements

- **Role-based permissions** — control which documents are visible to interns vs. full-time engineers
- **Team invitations** — invite teammates via email and assign onboarding tracks
- **Better onboarding analytics** — time-to-completion metrics, drop-off points, search trends
- **File upload support** — attach PDFs, images, and other resources directly to documents
- **Slack / Discord import** — pull in pinned messages and channel summaries automatically
- **Semantic search** — go beyond keyword matching with embedding-based similarity search

---

## License

MIT
