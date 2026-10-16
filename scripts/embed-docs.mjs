// Embeds lib/data/docs/*.md into kb_docs using a local model (no API
// key). Safe to re-run — upserts by filename. Run with: npm run db:embed
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "pg";
import { pipeline, env } from "@huggingface/transformers";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCS_DIR = path.join(__dirname, "../lib/data/docs");
// Keep in sync with lib/rag/embed.ts and the vector(384) column in
// db/schema.sql.
const MODEL_ID = "onnx-community/all-MiniLM-L6-v2-ONNX";

env.cacheDir = "./.cache/transformers/";

async function run() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set — check .env.local");
    process.exit(1);
  }

  const files = readdirSync(DOCS_DIR).filter((f) => f.endsWith(".md"));
  const docs = files.map((file) => {
    const raw = readFileSync(path.join(DOCS_DIR, file), "utf-8");
    const title = raw.match(/^#\s+(.+)$/m)?.[1] ?? file;
    return { id: file, title, content: raw.trim() };
  });

  console.log(`Embedding ${docs.length} docs with ${MODEL_ID}...`);
  const extractor = await pipeline("feature-extraction", MODEL_ID);
  const output = await extractor(
    docs.map((d) => d.content),
    { pooling: "mean", normalize: true },
  );
  const vectors = output.tolist();

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    for (let i = 0; i < docs.length; i++) {
      const vectorParam = `[${vectors[i].join(",")}]`;
      await client.query(
        `insert into kb_docs (id, title, content, embedding)
         values ($1, $2, $3, $4::vector)
         on conflict (id) do update set
           title = excluded.title,
           content = excluded.content,
           embedding = excluded.embedding`,
        [docs[i].id, docs[i].title, docs[i].content, vectorParam],
      );
      console.log(`  ${docs[i].id}`);
    }
  } finally {
    await client.end();
  }

  console.log("Done.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
