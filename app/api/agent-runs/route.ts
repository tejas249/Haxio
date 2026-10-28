import { connection } from "next/server";
import { listAgentRuns } from "@/lib/data/agent-runs";
import { withDbError } from "@/lib/api/handle-db-error";

export async function GET() {
  await connection();
  return withDbError(() => listAgentRuns());
}
