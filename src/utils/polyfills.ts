// Import structuredClone polyfill first to ensure it's loaded before any other modules
import "./structuredClonePolyfill";

// Additional polyfills for React Native compatibility

// TextEncoder/TextDecoder polyfill
if (typeof globalThis.TextEncoder === "undefined") {
  try {
    const { TextEncoder, TextDecoder } = require("text-encoding");
    globalThis.TextEncoder = TextEncoder;
    globalThis.TextDecoder = TextDecoder;
    console.log("✅ TextEncoder/TextDecoder polyfill loaded");
  } catch (error) {
    console.warn("⚠️ text-encoding polyfill not available:", error);
  }
}

// Ensure console methods are available
if (typeof console.debug === "undefined") {
  console.debug = console.log;
}

// Additional global polyfills for React Native Web compatibility
if (typeof global !== "undefined") {
  // Ensure structuredClone is available on global scope
  if (
    typeof global.structuredClone === "undefined" &&
    typeof globalThis.structuredClone !== "undefined"
  ) {
    global.structuredClone = globalThis.structuredClone;
  }

  // Ensure TextEncoder/TextDecoder are available on global scope
  if (
    typeof global.TextEncoder === "undefined" &&
    typeof globalThis.TextEncoder !== "undefined"
  ) {
    global.TextEncoder = globalThis.TextEncoder;
  }

  if (
    typeof global.TextDecoder === "undefined" &&
    typeof globalThis.TextDecoder !== "undefined"
  ) {
    global.TextDecoder = globalThis.TextDecoder;
  }
}

// Ensure window polyfills for web compatibility
if (typeof window !== "undefined") {
  // Ensure structuredClone is available on window scope
  if (
    typeof window.structuredClone === "undefined" &&
    typeof globalThis.structuredClone !== "undefined"
  ) {
    window.structuredClone = globalThis.structuredClone;
  }

  // Ensure TextEncoder/TextDecoder are available on window scope
  if (
    typeof window.TextEncoder === "undefined" &&
    typeof globalThis.TextEncoder !== "undefined"
  ) {
    window.TextEncoder = globalThis.TextEncoder;
  }

  if (
    typeof window.TextDecoder === "undefined" &&
    typeof globalThis.TextDecoder !== "undefined"
  ) {
    window.TextDecoder = globalThis.TextDecoder;
  }
}

// Log polyfill status
console.log("🔧 Polyfills initialized:", {
  structuredClone: typeof globalThis.structuredClone !== "undefined",
  TextEncoder: typeof globalThis.TextEncoder !== "undefined",
  TextDecoder: typeof globalThis.TextDecoder !== "undefined",
});

// Export for use in other files if needed
export const polyfills = {
  structuredClone: globalThis.structuredClone,
  TextEncoder: globalThis.TextEncoder,
  TextDecoder: globalThis.TextDecoder,
};
