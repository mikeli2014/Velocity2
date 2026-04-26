# Velocity PRD v2.0：知识中心、战略共创与部门智能工作空间

## 1. 产品名称

**Velocity 企业知识与战略操作系统**

英文：**Velocity Enterprise Knowledge & Strategy OS**

---

## 2. 产品目标

Velocity v2.0 的目标是把现有多智能体战略画布升级为企业级知识与战略操作系统，支持公司级知识沉淀、战略共创、OKR 与关键项目管理、部门级知识库、部门工作流和部门智能助手。

### 2.1 核心目标

1. 建立公司级统一知识中心，让公司背景、战略、OKR、关键项目成为所有员工和 AI 的共同上下文。
2. 建立战略共创与战略定义工作台，让战略想法可以被多智能体讨论、挑战、沉淀，并转化为 Objective、Key Results 和关键项目。
3. 建立部门级 Workspace 架构，让每个部门可以配置自己的知识库、工作流、Skill Pack 和助手。
4. 建立 AI Assistant / Agent 框架，让 AI 能嵌入部门日常工作，而不是停留在通用问答。
5. 建立知识治理机制，让知识来源、权限、质量、更新和引用可控。

---

## 3. 用户角色

| 角色 | 主要诉求 | 核心功能 |
|---|---|---|
| CEO / 总经理 | 统一战略认知，查看关键项目和风险 | 公司知识中心、战略工作台、OKR、项目组合、执行健康度 |
| 管理层 / VP | 将战略拆解为部门目标与项目 | Strategy Studio、OKR生成、Key Project Registry、部门对齐 |
| 部门负责人 | 建立部门知识库和工作流，提升部门效率 | Department Workspace、Skill Pack、部门助手、工作流配置 |
| 一线员工 / 专业岗位 | 查资料、做分析、生成报告、执行任务 | 部门助手、知识检索、报告生成、工作流任务 |
| IT / 平台管理员 | 管理权限、数据源、模型、知识质量 | Governance、Connector、权限、审计、配置中心 |
| AI / Agent 运营人员 | 配置Agent、技能、Prompt和工作流 | Skill Pack、Assistant Routing、Agent配置 |

---

## 4. 核心场景

## 4.1 公司级知识沉淀

### 场景描述

公司把战略文件、产品资料、品牌资料、组织架构、业务术语、市场洞察、竞争对手、管理制度、项目复盘、OKR 和关键项目统一沉淀到 Velocity。

### 用户故事

作为管理层，我希望 Velocity 能理解公司当前的战略、关键项目和业务背景，这样 AI 给出的建议不是通用建议，而是结合公司实际情况的建议。

### 功能要求

- 支持上传文档、粘贴文本、录入 URL、导入结构化数据。
- 支持公司级知识分类：战略、产品、品牌、组织、市场、竞品、流程、制度、项目、术语。
- 支持自动摘要、自动标签、知识来源记录。
- 支持将公司级 OKR 和关键项目作为 AI 的默认上下文。
- 支持知识开关：某些资料可启用/禁用进入 AI context。

---

## 4.2 战略共创与战略定义

### 场景描述

管理层提出战略问题，Velocity 通过多智能体从产品、财务、市场、技术、风险、组织、供应链等视角进行分析，并把讨论结果转化为结构化战略方案。

### 用户故事

作为总经理，我希望对“是否加大线上渠道投入”这类问题进行多维度 AI 研讨，并最终形成可以落地的 OKR、关键项目和执行计划。

### 功能要求

- 支持战略问题创建。
- 支持选择相关公司知识、OKR、关键项目、部门资料作为背景。
- 支持多 Agent War Council。
- 支持输出战略选项、风险、反对意见、关键假设。
- 支持生成 Objective / Key Results。
- 支持生成 Key Project 草案。
- 支持决策日志沉淀。
- 支持把战略画布输出发布到 OKR / Project Registry。

---

## 4.3 OKR 与关键项目作为公共知识背景

### 场景描述

公司的关键目标和项目不应只是管理工具中的数据，而应该成为所有 AI 分析和部门工作的公共背景。

### 用户故事

作为部门负责人，我希望部门 AI 助手在回答问题时自动知道公司当前最重要的 OKR 和关键项目，从而给出与公司方向一致的建议。

### 功能要求

- 公司级 Objective 管理。
- Key Result 进度管理。
- 关键项目组合管理。
- Objective 与 Project 关联。
- 部门 Objective 与公司 Objective 关联。
- 项目进展、风险、里程碑更新。
- AI 回答时自动注入相关 OKR 和关键项目背景。
- 支持项目健康度和战略对齐度展示。

---

## 4.4 部门级知识工作空间

### 场景描述

每个部门有不同的知识结构、工作流和 AI 技能需求。Velocity 需要支持部门级 Workspace。

### 用户故事

作为工业设计部负责人，我希望建立工业设计部自己的知识库，包括供应商、材料、工艺、CMF、竞品、趋势和9大品类资料，并通过小龙虾助手支持设计师日常检索、分析和报告生成。

### 功能要求

每个部门 Workspace 支持：

- 部门首页
- 部门知识库
- 部门知识域
- 部门文件夹
- 部门标签体系
- 部门 Skill Pack
- 部门助手
- 部门工作流
- 部门 OKR / 项目
- 权限管理
- 知识质量反馈

### 工业设计部示例

| 模块 | 说明 |
|---|---|
| Overview | 部门知识资产、最新洞察、高频问题、待处理事项 |
| Knowledge Hub | 供应商、材料、工艺、CMF、竞品、品类知识 |
| Supplier / Material / Process | 供应商能力、材料参数、工艺案例、成本区间 |
| CMF Intelligence | 图片识别、色彩、材质、表面工艺、CMF趋势 |
| Market Insights | 奥维数据、价格带、竞品规格、市场机会 |
| Trend Insights | 用户调研、展会观察、趋势报告、场景痛点 |
| Category Knowledge | 9大品类知识库、品牌格局、术语库、竞品分析 |
| Skills | 材料检索、CMF识别、趋势提炼、跨品类推理 |
| Assistant | 小龙虾助手，支持 Web 和企业微信入口 |

---

## 4.5 部门助手与 Agentic Agent

### 场景描述

每个部门可以配置自己的助手或 Agent，用于日常问答、文件总结、报告生成、数据分析、工作流触发和任务跟踪。

### 用户故事

作为部门员工，我希望在企业微信或 Velocity Web 中直接问部门助手，让它帮我查资料、总结报告、提炼机会、生成分析、更新项目进展。

### 功能要求

- 支持部门助手配置。
- 支持助手名称、角色、权限、可调用知识域、可调用工具配置。
- 支持意图识别和 Skill Pack 路由。
- 支持 RAG 问答。
- 支持来源引用。
- 支持生成报告。
- 支持触发工作流。
- 支持向项目或 OKR 写入更新。
- 支持反馈：有用、无用、纠错、补充知识。

---

## 5. 功能模块设计

## 5.1 Company Knowledge Center

### 功能

- 公司档案管理
- 公司背景资料管理
- 文档上传与解析
- 文本/URL导入
- 自动摘要
- 自动标签
- 语义检索
- RAG回答
- 知识启用/禁用
- 来源追溯

### 现有能力复用

- `CompanyIntelligenceHub`
- `CompanyDNADashboard`
- `CompanyKnowledge`
- `documentParser`
- `embeddingService`
- `vectorStore`
- `ragService`
- `companyContextBuilder`

### 需要增强

- 知识域分类
- 知识来源类型
- 知识质量状态
- 公司级/部门级/项目级知识范围
- 引用统计和复用率

---

## 5.2 Strategy Studio

### 功能

- 战略问题创建
- 资料选择
- 多 Agent 分析
- War Council
- 战略选项生成
- 风险挑战
- 决策日志
- OKR生成
- 关键项目生成
- 执行计划生成

### 现有能力复用

- React Flow Canvas
- Mission Node
- Agent Node
- Executive Studio
- War Council Panel
- Objective synthesis API
- Workflow Orchestrator

### 需要增强

- 战略讨论结果结构化保存
- 与 ObjectiveManager 打通
- 与 ProjectManager 打通
- 决策日志模型
- 假设与风险模型

---

## 5.3 OKR & Key Project Registry

### 功能

- 公司级 Objective
- 部门级 Objective
- Key Results
- Check-in
- 关键项目组合
- 项目里程碑
- 项目风险
- 项目与 OKR 关联
- AI 战略对齐分析

### 现有能力复用

- `ObjectiveManager`
- `ProjectManager`
- `CompanyProfile.objectives`
- `CompanyProfile.projects`
- `OKROutput`
- `ObjectiveCheckIn`

### 需要增强

- 公司/部门/项目三级目标关系
- 项目健康度
- 战略对齐评分
- 自动周报/月报生成
- AI 风险评估

---

## 5.4 Department Workspace Framework

### 功能

- 部门注册表
- 部门首页
- 部门知识库
- 部门知识域
- 部门 Skill Pack
- 部门助手
- 部门工作流
- 部门权限

### 新增配置建议

```ts
DepartmentConfig {
  id: string;
  name: string;
  englishName: string;
  description: string;
  assistantName: string;
  workspacePath: string;
  knowledgeDomainIds: string[];
  skillPackIds: string[];
  workflowTemplateIds: string[];
  defaultAgentIds: string[];
  allowedRoles: string[];
}
```

### 需要新增页面

- `/departments`
- `/departments/[departmentId]`
- `/departments/[departmentId]/knowledge`
- `/departments/[departmentId]/skills`
- `/departments/[departmentId]/assistant`
- `/departments/[departmentId]/workflows`
- `/departments/[departmentId]/projects`

---

## 5.5 Skill Pack Center

### 功能

Skill Pack 是部门 AI 能力的产品化单元。

每个 Skill Pack 定义：

- 使用场景
- 可调用知识域
- 可调用工具
- 推荐 Agent
- 输入模板
- 输出模板
- 工作流步骤
- 权限要求

### 示例：工业设计部 Skill Pack

| Skill Pack | 输入 | 输出 |
|---|---|---|
| 供应商/材料/工艺检索 | 设计需求描述 | 推荐供应商、材料、工艺、参数、成本、来源 |
| CMF图片识别 | 产品图片 | 色彩、材质、表面工艺、CMF标签 |
| 奥维数据分析 | Excel/报告 | 价格带机会、竞品规格、市场洞察 |
| 趋势洞察结构化 | 趋势报告/展会照片 | 标签化趋势、设计机会、知识条目 |
| 跨品类关联 | 材料/工艺/设计问题 | 可迁移机会、风险、参考案例 |

---

## 5.6 Assistant & Agent Routing

### 功能

- 识别用户身份
- 识别用户部门
- 识别问题意图
- 匹配 Department Workspace
- 匹配 Skill Pack
- 调用知识库 / 工具 / Agent
- 返回答案、报告或任务结果

### 路由逻辑

```text
用户输入
  ↓
身份与权限判断
  ↓
公司级上下文注入
  ↓
部门识别
  ↓
意图识别
  ↓
Skill Pack匹配
  ↓
知识检索 / 工具调用 / Agent执行
  ↓
答案生成 + 来源引用 + 后续动作建议
```

---

## 6. 数据模型建议

## 6.1 扩展 CompanyProfile

当前 `CompanyProfile` 已包含：

- company info
- keyMetrics
- focusAreas
- competitors
- objectives
- knowledge
- departments
- projects
- contextPrompt

建议保留并增强。

## 6.2 扩展 DepartmentWorkspace

当前结构：

```ts
DepartmentWorkspace {
  id: string;
  department: DepartmentType;
  folders: Folder[];
  objectives?: Objective[];
}
```

建议升级为：

```ts
DepartmentWorkspace {
  id: string;
  companyId: string;
  department: DepartmentType | string;
  name: string;
  description: string;
  assistantName?: string;
  folders: Folder[];
  knowledgeDomains: KnowledgeDomain[];
  skillPackIds: string[];
  workflowTemplateIds: string[];
  objectives?: Objective[];
  projects?: CompanyProject[];
  permissions: WorkspacePermission[];
  settings: DepartmentWorkspaceSettings;
}
```

## 6.3 新增 KnowledgeDomain

```ts
KnowledgeDomain {
  id: string;
  companyId: string;
  departmentId?: string;
  name: string;
  description: string;
  scope: 'company' | 'department' | 'project';
  tags: string[];
  sourceTypes: string[];
  enabled: boolean;
}
```

## 6.4 新增 SkillPack

```ts
SkillPack {
  id: string;
  name: string;
  description: string;
  departmentId?: string;
  knowledgeDomainIds: string[];
  toolIds: string[];
  agentIds: string[];
  inputSchema?: object;
  outputSchema?: object;
  workflowTemplateId?: string;
  enabled: boolean;
}
```

## 6.5 新增 AssistantConfig

```ts
AssistantConfig {
  id: string;
  name: string;
  companyId: string;
  departmentId?: string;
  channel: 'web' | 'wecom' | 'api';
  skillPackIds: string[];
  knowledgeDomainIds: string[];
  defaultTone: string;
  permissionPolicy: string;
  enabled: boolean;
}
```

---

## 7. 信息架构

## 7.1 一级导航

```text
Home / 企业认知总览
Company Knowledge / 公司知识中心
Strategy Studio / 战略工作台
OKR & Projects / 目标与关键项目
Departments / 部门工作空间
Skills / 技能中心
Assistants / 助手中心
Governance / 权限与治理
```

## 7.2 部门页面结构

```text
Departments
  ├── 工业设计部
  │   ├── Overview
  │   ├── Knowledge Hub
  │   ├── Skills
  │   ├── Assistant
  │   ├── Workflows
  │   ├── Projects
  │   └── Governance
  ├── 服务部
  ├── COP/渠道运营
  ├── 市场部
  └── 供应链
```

---

## 8. MVP 范围

## Phase 1：平台骨架重构

目标：把 Velocity 从单一战略画布扩展为可配置的企业知识与战略平台。

交付：

- 更新产品文案与导航
- 新增 Department Registry
- 新增 Skill Pack Registry
- 新增 Knowledge Domain Registry
- 新增 `/departments`
- 新增 `/departments/industrial-design`
- 工业设计部 Workspace 静态页面
- 部门卡片、技能卡片、知识域卡片组件

## Phase 2：知识中心与部门知识库

交付：

- 公司级知识中心增强
- 部门级知识上传
- 部门知识域选择
- RAG 检索支持 scope：company / department / project
- 答案来源展示
- 知识标签与摘要

## Phase 3：战略工作台与 OKR / 项目联动

交付：

- 战略问题保存
- War Council 输出结构化
- 一键生成 OKR 草案
- 一键生成关键项目草案
- 项目与公司 OKR 关联
- 决策日志

## Phase 4：部门助手与 Skill Pack

交付：

- Web 部门助手
- 工业设计部小龙虾助手
- Skill Pack 路由
- 文件总结
- 供应商/材料/工艺检索
- 设计洞察报告生成

## Phase 5：企业微信与 Agentic 工作流

交付：

- 企业微信小龙虾入口
- 群聊 @ 助手
- 文件/图片上传入库
- 卡片式回复
- 工作流触发
- 项目/OKR进展更新

---

## 9. 验收标准

## 9.1 平台级验收

- 用户能看到清晰的 Company Knowledge、Strategy Studio、OKR & Projects、Departments 导航。
- 公司级知识、OKR、关键项目能作为 AI 分析上下文。
- 新增部门不需要重写核心页面，主要通过配置完成。

## 9.2 部门级验收

- 工业设计部能拥有独立 Workspace。
- 工业设计部能配置知识域和 Skill Pack。
- 用户能在工业设计部页面看到知识库、技能、助手和工作流入口。
- 部门知识与公司知识可以分层检索。

## 9.3 AI能力验收

- AI 回答能引用公司级背景。
- AI 回答能引用部门知识。
- AI 能说明答案来源。
- AI 能基于 OKR 和关键项目给出对齐建议。
- AI 能根据意图路由到正确 Skill Pack。

## 9.4 治理验收

- 不同部门知识具备权限隔离。
- 关键知识有来源记录。
- 用户可反馈 AI 回答质量。
- 管理员可启用/禁用知识源。

---

## 10. 非目标

MVP 阶段不建议一次性完成以下内容：

- 不在第一阶段做完整企业微信生产集成。
- 不在第一阶段做完整 CMF 图片识别模型。
- 不在第一阶段做复杂 BPM 工作流引擎。
- 不在第一阶段重构所有历史页面。
- 不在第一阶段做所有部门的完整业务实现。

第一阶段重点是：

> 把 Velocity 的产品骨架从“多智能体画布”升级为“企业知识与战略操作系统”，并以工业设计部作为第一个部门级示范场景。

---

## 11. 给 Codex 的第一阶段开发任务

```text
请在 Velocity repo 中完成 v2.0 平台骨架改造。

目标：
把 Velocity 从单一 Cognitive Factory / 多智能体画布，扩展为企业知识与战略操作系统，支持公司级知识中心、战略工作台、OKR/关键项目、部门工作空间和部门 Skill Pack。

第一阶段只做平台骨架，不做完整企业微信集成，不做真实 CMF 图片识别，不改动数据库 schema，除非现有代码必须。

需要新增：
1. apps/web/src/config/departments.ts
2. apps/web/src/config/skill-packs.ts
3. apps/web/src/config/knowledge-domains.ts
4. apps/web/src/config/assistant-routing.ts

需要新增页面：
1. /departments
2. /departments/industrial-design

工业设计部 Workspace 包含：
- Overview
- Knowledge Hub
- Supplier / Material / Process
- CMF Intelligence
- Market Insights
- Trend Insights
- Category Knowledge
- Skills
- Xiaolongxia Assistant

需要新增组件：
- DepartmentCard
- SkillPackCard
- KnowledgeDomainCard
- DepartmentWorkspaceHeader
- AssistantPanel
- InsightCard
- UploadKnowledgeCard

要求：
- 尽量复用现有 UI 风格。
- 不要把工业设计部逻辑硬编码到所有组件中。
- 通过 config 驱动部门、知识域、技能包和助手。
- 保证 npm run build 通过。
- 完成后总结新增文件、修改文件和后续建议。
```

---

## 12. v2.0 产品判断

Velocity v2.0 的核心产品判断是：

> 企业不只是需要 AI 生成内容，而是需要一个把企业背景、战略、OKR、关键项目、部门知识和部门工作流统一起来的组织智能平台。

因此，Velocity 应该成为：

```text
公司级知识中心
+ 战略共创与定义工具
+ OKR与关键项目公共背景
+ 部门级知识工作空间
+ AI助手与Agentic工作流平台
```

