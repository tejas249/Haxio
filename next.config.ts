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
