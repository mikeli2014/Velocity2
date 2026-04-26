# 02. How Velocity Works

Velocity v2 works as an operating loop: knowledge is captured, strategy is defined, execution assets are created, department workflows use the knowledge, and new outcomes feed back into the system.

## The Operating Loop

```text
Capture knowledge
  -> Ground AI context
  -> Co-create strategy
  -> Define OKRs and key projects
  -> Execute through department workflows
  -> Collect outcomes and decisions
  -> Improve the knowledge base
```

## User Journey 1: Company Knowledge Center

### 1. Add Company Context

An operator uploads or enters company-level material:

- company profile
- product category information
- brand strategy
- organization structure
- annual strategy
- OKRs
- key project documents
- competitor scans
- policies and SOPs
- historical decision records

### 2. Parse And Index

Velocity uses existing capabilities:

- `/api/documents/parse`
- `documentParser`
- `embeddingService`
- `vectorStore`
- `ragService`
- `/api/knowledge`

The current implementation supports document parsing and knowledge ingestion. The next product layer should add structured source metadata, quality state, scope, and source lineage.

### 3. Use As Default AI Context

Company knowledge should become default context for:

- strategy analysis
- canvas agents
- department assistants
- workflow prompts
- OKR generation
- key project planning

## User Journey 2: Strategy Co-Creation

### 1. Create A Strategic Question

A CEO, VP, or department leader starts with a question:

> Should we increase investment in online channels this year?

The user attaches relevant context:

- company OKRs
- key projects
- market data
- department knowledge
- prior decisions

### 2. Run Multi-Agent Analysis

Velocity uses the existing canvas, agent service, Executive Studio, and War Council to evaluate the question from multiple viewpoints:

- finance
- product
- GTM
- operations
- risk
- organization
- technology
- supply chain

### 3. Convert Output Into Structured Strategy Assets

The output should not remain only chat text or a PDF. It should become:

- decision question
- assumptions
- evidence
- options
- risks
- counterarguments
- recommendation
- objective
- key results
- key projects
- owners
- milestones
- decision log

## User Journey 3: OKR & Key Project Registry

### 1. Maintain Company Objectives

Company and department objectives should be visible as shared context.

### 2. Link Projects To Objectives

Every key project should connect to:

- company objective
- department objective
- responsible owner
- milestones
- risks
- progress state
- related knowledge sources

### 3. Inject Into AI Answers

When a department assistant answers a question, it should know which company goals and key projects are currently important.

## User Journey 4: Department Workspaces

Each department has a configurable workspace generated from registries:

- `DepartmentConfig`
- `KnowledgeDomainConfig`
- `SkillPackConfig`
- `AssistantRouteConfig`
- `WorkflowTemplateConfig`

### Example: Industrial Design

Industrial Design currently includes:

- `/departments/industrial-design`
- `/departments/industrial-design/knowledge`
- `/departments/industrial-design/assistant`
- `/departments/industrial-design/projects`
- `/departments/industrial-design/skills`
- `/departments/industrial-design/workflows`

Knowledge domains:

- suppliers
- materials
- processes
- CMF
- competitors
- market data
- user insights
- category knowledge

Workflows:

- create design brief
- compare material options
- check CMF feasibility
- supplier and process review
- competitor design language map
- concept review memo

The designer starts from a design decision, not a generic chat query:

1. Create project context.
2. Choose a workflow.
3. Generate a structured assistant prompt.
4. Query department RAG.
5. Review sources and recommendations.
6. Convert output into a design brief, comparison table, risk checklist, or decision memo.

## User Journey 5: Assistant In Workflow

A department assistant should:

- retrieve knowledge
- summarize documents
- cite sources
- suggest missing context
- run skill pack prompts
- create reports
- update project progress
- raise risk reminders
- recommend next actions

Current implementation:

- web-based Industrial Design assistant
- workflow-aware prompt prefill through `?workflow=...`
- department-scoped RAG endpoint
- upload and ingestion through existing document/knowledge APIs

Not implemented yet:

- Enterprise WeChat integration
- persistent assistant sessions
- project writeback
- feedback and correction loop
- permissions and governance

## Navigation Model

Recommended top-level product navigation:

1. **Knowledge**
   - company knowledge center
   - source management
   - governance

2. **Strategy**
   - strategy canvas
   - War Council
   - decision logs
   - OKR generation

3. **Registry**
   - company OKRs
   - department OKRs
   - key projects
   - milestones and risks

4. **Departments**
   - department workspaces
   - knowledge domains
   - skill packs
   - workflows
   - assistants

5. **Admin**
   - connectors
   - users and roles
   - model/provider config
   - audit and quality controls
