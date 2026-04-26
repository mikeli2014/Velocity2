# Velocity OS — Product Documents

This folder holds the source-of-truth product thinking behind the Velocity OS UI in `src/`. The chat transcript and HTML prototypes were generated from these documents — when implementing or extending the UI, refer back here to understand intent.

## Files

### `01_VISION_AND_CAPABILITIES.md` (English)
The canonical short-form vision. Covers what Velocity is (an Enterprise Knowledge & Strategy Operating System), why the direction shifted from "Cognitive Factory" to an OS, the five enterprise problems it solves, the four core missions (Company Knowledge Center, Strategy Studio, Department Workspaces, Assistant & Agent Layer), and the six North Star metrics. Read this first.

### `velocity_project_vision_v2_cn.md` (中文)
The longer Chinese-language vision document. Same conceptual scope as `01_VISION_AND_CAPABILITIES.md` but with more narrative around the v1 → v2 evolution, design principles (knowledge must be traceable, departments must be configurable not hardcoded, strategy must convert into structured assets), and a per-department capability matrix (工业设计部 / 服务部 / COP / 市场部 / 供应链).

### `velocity_prd_v2_cn.md` (中文)
The draft PRD. Goes beyond vision into user roles (CEO, VP, 部门负责人, 一线员工, IT, AI 运营), core scenarios with user stories and functional requirements, and feature-level detail. This is the document to consult when deciding what a screen should do.

## How these map to the implementation

| Document concept | Where it lives in `src/` |
|---|---|
| Company Knowledge Center | `pages/KnowledgePage.jsx` |
| Strategy Studio (canvas + War Council + options + structured output) | `pages/StrategyPage.jsx` *(pending)* |
| OKR & Key Project Registry | `pages/OkrPage.jsx` *(pending)* |
| Department Workspaces (multi-level) | `pages/DepartmentsIndex.jsx`, `pages/DepartmentPage.jsx` *(pending)* |
| Department Skill Packs with governance | `pages/SkillsPage.jsx` *(pending)* |
| Assistant & Agent Layer | `pages/AssistantsPage.jsx` *(pending)* |
| Knowledge Governance (RBAC, connectors, audit) | `pages/GovernancePage.jsx` *(pending)* |
| Admin (token usage, model routing, org tree, quotas, audit) | `pages/AdminPage.jsx` *(pending)* |
| Home — enterprise cognition overview | `pages/HomePage.jsx` ✅ |

The seed data in `src/data/seed.js` is built around the fictional company **北海智能家居 (Beihai Smart Home)** described informally in the vision — a Chinese smart-appliance maker with industrial design, channel ops (BP/SC/SA), service, supply chain, and finance departments. All OKRs, projects, knowledge sources, and debate transcripts are fictional but specifically anchored to that company so the screens feel grounded.
