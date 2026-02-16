# SessionStart Hook System

This module provides a lightweight, extensible hook system for executing initialization code when the application starts.

## Overview

The SessionStart hook system allows you to register functions that run once during application startup, in a controlled and predictable manner. This is useful for:

- Initializing third-party libraries
- Setting up analytics or monitoring
- Validating the runtime environment
- Loading configuration or feature flags
- Performing health checks
- Logging startup information

## Features

- **Priority-based execution**: Hooks run in order based on their priority (lower numbers first)
- **Async support**: Hooks can be synchronous or asynchronous
- **Error isolation**: If one hook fails, others continue to execute
- **Single execution**: Hooks only run once per session
- **TypeScript support**: Full type safety with TypeScript definitions

## Usage

### Registering a Hook

To register a SessionStart hook, use the `registerSessionStartHook` function:

```typescript
import { registerSessionStartHook } from "@/hooks";

registerSessionStartHook({
  id: "my-init-hook",
  name: "My Initialization Hook",
  priority: 50, // Optional: lower numbers run first (default: 100)
  hook: async (context) => {
    console.log("Initializing at", context.timestamp);
    console.log("Environment:", context.environment);
    
    // Your initialization code here
    await myInitFunction();
  }
});
```

### Hook Definition

A hook definition consists of:

- **id** (required): A unique identifier for the hook
- **name** (required): A human-readable name for the hook
- **priority** (optional): Execution priority (default: 100, lower runs first)
- **hook** (required): The function to execute

### Hook Context

Each hook receives a context object with:

- **timestamp**: The time when hooks started executing (milliseconds since epoch)
- **environment**: The current environment ("development", "production", or "test")

### Example Hooks

```typescript
// Simple synchronous hook
registerSessionStartHook({
  id: "logger",
  name: "Startup Logger",
  priority: 10,
  hook: (context) => {
    console.log("App started at:", new Date(context.timestamp).toISOString());
  }
});

// Async hook with API call
registerSessionStartHook({
  id: "feature-flags",
  name: "Feature Flags Loader",
  priority: 20,
  hook: async (context) => {
    const flags = await fetchFeatureFlags();
    window.__FEATURE_FLAGS__ = flags;
  }
});

// Environment validation
registerSessionStartHook({
  id: "env-check",
  name: "Environment Validator",
  priority: 5,
  hook: (context) => {
    if (!localStorage) {
      console.error("localStorage not available!");
    }
  }
});
```

## Integration

The hook system is automatically integrated into the application's startup sequence in `AppRoot.tsx`:

```typescript
React.useEffect(() => {
  // ... other startup code
  
  hookManager.executeSessionStart().catch((error) => {
    console.error("[AppRoot] Failed to execute SessionStart hooks:", error);
  });
}, []);
```

## Testing

The hook system includes comprehensive unit tests. To run them:

```bash
npm test -- src/hooks/__tests__/hookManager.test.ts
```

## API Reference

### `registerSessionStartHook(definition: HookDefinition)`

Register a new SessionStart hook.

### `unregisterHook(id: string): boolean`

Unregister a hook by its ID. Returns `true` if the hook was found and removed.

### `hookManager.executeSessionStart(): Promise<void>`

Execute all registered SessionStart hooks. This is called automatically by the application and should not be called manually.

### `hookManager.getHookCount(): number`

Get the number of registered hooks.

### `hookManager.hasExecuted(): boolean`

Check if hooks have been executed.

### `hookManager.reset(): void`

Reset the hook manager state. Primarily useful for testing.

## Best Practices

1. **Use unique IDs**: Ensure each hook has a unique ID to avoid conflicts
2. **Set appropriate priorities**: Use lower priorities (e.g., 1-50) for critical initialization
3. **Handle errors gracefully**: Hook failures should not crash the app
4. **Keep hooks focused**: Each hook should do one thing well
5. **Avoid side effects**: Hooks should be safe to run on every startup
6. **Test your hooks**: Write tests for custom hooks to ensure they work correctly

## Architecture

The hook system consists of three main files:

- `types.ts`: TypeScript type definitions
- `hookManager.ts`: Core hook manager implementation
- `index.ts`: Public API exports

Example hooks are provided in `exampleHooks.ts` for reference.
