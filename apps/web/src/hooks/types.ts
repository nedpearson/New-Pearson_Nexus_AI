/**
 * Hook types for the application lifecycle
 */

export type HookContext = {
  timestamp: number;
  environment: "development" | "production" | "test";
};

export type SessionStartHook = (context: HookContext) => void | Promise<void>;

export type HookDefinition = {
  id: string;
  name: string;
  priority?: number; // Lower numbers run first (default: 100)
  hook: SessionStartHook;
};
