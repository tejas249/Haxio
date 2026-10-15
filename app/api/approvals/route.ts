import { connection } from "next/server";
import { listApprovals } from "@/lib/data/approvals";

export async function GET() {
  await connection();
  return Response.json(listApprovals());
}
