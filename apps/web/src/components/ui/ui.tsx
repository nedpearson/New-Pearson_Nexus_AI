import React from "react";

export function IconBadge({ icon }: { icon: string }) {
  return <div className="kpiBox">{icon}</div>;
}

export function fmtDate(ts: number) {
  const d = new Date(ts);
  return d.toLocaleString(undefined, { month:"short", day:"numeric", hour:"numeric", minute:"2-digit" });
}

export function bytes(n?: number) {
  if (!n) return "";
  const u = ["B","KB","MB","GB"];
  let i = 0; let v = n;
  while (v >= 1024 && i < u.length-1) { v/=1024; i++; }
  return `${v.toFixed(i===0?0:1)} ${u[i]}`;
}
