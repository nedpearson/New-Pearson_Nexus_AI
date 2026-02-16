/**
 * Example startup hooks
 * 
 * These hooks demonstrate how to use the SessionStart hook system
 * for initialization tasks.
 */

import { registerSessionStartHook } from "./index";

/**
 * Example: Log application startup
 */
registerSessionStartHook({
  id: "example-startup-logger",
  name: "Startup Logger",
  priority: 10,
  hook: (context) => {
    console.log("[Startup Hook] Application started at:", new Date(context.timestamp).toISOString());
    console.log("[Startup Hook] Environment:", context.environment);
  },
});

/**
 * Example: Validate browser capabilities
 */
registerSessionStartHook({
  id: "example-browser-check",
  name: "Browser Capabilities Check",
  priority: 20,
  hook: () => {
    const features = {
      localStorage: typeof localStorage !== "undefined",
      serviceWorker: "serviceWorker" in navigator,
      indexedDB: typeof indexedDB !== "undefined",
    };

    console.log("[Startup Hook] Browser capabilities:", features);

    if (!features.localStorage) {
      console.warn("[Startup Hook] localStorage is not available");
    }
  },
});

/**
 * Example: Performance monitoring
 */
registerSessionStartHook({
  id: "example-performance-monitor",
  name: "Performance Monitor",
  priority: 30,
  hook: async () => {
    if (typeof window === "undefined" || !window.performance) {
      return;
    }

    // Wait a bit to get meaningful performance data
    await new Promise((resolve) => setTimeout(resolve, 100));

    const perfData = window.performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    
    if (perfData) {
      const loadTime = perfData.loadEventEnd - perfData.fetchStart;
      console.log("[Startup Hook] Page load time:", Math.round(loadTime), "ms");
    }
  },
});
