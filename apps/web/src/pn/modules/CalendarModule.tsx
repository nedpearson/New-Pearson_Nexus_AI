import React, { useMemo, useState } from "react";
import type { AppData } from "../data/model";
import type { ModuleKey } from "../types";
import { Button, Card, Pill } from "../components/kit";

type CalKind = "bill" | "expense" | "income" | "capture" | "legal";

type CalEvent = {
  id: string;
  date: string; // yyyy-mm-dd
  ts?: number;
  kind: CalKind;
  title: string;
  sub?: string;
  goTo: ModuleKey;
};

function pad2(n: number) { return String(n).padStart(2, "0"); }
function isoDayFromTs(ts: number) {
  try { return new Date(ts).toISOString().slice(0, 10); } catch { return ""; }
}
function isoDayFromYmd(y: number, m0: number, d: number) {
  return `${y}-${pad2(m0 + 1)}-${pad2(d)}`;
}
function monthLabel(y: number, m0: number) {
  const dt = new Date(Date.UTC(y, m0, 1));
  return dt.toLocaleString(undefined, { month: "long", year: "numeric" });
}
function daysInMonth(y: number, m0: number) {
  return new Date(y, m0 + 1, 0).getDate();
}
function startDow(y: number, m0: number) {
  return new Date(y, m0, 1).getDay(); // 0=Sun
}
function money(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}
function kindIcon(k: CalKind) {
  return k === "bill" ? "🧾"
    : k === "expense" ? "💳"
      : k === "income" ? "💰"
        : k === "capture" ? "📸"
          : "⚖️";
}

export function CalendarModule(props: { data: AppData; go: (k: ModuleKey) => void }) {
  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const today = useMemo(() => ({ y: Number(todayIso.slice(0, 4)), m0: Number(todayIso.slice(5, 7)) - 1, d: Number(todayIso.slice(8, 10)) }), [todayIso]);

  const [y, setY] = useState(today.y);
  const [m0, setM0] = useState(today.m0);
  const [selectedIso, setSelectedIso] = useState<string>(todayIso);

  const monthDays = useMemo(() => daysInMonth(y, m0), [y, m0]);
  const offset = useMemo(() => startDow(y, m0), [y, m0]);

  const events = useMemo((): CalEvent[] => {
    const out: CalEvent[] = [];

    // Bills: recurring monthly by dueDay for the visible month.
    for (const b of props.data.bills) {
      if (!b?.dueDay) continue;
      if (b.dueDay < 1 || b.dueDay > monthDays) continue;
      const date = isoDayFromYmd(y, m0, b.dueDay);
      out.push({
        id: `bill_${b.id}_${date}`,
        date,
        kind: "bill",
        title: `${b.name}`,
        sub: `${money(b.amount)} • due day ${b.dueDay}${b.autopay ? " • autopay" : ""}`,
        goTo: "finances",
      });
    }

    // Expenses: fixed dates (yyyy-mm-dd).
    for (const e of props.data.expenses) {
      if (!e?.date) continue;
      if (!e.date.startsWith(`${y}-${pad2(m0 + 1)}`)) continue;
      out.push({
        id: `exp_${e.id}`,
        date: e.date,
        kind: "expense",
        title: `${e.vendor}`,
        sub: `${money(e.amount)} • ${e.category}`,
        goTo: "finances",
      });
    }

    // Income: optional.
    for (const i of (props.data.income || [])) {
      if (!i?.date) continue;
      if (!i.date.startsWith(`${y}-${pad2(m0 + 1)}`)) continue;
      out.push({
        id: `inc_${i.id}`,
        date: i.date,
        kind: "income",
        title: `${i.source}`,
        sub: `${money(i.amount)} • ${i.category}`,
        goTo: "finances",
      });
    }

    // Captures: timestamps.
    for (const c of props.data.library) {
      const date = isoDayFromTs(c.createdAt);
      if (!date.startsWith(`${y}-${pad2(m0 + 1)}`)) continue;
      out.push({
        id: `cap_${c.id}`,
        date,
        ts: c.createdAt,
        kind: "capture",
        title: c.title || "Capture",
        sub: c.approvedCategory ? `✅ ${c.approvedCategory}` : `⏳ needs approval • ${c.kind}`,
        goTo: "documents",
      });
    }

    // Legal notes: timestamps.
    for (const t of props.data.legal.threads) {
      for (const n of t.notes) {
        const date = isoDayFromTs(n.createdAt);
        if (!date.startsWith(`${y}-${pad2(m0 + 1)}`)) continue;
        out.push({
          id: `legal_${t.id}_${n.id}`,
          date,
          ts: n.createdAt,
          kind: "legal",
          title: t.title,
          sub: n.text.slice(0, 90) + (n.text.length > 90 ? "…" : ""),
          goTo: "legal",
        });
      }
    }

    // Sort by date then time.
    out.sort((a, b) => (a.date.localeCompare(b.date)) || ((a.ts || 0) - (b.ts || 0)));
    return out;
  }, [props.data.bills, props.data.expenses, props.data.income, props.data.library, props.data.legal.threads, y, m0, monthDays]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalEvent[]>();
    for (const e of events) {
      const arr = map.get(e.date) || [];
      arr.push(e);
      map.set(e.date, arr);
    }
    return map;
  }, [events]);

  const agenda = useMemo(() => eventsByDay.get(selectedIso) || [], [eventsByDay, selectedIso]);

  const undatedLegalTasks = useMemo(() => {
    const out: { threadTitle: string; id: string; title: string; done: boolean }[] = [];
    for (const t of props.data.legal.threads) {
      for (const k of t.tasks) out.push({ threadTitle: t.title, id: k.id, title: k.title, done: k.done });
    }
    return out;
  }, [props.data.legal.threads]);

  function prevMonth() {
    const d = new Date(y, m0 - 1, 1);
    setY(d.getFullYear());
    setM0(d.getMonth());
    setSelectedIso(isoDayFromYmd(d.getFullYear(), d.getMonth(), 1));
  }

  function nextMonth() {
    const d = new Date(y, m0 + 1, 1);
    setY(d.getFullYear());
    setM0(d.getMonth());
    setSelectedIso(isoDayFromYmd(d.getFullYear(), d.getMonth(), 1));
  }

  return (
    <div className="pn-split">
      <Card
        title="Calendar"
        subtitle="Bills, money activity, captures, and legal notes — in one timeline."
        right={<Pill>{events.length} items</Pill>}
      >
        <div className="pn-row" style={{ marginBottom: 10 }}>
          <div style={{ fontWeight: 950 }}>{monthLabel(y, m0)}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Button variant="ghost" onClick={prevMonth} title="Previous month">←</Button>
            <Button variant="ghost" onClick={nextMonth} title="Next month">→</Button>
            <Button onClick={() => { setY(today.y); setM0(today.m0); setSelectedIso(todayIso); }} title="Jump to today">Today</Button>
          </div>
        </div>

        <div className="pn-small pn-muted" style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 6, marginBottom: 6, fontWeight: 900 }}>
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => <div key={d} style={{ textAlign: "center" }}>{d}</div>)}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 6 }}>
          {Array.from({ length: offset }).map((_, i) => <div key={`pad_${i}`} />)}
          {Array.from({ length: monthDays }).map((_, i) => {
            const day = i + 1;
            const iso = isoDayFromYmd(y, m0, day);
            const list = eventsByDay.get(iso) || [];
            const selected = selectedIso === iso;
            const isToday = iso === todayIso;
            const dot = (k: CalKind) =>
              k === "bill" ? "rgba(244,164,77,.55)"
                : k === "expense" ? "rgba(244,164,77,.55)"
                  : k === "income" ? "rgba(34,211,238,.55)"
                    : k === "capture" ? "rgba(59,130,246,.55)"
                      : "rgba(251,113,133,.55)";
            const kinds = Array.from(new Set(list.map((e) => e.kind))).slice(0, 4);
            return (
              <button
                key={iso}
                type="button"
                onClick={() => setSelectedIso(iso)}
                aria-label={`Select ${iso}`}
                title={iso}
                style={{
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,.12)",
                  background: selected ? "rgba(255,255,255,.10)" : "rgba(255,255,255,.04)",
                  minHeight: 54,
                  padding: 8,
                  cursor: "pointer",
                  position: "relative",
                  outline: isToday ? "2px solid rgba(34,211,238,.35)" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontWeight: 950 }}>{day}</div>
                  {list.length > 0 && <span className="pn-badge">{list.length}</span>}
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  {kinds.map((k) => (
                    <span key={k} style={{ width: 8, height: 8, borderRadius: 999, background: dot(k) }} />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      <Card
        title={selectedIso === todayIso ? "Today" : selectedIso}
        subtitle={agenda.length ? "Agenda (tap to open)" : "No items for this day"}
        right={<Pill>{agenda.length}</Pill>}
      >
        {!!agenda.length && (
          <div className="pn-list">
            {agenda.map((e) => (
              <button
                key={e.id}
                type="button"
                className="pn-navBtn pn-navBtnActive"
                onClick={() => props.go(e.goTo)}
                aria-label={`Open ${e.kind} item`}
                title={`Open in ${e.goTo}`}
                style={{ background: "rgba(0,0,0,.18)" }}
              >
                <div className="pn-row">
                  <div>
                    <div style={{ fontWeight: 900 }}>{kindIcon(e.kind)} {e.title}</div>
                    <div className="pn-small pn-muted">
                      {e.sub || ""}
                      {e.ts ? ` • ${new Date(e.ts).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}` : ""}
                    </div>
                  </div>
                  <span className="pn-badge">Open</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {!!undatedLegalTasks.length && (
          <div style={{ marginTop: 12 }}>
            <div className="pn-small pn-muted" style={{ fontWeight: 900, marginBottom: 8 }}>Legal tasks (undated)</div>
            <div className="pn-list">
              {undatedLegalTasks.slice(0, 6).map((k) => (
                <button
                  key={k.id}
                  type="button"
                  className="pn-navBtn"
                  onClick={() => props.go("legal")}
                  aria-label="Open legal tasks"
                  title="Open Legal"
                  style={{ background: "rgba(255,255,255,.05)" }}
                >
                  <div style={{ fontWeight: 900, opacity: k.done ? 0.6 : 1, textDecoration: k.done ? "line-through" : "none" }}>
                    ⚖️ {k.title}
                  </div>
                  <div className="pn-small pn-muted">{k.threadTitle}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

