"""SQLAlchemy ORM models.

Schema mirrors the shape used by ``src/data/seed.js`` so the API can be
swapped in without the frontend changing its mental model. Phase 1 covers
the read-heavy entities + Objective/KR full CRUD; richer write paths land
when their frontend pages get wired up.

Conventions:
- Primary keys are short string IDs (``"obj-1"``, ``"kr-1-2"``, ``"proj-3"``)
  matching the seed. New rows use ``uuid4().hex[:12]`` via the schema layer.
- All timestamps are TZ-aware UTC.
- JSON columns are used for free-shape arrays (linked_projects, tags,
  evidence_sources) where a join table would be over-engineering for the
  demo. We can promote them to relations in Phase 2 if filter performance
  needs it.
"""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import JSON, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


# --- Core company / org -------------------------------------------------


class Company(Base):
    __tablename__ = "company"

    id: Mapped[str] = mapped_column(String, primary_key=True, default="default")
    name: Mapped[str] = mapped_column(String)
    name_en: Mapped[str] = mapped_column(String)
    tagline: Mapped[str | None] = mapped_column(String, nullable=True)
    initials: Mapped[str | None] = mapped_column(String, nullable=True)
    industry: Mapped[str | None] = mapped_column(String, nullable=True)
    founded: Mapped[int | None] = mapped_column(nullable=True)
    employees: Mapped[str | None] = mapped_column(String, nullable=True)
    revenue: Mapped[str | None] = mapped_column(String, nullable=True)
    fiscal_year: Mapped[str | None] = mapped_column(String, nullable=True)
    brand_color: Mapped[str | None] = mapped_column(String, nullable=True)

    # Knowledge profile (PRD §5.1 / §6.1). These are static company facts
    # injected into AI prompts as the default system context. Empty in
    # Phase 1 — populated when the frontend gains a 公司档案 editor.
    focus_areas: Mapped[list[str]] = mapped_column(JSON, default=list)
    competitors: Mapped[list[dict]] = mapped_column(JSON, default=list)
    terminology: Mapped[list[dict]] = mapped_column(JSON, default=list)
    context_prompt: Mapped[str | None] = mapped_column(Text, nullable=True)


class Department(Base):
    __tablename__ = "departments"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    parent_id: Mapped[str | None] = mapped_column(ForeignKey("departments.id"), nullable=True)
    name: Mapped[str] = mapped_column(String)
    en: Mapped[str | None] = mapped_column(String, nullable=True)
    icon: Mapped[str | None] = mapped_column(String, nullable=True)
    color: Mapped[str | None] = mapped_column(String, nullable=True)
    lead: Mapped[str | None] = mapped_column(String, nullable=True)
    people: Mapped[int] = mapped_column(default=0)
    assistant: Mapped[str | None] = mapped_column(String, nullable=True)
    knowledge: Mapped[int] = mapped_column(default=0)
    skills: Mapped[int] = mapped_column(default=0)
    workflows: Mapped[int] = mapped_column(default=0)
    projects: Mapped[int] = mapped_column(default=0)
    status: Mapped[str | None] = mapped_column(String, nullable=True)


# --- OKR / Projects -----------------------------------------------------


class Objective(Base):
    __tablename__ = "objectives"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    code: Mapped[str] = mapped_column(String)
    title: Mapped[str] = mapped_column(String)
    owner: Mapped[str | None] = mapped_column(String, nullable=True)
    progress: Mapped[int] = mapped_column(default=0)
    status: Mapped[str | None] = mapped_column(String, nullable=True)
    quarter: Mapped[str | None] = mapped_column(String, nullable=True)
    # Project codes the objective is tied to (e.g. ["proj-1", "proj-3"]).
    # Stored denormalized to mirror seed; promote to relation in Phase 2.
    linked_projects: Mapped[list[str]] = mapped_column(JSON, default=list)

    krs: Mapped[list["KeyResult"]] = relationship(
        back_populates="objective",
        cascade="all, delete-orphan",
        order_by="KeyResult.id",
    )

    created_at: Mapped[datetime] = mapped_column(default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(default=_utcnow, onupdate=_utcnow)


class KeyResult(Base):
    __tablename__ = "key_results"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    objective_id: Mapped[str] = mapped_column(ForeignKey("objectives.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String)
    target: Mapped[str | None] = mapped_column(String, nullable=True)
    current: Mapped[str | None] = mapped_column(String, nullable=True)
    progress: Mapped[int] = mapped_column(default=0)
    status: Mapped[str | None] = mapped_column(String, nullable=True)

    objective: Mapped[Objective] = relationship(back_populates="krs")


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    health: Mapped[str | None] = mapped_column(String, nullable=True)
    progress: Mapped[int] = mapped_column(default=0)
    owner: Mapped[str | None] = mapped_column(String, nullable=True)
    dept_id: Mapped[str | None] = mapped_column(String, nullable=True)
    dept: Mapped[str | None] = mapped_column(String, nullable=True)  # display string
    okr: Mapped[str | None] = mapped_column(String, nullable=True)   # objective.code
    milestone: Mapped[str | None] = mapped_column(String, nullable=True)
    due: Mapped[str | None] = mapped_column(String, nullable=True)
    started: Mapped[str | None] = mapped_column(String, nullable=True)
    risks: Mapped[int] = mapped_column(default=0)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    contributors: Mapped[list[str]] = mapped_column(JSON, default=list)
    milestones: Mapped[list[dict]] = mapped_column(JSON, default=list)
    risks_detail: Mapped[list[dict]] = mapped_column(JSON, default=list)
    linked_decisions: Mapped[list[str]] = mapped_column(JSON, default=list)
    linked_sources: Mapped[list[str]] = mapped_column(JSON, default=list)


class Decision(Base):
    __tablename__ = "decisions"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    title: Mapped[str] = mapped_column(String)
    date: Mapped[str | None] = mapped_column(String, nullable=True)
    owner: Mapped[str | None] = mapped_column(String, nullable=True)
    status: Mapped[str | None] = mapped_column(String, nullable=True)
    linked_kr: Mapped[str | None] = mapped_column(String, nullable=True)
    linked_project: Mapped[str | None] = mapped_column(String, nullable=True)
    linked_question: Mapped[str | None] = mapped_column(String, nullable=True)

    question: Mapped[str | None] = mapped_column(Text, nullable=True)
    conclusion: Mapped[str | None] = mapped_column(Text, nullable=True)
    retrospective: Mapped[str | None] = mapped_column(Text, nullable=True)

    assumptions: Mapped[list[str]] = mapped_column(JSON, default=list)
    dissent: Mapped[list[dict]] = mapped_column(JSON, default=list)
    evidence_sources: Mapped[list[str]] = mapped_column(JSON, default=list)


# --- Knowledge ---------------------------------------------------------


class KnowledgeDomain(Base):
    """Top-level knowledge taxonomy in the Company Knowledge Center.
    Drives the 知识域 tab + the knowledge graph radial. Each domain is a
    container — the actual sources live in ``KnowledgeSource``.
    """

    __tablename__ = "knowledge_domains"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    # `scope` matches PRD §6.3: "company" / "department" / "project". Most
    # seed domains are company-level; we leave the column open for the
    # department-private domains that arrive in Phase 2.
    scope: Mapped[str] = mapped_column(String, default="company")
    department_id: Mapped[str | None] = mapped_column(ForeignKey("departments.id"), nullable=True)
    # Display fields that match the existing JS seed shape one-to-one.
    count: Mapped[int] = mapped_column(default=0)
    last_update: Mapped[str | None] = mapped_column(String, nullable=True)
    health: Mapped[str | None] = mapped_column(String, nullable=True)
    coverage: Mapped[int] = mapped_column(default=0)
    enabled: Mapped[bool] = mapped_column(default=True)
    tags: Mapped[list[str]] = mapped_column(JSON, default=list)


class KnowledgeSource(Base):
    __tablename__ = "knowledge_sources"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    title: Mapped[str] = mapped_column(String)
    type: Mapped[str | None] = mapped_column(String, nullable=True)
    scope: Mapped[str | None] = mapped_column(String, nullable=True)
    quality: Mapped[str | None] = mapped_column(String, nullable=True)
    uses: Mapped[int] = mapped_column(default=0)
    owner: Mapped[str | None] = mapped_column(String, nullable=True)
    updated: Mapped[str | None] = mapped_column(String, nullable=True)
    size: Mapped[str | None] = mapped_column(String, nullable=True)

    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    excerpt: Mapped[str | None] = mapped_column(Text, nullable=True)
    tags: Mapped[list[str]] = mapped_column(JSON, default=list)
    pages: Mapped[int | None] = mapped_column(nullable=True)
    lang: Mapped[str | None] = mapped_column(String, nullable=True)
    uploaded_by: Mapped[str | None] = mapped_column(String, nullable=True)
    embeddings: Mapped[int | None] = mapped_column(nullable=True)
    linked_projects: Mapped[list[str]] = mapped_column(JSON, default=list)
    linked_decisions: Mapped[list[str]] = mapped_column(JSON, default=list)


# --- Activity / Agents / Strategy Questions ----------------------------


class Activity(Base):
    """Home page activity feed. Phase 1: append-only read model from seed;
    Phase 2 will write entries here from audit triggers."""

    __tablename__ = "activity"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    who: Mapped[str | None] = mapped_column(String, nullable=True)
    what: Mapped[str | None] = mapped_column(String, nullable=True)
    target: Mapped[str | None] = mapped_column(String, nullable=True)
    when: Mapped[str | None] = mapped_column(String, nullable=True)
    type: Mapped[str | None] = mapped_column(String, nullable=True)


class Agent(Base):
    """Strategy debate persona. Static catalog the strategy canvas pulls
    from when assembling a War Council session."""

    __tablename__ = "agents"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    role: Mapped[str | None] = mapped_column(String, nullable=True)
    color: Mapped[str | None] = mapped_column(String, nullable=True)
    icon: Mapped[str | None] = mapped_column(String, nullable=True)
    focus: Mapped[str | None] = mapped_column(String, nullable=True)


class StrategyQuestion(Base):
    """Question registry that drives the Strategy Studio. Each question
    holds context source IDs, OKR codes, and participating agent IDs.
    Debate messages live elsewhere (Phase 2 — multi-agent debate)."""

    __tablename__ = "strategy_questions"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    title: Mapped[str] = mapped_column(String)
    asker: Mapped[str | None] = mapped_column(String, nullable=True)
    asked: Mapped[str | None] = mapped_column(String, nullable=True)
    status: Mapped[str | None] = mapped_column(String, nullable=True)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    rounds: Mapped[int] = mapped_column(default=0)
    options_count: Mapped[int] = mapped_column(default=0)
    decision_id: Mapped[str | None] = mapped_column(String, nullable=True)
    context: Mapped[list[str]] = mapped_column(JSON, default=list)   # source IDs
    okrs: Mapped[list[str]] = mapped_column(JSON, default=list)       # objective codes
    agents: Mapped[list[str]] = mapped_column(JSON, default=list)     # agent IDs


class DebateMessage(Base):
    """One agent's contribution to a strategy debate round.

    Append-only — a row per (question, round, agent). Multi-agent
    orchestration writes the rows synchronously; the WarCouncil panel
    groups by round on read. ``stance`` is one of ``pro|con|concern``,
    matching the seed and the existing UI color logic.
    """

    __tablename__ = "debate_messages"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    question_id: Mapped[str] = mapped_column(ForeignKey("strategy_questions.id", ondelete="CASCADE"))
    round: Mapped[int] = mapped_column(default=1)
    agent_id: Mapped[str] = mapped_column(String)
    stance: Mapped[str] = mapped_column(String, default="concern")
    text: Mapped[str] = mapped_column(Text)
    sources: Mapped[list[str]] = mapped_column(JSON, default=list)
    model: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=_utcnow)


class StrategyOption(Base):
    """A candidate strategy option synthesized from a debate transcript.

    Persisted (vs ephemeral) so the user can come back to the page and
    see the same options without paying tokens again. Regenerating
    replaces the existing rows for the question.
    """

    __tablename__ = "strategy_options"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    question_id: Mapped[str] = mapped_column(ForeignKey("strategy_questions.id", ondelete="CASCADE"))
    idx: Mapped[int] = mapped_column(default=0)  # display order
    name: Mapped[str] = mapped_column(String)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    roi: Mapped[str | None] = mapped_column(String, nullable=True)       # 高 / 中 / 低
    risk: Mapped[str | None] = mapped_column(String, nullable=True)      # 高 / 中 / 低
    time_estimate: Mapped[str | None] = mapped_column(String, nullable=True)
    pros: Mapped[int] = mapped_column(default=0)
    cons: Mapped[int] = mapped_column(default=0)
    recommended: Mapped[bool] = mapped_column(default=False)
    model: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=_utcnow)


# --- Skills / Workflows / Runs ----------------------------------------


class SkillPack(Base):
    __tablename__ = "skill_packs"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    dept: Mapped[str | None] = mapped_column(String, nullable=True)  # dept id or "platform"
    maintainer: Mapped[str | None] = mapped_column(String, nullable=True)
    scope: Mapped[str | None] = mapped_column(String, nullable=True)
    status: Mapped[str | None] = mapped_column(String, nullable=True)
    version: Mapped[str | None] = mapped_column(String, nullable=True)
    icon: Mapped[str | None] = mapped_column(String, nullable=True)
    input: Mapped[str | None] = mapped_column(Text, nullable=True)
    output: Mapped[str | None] = mapped_column(Text, nullable=True)
    uses: Mapped[int] = mapped_column(default=0)
    rating: Mapped[float] = mapped_column(default=0.0)
    updated: Mapped[str | None] = mapped_column(String, nullable=True)


class Workflow(Base):
    __tablename__ = "workflows"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    dept_id: Mapped[str | None] = mapped_column(String, nullable=True)
    owner: Mapped[str | None] = mapped_column(String, nullable=True)
    status: Mapped[str | None] = mapped_column(String, nullable=True)
    version: Mapped[str | None] = mapped_column(String, nullable=True)
    icon: Mapped[str | None] = mapped_column(String, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    input: Mapped[str | None] = mapped_column(Text, nullable=True)
    output: Mapped[str | None] = mapped_column(Text, nullable=True)
    avg_time: Mapped[str | None] = mapped_column(String, nullable=True)
    uses: Mapped[int] = mapped_column(default=0)
    last_run: Mapped[str | None] = mapped_column(String, nullable=True)
    linked_skills: Mapped[list[str]] = mapped_column(JSON, default=list)
    linked_domains: Mapped[list[str]] = mapped_column(JSON, default=list)
    steps: Mapped[list[dict]] = mapped_column(JSON, default=list)


class WorkflowRun(Base):
    __tablename__ = "workflow_runs"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    workflow_id: Mapped[str | None] = mapped_column(String, nullable=True)
    trigger: Mapped[str | None] = mapped_column(String, nullable=True)
    actor: Mapped[str | None] = mapped_column(String, nullable=True)
    started: Mapped[str | None] = mapped_column(String, nullable=True)
    duration: Mapped[str | None] = mapped_column(String, nullable=True)
    status: Mapped[str | None] = mapped_column(String, nullable=True)
    output: Mapped[str | None] = mapped_column(Text, nullable=True)


# --- Ingest Queue -----------------------------------------------------


class IngestQueueItem(Base):
    """Knowledge upload pipeline staging area."""

    __tablename__ = "ingest_queue"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    type: Mapped[str | None] = mapped_column(String, nullable=True)
    size: Mapped[str | None] = mapped_column(String, nullable=True)
    state: Mapped[str] = mapped_column(String, default="queued")
    progress: Mapped[int] = mapped_column(default=0)
    scope: Mapped[str | None] = mapped_column(String, nullable=True)
    owner: Mapped[str | None] = mapped_column(String, nullable=True)
    uploaded: Mapped[str | None] = mapped_column(String, nullable=True)
    error: Mapped[str | None] = mapped_column(Text, nullable=True)


# --- Notifications / Routing rules / Audit log ------------------------


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    at: Mapped[str | None] = mapped_column(String, nullable=True)
    category: Mapped[str | None] = mapped_column(String, nullable=True)
    read: Mapped[bool] = mapped_column(default=False)
    title: Mapped[str] = mapped_column(String)
    body: Mapped[str | None] = mapped_column(Text, nullable=True)
    link: Mapped[dict | None] = mapped_column(JSON, nullable=True)


class RoutingRule(Base):
    __tablename__ = "routing_rules"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    priority: Mapped[str | None] = mapped_column(String, nullable=True)
    enabled: Mapped[bool] = mapped_column(default=True)
    intent: Mapped[str | None] = mapped_column(String, nullable=True)
    target_dept: Mapped[str | None] = mapped_column(String, nullable=True)
    target_skill: Mapped[str | None] = mapped_column(String, nullable=True)
    permission: Mapped[str | None] = mapped_column(String, nullable=True)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    hits: Mapped[int] = mapped_column(default=0)
    last_hit: Mapped[str | None] = mapped_column(String, nullable=True)


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    at: Mapped[str | None] = mapped_column(String, nullable=True)
    actor: Mapped[str | None] = mapped_column(String, nullable=True)
    ip: Mapped[str | None] = mapped_column(String, nullable=True)
    category: Mapped[str | None] = mapped_column(String, nullable=True)
    severity: Mapped[str | None] = mapped_column(String, nullable=True)
    action: Mapped[str | None] = mapped_column(Text, nullable=True)
    target: Mapped[str | None] = mapped_column(String, nullable=True)
    scope: Mapped[str | None] = mapped_column(String, nullable=True)
    link: Mapped[dict | None] = mapped_column(JSON, nullable=True)


# --- LLM call telemetry ----------------------------------------------


class LLMCall(Base):
    """One row per Anthropic API call. Powers the Admin "AI 用量 · 缓存命中"
    panel — tokens by model + route, cache hit ratio, recent calls.

    Lightly written to (sub-millisecond insert per write); we don't
    bother with retention windows for the demo. Production would add
    a daily roll-up + a TTL cleanup task.
    """

    __tablename__ = "llm_calls"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    route: Mapped[str] = mapped_column(String)  # "chat" / "debate.round" / "debate.synthesis" / ...
    model: Mapped[str] = mapped_column(String)
    input_tokens: Mapped[int] = mapped_column(default=0)
    output_tokens: Mapped[int] = mapped_column(default=0)
    cache_read_input_tokens: Mapped[int] = mapped_column(default=0)
    cache_creation_input_tokens: Mapped[int] = mapped_column(default=0)
    latency_ms: Mapped[int] = mapped_column(default=0)
    status: Mapped[str] = mapped_column(String, default="ok")  # "ok" | "error"
    error_detail: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=_utcnow)
