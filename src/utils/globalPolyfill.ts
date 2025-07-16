// Import the structuredClone polyfill from core-js
import "core-js/stable/structured-clone";

// Import other essential polyfills
import "core-js/stable/url";
import "core-js/stable/url-search-params";
import "text-encoding"; // Provides TextEncoder and TextDecoder

console.log(
  "✅ Global polyfills loaded: structuredClone, URL, TextEncoder/Decoder"
);
