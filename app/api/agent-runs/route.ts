import { connection } from "next/server";
import { listAgentRuns } from "@/lib/data/agent-runs";

export async function GET() {
  await connection();
  return Response.json(await listAgentRuns());
}
