export type CrashInfo = { title: string; detail: string };

function detailFromUnknown(x: unknown): string {
  if (x && typeof x === "object") {
    const maybe = x as { stack?: unknown; message?: unknown };
    if (typeof maybe.stack === "string" && maybe.stack.trim()) return maybe.stack;
    if (typeof maybe.message === "string" && maybe.message.trim()) return maybe.message;
  }
  return String(x);
}

export function installGlobalCrashHandlers(push: (c: CrashInfo) => void) {
  window.addEventListener("error", (e: ErrorEvent) => {
    push({ title: "window.error", detail: detailFromUnknown(e.error ?? e.message) });
  });
  window.addEventListener("unhandledrejection", (e: PromiseRejectionEvent) => {
    push({ title: "unhandledrejection", detail: detailFromUnknown(e.reason) });
  });
}
