import { connection } from "next/server";
import { listTickets } from "@/lib/data/tickets";
import { withDbError } from "@/lib/api/handle-db-error";

// `connection()` forces this GET handler to run at request time instead
// of being prerendered once at build time. Cache Components' static
// analysis tracks `fetch()`, not a raw `pg` socket query, so without this
// guard a DB-backed GET handler can still get frozen into the build-time
// static shell.
export async function GET() {
  await connection();
  return withDbError(() => listTickets());
}
