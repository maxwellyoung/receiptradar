// Test structuredClone polyfill in React Native environment
console.log("🧪 Testing structuredClone polyfill...");

// Simulate React Native environment
global.globalThis = global;

// Test if structuredClone is available natively
if (typeof globalThis.structuredClone === "undefined") {
  console.log("❌ structuredClone is not available natively");

  // Try to load the polyfill package
  try {
    const structuredCloneModule = require("@ungap/structured-clone");
    const polyfill =
      structuredCloneModule.structuredClone || structuredCloneModule.default;

    globalThis.structuredClone = polyfill;
    console.log("✅ structuredClone polyfill loaded from package");
  } catch (error) {
    console.warn("⚠️ Package not available, using fallback:", error);

    // Fallback implementation
    const fallbackImplementation = function structuredCloneFallback(obj) {
      if (obj === null || typeof obj !== "object") {
        return obj;
      }

      if (obj instanceof Date) {
        return new Date(obj.getTime());
      }

      if (obj instanceof Array) {
        return obj.map((item) => structuredCloneFallback(item));
      }

      if (typeof obj === "object") {
        const cloned = {};
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            cloned[key] = structuredCloneFallback(obj[key]);
          }
        }
        return cloned;
      }

      return obj;
    };

    globalThis.structuredClone = fallbackImplementation;
    console.log("✅ Fallback implementation loaded");
  }
} else {
  console.log("✅ structuredClone is available natively");
}

// Test structuredClone
try {
  const testObj = { a: 1, b: { c: 2 } };
  const cloned = globalThis.structuredClone(testObj);
  console.log("✅ structuredClone is working:", cloned);

  // Test deep cloning
  testObj.b.c = 999;
  if (cloned.b.c === 2) {
    console.log("✅ Deep cloning test passed");
  } else {
    console.log("❌ Deep cloning test failed");
  }
} catch (error) {
  console.error("❌ structuredClone test failed:", error);
}

console.log("�� Test complete");
