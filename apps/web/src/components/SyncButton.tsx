import React, { useEffect, useState } from "react";
import { Button, Pill } from "../pn/components/kit";
import { getSyncToken, isOnline, queuedCount, syncQueuedCaptures } from "../offline/queue";

export function SyncButton(props: { endpoint?: string; compact?: boolean }) {
  const [count, setCount] = useState(0);
  const [online, setOnline] = useState<boolean>(() => isOnline());
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [, setAuthTick] = useState(0);

  // Prototype auth: token set in localStorage enables sync.
  const authed = Boolean(getSyncToken());

  useEffect(() => {
    let alive = true;
    const refresh = async () => {
      const n = await queuedCount().catch(() => 0);
      if (alive) setCount(n);
    };
    refresh();
    const onChanged = () => { refresh(); };
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    const onAuth = () => setAuthTick((n) => n + 1);
    window.addEventListener("pnx-queue-changed", onChanged);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener("pnx-auth-changed", onAuth);
    return () => {
      alive = false;
      window.removeEventListener("pnx-queue-changed", onChanged);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("pnx-auth-changed", onAuth);
    };
  }, []);

  const disabledReason =
    !online ? "Offline"
      : !authed ? "Not authenticated"
        : busy ? "Syncing"
          : count === 0 ? "Nothing to sync"
            : "";

  async function doSync() {
    if (disabledReason) return;
    setBusy(true);
    setStatus("");
    try {
      const r = await syncQueuedCaptures({ endpoint: props.endpoint });
      setStatus(r.ok ? `Synced ${r.synced}` : `Failed (${r.failed})`);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  const label = props.compact ? `Sync (${count})` : `Sync now (${count} pending)`;

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <Button
        variant="primary"
        onClick={doSync}
        disabled={Boolean(disabledReason)}
        title={disabledReason || "Sync queued offline captures"}
      >
        {busy ? "Syncing…" : label}
      </Button>
      {!online && <Pill>Offline</Pill>}
      {!authed && <Pill>Auth required</Pill>}
      {!!status && <span className="pn-small pn-muted">{status}</span>}
    </div>
  );
}

