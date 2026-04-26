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


# --- Health ------------------------------------------------------------


class HealthOut(BaseModel):
    status: str = "ok"
    version: str
    database: str  # "sqlite" | "postgres" | other
    objective_count: int
