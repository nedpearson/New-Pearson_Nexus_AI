import React from "react";
import { Card, Button } from "../../pn/components/kit";

export function PlaceholderModule(props: { title: string; subtitle: string; ctaLabel?: string; onCta?: () => void }) {
  return (
    <div className="pn-col">
      <Card title={props.title} subtitle={props.subtitle}>
        <div className="pn-small pn-muted">
          This is a lightweight placeholder so the Business tabs exist while we wire in full drill‑downs.
        </div>
        {props.ctaLabel && props.onCta && (
          <div style={{ marginTop: 12 }}>
            <Button variant="primary" onClick={props.onCta}>{props.ctaLabel}</Button>
          </div>
        )}
      </Card>
    </div>
  );
}

