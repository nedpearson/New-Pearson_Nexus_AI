import React from "react";
import { NAV, Route } from "@/components/layout/nav";

function go(route: Route) {
  window.history.pushState({}, "", route);
  window.dispatchEvent(new Event("popstate"));
}

export function BottomNav({ current }: { current: string }) {
  return (
    <div className="bottomNav glass">
      {NAV.slice(0,5).map(n => {
        const active = current === n.route;
        return (
          <button key={n.route} className={"bnavBtn " + (active ? "active" : "")} type="button" onClick={() => go(n.route)}>
            <div style={{ fontSize:18, lineHeight:"18px" }}>{n.icon}</div>
            <div>{n.label}</div>
          </button>
        );
      })}
    </div>
  );
}
