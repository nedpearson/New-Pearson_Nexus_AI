import { z } from "zod";

// Keep schemas in one place so they can be unit-tested.

export const WidgetTypeSchema = z.enum([
  "kpi.money.monthSpend",
  "kpi.money.monthIncome",
  "kpi.documents.needsApproval",
  "kpi.bills.dueCount",
  "list.captures.recent",
  "calendar.summary",
]);

export const WidgetInstanceSchema = z.object({
  id: z.string().min(1),
  type: WidgetTypeSchema,
  title: z.string().optional(),
  hidden: z.boolean().optional(),
  createdAt: z.number().nonnegative(),
  updatedAt: z.number().nonnegative(),
  updatedBy: z.string().optional(),
  deletedAt: z.number().nonnegative().optional(),
  deletedBy: z.string().optional(),
  // Keep flexible; per-widget UIs validate their config shape.
  config: z.any(),
});

export const DashboardTabSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  hidden: z.boolean().optional(),
  createdAt: z.number().nonnegative(),
  updatedAt: z.number().nonnegative(),
  updatedBy: z.string().optional(),
  deletedAt: z.number().nonnegative().optional(),
  deletedBy: z.string().optional(),
  widgets: z.array(WidgetInstanceSchema),
});

export const AuditEventSchema = z.object({
  at: z.number().nonnegative(),
  actor: z.string().min(1),
  action: z.enum([
    "create_tab",
    "rename_tab",
    "reorder_tabs",
    "soft_delete_tab",
    "restore_tab",
    "update_global_filters",
    "create_widget",
    "update_widget",
    "reorder_widgets",
    "hide_widget",
    "show_widget",
    "soft_delete_widget",
    "restore_widget",
    "select_tab",
  ]),
  entityType: z.enum(["tab", "widget", "config"]),
  entityId: z.string().optional(),
  meta: z.any().optional(),
});

export const DashboardConfigV1Schema = z.object({
  version: z.literal(1),
  view: z.enum(["personal", "business"]),
  global: z.object({
    rangeDays: z.number().min(1).max(365).optional(),
    categoryKeys: z.array(z.string().min(1)).optional(),
    query: z.string().optional(),
  }).optional(),
  selectedTabId: z.string().min(1),
  tabs: z.array(DashboardTabSchema),
  auditLog: z.array(AuditEventSchema),
});

export type DashboardConfigV1Parsed = z.infer<typeof DashboardConfigV1Schema>;

