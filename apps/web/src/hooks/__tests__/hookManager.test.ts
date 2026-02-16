/**
 * Tests for the hook manager
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { hookManager } from "../hookManager";
import type { HookDefinition, HookContext } from "../types";

describe("HookManager", () => {
  beforeEach(() => {
    hookManager.reset();
  });

  it("should register a SessionStart hook", () => {
    const hook: HookDefinition = {
      id: "test-hook",
      name: "Test Hook",
      hook: () => {},
    };

    hookManager.registerSessionStart(hook);
    expect(hookManager.getHookCount()).toBe(1);
  });

  it("should execute SessionStart hooks in priority order", async () => {
    const executionOrder: string[] = [];

    hookManager.registerSessionStart({
      id: "hook-3",
      name: "Hook 3",
      priority: 30,
      hook: () => executionOrder.push("hook-3"),
    });

    hookManager.registerSessionStart({
      id: "hook-1",
      name: "Hook 1",
      priority: 10,
      hook: () => executionOrder.push("hook-1"),
    });

    hookManager.registerSessionStart({
      id: "hook-2",
      name: "Hook 2",
      priority: 20,
      hook: () => executionOrder.push("hook-2"),
    });

    await hookManager.executeSessionStart();

    expect(executionOrder).toEqual(["hook-1", "hook-2", "hook-3"]);
  });

  it("should use default priority of 100 if not specified", async () => {
    const executionOrder: string[] = [];

    hookManager.registerSessionStart({
      id: "hook-no-priority",
      name: "Hook No Priority",
      hook: () => executionOrder.push("no-priority"),
    });

    hookManager.registerSessionStart({
      id: "hook-high-priority",
      name: "Hook High Priority",
      priority: 50,
      hook: () => executionOrder.push("high-priority"),
    });

    await hookManager.executeSessionStart();

    expect(executionOrder).toEqual(["high-priority", "no-priority"]);
  });

  it("should provide context to hooks", async () => {
    let capturedContext: HookContext | null = null;

    hookManager.registerSessionStart({
      id: "context-test",
      name: "Context Test",
      hook: (context) => {
        capturedContext = context;
      },
    });

    await hookManager.executeSessionStart();

    expect(capturedContext).not.toBeNull();
    expect(capturedContext?.timestamp).toBeGreaterThan(0);
    expect(capturedContext?.environment).toMatch(/^(development|production|test)$/);
  });

  it("should handle async hooks", async () => {
    let completed = false;

    hookManager.registerSessionStart({
      id: "async-hook",
      name: "Async Hook",
      hook: async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        completed = true;
      },
    });

    await hookManager.executeSessionStart();

    expect(completed).toBe(true);
  });

  it("should continue executing hooks if one fails", async () => {
    const executionOrder: string[] = [];
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    hookManager.registerSessionStart({
      id: "hook-1",
      name: "Hook 1",
      priority: 10,
      hook: () => executionOrder.push("hook-1"),
    });

    hookManager.registerSessionStart({
      id: "hook-2-fails",
      name: "Hook 2 Fails",
      priority: 20,
      hook: () => {
        executionOrder.push("hook-2");
        throw new Error("Hook 2 failed");
      },
    });

    hookManager.registerSessionStart({
      id: "hook-3",
      name: "Hook 3",
      priority: 30,
      hook: () => executionOrder.push("hook-3"),
    });

    await hookManager.executeSessionStart();

    expect(executionOrder).toEqual(["hook-1", "hook-2", "hook-3"]);
    expect(consoleError).toHaveBeenCalled();

    consoleError.mockRestore();
  });

  it("should only execute hooks once", async () => {
    let executionCount = 0;

    hookManager.registerSessionStart({
      id: "test-hook",
      name: "Test Hook",
      hook: () => {
        executionCount++;
      },
    });

    await hookManager.executeSessionStart();
    await hookManager.executeSessionStart();

    expect(executionCount).toBe(1);
    expect(hookManager.hasExecuted()).toBe(true);
  });

  it("should unregister a hook", () => {
    hookManager.registerSessionStart({
      id: "test-hook",
      name: "Test Hook",
      hook: () => {},
    });

    expect(hookManager.getHookCount()).toBe(1);

    const removed = hookManager.unregister("test-hook");
    expect(removed).toBe(true);
    expect(hookManager.getHookCount()).toBe(0);
  });

  it("should return false when unregistering non-existent hook", () => {
    const removed = hookManager.unregister("non-existent");
    expect(removed).toBe(false);
  });

  it("should warn when registering after execution", async () => {
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

    await hookManager.executeSessionStart();

    hookManager.registerSessionStart({
      id: "late-hook",
      name: "Late Hook",
      hook: () => {},
    });

    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining("registered after execution")
    );

    consoleWarn.mockRestore();
  });

  it("should reset state", async () => {
    hookManager.registerSessionStart({
      id: "test-hook",
      name: "Test Hook",
      hook: () => {},
    });

    await hookManager.executeSessionStart();

    expect(hookManager.hasExecuted()).toBe(true);
    expect(hookManager.getHookCount()).toBe(1);

    hookManager.reset();

    expect(hookManager.hasExecuted()).toBe(false);
    expect(hookManager.getHookCount()).toBe(0);
  });
});
