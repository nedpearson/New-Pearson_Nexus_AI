import React from "react";
import { Card, Button } from "../../pn/components/kit";

const LINKS: { label: string; href: string; hint: string }[] = [
  { label: "Install on Phone", href: "/INSTALL_ON_PHONE_GUIDE.md", hint: "iOS/Android Home Screen install steps" },
  { label: "PWA Deployment Guide", href: "/PWA_DEPLOYMENT_GUIDE.md", hint: "Deploy + PWA notes" },
  { label: "Mobile App Guide", href: "/MOBILE_APP_GUIDE.md", hint: "Mobile UX + troubleshooting" },
  { label: "Financial + Legal Guide", href: "/FINANCIAL_LEGAL_GUIDE.md", hint: "Deep dive guide content" }
];

export function GuidesModule() {
  return (
    <div className="pn-col">
      <Card title="Guides" subtitle="Drill‑down docs (served as static files).">
        <div className="pn-small pn-muted">
          These open as plain files in the browser. Next step is an in‑app viewer with categories + search.
        </div>
        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          {LINKS.map((l) => (
            <div key={l.href} className="pn-item">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontWeight: 900 }}>{l.label}</div>
                  <div className="pn-small pn-muted">{l.hint}</div>
                </div>
                <Button onClick={() => window.open(l.href, "_blank")} variant="primary">Open</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

