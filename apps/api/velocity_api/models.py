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
