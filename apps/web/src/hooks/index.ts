/**
 * Application hooks system
 * 
 * This module provides a hook system for executing code at application startup.
 * 
 * Usage:
 * ```typescript
 * import { registerSessionStartHook } from '@/hooks';
 * 
 * registerSessionStartHook({
 *   id: 'my-init-hook',
 *   name: 'My Initialization Hook',
 *   priority: 50, // Optional: lower numbers run first
 *   hook: async (context) => {
 *     console.log('Initializing at', context.timestamp);
 *     // Your initialization code here
 *   }
 * });
 * ```
 */

export * from "./types";
export { hookManager } from "./hookManager";

import { hookManager } from "./hookManager";
import type { HookDefinition } from "./types";

/**
 * Register a SessionStart hook
 * 
 * @param definition - The hook definition
 */
export function registerSessionStartHook(definition: HookDefinition): void {
  hookManager.registerSessionStart(definition);
}

/**
 * Unregister a hook by ID
 * 
 * @param id - The hook ID to unregister
 * @returns true if the hook was found and removed
 */
export function unregisterHook(id: string): boolean {
  return hookManager.unregister(id);
}
