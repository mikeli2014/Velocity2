"""Python literal mirror of ``src/data/seed.js``.

Drift rule: when you change one of these entities in seed.js, mirror the
change in this file in the same commit. See apps/api/CLAUDE.md.

Phase 1 mirrors: Company, Departments, Objectives (+ KRs), Projects,
DecisionsRich, KnowledgeDomains, KnowledgeSources. Other seed entities
(SkillPacks, Workflows, Activity, KRCheckIns, etc.) land in Phase 2.
"""

from __future__ import annotations

from typing import Any

# --- Company -------------------------------------------------------------

COMPANY: dict[str, Any] = {
    "id": "default",
    "name": "北海智能家居",
    "name_en": "Beihai Smart Home",
    "tagline": "让科技与水、火、风一起守护家",
    "initials": "北海",
    "industry": "智能家电 · 厨卫电器",
    "founded": 1996,
    "employees": "12,400",
    "revenue": "¥98.4亿",
    "fiscal_year": "FY2026",
    "brand_color": "#0D7A3F",
    # Knowledge profile (PRD §5.1) — Phase-1 empty defaults.
    "focus_areas": [],
    "competitors": [],
    "terminology": [],
    "context_prompt": None,
}

# --- Departments ---------------------------------------------------------
# Three-level tree (集团 → 部门 → 团队). parent_id == None → top-level.

DEPARTMENTS: list[dict[str, Any]] = [
    # L1
    {"id": "industrial-design", "parent_id": None, "name": "工业设计部", "en": "Industrial Design", "icon": "Pencil", "color": "#4F46E5", "lead": "李慕白", "people": 84, "assistant": "小龙虾", "knowledge": 1046, "skills": 8, "workflows": 6, "projects": 4, "status": "live"},
    {"id": "service", "parent_id": None, "name": "服务部", "en": "Service", "icon": "Wrench", "color": "#0EA5E9", "lead": "王锐", "people": 1820, "assistant": "小服", "knowledge": 612, "skills": 6, "workflows": 9, "projects": 3, "status": "configuring"},
    {"id": "cop", "parent_id": None, "name": "渠道运营 (COP)", "en": "Channel Operations", "icon": "Network", "color": "#10B981", "lead": "周岚", "people": 460, "assistant": "小渠", "knowledge": 388, "skills": 5, "workflows": 7, "projects": 6, "status": "configuring"},
    {"id": "marketing", "parent_id": None, "name": "市场部", "en": "Marketing", "icon": "Megaphone", "color": "#EC4899", "lead": "Anna 林", "people": 132, "assistant": "小芒", "knowledge": 274, "skills": 4, "workflows": 5, "projects": 5, "status": "draft"},
    {"id": "supply-chain", "parent_id": None, "name": "供应链", "en": "Supply Chain", "icon": "Boxes", "color": "#F59E0B", "lead": "韩松", "people": 240, "assistant": "小链", "knowledge": 510, "skills": 7, "workflows": 8, "projects": 4, "status": "draft"},
    {"id": "finance", "parent_id": None, "name": "财务", "en": "Finance", "icon": "Calculator", "color": "#6366F1", "lead": "Joyce 黄", "people": 86, "assistant": "—", "knowledge": 0, "skills": 0, "workflows": 0, "projects": 0, "status": "not-started"},
    # L2: 工业设计部
    {"id": "id-product", "parent_id": "industrial-design", "name": "产品设计组", "en": "Product Design", "icon": "Package", "color": "#4F46E5", "lead": "孙阳", "people": 32, "assistant": "小龙虾", "knowledge": 412, "skills": 4, "workflows": 3, "projects": 2, "status": "live"},
    {"id": "id-cmf", "parent_id": "industrial-design", "name": "CMF 中台", "en": "CMF Platform", "icon": "Sparkles", "color": "#7C3AED", "lead": "苏婉", "people": 22, "assistant": "小龙虾", "knowledge": 488, "skills": 3, "workflows": 2, "projects": 1, "status": "live"},
    {"id": "id-research", "parent_id": "industrial-design", "name": "用户研究组", "en": "Design Research", "icon": "Eye", "color": "#06B6D4", "lead": "林晓", "people": 14, "assistant": "小龙虾", "knowledge": 146, "skills": 1, "workflows": 1, "projects": 1, "status": "configuring"},
    # L3
    {"id": "id-product-water", "parent_id": "id-product", "name": "净水产品线", "en": "Water Treatment", "icon": "Beaker", "color": "#0EA5E9", "lead": "李慕白", "people": 12, "assistant": "小龙虾", "knowledge": 184, "skills": 2, "workflows": 1, "projects": 1, "status": "live"},
    {"id": "id-product-kitchen", "parent_id": "id-product", "name": "厨房电器线", "en": "Kitchen Appliances", "icon": "Boxes", "color": "#F97316", "lead": "孙阳", "people": 14, "assistant": "小龙虾", "knowledge": 158, "skills": 1, "workflows": 1, "projects": 1, "status": "live"},
    # L2: 服务部
    {"id": "svc-presale", "parent_id": "service", "name": "售前安装", "en": "Pre-sale Install", "icon": "Hammer", "color": "#0EA5E9", "lead": "陈刚", "people": 480, "assistant": "小服", "knowledge": 142, "skills": 2, "workflows": 3, "projects": 1, "status": "configuring"},
    {"id": "svc-aftersale", "parent_id": "service", "name": "售后维修", "en": "After-sale Repair", "icon": "Stethoscope", "color": "#0284C7", "lead": "王锐", "people": 1180, "assistant": "小服", "knowledge": 388, "skills": 3, "workflows": 5, "projects": 1, "status": "live"},
    {"id": "svc-county", "parent_id": "service", "name": "县域服务网络", "en": "County Service Net", "icon": "Map", "color": "#0369A1", "lead": "高翔", "people": 160, "assistant": "—", "knowledge": 82, "skills": 1, "workflows": 1, "projects": 1, "status": "draft"},
    # L2: 渠道运营
    {"id": "cop-online", "parent_id": "cop", "name": "线上渠道", "en": "Online Channels", "icon": "Globe", "color": "#10B981", "lead": "周岚", "people": 86, "assistant": "小渠", "knowledge": 142, "skills": 2, "workflows": 3, "projects": 3, "status": "live"},
    {"id": "cop-offline", "parent_id": "cop", "name": "线下经销", "en": "Offline Dealers", "icon": "Building", "color": "#059669", "lead": "马俊", "people": 320, "assistant": "小渠", "knowledge": 168, "skills": 2, "workflows": 3, "projects": 2, "status": "configuring"},
    {"id": "cop-ka", "parent_id": "cop", "name": "重点客户 (KA)", "en": "Key Accounts", "icon": "Crown", "color": "#047857", "lead": "韩雪", "people": 54, "assistant": "—", "knowledge": 78, "skills": 1, "workflows": 1, "projects": 1, "status": "draft"},
    # L2: 市场部
    {"id": "mkt-brand", "parent_id": "marketing", "name": "品牌组", "en": "Brand", "icon": "Star", "color": "#EC4899", "lead": "Anna 林", "people": 38, "assistant": "小芒", "knowledge": 124, "skills": 2, "workflows": 2, "projects": 2, "status": "draft"},
    {"id": "mkt-content", "parent_id": "marketing", "name": "内容与社媒", "en": "Content & Social", "icon": "Camera", "color": "#DB2777", "lead": "周婕", "people": 72, "assistant": "小芒", "knowledge": 110, "skills": 2, "workflows": 2, "projects": 2, "status": "draft"},
    {"id": "mkt-research", "parent_id": "marketing", "name": "市场研究", "en": "Market Research", "icon": "BarChart", "color": "#BE185D", "lead": "Anna 林", "people": 22, "assistant": "—", "knowledge": 40, "skills": 0, "workflows": 1, "projects": 1, "status": "draft"},
    # L2: 供应链
    {"id": "sc-procurement", "parent_id": "supply-chain", "name": "采购", "en": "Procurement", "icon": "Coins", "color": "#F59E0B", "lead": "韩松", "people": 86, "assistant": "小链", "knowledge": 220, "skills": 3, "workflows": 3, "projects": 2, "status": "draft"},
    {"id": "sc-logistics", "parent_id": "supply-chain", "name": "仓储物流", "en": "Warehousing & Logistics", "icon": "Truck", "color": "#D97706", "lead": "陆远", "people": 124, "assistant": "小链", "knowledge": 188, "skills": 2, "workflows": 3, "projects": 1, "status": "draft"},
    {"id": "sc-quality", "parent_id": "supply-chain", "name": "质量管理", "en": "Quality", "icon": "Shield", "color": "#B45309", "lead": "宋平", "people": 30, "assistant": "—", "knowledge": 102, "skills": 2, "workflows": 2, "projects": 1, "status": "draft"},
    # L2: 财务
    {"id": "fin-fp", "parent_id": "finance", "name": "FP&A", "en": "FP&A", "icon": "PieChart", "color": "#6366F1", "lead": "Joyce 黄", "people": 28, "assistant": "—", "knowledge": 0, "skills": 0, "workflows": 0, "projects": 0, "status": "not-started"},
    {"id": "fin-tax", "parent_id": "finance", "name": "税务与合规", "en": "Tax & Compliance", "icon": "Lock", "color": "#4F46E5", "lead": "Roy 何", "people": 18, "assistant": "—", "knowledge": 0, "skills": 0, "workflows": 0, "projects": 0, "status": "not-started"},
]

# --- Objectives + KRs ----------------------------------------------------

OBJECTIVES: list[dict[str, Any]] = [
    {
        "id": "obj-1", "code": "O1",
        "title": "用户为中心 — 把净水与热水做成全屋舒适标杆",
        "owner": "陈志远 · CEO", "progress": 62, "status": "on-track", "quarter": "FY26 Q1-Q4",
        "linked_projects": ["proj-1", "proj-3"],
        "krs": [
            {"id": "kr-1-1", "title": "全屋净水套系销售占比", "target": "≥35%", "current": "28.6%", "progress": 70, "status": "on-track"},
            {"id": "kr-1-2", "title": "净水器 NPS", "target": "≥62", "current": "57", "progress": 64, "status": "at-risk"},
            {"id": "kr-1-3", "title": "零冷水热水器复购联动率", "target": "≥18%", "current": "21.2%", "progress": 100, "status": "achieved"},
        ],
    },
    {
        "id": "obj-2", "code": "O2",
        "title": "渠道重构 — 完成 200 城 BP/SC/SA 三角协同",
        "owner": "周岚 · COP VP", "progress": 41, "status": "at-risk", "quarter": "FY26 H1",
        "linked_projects": ["proj-2", "proj-5"],
        "krs": [
            {"id": "kr-2-1", "title": "完成三角协同的城市数", "target": "200", "current": "82", "progress": 41, "status": "at-risk"},
            {"id": "kr-2-2", "title": "线上线下同价覆盖率", "target": "≥90%", "current": "76%", "progress": 78, "status": "on-track"},
            {"id": "kr-2-3", "title": "经销商满意度", "target": "≥4.4/5", "current": "4.1", "progress": 60, "status": "at-risk"},
        ],
    },
    {
        "id": "obj-3", "code": "O3",
        "title": "工业设计 — 建立可复用的 9 大品类 CMF 中台",
        "owner": "李慕白 · 工业设计总监", "progress": 78, "status": "on-track", "quarter": "FY26 Q1-Q3",
        "linked_projects": ["proj-4"],
        "krs": [
            {"id": "kr-3-1", "title": "CMF 知识条目入库数", "target": "≥1200", "current": "1,046", "progress": 87, "status": "on-track"},
            {"id": "kr-3-2", "title": "新品复用率", "target": "≥55%", "current": "48%", "progress": 76, "status": "on-track"},
        ],
    },
    {
        "id": "obj-4", "code": "O4",
        "title": "AI Native — Velocity 成为全员日常工作平台",
        "owner": "黄毅 · CTO", "progress": 33, "status": "at-risk", "quarter": "FY26 全年",
        "linked_projects": ["proj-6"],
        "krs": [
            {"id": "kr-4-1", "title": "部门助手日活员工数", "target": "≥3,000", "current": "1,128", "progress": 38, "status": "at-risk"},
            {"id": "kr-4-2", "title": "知识复用率", "target": "≥60%", "current": "44%", "progress": 73, "status": "on-track"},
            {"id": "kr-4-3", "title": "战略决策可追溯率", "target": "≥80%", "current": "31%", "progress": 39, "status": "at-risk"},
        ],
    },
]

# --- Projects ------------------------------------------------------------

PROJECTS: list[dict[str, Any]] = [
    {
        "id": "proj-1", "name": "全屋净水 2.0 — 局改方案产品化",
        "health": "ok", "progress": 64, "owner": "李慕白",
        "dept_id": "industrial-design", "dept": "工业设计 · 产品",
        "okr": "O1", "milestone": "样机评审", "due": "2026-05-12", "started": "2025-11-10", "risks": 1,
        "description": "面向 4-5 年房龄家庭的局改型全屋净水套系,重点优化安装与售后体验。",
        "contributors": ["李慕白", "孙阳", "苏婉", "陈思源"],
        "milestones": [
            {"id": "m1-1", "name": "用户画像与需求收口", "date": "2025-12-15", "status": "achieved"},
            {"id": "m1-2", "name": "概念设计评审", "date": "2026-02-05", "status": "achieved"},
            {"id": "m1-3", "name": "样机评审 (DV)", "date": "2026-05-12", "status": "in-progress"},
            {"id": "m1-4", "name": "小批量验证 (PV)", "date": "2026-08-01", "status": "todo"},
        ],
        "risks_detail": [
            {"id": "r1-1", "text": "膜组件供应商杭州东方目前单一来源,12月初到货受春节影响", "level": "warn", "owner": "陈思源"},
        ],
        "linked_decisions": ["d-1"], "linked_sources": ["ks-2", "ks-8"],
    },
    {
        "id": "proj-2", "name": "BP/SC/SA 三角协同 200 城落地",
        "health": "warn", "progress": 41, "owner": "周岚",
        "dept_id": "cop", "dept": "渠道运营 (COP)",
        "okr": "O2", "milestone": "二线城市启动", "due": "2026-06-30", "started": "2025-09-01", "risks": 4,
        "description": "三方角色定义清晰、数据共享、利益对齐,作为 200 城渠道铺设的基座。",
        "contributors": ["周岚", "马俊", "韩雪"],
        "milestones": [
            {"id": "m2-1", "name": "一线 30 城签约", "date": "2025-12-20", "status": "achieved"},
            {"id": "m2-2", "name": "中台系统切换", "date": "2026-03-15", "status": "achieved"},
            {"id": "m2-3", "name": "二线 80 城启动", "date": "2026-05-30", "status": "in-progress"},
            {"id": "m2-4", "name": "县域试点 (90 城)", "date": "2026-09-30", "status": "todo"},
        ],
        "risks_detail": [
            {"id": "r2-1", "text": "线上线下同价机制在 32 个城市仍存在盲点", "level": "warn", "owner": "周岚"},
            {"id": "r2-2", "text": "BP 经销商满意度较 Q4 下降 4pt", "level": "warn", "owner": "汪洋"},
            {"id": "r2-3", "text": "两大省份 SC 招商进度落后 30%", "level": "danger", "owner": "段晗"},
            {"id": "r2-4", "text": "DTC 与线下利益冲突 escalation 5 起", "level": "warn", "owner": "周岚"},
        ],
        "linked_decisions": ["d-2"], "linked_sources": ["ks-3"],
    },
    {
        "id": "proj-3", "name": "零冷水燃气热水器 X 系列",
        "health": "ok", "progress": 81, "owner": "孙阳",
        "dept_id": "industrial-design", "dept": "工业设计",
        "okr": "O1", "milestone": "量产爬坡", "due": "2026-04-28", "started": "2025-06-01", "risks": 0,
        "description": "0 冷水主流型号 X 系列,目标实现 1 秒出热水,与净水器联动复购。",
        "contributors": ["孙阳", "苏婉", "韩松"],
        "milestones": [
            {"id": "m3-1", "name": "工程样机", "date": "2025-09-15", "status": "achieved"},
            {"id": "m3-2", "name": "DV/PV 验证", "date": "2026-01-10", "status": "achieved"},
            {"id": "m3-3", "name": "量产爬坡", "date": "2026-04-28", "status": "in-progress"},
        ],
        "risks_detail": [], "linked_decisions": [], "linked_sources": ["ks-8"],
    },
    {
        "id": "proj-4", "name": "9 大品类 CMF 中台 Phase 2",
        "health": "ok", "progress": 78, "owner": "苏婉",
        "dept_id": "id-cmf", "dept": "工业设计",
        "okr": "O3", "milestone": "竞品色彩库收口", "due": "2026-05-20", "started": "2025-07-15", "risks": 1,
        "description": "把色彩、材质、表面工艺统一进入中台,实现跨品类复用与提案加速。",
        "contributors": ["苏婉", "孙阳", "林然"],
        "milestones": [
            {"id": "m4-1", "name": "Phase 1 上线 (4 大品类)", "date": "2025-12-01", "status": "achieved"},
            {"id": "m4-2", "name": "竞品色彩库收口", "date": "2026-05-20", "status": "in-progress"},
            {"id": "m4-3", "name": "9 大品类全部入库", "date": "2026-09-15", "status": "todo"},
        ],
        "risks_detail": [
            {"id": "r4-1", "text": "奥维采集接口稳定性不足,触发 3 次回填", "level": "warn", "owner": "林然"},
        ],
        "linked_decisions": [], "linked_sources": ["ks-5"],
    },
    {
        "id": "proj-5", "name": "县域市场服务网络重塑",
        "health": "danger", "progress": 22, "owner": "王锐",
        "dept_id": "service", "dept": "服务部",
        "okr": "O2", "milestone": "试点城市选定", "due": "2026-05-05", "started": "2026-02-01", "risks": 6,
        "description": "以 SC 主导重新组织县域服务网络,对齐渠道协同节奏。",
        "contributors": ["王锐", "高翔", "陈刚"],
        "milestones": [
            {"id": "m5-1", "name": "供应商资质与覆盖度调研", "date": "2026-03-01", "status": "achieved"},
            {"id": "m5-2", "name": "试点城市选定 (10 城)", "date": "2026-05-05", "status": "in-progress"},
            {"id": "m5-3", "name": "前 30 城 SC 选型", "date": "2026-08-30", "status": "todo"},
        ],
        "risks_detail": [
            {"id": "r5-1", "text": "县域 SC 备件库存覆盖率仅 47%,远低于服务标准", "level": "danger", "owner": "高翔"},
            {"id": "r5-2", "text": "技师认证体系尚未在县域落地", "level": "danger", "owner": "王锐"},
            {"id": "r5-3", "text": "退货率 11.4% 直接影响 NPS", "level": "danger", "owner": "王锐"},
            {"id": "r5-4", "text": "投诉响应平均 38 小时,目标 ≤12 小时", "level": "warn", "owner": "高翔"},
            {"id": "r5-5", "text": "部分省份服务费用结算延迟", "level": "warn", "owner": "王锐"},
            {"id": "r5-6", "text": "区域调度系统与 ERP 未打通", "level": "warn", "owner": "Tomas 朱"},
        ],
        "linked_decisions": ["d-2"], "linked_sources": ["ks-6"],
    },
    {
        "id": "proj-6", "name": "Velocity 部门助手全员推广",
        "health": "warn", "progress": 33, "owner": "黄毅",
        "dept_id": "it", "dept": "IT / Velocity 平台组",
        "okr": "O4", "milestone": "工业设计部上线", "due": "2026-04-30", "started": "2026-01-08", "risks": 2,
        "description": "Velocity 从战略画布走向部门日常工作平台,O4 KR1/2/3 的核心承载。",
        "contributors": ["黄毅", "Tomas 朱", "陈志远"],
        "milestones": [
            {"id": "m6-1", "name": "工业设计部上线", "date": "2026-04-30", "status": "in-progress"},
            {"id": "m6-2", "name": "服务部上线", "date": "2026-06-30", "status": "todo"},
            {"id": "m6-3", "name": "全公司开放", "date": "2026-12-31", "status": "todo"},
        ],
        "risks_detail": [
            {"id": "r6-1", "text": "知识复用率 44%,KR 进度落后", "level": "warn", "owner": "黄毅"},
            {"id": "r6-2", "text": "决策可追溯率仅 31%", "level": "warn", "owner": "陈志远"},
        ],
        "linked_decisions": ["d-3"], "linked_sources": ["ks-7"],
    },
    {
        "id": "proj-7", "name": "新风净化机 G3 海外首发",
        "health": "ok", "progress": 55, "owner": "Renee",
        "dept_id": "industrial-design", "dept": "海外事业部",
        "okr": "O1", "milestone": "欧标认证完成", "due": "2026-07-10", "started": "2025-08-15", "risks": 1,
        "description": "G3 新风净化机首次进入欧洲市场,以德/法/北欧为优先国。",
        "contributors": ["Renee", "孙阳", "宋平"],
        "milestones": [
            {"id": "m7-1", "name": "欧标 CE 认证启动", "date": "2026-01-15", "status": "achieved"},
            {"id": "m7-2", "name": "欧标认证完成", "date": "2026-07-10", "status": "in-progress"},
            {"id": "m7-3", "name": "首批渠道铺货", "date": "2026-09-30", "status": "todo"},
        ],
        "risks_detail": [
            {"id": "r7-1", "text": "RoHS 报告需补充 2 项材料", "level": "warn", "owner": "宋平"},
        ],
        "linked_decisions": [], "linked_sources": [],
    },
]

# --- DecisionsRich -------------------------------------------------------

DECISIONS: list[dict[str, Any]] = [
    {
        "id": "d-1",
        "title": "全屋净水 2.0 产品定位收敛为'局改焕新'",
        "date": "2026-03-12", "owner": "陈志远", "status": "in-flight",
        "linked_kr": "kr-1-1", "linked_project": "proj-1", "linked_question": None,
        "question": "全屋净水 2.0 应该面向新房刚需还是局改用户?",
        "conclusion": "面向 4-5 年房龄的局改家庭,以'焕新'为核心叙事,优先优化安装与售后体验。",
        "assumptions": [
            "局改家庭对净水的认知度高于新装,客单价可上探 ¥18,000",
            "县域服务网络可在 Q3 完成铺设,支撑套系级履约",
        ],
        "dissent": [
            {"agent": "ag-finance", "text": "局改客群规模较新装小 60%,需要靠客单价补偿"},
        ],
        "evidence_sources": ["ks-1", "ks-2", "ks-4", "ks-8"],
        "retrospective": "",
    },
    {
        "id": "d-2",
        "title": "县域服务网络由 BP 主导改为 SC 主导",
        "date": "2026-04-02", "owner": "周岚", "status": "in-flight",
        "linked_kr": "kr-2-1", "linked_project": "proj-5", "linked_question": "sq-3",
        "question": "县域市场谁来主导服务网络铺设?BP 渠道商,还是 SC 服务商?",
        "conclusion": "由 SC 主导服务网络,BP 保留商品销售。先在 10 城试点,Q3 复制到 30 城。",
        "assumptions": [
            "SC 主导能把上门响应时长从 38h 降到 ≤14h",
            "县域 SA (服务工程师) 培训体系可在 Q2 落地",
        ],
        "dissent": [
            {"agent": "ag-risk", "text": "BP / SC 角色切换会让历史合作 BP 受损,需要给出补偿机制"},
            {"agent": "ag-ops", "text": "SC 主导的备件库存预算是 BP 的 1.6 倍,需提前预算"},
        ],
        "evidence_sources": ["ks-3", "ks-6"],
        "retrospective": "",
    },
    {
        "id": "d-3",
        "title": "Velocity 部门助手优先工业设计部全员上线",
        "date": "2026-04-15", "owner": "黄毅", "status": "in-flight",
        "linked_kr": "kr-4-1", "linked_project": "proj-6", "linked_question": "sq-4",
        "question": "Velocity 部门助手按什么次序在公司内推开?",
        "conclusion": "工业设计部先全员上线,然后是服务部 → 渠道运营部 → 供应链。",
        "assumptions": [
            "工业设计部 84 人有最强的 AI 工作流诉求",
            "CMF 知识域已经达到 95% 覆盖度,RAG 命中率有保证",
        ],
        "dissent": [
            {"agent": "ag-org", "text": "如果只在 ID 上线,其它部门的高频用户(如服务部 1820 人)感知会差"},
        ],
        "evidence_sources": ["ks-7"],
        "retrospective": "",
    },
]

# --- KnowledgeDomains ----------------------------------------------------

KNOWLEDGE_DOMAINS: list[dict[str, Any]] = [
    {"id": "kd-supplier",   "name": "供应商",            "scope": "company", "department_id": None, "count": 218,  "last_update": "2小时前", "health": "ok",   "coverage": 92, "enabled": True, "tags": ["供应链"], "description": "外部供应商档案 / 资质 / 产能 / 历史合作记录。"},
    {"id": "kd-material",   "name": "材料",              "scope": "company", "department_id": None, "count": 384,  "last_update": "今天",   "health": "ok",   "coverage": 88, "enabled": True, "tags": ["设计", "材料"], "description": "金属、塑料、玻璃、陶瓷等材料参数与成本带。"},
    {"id": "kd-process",    "name": "工艺",              "scope": "company", "department_id": None, "count": 156,  "last_update": "昨天",   "health": "ok",   "coverage": 81, "enabled": True, "tags": ["设计", "工艺"], "description": "PVD / 阳极氧化 / 喷涂 / 拉丝等工艺案例与成本。"},
    {"id": "kd-cmf",        "name": "CMF (色彩材质工艺)", "scope": "company", "department_id": None, "count": 1046, "last_update": "1小时前", "health": "ok",   "coverage": 95, "enabled": True, "tags": ["CMF", "色彩", "材质"], "description": "9 大品类 CMF 中台条目,服务跨品类复用与提案。"},
    {"id": "kd-competitor", "name": "竞品分析",          "scope": "company", "department_id": None, "count": 247,  "last_update": "今天",   "health": "warn", "coverage": 67, "enabled": True, "tags": ["竞品"], "description": "主要竞争对手的产品、价格、规格、CMF。"},
    {"id": "kd-market",     "name": "市场数据 (奥维)",    "scope": "company", "department_id": None, "count": 92,   "last_update": "2天前",  "health": "warn", "coverage": 60, "enabled": True, "tags": ["市场", "奥维"], "description": "奥维云网厨卫品类销售数据与价格带分析。"},
    {"id": "kd-trend",      "name": "趋势洞察",          "scope": "company", "department_id": None, "count": 128,  "last_update": "今天",   "health": "ok",   "coverage": 78, "enabled": True, "tags": ["趋势"], "description": "用户调研、展会观察、季度趋势报告。"},
    {"id": "kd-category",   "name": "9大品类知识",       "scope": "company", "department_id": None, "count": 532,  "last_update": "今天",   "health": "ok",   "coverage": 84, "enabled": True, "tags": ["品类"], "description": "净水 / 热水 / 厨电 / 新风 等品类的详细知识库。"},
]

# --- KnowledgeSources ----------------------------------------------------

KNOWLEDGE_SOURCES: list[dict[str, Any]] = [
    {
        "id": "ks-1", "title": "FY26 集团战略与年度 OKR", "type": "PPT", "scope": "公司", "quality": "approved",
        "uses": 142, "owner": "战略办", "updated": "2026-04-10", "size": "8.2MB",
        "summary": "FY26 全年战略主线:用户为中心、渠道重构、设计中台、AI Native。每个主线对应一个公司级 Objective 与 3 个 KR。",
        "excerpt": "Velocity 的目标是把企业知识、战略、OKR 和关键项目整合成统一的认知背景,让所有 AI 输出都基于公司的真实情况。FY26 重点:全屋净水套系、200 城渠道协同、9 大品类 CMF 中台、Velocity 部门助手全员推广。",
        "tags": ["战略", "OKR", "FY26", "公司级"],
        "pages": 42, "lang": "zh-CN", "uploaded_by": "战略办 · 周明",
        "linked_projects": ["proj-1", "proj-2", "proj-6"], "linked_decisions": ["d-1"], "embeddings": 412,
    },
    {
        "id": "ks-2", "title": "全屋净水 2.0 产品方向白皮书 v3", "type": "PDF", "scope": "公司 / 工业设计", "quality": "approved",
        "uses": 87, "owner": "李慕白", "updated": "2026-04-18", "size": "12.4MB",
        "summary": "局改家庭场景下全屋净水套系的产品定位、用户画像、核心配置、安装与售后假设。",
        "excerpt": "面向 4-5 年房龄的局改家庭。核心痛点:水质硬度、二次污染、热水联动。建议套系组合:厨房净水器 + 全屋前置 + 中央净水 + 即热饮水。客单价目标 ¥18,000-22,000。",
        "tags": ["全屋净水", "局改", "产品定位", "客单价"],
        "pages": 28, "lang": "zh-CN", "uploaded_by": "李慕白",
        "linked_projects": ["proj-1"], "linked_decisions": ["d-1"], "embeddings": 196,
    },
    {
        "id": "ks-3", "title": "BP/SC/SA 三角协同操作手册", "type": "DOC", "scope": "渠道运营", "quality": "review",
        "uses": 64, "owner": "周岚", "updated": "2026-04-21", "size": "2.1MB",
        "summary": "BP (经销商) / SC (服务商) / SA (服务工程师) 三方在城市中的角色定义、利益分配、SLA 和数据共享机制。",
        "excerpt": "BP 负责整机销售与商品库存。SC 负责服务交付与备件库存。SA 负责实际上门与技师调度。三方在中台共享订单、工单、客户数据。",
        "tags": ["BP", "SC", "SA", "三角协同", "渠道"],
        "pages": 18, "lang": "zh-CN", "uploaded_by": "周岚",
        "linked_projects": ["proj-2"], "linked_decisions": ["d-2"], "embeddings": 76,
    },
    {
        "id": "ks-4", "title": "奥维 2025Q4 厨卫品类报告", "type": "XLSX", "scope": "公司", "quality": "approved",
        "uses": 312, "owner": "市场部", "updated": "2026-02-08", "size": "44.6MB",
        "summary": "奥维云网 2025Q4 厨卫品类销售数据,包含线上线下分渠道、价格带、品牌排名、增长率。",
        "excerpt": "厨卫品类 25Q4 线上 +18.4%,线下 -3.2%。价格带 3-4K 集中度提升 2.4pt。前 5 品牌:海尔、美的、A.O.史密斯、林内、北海。北海在 5K+ 高端段占比 12.4%。",
        "tags": ["奥维", "厨卫", "市场份额", "价格带", "竞品"],
        "pages": 0, "lang": "zh-CN", "uploaded_by": "Anna 林",
        "linked_projects": [], "linked_decisions": [], "embeddings": 824,
    },
    {
        "id": "ks-5", "title": "竞品 CMF 图库 (2025春夏)", "type": "图集", "scope": "工业设计", "quality": "approved",
        "uses": 521, "owner": "苏婉", "updated": "2026-03-30", "size": "1.2GB",
        "summary": "9 大品类共 1,200+ 张竞品产品照,自动识别色彩 / 材质 / 表面工艺并生成 CMF 标签。",
        "excerpt": "色彩:雾雪白、墨砂黑、沙金、玄铁灰、薄雾蓝。表面工艺:阳极氧化、PVD、喷涂、拉丝、高光。趋势:大面积 PVD-Black 在高端段渗透率显著上升。",
        "tags": ["CMF", "竞品", "色彩", "表面工艺", "趋势"],
        "pages": 0, "lang": "zh-CN", "uploaded_by": "苏婉",
        "linked_projects": ["proj-3", "proj-4"], "linked_decisions": [], "embeddings": 1206,
    },
    {
        "id": "ks-6", "title": "县域服务网络试点复盘", "type": "DOC", "scope": "服务部", "quality": "draft",
        "uses": 12, "owner": "王锐", "updated": "2026-04-22", "size": "880KB",
        "summary": "5 个县域试点城市 30 天数据复盘:响应时长、备件覆盖率、技师覆盖率、用户满意度。",
        "excerpt": "试点 5 城均值:平均响应 38h (目标 ≤12h),备件覆盖 47% (目标 ≥85%),技师覆盖 54% (目标 ≥80%),NPS 41 (目标 ≥60)。结论:县域必须以 SC 主导,先铺备件再铺人员。",
        "tags": ["县域", "服务", "试点", "复盘"],
        "pages": 12, "lang": "zh-CN", "uploaded_by": "王锐",
        "linked_projects": ["proj-5"], "linked_decisions": ["d-2"], "embeddings": 38,
    },
    {
        "id": "ks-7", "title": "AI Native 转型决议 (董事会)", "type": "MEMO", "scope": "公司", "quality": "approved",
        "uses": 28, "owner": "陈志远", "updated": "2026-01-15", "size": "120KB",
        "summary": "董事会 AI Native 转型决议:Velocity 作为公司级认知工作台,2026 年覆盖核心部门,2027 年扩展全员。",
        "excerpt": "AI Native 不是堆砌 AI 工具,而是把企业知识、战略、OKR 和工作流统一进 Velocity,让每个员工都在 AI 增强的工作流中工作。",
        "tags": ["董事会", "AI Native", "决议", "Velocity"],
        "pages": 4, "lang": "zh-CN", "uploaded_by": "陈志远",
        "linked_projects": ["proj-6"], "linked_decisions": ["d-3"], "embeddings": 12,
    },
    {
        "id": "ks-8", "title": "零冷水技术路线图 v2", "type": "PPT", "scope": "工业设计", "quality": "approved",
        "uses": 156, "owner": "孙阳", "updated": "2026-04-02", "size": "6.1MB",
        "summary": "零冷水 X 系列技术路线:即热模块、循环泵、智能控制、与净水系统的联动。",
        "excerpt": "零冷水核心:1) 高频即热模块 (功率密度 ≥35W/cm²);2) 智能循环泵 (待机功耗 ≤3W);3) 与净水器的双 API 联动。商品规划:X1 (主力) / X2 (高端) / X3 (出海)。",
        "tags": ["零冷水", "技术路线", "即热", "X系列"],
        "pages": 36, "lang": "zh-CN", "uploaded_by": "孙阳",
        "linked_projects": ["proj-3"], "linked_decisions": [], "embeddings": 168,
    },
]


# --- Activity (Home feed) ------------------------------------------------

ACTIVITY: list[dict[str, Any]] = [
    {"id": "ac-1", "who": "李慕白",     "what": "更新了关键项目",            "target": "全屋净水 2.0 — 局改方案产品化", "when": "12 分钟前", "type": "project"},
    {"id": "ac-2", "who": "小龙虾助手", "what": "回答了 8 个工业设计部检索请求", "target": "今日",                          "when": "1 小时前",   "type": "assistant"},
    {"id": "ac-3", "who": "周岚",       "what": "新增风险到",                "target": "BP/SC/SA 三角协同 200 城落地",  "when": "2 小时前",   "type": "risk"},
    {"id": "ac-4", "who": "战略画布",   "what": "完成了第 3 轮多智能体研讨", "target": "FY26 是否加大线上 DTC 渠道投入?", "when": "今早 09:24","type": "strategy"},
    {"id": "ac-5", "who": "苏婉",       "what": "上传了 38 条 CMF 知识条目", "target": "CMF 知识域",                    "when": "今早 08:50","type": "knowledge"},
    {"id": "ac-6", "who": "陈志远",     "what": "查看了",                    "target": "FY26 公司级 OKR 执行健康度",    "when": "昨天 22:11", "type": "view"},
]

# --- Agents (strategy debate personas) -----------------------------------

AGENTS: list[dict[str, Any]] = [
    {"id": "ag-finance", "name": "财务视角",     "role": "Finance Strategist", "color": "#f59e0b", "icon": "Coins",      "focus": "ROI / 现金流 / 投入产出比"},
    {"id": "ag-product", "name": "产品视角",     "role": "Product Lead",       "color": "#4F46E5", "icon": "Package",    "focus": "用户价值 / 品类机会 / 路线图"},
    {"id": "ag-gtm",     "name": "GTM 视角",     "role": "Go-to-Market",       "color": "#EC4899", "icon": "Megaphone",  "focus": "渠道 / 节奏 / 竞争反应"},
    {"id": "ag-ops",     "name": "运营视角",     "role": "Operations",         "color": "#10B981", "icon": "Activity",   "focus": "执行节奏 / 资源 / 流程"},
    {"id": "ag-risk",    "name": "风险视角",     "role": "Risk & Compliance",  "color": "#EF4444", "icon": "Shield",     "focus": "合规 / 安全 / 反对意见"},
    {"id": "ag-tech",    "name": "技术视角",     "role": "Engineering",        "color": "#0EA5E9", "icon": "Cpu",        "focus": "可行性 / 架构 / 投入"},
    {"id": "ag-supply",  "name": "供应链视角",   "role": "Supply Chain",       "color": "#6366F1", "icon": "Truck",      "focus": "产能 / 库存 / 供应商"},
    {"id": "ag-org",     "name": "组织视角",     "role": "Org & Talent",       "color": "#7C3AED", "icon": "Users",      "focus": "组织 / 人才 / 文化"},
]

# --- Strategy Questions ---------------------------------------------------

STRATEGY_QUESTIONS: list[dict[str, Any]] = [
    {
        "id": "sq-1",
        "title": "FY26 是否加大线上 DTC 渠道投入?",
        "asker": "陈志远 · CEO",
        "asked": "2026-04-23",
        "status": "in-debate",
        "summary": "线上 DTC 是否能成为全屋净水套系的主力增长引擎,以及对线下渠道的冲击如何控制。",
        "rounds": 3, "options_count": 3, "decision_id": None,
        "context": ["ks-1", "ks-3", "ks-4"],
        "okrs": ["O1", "O2"],
        "agents": ["ag-finance", "ag-product", "ag-gtm", "ag-ops", "ag-risk", "ag-supply", "ag-org"],
    },
    {
        "id": "sq-2",
        "title": "FY26 H2 是否进入欧洲市场首发新风净化机?",
        "asker": "Renee · 海外事业部",
        "asked": "2026-04-12",
        "status": "in-debate",
        "summary": "G3 新风净化机在欧洲首发,需评估 CE 认证节奏、北欧市场壁垒以及与现有海外合作渠道的协同。",
        "rounds": 2, "options_count": 2, "decision_id": None,
        "context": ["ks-1", "ks-7"],
        "okrs": ["O1"],
        "agents": ["ag-product", "ag-gtm", "ag-finance", "ag-supply", "ag-risk"],
    },
    {
        "id": "sq-3",
        "title": "县域服务网络由 BP 主导改为 SC 主导是否提升履约?",
        "asker": "周岚 · COP VP",
        "asked": "2026-03-18",
        "status": "decided",
        "summary": "已完成 3 轮研讨与 2 城试点,数据显示 SC 主导能把响应时长从 38h 降至 14h。",
        "rounds": 3, "options_count": 2, "decision_id": "d-2",
        "context": ["ks-3", "ks-6"],
        "okrs": ["O2"],
        "agents": ["ag-ops", "ag-risk", "ag-org", "ag-product", "ag-gtm"],
    },
    {
        "id": "sq-4",
        "title": "Velocity 部门助手是否优先工业设计部全员上线?",
        "asker": "黄毅 · CTO",
        "asked": "2026-03-04",
        "status": "decided",
        "summary": "工业设计部需求最强且数据基础最好,先在该部门全员上线,作为后续部门的样板。",
        "rounds": 2, "options_count": 3, "decision_id": "d-3",
        "context": ["ks-7"],
        "okrs": ["O4"],
        "agents": ["ag-product", "ag-tech", "ag-org", "ag-risk"],
    },
    {
        "id": "sq-5",
        "title": "FY27 是否把 9 大品类 CMF 中台对外开放给经销商?",
        "asker": "苏婉 · 设计总监",
        "asked": "2026-04-25",
        "status": "draft",
        "summary": "想法初稿:CMF 中台可以变成对内 + 对经销商的共享设计资产,但需评估知识产权与商业模式。",
        "rounds": 0, "options_count": 0, "decision_id": None,
        "context": ["ks-5"],
        "okrs": ["O3"],
        "agents": [],
    },
]


# --- Loader --------------------------------------------------------------


def load_seed(db) -> dict[str, int]:
    """Populate the DB from the literals above. Idempotent: returns
    counts of rows inserted per table; existing rows are left untouched.
    Intended to run at app startup if ``settings.auto_seed`` is True
    and the DB looks empty.
    """
    from . import models  # local import to avoid circular at module load

    inserted = {"company": 0, "departments": 0, "objectives": 0, "key_results": 0,
                "projects": 0, "decisions": 0, "knowledge_domains": 0, "knowledge_sources": 0,
                "activity": 0, "agents": 0, "strategy_questions": 0}

    if db.get(models.Company, COMPANY["id"]) is None:
        db.add(models.Company(**COMPANY))
        inserted["company"] = 1

    for d in DEPARTMENTS:
        if db.get(models.Department, d["id"]) is None:
            db.add(models.Department(**d))
            inserted["departments"] += 1

    for o in OBJECTIVES:
        if db.get(models.Objective, o["id"]) is None:
            krs_data = o.pop("krs", []) if "krs" in o else []
            obj = models.Objective(**o)
            for k in krs_data:
                obj.krs.append(models.KeyResult(**{**k, "objective_id": obj.id}))
                inserted["key_results"] += 1
            # Restore krs key in source dict so re-running doesn't mutate it.
            o["krs"] = krs_data
            db.add(obj)
            inserted["objectives"] += 1

    for p in PROJECTS:
        if db.get(models.Project, p["id"]) is None:
            db.add(models.Project(**p))
            inserted["projects"] += 1

    for d in DECISIONS:
        if db.get(models.Decision, d["id"]) is None:
            db.add(models.Decision(**d))
            inserted["decisions"] += 1

    for kd in KNOWLEDGE_DOMAINS:
        if db.get(models.KnowledgeDomain, kd["id"]) is None:
            db.add(models.KnowledgeDomain(**kd))
            inserted["knowledge_domains"] += 1

    for ks in KNOWLEDGE_SOURCES:
        if db.get(models.KnowledgeSource, ks["id"]) is None:
            db.add(models.KnowledgeSource(**ks))
            inserted["knowledge_sources"] += 1

    for a in ACTIVITY:
        if db.get(models.Activity, a["id"]) is None:
            db.add(models.Activity(**a))
            inserted["activity"] += 1

    for ag in AGENTS:
        if db.get(models.Agent, ag["id"]) is None:
            db.add(models.Agent(**ag))
            inserted["agents"] += 1

    for sq in STRATEGY_QUESTIONS:
        if db.get(models.StrategyQuestion, sq["id"]) is None:
            db.add(models.StrategyQuestion(**sq))
            inserted["strategy_questions"] += 1

    db.commit()
    return inserted


def is_db_empty(db) -> bool:
    """Cheap probe: company table has zero rows ⇒ assume empty DB."""
    from . import models  # local import to avoid circular at module load

    return db.query(models.Company).count() == 0
