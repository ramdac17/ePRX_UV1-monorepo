import { TextEncoder, TextDecoder } from "fast-text-encoding";

if (typeof global.TextEncoder === "undefined") {
  global.TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === "undefined") {
  global.TextDecoder = TextDecoder;
}

// Log this so you can see it in terminal/flipper during debug
console.log("✅ ePRX UV1: Global Polyfills Initialized");
