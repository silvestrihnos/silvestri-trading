<details>
<summary>👉 Hacé clic acá para ver el contenido de App.jsx (copiar todo)</summary>
```jsx
import { useState, useEffect, useCallback } from "react";
const INITIAL_STATE = {
quadrants: {
Q1: {
name: "El Francotirador",
label: "Q1",
capital: 2500,
market: "EUR/USD",
style: "1 trade/día",
color: "#00D4FF",
trades: [],
balance: 2500,
},
Q2: {
name: "La Máquina",
label: "Q2",
capital: 2500,
market: "MNQ Futuros",
style: "10 scalps/día",
color: "#FFB800",
trades: [],
balance: 2500,
},
Q3: {
name: "El Swing",
label: "Q3",
capital: 2500,
market: "NVDA / META / GOOGL",
style: "2-4 trades/semana",
color: "#00FF9D",
trades: [],
balance: 2500,
},
Q4: {
name: "El Cohete",
label: "Q4",
capital: 2500,
market: "SOL/AVAX + Opciones",
style: "Alarma activa",
color: "#FF4D6D",
trades: [],
balance: 2500,
trailingActive: false,
trailingPeak: null,
alarmActive: false,
},
},
alarms: [],
};
const RULES = {
Q1: ["1 sola entrada por día", "Cierre obligatorio antes de 5 PM EST", "Stop máximo: -20 pips / $50", "Sin trade = decisión válida"],
Q2: ["Solo entre 9:30–11:30 AM EST", "4 rojas seguidas → cerrás el día", "Stop: 4-5 puntos MNQ", "Target: 6-8 puntos por trade"],
Q3: ["Precio sobre EMA21 = entrada válida", "Stop: 2-3% bajo mínimo del día", "Hold máximo 7 días", "Target: resistencia anterior"],
Q4: ["Modo normal: 50% capital en SOL/AVAX", "Alarma: 100% en opciones", "Stop loss: -50%", "Trailing activado en +100% → cierre en -11% desde pico"],
};
function formatCurrency(n) {
const abs = Math.abs(n);
return (n < 0 ? "-" : "") + "$" + abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function formatPct(n) {
return (n >= 0 ? "+" : "") + n.toFixed(2) + "%";
}
function MiniSparkline({ trades, color }) {
if (!trades || trades.length < 2) {
return (
<svg width="80" height="28" viewBox="0 0 80 28">
<line x1="0" y1="14" x2="80" y2="14" stroke="#333" strokeWidth="1" strokeDasharray="4 2" />
</svg>
);
}
let running = 0;
const points = trades.map((t, i) => {
running += t.pnl;
return running;
});
const min = Math.min(0, ...points);
const max = Math.max(0, ...points);
const range = max - min || 1;
const pts = points.map((v, i) => {
const x = (i / (points.length - 1)) * 80;
const y = 26 - ((v - min) / range) * 24;
return ${x},${y};
});
return (
<svg width="80" height="28" viewBox="0 0 80 28">
<polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" opacity="0.8" />
</svg>
);
}
function TradeModal({ quadrantKey, quadrant, onClose, onAdd }) {
const [form, setForm] = useState({
symbol: "",
direction: "LONG",
entry: "",
exit: "",
size: "",
notes: "",
});
const pnl = form.entry && form.exit && form.size
? ((parseFloat(form.exit) - parseFloat(form.entry)) * parseFloat(form.size) * (form.direction === "SHORT" ? -1 : 1))
: null;
const handleSubmit = () => {
if (!form.symbol || !form.entry || !form.exit || !form.size) return;
onAdd(quadrantKey, {
id: Date.now(),
date: new Date().toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" }),
symbol: form.symbol.toUpperCase(),
direction: form.direction,
entry: parseFloat(form.entry),
exit: parseFloat(form.exit),
size: parseFloat(form.size),
pnl: pnl,
notes: form.notes,
});
onClose();
};
return (
<div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" }}>
<div style={{ background: "#0F0F14", border: 1px solid ${quadrant.color}40, borderRadius: 12, padding: 28, width: 360, maxWidth: "90vw" }}>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
<span style={{ fontFamily: "'DM Mono', monospace", color: quadrant.color, fontSize: 14, fontWeight: 600 }}>{quadrant.label} — NUEVA OPERACIÓN</span>
<button onClick={onClose} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 18 }}>✕</button>
</div>
    {[
      { label: "Símbolo", key: "symbol", placeholder: "NVDA, BTC, EUR..." },
      { label: "Precio entrada", key: "entry", placeholder: "0.00", type: "number" },
      { label: "Precio salida", key: "exit", placeholder: "0.00", type: "number" },
      { label: "Cantidad / Size", key: "size", placeholder: "1", type: "number" },
    ].map(f => (
      <div key={f.key} style={{ marginBottom: 14 }}>
        <div style={{ color: "#666", fontSize: 11, marginBottom: 5, fontFamily: "'DM Mono', monospace" }}>{f.label.toUpperCase()}</div>
        <input
          type={f.type || "text"}
          placeholder={f.placeholder}
          value={form[f.key]}
          onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
          style={{ width: "100%", background: "#1A1A24", border: "1px solid #333", borderRadius: 6, padding: "8px 12px", color: "#fff", fontFamily: "'DM Mono', monospace", fontSize: 13, boxSizing: "border-box" }}
        />
      </div>
    ))}

    <div style={{ marginBottom: 14 }}>
      <div style={{ color: "#666", fontSize: 11, marginBottom: 5, fontFamily: "'DM Mono', monospace" }}>DIRECCIÓN</div>
      <div style={{ display: "flex", gap: 8 }}>
        {["LONG", "SHORT"].map(d => (
          <button key={d} onClick={() => setForm(p => ({ ...p, direction: d }))}
            style={{ flex: 1, padding: "8px", borderRadius: 6, border: `1px solid ${form.direction === d ? quadrant.color : "#333"}`, background: form.direction === d ? quadrant.color + "20" : "#1A1A24", color: form.direction === d ? quadrant.color : "#666", fontFamily: "'DM Mono', monospace", fontSize: 12, cursor: "pointer" }}>
            {d}
          </button>
        ))}
      </div>
    </div>

    <div style={{ marginBottom: 14 }}>
      <div style={{ color: "#666", fontSize: 11, marginBottom: 5, fontFamily: "'DM Mono', monospace" }}>NOTAS</div>
      <textarea placeholder="Setup, motivo de entrada..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
        style={{ width: "100%", background: "#1A1A24", border: "1px solid #333", borderRadius: 6, padding: "8px 12px", color: "#888", fontFamily: "'DM Mono', monospace", fontSize: 12, resize: "none", height: 60, boxSizing: "border-box" }} />
    </div>

    {pnl !== null && (
      <div style={{ background: pnl >= 0 ? "#00FF9D10" : "#FF4D6D10", border: `1px solid ${pnl >= 0 ? "#00FF9D" : "#FF4D6D"}30`, borderRadius: 6, padding: "10px 14px", marginBottom: 16, textAlign: "center" }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 18, fontWeight: 700, color: pnl >= 0 ? "#00FF9D" : "#FF4D6D" }}>{formatCurrency(pnl)}</span>
      </div>
    )}

    <button onClick={handleSubmit}
      style={{ width: "100%", padding: "12px", background: quadrant.color, borderRadius: 6, border: "none", color: "#000", fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
      REGISTRAR OPERACIÓN
    </button>
  </div>
</div>
);
}
function QuadrantCard({ qKey, q, onAddTrade, onAlarm }) {
const [expanded, setExpanded] = useState(false);
const [showModal, setShowModal] = useState(false);
const totalPnl = q.trades.reduce((s, t) => s + (t.pnl || 0), 0);
const pnlPct = (totalPnl / q.capital) * 100;
const winTrades = q.trades.filter(t => t.pnl > 0).length;
const winRate = q.trades.length > 0 ? (winTrades / q.trades.length * 100).toFixed(0) : null;
const todayTrades = q.trades.filter(t => t.date?.includes(new Date().toLocaleDateString("es-AR", { dateStyle: "short" }))).length;
const trailingStatus = qKey === "Q4" && q.trailingActive && q.trailingPeak
? (q.trailingPeak * 0.89)
: null;
return (
<>
{showModal && <TradeModal quadrantKey={qKey} quadrant={q} onClose={() => setShowModal(false)} onAdd={onAddTrade} />}
<div style={{
background: "#0F0F14",
border: 1px solid ${expanded ? q.color + "60" : "#1E1E2A"},
borderRadius: 12,
overflow: "hidden",
transition: "border-color 0.2s",
}}>
<div style={{ padding: "16px 20px", borderBottom: 1px solid #1E1E2A, position: "relative", overflow: "hidden" }}>
<div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: q.color }} />
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
<div>
<div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
<span style={{ fontFamily: "'DM Mono', monospace", color: q.color, fontSize: 11, fontWeight: 700, letterSpacing: 2 }}>{q.label}</span>
{qKey === "Q4" && q.alarmActive && (
<span style={{ background: "#FF4D6D", color: "#000", fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 3, fontFamily: "'DM Mono', monospace", animation: "pulse 1s infinite" }}>🚨 ALARMA</span>
)}
{qKey === "Q4" && q.trailingActive && (
<span style={{ background: "#FFB80020", color: "#FFB800", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 3, fontFamily: "'DM Mono', monospace", border: "1px solid #FFB80040" }}>TRAILING ON</span>
)}
</div>
<div style={{ color: "#fff", fontSize: 15, fontWeight: 700, fontFamily: "'DM Mono', monospace", marginBottom: 2 }}>{q.name}</div>
<div style={{ color: "#555", fontSize: 11, fontFamily: "'DM Mono', monospace" }}>{q.market} · {q.style}</div>
</div>
<div style={{ textAlign: "right" }}>
<div style={{ color: totalPnl >= 0 ? "#00FF9D" : "#FF4D6D", fontFamily: "'DM Mono', monospace", fontSize: 16, fontWeight: 700 }}>
{formatCurrency(totalPnl)}
</div>
<div style={{ color: totalPnl >= 0 ? "#00FF9D80" : "#FF4D6D80", fontFamily: "'DM Mono', monospace", fontSize: 11 }}>
{formatPct(pnlPct)}
</div>
</div>
</div>
      <div style={{ display: "flex", gap: 16, marginTop: 12, alignItems: "center" }}>
        <div>
          <div style={{ color: "#444", fontSize: 9, fontFamily: "'DM Mono', monospace", marginBottom: 2 }}>BALANCE</div>
          <div style={{ color: "#aaa", fontSize: 12, fontFamily: "'DM Mono', monospace" }}>{formatCurrency(q.capital + totalPnl)}</div>
        </div>
        <div>
          <div style={{ color: "#444", fontSize: 9, fontFamily: "'DM Mono', monospace", marginBottom: 2 }}>TRADES</div>
          <div style={{ color: "#aaa", fontSize: 12, fontFamily: "'DM Mono', monospace" }}>{q.trades.length}</div>
        </div>
        {winRate && (
          <div>
            <div style={{ color: "#444", fontSize: 9, fontFamily: "'DM Mono', monospace", marginBottom: 2 }}>WIN RATE</div>
            <div style={{ color: parseInt(winRate) >= 50 ? "#00FF9D" : "#FF4D6D", fontSize: 12, fontFamily: "'DM Mono', monospace" }}>{winRate}%</div>
          </div>
        )}
        {qKey === "Q2" && (
          <div>
            <div style={{ color: "#444", fontSize: 9, fontFamily: "'DM Mono', monospace", marginBottom: 2 }}>HOY</div>
            <div style={{ color: todayTrades >= 4 ? "#FF4D6D" : "#aaa", fontSize: 12, fontFamily: "'DM Mono', monospace" }}>{todayTrades}/10</div>
          </div>
        )}
        <div style={{ marginLeft: "auto" }}>
          <MiniSparkline trades={q.trades} color={q.color} />
        </div>
      </div>

      {trailingStatus && (
        <div style={{ marginTop: 10, background: "#FFB80010", border: "1px solid #FFB80030", borderRadius: 6, padding: "6px 10px", display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#FFB800", fontFamily: "'DM Mono', monospace", fontSize: 10 }}>TRAILING STOP</span>
          <span style={{ color: "#FFB800", fontFamily: "'DM Mono', monospace", fontSize: 10, fontWeight: 700 }}>{formatCurrency(trailingStatus)}</span>
        </div>
      )}
    </div>

    <div style={{ padding: "10px 16px", display: "flex", gap: 8 }}>
      <button onClick={() => setShowModal(true)}
        style={{ flex: 1, padding: "8px", background: q.color + "15", border: `1px solid ${q.color}40`, borderRadius: 6, color: q.color, fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
        + OPERAR
      </button>
      <button onClick={() => setExpanded(e => !e)}
        style={{ flex: 1, padding: "8px", background: "#1A1A24", border: "1px solid #2A2A35", borderRadius: 6, color: "#666", fontFamily: "'DM Mono', monospace", fontSize: 11, cursor: "pointer" }}>
        {expanded ? "OCULTAR ▲" : "HISTORIAL ▼"}
      </button>
      {qKey === "Q4" && (
        <button onClick={() => onAlarm(qKey)}
          style={{ padding: "8px 12px", background: q.alarmActive ? "#FF4D6D20" : "#1A1A24", border: `1px solid ${q.alarmActive ? "#FF4D6D" : "#2A2A35"}`, borderRadius: 6, color: q.alarmActive ? "#FF4D6D" : "#666", fontFamily: "'DM Mono', monospace", fontSize: 11, cursor: "pointer" }}>
          🚨
        </button>
      )}
    </div>

    {expanded && (
      <div style={{ borderTop: "1px solid #1E1E2A" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #1A1A24" }}>
          <div style={{ color: "#444", fontSize: 9, fontFamily: "'DM Mono', monospace", marginBottom: 8, letterSpacing: 2 }}>REGLAS DEL SISTEMA</div>
          {RULES[qKey].map((r, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
              <span style={{ color: q.color, fontSize: 10 }}>▸</span>
              <span style={{ color: "#555", fontSize: 11, fontFamily: "'DM Mono', monospace" }}>{r}</span>
            </div>
          ))}
        </div>

        <div style={{ padding: "12px 16px" }}>
          <div style={{ color: "#444", fontSize: 9, fontFamily: "'DM Mono', monospace", marginBottom: 8, letterSpacing: 2 }}>HISTORIAL</div>
          {q.trades.length === 0 ? (
            <div style={{ color: "#333", fontSize: 11, fontFamily: "'DM Mono', monospace", textAlign: "center", padding: "12px 0" }}>Sin operaciones registradas</div>
          ) : (
            [...q.trades].reverse().slice(0, 10).map(t => (
              <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #1A1A24" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ color: t.direction === "LONG" ? "#00FF9D" : "#FF4D6D", fontSize: 9, fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>{t.direction}</span>
                  <span style={{ color: "#888", fontSize: 12, fontFamily: "'DM Mono', monospace" }}>{t.symbol}</span>
                  <span style={{ color: "#444", fontSize: 10, fontFamily: "'DM Mono', monospace" }}>{t.date}</span>
                </div>
                <span style={{ color: t.pnl >= 0 ? "#00FF9D" : "#FF4D6D", fontSize: 12, fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>{formatCurrency(t.pnl)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    )}
  </div>
</>
);
}
function AlarmPanel({ alarms }) {
if (alarms.length === 0) return null;
return (
<div style={{ background: "#FF4D6D08", border: "1px solid #FF4D6D30", borderRadius: 10, padding: "14px 18px", marginBottom: 20 }}>
<div style={{ color: "#FF4D6D", fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 700, letterSpacing: 2, marginBottom: 10 }}>🚨 ALARMAS ACTIVAS</div>
{alarms.map((a, i) => (
<div key={i} style={{ color: "#FF4D6D", fontFamily: "'DM Mono', monospace", fontSize: 12, marginBottom: 4, padding: "6px 10px", background: "#FF4D6D10", borderRadius: 4 }}>
{a.message}
</div>
))}
</div>
);
}
export default function TradingDashboard() {
const [state, setState] = useState(INITIAL_STATE);
const [time, setTime] = useState(new Date());
const [showAddAlarm, setShowAddAlarm] = useState(false);
const [alarmMsg, setAlarmMsg] = useState("");
useEffect(() => {
const t = setInterval(() => setTime(new Date()), 1000);
return () => clearInterval(t);
}, []);
const handleAddTrade = useCallback((qKey, trade) => {
setState(prev => {
const q = prev.quadrants[qKey];
const newTrades = [...q.trades, trade];
const totalPnl = newTrades.reduce((s, t) => s + (t.pnl || 0), 0);
const pnlPct = (totalPnl / q.capital) * 100;
  let trailingActive = q.trailingActive;
  let trailingPeak = q.trailingPeak;
  if (qKey === "Q4") {
    const currentValue = q.capital + totalPnl;
    const gainPct = (totalPnl / q.capital) * 100;
    if (gainPct >= 100 && !trailingActive) {
      trailingActive = true;
      trailingPeak = currentValue;
    }
    if (trailingActive && currentValue > (trailingPeak || 0)) {
      trailingPeak = currentValue;
    }
  }

  let newAlarms = [...prev.alarms];
  if (qKey === "Q2") {
    const consecutive = newTrades.slice(-4).every(t => t.pnl < 0);
    if (consecutive && newTrades.length >= 4) {
      newAlarms = [...newAlarms.filter(a => !a.message.includes("Q2")), { message: "⚠️ Q2 — 4 rojas consecutivas. CERRÁ EL DÍA.", time: new Date().toLocaleTimeString() }];
    }
  }
  if (pnlPct <= -20) {
    const exists = newAlarms.some(a => a.message.includes(qKey) && a.message.includes("20%"));
    if (!exists) newAlarms = [...newAlarms, { message: `⚠️ ${qKey} — Pérdida del 20% alcanzada. Pausar y analizar.`, time: new Date().toLocaleTimeString() }];
  }
  if (qKey === "Q4" && trailingActive && trailingPeak) {
    const currentValue = q.capital + totalPnl;
    if (currentValue <= trailingPeak * 0.89) {
      newAlarms = [...newAlarms, { message: `🚀 Q4 — TRAILING STOP ACTIVADO. Cerrar posición ahora. Valor: ${formatCurrency(currentValue)}`, time: new Date().toLocaleTimeString() }];
    }
  }

  return {
    ...prev,
    alarms: newAlarms,
    quadrants: {
      ...prev.quadrants,
      [qKey]: { ...q, trades: newTrades, trailingActive, trailingPeak },
    },
  };
});
}, []);
const handleAlarm = useCallback((qKey) => {
setState(prev => ({
...prev,
quadrants: {
...prev.quadrants,
[qKey]: { ...prev.quadrants[qKey], alarmActive: !prev.quadrants[qKey].alarmActive },
},
}));
}, []);
const handleAddAlarm = () => {
if (!alarmMsg.trim()) return;
setState(prev => ({ ...prev, alarms: [...prev.alarms, { message: alarmMsg, time: new Date().toLocaleTimeString() }] }));
setAlarmMsg("");
setShowAddAlarm(false);
};
const totalCapital = Object.values(state.quadrants).reduce((s, q) => s + q.capital, 0);
const totalPnl = Object.values(state.quadrants).reduce((s, q) => s + q.trades.reduce((ss, t) => ss + (t.pnl || 0), 0), 0);
const totalBalance = totalCapital + totalPnl;
const totalPct = (totalPnl / totalCapital) * 100;
const estNY = time.toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: "2-digit", minute: "2-digit", second: "2-digit" });
const estAR = time.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
const marketOpen = (() => {
const nyHour = parseInt(time.toLocaleString("en-US", { timeZone: "America/New_York", hour: "numeric", hour12: false }));
const nyMin = time.toLocaleString("en-US", { timeZone: "America/New_York", minute: "numeric" });
const totalMin = nyHour * 60 + parseInt(nyMin);
return totalMin >= 570 && totalMin < 960;
})();
return (
<div style={{ minHeight: "100vh", background: "#080810", color: "#fff", fontFamily: "'DM Mono', monospace" }}>
<style>{        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;600&display=swap');         * { box-sizing: border-box; }         ::-webkit-scrollbar { width: 4px; }         ::-webkit-scrollbar-track { background: #0F0F14; }         ::-webkit-scrollbar-thumb { background: #2A2A35; border-radius: 2px; }         input, textarea { outline: none; }         input:focus, textarea:focus { border-color: #555 !important; }         @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }         @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }         .fade-in { animation: fadeIn 0.4s ease forwards; }      }</style>
  <div style={{ background: "#0A0A12", borderBottom: "1px solid #1E1E2A", padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: marketOpen ? "#00FF9D" : "#555", boxShadow: marketOpen ? "0 0 8px #00FF9D" : "none" }} />
      <span style={{ fontSize: 13, fontWeight: 600, color: "#fff", letterSpacing: 1 }}>SILVESTRI TRADING</span>
      <span style={{ fontSize: 10, color: "#444", letterSpacing: 1 }}>{marketOpen ? "NYSE ABIERTO" : "NYSE CERRADO"}</span>
    </div>
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      <span style={{ fontSize: 10, color: "#444" }}>AR {estAR}</span>
      <span style={{ fontSize: 10, color: "#555" }}>NY {estNY}</span>
    </div>
  </div>

  <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 16px" }}>

    <div className="fade-in" style={{ background: "#0F0F14", border: "1px solid #1E1E2A", borderRadius: 12, padding: "20px 24px", marginBottom: 20, display: "flex", gap: 0, flexWrap: "wrap" }}>
      <div style={{ flex: "1 1 200px", borderRight: "1px solid #1E1E2A", paddingRight: 24, marginRight: 24, marginBottom: 8 }}>
        <div style={{ color: "#444", fontSize: 9, letterSpacing: 2, marginBottom: 6 }}>CAPITAL TOTAL</div>
        <div style={{ fontSize: 28, fontWeight: 600, color: "#fff" }}>{formatCurrency(totalBalance)}</div>
        <div style={{ fontSize: 11, color: totalPnl >= 0 ? "#00FF9D" : "#FF4D6D", marginTop: 4 }}>
          {formatCurrency(totalPnl)} {formatPct(totalPct)} total
        </div>
      </div>
      <div style={{ flex: "1 1 120px", paddingRight: 24, marginRight: 24, marginBottom: 8 }}>
        <div style={{ color: "#444", fontSize: 9, letterSpacing: 2, marginBottom: 6 }}>P&L HOY</div>
        <div style={{ fontSize: 20, fontWeight: 600, color: totalPnl >= 0 ? "#00FF9D" : "#FF4D6D" }}>{formatCurrency(totalPnl)}</div>
      </div>
      {Object.entries(state.quadrants).map(([k, q]) => {
        const qPnl = q.trades.reduce((s, t) => s + (t.pnl || 0), 0);
        return (
          <div key={k} style={{ flex: "1 1 80px", marginBottom: 8 }}>
            <div style={{ color: q.color + "80", fontSize: 9, letterSpacing: 2, marginBottom: 6 }}>{k}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: qPnl >= 0 ? "#00FF9D" : "#FF4D6D" }}>{formatCurrency(qPnl)}</div>
            <div style={{ fontSize: 9, color: "#444" }}>{formatPct((qPnl / q.capital) * 100)}</div>
          </div>
        );
      })}
    </div>

    {state.alarms.length > 0 && <AlarmPanel alarms={state.alarms} />}

    <div style={{ marginBottom: 20, display: "flex", gap: 8 }}>
      {showAddAlarm ? (
        <>
          <input value={alarmMsg} onChange={e => setAlarmMsg(e.target.value)} placeholder="Descripción de la alarma..." onKeyDown={e => e.key === "Enter" && handleAddAlarm()}
            style={{ flex: 1, background: "#0F0F14", border: "1px solid #333", borderRadius: 6, padding: "8px 12px", color: "#fff", fontFamily: "'DM Mono', monospace", fontSize: 12 }} />
          <button onClick={handleAddAlarm} style={{ padding: "8px 16px", background: "#FF4D6D20", border: "1px solid #FF4D6D40", borderRadius: 6, color: "#FF4D6D", fontFamily: "'DM Mono', monospace", fontSize: 11, cursor: "pointer" }}>OK</button>
          <button onClick={() => setShowAddAlarm(false)} style={{ padding: "8px 16px", background: "#1A1A24", border: "1px solid #333", borderRadius: 6, color: "#555", fontFamily: "'DM Mono', monospace", fontSize: 11, cursor: "pointer" }}>✕</button>
        </>
      ) : (
        <button onClick={() => setShowAddAlarm(true)} style={{ padding: "8px 16px", background: "#1A1A24", border: "1px solid #2A2A35", borderRadius: 6, color: "#555", fontFamily: "'DM Mono', monospace", fontSize: 11, cursor: "pointer" }}>
          + AGREGAR NOTA / ALARMA
        </button>
      )}
      {state.alarms.length > 0 && (
        <button onClick={() => setState(p => ({ ...p, alarms: [] }))} style={{ padding: "8px 16px", background: "#1A1A24", border: "1px solid #2A2A35", borderRadius: 6, color: "#555", fontFamily: "'DM Mono', monospace", fontSize: 11, cursor: "pointer" }}>
          LIMPIAR
        </button>
      )}
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
      {Object.entries(state.quadrants).map(([k, q]) => (
        <div key={k} className="fade-in">
          <QuadrantCard qKey={k} q={q} onAddTrade={handleAddTrade} onAlarm={handleAlarm} />
        </div>
      ))}
    </div>

    <div style={{ marginTop: 30, textAlign: "center", color: "#2A2A35", fontSize: 10, letterSpacing: 1 }}>
      SILVESTRI TRADING SYSTEM · {new Date().toLocaleDateString("es-AR", { dateStyle: "long" })}
    </div>
  </div>
</div>
);
}
</details>