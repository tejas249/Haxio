import { connection } from "next/server";
import { listAccounts } from "@/lib/data/accounts";
import { withDbError } from "@/lib/api/handle-db-error";

export async function GET() {
  await connection();
  return withDbError(() => listAccounts());
}
