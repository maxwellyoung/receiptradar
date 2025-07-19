// This polyfill ensures that `structuredClone` is available in the global scope,
// which is necessary for some dependencies that rely on it.
// It's loaded first in `polyfills.ts` to ensure it's available before any other code runs.

// Attempt to use the robust polyfill from the `@ungap/structured-clone` package.
try {
  if (typeof globalThis.structuredClone === "undefined") {
    const structuredClone = require("@ungap/structured-clone").default;
    globalThis.structuredClone = structuredClone;
    console.log("✅ structuredClone polyfill loaded from @ungap");
  }
} catch (e) {
  // Fallback to a simpler, less robust implementation if the package fails to load.
  // This is a safety net but might not cover all edge cases.
  console.warn(
    "⚠️ @ungap/structured-clone failed to load, using fallback. Error:",
    e
  );

  if (typeof globalThis.structuredClone === "undefined") {
    globalThis.structuredClone = function <T>(value: T): T {
      // Super simple "clone" for primitive values
      if (typeof value !== "object" || value === null) {
        return value;
      }

      // Basic Date object cloning
      if (value instanceof Date) {
        return new Date(value.getTime()) as any;
      }

      // Basic Array cloning (recursive)
      if (Array.isArray(value)) {
        return value.map((item) => globalThis.structuredClone(item)) as any;
      }

      // Basic Object cloning (recursive)
      const clonedObj: { [key: string]: any } = {};
      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          clonedObj[key] = globalThis.structuredClone(value[key]);
        }
      }
      return clonedObj as T;
    };
    console.log("✅ structuredClone polyfill loaded (simple fallback)");
  }
}
