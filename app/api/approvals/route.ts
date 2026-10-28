import { connection } from "next/server";
import { listApprovals } from "@/lib/data/approvals";
import { withDbError } from "@/lib/api/handle-db-error";

export async function GET() {
  await connection();
  return withDbError(() => listApprovals());
}
