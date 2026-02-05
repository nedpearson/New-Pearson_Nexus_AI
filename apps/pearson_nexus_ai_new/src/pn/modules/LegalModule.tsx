import React, { useState } from "react";
import { AppData } from "../data/model";
import { Button, Card, Pill } from "../components/kit";

function id(prefix: string) { return prefix + "_" + Math.random().toString(16).slice(2, 10); }

export function LegalModule(props: { data: AppData; setData: (n: AppData) => void }) {
  const [active, setActive] = useState<string>(props.data.legal.threads[0]?.id ?? "");
  const thread = props.data.legal.threads.find(t => t.id === active);

  function addThread(type: "personal"|"divorce"|"custody"|"other") {
    const t = { id: id("t"), type, title: type === "divorce" ? "Divorce thread" : type === "custody" ? "Custody thread" : type === "personal" ? "Personal legal" : "Other legal", notes: [], tasks: [] };
    props.setData({ ...props.data, legal: { ...props.data.legal, threads: [t, ...props.data.legal.threads] } });
    setActive(t.id);
  }

  function addNote(text: string) {
    if (!thread) return;
    const n = { id: id("n"), createdAt: Date.now(), text };
    props.setData({
      ...props.data,
      legal: { ...props.data.legal, threads: props.data.legal.threads.map(t => t.id === thread.id ? { ...t, notes: [n, ...t.notes] } : t) }
    });
  }

  function addTask(title: string) {
    if (!thread) return;
    const k = { id: id("k"), title, done: false };
    props.setData({
      ...props.data,
      legal: { ...props.data.legal, threads: props.data.legal.threads.map(t => t.id === thread.id ? { ...t, tasks: [k, ...t.tasks] } : t) }
    });
  }

  function toggleTask(taskId: string) {
    if (!thread) return;
    props.setData({
      ...props.data,
      legal: { ...props.data.legal, threads: props.data.legal.threads.map(t => {
        if (t.id !== thread.id) return t;
        return { ...t, tasks: t.tasks.map(k => k.id === taskId ? { ...k, done: !k.done } : k) };
      })}
    });
  }

  const [noteText, setNoteText] = useState("");
  const [taskText, setTaskText] = useState("");

  return (
    <div className="pn-split">
      <Card title="Legal areas" subtitle="Divorce / Custody / Personal — organized and easy." right={<Pill>Prototype</Pill>}>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom: 10 }}>
          <Button onClick={() => addThread("personal")}>+ Personal</Button>
          <Button onClick={() => addThread("divorce")} variant="primary">+ Divorce</Button>
          <Button onClick={() => addThread("custody")}>+ Custody</Button>
          <Button onClick={() => addThread("other")}>+ Other</Button>
        </div>

        <div className="pn-list">
          {props.data.legal.threads.map(t => (
            <button
              key={t.id}
              className={["pn-navBtn", t.id === active ? "pn-navBtnActive" : ""].join(" ")}
              onClick={() => setActive(t.id)}
              type="button"
            >
              <div style={{ fontWeight: 900 }}>{t.title}</div>
              <div className="pn-small pn-muted">
                {t.type.toUpperCase()} • {t.tasks.filter(x => !x.done).length} open • {t.notes.length} notes
              </div>
            </button>
          ))}
        </div>
      </Card>

      <Card title={thread ? thread.title : "Select a thread"} subtitle={thread ? "Notes + tasks stay together." : "Pick something on the left."}>
        {!thread ? null : (
          <div className="pn-layout" style={{ gridTemplateColumns: "repeat(2, minmax(0,1fr))" }}>
            <div className="pn-item">
              <div className="pn-h2">Notes</div>
              <div style={{ display:"flex", gap:8, marginTop: 10 }}>
                <input className="pn-input" value={noteText} onChange={(e)=>setNoteText(e.target.value)} placeholder="Write a note..." />
                <Button variant="primary" onClick={() => { const v = noteText.trim(); if (!v) return; addNote(v); setNoteText(""); }}>Add</Button>
              </div>
              <div className="pn-list" style={{ marginTop: 10 }}>
                {thread.notes.map(n => (
                  <div key={n.id} className="pn-item" style={{ background:"rgba(0,0,0,.18)" }}>
                    <div className="pn-small pn-muted">{new Date(n.createdAt).toLocaleString()}</div>
                    <div style={{ marginTop: 6, color:"rgba(238,242,255,.82)" }}>{n.text}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pn-item">
              <div className="pn-h2">Tasks</div>
              <div style={{ display:"flex", gap:8, marginTop: 10 }}>
                <input className="pn-input" value={taskText} onChange={(e)=>setTaskText(e.target.value)} placeholder="Add a task..." />
                <Button variant="primary" onClick={() => { const v = taskText.trim(); if (!v) return; addTask(v); setTaskText(""); }}>Add</Button>
              </div>
              <div className="pn-list" style={{ marginTop: 10 }}>
                {thread.tasks.map(k => (
                  <button key={k.id} className="pn-navBtn pn-navBtnActive" onClick={() => toggleTask(k.id)} type="button" style={{ background:"rgba(0,0,0,.18)" }}>
                    <div className="pn-row">
                      <div style={{ fontWeight: 850, textDecoration: k.done ? "line-through" : "none", opacity: k.done ? .6 : 1 }}>{k.title}</div>
                      <span className="pn-badge">{k.done ? "done" : "open"}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
