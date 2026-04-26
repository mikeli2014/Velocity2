// Velocity OS — seed data (a fictional smart-appliance company "Beihai 北海")

export const Company = {
  name: "北海智能家居",
  nameEn: "Beihai Smart Home",
  tagline: "让科技与水、火、风一起守护家",
  initials: "北海",
  industry: "智能家电 · 厨卫电器",
  founded: 1996,
  employees: "12,400",
  revenue: "¥98.4亿",
  fiscalYear: "FY2026",
  brandColor: "#0D7A3F"
};

export const Objectives = [
  {
    id: "obj-1", code: "O1",
    title: "用户为中心 — 把净水与热水做成全屋舒适标杆",
    owner: "陈志远 · CEO", progress: 62, status: "on-track", quarter: "FY26 Q1-Q4",
    krs: [
      { id: "kr-1-1", title: "全屋净水套系销售占比", target: "≥35%", current: "28.6%", progress: 70, status: "on-track" },
      { id: "kr-1-2", title: "净水器 NPS", target: "≥62", current: "57", progress: 64, status: "at-risk" },
      { id: "kr-1-3", title: "零冷水热水器复购联动率", target: "≥18%", current: "21.2%", progress: 100, status: "achieved" }
    ],
    linkedProjects: ["proj-1", "proj-3"]
  },
  {
    id: "obj-2", code: "O2",
    title: "渠道重构 — 完成 200 城 BP/SC/SA 三角协同",
    owner: "周岚 · COP VP", progress: 41, status: "at-risk", quarter: "FY26 H1",
    krs: [
      { id: "kr-2-1", title: "完成三角协同的城市数", target: "200", current: "82", progress: 41, status: "at-risk" },
      { id: "kr-2-2", title: "线上线下同价覆盖率", target: "≥90%", current: "76%", progress: 78, status: "on-track" },
      { id: "kr-2-3", title: "经销商满意度", target: "≥4.4/5", current: "4.1", progress: 60, status: "at-risk" }
    ],
    linkedProjects: ["proj-2", "proj-5"]
  },
  {
    id: "obj-3", code: "O3",
    title: "工业设计 — 建立可复用的 9 大品类 CMF 中台",
    owner: "李慕白 · 工业设计总监", progress: 78, status: "on-track", quarter: "FY26 Q1-Q3",
    krs: [
      { id: "kr-3-1", title: "CMF 知识条目入库数", target: "≥1200", current: "1,046", progress: 87, status: "on-track" },
      { id: "kr-3-2", title: "新品复用率", target: "≥55%", current: "48%", progress: 76, status: "on-track" }
    ],
    linkedProjects: ["proj-4"]
  },
  {
    id: "obj-4", code: "O4",
    title: "AI Native — Velocity 成为全员日常工作平台",
    owner: "黄毅 · CTO", progress: 33, status: "at-risk", quarter: "FY26 全年",
    krs: [
      { id: "kr-4-1", title: "部门助手日活员工数", target: "≥3,000", current: "1,128", progress: 38, status: "at-risk" },
      { id: "kr-4-2", title: "知识复用率", target: "≥60%", current: "44%", progress: 73, status: "on-track" },
      { id: "kr-4-3", title: "战略决策可追溯率", target: "≥80%", current: "31%", progress: 39, status: "at-risk" }
    ],
    linkedProjects: ["proj-6"]
  }
];

export const Projects = [
  { id: "proj-1", name: "全屋净水 2.0 — 局改方案产品化", health: "ok", progress: 64, owner: "李慕白", dept: "工业设计 · 产品", okr: "O1", milestone: "样机评审", due: "2026-05-12", risks: 1 },
  { id: "proj-2", name: "BP/SC/SA 三角协同 200 城落地", health: "warn", progress: 41, owner: "周岚", dept: "渠道运营 (COP)", okr: "O2", milestone: "二线城市启动", due: "2026-06-30", risks: 4 },
  { id: "proj-3", name: "零冷水燃气热水器 X 系列", health: "ok", progress: 81, owner: "孙阳", dept: "工业设计", okr: "O1", milestone: "量产爬坡", due: "2026-04-28", risks: 0 },
  { id: "proj-4", name: "9 大品类 CMF 中台 Phase 2", health: "ok", progress: 78, owner: "苏婉", dept: "工业设计", okr: "O3", milestone: "竞品色彩库收口", due: "2026-05-20", risks: 1 },
  { id: "proj-5", name: "县域市场服务网络重塑", health: "danger", progress: 22, owner: "王锐", dept: "服务部", okr: "O2", milestone: "试点城市选定", due: "2026-05-05", risks: 6 },
  { id: "proj-6", name: "Velocity 部门助手全员推广", health: "warn", progress: 33, owner: "黄毅", dept: "IT / Velocity 平台组", okr: "O4", milestone: "工业设计部上线", due: "2026-04-30", risks: 2 },
  { id: "proj-7", name: "新风净化机 G3 海外首发", health: "ok", progress: 55, owner: "Renee", dept: "海外事业部", okr: "O1", milestone: "欧标认证完成", due: "2026-07-10", risks: 1 }
];

export const Departments = [
  // L1
  { id: "industrial-design", parentId: null, name: "工业设计部", en: "Industrial Design", icon: "Pencil", color: "#4F46E5", lead: "李慕白", people: 84, assistant: "小龙虾", knowledge: 1046, skills: 8, workflows: 6, projects: 4, status: "live" },
  { id: "service", parentId: null, name: "服务部", en: "Service", icon: "Wrench", color: "#0EA5E9", lead: "王锐", people: 1820, assistant: "小服", knowledge: 612, skills: 6, workflows: 9, projects: 3, status: "configuring" },
  { id: "cop", parentId: null, name: "渠道运营 (COP)", en: "Channel Operations", icon: "Network", color: "#10B981", lead: "周岚", people: 460, assistant: "小渠", knowledge: 388, skills: 5, workflows: 7, projects: 6, status: "configuring" },
  { id: "marketing", parentId: null, name: "市场部", en: "Marketing", icon: "Megaphone", color: "#EC4899", lead: "Anna 林", people: 132, assistant: "小芒", knowledge: 274, skills: 4, workflows: 5, projects: 5, status: "draft" },
  { id: "supply-chain", parentId: null, name: "供应链", en: "Supply Chain", icon: "Boxes", color: "#F59E0B", lead: "韩松", people: 240, assistant: "小链", knowledge: 510, skills: 7, workflows: 8, projects: 4, status: "draft" },
  { id: "finance", parentId: null, name: "财务", en: "Finance", icon: "Calculator", color: "#6366F1", lead: "Joyce 黄", people: 86, assistant: "—", knowledge: 0, skills: 0, workflows: 0, projects: 0, status: "not-started" },
  // L2: 工业设计部
  { id: "id-product", parentId: "industrial-design", name: "产品设计组", en: "Product Design", icon: "Package", color: "#4F46E5", lead: "孙阳", people: 32, assistant: "小龙虾", knowledge: 412, skills: 4, workflows: 3, projects: 2, status: "live" },
  { id: "id-cmf", parentId: "industrial-design", name: "CMF 中台", en: "CMF Platform", icon: "Sparkles", color: "#7C3AED", lead: "苏婉", people: 22, assistant: "小龙虾", knowledge: 488, skills: 3, workflows: 2, projects: 1, status: "live" },
  { id: "id-research", parentId: "industrial-design", name: "用户研究组", en: "Design Research", icon: "Eye", color: "#06B6D4", lead: "林晓", people: 14, assistant: "小龙虾", knowledge: 146, skills: 1, workflows: 1, projects: 1, status: "configuring" },
  // L3
  { id: "id-product-water", parentId: "id-product", name: "净水产品线", en: "Water Treatment", icon: "Beaker", color: "#0EA5E9", lead: "李慕白", people: 12, assistant: "小龙虾", knowledge: 184, skills: 2, workflows: 1, projects: 1, status: "live" },
  { id: "id-product-kitchen", parentId: "id-product", name: "厨房电器线", en: "Kitchen Appliances", icon: "Boxes", color: "#F97316", lead: "孙阳", people: 14, assistant: "小龙虾", knowledge: 158, skills: 1, workflows: 1, projects: 1, status: "live" },
  // L2: 服务部
  { id: "svc-presale", parentId: "service", name: "售前安装", en: "Pre-sale Install", icon: "Hammer", color: "#0EA5E9", lead: "陈刚", people: 480, assistant: "小服", knowledge: 142, skills: 2, workflows: 3, projects: 1, status: "configuring" },
  { id: "svc-aftersale", parentId: "service", name: "售后维修", en: "After-sale Repair", icon: "Stethoscope", color: "#0284C7", lead: "王锐", people: 1180, assistant: "小服", knowledge: 388, skills: 3, workflows: 5, projects: 1, status: "live" },
  { id: "svc-county", parentId: "service", name: "县域服务网络", en: "County Service Net", icon: "Map", color: "#0369A1", lead: "高翔", people: 160, assistant: "—", knowledge: 82, skills: 1, workflows: 1, projects: 1, status: "draft" },
  // L2: 渠道运营
  { id: "cop-online", parentId: "cop", name: "线上渠道", en: "Online Channels", icon: "Globe", color: "#10B981", lead: "周岚", people: 86, assistant: "小渠", knowledge: 142, skills: 2, workflows: 3, projects: 3, status: "live" },
  { id: "cop-offline", parentId: "cop", name: "线下经销", en: "Offline Dealers", icon: "Building", color: "#059669", lead: "马俊", people: 320, assistant: "小渠", knowledge: 168, skills: 2, workflows: 3, projects: 2, status: "configuring" },
  { id: "cop-ka", parentId: "cop", name: "重点客户 (KA)", en: "Key Accounts", icon: "Crown", color: "#047857", lead: "韩雪", people: 54, assistant: "—", knowledge: 78, skills: 1, workflows: 1, projects: 1, status: "draft" },
  // L2: 市场部
  { id: "mkt-brand", parentId: "marketing", name: "品牌组", en: "Brand", icon: "Star", color: "#EC4899", lead: "Anna 林", people: 38, assistant: "小芒", knowledge: 124, skills: 2, workflows: 2, projects: 2, status: "draft" },
  { id: "mkt-content", parentId: "marketing", name: "内容与社媒", en: "Content & Social", icon: "Camera", color: "#DB2777", lead: "周婕", people: 72, assistant: "小芒", knowledge: 110, skills: 2, workflows: 2, projects: 2, status: "draft" },
  { id: "mkt-research", parentId: "marketing", name: "市场研究", en: "Market Research", icon: "BarChart", color: "#BE185D", lead: "Anna 林", people: 22, assistant: "—", knowledge: 40, skills: 0, workflows: 1, projects: 1, status: "draft" },
  // L2: 供应链
  { id: "sc-procurement", parentId: "supply-chain", name: "采购", en: "Procurement", icon: "Coins", color: "#F59E0B", lead: "韩松", people: 86, assistant: "小链", knowledge: 220, skills: 3, workflows: 3, projects: 2, status: "draft" },
  { id: "sc-logistics", parentId: "supply-chain", name: "仓储物流", en: "Warehousing & Logistics", icon: "Truck", color: "#D97706", lead: "陆远", people: 124, assistant: "小链", knowledge: 188, skills: 2, workflows: 3, projects: 1, status: "draft" },
  { id: "sc-quality", parentId: "supply-chain", name: "质量管理", en: "Quality", icon: "Shield", color: "#B45309", lead: "宋平", people: 30, assistant: "—", knowledge: 102, skills: 2, workflows: 2, projects: 1, status: "draft" },
  // L2: 财务
  { id: "fin-fp", parentId: "finance", name: "FP&A", en: "FP&A", icon: "PieChart", color: "#6366F1", lead: "Joyce 黄", people: 28, assistant: "—", knowledge: 0, skills: 0, workflows: 0, projects: 0, status: "not-started" },
  { id: "fin-tax", parentId: "finance", name: "税务与合规", en: "Tax & Compliance", icon: "Lock", color: "#4F46E5", lead: "Roy 何", people: 18, assistant: "—", knowledge: 0, skills: 0, workflows: 0, projects: 0, status: "not-started" }
];

export const KnowledgeDomains = [
  { id: "kd-supplier", name: "供应商", count: 218, lastUpdate: "2小时前", health: "ok", coverage: 92 },
  { id: "kd-material", name: "材料", count: 384, lastUpdate: "今天", health: "ok", coverage: 88 },
  { id: "kd-process", name: "工艺", count: 156, lastUpdate: "昨天", health: "ok", coverage: 81 },
  { id: "kd-cmf", name: "CMF (色彩材质工艺)", count: 1046, lastUpdate: "1小时前", health: "ok", coverage: 95 },
  { id: "kd-competitor", name: "竞品分析", count: 247, lastUpdate: "今天", health: "warn", coverage: 67 },
  { id: "kd-market", name: "市场数据 (奥维)", count: 92, lastUpdate: "2天前", health: "warn", coverage: 60 },
  { id: "kd-trend", name: "趋势洞察", count: 128, lastUpdate: "今天", health: "ok", coverage: 78 },
  { id: "kd-category", name: "9大品类知识", count: 532, lastUpdate: "今天", health: "ok", coverage: 84 }
];

export const SkillPacks = [
  { id: "sp-mat-search", name: "供应商/材料/工艺检索", dept: "industrial-design", maintainer: "陈思源", scope: "cross-dept", status: "published", version: "v2.4.0", icon: "Search", input: "设计需求描述", output: "推荐供应商 / 材料 / 工艺 / 参数 / 成本 / 来源", uses: 412, rating: 4.6, updated: "2026-04-22" },
  { id: "sp-cmf-vision", name: "CMF 图片识别", dept: "industrial-design", maintainer: "苏婉", scope: "dept", status: "published", version: "v1.6.2", icon: "Eye", input: "产品图片", output: "色彩 / 材质 / 表面工艺 / CMF 标签", uses: 287, rating: 4.4, updated: "2026-04-15" },
  { id: "sp-aow", name: "奥维数据分析", dept: "industrial-design", maintainer: "市场部 / 林然", scope: "company", status: "published", version: "v3.1.0", icon: "BarChart", input: "Excel / 报告", output: "价格带机会 / 竞品规格 / 市场洞察", uses: 134, rating: 4.2, updated: "2026-04-08" },
  { id: "sp-trend", name: "趋势洞察结构化", dept: "industrial-design", maintainer: "苏婉", scope: "dept", status: "published", version: "v1.2.1", icon: "Sparkles", input: "趋势报告 / 展会照片", output: "标签化趋势 / 设计机会 / 知识条目", uses: 98, rating: 4.5, updated: "2026-03-30" },
  { id: "sp-cross-cat", name: "跨品类关联", dept: "industrial-design", maintainer: "李慕白", scope: "cross-dept", status: "draft", version: "v0.8.0", icon: "GitBranch", input: "材料 / 工艺 / 设计问题", output: "可迁移机会 / 风险 / 参考案例", uses: 76, rating: 4.3, updated: "2026-04-19" },
  { id: "sp-design-brief", name: "设计简报生成", dept: "industrial-design", maintainer: "李慕白", scope: "dept", status: "published", version: "v2.0.0", icon: "FileText", input: "项目方向 + OKR + 用户画像", output: "结构化设计简报 (含 CMF / 工艺约束)", uses: 156, rating: 4.7, updated: "2026-04-21" },
  { id: "sp-fault-diag", name: "故障诊断助手", dept: "service", maintainer: "王锐", scope: "dept", status: "published", version: "v1.4.0", icon: "Stethoscope", input: "工单描述 / 故障代码", output: "可能原因 / 配件 / SOP 步骤", uses: 1240, rating: 4.5, updated: "2026-04-18" },
  { id: "sp-price-anomaly", name: "价格异常检测", dept: "cop", maintainer: "周岚", scope: "dept", status: "published", version: "v1.1.0", icon: "AlertTriangle", input: "城市 / 渠道 / 周期", output: "异常 SKU / 偏差幅度 / 处理建议", uses: 88, rating: 4.1, updated: "2026-04-12" },
  { id: "sp-doc-search", name: "公司文档全局检索", dept: "platform", maintainer: "IT / 张毅", scope: "platform", status: "published", version: "v4.0.0", icon: "Search", input: "自然语言问题", output: "答案 + 引用来源 + 权限范围内文档", uses: 3204, rating: 4.6, updated: "2026-04-23" },
  { id: "sp-meeting-notes", name: "会议纪要结构化", dept: "platform", maintainer: "IT / 张毅", scope: "platform", status: "published", version: "v2.2.0", icon: "FileText", input: "录音 / 转写文本", output: "结论 / 决议 / 待办 / 关联 OKR", uses: 1872, rating: 4.4, updated: "2026-04-20" }
];

export const SKILL_SCOPES = [
  { v: "dept",       label: "部门私有",   desc: "仅本部门可调用",     color: "#6366f1" },
  { v: "cross-dept", label: "跨部门可用", desc: "经审批后跨部门共享", color: "#0891b2" },
  { v: "company",    label: "全公司可用", desc: "全员可调用",         color: "#10b981" },
  { v: "platform",   label: "平台基础",   desc: "由 IT/治理组维护",   color: "#7c3aed" }
];
export const SKILL_STATUSES = [
  { v: "published",  label: "已发布", color: "#10b981" },
  { v: "draft",      label: "草稿",   color: "#f59e0b" },
  { v: "deprecated", label: "已下线", color: "#94a3b8" }
];

export const KnowledgeSources = [
  { id: "ks-1", title: "FY26 集团战略与年度 OKR", type: "PPT", scope: "公司", quality: "approved", uses: 142, owner: "战略办", updated: "2026-04-10", size: "8.2MB" },
  { id: "ks-2", title: "全屋净水 2.0 产品方向白皮书 v3", type: "PDF", scope: "公司 / 工业设计", quality: "approved", uses: 87, owner: "李慕白", updated: "2026-04-18", size: "12.4MB" },
  { id: "ks-3", title: "BP/SC/SA 三角协同操作手册", type: "DOC", scope: "渠道运营", quality: "review", uses: 64, owner: "周岚", updated: "2026-04-21", size: "2.1MB" },
  { id: "ks-4", title: "奥维 2025Q4 厨卫品类报告", type: "XLSX", scope: "公司", quality: "approved", uses: 312, owner: "市场部", updated: "2026-02-08", size: "44.6MB" },
  { id: "ks-5", title: "竞品 CMF 图库 (2025春夏)", type: "图集", scope: "工业设计", quality: "approved", uses: 521, owner: "苏婉", updated: "2026-03-30", size: "1.2GB" },
  { id: "ks-6", title: "县域服务网络试点复盘", type: "DOC", scope: "服务部", quality: "draft", uses: 12, owner: "王锐", updated: "2026-04-22", size: "880KB" },
  { id: "ks-7", title: "AI Native 转型决议 (董事会)", type: "MEMO", scope: "公司", quality: "approved", uses: 28, owner: "陈志远", updated: "2026-01-15", size: "120KB" },
  { id: "ks-8", title: "零冷水技术路线图 v2", type: "PPT", scope: "工业设计", quality: "approved", uses: 156, owner: "孙阳", updated: "2026-04-02", size: "6.1MB" }
];

export const Agents = [
  { id: "ag-finance", name: "财务视角", role: "Finance Strategist", color: "#f59e0b", icon: "Coins", focus: "ROI / 现金流 / 投入产出比" },
  { id: "ag-product", name: "产品视角", role: "Product Lead", color: "#4F46E5", icon: "Package", focus: "用户价值 / 品类机会 / 路线图" },
  { id: "ag-gtm", name: "GTM 视角", role: "Go-to-Market", color: "#EC4899", icon: "Megaphone", focus: "渠道 / 节奏 / 竞争反应" },
  { id: "ag-ops", name: "运营视角", role: "Operations", color: "#10B981", icon: "Activity", focus: "执行节奏 / 资源 / 流程" },
  { id: "ag-risk", name: "风险视角", role: "Risk & Compliance", color: "#EF4444", icon: "Shield", focus: "合规 / 安全 / 反对意见" },
  { id: "ag-tech", name: "技术视角", role: "Engineering", color: "#0EA5E9", icon: "Cpu", focus: "可行性 / 架构 / 投入" },
  { id: "ag-supply", name: "供应链视角", role: "Supply Chain", color: "#6366F1", icon: "Truck", focus: "产能 / 库存 / 供应商" },
  { id: "ag-org", name: "组织视角", role: "Org & Talent", color: "#7C3AED", icon: "Users", focus: "组织 / 人才 / 文化" }
];

export const StrategyQuestion = {
  id: "sq-1",
  title: "FY26 是否加大线上 DTC 渠道投入？",
  asker: "陈志远 · CEO",
  asked: "2026-04-23",
  status: "in-debate",
  context: ["FY26 集团战略与年度 OKR", "BP/SC/SA 三角协同操作手册", "奥维 2025Q4 厨卫品类报告"],
  okrs: ["O1", "O2"],
  rounds: 3,
  agents: ["ag-finance", "ag-product", "ag-gtm", "ag-ops", "ag-risk", "ag-supply", "ag-org"]
};

export const DebateMessages = [
  { agent: "ag-product", round: 1, stance: "pro", text: "线上 DTC 是把全屋净水方案作为整体卖给用户的最佳载体——线下导购无法系统讲方案，线上场景化更利于客单价提升。", sources: ["ks-2", "ks-4"] },
  { agent: "ag-finance", round: 1, stance: "concern", text: "DTC 短期 ROI 弱：CAC 同比上涨 28%，而线下单店产出仍稳定。建议把投入控制在营销总盘 18% 以内并按月复盘。", sources: ["ks-4"] },
  { agent: "ag-gtm", round: 1, stance: "pro", text: "Q1 线上同行渗透率已达 41%，再不加码就丢窗口期。建议 30% 预算切到内容/直播,并保留服务交付能力。", sources: ["ks-4"] },
  { agent: "ag-risk", round: 2, stance: "con", text: "BP/SC/SA 三角协同尚未稳定的城市,线上加码会引发渠道冲突,建议先收口同价机制再放量。", sources: ["ks-3"] },
  { agent: "ag-ops", round: 2, stance: "concern", text: "DTC 售后履约目前仅覆盖一二线城市,县域订单退货率达 11.4%——必须先有服务网络再扩规模。", sources: ["ks-6"] },
  { agent: "ag-supply", round: 2, stance: "concern", text: "全屋净水套装 BOM 当前还是项目级管理,DTC 大单会暴露排产瓶颈。建议把套系上柔性产线。", sources: [] },
  { agent: "ag-org", round: 3, stance: "pro", text: "DTC 团队需要内容 + 数据双能力,目前缺口约 22 人。可与市场部共建,而不是单建。", sources: [] }
];

export const Decisions = [
  { id: "d-1", title: "全屋净水 2.0 产品定位收敛为'局改焕新'", date: "2026-03-12", owner: "陈志远", linkedKR: "kr-1-1", evidence: 4 },
  { id: "d-2", title: "县域服务网络由 BP 主导改为 SC 主导", date: "2026-04-02", owner: "周岚", linkedKR: "kr-2-1", evidence: 7 },
  { id: "d-3", title: "Velocity 部门助手优先工业设计部全员上线", date: "2026-04-15", owner: "黄毅", linkedKR: "kr-4-1", evidence: 3 }
];

export const Activity = [
  { id: "ac-1", who: "李慕白", what: "更新了关键项目", target: "全屋净水 2.0 — 局改方案产品化", when: "12 分钟前", type: "project" },
  { id: "ac-2", who: "小龙虾助手", what: "回答了 8 个工业设计部检索请求", target: "今日", when: "1 小时前", type: "assistant" },
  { id: "ac-3", who: "周岚", what: "新增风险到", target: "BP/SC/SA 三角协同 200 城落地", when: "2 小时前", type: "risk" },
  { id: "ac-4", who: "战略画布", what: "完成了第 3 轮多智能体研讨", target: "FY26 是否加大线上 DTC 渠道投入？", when: "今早 09:24", type: "strategy" },
  { id: "ac-5", who: "苏婉", what: "上传了 38 条 CMF 知识条目", target: "CMF 知识域", when: "今早 08:50", type: "knowledge" },
  { id: "ac-6", who: "陈志远", what: "查看了", target: "FY26 公司级 OKR 执行健康度", when: "昨天 22:11", type: "view" }
];

// =============== Admin data ===============================================
export const OrgTree = {
  id: "company", name: "北海智能家居", type: "company", head: "陈志远 · CEO", people: 12400,
  children: [
    { id: "rd", name: "研发中心", type: "center", head: "周明 · CTO", people: 1820, children: [
      { id: "industrial-design", name: "工业设计部", type: "dept", head: "苏婉 · 设计总监", people: 86, children: [
        { id: "id-cmf", name: "CMF 中台", type: "team", head: "孙阳", people: 12 },
        { id: "id-water", name: "净水产品组", type: "team", head: "李欣", people: 18 },
        { id: "id-heat", name: "热水/采暖组", type: "team", head: "陈昊", people: 14 },
        { id: "id-kitchen", name: "厨电组", type: "team", head: "顾然", people: 16 }
      ]},
      { id: "rd-water", name: "净水研究院", type: "dept", head: "韩梅", people: 142 },
      { id: "rd-heat", name: "热水技术研究所", type: "dept", head: "吴桐", people: 98 },
      { id: "rd-platform", name: "通用平台部", type: "dept", head: "赵峰", people: 64 }
    ]},
    { id: "go", name: "增长中心", type: "center", head: "Anna 林 · CGO", people: 2640, children: [
      { id: "channel", name: "渠道运营部", type: "dept", head: "周岚", people: 312, children: [
        { id: "ch-bp", name: "BP 经销商团队", type: "team", head: "汪洋", people: 88 },
        { id: "ch-sc", name: "SC 服务商团队", type: "team", head: "段晗", people: 64 },
        { id: "ch-dtc", name: "DTC 直营组", type: "team", head: "周岚", people: 48 }
      ]},
      { id: "marketing", name: "市场部", type: "dept", head: "Anna 林", people: 168 },
      { id: "service", name: "服务部", type: "dept", head: "王锐", people: 980 }
    ]},
    { id: "ops", name: "运营中心", type: "center", head: "韩松 · COO", people: 6240, children: [
      { id: "supply", name: "供应链部", type: "dept", head: "韩松", people: 224 },
      { id: "manufacturing", name: "制造部", type: "dept", head: "周勤", people: 5680 }
    ]},
    { id: "back", name: "后台中心", type: "center", head: "刘瑶 · CFO", people: 1700, children: [
      { id: "finance", name: "财务部", type: "dept", head: "刘瑶", people: 88 },
      { id: "hr", name: "人力资源部", type: "dept", head: "杨立", people: 102 },
      { id: "it", name: "数字化与 IT 部", type: "dept", head: "Tomas 朱", people: 168 },
      { id: "legal", name: "法务合规", type: "dept", head: "高敏", people: 32 }
    ]}
  ]
};

export const LLMs = [
  { id: "claude-opus-4", name: "Claude Opus 4.1", vendor: "Anthropic", category: "frontier", inputCost: 15, outputCost: 75, ctx: "200K", latency: "med", status: "active", uses: "战略研讨 · 复杂分析" },
  { id: "claude-sonnet-4", name: "Claude Sonnet 4.5", vendor: "Anthropic", category: "balanced", inputCost: 3, outputCost: 15, ctx: "200K", latency: "fast", status: "active", uses: "默认部门助手 · 通用问答", default: true },
  { id: "claude-haiku-4", name: "Claude Haiku 4.5", vendor: "Anthropic", category: "fast", inputCost: 1, outputCost: 5, ctx: "200K", latency: "fastest", status: "active", uses: "意图路由 · 摘要 · 嵌入前置" },
  { id: "qwen-3-max", name: "通义千问 3 Max", vendor: "阿里云", category: "frontier", inputCost: 10, outputCost: 30, ctx: "128K", latency: "med", status: "active", uses: "国产合规 · 中文长文档" },
  { id: "deepseek-v3", name: "DeepSeek V3.2", vendor: "深度求索", category: "balanced", inputCost: 0.5, outputCost: 2, ctx: "128K", latency: "fast", status: "active", uses: "数据分析 · 表格抽取" },
  { id: "doubao-pro", name: "豆包 Pro 256K", vendor: "字节火山", category: "balanced", inputCost: 1.2, outputCost: 4, ctx: "256K", latency: "fast", status: "active", uses: "客服话术 · 知识检索" },
  { id: "ernie-4-turbo", name: "文心 4 Turbo", vendor: "百度", category: "balanced", inputCost: 2, outputCost: 8, ctx: "128K", latency: "med", status: "standby", uses: "灾备 · 国产合规备份" },
  { id: "private-llama-70b", name: "私有 LLaMA-70B (本地)", vendor: "本地部署 · A800×8", category: "private", inputCost: 0, outputCost: 0, ctx: "32K", latency: "slow", status: "active", uses: "敏感数据 · 财务/HR/法务" },
  { id: "embed-bge-m3", name: "BGE-M3 (嵌入)", vendor: "本地部署", category: "embedding", inputCost: 0.05, outputCost: 0, ctx: "8K", latency: "fastest", status: "active", uses: "知识库向量化" }
];

export const PolicyRouting = [
  { scope: "战略工作台", primary: "claude-opus-4", fallback: "qwen-3-max", reason: "深度推理 + 多 Agent 辩论" },
  { scope: "部门助手 · 默认", primary: "claude-sonnet-4", fallback: "doubao-pro", reason: "性价比最优" },
  { scope: "意图路由 / 摘要", primary: "claude-haiku-4", fallback: "deepseek-v3", reason: "毫秒级响应" },
  { scope: "财务 / HR / 法务", primary: "private-llama-70b", fallback: "—", reason: "数据不出域" },
  { scope: "中文长文档解析", primary: "qwen-3-max", fallback: "doubao-pro", reason: "中文理解 + 长上下文" },
  { scope: "知识库嵌入", primary: "embed-bge-m3", fallback: "—", reason: "本地部署" }
];

export const DeptUsage = [
  { id: "industrial-design", name: "工业设计部", color: "#7c3aed", input: 84.2, output: 12.6, calls: 4280, cost: 962, users: 78, peak: "周二 14:00" },
  { id: "channel", name: "渠道运营部", color: "#0D7A3F", input: 162.8, output: 24.4, calls: 9120, cost: 1844, users: 184, peak: "周一 10:00" },
  { id: "service", name: "服务部", color: "#dc2626", input: 246.0, output: 38.2, calls: 18420, cost: 2218, users: 410, peak: "周五 16:00" },
  { id: "supply", name: "供应链部", color: "#0891b2", input: 58.4, output: 9.1, calls: 2640, cost: 482, users: 62, peak: "周一 09:00" },
  { id: "marketing", name: "市场部", color: "#ea580c", input: 72.6, output: 18.4, calls: 3210, cost: 1125, users: 92, peak: "周三 15:00" },
  { id: "rd-water", name: "净水研究院", color: "#0284c7", input: 38.2, output: 6.4, calls: 1480, cost: 388, users: 48, peak: "周四 11:00" },
  { id: "finance", name: "财务部", color: "#475569", input: 14.8, output: 2.1, calls: 720, cost: 0, users: 22, peak: "—", note: "本地模型" },
  { id: "hr", name: "人力资源部", color: "#9333ea", input: 11.4, output: 1.6, calls: 612, cost: 0, users: 18, peak: "—", note: "本地模型" },
  { id: "it", name: "数字化与 IT 部", color: "#1e40af", input: 26.8, output: 4.2, calls: 1840, cost: 312, users: 36, peak: "周三 19:00" }
];

export const TopUsers = [
  { name: "苏婉", dept: "工业设计部", role: "设计总监", calls: 412, tokens: 18.6, cost: 220, top: "CMF 工艺成本对比" },
  { name: "周岚", dept: "渠道运营部", role: "渠道总监", calls: 386, tokens: 16.2, cost: 188, top: "BP/SC 协同问答" },
  { name: "Anna 林", dept: "市场部", role: "CGO", calls: 342, tokens: 22.4, cost: 268, top: "战略研讨" },
  { name: "王锐", dept: "服务部", role: "服务总监", calls: 298, tokens: 12.8, cost: 142, top: "投诉归因分析" },
  { name: "陈志远", dept: "战略办", role: "CEO", calls: 264, tokens: 28.6, cost: 412, top: "战略画布(Opus)" },
  { name: "孙阳", dept: "工业设计部 · CMF", role: "首席 CMF", calls: 248, tokens: 9.4, cost: 108, top: "竞品 CMF 识别" },
  { name: "韩松", dept: "供应链部", role: "COO", calls: 212, tokens: 11.2, cost: 124, top: "动销预测" },
  { name: "刘瑶", dept: "财务部", role: "CFO", calls: 186, tokens: 8.8, cost: 0, top: "本地模型 / 月度复盘" }
];
