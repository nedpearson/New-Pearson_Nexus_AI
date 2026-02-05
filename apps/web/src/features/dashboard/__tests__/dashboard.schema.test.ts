import { describe, expect, it } from "vitest";
import { DashboardConfigV1Schema } from "../schema";
import { defaultDashboard, loadDashboard, saveDashboard, type StorageLike } from "../storage";

class MemoryStorage implements StorageLike {
  private map = new Map<string, string>();
  getItem(k: string) { return this.map.get(k) ?? null; }
  setItem(k: string, v: string) { this.map.set(k, v); }
  removeItem(k: string) { this.map.delete(k); }
}

describe("dashboard schema + load/save", () => {
  it("defaultDashboard produces a valid config", () => {
    const cfg = defaultDashboard("personal");
    const parsed = DashboardConfigV1Schema.safeParse(cfg);
    expect(parsed.success).toBe(true);
    expect(cfg.view).toBe("personal");
    expect(cfg.version).toBe(1);
    expect(cfg.tabs.length).toBeGreaterThan(0);
  });

  it("loadDashboard falls back when stored value is invalid", () => {
    const s = new MemoryStorage();
    s.setItem("pnx.dashboard.v1.personal", "{not_json");
    const cfg = loadDashboard("personal", s);
    expect(cfg.view).toBe("personal");
    expect(cfg.tabs.length).toBeGreaterThan(0);
  });

  it("saveDashboard + loadDashboard roundtrips valid configs", () => {
    const s = new MemoryStorage();
    const a = defaultDashboard("business");
    saveDashboard("business", a, s);
    const b = loadDashboard("business", s);
    expect(b.view).toBe("business");
    expect(b.selectedTabId).toBe(a.selectedTabId);
    expect(b.tabs.length).toBe(a.tabs.length);
  });
});

