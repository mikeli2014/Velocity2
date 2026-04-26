# Velocity OS

**Enterprise Knowledge & Strategy Operating System** — a React + Vite implementation of the Velocity v2 vision: a unified workspace where company OKRs, strategic debates, departmental knowledge, AI skill packs, and multi-LLM admin live as one cognitive platform.

Built around a fictional Chinese smart-appliance company (北海智能家居 · Beihai Smart Home) to keep the UI grounded in concrete, specific data rather than placeholder lorem ipsum.

## What's inside

10 connected screens accessible from the sidebar:

| Route | Page | What it does |
|---|---|---|
| `home` | 首页 | KPI strip, OKR snapshot, key project health, strategy debate teaser, live activity, department status |
| `knowledge` | 公司知识中心 | Sources table with quality status, knowledge domains, knowledge graph, ingestion queue, feedback panel |
| `strategy` | 战略工作台 | Spatial canvas with mission node + 7 agent satellites, War Council debate transcript, 3 strategy options, structured output draft |
| `okr` | OKR 与关键项目 | Full CRUD on Objectives + KRs with live progress sliders, project portfolio table, alignment map, decision log |
| `departments` | 部门工作空间 | Multi-level tree (集团 → 部门 → 团队) with breadcrumbs, rollup stats, drill-down |
| `department` | 部门工作台 | Per-dept tabs: overview, knowledge, skills, workflows, projects, assistant chat. 工业设计部 also has CMF Intelligence (color swatches + material×process matrix) and Market Insights (奥维 price-band charts) |
| `skills` | 技能中心 | Skill Pack registry with governance banner, full CRUD, filter chips by dept/scope/status, ownership model (Owner / Maintainer / Scope / Status / Version) |
| `assistants` | 助手中心 | Strategic assistant + departmental assistants + intent-routing log |
| `governance` | 权限与治理 | RBAC matrix (角色 × 范围) + data connectors |
| `admin` | 管理后台 | Token usage analytics (5 ranges, dept leaderboard, top users, 7×24 heatmap), model & routing config (9 models / 6 rules), org tree (集团 → 中心 → 部门 → 团队 with AI config inheritance), quota & budget, audit log |

## Stack

- **Vite + React 19** — module-based, build-ready
- **No CSS framework** — design tokens + utility classes hand-rolled in `src/styles/index.css`
- **Hand-rolled SVG icons** — lucide-style, defined in `src/components/primitives.jsx`
- **In-memory state** — React `useState` per page; no backend, all data is fictional seed data

## Project structure

```text
velocity-os/
├── docs/                              ← Product vision & PRD (read these first)
│   ├── README.md
│   ├── 01_VISION_AND_CAPABILITIES.md  English vision
│   ├── velocity_project_vision_v2_cn.md  中文 vision
│   └── velocity_prd_v2_cn.md          中文 PRD draft
├── src/
│   ├── main.jsx                       Vite entry
│   ├── App.jsx                        Root + route switch
│   ├── styles/index.css               Design tokens + all component CSS
│   ├── components/
│   │   ├── primitives.jsx             Icons, Spark, Progress, Avatar, KpiCard, Modal, ConfirmModal
│   │   └── Shell.jsx                  Sidebar + Topbar
│   ├── data/
│   │   └── seed.js                    All seed data (Company, Objectives, Projects, Departments, etc.)
│   └── pages/
│       ├── HomePage.jsx
│       ├── KnowledgePage.jsx
│       ├── OkrPage.jsx                Full CRUD on Objectives, KRs, Projects, Decisions
│       ├── StrategyPage.jsx           Canvas + War Council + Options + Structured Output
│       ├── DepartmentsIndex.jsx       Multi-level tree
│       ├── DepartmentPage.jsx         Per-dept workspace
│       ├── SkillsPage.jsx             Skill Pack registry with governance + CRUD
│       ├── AssistantsAndGovernance.jsx
│       └── AdminPage.jsx              Token usage, models, org tree, quota, audit
├── index.html
├── package.json
└── vite.config.js
```

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview the build
```

## Notes

- The UI is in **Simplified Chinese** (the target user is a Chinese enterprise) — all labels, button text, and seed data are zh-CN.
- The original design was prototyped via [claude.ai/design](https://claude.ai/design) as React+Babel HTML; this is the production port.
- The seed data is intentionally specific — real company names like 奥维 (AVC), 松下 K3 references, BP/SC/SA dealer terminology, etc. — to keep the screens feeling concrete.
- See `docs/` for the product vision and PRD that drove the design.
