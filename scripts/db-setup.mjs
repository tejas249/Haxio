// One-off setup script: applies schema.sql then seed.sql against
// DATABASE_URL. Safe to re-run — schema uses IF NOT EXISTS, seed
// truncates first. Run with: npm run db:setup
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function run() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set — check .env.local");
    process.exit(1);
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    const schema = readFileSync(path.join(__dirname, "../db/schema.sql"), "utf-8");
    await client.query(schema);
    console.log("Schema applied.");

    const seed = readFileSync(path.join(__dirname, "../db/seed.sql"), "utf-8");
    await client.query(seed);
    console.log("Seed data inserted.");
  } finally {
    await client.end();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
