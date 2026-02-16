/**
 * Hook manager for managing application lifecycle hooks
 */

import type { HookDefinition, HookContext } from "./types";

class HookManager {
  private hooks: Map<string, HookDefinition> = new Map();
  private executed = false;

  /**
   * Register a SessionStart hook
   */
  registerSessionStart(definition: HookDefinition): void {
    if (this.executed) {
      console.warn(`[HookManager] SessionStart hook "${definition.id}" registered after execution. It will not run.`);
    }
    this.hooks.set(definition.id, {
      ...definition,
      priority: definition.priority ?? 100,
    });
  }

  /**
   * Unregister a hook by ID
   */
  unregister(id: string): boolean {
    return this.hooks.delete(id);
  }

  /**
   * Get all registered hooks sorted by priority
   */
  private getSortedHooks(): HookDefinition[] {
    return Array.from(this.hooks.values()).sort((a, b) => {
      const priorityA = a.priority ?? 100;
      const priorityB = b.priority ?? 100;
      return priorityA - priorityB;
    });
  }

  /**
   * Execute all SessionStart hooks
   */
  async executeSessionStart(): Promise<void> {
    if (this.executed) {
      console.warn("[HookManager] SessionStart hooks already executed. Skipping.");
      return;
    }

    this.executed = true;

    const context: HookContext = {
      timestamp: Date.now(),
      environment: import.meta.env.MODE === "test" ? "test" : import.meta.env.MODE === "production" ? "production" : "development",
    };

    const sortedHooks = this.getSortedHooks();

    console.log(`[HookManager] Executing ${sortedHooks.length} SessionStart hook(s)`);

    for (const definition of sortedHooks) {
      try {
        console.log(`[HookManager] Running hook: ${definition.name} (id: ${definition.id})`);
        await definition.hook(context);
      } catch (error) {
        console.error(`[HookManager] Error in hook "${definition.name}" (id: ${definition.id}):`, error);
        // Continue executing other hooks even if one fails
      }
    }

    console.log("[HookManager] SessionStart hooks completed");
  }

  /**
   * Reset execution state (useful for testing)
   */
  reset(): void {
    this.hooks.clear();
    this.executed = false;
  }

  /**
   * Get the count of registered hooks
   */
  getHookCount(): number {
    return this.hooks.size;
  }

  /**
   * Check if hooks have been executed
   */
  hasExecuted(): boolean {
    return this.executed;
  }
}

// Singleton instance
export const hookManager = new HookManager();
