import React from "react";

function MoneyCard(props: { title: string; emoji: string; hint: string }) {
  return (
    <div className="tile" style={{ minHeight: 130 }}>
      <div className="pill"><span style={{ fontSize: 16 }}>{props.emoji}</span>{props.title}</div>
      <div className="muted" style={{ marginTop: 10 }}>{props.hint}</div>
      <div style={{ display:"flex", gap: 10, marginTop: 12, flexWrap:"wrap" }}>
        <button className="btn btnPrimary" type="button">Add</button>
        <button className="btn" type="button">Link Site</button>
      </div>
    </div>
  );
}

export default function Finances() {
  return (
    <div>
      <div className="glass cardPad">
        <div className="h1">Finances</div>
        <div className="muted" style={{ marginTop: 10 }}>
          Bills, subscriptions, receipts—plus links to the websites where you pay.
        </div>
        <div style={{ display:"flex", gap: 10, marginTop: 14, flexWrap:"wrap" }}>
          <span className="badge">Payment Links</span>
          <span className="badge">Recurring</span>
          <span className="badge">Export-ready</span>
        </div>
      </div>

      <div className="section grid3">
        <MoneyCard emoji="💡" title="Utilities" hint="Add bills + direct pay links" />
        <MoneyCard emoji="🏠" title="Housing" hint="Rent/mortgage + docs" />
        <MoneyCard emoji="📱" title="Phone/Internet" hint="Keep plans and receipts together" />
        <MoneyCard emoji="🚗" title="Auto" hint="Insurance, repairs, payments" />
        <MoneyCard emoji="🧾" title="Receipts" hint="Snap + categorize instantly" />
        <MoneyCard emoji="🔁" title="Subscriptions" hint="Track, cancel, and renew" />
      </div>
    </div>
  );
}
