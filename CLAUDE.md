# CLAUDE.md

Orientation doc for future Claude (or human) contributors. Covers what this
project is, how the code is organized, and the conventions that exist
intentionally vs. by accident.

## What this is

**Velocity OS** — a React + Vite single-page app demonstrating an "Enterprise
Knowledge & Strategy Operating System". The product target is a Chinese
enterprise (the seed data is for a fictional Chinese smart-appliance company,
**北海智能家居 / Beihai Smart Home**), so all UI strings, examples, and seed
data are in Simplified Chinese.

The app is a *prototype / demo*: there is no backend, no real auth, no
network I/O. Every piece of state lives in `useState` and resets on reload.
Modal-based CRUD writes to in-memory copies of seed data.

The product vision and PRD live in `docs/`:
- `docs/01_VISION_AND_CAPABILITIES.md` — English vision
- `docs/velocity_project_vision_v2_cn.md` — full Chinese vision
- `docs/velocity_prd_v2_cn.md` — Chinese PRD (drives most decisions in this repo)

The original design prototype (HTML + raw JSX) is preserved verbatim in
`Requirement/UIDesign/` for visual reference. The `src/` tree is essentially
a production port of that prototype, then extended with PRD-driven features
that the prototype itself never built.

## Stack

- **Vite 8 + React 19** with the new JSX transform.
- **No CSS framework.** All styles live in `src/styles/index.css` as a
  hand-rolled token + utility system. The token names match the design
  prototype's `tokens.css`/`app.css` (e.g. `--vel-indigo`, `--fg1..fg4`,
  `--slate-50..900`). Stay inside this vocabulary — don't add a new color
  unless there's a clear reason.
- **No router.** Navigation is `useState({ page, deptId? })` in `App.jsx`
  threaded through every page as `setRoute`. Deep-linking via URL is
  intentionally not implemented — the SPA fallback in `nginx.conf` ensures
  any URL renders the same shell.
- **No state library.** Lifted React state, plus seed data imported as ES
  modules. If you need cross-page state (e.g. notifications, command
  palette), prefer a `window.dispatchEvent` custom event over a context
  provider — the codebase already uses `velocity:open-palette` and the
  pattern is consistent.
- **Hand-rolled SVG icons** in `src/components/primitives.jsx`. Adding an
  icon: paste lucide-style path data into the `Icon` map. Don't pull in
  `lucide-react` — keeping the icon set self-contained is intentional.
- **Code splitting via `React.lazy`** for the three heaviest pages
  (Strategy / Workflows / Admin). Anything you build that's similarly heavy
  and not first-load critical should follow the same pattern in `App.jsx`.

## Where things live

```
src/
├── App.jsx              Root + lazy-loaded route switch + Suspense fallback
├── data/seed.js         Single source of truth for ALL demo data (~1000 lines)
├── styles/index.css     Tokens + every component class. No CSS-in-JS.
├── components/
│   ├── primitives.jsx   Icon, Spark, Progress, Avatar, HealthPill, KpiCard,
│   │                    Modal, ConfirmModal, EmptyState, makeId, STATUS_OPTS,
│   │                    HEALTH_OPTS — share these instead of re-inventing.
│   ├── Shell.jsx        Sidebar (with company chip + nav + user) and Topbar
│   │                    (with breadcrumbs, ⌘K search, notifications dropdown)
│   ├── CommandPalette.jsx  Global ⌘K palette indexing all entities
│   ├── ProjectDetail.jsx   Read-only project view modal
│   └── RunDialog.jsx       Shared run dialog for skills + workflows
└── pages/
    ├── HomePage.jsx
    ├── KnowledgePage.jsx              Knowledge sources / domains / graph /
    │                                  ingest queue / feedback
    ├── StrategyPage.jsx               Question registry + canvas + War Council
    ├── OkrPage.jsx                    Objectives / projects / decisions CRUD
    ├── DepartmentsIndex.jsx           Multi-level dept tree
    ├── DepartmentPage.jsx             Per-dept workspace tabs + assistant chat
    ├── SkillsPage.jsx
    ├── WorkflowsPage.jsx              Templates + run history + skill×domain map
    ├── AssistantsAndGovernance.jsx    Assistants + routing rules + governance
    │                                  + audit log (single file = single import)
    └── AdminPage.jsx                  Token usage / models / org / quota / audit
```

## Conventions

### Seed data (`src/data/seed.js`)

The whole app is data-driven from this one file. Each entity has a
hand-picked plausible Beihai-flavored entry — keep that voice in any
new seed (real Chinese vendor names, BP/SC/SA channel terminology,
奥维 market data references, etc.). Don't introduce lorem ipsum.

Major export shapes:
- `Company`, `Objectives[]`, `Projects[]`, `Departments[]`,
  `KnowledgeDomains[]`, `KnowledgeSources[]`, `SkillPacks[]`,
  `Workflows[]`, `WorkflowRuns[]`, `Decisions[]` (legacy, lite),
  `DecisionsRich[]` (current), `StrategyQuestions[]`, `Activity[]`,
  `KRCheckIns[]`, `Notifications[]`, `IngestQueueItems[]`,
  `AssistantRoutingRules[]`, `AuditLog[]`,
  `OrgTree`, `LLMs[]`, `PolicyRouting[]`, `DeptUsage[]`, `TopUsers[]`.
- Status enums always include `{ v, label, color }`:
  `STATUS_OPTS`, `HEALTH_OPTS`, `SKILL_SCOPES`, `SKILL_STATUSES`,
  `WORKFLOW_STATUSES`, `STRATEGY_STATUSES`, `DECISION_STATUSES`,
  `INGEST_STATES`, `ROUTE_PRIORITIES`, `AUDIT_CATEGORIES`,
  `NOTIFICATION_CATEGORIES`.
- IDs are kebab-style with a stable prefix (`obj-1`, `proj-1`, `ks-1`,
  `wf-design-brief`, `sq-1`, `kr-1-1`, `m1-1`, `r2-3`, `iq-1`,
  `au-1`, `n-1`, `rt-1`). Generated runtime IDs use `makeId(prefix)`
  from primitives.

### CRUD pattern

Pages that own a list (Objectives, Projects, Skills, Workflows, Routing
Rules, Decisions) follow the same shape:

```js
const [list, setList] = useState(() => Seed.map(x => ({ ...x })));
const [editing, setEditing] = useState(null);    // null | newDraft | clone of existing
const [confirm, setConfirm] = useState(null);    // null | { x }

function save(next) { setList(prev => upsert(prev, next)); setEditing(null); }
function del(id)   { setList(prev => prev.filter(x => x.id !== id)); setConfirm(null); }
function onNew()   { setEditing({ id: makeId("..."), ...defaults, __isNew: true }); }
```

Editor modals are controlled (parent owns the draft, editor calls
`onChange` on each field) and live in the same file as the page.
`__isNew` flag distinguishes Create vs. Edit in the modal title.

### Detail modals

Open with row click + Eye action; emit `onEdit` so the consumer can flip
to the editor. See `ProjectDetail.jsx` and the inline `DecisionDetail` /
`WorkflowDetail` / `KnowledgeSourceDetail` for the pattern.

### Run dialogs

Skills and Workflows share `components/RunDialog.jsx`. Pass
`kind="skill" | "workflow"`, `item`, optional `defaultInput`,
`outputBuilder({ item, input }) => { title, body, sources, meta }`,
and `onComplete({ item, input, output, duration, startedAt })`.
WorkflowsPage uses `onComplete` to persist a new run row; SkillsPage and
DepartmentPage do not.

### Routing rules

Anything that should "open the right page when clicked" passes
`{ page, deptId? }` to `setRoute`. The Cmd-K palette and audit log
drill-throughs use this directly; activity feed and notifications use
small inference helpers.

### Department workspace

`DepartmentPage` derives `dept` from `deptId` plus a per-deptId override
map (so config edits stick across nav). Don't add a setState-in-effect
sync — that pattern lints.

### Lint

The repo's pre-existing lint baseline includes ~325 errors that mostly
come from `import React` being unused under the new JSX transform. **Don't
fix these in bulk** — they're consistent project-wide and the convention
is to keep `import React` so files don't need to be re-touched if they
ever start using `React.something`. Fix only NEW errors you introduce.

Validate via `npm run lint` (count the errors before/after — target is
"no net increase").

### Build

`npm run build` must pass. Initial bundle is currently around 100 KB
gzipped; the heavy pages are lazy-chunked. New top-level pages should
weigh up before being included in the initial bundle.

## Testing

Playwright lives in `tests/e2e/`:
- `smoke.spec.js` — page-level smoke (sidebar, route load, lazy chunks,
  nginx healthz / SPA fallback / cache headers).
- `features.spec.js` — interaction-level (Cmd-K, project / decision
  detail, KR check-in, workflow editor, audit CSV, notifications,
  strategy question creation).

Run locally:
```bash
npm run test:e2e          # against `npm run dev` on :5173
BASE_URL=https://...      # override to point at a deployed URL
```

`npx playwright install chromium` may be blocked in some sandboxes;
Cloud Build's `mcr.microsoft.com/playwright:v1.59.1-jammy` image has it
baked in.

When you add a feature that has user-visible behavior:
1. Add a spec to `features.spec.js` with a semantic selector
   (`getByText`, `getByRole`) — avoid `data-testid` unless the text is
   truly ambiguous.
2. Skip nginx-level tests (`request.get('/healthz')`) on localhost
   via `test.skip(!baseURL?.startsWith("http"), ...)`.

## Deploy pipeline

`Dockerfile` is a 2-stage build (Node → Nginx). `nginx.conf` listens on
`8080` (Cloud Run convention), serves `/assets/*` with 1y immutable
cache, no-cache on `index.html`, SPA fallback, plus `/healthz`.

`cloudbuild.yaml` does build → push → Cloud Run deploy → Playwright e2e
against `_BASE_URL`. The trigger needs to be configured in **"Cloud
Build configuration file"** mode pointing at `/cloudbuild.yaml` (not the
auto-Dockerfile mode).

`.dockerignore` keeps `tests/`, `playwright-report`, `cloudbuild.yaml`,
`docs/`, `Requirement/`, `.claude/` etc. out of the image.

## When you're adding a feature

A typical loop:

1. **Read the PRD section** (`docs/velocity_prd_v2_cn.md`) the feature maps
   to. The PRD usually specifies the data model (in TS-ish notation), the
   user story, and the functional requirements.
2. **Extend seed.js** with any new entity arrays + status enums, in the
   Beihai voice.
3. **Wire it into an existing page** if it fits, or add a new page in
   `src/pages/`. New top-level pages also need:
   - Entry in `src/App.jsx` `renderPage()`.
   - Entry in `src/components/Shell.jsx` `NAV` and `crumbs` map.
   - Index entry in `src/components/CommandPalette.jsx` `buildIndex()`.
4. **Reuse primitives** — `Modal`, `ConfirmModal`, `KpiCard`, `HealthPill`,
   `Progress`, `Spark`, table conventions, pill classes
   (`pill--ok|warn|danger|info|indigo|neutral|ghost`). If you find yourself
   reaching for a new color or a new modal layout, that's a smell.
5. **Validate**: `npm run build` (must pass), `npm run lint` (no net new
   errors), `npx playwright test --list` (specs parse), then add a spec
   if the feature is user-visible.
6. **Commit with a clear "what + why" message.** Existing commits use a
   detailed multi-paragraph message; keep that voice.

## Things to NOT do

- **Don't add a CSS framework.** Tokens live in `index.css`, period.
- **Don't add a state library.** React state + custom events is enough.
- **Don't add a router.** The `setRoute` pattern intentionally forfeits
  URL-based deep linking — adding a router would require revisiting the
  Cmd-K palette, breadcrumbs, and Cloud Build smoke specs.
- **Don't add real network I/O / a backend.** This is a demo. Mock with
  `setTimeout` in run dialogs, `useState` for everything.
- **Don't hardcode lorem ipsum.** Beihai voice or nothing. Read existing
  seed entries for tone.
- **Don't bulk-fix the pre-existing lint warnings.** They're stable noise.
- **Don't introduce English UI strings.** All user-visible labels are
  Simplified Chinese; English is fine in code, comments, and `aria-label`.

## Useful entry points

| Want to … | Look at |
|---|---|
| Add a new top-level page | `src/App.jsx`, `src/components/Shell.jsx`, `src/components/CommandPalette.jsx` |
| Add a new entity type | `src/data/seed.js` first, then a page that owns it |
| Add a CRUD list | Skill, Workflow, or Routing-rule patterns are interchangeable templates |
| Add a detail modal | `ProjectDetail.jsx` or `DecisionDetail` (in OkrPage.jsx) |
| Run something stepwise (skill / workflow) | `components/RunDialog.jsx` |
| Filter / search a list | The OkrPage projects tab and Workflows page show two flavors |
| Trigger UI from another component | `window.dispatchEvent(new Event("velocity:..."))` |
| Add a test | `tests/e2e/features.spec.js` |

If something here is wrong or out of date, fix this file in the same
commit as the divergence. The doc is meant to be cheap to keep current.
