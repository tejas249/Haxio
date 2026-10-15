import { connection } from "next/server";
import { listTickets } from "@/lib/data/tickets";

// `connection()` forces this GET handler to run at request time instead
// of being prerendered once at build time (Cache Components treats a
// handler with no uncached/runtime data access as static by default,
// which would freeze this mutable in-memory store's initial state).
export async function GET() {
  await connection();
  return Response.json(listTickets());
}
