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
  { id: "proj-1", name: "全屋净水 2.0 — 局改方案产品化", health: "ok", progress: 64, owner: "李慕白", deptId: "industrial-design", dept: "工业设计 · 产品", okr: "O1", milestone: "样机评审", due: "2026-05-12", risks: 1, started: "2025-11-10", contributors: ["李慕白", "孙阳", "苏婉", "陈思源"], milestones: [
    { id: "m1-1", name: "用户画像与需求收口", date: "2025-12-15", status: "achieved" },
    { id: "m1-2", name: "概念设计评审", date: "2026-02-05", status: "achieved" },
    { id: "m1-3", name: "样机评审 (DV)", date: "2026-05-12", status: "in-progress" },
    { id: "m1-4", name: "小批量验证 (PV)", date: "2026-08-01", status: "todo" }
  ], risksDetail: [
    { id: "r1-1", text: "膜组件供应商杭州东方目前单一来源,12月初到货受春节影响", level: "warn", owner: "陈思源" }
  ], linkedDecisions: ["d-1"], linkedSources: ["ks-2", "ks-8"], description: "面向 4-5 年房龄家庭的局改型全屋净水套系,重点优化安装与售后体验。" },
  { id: "proj-2", name: "BP/SC/SA 三角协同 200 城落地", health: "warn", progress: 41, owner: "周岚", deptId: "cop", dept: "渠道运营 (COP)", okr: "O2", milestone: "二线城市启动", due: "2026-06-30", risks: 4, started: "2025-09-01", contributors: ["周岚", "马俊", "韩雪"], milestones: [
    { id: "m2-1", name: "一线 30 城签约", date: "2025-12-20", status: "achieved" },
    { id: "m2-2", name: "中台系统切换", date: "2026-03-15", status: "achieved" },
    { id: "m2-3", name: "二线 80 城启动", date: "2026-05-30", status: "in-progress" },
    { id: "m2-4", name: "县域试点 (90 城)", date: "2026-09-30", status: "todo" }
  ], risksDetail: [
    { id: "r2-1", text: "线上线下同价机制在 32 个城市仍存在盲点", level: "warn", owner: "周岚" },
    { id: "r2-2", text: "BP 经销商满意度较 Q4 下降 4pt", level: "warn", owner: "汪洋" },
    { id: "r2-3", text: "两大省份 SC 招商进度落后 30%", level: "danger", owner: "段晗" },
    { id: "r2-4", text: "DTC 与线下利益冲突 escalation 5 起", level: "warn", owner: "周岚" }
  ], linkedDecisions: ["d-2"], linkedSources: ["ks-3"], description: "三方角色定义清晰、数据共享、利益对齐,作为 200 城渠道铺设的基座。" },
  { id: "proj-3", name: "零冷水燃气热水器 X 系列", health: "ok", progress: 81, owner: "孙阳", deptId: "industrial-design", dept: "工业设计", okr: "O1", milestone: "量产爬坡", due: "2026-04-28", risks: 0, started: "2025-06-01", contributors: ["孙阳", "苏婉", "韩松"], milestones: [
    { id: "m3-1", name: "工程样机", date: "2025-09-15", status: "achieved" },
    { id: "m3-2", name: "DV/PV 验证", date: "2026-01-10", status: "achieved" },
    { id: "m3-3", name: "量产爬坡", date: "2026-04-28", status: "in-progress" }
  ], risksDetail: [], linkedDecisions: [], linkedSources: ["ks-8"], description: "0 冷水主流型号 X 系列,目标实现 1 秒出热水,与净水器联动复购。" },
  { id: "proj-4", name: "9 大品类 CMF 中台 Phase 2", health: "ok", progress: 78, owner: "苏婉", deptId: "id-cmf", dept: "工业设计", okr: "O3", milestone: "竞品色彩库收口", due: "2026-05-20", risks: 1, started: "2025-07-15", contributors: ["苏婉", "孙阳", "林然"], milestones: [
    { id: "m4-1", name: "Phase 1 上线 (4 大品类)", date: "2025-12-01", status: "achieved" },
    { id: "m4-2", name: "竞品色彩库收口", date: "2026-05-20", status: "in-progress" },
    { id: "m4-3", name: "9 大品类全部入库", date: "2026-09-15", status: "todo" }
  ], risksDetail: [
    { id: "r4-1", text: "奥维采集接口稳定性不足,触发 3 次回填", level: "warn", owner: "林然" }
  ], linkedDecisions: [], linkedSources: ["ks-5"], description: "把色彩、材质、表面工艺统一进入中台,实现跨品类复用与提案加速。" },
  { id: "proj-5", name: "县域市场服务网络重塑", health: "danger", progress: 22, owner: "王锐", deptId: "service", dept: "服务部", okr: "O2", milestone: "试点城市选定", due: "2026-05-05", risks: 6, started: "2026-02-01", contributors: ["王锐", "高翔", "陈刚"], milestones: [
    { id: "m5-1", name: "供应商资质与覆盖度调研", date: "2026-03-01", status: "achieved" },
    { id: "m5-2", name: "试点城市选定 (10 城)", date: "2026-05-05", status: "in-progress" },
    { id: "m5-3", name: "前 30 城 SC 选型", date: "2026-08-30", status: "todo" }
  ], risksDetail: [
    { id: "r5-1", text: "县域 SC 备件库存覆盖率仅 47%,远低于服务标准", level: "danger", owner: "高翔" },
    { id: "r5-2", text: "技师认证体系尚未在县域落地", level: "danger", owner: "王锐" },
    { id: "r5-3", text: "退货率 11.4% 直接影响 NPS", level: "danger", owner: "王锐" },
    { id: "r5-4", text: "投诉响应平均 38 小时,目标 ≤12 小时", level: "warn", owner: "高翔" },
    { id: "r5-5", text: "部分省份服务费用结算延迟", level: "warn", owner: "王锐" },
    { id: "r5-6", text: "区域调度系统与 ERP 未打通", level: "warn", owner: "Tomas 朱" }
  ], linkedDecisions: ["d-2"], linkedSources: ["ks-6"], description: "以 SC 主导重新组织县域服务网络,对齐渠道协同节奏。" },
  { id: "proj-6", name: "Velocity 部门助手全员推广", health: "warn", progress: 33, owner: "黄毅", deptId: "it", dept: "IT / Velocity 平台组", okr: "O4", milestone: "工业设计部上线", due: "2026-04-30", risks: 2, started: "2026-01-08", contributors: ["黄毅", "Tomas 朱", "陈志远"], milestones: [
    { id: "m6-1", name: "工业设计部上线", date: "2026-04-30", status: "in-progress" },
    { id: "m6-2", name: "服务部上线", date: "2026-06-30", status: "todo" },
    { id: "m6-3", name: "全公司开放", date: "2026-12-31", status: "todo" }
  ], risksDetail: [
    { id: "r6-1", text: "知识复用率 44%,KR 进度落后", level: "warn", owner: "黄毅" },
    { id: "r6-2", text: "决策可追溯率仅 31%", level: "warn", owner: "陈志远" }
  ], linkedDecisions: ["d-3"], linkedSources: ["ks-7"], description: "Velocity 从战略画布走向部门日常工作平台,O4 KR1/2/3 的核心承载。" },
  { id: "proj-7", name: "新风净化机 G3 海外首发", health: "ok", progress: 55, owner: "Renee", deptId: "industrial-design", dept: "海外事业部", okr: "O1", milestone: "欧标认证完成", due: "2026-07-10", risks: 1, started: "2025-08-15", contributors: ["Renee", "孙阳", "宋平"], milestones: [
    { id: "m7-1", name: "欧标 CE 认证启动", date: "2026-01-15", status: "achieved" },
    { id: "m7-2", name: "欧标认证完成", date: "2026-07-10", status: "in-progress" },
    { id: "m7-3", name: "首批渠道铺货", date: "2026-09-30", status: "todo" }
  ], risksDetail: [
    { id: "r7-1", text: "RoHS 报告需补充 2 项材料", level: "warn", owner: "宋平" }
  ], linkedDecisions: [], linkedSources: [], description: "G3 新风净化机首次进入欧洲市场,以德/法/北欧为优先国。" }
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
  { id: "ks-1", title: "FY26 集团战略与年度 OKR", type: "PPT", scope: "公司", quality: "approved", uses: 142, owner: "战略办", updated: "2026-04-10", size: "8.2MB",
    summary: "FY26 全年战略主线:用户为中心、渠道重构、设计中台、AI Native。每个主线对应一个公司级 Objective 与 3 个 KR。",
    excerpt: "Velocity 的目标是把企业知识、战略、OKR 和关键项目整合成统一的认知背景,让所有 AI 输出都基于公司的真实情况。FY26 重点:全屋净水套系、200 城渠道协同、9 大品类 CMF 中台、Velocity 部门助手全员推广。",
    tags: ["战略", "OKR", "FY26", "公司级"], pages: 42, lang: "zh-CN", uploadedBy: "战略办 · 周明", linkedProjects: ["proj-1", "proj-2", "proj-6"], linkedDecisions: ["d-1"], embeddings: 412 },
  { id: "ks-2", title: "全屋净水 2.0 产品方向白皮书 v3", type: "PDF", scope: "公司 / 工业设计", quality: "approved", uses: 87, owner: "李慕白", updated: "2026-04-18", size: "12.4MB",
    summary: "局改家庭场景下全屋净水套系的产品定位、用户画像、核心配置、安装与售后假设。",
    excerpt: "面向 4-5 年房龄的局改家庭。核心痛点:水质硬度、二次污染、热水联动。建议套系组合:厨房净水器 + 全屋前置 + 中央净水 + 即热饮水。客单价目标 ¥18,000-22,000。",
    tags: ["全屋净水", "局改", "产品定位", "客单价"], pages: 28, lang: "zh-CN", uploadedBy: "李慕白", linkedProjects: ["proj-1"], linkedDecisions: ["d-1"], embeddings: 196 },
  { id: "ks-3", title: "BP/SC/SA 三角协同操作手册", type: "DOC", scope: "渠道运营", quality: "review", uses: 64, owner: "周岚", updated: "2026-04-21", size: "2.1MB",
    summary: "BP (经销商) / SC (服务商) / SA (服务工程师) 三方在城市中的角色定义、利益分配、SLA 和数据共享机制。",
    excerpt: "BP 负责整机销售与商品库存。SC 负责服务交付与备件库存。SA 负责实际上门与技师调度。三方在中台共享订单、工单、客户数据。",
    tags: ["BP", "SC", "SA", "三角协同", "渠道"], pages: 18, lang: "zh-CN", uploadedBy: "周岚", linkedProjects: ["proj-2"], linkedDecisions: ["d-2"], embeddings: 76 },
  { id: "ks-4", title: "奥维 2025Q4 厨卫品类报告", type: "XLSX", scope: "公司", quality: "approved", uses: 312, owner: "市场部", updated: "2026-02-08", size: "44.6MB",
    summary: "奥维云网 2025Q4 厨卫品类销售数据,包含线上线下分渠道、价格带、品牌排名、增长率。",
    excerpt: "厨卫品类 25Q4 线上 +18.4%,线下 -3.2%。价格带 3-4K 集中度提升 2.4pt。前 5 品牌:海尔、美的、A.O.史密斯、林内、北海。北海在 5K+ 高端段占比 12.4%。",
    tags: ["奥维", "厨卫", "市场份额", "价格带", "竞品"], pages: 0, lang: "zh-CN", uploadedBy: "Anna 林", linkedProjects: [], linkedDecisions: [], embeddings: 824 },
  { id: "ks-5", title: "竞品 CMF 图库 (2025春夏)", type: "图集", scope: "工业设计", quality: "approved", uses: 521, owner: "苏婉", updated: "2026-03-30", size: "1.2GB",
    summary: "9 大品类共 1,200+ 张竞品产品照,自动识别色彩 / 材质 / 表面工艺并生成 CMF 标签。",
    excerpt: "色彩:雾雪白、墨砂黑、沙金、玄铁灰、薄雾蓝。表面工艺:阳极氧化、PVD、喷涂、拉丝、高光。趋势:大面积 PVD-Black 在高端段渗透率显著上升。",
    tags: ["CMF", "竞品", "色彩", "表面工艺", "趋势"], pages: 0, lang: "zh-CN", uploadedBy: "苏婉", linkedProjects: ["proj-3", "proj-4"], linkedDecisions: [], embeddings: 1206 },
  { id: "ks-6", title: "县域服务网络试点复盘", type: "DOC", scope: "服务部", quality: "draft", uses: 12, owner: "王锐", updated: "2026-04-22", size: "880KB",
    summary: "5 个县域试点城市 30 天数据复盘:响应时长、备件覆盖率、技师覆盖率、用户满意度。",
    excerpt: "试点 5 城均值:平均响应 38h (目标 ≤12h),备件覆盖 47% (目标 ≥85%),技师覆盖 54% (目标 ≥80%),NPS 41 (目标 ≥60)。结论:县域必须以 SC 主导,先铺备件再铺人员。",
    tags: ["县域", "服务", "试点", "复盘"], pages: 12, lang: "zh-CN", uploadedBy: "王锐", linkedProjects: ["proj-5"], linkedDecisions: ["d-2"], embeddings: 38 },
  { id: "ks-7", title: "AI Native 转型决议 (董事会)", type: "MEMO", scope: "公司", quality: "approved", uses: 28, owner: "陈志远", updated: "2026-01-15", size: "120KB",
    summary: "董事会 AI Native 转型决议:Velocity 作为公司级认知工作台,2026 年覆盖核心部门,2027 年扩展全员。",
    excerpt: "AI Native 不是堆砌 AI 工具,而是把企业知识、战略、OKR 和工作流统一进 Velocity,让每个员工都在 AI 增强的工作流中工作。",
    tags: ["董事会", "AI Native", "决议", "Velocity"], pages: 4, lang: "zh-CN", uploadedBy: "陈志远", linkedProjects: ["proj-6"], linkedDecisions: ["d-3"], embeddings: 12 },
  { id: "ks-8", title: "零冷水技术路线图 v2", type: "PPT", scope: "工业设计", quality: "approved", uses: 156, owner: "孙阳", updated: "2026-04-02", size: "6.1MB",
    summary: "零冷水 X 系列技术路线:即热模块、循环泵、智能控制、与净水系统的联动。",
    excerpt: "零冷水核心:1) 高频即热模块 (功率密度 ≥35W/cm²);2) 智能循环泵 (待机功耗 ≤3W);3) 与净水器的双 API 联动。商品规划:X1 (主力) / X2 (高端) / X3 (出海)。",
    tags: ["零冷水", "技术路线", "即热", "X系列"], pages: 36, lang: "zh-CN", uploadedBy: "孙阳", linkedProjects: ["proj-3"], linkedDecisions: [], embeddings: 168 }
];

// =============== Assistant Routing Rules =================================
// Priority-ordered rules used by the routing layer to map a user prompt
// onto a department + skill. The first matching rule wins. Patterns are
// kept as plain "中文 keyword" strings for the demo; production would use
// regex / classifier scores.
export const ROUTE_PRIORITIES = [
  { v: "high",   label: "高",  color: "#ef4444" },
  { v: "medium", label: "中",  color: "#f59e0b" },
  { v: "low",    label: "低",  color: "#94a3b8" }
];

export const AssistantRoutingRules = [
  {
    id: "rt-1", priority: "high", enabled: true,
    intent: "CMF / 材料 / 工艺 / 色彩 / 表面",
    targetDept: "industrial-design", targetSkill: "sp-mat-search",
    permission: "vp,lead,staff",
    note: "工业设计部高频问询。命中后自动注入 CMF 与材料知识域。",
    hits: 412, lastHit: "12 分钟前"
  },
  {
    id: "rt-2", priority: "high", enabled: true,
    intent: "竞品 / 奥维 / 价格带 / 品类报告",
    targetDept: "industrial-design", targetSkill: "sp-aow",
    permission: "vp,lead,staff",
    note: "奥维品类问询统一走奥维分析技能,数据出处可追溯。",
    hits: 134, lastHit: "1 小时前"
  },
  {
    id: "rt-3", priority: "high", enabled: true,
    intent: "工单 / 故障 / 投诉 / 维修",
    targetDept: "service", targetSkill: "sp-fault-diag",
    permission: "lead,staff",
    note: "服务部一线 SOP — 命中后追加车型/故障代码槽位提取。",
    hits: 1240, lastHit: "1 分钟前"
  },
  {
    id: "rt-4", priority: "medium", enabled: true,
    intent: "渠道 / BP / SC / SA / 价格异常 / 同价",
    targetDept: "cop", targetSkill: "sp-price-anomaly",
    permission: "vp,lead",
    note: "渠道运营专属。仅 VP / 团队负责人可触发,避免一线误判。",
    hits: 88, lastHit: "今早"
  },
  {
    id: "rt-5", priority: "medium", enabled: true,
    intent: "战略 / 决策 / OKR / 关键项目 / 反对意见",
    targetDept: "platform", targetSkill: "sp-doc-search",
    permission: "ceo,vp",
    note: "战略级问题统一走战略助手 + 全局文档检索。",
    hits: 264, lastHit: "今早 09:24"
  },
  {
    id: "rt-6", priority: "medium", enabled: true,
    intent: "会议 / 纪要 / 录音 / 转写",
    targetDept: "platform", targetSkill: "sp-meeting-notes",
    permission: "vp,lead,staff",
    note: "全员可用。Skill Pack 自动关联到 OKR 与项目。",
    hits: 1872, lastHit: "10 分钟前"
  },
  {
    id: "rt-7", priority: "low", enabled: false,
    intent: "动销 / 库存 / 补货 / 备货",
    targetDept: "supply-chain", targetSkill: null,
    permission: "vp,lead",
    note: "供应链 Skill 仍在草稿,规则暂关。命中走默认部门助手。",
    hits: 12, lastHit: "—"
  },
  {
    id: "rt-8", priority: "low", enabled: true,
    intent: "默认 (Fallback)",
    targetDept: "platform", targetSkill: "sp-doc-search",
    permission: "ceo,vp,lead,staff",
    note: "未命中其他规则 — 走全公司文档检索 + 默认部门助手。",
    hits: 3204, lastHit: "刚刚"
  }
];

// =============== Audit Log =====================================
// Human-readable audit events; a small but concrete sample so the
// governance page reads like a real production log.
export const AUDIT_CATEGORIES = [
  { v: "auth",        label: "登录与权限",  color: "#4F46E5" },
  { v: "knowledge",   label: "知识变更",    color: "#10b981" },
  { v: "okr",         label: "OKR / 项目",  color: "#7c3aed" },
  { v: "skill",       label: "Skill / 工作流", color: "#0EA5E9" },
  { v: "assistant",   label: "助手 / 路由", color: "#EC4899" },
  { v: "model",       label: "模型 / 计费", color: "#F59E0B" },
  { v: "config",      label: "配置变更",    color: "#94a3b8" }
];

export const AuditLog = [
  { id: "au-1", at: "2026-04-26 11:42", actor: "苏婉",   ip: "10.20.32.18",  category: "knowledge", severity: "info",   action: "上传 38 条 CMF 知识条目",    target: "知识域 · CMF (色彩材质工艺)", scope: "工业设计部" },
  { id: "au-2", at: "2026-04-26 11:18", actor: "李慕白", ip: "10.20.32.41",  category: "okr",       severity: "info",   action: "运行 Skill — 设计简报生成",   target: "项目 · 全屋净水 2.0",         scope: "工业设计部" },
  { id: "au-3", at: "2026-04-26 10:55", actor: "苏婉",   ip: "10.20.32.18",  category: "skill",     severity: "warn",   action: "工作流 CMF 可行性检查 进入审批等待", target: "工作流 · CMF 可行性检查",    scope: "CMF 中台" },
  { id: "au-4", at: "2026-04-26 09:40", actor: "周岚",   ip: "10.40.55.7",   category: "assistant", severity: "info",   action: "更新意图路由规则",             target: "规则 · 渠道 / 价格异常",       scope: "渠道运营 (COP)" },
  { id: "au-5", at: "2026-04-26 09:24", actor: "战略画布", ip: "—",          category: "assistant", severity: "info",   action: "完成第 3 轮多智能体研讨",       target: "战略问题 · DTC 渠道",          scope: "公司" },
  { id: "au-6", at: "2026-04-26 09:10", actor: "陈思源", ip: "10.20.32.62",  category: "knowledge", severity: "info",   action: "标记一条 PVD 工艺答案为 不准确", target: "知识域 · 工艺",                scope: "工业设计部" },
  { id: "au-7", at: "2026-04-26 08:50", actor: "Tomas 朱", ip: "10.10.4.2",  category: "config",    severity: "warn",   action: "下线模型 文心 4 Turbo (灾备)",  target: "模型 · ernie-4-turbo",         scope: "公司" },
  { id: "au-8", at: "2026-04-26 08:15", actor: "Joyce 黄", ip: "10.30.10.14", category: "model",     severity: "info",   action: "切换 财务 / HR / 法务 走本地 LLaMA-70B", target: "路由策略 · 敏感数据",        scope: "公司" },
  { id: "au-9", at: "2026-04-25 22:40", actor: "高翔",   ip: "10.40.55.18",  category: "okr",       severity: "warn",   action: "新增风险条目",                 target: "项目 · 县域服务网络重塑",     scope: "服务部 / 县域" },
  { id: "au-10", at: "2026-04-25 18:02", actor: "陈志远", ip: "10.10.1.1",  category: "auth",      severity: "info",   action: "登录 (SSO · 企业微信)",         target: "—",                            scope: "公司" },
  { id: "au-11", at: "2026-04-25 16:48", actor: "未知",  ip: "203.0.113.42", category: "auth",      severity: "danger", action: "外部 IP 尝试以 cop@partner 身份登录,被拦截", target: "—",                  scope: "外部" },
  { id: "au-12", at: "2026-04-25 15:30", actor: "黄毅",  ip: "10.10.4.21",   category: "config",    severity: "info",   action: "工业设计部 助手 上线全员",     target: "部门 · 工业设计 / 小龙虾",     scope: "公司" }
];

// Recent check-in records (history) for KRs. Each entry = one update event.
// progress is the value at that point in time, so the series is monotonic
// per KR (modulo rare resets).
export const KRCheckIns = [
  // O1 KRs
  { id: "ci-1-1-a", krId: "kr-1-1", date: "2026-04-22", author: "陈志远", progress: 70, current: "28.6%", note: "本月 DTC 试点 + 旗舰店双开,推动套系销售占比从 26.4% 升至 28.6%。" },
  { id: "ci-1-1-b", krId: "kr-1-1", date: "2026-03-25", author: "李慕白", progress: 64, current: "26.4%", note: "全屋净水 2.0 样机完成,开始小范围试点。" },
  { id: "ci-1-1-c", krId: "kr-1-1", date: "2026-02-26", author: "李慕白", progress: 56, current: "23.1%", note: "Q1 启动,基线数据。" },
  { id: "ci-1-2-a", krId: "kr-1-2", date: "2026-04-22", author: "李慕白", progress: 64, current: "57", note: "净水器 NPS 较上月 +4。投诉主因:县域售后响应时长。" },
  { id: "ci-1-2-b", krId: "kr-1-2", date: "2026-03-22", author: "李慕白", progress: 56, current: "53", note: "县域 NPS 拖累整体,需服务部介入。" },
  { id: "ci-1-3-a", krId: "kr-1-3", date: "2026-04-15", author: "孙阳", progress: 100, current: "21.2%", note: "X 系列与净水器组合促销超预期,联动率达成 21.2%,KR 提前完成。" },
  // O2 KRs
  { id: "ci-2-1-a", krId: "kr-2-1", date: "2026-04-23", author: "周岚", progress: 41, current: "82", note: "二线 80 城启动,82 城进入协同状态。" },
  { id: "ci-2-1-b", krId: "kr-2-1", date: "2026-03-25", author: "周岚", progress: 32, current: "64", note: "中台系统切换完成,开始大规模铺设。" },
  { id: "ci-2-2-a", krId: "kr-2-2", date: "2026-04-20", author: "周岚", progress: 78, current: "76%", note: "同价覆盖率提升 3pt,主要来自一线城市闭环。" },
  { id: "ci-2-3-a", krId: "kr-2-3", date: "2026-04-18", author: "汪洋", progress: 60, current: "4.1", note: "BP 满意度小幅回落,主因 SC 主导切换中的过渡期摩擦。" },
  // O3 KRs
  { id: "ci-3-1-a", krId: "kr-3-1", date: "2026-04-22", author: "苏婉", progress: 87, current: "1,046", note: "本周新增 38 条 CMF 条目,接近 1200 目标。" },
  { id: "ci-3-2-a", krId: "kr-3-2", date: "2026-04-22", author: "苏婉", progress: 76, current: "48%", note: "新品复用率提升 6pt,主要来自 X 系列。" },
  // O4 KRs
  { id: "ci-4-1-a", krId: "kr-4-1", date: "2026-04-23", author: "黄毅", progress: 38, current: "1,128", note: "工业设计部全员上线,日活同环比 +29%。" },
  { id: "ci-4-1-b", krId: "kr-4-1", date: "2026-03-30", author: "黄毅", progress: 28, current: "832", note: "Beta 阶段,主要面向 IT 与战略办。" },
  { id: "ci-4-2-a", krId: "kr-4-2", date: "2026-04-22", author: "黄毅", progress: 73, current: "44%", note: "知识复用率持续上升。瓶颈:决策日志填写率不足。" },
  { id: "ci-4-3-a", krId: "kr-4-3", date: "2026-04-22", author: "陈志远", progress: 39, current: "31%", note: "决策可追溯率仍低。下季度重点:对历史决策进行回填。" }
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

// =============== Workflow Templates =======================================
// Workflow templates are reusable AI-assisted process recipes that combine
// knowledge domains, skill packs and human approvals. Each template lives in
// a department; some are platform-wide.
export const WORKFLOW_STATUSES = [
  { v: "published",  label: "已发布", color: "#10b981" },
  { v: "draft",      label: "草稿",   color: "#f59e0b" },
  { v: "deprecated", label: "已下线", color: "#94a3b8" }
];

export const Workflows = [
  {
    id: "wf-design-brief", name: "创建设计简报", deptId: "industrial-design", owner: "李慕白",
    status: "published", version: "v2.1.0", icon: "FileText",
    description: "把项目方向 + 公司 OKR + 用户画像 + 部门知识结构化成可评审的设计简报。",
    input: "项目方向 / 关联 OKR / 用户画像", output: "结构化设计简报 (含 CMF / 工艺 / 成本约束)",
    avgTime: "约 8 分钟", uses: 64, lastRun: "2 小时前", linkedSkills: ["sp-design-brief", "sp-mat-search"], linkedDomains: ["kd-cmf", "kd-material", "kd-trend"],
    steps: [
      { id: "s1", name: "锁定项目方向与目标用户", role: "human", time: "1 min" },
      { id: "s2", name: "拉取公司 OKR + 关联项目作为背景", role: "system", time: "<5s" },
      { id: "s3", name: "运行 Skill — 供应商/材料/工艺检索", role: "skill", skillId: "sp-mat-search", time: "30s" },
      { id: "s4", name: "运行 Skill — 设计简报生成", role: "skill", skillId: "sp-design-brief", time: "45s" },
      { id: "s5", name: "提交人工评审", role: "approval", approver: "设计总监", time: "1 day" }
    ]
  },
  {
    id: "wf-mat-compare", name: "材料方案对比", deptId: "industrial-design", owner: "陈思源",
    status: "published", version: "v1.4.0", icon: "GitBranch",
    description: "在 2-3 个候选材料 / 工艺间进行成本、性能、可获得性的横向对比并形成推荐。",
    input: "候选材料 / 工艺清单 + 设计目标", output: "对比表 + 推荐结论 + 风险条目",
    avgTime: "约 5 分钟", uses: 38, lastRun: "今早 09:50", linkedSkills: ["sp-mat-search", "sp-cross-cat"], linkedDomains: ["kd-material", "kd-process", "kd-supplier"],
    steps: [
      { id: "s1", name: "明确对比维度 (成本/性能/工艺周期)", role: "human", time: "2 min" },
      { id: "s2", name: "运行 Skill — 供应商/材料/工艺检索", role: "skill", skillId: "sp-mat-search", time: "30s" },
      { id: "s3", name: "运行 Skill — 跨品类关联", role: "skill", skillId: "sp-cross-cat", time: "45s" },
      { id: "s4", name: "AI 汇总对比表 + 推荐", role: "ai", time: "1 min" }
    ]
  },
  {
    id: "wf-cmf-feasibility", name: "CMF 可行性检查", deptId: "id-cmf", owner: "苏婉",
    status: "published", version: "v1.2.0", icon: "Eye",
    description: "上传 CMF 方案,自动核查与已有材料 / 工艺 / 供应商能力的匹配度。",
    input: "CMF 方案图 / 工艺规格", output: "可行性评分 / 替代方案 / 风险清单",
    avgTime: "约 12 分钟", uses: 27, lastRun: "昨天", linkedSkills: ["sp-cmf-vision", "sp-mat-search"], linkedDomains: ["kd-cmf", "kd-material", "kd-process"],
    steps: [
      { id: "s1", name: "上传 CMF 方案图", role: "human", time: "1 min" },
      { id: "s2", name: "运行 Skill — CMF 图片识别", role: "skill", skillId: "sp-cmf-vision", time: "1 min" },
      { id: "s3", name: "对比中台 CMF 知识域", role: "system", time: "10s" },
      { id: "s4", name: "运行 Skill — 供应商/材料/工艺检索", role: "skill", skillId: "sp-mat-search", time: "30s" },
      { id: "s5", name: "AI 输出可行性评分", role: "ai", time: "1 min" },
      { id: "s6", name: "CMF 总监评审", role: "approval", approver: "苏婉", time: "1 day" }
    ]
  },
  {
    id: "wf-supplier-review", name: "供应商 / 工艺评审", deptId: "industrial-design", owner: "陈思源",
    status: "published", version: "v1.0.0", icon: "Workflow",
    description: "为关键项目准备供应商 + 工艺评审包,包含资质、产能、过往案例和风险。",
    input: "供应商清单 / 工艺需求", output: "评审包 + 推荐排序 + 关键风险",
    avgTime: "约 18 分钟", uses: 19, lastRun: "3 天前", linkedSkills: ["sp-mat-search"], linkedDomains: ["kd-supplier", "kd-process"],
    steps: [
      { id: "s1", name: "选择供应商池", role: "human", time: "3 min" },
      { id: "s2", name: "拉取资质 / 产能 / 案例", role: "system", time: "30s" },
      { id: "s3", name: "运行 Skill — 供应商/材料/工艺检索", role: "skill", skillId: "sp-mat-search", time: "1 min" },
      { id: "s4", name: "AI 排序 + 风险清单", role: "ai", time: "2 min" },
      { id: "s5", name: "采购 + 设计联合评审", role: "approval", approver: "采购总监 + 设计总监", time: "2 day" }
    ]
  },
  {
    id: "wf-fault-triage", name: "工单故障归因", deptId: "service", owner: "王锐",
    status: "published", version: "v1.3.0", icon: "Stethoscope",
    description: "把售后工单输入到诊断助手,自动给出可能原因、配件、SOP 和上门优先级。",
    input: "工单描述 / 故障代码", output: "可能原因 / 配件 / SOP / 优先级",
    avgTime: "约 2 分钟", uses: 1240, lastRun: "1 分钟前", linkedSkills: ["sp-fault-diag"], linkedDomains: [],
    steps: [
      { id: "s1", name: "技师 / 客服录入工单", role: "human", time: "30s" },
      { id: "s2", name: "运行 Skill — 故障诊断助手", role: "skill", skillId: "sp-fault-diag", time: "20s" },
      { id: "s3", name: "AI 给出 SOP 与配件清单", role: "ai", time: "30s" },
      { id: "s4", name: "技师确认并派单", role: "human", time: "1 min" }
    ]
  },
  {
    id: "wf-price-anomaly", name: "渠道价格异常排查", deptId: "cop", owner: "周岚",
    status: "published", version: "v1.0.0", icon: "AlertTriangle",
    description: "针对城市 + 渠道 + 周期跑一次价格异常检测,生成 SKU 级处理建议。",
    input: "城市 / 渠道 / 周期", output: "异常 SKU / 偏差幅度 / 处理建议",
    avgTime: "约 4 分钟", uses: 88, lastRun: "今早", linkedSkills: ["sp-price-anomaly"], linkedDomains: [],
    steps: [
      { id: "s1", name: "选择城市 / 渠道 / 周期", role: "human", time: "1 min" },
      { id: "s2", name: "运行 Skill — 价格异常检测", role: "skill", skillId: "sp-price-anomaly", time: "20s" },
      { id: "s3", name: "AI 生成 SKU 级处理建议", role: "ai", time: "1 min" },
      { id: "s4", name: "渠道经理确认", role: "approval", approver: "周岚", time: "1 hour" }
    ]
  },
  {
    id: "wf-meeting-notes", name: "会议纪要结构化", deptId: "platform", owner: "IT / 张毅",
    status: "published", version: "v2.2.0", icon: "FileText",
    description: "把录音 / 转写文本拆解成结论 / 决议 / 待办,并自动关联到 OKR 与项目。",
    input: "录音 / 转写文本", output: "结论 / 决议 / 待办 / 关联 OKR",
    avgTime: "约 3 分钟", uses: 1872, lastRun: "10 分钟前", linkedSkills: ["sp-meeting-notes"], linkedDomains: [],
    steps: [
      { id: "s1", name: "上传录音或文本", role: "human", time: "30s" },
      { id: "s2", name: "运行 Skill — 会议纪要结构化", role: "skill", skillId: "sp-meeting-notes", time: "1 min" },
      { id: "s3", name: "AI 自动关联到 OKR / 项目", role: "ai", time: "30s" }
    ]
  },
  {
    id: "wf-replenish", name: "动销预测与补货建议", deptId: "supply-chain", owner: "韩松",
    status: "draft", version: "v0.6.0", icon: "Truck",
    description: "对 SKU 做动销预测并给出周维度的补货建议,叠加渠道 / 季节修正。",
    input: "SKU 池 + 历史动销", output: "周补货建议 / 风险预警",
    avgTime: "约 9 分钟", uses: 12, lastRun: "—", linkedSkills: [], linkedDomains: [],
    steps: [
      { id: "s1", name: "选择 SKU 池", role: "human", time: "1 min" },
      { id: "s2", name: "拉取历史动销与库存", role: "system", time: "20s" },
      { id: "s3", name: "AI 预测 4 周动销", role: "ai", time: "2 min" },
      { id: "s4", name: "供应链评审", role: "approval", approver: "韩松", time: "0.5 day" }
    ]
  }
];

export const WorkflowRuns = [
  { id: "run-1", workflowId: "wf-fault-triage", trigger: "工单 #SR-20260425-9821", actor: "客服 · 林楠", started: "10:42", duration: "1m 38s", status: "ok", output: "推荐 SOP-FW-008 + 配件 PN-2241" },
  { id: "run-2", workflowId: "wf-design-brief", trigger: "项目 — 全屋净水 2.0", actor: "李慕白", started: "10:18", duration: "7m 02s", status: "ok", output: "已生成 8 页结构化简报" },
  { id: "run-3", workflowId: "wf-cmf-feasibility", trigger: "项目 — 9 大品类 CMF", actor: "苏婉", started: "09:55", duration: "11m 24s", status: "approval", output: "等待 CMF 总监评审" },
  { id: "run-4", workflowId: "wf-meeting-notes", trigger: "FY26 季度战略会", actor: "陈志远 · 战略办", started: "09:32", duration: "2m 41s", status: "ok", output: "12 条决议 / 8 条待办 · 已链接 O1 / O2" },
  { id: "run-5", workflowId: "wf-price-anomaly", trigger: "上海地区 · 4 月", actor: "周岚", started: "09:10", duration: "3m 18s", status: "warn", output: "11 个 SKU 偏差 > 8%" },
  { id: "run-6", workflowId: "wf-mat-compare", trigger: "X 系列外壳", actor: "孙阳", started: "08:45", duration: "5m 04s", status: "ok", output: "推荐 PVD-Black,综合分 8.6/10" },
  { id: "run-7", workflowId: "wf-supplier-review", trigger: "净水 2.0 膜组件", actor: "陈思源", started: "昨天", duration: "16m 12s", status: "fail", output: "供应商资质年检数据缺失" }
];

// =============== Strategy Question Registry ==============================
// Many ongoing strategic questions, each with status / debate progress / OKR
// linkages. The detail page (StrategyPage) renders one selected question.
export const STRATEGY_STATUSES = [
  { v: "draft",      label: "草稿",   color: "#94a3b8" },
  { v: "in-debate",  label: "研讨中", color: "#4F46E5" },
  { v: "decided",    label: "已定调", color: "#10b981" },
  { v: "archived",   label: "已归档", color: "#64748b" }
];

export const StrategyQuestions = [
  {
    id: "sq-1",
    title: "FY26 是否加大线上 DTC 渠道投入？",
    asker: "陈志远 · CEO",
    asked: "2026-04-23",
    status: "in-debate",
    summary: "线上 DTC 是否能成为全屋净水套系的主力增长引擎,以及对线下渠道的冲击如何控制。",
    rounds: 3, optionsCount: 3, decisionId: null,
    context: ["ks-1", "ks-3", "ks-4"],
    okrs: ["O1", "O2"],
    agents: ["ag-finance", "ag-product", "ag-gtm", "ag-ops", "ag-risk", "ag-supply", "ag-org"]
  },
  {
    id: "sq-2",
    title: "FY26 H2 是否进入欧洲市场首发新风净化机？",
    asker: "Renee · 海外事业部",
    asked: "2026-04-12",
    status: "in-debate",
    summary: "G3 新风净化机在欧洲首发,需评估 CE 认证节奏、北欧市场壁垒以及与现有海外合作渠道的协同。",
    rounds: 2, optionsCount: 2, decisionId: null,
    context: ["ks-1", "ks-7"],
    okrs: ["O1"],
    agents: ["ag-product", "ag-gtm", "ag-finance", "ag-supply", "ag-risk"]
  },
  {
    id: "sq-3",
    title: "县域服务网络由 BP 主导改为 SC 主导是否提升履约？",
    asker: "周岚 · COP VP",
    asked: "2026-03-18",
    status: "decided",
    summary: "已完成 3 轮研讨与 2 城试点,数据显示 SC 主导能把响应时长从 38h 降至 14h。",
    rounds: 3, optionsCount: 2, decisionId: "d-2",
    context: ["ks-3", "ks-6"],
    okrs: ["O2"],
    agents: ["ag-ops", "ag-risk", "ag-org", "ag-product", "ag-gtm"]
  },
  {
    id: "sq-4",
    title: "Velocity 部门助手是否优先工业设计部全员上线？",
    asker: "黄毅 · CTO",
    asked: "2026-03-04",
    status: "decided",
    summary: "工业设计部需求最强且数据基础最好,先在该部门全员上线,作为后续部门的样板。",
    rounds: 2, optionsCount: 3, decisionId: "d-3",
    context: ["ks-7"],
    okrs: ["O4"],
    agents: ["ag-product", "ag-tech", "ag-org", "ag-risk"]
  },
  {
    id: "sq-5",
    title: "FY27 是否把 9 大品类 CMF 中台对外开放给经销商？",
    asker: "苏婉 · 设计总监",
    asked: "2026-04-25",
    status: "draft",
    summary: "想法初稿:CMF 中台可以变成对内 + 对经销商的共享设计资产,但需评估知识产权与商业模式。",
    rounds: 0, optionsCount: 0, decisionId: null,
    context: ["ks-5"],
    okrs: ["O3"],
    agents: []
  }
];

// =============== Decisions (enriched) =====================================
// Adds: question / conclusion / assumptions / dissent / evidence / status /
// retrospective. Backwards-compatible with existing { title, date, owner,
// linkedKR, evidence } shape used by the OkrPage decision tab.
export const DECISION_STATUSES = [
  { v: "draft",       label: "草稿",   color: "#94a3b8" },
  { v: "decided",     label: "已定调", color: "#4F46E5" },
  { v: "in-flight",   label: "执行中", color: "#10b981" },
  { v: "retro",       label: "已复盘", color: "#7c3aed" }
];

export const DecisionsRich = [
  {
    id: "d-1",
    title: "全屋净水 2.0 产品定位收敛为'局改焕新'",
    date: "2026-03-12", owner: "陈志远", status: "in-flight", linkedKR: "kr-1-1", linkedProject: "proj-1", linkedQuestion: null,
    question: "全屋净水 2.0 应该面向新房刚需还是局改用户?",
    conclusion: "面向 4-5 年房龄的局改家庭,以'焕新'为核心叙事,优先优化安装与售后体验。",
    assumptions: [
      "局改家庭对净水的认知度高于新装,客单价可上探 ¥18,000",
      "县域服务网络可在 Q3 完成铺设,支撑套系级履约"
    ],
    dissent: [
      { agent: "ag-finance", text: "局改客群规模较新装小 60%,需要靠客单价补偿" }
    ],
    evidenceSources: ["ks-1", "ks-2", "ks-4", "ks-8"],
    retrospective: ""
  },
  {
    id: "d-2",
    title: "县域服务网络由 BP 主导改为 SC 主导",
    date: "2026-04-02", owner: "周岚", status: "in-flight", linkedKR: "kr-2-1", linkedProject: "proj-5", linkedQuestion: "sq-3",
    question: "县域市场谁来主导服务网络铺设?BP 渠道商,还是 SC 服务商?",
    conclusion: "由 SC 主导服务网络,BP 保留商品销售。先在 10 城试点,Q3 复制到 30 城。",
    assumptions: [
      "SC 主导能把上门响应时长从 38h 降到 ≤14h",
      "县域 SA (服务工程师) 培训体系可在 Q2 落地"
    ],
    dissent: [
      { agent: "ag-risk", text: "BP / SC 角色切换会让历史合作 BP 受损,需要给出补偿机制" },
      { agent: "ag-ops",  text: "SC 主导的备件库存预算是 BP 的 1.6 倍,需提前预算" }
    ],
    evidenceSources: ["ks-3", "ks-6"],
    retrospective: ""
  },
  {
    id: "d-3",
    title: "Velocity 部门助手优先工业设计部全员上线",
    date: "2026-04-15", owner: "黄毅", status: "in-flight", linkedKR: "kr-4-1", linkedProject: "proj-6", linkedQuestion: "sq-4",
    question: "Velocity 部门助手按什么次序在公司内推开?",
    conclusion: "工业设计部先全员上线,然后是服务部 → 渠道运营部 → 供应链。",
    assumptions: [
      "工业设计部 84 人有最强的 AI 工作流诉求",
      "CMF 知识域已经达到 95% 覆盖度,RAG 命中率有保证"
    ],
    dissent: [
      { agent: "ag-org", text: "如果只在 ID 上线,其它部门的高频用户(如服务部 1820 人)感知会差" }
    ],
    evidenceSources: ["ks-7"],
    retrospective: ""
  }
];
