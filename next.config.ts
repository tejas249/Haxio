import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // @huggingface/transformers ships a native onnxruntime-node binary;
  // bundling it breaks the "Cannot find module 'onnxruntime-node'" error
  // in Vercel's serverless runtime, so keep it external and let Node
  // require it from node_modules at runtime instead.
  serverExternalPackages: ["@huggingface/transformers", "onnxruntime-node"],
  // The above keeps the require external, but onnxruntime-node picks its
  // platform binary with a dynamic require Next's file tracer can't see,
  // so it still gets dropped from the deployed function unless forced in.
  outputFileTracingIncludes: {
    "/api/chat": [
      "./node_modules/onnxruntime-node/**/*",
      "./node_modules/onnxruntime-common/**/*",
    ],
  },
  experimental: {
    // Explicit, even though "security" is already the default — keeps
    // future advisory reminders on during `next dev`/`next build`.
    agentUpgrade: "security",
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
