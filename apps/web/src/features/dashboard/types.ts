import type { ModuleKey, Tier } from "../../pn/types";
import type { AppData } from "../../pn/data/model";

export type DashboardView = "personal" | "business";

export type AuditEvent = {
  at: number; // epoch ms
  actor: string; // "local:<view>" for now
  action:
    | "create_tab"
    | "rename_tab"
    | "reorder_tabs"
    | "soft_delete_tab"
    | "restore_tab"
    | "update_global_filters"
    | "create_widget"
    | "update_widget"
    | "reorder_widgets"
    | "hide_widget"
    | "show_widget"
    | "soft_delete_widget"
    | "restore_widget"
    | "select_tab";
  entityType: "tab" | "widget" | "config";
  entityId?: string;
  meta?: Record<string, unknown>;
};

export type SoftDelete = {
  deletedAt?: number;
  deletedBy?: string;
};

export type WidgetType =
  | "kpi.money.monthSpend"
  | "kpi.money.monthIncome"
  | "kpi.documents.needsApproval"
  | "kpi.bills.dueCount"
  | "list.captures.recent"
  | "calendar.summary";

export type DrilldownModal = {
  kind: "modal";
  title: string;
  message?: string;
  /** Optional primary action that navigates to an existing module. */
  primary?: { label: string; moduleKey: ModuleKey };
};

export type DrilldownTarget =
  | { kind: "route"; moduleKey: ModuleKey }
  | DrilldownModal;

export type WidgetInstance = SoftDelete & {
  id: string;
  type: WidgetType;
  title?: string;
  hidden?: boolean;
  createdAt: number;
  updatedAt: number;
  updatedBy?: string;
  config: Record<string, unknown>;
};

export type DashboardTab = SoftDelete & {
  id: string;
  name: string;
  hidden?: boolean;
  createdAt: number;
  updatedAt: number;
  updatedBy?: string;
  widgets: WidgetInstance[];
};

export type DashboardConfigV1 = {
  version: 1;
  view: DashboardView;
  /** Global filter bar state (Phase 2). Optional for backward compatibility. */
  global?: {
    rangeDays?: number; // default 30
    categoryKeys?: string[]; // empty => all
    query?: string; // free-text search (local)
  };
  selectedTabId: string;
  tabs: DashboardTab[];
  auditLog: AuditEvent[];
};

export type DashboardContext = {
  view: DashboardView;
  userTier: Tier;
  isAdmin: boolean;
  /** Global filter context (Phase 2). */
  rangeDays: number; // e.g. 30
  categoryKeys: string[]; // empty => all
  query: string; // free-text search (local)
};

export type WidgetSummaryProps = {
  data: AppData;
  ctx: DashboardContext;
  inst: WidgetInstance;
  onDrilldown: (t: DrilldownTarget) => void;
  customize: boolean;
  onUpdate: (patch: Partial<WidgetInstance>) => void;
  onSoftDelete: () => void;
  onToggleHidden: () => void;
};

export type WidgetDef = {
  type: WidgetType;
  label: string;
  description: string;
  minTier?: Tier;
  requiresAdmin?: boolean;
  icon: string;
  defaultConfig: Record<string, unknown>;
  drilldown: (args: { data: AppData; ctx: DashboardContext; inst: WidgetInstance }) => DrilldownTarget;
  Summary: (props: WidgetSummaryProps) => JSX.Element;
};

