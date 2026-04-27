"""Pydantic schemas — the wire shape consumed by the frontend.

Field names use camelCase via ``alias`` because the frontend already speaks
camelCase (matches ``src/data/seed.js``). With ``populate_by_name=True``
both forms are accepted on input; ``by_alias=True`` is set when serializing
in routes.
"""

from __future__ import annotations

from typing import Any
from uuid import uuid4

from pydantic import BaseModel, ConfigDict, Field


def _camel(name: str) -> str:
    head, *tail = name.split("_")
    return head + "".join(t.capitalize() for t in tail)


class _CamelModel(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        alias_generator=_camel,
    )


def make_id(prefix: str) -> str:
    return f"{prefix}-{uuid4().hex[:10]}"


# --- Company / departments ---------------------------------------------


class CompanyOut(_CamelModel):
    id: str
    name: str
    name_en: str
    tagline: str | None = None
    initials: str | None = None
    industry: str | None = None
    founded: int | None = None
    employees: str | None = None
    revenue: str | None = None
    fiscal_year: str | None = None
    brand_color: str | None = None
    # Knowledge profile (Phase 1: empty defaults; PRD §5.1 / §6.1).
    focus_areas: list[str] = Field(default_factory=list)
    competitors: list[dict[str, Any]] = Field(default_factory=list)
    terminology: list[dict[str, Any]] = Field(default_factory=list)
    context_prompt: str | None = None


class DepartmentOut(_CamelModel):
    id: str
    parent_id: str | None = None
    name: str
    en: str | None = None
    icon: str | None = None
    color: str | None = None
    lead: str | None = None
    people: int = 0
    assistant: str | None = None
    knowledge: int = 0
    skills: int = 0
    workflows: int = 0
    projects: int = 0
    status: str | None = None


# --- OKR ---------------------------------------------------------------


class KeyResultBase(_CamelModel):
    title: str
    target: str | None = None
    current: str | None = None
    progress: int = 0
    status: str | None = None


class KeyResultIn(KeyResultBase):
    id: str | None = None  # client may submit existing IDs on update


class KeyResultOut(KeyResultBase):
    id: str


class ObjectiveBase(_CamelModel):
    code: str
    title: str
    owner: str | None = None
    progress: int = 0
    status: str | None = None
    quarter: str | None = None
    linked_projects: list[str] = Field(default_factory=list)


class ObjectiveCreate(ObjectiveBase):
    id: str | None = None
    krs: list[KeyResultIn] = Field(default_factory=list)


class ObjectiveUpdate(_CamelModel):
    """Patch payload — every field optional. Lists replace wholesale when
    provided (intentional; the demo doesn't need granular array ops)."""
    code: str | None = None
    title: str | None = None
    owner: str | None = None
    progress: int | None = None
    status: str | None = None
    quarter: str | None = None
    linked_projects: list[str] | None = None
    krs: list[KeyResultIn] | None = None


class ObjectiveOut(ObjectiveBase):
    id: str
    krs: list[KeyResultOut] = Field(default_factory=list)


# --- Projects / Decisions / Knowledge -----------------------------------


class ProjectOut(_CamelModel):
    id: str
    name: str
    health: str | None = None
    progress: int = 0
    owner: str | None = None
    dept_id: str | None = None
    dept: str | None = None
    okr: str | None = None
    milestone: str | None = None
    due: str | None = None
    started: str | None = None
    risks: int = 0
    description: str | None = None
    contributors: list[str] = Field(default_factory=list)
    milestones: list[dict[str, Any]] = Field(default_factory=list)
    risks_detail: list[dict[str, Any]] = Field(default_factory=list)
    linked_decisions: list[str] = Field(default_factory=list)
    linked_sources: list[str] = Field(default_factory=list)


class ProjectCreate(_CamelModel):
    """Body for ``POST /api/v1/projects``. ``id`` is optional; the
    server generates one if absent."""
    id: str | None = None
    name: str
    health: str | None = "ok"
    progress: int = 0
    owner: str | None = None
    dept_id: str | None = None
    dept: str | None = None
    okr: str | None = None
    milestone: str | None = None
    due: str | None = None
    started: str | None = None
    risks: int = 0
    description: str | None = None
    contributors: list[str] = Field(default_factory=list)
    milestones: list[dict[str, Any]] = Field(default_factory=list)
    risks_detail: list[dict[str, Any]] = Field(default_factory=list)
    linked_decisions: list[str] = Field(default_factory=list)
    linked_sources: list[str] = Field(default_factory=list)


class ProjectUpdate(_CamelModel):
    """Patch body for ``PATCH /api/v1/projects/{id}``. Every field
    optional; only ``model_dump(exclude_unset=True)`` keys are written."""
    name: str | None = None
    health: str | None = None
    progress: int | None = None
    owner: str | None = None
    dept_id: str | None = None
    dept: str | None = None
    okr: str | None = None
    milestone: str | None = None
    due: str | None = None
    started: str | None = None
    risks: int | None = None
    description: str | None = None
    contributors: list[str] | None = None
    milestones: list[dict[str, Any]] | None = None
    risks_detail: list[dict[str, Any]] | None = None
    linked_decisions: list[str] | None = None
    linked_sources: list[str] | None = None


class DecisionOut(_CamelModel):
    id: str
    title: str
    date: str | None = None
    owner: str | None = None
    status: str | None = None
    linked_kr: str | None = None
    linked_project: str | None = None
    linked_question: str | None = None
    question: str | None = None
    conclusion: str | None = None
    retrospective: str | None = None
    assumptions: list[str] = Field(default_factory=list)
    dissent: list[dict[str, Any]] = Field(default_factory=list)
    evidence_sources: list[str] = Field(default_factory=list)


class DecisionCreate(_CamelModel):
    """Body for ``POST /api/v1/decisions``."""
    id: str | None = None
    title: str
    date: str | None = None
    owner: str | None = None
    status: str | None = "decided"
    linked_kr: str | None = None
    linked_project: str | None = None
    linked_question: str | None = None
    question: str | None = None
    conclusion: str | None = None
    retrospective: str | None = None
    assumptions: list[str] = Field(default_factory=list)
    dissent: list[dict[str, Any]] = Field(default_factory=list)
    evidence_sources: list[str] = Field(default_factory=list)


class DecisionUpdate(_CamelModel):
    """Patch body for ``PATCH /api/v1/decisions/{id}``."""
    title: str | None = None
    date: str | None = None
    owner: str | None = None
    status: str | None = None
    linked_kr: str | None = None
    linked_project: str | None = None
    linked_question: str | None = None
    question: str | None = None
    conclusion: str | None = None
    retrospective: str | None = None
    assumptions: list[str] | None = None
    dissent: list[dict[str, Any]] | None = None
    evidence_sources: list[str] | None = None


class KnowledgeDomainOut(_CamelModel):
    id: str
    name: str
    description: str | None = None
    scope: str = "company"
    department_id: str | None = None
    count: int = 0
    last_update: str | None = None
    health: str | None = None
    coverage: int = 0
    enabled: bool = True
    tags: list[str] = Field(default_factory=list)


class KnowledgeSourceOut(_CamelModel):
    id: str
    title: str
    type: str | None = None
    scope: str | None = None
    quality: str | None = None
    uses: int = 0
    owner: str | None = None
    updated: str | None = None
    size: str | None = None
    summary: str | None = None
    excerpt: str | None = None
    tags: list[str] = Field(default_factory=list)
    pages: int | None = None
    lang: str | None = None
    uploaded_by: str | None = None
    embeddings: int | None = None
    linked_projects: list[str] = Field(default_factory=list)
    linked_decisions: list[str] = Field(default_factory=list)


class KnowledgeSourceCreate(_CamelModel):
    """Body for ``POST /api/v1/knowledge-sources``. Used by the
    ingest-queue → source promotion flow (queued for Phase 2 step E) and
    by direct uploads."""
    id: str | None = None
    title: str
    type: str | None = None
    scope: str | None = None
    quality: str | None = "draft"
    uses: int = 0
    owner: str | None = None
    updated: str | None = None
    size: str | None = None
    summary: str | None = None
    excerpt: str | None = None
    tags: list[str] = Field(default_factory=list)
    pages: int | None = None
    lang: str | None = None
    uploaded_by: str | None = None
    embeddings: int | None = None
    linked_projects: list[str] = Field(default_factory=list)
    linked_decisions: list[str] = Field(default_factory=list)


class KnowledgeSourceUpdate(_CamelModel):
    """Patch body for ``PATCH /api/v1/knowledge-sources/{id}``."""
    title: str | None = None
    type: str | None = None
    scope: str | None = None
    quality: str | None = None
    uses: int | None = None
    owner: str | None = None
    updated: str | None = None
    size: str | None = None
    summary: str | None = None
    excerpt: str | None = None
    tags: list[str] | None = None
    pages: int | None = None
    lang: str | None = None
    uploaded_by: str | None = None
    embeddings: int | None = None
    linked_projects: list[str] | None = None
    linked_decisions: list[str] | None = None


class KnowledgeOverviewOut(_CamelModel):
    """Aggregate KPIs for the Company Knowledge Center landing.

    Mirrors the four counters at the top of the frontend KnowledgePage so
    the page can swap to a single API call instead of computing locally.
    """
    total_sources: int
    total_embeddings: int
    total_uses: int
    pending_review: int
    domains: list[KnowledgeDomainOut]
    recent_sources: list[KnowledgeSourceOut]


# --- Activity / Agents / Strategy Questions -----------------------------


class ActivityOut(_CamelModel):
    id: str
    who: str | None = None
    what: str | None = None
    target: str | None = None
    when: str | None = None
    type: str | None = None


class AgentOut(_CamelModel):
    id: str
    name: str
    role: str | None = None
    color: str | None = None
    icon: str | None = None
    focus: str | None = None


class StrategyQuestionOut(_CamelModel):
    id: str
    title: str
    asker: str | None = None
    asked: str | None = None
    status: str | None = None
    summary: str | None = None
    rounds: int = 0
    options_count: int = 0
    decision_id: str | None = None
    context: list[str] = Field(default_factory=list)
    okrs: list[str] = Field(default_factory=list)
    agents: list[str] = Field(default_factory=list)


# --- Skills / Workflows / Runs ---------------------------------------


class SkillPackOut(_CamelModel):
    id: str
    name: str
    dept: str | None = None
    maintainer: str | None = None
    scope: str | None = None
    status: str | None = None
    version: str | None = None
    icon: str | None = None
    input: str | None = None
    output: str | None = None
    uses: int = 0
    rating: float = 0.0
    updated: str | None = None


class WorkflowOut(_CamelModel):
    id: str
    name: str
    dept_id: str | None = None
    owner: str | None = None
    status: str | None = None
    version: str | None = None
    icon: str | None = None
    description: str | None = None
    input: str | None = None
    output: str | None = None
    avg_time: str | None = None
    uses: int = 0
    last_run: str | None = None
    linked_skills: list[str] = Field(default_factory=list)
    linked_domains: list[str] = Field(default_factory=list)
    steps: list[dict[str, Any]] = Field(default_factory=list)


class WorkflowRunOut(_CamelModel):
    id: str
    workflow_id: str | None = None
    trigger: str | None = None
    actor: str | None = None
    started: str | None = None
    duration: str | None = None
    status: str | None = None
    output: str | None = None


class WorkflowRunCreate(_CamelModel):
    workflow_id: str
    trigger: str | None = None
    actor: str | None = None
    started: str | None = None
    duration: str | None = None
    status: str | None = "ok"
    output: str | None = None


# --- Ingest Queue -----------------------------------------------------


class IngestQueueItemOut(_CamelModel):
    id: str
    name: str
    type: str | None = None
    size: str | None = None
    state: str = "queued"
    progress: int = 0
    scope: str | None = None
    owner: str | None = None
    uploaded: str | None = None
    error: str | None = None


class IngestQueueCreate(_CamelModel):
    name: str
    type: str | None = None
    size: str | None = None
    state: str = "queued"
    progress: int = 0
    scope: str | None = None
    owner: str | None = None


class IngestQueuePatch(_CamelModel):
    state: str | None = None
    progress: int | None = None
    error: str | None = None


class IngestApproveResult(_CamelModel):
    """Wire shape returned by ``POST /ingest-queue/{id}/approve``: the
    updated queue item plus the freshly minted knowledge source."""
    item: IngestQueueItemOut
    source: KnowledgeSourceOut


# --- Notifications / Routing / Audit ----------------------------------


class NotificationOut(_CamelModel):
    id: str
    at: str | None = None
    category: str | None = None
    read: bool = False
    title: str
    body: str | None = None
    link: dict[str, Any] | None = None


class RoutingRuleOut(_CamelModel):
    id: str
    priority: str | None = None
    enabled: bool = True
    intent: str | None = None
    target_dept: str | None = None
    target_skill: str | None = None
    permission: str | None = None
    note: str | None = None
    hits: int = 0
    last_hit: str | None = None


class RoutingRuleCreate(_CamelModel):
    """Body for ``POST /api/v1/routing-rules``. ``id`` is optional; the
    server generates one if absent. Mirrors the frontend's draft shape
    so the editor can submit its in-flight state directly."""
    id: str | None = None
    priority: str | None = "medium"
    enabled: bool = True
    intent: str
    target_dept: str | None = None
    target_skill: str | None = None
    permission: str | None = None
    note: str | None = None


class RoutingRuleUpdate(_CamelModel):
    """Patch body for ``PATCH /api/v1/routing-rules/{id}``. Every field
    optional; only ``model_dump(exclude_unset=True)`` keys are written."""
    priority: str | None = None
    enabled: bool | None = None
    intent: str | None = None
    target_dept: str | None = None
    target_skill: str | None = None
    permission: str | None = None
    note: str | None = None


class AuditEventOut(_CamelModel):
    id: str
    at: str | None = None
    actor: str | None = None
    ip: str | None = None
    category: str | None = None
    severity: str | None = None
    action: str | None = None
    target: str | None = None
    scope: str | None = None
    link: dict[str, Any] | None = None


# --- Strategy debate ----------------------------------------------------


class DebateMessageOut(_CamelModel):
    id: str
    question_id: str
    round: int
    agent_id: str
    stance: str
    text: str
    sources: list[str] = Field(default_factory=list)
    model: str | None = None


class DebateRoundIn(_CamelModel):
    """Optional inputs to ``POST .../debate/round``. If ``agent_ids`` is
    omitted, the orchestrator uses the question's own agents list.
    """

    agent_ids: list[str] | None = None
    # Optional override: which round number to write (defaults to next).
    round: int | None = None


class DebateRoundOut(_CamelModel):
    round: int
    messages: list[DebateMessageOut]


class DebateSynthesisOut(_CamelModel):
    text: str
    pro: int = 0
    con: int = 0
    concern: int = 0
    model: str


# --- Strategy options + structured output ------------------------------


class StrategyOptionOut(_CamelModel):
    id: str
    question_id: str
    idx: int
    name: str
    description: str | None = None
    roi: str | None = None
    risk: str | None = None
    time_estimate: str | None = None
    pros: int = 0
    cons: int = 0
    recommended: bool = False
    model: str | None = None


class StructuredOutputObjectiveDraft(_CamelModel):
    code: str
    title: str
    krs: list[dict[str, str]] = Field(default_factory=list)  # [{kr, target}]


class StructuredOutputProjectDraft(_CamelModel):
    name: str
    owner: str | None = None
    milestone: str | None = None


class StructuredOutputDecisionDraft(_CamelModel):
    question: str
    conclusion: str
    assumptions: list[str] = Field(default_factory=list)
    dissent: list[str] = Field(default_factory=list)
    evidence: str | None = None


class StructuredOutputDraft(_CamelModel):
    objective: StructuredOutputObjectiveDraft
    projects: list[StructuredOutputProjectDraft] = Field(default_factory=list)
    decision: StructuredOutputDecisionDraft
    recommended_option_id: str | None = None
    model: str


# --- Routing classifier (Haiku) ----------------------------------------


class RouteRequestIn(_CamelModel):
    text: str
    # Optional scope hint — when set, only rules belonging to a matching
    # department are considered.
    dept_id: str | None = None


class RouteResultOut(_CamelModel):
    intent: str | None = None
    rule_id: str | None = None
    dept_id: str | None = None
    skill_id: str | None = None
    confidence: float = 0.0
    rationale: str | None = None
    model: str


# --- Chat (Anthropic) ---------------------------------------------------


class ChatMessageIn(_CamelModel):
    """A single turn submitted by the frontend. ``role`` is "user" or
    "assistant"; ``content`` is plain text (no tool use yet)."""

    role: str
    content: str


class ChatRequestIn(_CamelModel):
    """Frontend → backend chat payload.

    The ``messages`` array is the volatile turn-by-turn history. Stable
    company / department context is assembled server-side so the cached
    prefix stays byte-stable across requests (prompt caching invariant).
    """

    messages: list[ChatMessageIn] = Field(default_factory=list)
    # Optional department scope — pulls dept name + assistant persona into
    # the system prompt as a second cached block.
    dept_id: str | None = None
    # Optional skill scope — when set, the assistant is framed as the
    # skill's runner and the user's first turn is the skill input.
    skill_id: str | None = None
    # Optional caller-supplied system prompt suffix. Appended AFTER the
    # cached blocks so volatile per-request guidance doesn't break the
    # prefix match. Use sparingly.
    system_suffix: str | None = None
    # Override for chat model. Defaults to ``claude-sonnet-4-6``.
    model: str | None = None
    # Hard token cap for the response. Defaults to 1024 (chat-sized).
    max_tokens: int | None = None


class ChatUsageOut(_CamelModel):
    input_tokens: int = 0
    output_tokens: int = 0
    cache_read_input_tokens: int = 0
    cache_creation_input_tokens: int = 0


class ChatResponseOut(_CamelModel):
    text: str
    model: str
    stop_reason: str | None = None
    usage: ChatUsageOut


# --- Health ------------------------------------------------------------


class HealthOut(_CamelModel):
    status: str = "ok"
    version: str
    database: str  # "sqlite" | "postgres" | other
    objective_count: int
