import { Pool } from "pg";

// Singleton pool cached on `globalThis` so Next's dev-mode module reloads
// (Fast Refresh re-evaluates server modules) don't open a fresh pool —
// and therefore a fresh set of Postgres connections — on every edit.
const globalForPg = globalThis as unknown as { pgPool?: Pool };

export const pool =
  globalForPg.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg.pgPool = pool;
}
