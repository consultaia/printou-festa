import { useState, useMemo, useEffect } from "react";

const SUPABASE_URL = "https://tfxdiozfvftgxuviisua.supabase.co";
const SUPABASE_KEY = "sb_publishable_BqIGn2lONfdTQJ-lYpfR5w_EmTFFVuX";

const USUARIOS = {
  janan: "1234",
  carol: "1234",
  mayana: "1234",
};

async function sbFetch(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...options,
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": options.prefer || "return=representation",
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

function formatBRL(value) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);
}

function parseNum(v) {
  return parseFloat(String(v).replace(",", ".")) || 0;
}

const STATUS_OPTIONS = ["Pendente", "Em produção", "Pronto", "Entregue"];
const TIPO_OPTIONS = ["Porta Maternidade", "Topo de Bolo", "Lembrancinha", "Outro"];
const RECEBEDOR_OPTIONS = ["Carol", "Mayana"];

const C = {
  pink: "#F472B6",
  rose: "#FB7185",
  lilac: "#C084FC",
  purple: "#A855F7",
  cream: "#FFF7F9",
  dark: "#2D1B2E",
  muted: "#9D6FA8",
  border: "#F3D0E8",
  carol: "#F472B6",
  mayana: "#C084FC",
};

const s = {
  app: { fontFamily: "'Segoe UI', system-ui, sans-serif", background: "linear-gradient(135deg, #FFF0F6 0%, #F5F0FF 100%)", minHeight: "100vh", color: C.dark },
  header: { background: `linear-gradient(90deg, ${C.rose} 0%, ${C.lilac} 100%)`, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 4px 20px rgba(244,114,182,0.3)" },
  logo: { fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" },
  logoSub: { fontSize: 11, color: "rgba(255,255,255,0.8)" },
  navBtn: (a) => ({ padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: a ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.2)", color: a ? C.purple : "#fff" }),
  content: { maxWidth: 700, margin: "0 auto", padding: "20px 16px 80px" },
  card: { background: "#fff", borderRadius: 16, padding: "18px 20px", marginBottom: 14, boxShadow: "0 2px 12px rgba(168,85,247,0.08)", border: `1px solid ${C.border}` },
  input: { width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, color: C.dark, background: C.cream, outline: "none", boxSizing: "border-box", marginBottom: 12 },
  label: { fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 4, display: "block", textTransform: "uppercase", letterSpacing: "0.4px" },
  btnPrimary: { background: `linear-gradient(90deg, ${C.rose}, ${C.lilac})`, color: "#fff", border: "none", borderRadius: 12, padding: "12px 24px", fontSize: 15, fontWeight: 700, cursor: "pointer", width: "100%", boxShadow: "0 4px 16px rgba(244,114,182,0.35)" },
  btnSecondary: { background: "transparent", color: C.muted, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", width: "100%", marginBottom: 10 },
  statGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 },
  statCard: (accent) => ({ background: "#fff", borderRadius: 14, padding: "16px 18px", border: `2px solid ${accent}22`, boxShadow: `0 2px 10px ${accent}15` }),
  statLabel: { fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: C.muted, marginBottom: 4 },
  statValue: (accent) => ({ fontSize: 22, fontWeight: 800, color: accent }),
  splitCard: { background: `linear-gradient(135deg, ${C.rose}15, ${C.lilac}15)`, borderRadius: 16, padding: "18px 20px", marginBottom: 16, border: `1px solid ${C.border}` },
  splitRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 10, marginBottom: 8 },
  filterChip: (a) => ({ padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none", background: a ? C.purple : "#fff", color: a ? "#fff" : C.muted, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }),
  badge: (status) => {
    const map = { "Pendente": ["#FEF3C7", "#D97706"], "Em produção": ["#DBEAFE", "#2563EB"], "Pronto": ["#F3E8FF", "#9333EA"], "Entregue": ["#DCFCE7", "#16A34A"] };
    const [bg, color] = map[status] || ["#F3F4F6", "#6B7280"];
    return { background: bg, color, fontSize: 11, fontWeight: 700, borderRadius: 20, padding: "3px 10px", display: "inline-block" };
  },
  fab: { position: "fixed", bottom: 24, right: 24, background: `linear-gradient(135deg, ${C.rose}, ${C.lilac})`, color: "#fff", border: "none", borderRadius: "50%", width: 56, height: 56, fontSize: 28, cursor: "pointer", boxShadow: "0 6px 24px rgba(244,114,182,0.45)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 },
  empty: { textAlign: "center", padding: "40px 20px", color: C.muted },
  sectionTitle: { fontSize: 18, fontWeight: 800, color: C.dark, marginBottom: 14 },
};

function emptyForm() {
  return { cliente: "", tipo: "Topo de Bolo", descricao: "", custo_producao: "", valor_venda: "", recebedor: "Carol", status: "Pendente", data: new Date().toISOString().split("T")[0] };
}

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [loginUser, setLoginUser] = useState("carol");
  const [loginPass, setLoginPass] = useState("");
  const [loginErro, setLoginErro] = useState("");

  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [view, setView] = useState("dashboard");
  const [editando, setEditando] = useState(null);
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [form, setForm] = useState(emptyForm());

  function fazerLogin() {
    if (USUARIOS[loginUser] === loginPass) {
      setUsuario(loginUser);
      setLoginErro("");
    } else {
      setLoginErro("Senha incorreta.");
    }
  }

  async function carregarPedidos() {
    setLoading(true);
    try {
      const data = await sbFetch("/pedidos?order=created_at.desc", { prefer: "" });
      setPedidos(data || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (usuario) carregarPedidos();
  }, [usuario]);

  async function salvarPedido() {
    if (!form.cliente || !form.valor_venda) return;
    setSalvando(true);
    try {
      const payload = {
        cliente: form.cliente,
        tipo: form.tipo,
        descricao: form.descricao,
        custo_producao: parseNum(form.custo_producao),
        valor_venda: parseNum(form.valor_venda),
        recebedor: form.recebedor,
        status: form.status,
        data: form.data,
        criado_por: usuario,
      };
      if (editando) {
        await sbFetch(`/pedidos?id=eq.${editando}`, { method: "PATCH", body: JSON.stringify(payload) });
      } else {
        await sbFetch("/pedidos", { method: "POST", body: JSON.stringify(payload) });
      }
      await carregarPedidos();
      setForm(emptyForm());
      setEditando(null);
      setView("pedidos");
    } catch (e) {
      alert("Erro ao salvar: " + e.message);
    }
    setSalvando(false);
  }

  async function excluirPedido(id) {
    if (!confirm("Excluir este pedido?")) return;
    await sbFetch(`/pedidos?id=eq.${id}`, { method: "DELETE", prefer: "" });
    await carregarPedidos();
  }

  function abrirEditar(p) {
    setEditando(p.id);
    setForm({ ...p, custo_producao: String(p.custo_producao), valor_venda: String(p.valor_venda) });
    setView("novo");
  }

  const totais = useMemo(() => {
    const totalVendas = pedidos.reduce((s, p) => s + parseNum(p.valor_venda), 0);
    const totalCusto = pedidos.reduce((s, p) => s + parseNum(p.custo_producao), 0);
    const totalLucro = totalVendas - totalCusto;
    return { totalVendas, totalCusto, totalLucro, lucroCarol: totalCusto + totalLucro / 2, lucroMayana: totalLucro / 2 };
  }, [pedidos]);

  const pedidosFiltrados = filtroStatus === "Todos" ? pedidos : pedidos.filter(p => p.status === filtroStatus);

  // LOGIN
  if (!usuario) {
    return (
      <div style={{ ...s.app, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: "36px 32px", width: 320, boxShadow: "0 8px 40px rgba(168,85,247,0.15)", border: `1px solid ${C.border}` }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🎀</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.dark }}>Printou Festa</div>
            <div style={{ fontSize: 13, color: C.muted }}>Controle de pedidos</div>
          </div>

          <label style={s.label}>Quem é você?</label>
          <select style={s.input} value={loginUser} onChange={e => setLoginUser(e.target.value)}>
            <option value="janan">Janan</option>
            <option value="carol">Carol</option>
            <option value="mayana">Mayana</option>
          </select>

          <label style={s.label}>Senha</label>
          <input style={s.input} type="password" placeholder="••••" value={loginPass}
            onChange={e => setLoginPass(e.target.value)}
            onKeyDown={e => e.key === "Enter" && fazerLogin()} />

          {loginErro && <div style={{ color: "#EF4444", fontSize: 13, marginBottom: 12, textAlign: "center" }}>{loginErro}</div>}

          <button style={s.btnPrimary} onClick={fazerLogin}>Entrar</button>
        </div>
      </div>
    );
  }

  // NOVO PEDIDO
  if (view === "novo") {
    const lucro = parseNum(form.valor_venda) - parseNum(form.custo_producao);
    return (
      <div style={s.app}>
        <div style={s.header}>
          <div><div style={s.logo}>🎀 Printou Festa</div><div style={s.logoSub}>Olá, {usuario}!</div></div>
          <button style={s.navBtn(false)} onClick={() => { setView("pedidos"); setEditando(null); setForm(emptyForm()); }}>← Voltar</button>
        </div>
        <div style={s.content}>
          <div style={s.sectionTitle}>{editando ? "Editar Pedido" : "Novo Pedido"}</div>
          <div style={s.card}>
            <label style={s.label}>Cliente</label>
            <input style={s.input} placeholder="Nome do cliente" value={form.cliente} onChange={e => setForm(f => ({ ...f, cliente: e.target.value }))} />

            <label style={s.label}>Tipo de produto</label>
            <select style={s.input} value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
              {TIPO_OPTIONS.map(t => <option key={t}>{t}</option>)}
            </select>

            <label style={s.label}>Descrição / Personalização</label>
            <input style={s.input} placeholder="Ex: Safari, nome Pedro, azul e dourado" value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={s.label}>Custo de Produção (R$)</label>
                <input style={s.input} type="number" placeholder="0,00" value={form.custo_producao} onChange={e => setForm(f => ({ ...f, custo_producao: e.target.value }))} />
              </div>
              <div>
                <label style={s.label}>Valor de Venda (R$)</label>
                <input style={s.input} type="number" placeholder="0,00" value={form.valor_venda} onChange={e => setForm(f => ({ ...f, valor_venda: e.target.value }))} />
              </div>
            </div>

            <label style={s.label}>Quem recebeu o pagamento</label>
            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              {RECEBEDOR_OPTIONS.map(r => (
                <button key={r} onClick={() => setForm(f => ({ ...f, recebedor: r }))}
                  style={{ flex: 1, padding: 10, borderRadius: 10, border: "2px solid", borderColor: form.recebedor === r ? (r === "Carol" ? C.carol : C.mayana) : C.border, background: form.recebedor === r ? (r === "Carol" ? C.carol + "22" : C.mayana + "22") : "#fff", color: form.recebedor === r ? (r === "Carol" ? C.carol : C.mayana) : C.muted, fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
                  {r === "Carol" ? "💳 Carol" : "💳 Mayana"}
                </button>
              ))}
            </div>

            <label style={s.label}>Status</label>
            <select style={s.input} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              {STATUS_OPTIONS.map(st => <option key={st}>{st}</option>)}
            </select>

            <label style={s.label}>Data do pedido</label>
            <input style={s.input} type="date" value={form.data} onChange={e => setForm(f => ({ ...f, data: e.target.value }))} />

            {form.valor_venda && form.custo_producao && (
              <div style={{ ...s.splitCard, marginTop: 4, marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 10, textTransform: "uppercase" }}>Divisão deste pedido</div>
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ flex: 1, background: C.carol + "18", borderRadius: 10, padding: "10px 14px", textAlign: "center" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.carol, marginBottom: 2 }}>CAROL</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: C.carol }}>{formatBRL(parseNum(form.custo_producao) + lucro / 2)}</div>
                    <div style={{ fontSize: 10, color: C.muted }}>custo + metade do lucro</div>
                  </div>
                  <div style={{ flex: 1, background: C.mayana + "18", borderRadius: 10, padding: "10px 14px", textAlign: "center" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.mayana, marginBottom: 2 }}>MAYANA</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: C.mayana }}>{formatBRL(lucro / 2)}</div>
                    <div style={{ fontSize: 10, color: C.muted }}>metade do lucro</div>
                  </div>
                </div>
              </div>
            )}

            <button style={{ ...s.btnPrimary, opacity: salvando ? 0.7 : 1 }} onClick={salvarPedido} disabled={salvando}>
              {salvando ? "Salvando..." : editando ? "Salvar alterações" : "Registrar pedido"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // DASHBOARD
  if (view === "dashboard") {
    return (
      <div style={s.app}>
        <div style={s.header}>
          <div><div style={s.logo}>🎀 Printou Festa</div><div style={s.logoSub}>Olá, {usuario}!</div></div>
          <div style={{ display: "flex", gap: 6 }}>
            <button style={s.navBtn(true)} onClick={() => setView("dashboard")}>Resumo</button>
            <button style={s.navBtn(false)} onClick={() => setView("pedidos")}>Pedidos</button>
            <button style={{ ...s.navBtn(false), fontSize: 11 }} onClick={() => setUsuario(null)}>Sair</button>
          </div>
        </div>
        <div style={s.content}>
          {loading ? (
            <div style={s.empty}><div style={{ fontSize: 30, marginBottom: 8 }}>⏳</div><div>Carregando...</div></div>
          ) : (
            <>
              <div style={s.sectionTitle}>Resumo financeiro</div>
              <div style={s.statGrid}>
                <div style={s.statCard(C.rose)}><div style={s.statLabel}>Total vendido</div><div style={s.statValue(C.rose)}>{formatBRL(totais.totalVendas)}</div></div>
                <div style={s.statCard(C.purple)}><div style={s.statLabel}>Lucro total</div><div style={s.statValue(C.purple)}>{formatBRL(totais.totalLucro)}</div></div>
                <div style={s.statCard("#F59E0B")}><div style={s.statLabel}>Custo produção</div><div style={s.statValue("#F59E0B")}>{formatBRL(totais.totalCusto)}</div></div>
                <div style={s.statCard("#10B981")}><div style={s.statLabel}>Pedidos</div><div style={s.statValue("#10B981")}>{pedidos.length}</div></div>
              </div>

              <div style={s.splitCard}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.muted, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>Divisão acumulada</div>
                <div style={{ ...s.splitRow, background: C.carol + "18", marginBottom: 8 }}>
                  <div><div style={{ fontWeight: 800, color: C.carol, fontSize: 15 }}>Carol</div><div style={{ fontSize: 11, color: C.muted }}>Custo + metade do lucro</div></div>
                  <div style={{ fontWeight: 800, fontSize: 20, color: C.carol }}>{formatBRL(totais.lucroCarol)}</div>
                </div>
                <div style={{ ...s.splitRow, background: C.mayana + "18" }}>
                  <div><div style={{ fontWeight: 800, color: C.mayana, fontSize: 15 }}>Mayana</div><div style={{ fontSize: 11, color: C.muted }}>Metade do lucro</div></div>
                  <div style={{ fontWeight: 800, fontSize: 20, color: C.mayana }}>{formatBRL(totais.lucroMayana)}</div>
                </div>
              </div>

              <div style={s.card}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: C.muted }}>STATUS DOS PEDIDOS</div>
                {STATUS_OPTIONS.map(st => {
                  const count = pedidos.filter(p => p.status === st).length;
                  return (
                    <div key={st} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={s.badge(st)}>{st}</span>
                      <span style={{ fontWeight: 700 }}>{count} pedido{count !== 1 ? "s" : ""}</span>
                    </div>
                  );
                })}
              </div>

              {pedidos.length === 0 && (
                <div style={s.empty}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>🎀</div>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>Nenhum pedido ainda</div>
                  <div style={{ fontSize: 13 }}>Toque no + para registrar o primeiro</div>
                </div>
              )}
            </>
          )}
        </div>
        <button style={s.fab} onClick={() => { setForm(emptyForm()); setEditando(null); setView("novo"); }}>+</button>
      </div>
    );
  }

  // PEDIDOS
  return (
    <div style={s.app}>
      <div style={s.header}>
        <div><div style={s.logo}>🎀 Printou Festa</div><div style={s.logoSub}>Olá, {usuario}!</div></div>
        <div style={{ display: "flex", gap: 6 }}>
          <button style={s.navBtn(false)} onClick={() => setView("dashboard")}>Resumo</button>
          <button style={s.navBtn(true)} onClick={() => setView("pedidos")}>Pedidos</button>
          <button style={{ ...s.navBtn(false), fontSize: 11 }} onClick={() => setUsuario(null)}>Sair</button>
        </div>
      </div>
      <div style={s.content}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={s.sectionTitle}>Pedidos ({pedidosFiltrados.length})</div>
          <button onClick={carregarPedidos} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer", color: C.muted }}>
            {loading ? "..." : "↻ Atualizar"}
          </button>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          {["Todos", ...STATUS_OPTIONS].map(f => (
            <button key={f} style={s.filterChip(filtroStatus === f)} onClick={() => setFiltroStatus(f)}>{f}</button>
          ))}
        </div>

        {loading && <div style={s.empty}><div>Carregando...</div></div>}

        {!loading && pedidosFiltrados.length === 0 && (
          <div style={s.empty}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📦</div>
            <div style={{ fontWeight: 700 }}>Nenhum pedido {filtroStatus !== "Todos" ? `"${filtroStatus}"` : ""}</div>
          </div>
        )}

        {pedidosFiltrados.map(p => {
          const lucro = parseNum(p.valor_venda) - parseNum(p.custo_producao);
          return (
            <div key={p.id} style={{ background: "#fff", borderRadius: 14, padding: "14px 16px", marginBottom: 10, border: `1px solid ${C.border}`, boxShadow: "0 2px 8px rgba(168,85,247,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>{p.cliente}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{p.tipo} · {p.data} · por {p.criado_por}</div>
                </div>
                <span style={s.badge(p.status)}>{p.status}</span>
              </div>

              {p.descricao && <div style={{ fontSize: 13, color: C.muted, marginBottom: 8, fontStyle: "italic" }}>"{p.descricao}"</div>}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
                <div style={{ background: "#FFF0F6", borderRadius: 8, padding: "8px 10px" }}>
                  <div style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>VENDA</div>
                  <div style={{ fontWeight: 800, color: C.rose, fontSize: 14 }}>{formatBRL(parseNum(p.valor_venda))}</div>
                </div>
                <div style={{ background: "#FFF7ED", borderRadius: 8, padding: "8px 10px" }}>
                  <div style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>CUSTO</div>
                  <div style={{ fontWeight: 800, color: "#F59E0B", fontSize: 14 }}>{formatBRL(parseNum(p.custo_producao))}</div>
                </div>
                <div style={{ background: "#F0FFF4", borderRadius: 8, padding: "8px 10px" }}>
                  <div style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>LUCRO</div>
                  <div style={{ fontWeight: 800, color: "#10B981", fontSize: 14 }}>{formatBRL(lucro)}</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 12 }}>
                  <span style={{ color: C.muted }}>Recebido por </span>
                  <span style={{ fontWeight: 700, color: p.recebedor === "Carol" ? C.carol : C.mayana }}>{p.recebedor}</span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => abrirEditar(p)} style={{ background: C.purple + "18", color: C.purple, border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Editar</button>
                  <button onClick={() => excluirPedido(p.id)} style={{ background: "#FEE2E2", color: "#EF4444", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Excluir</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <button style={s.fab} onClick={() => { setForm(emptyForm()); setEditando(null); setView("novo"); }}>+</button>
    </div>
  );
}
