import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ paddingLeft: 104, paddingRight: 18, paddingTop: 18, paddingBottom: 26 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
