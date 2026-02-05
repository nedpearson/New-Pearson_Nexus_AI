export type Route =
  | "/"
  | "/capture"
  | "/documents"
  | "/finances"
  | "/legal"
  | "/admin";

export type NavItem = {
  route: Route;
  label: string;
  icon: string;
  hint: string;
  orb: "blue"|"amber"|"lime";
};

export const NAV: NavItem[] = [
  { route: "/",          label: "Dashboard", icon: "🏠", hint: "Your day at a glance", orb:"blue" },
  { route: "/capture",   label: "Capture",   icon: "📸", hint: "Photo / video / voice", orb:"lime" },
  { route: "/documents", label: "Documents", icon: "📄", hint: "Organize & approve", orb:"blue" },
  { route: "/finances",  label: "Finances",  icon: "💳", hint: "Bills & expenses", orb:"amber" },
  { route: "/legal",     label: "Legal",     icon: "⚖️", hint: "Notes & case builder", orb:"pink" as any },
  { route: "/admin",     label: "Admin",     icon: "🧠", hint: "Categories & settings", orb:"amber" }
];
