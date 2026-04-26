// Velocity OS — Strategy Studio (multi-agent canvas + War Council), Department Workspace, Assistant Center

const { useState: uS } = React;

// =============== Strategy Studio =====================================
function StrategyPage() {
  const [tab, setTab] = uS("canvas");
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - var(--header-h))" }}>
      <div style={{ padding: "16px 28px 0", borderBottom: "1px solid var(--border-soft)", background: "#fff" }}>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--vel-indigo)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>战略工作台 · 第 3 轮研讨</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--fg1)", letterSpacing: "-0.01em" }}>{StrategyQuestion.title}</div>
            <div className="row" style={{ gap: 10, fontSize: 12, color: "var(--fg3)", marginTop: 4 }}>
              <span><Icon.User size={11} style={{ verticalAlign: "-2px" }} /> {StrategyQuestion.asker}</span>
              <span>·</span>
              <span>{StrategyQuestion.asked}</span>
              <span>·</span>
              <span>关联 OKR <strong style={{ color: "var(--vel-indigo-700)" }}>{StrategyQuestion.okrs.join(", ")}</strong></span>
              <span>·</span>
              <span>{StrategyQuestion.context.length} 条背景资料</span>
            </div>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn btn--ghost btn--sm"><Icon.Save size={13} /> 保存</button>
            <button className="btn btn--ghost btn--sm"><Icon.Pause size={13} /> 暂停研讨</button>
            <button className="btn btn--primary btn--sm"><Icon.Sparkles size={13} /> 生成 OKR / 项目草案</button>
          </div>
        </div>
        <div className="tabs" style={{ marginBottom: 0, borderBottom: "none" }}>
          {[
            { id: "canvas", label: "画布 (Spatial)" },
            { id: "war", label: "War Council" },
            { id: "options", label: "战略选项", count: 3 },
            { id: "output", label: "结构化输出" }
          ].map(t => (
            <div key={t.id} className={`tab ${tab===t.id?"is-active":""}`} onClick={() => setTab(t.id)}>
              {t.label}{t.count != null && <span className="tab__count">{t.count}</span>}
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
        {tab === "canvas" && <StrategyCanvas />}
        {tab === "war" && <WarCouncil />}
        {tab === "options" && <StrategyOptions />}
        {tab === "output" && <StructuredOutput />}
      </div>
    </div>
  );
}

function StrategyCanvas() {
  // dark canvas with mission node + agent nodes positioned around it
  const cx = 50, cy = 50; // percent
  const positions = Agents.map((a, i) => {
    const angle = (i / Agents.length) * Math.PI * 2 - Math.PI / 2;
    return { ...a, x: 50 + Math.cos(angle) * 32, y: 50 + Math.sin(angle) * 30 };
  });
  return (
    <div className="canvas-stage scroll" style={{ height: "100%" }}>
      <div style={{ position: "absolute", inset: 0 }}>
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <defs>
            <linearGradient id="line" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(99,102,241,0.6)"/>
              <stop offset="100%" stopColor="rgba(168,85,247,0.2)"/>
            </linearGradient>
          </defs>
          {positions.map((p, i) => (
            <line key={i}
              x1={`${cx}%`} y1={`${cy}%`}
              x2={`${p.x}%`} y2={`${p.y}%`}
              stroke="url(#line)" strokeWidth="1" strokeDasharray="3 4" opacity="0.6"
            />
          ))}
        </svg>

        {/* Mission node */}
        <div style={{
          position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)",
          width: 320, padding: 22,
          background: "linear-gradient(135deg, #312E81, #4C1D95)",
          color: "#fff", borderRadius: 18,
          boxShadow: "0 20px 60px rgba(99,102,241,0.4), 0 0 0 1px rgba(255,255,255,0.1)",
          zIndex: 5
        }}>
          <div style={{ fontSize: 10, color: "#c4b5fd", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>战略问题 · Mission</div>
          <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.35, marginBottom: 12 }}>{StrategyQuestion.title}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>
            上下文已注入: {StrategyQuestion.context.length} 条公司知识 · {StrategyQuestion.okrs.length} 个 OKR · {StrategyQuestion.agents.length} 个 Agent
          </div>
          <div className="row" style={{ marginTop: 14, gap: 8 }}>
            <span className="pill" style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}>第 3 轮</span>
            <span className="pill" style={{ background: "rgba(16,185,129,0.2)", color: "#6ee7b7" }}>研讨中</span>
          </div>
        </div>

        {/* Agent nodes */}
        {positions.map(p => {
          const lastMsg = DebateMessages.filter(m => m.agent === p.id).slice(-1)[0];
          return (
            <div key={p.id} style={{
              position: "absolute", left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%, -50%)",
              width: 220,
              background: "rgba(15, 23, 42, 0.85)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(10px)",
              borderRadius: 12, padding: 12,
              color: "#fff",
              boxShadow: `0 10px 30px ${p.color}30`
            }}>
              <div className="row" style={{ gap: 8, marginBottom: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: p.color, display: "grid", placeItems: "center", color: "#fff" }}>
                  {React.createElement(Icon[p.icon] || Icon.User, { size: 14 })}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{p.name}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>{p.focus}</div>
                </div>
                {lastMsg && (
                  <span className="pill" style={{
                    background: lastMsg.stance === "pro" ? "rgba(16,185,129,0.18)" : lastMsg.stance === "con" ? "rgba(239,68,68,0.18)" : "rgba(245,158,11,0.18)",
                    color: lastMsg.stance === "pro" ? "#6ee7b7" : lastMsg.stance === "con" ? "#fca5a5" : "#fcd34d"
                  }}>
                    {lastMsg.stance === "pro" ? "赞成" : lastMsg.stance === "con" ? "反对" : "保留"}
                  </span>
                )}
              </div>
              {lastMsg && (
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", lineHeight: 1.5, maxHeight: 50, overflow: "hidden" }}>
                  {lastMsg.text.slice(0, 80)}…
                </div>
              )}
            </div>
          );
        })}

        {/* Floating toolbar */}
        <div style={{
          position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)",
          display: "flex", gap: 4, padding: 4,
          background: "rgba(15,23,42,0.92)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 12, backdropFilter: "blur(20px)", zIndex: 10
        }}>
          {["Plus", "User", "FileText", "GitBranch", "PlayCircle"].map((ic, i) => (
            <button key={i} style={{ width: 36, height: 36, borderRadius: 8, color: "rgba(255,255,255,0.7)", display: "grid", placeItems: "center" }}>
              {React.createElement(Icon[ic], { size: 16 })}
            </button>
          ))}
          <div style={{ width: 1, background: "rgba(255,255,255,0.1)", margin: "4px 4px" }} />
          <button className="btn btn--primary btn--sm" style={{ padding: "0 12px" }}><Icon.Sparkles size={13} /> 进入下一轮</button>
        </div>
      </div>
    </div>
  );
}

function WarCouncil() {
  return (
    <div style={{ height: "100%", overflow: "auto", background: "#0B1220", color: "#fff" }} className="scroll">
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 40px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[1, 2, 3].map(round => (
            <div key={round}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700, padding: "16px 0 10px", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: 12 }}>
                第 {round} 轮 · {round === 1 ? "首轮陈述" : round === 2 ? "交叉质询" : "立场收敛"}
              </div>
              {DebateMessages.filter(m => m.round === round).map((m, i) => {
                const ag = Agents.find(a => a.id === m.agent);
                return (
                  <div key={i} style={{ display: "flex", gap: 14, marginBottom: 16 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: ag.color, color: "#fff", display: "grid", placeItems: "center", flexShrink: 0 }}>
                      {React.createElement(Icon[ag.icon] || Icon.User, { size: 17 })}
                    </div>
                    <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 16 }}>
                      <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
                        <div className="row" style={{ gap: 8 }}>
                          <span style={{ fontWeight: 700, fontSize: 13, color: "#fff" }}>{ag.name}</span>
                          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{ag.role}</span>
                        </div>
                        <span className="pill" style={{
                          background: m.stance === "pro" ? "rgba(16,185,129,0.18)" : m.stance === "con" ? "rgba(239,68,68,0.18)" : "rgba(245,158,11,0.18)",
                          color: m.stance === "pro" ? "#6ee7b7" : m.stance === "con" ? "#fca5a5" : "#fcd34d"
                        }}>{m.stance === "pro" ? "赞成" : m.stance === "con" ? "反对" : "保留"}</span>
                      </div>
                      <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.88)", lineHeight: 1.65, marginBottom: m.sources.length ? 10 : 0 }}>{m.text}</div>
                      {m.sources.length > 0 && (
                        <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
                          {m.sources.map(sid => {
                            const src = KnowledgeSources.find(k => k.id === sid);
                            return (
                              <span key={sid} className="pill" style={{ background: "rgba(99,102,241,0.18)", color: "#c4b5fd" }}>
                                <Icon.FileText size={10} /> {src?.title.slice(0, 22)}…
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 24, padding: 18, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 12 }}>
          <div className="row" style={{ gap: 10, marginBottom: 8 }}>
            <Icon.Sparkles size={16} style={{ color: "#c4b5fd" }} />
            <div style={{ fontWeight: 700, fontSize: 13, color: "#fff" }}>研讨摘要 · 由 Velocity 自动生成</div>
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.7 }}>
            7 个 Agent 中 <strong style={{ color: "#6ee7b7" }}>3 个赞成</strong>(产品/GTM/组织)、
            <strong style={{ color: "#fcd34d" }}> 3 个保留</strong>(财务/运营/供应链)、
            <strong style={{ color: "#fca5a5" }}> 1 个反对</strong>(风险)。
            核心张力在于"窗口期 vs 渠道冲突 vs 履约能力"。建议生成 3 个战略选项,分别对应 激进 / 稳健 / 渐进 投入节奏,并在 OKR 草案中明确县域服务网络作为前置条件。
          </div>
        </div>
      </div>
    </div>
  );
}

function StrategyOptions() {
  const opts = [
    { name: "选项 A · 激进切换", desc: "DTC 占比 Q4 达到 35%,以全屋净水套系为核心 SKU。", roi: "高", risk: "高", time: "Q2 启动 / Q4 见效", pros: 3, cons: 2 },
    { name: "选项 B · 稳健并行", desc: "DTC 占比 22%,保留线下,2 城试点县域服务网络。", roi: "中", risk: "中", time: "Q2 试点 / Q3 复制", pros: 5, cons: 1, recommended: true },
    { name: "选项 C · 渐进观望", desc: "维持现状 13%,先稳固 BP/SC/SA 三角协同。", roi: "低", risk: "低", time: "Q3 评估", pros: 2, cons: 3 }
  ];
  return (
    <div className="scroll" style={{ height: "100%", overflow: "auto", padding: 32, background: "var(--bg-page)" }}>
      <div className="grid grid-cols-3" style={{ maxWidth: 1200, margin: "0 auto" }}>
        {opts.map((o, i) => (
          <div key={i} className="card" style={{
            padding: 22,
            border: o.recommended ? "2px solid var(--vel-indigo)" : "1px solid var(--border-soft)",
            position: "relative"
          }}>
            {o.recommended && <span className="pill pill--indigo" style={{ position: "absolute", top: -10, left: 18 }}>⭐ 推荐方案</span>}
            <div style={{ fontSize: 11, color: "var(--fg3)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700, marginBottom: 6 }}>战略选项</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--fg1)", marginBottom: 8 }}>{o.name}</div>
            <div style={{ fontSize: 13, color: "var(--fg2)", lineHeight: 1.6, marginBottom: 16 }}>{o.desc}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              <div style={{ padding: "8px 10px", background: "var(--slate-50)", borderRadius: 6 }}>
                <div style={{ fontSize: 10, color: "var(--fg3)", textTransform: "uppercase" }}>ROI</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--fg1)" }}>{o.roi}</div>
              </div>
              <div style={{ padding: "8px 10px", background: "var(--slate-50)", borderRadius: 6 }}>
                <div style={{ fontSize: 10, color: "var(--fg3)", textTransform: "uppercase" }}>风险</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: o.risk === "高" ? "var(--danger-text)" : o.risk === "中" ? "var(--warning-text)" : "var(--success-text)" }}>{o.risk}</div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: "var(--fg3)", marginBottom: 10 }}>{o.time}</div>
            <div className="row" style={{ gap: 12, marginBottom: 14 }}>
              <span className="pill pill--ok">+{o.pros} 赞成</span>
              <span className="pill pill--danger">-{o.cons} 反对</span>
            </div>
            <button className={`btn ${o.recommended ? 'btn--primary' : 'btn--ghost'} btn--sm`} style={{ width: "100%", justifyContent: "center" }}>
              {o.recommended ? "选定此方案 →" : "查看详细分析"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function StructuredOutput() {
  return (
    <div className="scroll" style={{ height: "100%", overflow: "auto", padding: 32, background: "var(--bg-page)" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div className="card" style={{ padding: 24, marginBottom: 16 }}>
          <div className="row" style={{ gap: 10, marginBottom: 16 }}>
            <Icon.Target size={18} style={{ color: "var(--vel-indigo)" }} />
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--fg1)" }}>建议生成 Objective (草案)</div>
          </div>
          <div style={{ background: "var(--vel-indigo-50)", border: "1px solid var(--vel-indigo-100)", borderRadius: 10, padding: 18, marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--vel-indigo-700)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>O5 · DTC 渠道增长</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--fg1)", marginBottom: 12 }}>FY26 把线上 DTC 打造为全屋净水套系的主力增长引擎</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { kr: "KR1 · 线上 DTC 占比", target: "≥ 22%" },
                { kr: "KR2 · 全屋净水套系客单价", target: "≥ ¥18,000" },
                { kr: "KR3 · 县域服务履约率 NPS", target: "≥ 60" }
              ].map((kr, i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "8px 12px", background: "#fff", borderRadius: 6 }}>
                  <Icon.Hash size={13} style={{ color: "var(--fg4)", marginTop: 2 }} />
                  <div style={{ flex: 1, fontSize: 13, color: "var(--fg1)" }}>{kr.kr}</div>
                  <span className="pill pill--info num">{kr.target}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn btn--primary btn--sm">发布到 OKR 注册表</button>
            <button className="btn btn--ghost btn--sm">编辑后发布</button>
          </div>
        </div>

        <div className="card" style={{ padding: 24, marginBottom: 16 }}>
          <div className="row" style={{ gap: 10, marginBottom: 16 }}>
            <Icon.Layers size={18} style={{ color: "#10b981" }} />
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--fg1)" }}>建议生成关键项目 (草案)</div>
          </div>
          {[
            { name: "DTC 旗舰内容工厂搭建", owner: "Anna 林 · 市场部", milestone: "5 月样板间直播首秀" },
            { name: "县域服务网络 30 城前置铺设", owner: "王锐 · 服务部", milestone: "Q2 完成 SC 选型" },
            { name: "全屋净水套系柔性产线改造", owner: "韩松 · 供应链", milestone: "Q3 试产验证" }
          ].map((p, i) => (
            <div key={i} style={{ display: "flex", gap: 12, padding: 12, borderBottom: i < 2 ? "1px solid var(--border-soft)" : "none" }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#10b98118", color: "#10b981", display: "grid", placeItems: "center" }}>
                <Icon.Package size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--fg1)" }}>{p.name}</div>
                <div style={{ fontSize: 11, color: "var(--fg3)", marginTop: 2 }}>{p.owner} · 里程碑 <strong style={{ color: "var(--fg2)" }}>{p.milestone}</strong></div>
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div className="row" style={{ gap: 10, marginBottom: 14 }}>
            <Icon.Quote size={18} style={{ color: "#7c3aed" }} />
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--fg1)" }}>决策日志条目 (草案)</div>
          </div>
          <div style={{ fontSize: 13, color: "var(--fg2)", lineHeight: 1.7 }}>
            <p><strong style={{ color: "var(--fg1)" }}>问题:</strong> FY26 是否加大线上 DTC 渠道投入?</p>
            <p><strong style={{ color: "var(--fg1)" }}>结论:</strong> 选择"稳健并行"方案 — DTC 占比 22%,保留线下,2 城试点县域服务网络。</p>
            <p><strong style={{ color: "var(--fg1)" }}>关键假设:</strong> 县域履约能力可在 Q2 完成铺设;BP/SC/SA 同价机制 Q3 闭环。</p>
            <p><strong style={{ color: "var(--fg1)" }}>反对意见:</strong> 风险视角(渠道冲突)、运营视角(履约能力)— 已纳入前置条件。</p>
            <p><strong style={{ color: "var(--fg1)" }}>证据来源:</strong> 7 条公司知识、3 条市场数据、4 条历史决策。</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============== Department Workspace =====================================
function DepartmentPage({ deptId, setRoute }) {
  const dept = Departments.find(d => d.id === deptId) || Departments[0];
  const [tab, setTab] = uS("overview");
  const isID = dept.id === "industrial-design";

  return (
    <div className="content fade-in">
      <div style={{
        margin: "-28px -32px 24px",
        padding: "32px 32px 0",
        background: `linear-gradient(135deg, ${dept.color}10, transparent 60%)`,
        borderBottom: "1px solid var(--border-soft)"
      }}>
        <div className="row" style={{ alignItems: "flex-start", gap: 18, marginBottom: 22 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: dept.color, color: "#fff", display: "grid", placeItems: "center", boxShadow: `0 8px 24px ${dept.color}40` }}>
            {React.createElement(Icon[dept.icon], { size: 26 })}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: dept.color, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>{dept.en} Workspace</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "var(--fg1)" }}>{dept.name}</div>
            <div className="row" style={{ gap: 12, marginTop: 6, fontSize: 13, color: "var(--fg3)" }}>
              <span><Icon.User size={12} style={{ verticalAlign: "-2px" }} /> {dept.lead}</span>
              <span>·</span>
              <span><Icon.Users size={12} style={{ verticalAlign: "-2px" }} /> {dept.people} 人</span>
              <span>·</span>
              <span><Icon.MessageCircle size={12} style={{ verticalAlign: "-2px" }} /> 部门助手 <strong style={{ color: dept.color }}>{dept.assistant}</strong></span>
              <HealthPill status={dept.status} />
            </div>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn btn--ghost btn--sm"><Icon.Settings size={13} /> 配置</button>
            <button className="btn btn--primary btn--sm" style={{ background: dept.color }}><Icon.MessageCircle size={13} /> 打开{dept.assistant}</button>
          </div>
        </div>
        <div className="tabs" style={{ marginBottom: 0, borderBottom: "none" }}>
          {(isID ? [
            { id: "overview", label: "概览" },
            { id: "knowledge", label: "知识中心", count: dept.knowledge },
            { id: "cmf", label: "CMF Intelligence" },
            { id: "market", label: "Market Insights" },
            { id: "skills", label: "技能", count: dept.skills },
            { id: "workflows", label: "工作流", count: dept.workflows },
            { id: "projects", label: "项目", count: dept.projects },
            { id: "assistant", label: "🦞 小龙虾助手" }
          ] : [
            { id: "overview", label: "概览" },
            { id: "knowledge", label: "知识库", count: dept.knowledge },
            { id: "skills", label: "技能", count: dept.skills },
            { id: "workflows", label: "工作流", count: dept.workflows },
            { id: "assistant", label: `${dept.assistant} 助手` }
          ]).map(t => (
            <div key={t.id} className={`tab ${tab===t.id?"is-active":""}`} onClick={()=>setTab(t.id)}>
              {t.label}{t.count != null && <span className="tab__count">{t.count}</span>}
            </div>
          ))}
        </div>
      </div>

      {tab === "overview" && <DeptOverview dept={dept} />}
      {tab === "knowledge" && <DeptKnowledge dept={dept} />}
      {tab === "cmf" && <CMFIntelligence />}
      {tab === "market" && <MarketInsights />}
      {tab === "skills" && <DeptSkills dept={dept} />}
      {tab === "workflows" && <DeptWorkflows />}
      {tab === "projects" && <DeptProjects dept={dept} />}
      {tab === "assistant" && <AssistantChat dept={dept} />}
    </div>
  );
}

function DeptOverview({ dept }) {
  return (
    <div>
      <div className="grid grid-cols-4" style={{ marginBottom: 20 }}>
        <KpiCard label="知识条目" value={dept.knowledge.toLocaleString()} delta="+38" status="up" spark={[900,940,970,1000,1020,1030,1040,1046]} color={dept.color} />
        <KpiCard label="本周助手对话" value="412" delta="+62" status="up" spark={[280,310,340,360,380,395,405,412]} color="#10b981" />
        <KpiCard label="已运行技能" value="156" delta="+12" status="up" spark={[120,128,135,140,144,150,153,156]} color="#7c3aed" />
        <KpiCard label="项目健康度" value="87%" delta="+3pt" status="up" spark={[78,80,82,84,85,86,86,87]} color="#f59e0b" />
      </div>

      <div className="grid" style={{ gridTemplateColumns: "minmax(0,2fr) minmax(0,1fr)", gap: 20 }}>
        <div className="card">
          <div className="card__head"><div className="card__title"><Icon.Activity size={14} /> 高频问题 (本周)</div></div>
          <div>
            {[
              { q: "PVD 工艺与喷涂在零冷水热水器外壳上的成本对比?", uses: 24, source: "CMF + 工艺知识库" },
              { q: "G3 新风机在欧标认证上还差哪些?", uses: 18, source: "竞品 + 海外法规" },
              { q: "全屋净水二代 2026 春夏色彩主推?", uses: 15, source: "趋势 + CMF" },
              { q: "县域市场厨电单价带在 1500-2500 的 SKU 缺口?", uses: 11, source: "奥维 + 9 大品类" }
            ].map((q, i) => (
              <div key={i} style={{ padding: "12px 18px", borderTop: i ? "1px solid var(--border-soft)" : "none" }}>
                <div className="row" style={{ justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--fg1)" }}>"{q.q}"</div>
                  <span className="pill pill--neutral">{q.uses}</span>
                </div>
                <div style={{ fontSize: 11, color: "var(--fg3)" }}>来源 {q.source}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card__head"><div className="card__title"><Icon.Inbox size={14} /> 待处理事项</div></div>
          <div>
            {[
              { type: "review", text: "苏婉 上传了 38 条 CMF 条目待审核", color: "var(--warning)" },
              { type: "alert", text: "竞品分析知识域覆盖度低于 70%", color: "var(--warning)" },
              { type: "task", text: "CMF Phase 2 项目里程碑下周到期", color: "var(--vel-indigo)" },
              { type: "fb", text: "孙阳 反馈 PVD 工艺成本数据需更新", color: "var(--danger)" }
            ].map((t, i) => (
              <div key={i} style={{ padding: "12px 18px", borderTop: i ? "1px solid var(--border-soft)" : "none", display: "flex", gap: 10 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: t.color, marginTop: 7, flexShrink: 0 }} />
                <div style={{ fontSize: 13, color: "var(--fg2)", lineHeight: 1.5 }}>{t.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DeptKnowledge({ dept }) {
  return (
    <div>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--fg1)" }}>知识域</div>
        <button className="btn btn--primary btn--sm"><Icon.Upload size={13} /> 上传到部门</button>
      </div>
      <div className="grid grid-cols-4" style={{ marginBottom: 24 }}>
        {KnowledgeDomains.map(d => (
          <div key={d.id} className="card" style={{ padding: 16 }}>
            <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
              <Icon.Folder size={15} style={{ color: dept.color }} />
              <span className={`pill ${d.health === 'ok' ? 'pill--ok' : 'pill--warn'}`}>{d.coverage}%</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--fg1)", marginBottom: 4 }}>{d.name}</div>
            <div className="num" style={{ fontSize: 18, fontWeight: 800, color: "var(--fg1)" }}>{d.count}</div>
            <div style={{ fontSize: 11, color: "var(--fg3)" }}>条目 · 更新 {d.lastUpdate}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CMFIntelligence() {
  const swatches = [
    { name: "雾雪白", hex: "#F5F4EE", uses: 42 }, { name: "墨砂黑", hex: "#1F1E1C", uses: 38 },
    { name: "沙金", hex: "#C9A66B", uses: 24 }, { name: "玄铁灰", hex: "#5A5C5F", uses: 31 },
    { name: "薄雾蓝", hex: "#A6BFCB", uses: 18 }, { name: "暖香槟", hex: "#D4B895", uses: 15 },
    { name: "深湖绿", hex: "#1F3D38", uses: 12 }, { name: "瓷釉白", hex: "#EAE8E1", uses: 28 }
  ];
  return (
    <div>
      <div className="grid" style={{ gridTemplateColumns: "minmax(0, 1fr) 320px", gap: 20 }}>
        <div className="card">
          <div className="card__head"><div className="card__title"><Icon.Image size={14} /> 2026 春夏色彩主流</div><span className="pill pill--info">来自 1,046 条 CMF 数据</span></div>
          <div style={{ padding: 18, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {swatches.map(s => (
              <div key={s.hex} style={{ borderRadius: 10, overflow: "hidden", border: "1px solid var(--border-soft)" }}>
                <div style={{ height: 80, background: s.hex }} />
                <div style={{ padding: "8px 10px" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--fg1)" }}>{s.name}</div>
                  <div className="num" style={{ fontSize: 10, color: "var(--fg3)" }}>{s.hex} · {s.uses} 次引用</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card" style={{ padding: 18 }}>
          <div className="card__title" style={{ marginBottom: 14 }}><Icon.Camera size={14} /> 上传图片识别</div>
          <div style={{ border: "2px dashed var(--border)", borderRadius: 10, padding: 28, textAlign: "center", color: "var(--fg3)" }}>
            <Icon.Upload size={28} style={{ margin: "0 auto 8px", color: "var(--fg4)" }} />
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--fg2)" }}>拖入产品图片</div>
            <div style={{ fontSize: 11, color: "var(--fg4)", marginTop: 4 }}>识别色彩 / 材质 / 表面工艺 / CMF 标签</div>
          </div>
          <div style={{ marginTop: 14, fontSize: 12, color: "var(--fg3)" }}>
            最近识别: <strong style={{ color: "var(--fg2)" }}>松下 K3 净水器 (墨砂黑 + 拉丝铝)</strong>
          </div>
        </div>
      </div>
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card__head"><div className="card__title"><Icon.GitBranch size={14}/> 材质 × 工艺矩阵 (本季)</div></div>
        <div style={{ padding: 18, overflow: "auto" }}>
          <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ padding: 8, textAlign: "left" }}></th>
                {["阳极氧化", "PVD", "喷涂", "拉丝", "高光"].map(p => <th key={p} style={{ padding: 8, fontSize: 11, color: "var(--fg3)", fontWeight: 600 }}>{p}</th>)}
              </tr>
            </thead>
            <tbody>
              {["铝合金", "ABS", "玻璃", "不锈钢", "陶瓷"].map(m => (
                <tr key={m} style={{ borderTop: "1px solid var(--border-soft)" }}>
                  <td style={{ padding: 10, fontWeight: 600, color: "var(--fg1)" }}>{m}</td>
                  {[1,2,3,4,5].map(i => {
                    const v = (m.length * i) % 9;
                    const opacity = v / 9;
                    return <td key={i} style={{ padding: 8, textAlign: "center" }}>
                      <div style={{ width: 36, height: 24, borderRadius: 4, background: `rgba(79,70,229,${opacity})`, margin: "0 auto", color: opacity > 0.5 ? "#fff" : "var(--fg3)", fontSize: 10, display: "grid", placeItems: "center", fontFamily: "var(--font-mono)" }}>{v ? v * 7 : "—"}</div>
                    </td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ fontSize: 11, color: "var(--fg3)", marginTop: 10 }}>数字代表近 90 天本部门方案中该组合的使用次数。</div>
        </div>
      </div>
    </div>
  );
}

function MarketInsights() {
  return (
    <div className="grid" style={{ gridTemplateColumns: "minmax(0,2fr) minmax(0,1fr)", gap: 20 }}>
      <div className="card">
        <div className="card__head"><div className="card__title"><Icon.BarChart size={14}/> 厨卫品类 价格带分布 · 奥维 2025Q4</div></div>
        <div style={{ padding: 22 }}>
          <svg viewBox="0 0 600 220" style={{ width: "100%", height: 220 }}>
            {[
              { x: 30, label: "<2K", v: 28 }, { x: 110, label: "2-3K", v: 42 },
              { x: 190, label: "3-4K", v: 68 }, { x: 270, label: "4-5K", v: 55 },
              { x: 350, label: "5-7K", v: 38 }, { x: 430, label: "7-10K", v: 22 },
              { x: 510, label: ">10K", v: 14 }
            ].map((b, i) => (
              <g key={i}>
                <rect x={b.x} y={200 - b.v*2.5} width="60" height={b.v*2.5} rx="4" fill={i === 2 ? "#4F46E5" : "#cbd5e1"} />
                <text x={b.x + 30} y="215" textAnchor="middle" fontSize="11" fill="#64748b">{b.label}</text>
                <text x={b.x + 30} y={195 - b.v*2.5} textAnchor="middle" fontSize="10" fill={i === 2 ? "#4F46E5" : "#94a3b8"} fontWeight="700" fontFamily="JetBrains Mono">{b.v}%</text>
              </g>
            ))}
          </svg>
          <div className="row" style={{ gap: 8, marginTop: 8 }}>
            <span className="pill pill--indigo">3-4K 价格带为头部机会</span>
            <span className="pill pill--warn">>10K 高端段竞品集中</span>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card__head"><div className="card__title"><Icon.AlertTriangle size={14}/> 竞品规格警报</div></div>
        <div>
          {[
            { brand: "松下 K3", spec: "废水比 1:1, 售价 4,299", flag: "高于我司 3-4K 段" },
            { brand: "海尔 净享 Pro", spec: "1500L 通量 / RO + UF", flag: "超过我司主推" },
            { brand: "美的 X9", spec: "外观采用云朵 CMF", flag: "趋势预警" }
          ].map((c, i) => (
            <div key={i} style={{ padding: 14, borderTop: i ? "1px solid var(--border-soft)" : "none" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--fg1)" }}>{c.brand}</div>
              <div style={{ fontSize: 12, color: "var(--fg2)", marginTop: 2 }}>{c.spec}</div>
              <span className="pill pill--warn" style={{ marginTop: 6 }}>{c.flag}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DeptSkills({ dept }) {
  const seed = SkillPacks.filter(s => s.dept === dept.id);
  const [list, setList] = uS(() => seed.map(s => ({ ...s })));
  const [editing, setEditing] = uS(null);
  const [confirm, setConfirm] = uS(null);

  const SE = window.SkillEditor, SC = window.SkillCard, CM = window.ConfirmModal;

  function save() {
    setList(prev => {
      const i = prev.findIndex(x => x.id === editing.id);
      const next = { ...editing, updated: new Date().toISOString().slice(0,10) };
      delete next.__isNew;
      if (i === -1) return [next, ...prev];
      const cp = prev.slice(); cp[i] = next; return cp;
    });
    setEditing(null);
  }
  function onNew() {
    setEditing({
      id: window.makeId("sp"), name: "", maintainer: dept.lead || "",
      version: "v0.1.0", dept: dept.id, scope: "dept", status: "draft",
      icon: "Sparkles", input: "", output: "",
      uses: 0, rating: 0, updated: new Date().toISOString().slice(0,10),
      __isNew: true
    });
  }

  return (
    <div>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: "var(--fg3)" }}>
          <strong style={{ color: "var(--fg1)" }}>{dept.name}</strong> 拥有 <strong className="num" style={{ color: "var(--fg1)" }}>{list.length}</strong> 个 Skill Pack — 维护人由部门负责人指派,跨部门共享需 <a style={{ color: "var(--vel-indigo)", textDecoration: "underline", cursor: "pointer" }}>申请提级</a>。
        </div>
        <button className="btn btn--primary btn--sm" onClick={onNew}><Icon.Plus size={13}/> 新增 Skill</button>
      </div>
      <div className="grid grid-cols-3">
        {list.map(s => SC ? (
          <SC key={s.id} s={s} dept={dept}
            onEdit={() => setEditing({ ...s })}
            onDelete={() => setConfirm({ s })}
          />
        ) : null)}
        {list.length === 0 && (
          <div className="card" style={{ gridColumn: "1 / -1", padding: 36, textAlign: "center", color: "var(--fg4)", fontSize: 13 }}>
            {dept.name} 暂无 Skill Pack — <a onClick={onNew} style={{ color: "var(--vel-indigo)", cursor: "pointer", textDecoration: "underline" }}>新增第一个</a>
          </div>
        )}
      </div>
      {editing && SE && (
        <SE skill={editing} departments={Departments}
          onChange={setEditing} onClose={() => setEditing(null)} onSave={save} />
      )}
      {confirm && CM && (
        <CM title="删除 Skill Pack?"
          body={<>从 <b>{dept.name}</b> 移除 <b>"{confirm.s.name}"</b>?引用该 Skill 的工作流将失效。</>}
          danger
          onCancel={() => setConfirm(null)}
          onConfirm={() => { setList(prev => prev.filter(x => x.id !== confirm.s.id)); setConfirm(null); }}
        />
      )}
    </div>
  );
}

function DeptWorkflows() {
  const flows = [
    { name: "创建设计简报", steps: 5, uses: 64, time: "约 8 分钟" },
    { name: "材料方案对比", steps: 4, uses: 38, time: "约 5 分钟" },
    { name: "CMF 可行性检查", steps: 6, uses: 27, time: "约 12 分钟" },
    { name: "供应商 / 工艺评审", steps: 7, uses: 19, time: "约 18 分钟" },
    { name: "竞品设计语言图谱", steps: 5, uses: 42, time: "约 10 分钟" },
    { name: "概念评审备忘录", steps: 4, uses: 31, time: "约 6 分钟" }
  ];
  return (
    <div className="grid grid-cols-2">
      {flows.map((f, i) => (
        <div key={i} className="card" style={{ padding: 18 }}>
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
            <Icon.Workflow size={16} style={{ color: "var(--vel-indigo)" }} />
            <span className="pill pill--neutral">{f.steps} 步</span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--fg1)", marginBottom: 10 }}>{f.name}</div>
          {/* mini stepper */}
          <div className="row" style={{ gap: 4, marginBottom: 12 }}>
            {[...Array(f.steps)].map((_, si) => (
              <div key={si} style={{ flex: 1, height: 4, borderRadius: 2, background: si < f.steps - 1 ? "var(--vel-indigo)" : "var(--slate-200)" }} />
            ))}
          </div>
          <div className="row" style={{ justifyContent: "space-between", fontSize: 11, color: "var(--fg3)" }}>
            <span>{f.uses} 次执行 · {f.time}</span>
            <button className="btn btn--text btn--sm">启动 →</button>
          </div>
        </div>
      ))}
    </div>
  );
}



// =============== Department Projects (CRUD) ================================
function DeptProjects({ dept }) {
  const isMine = (p) => p.dept === dept.name || (p.dept || "").includes(dept.name);
  const seedFiltered = Projects.filter(isMine);
  const seed = seedFiltered.length ? seedFiltered : Projects.slice(0, 3).map(p => ({ ...p, dept: dept.name }));

  const [list, setList] = uS(() => seed.map(p => ({ ...p })));
  const [editing, setEditing] = uS(null);
  const [confirm, setConfirm] = uS(null);

  function save(next) {
    setList(prev => {
      const i = prev.findIndex(p => p.id === next.id);
      if (i === -1) return [next, ...prev];
      const cp = prev.slice(); cp[i] = next; return cp;
    });
    setEditing(null);
  }
  function del(id) { setList(prev => prev.filter(p => p.id !== id)); setConfirm(null); }
  function onNew() {
    setEditing({
      id: window.makeId("proj"), name: "", health: "ok", progress: 0,
      owner: dept.lead || "", dept: dept.name, okr: (Objectives[0] && Objectives[0].code) || "O1",
      milestone: "", due: "2026-12-31", risks: 0, __isNew: true
    });
  }

  const PE = window.ProjectEditor, CM = window.ConfirmModal;

  return (
    <div>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: "var(--fg3)" }}>
          共 <strong className="num" style={{ color: "var(--fg1)" }}>{list.length}</strong> 个关键项目 · 关联部门 <strong style={{ color: "var(--fg1)" }}>{dept.name}</strong>
        </div>
        <button className="btn btn--primary btn--sm" onClick={onNew}><Icon.Plus size={13} /> 新增项目</button>
      </div>
      <div className="card">
        <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
          <thead style={{ background: "var(--slate-50)" }}>
            <tr style={{ textAlign: "left" }}>
              {["项目", "OKR", "负责人", "里程碑", "进度", "风险", "截止", ""].map((h,i) => <th key={i} style={{ padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "var(--fg3)", textTransform: "uppercase" }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {list.map(p => (
              <tr key={p.id} style={{ borderTop: "1px solid var(--border-soft)" }}>
                <td style={{ padding: "12px 14px" }}><span className={`dot dot--${p.health}`} /> <strong style={{ color: "var(--fg1)", marginLeft: 8 }}>{p.name || <span style={{ color: "var(--fg4)", fontWeight: 500 }}>未命名</span>}</strong></td>
                <td style={{ padding: "12px 14px" }}><span className="pill pill--indigo num">{p.okr}</span></td>
                <td style={{ padding: "12px 14px", color: "var(--fg2)" }}>{p.owner || "—"}</td>
                <td style={{ padding: "12px 14px", color: "var(--fg2)" }}>{p.milestone || "—"}</td>
                <td style={{ padding: "12px 14px", width: 160 }}><div className="row" style={{ gap: 8 }}><div style={{ flex: 1 }}><Progress value={p.progress} status={p.health}/></div><span className="num" style={{ fontSize: 11 }}>{p.progress}%</span></div></td>
                <td style={{ padding: "12px 14px" }}>{p.risks > 0 ? <span className={`pill ${p.risks > 3 ? 'pill--danger' : 'pill--warn'}`}>⚠ {p.risks}</span> : <span style={{ color: "var(--fg4)", fontSize: 11 }}>—</span>}</td>
                <td style={{ padding: "12px 14px", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--fg3)" }}>{p.due}</td>
                <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                  <div className="row-actions">
                    <button className="icon-btn" title="编辑" onClick={() => setEditing({ ...p })}><Icon.Edit size={13} /></button>
                    <button className="icon-btn icon-btn--danger" title="删除" onClick={() => setConfirm({ p })}><Icon.Trash size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td colSpan={8} style={{ padding: 36, textAlign: "center", color: "var(--fg4)", fontSize: 13 }}>
                {dept.name} 暂无项目 — <a onClick={onNew} style={{ color: "var(--vel-indigo)", cursor: "pointer", textDecoration: "underline" }}>新增第一个</a>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && PE && (
        <PE
          project={editing}
          objectives={Objectives}
          onChange={setEditing}
          onClose={() => setEditing(null)}
          onSave={() => save(editing)}
        />
      )}
      {confirm && CM && (
        <CM
          title="删除项目?"
          body={<>将从 <b>{dept.name}</b> 移除项目 <b>"{confirm.p.name}"</b>。该操作仅在本部门视图生效。</>}
          danger
          onCancel={() => setConfirm(null)}
          onConfirm={() => del(confirm.p.id)}
        />
      )}
    </div>
  );
}

// =============== Assistant Chat ===========================================
function AssistantChat({ dept }) {
  const initial = [
    { role: "user", text: "PVD 工艺与喷涂在零冷水热水器外壳上,500台试产成本对比?" },
    { role: "assistant", text: "根据当前部门知识库 (CMF 1,046 条 + 工艺 156 条),给出 500 台试产规模的对比:\n\n• PVD: 单件 ¥38-46,工艺周期 3-4 天,色彩稳定性 ★★★★★\n• 喷涂: 单件 ¥12-18,工艺周期 1-2 天,色彩稳定性 ★★★\n\n建议:外观件用 PVD,内部件用喷涂,综合成本下降约 22%。", sources: ["竞品 CMF 图库 (2025春夏)", "零冷水技术路线图 v2", "供应商能力库 / 杭州东方"], skill: "供应商/材料/工艺检索", okr: ["O1", "O3"] }
  ];
  const [msgs, setMsgs] = uS(initial);
  const [draft, setDraft] = uS("");
  const send = () => {
    if (!draft.trim()) return;
    setMsgs([...msgs, { role: "user", text: draft }]);
    setDraft("");
    setTimeout(() => {
      setMsgs(m => [...m, { role: "assistant", text: "已基于公司 OKR 和部门知识为你生成回答(模拟数据)。这里会包含来源引用、推荐的下一步动作,以及可写回到项目/OKR 的入口。", sources: ["奥维 2025Q4 厨卫品类报告"], skill: "奥维数据分析", okr: ["O1"] }]);
    }, 600);
  };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 280px", gap: 20, height: "calc(100vh - 280px)" }}>
      <div className="card" style={{ display: "flex", flexDirection: "column" }}>
        <div className="card__head">
          <div className="card__title">
            <span style={{ fontSize: 18 }}>🦞</span>
            <span>{dept.assistant} · {dept.name} 助手</span>
            <span className="pill pill--ok"><span className="dot dot--ok" style={{ marginRight: 4 }}/>在线</span>
          </div>
          <button className="btn btn--text btn--sm">新对话 +</button>
        </div>
        <div className="scroll" style={{ flex: 1, padding: 22, overflow: "auto", display: "flex", flexDirection: "column", gap: 18 }}>
          {msgs.map((m, i) => (
            <div key={i} style={{ display: "flex", gap: 12, flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: m.role === "user" ? "linear-gradient(135deg,#f59e0b,#ef4444)" : dept.color, color: "#fff", display: "grid", placeItems: "center", flexShrink: 0, fontSize: 14, fontWeight: 700 }}>
                {m.role === "user" ? "陈" : "🦞"}
              </div>
              <div style={{ maxWidth: "80%" }}>
                <div style={{ background: m.role === "user" ? "var(--vel-indigo)" : "var(--slate-50)", color: m.role === "user" ? "#fff" : "var(--fg1)", padding: "12px 16px", borderRadius: 12, fontSize: 13.5, lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
                  {m.text}
                </div>
                {m.sources && (
                  <div className="row" style={{ gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                    {m.sources.map((s, si) => <span key={si} className="pill pill--indigo"><Icon.FileText size={10}/> {s}</span>)}
                  </div>
                )}
                {m.okr && (
                  <div className="row" style={{ gap: 6, marginTop: 4 }}>
                    {m.okr.map(o => <span key={o} className="pill pill--ok num">关联 {o}</span>)}
                    {m.skill && <span className="pill pill--neutral"><Icon.Sparkles size={9}/> {m.skill}</span>}
                  </div>
                )}
                {m.role === "assistant" && (
                  <div className="row" style={{ gap: 12, marginTop: 8, fontSize: 11, color: "var(--fg3)" }}>
                    <button>👍 有用</button>
                    <button>👎 不准确</button>
                    <button>+ 补充知识</button>
                    <button>↗ 写入项目</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: 14, borderTop: "1px solid var(--border-soft)" }}>
          <div className="row" style={{ gap: 8, padding: "8px 12px", background: "var(--slate-50)", border: "1px solid var(--border)", borderRadius: 10 }}>
            <button className="btn btn--icon btn--text"><Icon.Paperclip size={15} /></button>
            <button className="btn btn--icon btn--text"><Icon.Image size={15} /></button>
            <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder={`@${dept.assistant} 帮我…`} style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: 13, color: "var(--fg1)" }} />
            <button className="btn btn--icon btn--text"><Icon.Mic size={15} /></button>
            <button className="btn btn--primary btn--sm" onClick={send}><Icon.Send size={13}/> 发送</button>
          </div>
          <div className="row" style={{ gap: 6, marginTop: 8, flexWrap: "wrap" }}>
            <button className="btn btn--ghost btn--sm">📎 拖入文档</button>
            <button className="btn btn--ghost btn--sm">📷 上传产品图</button>
            <button className="btn btn--ghost btn--sm">📊 分析奥维数据</button>
            <button className="btn btn--ghost btn--sm">📝 生成设计简报</button>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="card" style={{ padding: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--fg3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>注入的上下文</div>
          <div style={{ fontSize: 12, color: "var(--fg2)", lineHeight: 1.7 }}>
            <div className="row" style={{ gap: 6 }}><Icon.Building size={11}/> 公司: <strong>{Company.name}</strong></div>
            <div className="row" style={{ gap: 6 }}><Icon.Target size={11}/> OKR: O1, O3</div>
            <div className="row" style={{ gap: 6 }}><Icon.Layers size={11}/> 项目: 全屋净水 2.0</div>
            <div className="row" style={{ gap: 6 }}><Icon.Database size={11}/> 部门知识: {dept.knowledge.toLocaleString()} 条</div>
          </div>
        </div>
        <div className="card" style={{ padding: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--fg3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>可用技能</div>
          {SkillPacks.filter(s => s.dept === dept.id).slice(0, 4).map(s => (
            <div key={s.id} style={{ display: "flex", gap: 8, padding: "6px 0", fontSize: 12 }}>
              <Icon.Sparkles size={12} style={{ color: dept.color, marginTop: 3 }} />
              <div>{s.name}</div>
            </div>
          ))}
        </div>
        <div className="card" style={{ padding: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--fg3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>历史对话 (今日)</div>
          {["PVD vs 喷涂成本", "奥维 Q4 价格带分析", "G3 欧标缺口", "局改方案色彩主推"].map((h, i) => (
            <div key={i} style={{ padding: "6px 0", fontSize: 12, color: "var(--fg2)", borderTop: i ? "1px solid var(--border-soft)" : "none" }}>{h}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============== Assistants Center =====================================
function AssistantsPage({ setRoute }) {
  return (
    <div className="content fade-in">
      <div className="page-head">
        <div className="page-head__eyebrow">助手中心</div>
        <h1 className="page-head__title">企业助手与 Agent</h1>
        <p className="page-head__subtitle">企业战略助手 + 部门助手 + 专业 Agent。一处管理意图路由、技能权限和企业微信入口。</p>
      </div>

      <div className="grid grid-cols-3" style={{ marginBottom: 24 }}>
        <div className="card" style={{ padding: 22, background: "linear-gradient(135deg,#312E81,#4C1D95)", color: "#fff", border: "none" }}>
          <div style={{ fontSize: 11, color: "#c4b5fd", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>企业级</div>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>战略助手 · Velocity</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginBottom: 14 }}>注入公司全部 OKR / 项目 / 战略知识。CEO / VP 优先入口。</div>
          <div className="row" style={{ gap: 12, fontSize: 11, color: "rgba(255,255,255,0.7)" }}>
            <span>✦ 全部 8 个 Agent</span><span>·</span><span>本周 142 次</span>
          </div>
        </div>
        {Departments.filter(d => d.assistant !== "—").slice(0, 5).map(d => (
          <div key={d.id} className="card" style={{ padding: 20, cursor: "pointer" }} onClick={() => setRoute({ page: "department", deptId: d.id })}>
            <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: d.color + "18", color: d.color, display: "grid", placeItems: "center" }}>
                {React.createElement(Icon[d.icon], { size: 17 })}
              </div>
              <HealthPill status={d.status} />
            </div>
            <div style={{ fontSize: 11, color: "var(--fg3)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700, marginBottom: 4 }}>{d.name}</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "var(--fg1)" }}>{d.assistant} 助手</div>
            <div className="row" style={{ gap: 12, marginTop: 12, fontSize: 11, color: "var(--fg3)" }}>
              <span>{d.skills} 个技能</span><span>·</span><span>{d.knowledge.toLocaleString()} 条知识</span>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card__head"><div className="card__title"><Icon.GitBranch size={14}/> 意图路由 · 最近 24 小时</div></div>
        <div style={{ padding: 22 }}>
          <div style={{ fontSize: 12, color: "var(--fg3)", marginBottom: 12 }}>用户提问 → 部门识别 → 技能匹配 → 知识检索 → 回答。下面是今日实际路由案例:</div>
          {[
            { q: "2026 春夏色彩主推?", dept: "工业设计", skill: "趋势洞察结构化", time: "0.8s", status: "ok" },
            { q: "上海地区净水器投诉率为何上升?", dept: "服务部", skill: "投诉归因", time: "1.4s", status: "ok" },
            { q: "下个季度备货建议?", dept: "供应链", skill: "动销预测", time: "2.1s", status: "warn" },
            { q: "AI Native 战略有哪些反对意见?", dept: "战略助手", skill: "决策日志检索", time: "0.6s", status: "ok" }
          ].map((r, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto auto", gap: 12, alignItems: "center", padding: "10px 0", borderTop: i ? "1px solid var(--border-soft)" : "none" }}>
              <div style={{ fontSize: 13, color: "var(--fg1)", fontWeight: 500 }}>"{r.q}"</div>
              <Icon.ArrowRight size={12} style={{ color: "var(--fg4)" }} />
              <span className="pill pill--info">{r.dept}</span>
              <span className="pill pill--neutral">{r.skill}</span>
              <span className="num" style={{ fontSize: 11, color: r.status === "ok" ? "var(--success-text)" : "var(--warning-text)" }}>{r.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { StrategyPage, DepartmentPage, AssistantsPage });
