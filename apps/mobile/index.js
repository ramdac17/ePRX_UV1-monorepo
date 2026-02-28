import "./globals";
import "fast-text-encoding";

if (typeof global.TextEncoder === "undefined") {
  const { TextEncoder, TextDecoder } = require("fast-text-encoding");
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

import "./polyfills"; // Load polyfills first!
import "expo-router/entry";
