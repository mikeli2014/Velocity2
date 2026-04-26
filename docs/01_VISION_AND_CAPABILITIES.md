# 01. Velocity Vision & Capabilities

## New Definition

Velocity is an **Enterprise Knowledge & Strategy Operating System** for management teams and business departments.

It is not only a multi-agent canvas, knowledge base, or chatbot. It organizes company background knowledge, strategic direction, OKRs, key projects, department knowledge, workflows, and AI assistants into a persistent platform that can be searched, reasoned over, reused, and executed.

> Vision: turn scattered enterprise knowledge, strategy, projects, and experience into reusable, reasonable, executable organizational intelligence.

## Why The Direction Changed

The original "Cognitive Factory" concept remains useful, but it was too centered on multi-agent generation. The v2 direction reframes Velocity around the operating system that makes AI useful inside a real enterprise:

- AI must speak from unified company context.
- Strategy, OKRs, and key projects must become shared background knowledge.
- Each department needs its own knowledge, workflows, skill packs, and assistant.
- Strategy co-creation, strategy definition, and strategy execution must form a closed loop.

## Problems Velocity Solves

### Scattered Enterprise Knowledge

Enterprise knowledge lives across PPTs, Word files, Excel sheets, emails, group chats, shared drives, project folders, and personal machines. New employees, cross-functional teams, and AI assistants cannot reliably access stable company context.

### Strategy Discussions Do Not Persist

Many strategic conversations happen in meetings, decks, or chat threads. Conclusions are scattered, reasoning is lost, and execution later drifts from intent.

### OKRs And Key Projects Are Not Shared Context

Company objectives, annual OKRs, department goals, milestones, strategic priorities, and key projects often sit in separate systems. AI and employees cannot automatically reason against the company's current priorities.

### Departments Need Different AI Workspaces

Industrial Design needs suppliers, materials, processes, CMF, competitor, market, trend, and category knowledge. Service needs SOPs, tickets, fault codes, spare parts, complaints, and technician support. COP needs channel policy, pricing, orders, city operations, BP/SC/SA collaboration. Supply Chain needs forecasts, inventory, replenishment, risk, and scenario simulation.

A single general assistant cannot support all department workflows.

### AI Lacks Organizational Context And Workflow Constraints

Most AI tools answer questions but do not know company strategy, department responsibilities, current projects, permissions, or process constraints. They do not naturally enter daily work.

## Core Missions

### 1. Company Knowledge Center

Velocity should become the common knowledge center for:

- company profile
- brand positioning
- product categories
- business model
- organization structure
- strategy direction
- annual OKRs
- key projects
- core metrics
- competitors
- business terminology
- policies and process documents
- historical decisions
- project retrospectives
- market insights
- user profiles
- department responsibilities

This knowledge should be used by people and by every assistant, agent, and strategy analysis flow.

### 2. Strategy Studio

Velocity should support the path from strategic idea to strategic definition:

- create strategic questions
- gather background material
- run multi-agent analysis
- challenge from multiple professional viewpoints
- identify opportunities and risks
- compare strategic options
- preserve decision evidence
- generate objectives and key results
- define key projects
- generate milestones, owners, and next actions
- maintain decision logs and retrospective records

The strategy canvas should become the formal carrier where strategic ideas are discussed, challenged, defined, and converted into OKRs and key projects.

### 3. Department Workspaces

Every department should be able to configure:

- department knowledge base
- department tag taxonomy
- department workflows
- department skill packs
- department assistant or agent
- department projects and OKRs
- report templates
- data connectors
- permissions and knowledge governance

The first implemented example is Industrial Design.

### 4. Assistant & Agent Layer

Assistants should not be generic chat boxes. They should support:

- RAG question answering
- source references
- report generation
- workflow triggering
- project progress updates
- OKR/project context injection
- feedback such as useful, not useful, incorrect, or add missing knowledge

## North Star Metrics

Velocity v2 should be evaluated by organizational capability, not answer volume:

- **Knowledge reuse rate**: percentage of AI answers, strategy outputs, and department workflows that cite enterprise knowledge.
- **Strategy alignment rate**: percentage of key projects linked to company OKRs or strategic goals.
- **Department workflow coverage**: number of core departments with configured workspaces and skill packs.
- **Assistant daily activity**: frequency of department employees using assistants for retrieval, summary, analysis, and reporting.
- **Decision traceability rate**: percentage of recommendations, OKRs, and projects traceable to knowledge sources and reasoning.
- **Project health visibility**: percentage of key projects with updated progress, risks, owners, and milestones.

## Product Architecture

```text
Velocity Enterprise Knowledge & Strategy OS

1. Company Knowledge Center
   - company background
   - product and brand
   - organization structure
   - terminology
   - strategy direction
   - annual OKRs
   - key projects
   - competitors
   - historical decisions
   - policies

2. Strategy Studio
   - strategic question canvas
   - multi-agent debate
   - War Council
   - option comparison
   - decision logs
   - OKR generation
   - key project definition
   - execution plan generation

3. OKR & Key Project Registry
   - company objectives
   - department objectives
   - key results
   - project portfolio
   - milestones
   - risks
   - project-OKR links

4. Department Workspaces
   - department knowledge
   - department workflows
   - skill packs
   - assistants
   - department projects
   - reports

5. Assistant & Agent Layer
   - company strategy assistant
   - department assistants
   - professional agents
   - multi-agent collaboration
   - human approval

6. Knowledge Governance
   - permissions
   - source traceability
   - quality state
   - tags
   - audit logs
   - security isolation
```

## Current Capabilities To Reuse

Velocity already has important v2 foundations:

- `CompanyProfile` includes company background, metrics, competitors, knowledge, objectives, and projects.
- `CompanyKnowledge` supports web research and uploaded documents.
- `DepartmentWorkspace` exists and is being expanded into a fuller department workspace framework.
- `Objective` and `OKROutput` support company-level strategic goals and key results.
- `ProjectManager` supports key project portfolio management.
- `companyContextBuilder` can inject company background into AI prompts.
- `ragService`, `vectorStore`, `embeddingService`, and `documentParser` provide the knowledge center base.
- `agentService` and personas provide the multi-agent foundation.

## Implementation Direction

1. Upgrade Company Intelligence Hub into Company Knowledge Center.
2. Upgrade ObjectiveManager and ProjectManager into shared strategic context.
3. Expand DepartmentWorkspace into a configurable department platform.
4. Add Department Skill Pack and Assistant Routing registries.
5. Layer RAG retrieval by company, department, and project scope.
6. Convert strategy canvas outputs into OKRs, key projects, decision logs, and workflows.
