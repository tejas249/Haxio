import { connection } from "next/server";
import { listAccounts } from "@/lib/data/accounts";

export async function GET() {
  await connection();
  return Response.json(await listAccounts());
}
