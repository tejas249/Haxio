import { pipeline, env, type FeatureExtractionPipeline } from "@huggingface/transformers";

// Runs fully locally (ONNX, CPU) — no embeddings API key, no paid plan.
// 384-dim output; must match the `vector(384)` column in db/schema.sql.
const MODEL_ID = "onnx-community/all-MiniLM-L6-v2-ONNX";

// Cache the downloaded model under the project root instead of inside
// node_modules, so it survives a `rm -rf node_modules && npm install`.
env.cacheDir = "./.cache/transformers/";

// Singleton loader, cached on `globalThis` so Next's dev-mode module
// reloads don't reload the (~90MB) model on every edit — same reasoning
// as the pg pool in lib/db.ts.
const globalForEmbedder = globalThis as unknown as {
  embedder?: Promise<FeatureExtractionPipeline>;
};

function getExtractor(): Promise<FeatureExtractionPipeline> {
  if (!globalForEmbedder.embedder) {
    globalForEmbedder.embedder = pipeline(
      "feature-extraction",
      MODEL_ID,
    ) as Promise<FeatureExtractionPipeline>;
  }
  return globalForEmbedder.embedder;
}

export async function embedMany(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const extractor = await getExtractor();
  const output = await extractor(texts, { pooling: "mean", normalize: true });
  return output.tolist();
}

export async function embedOne(text: string): Promise<number[]> {
  const [vector] = await embedMany([text]);
  return vector;
}
