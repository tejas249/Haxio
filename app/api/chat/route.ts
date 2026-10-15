import { createAgentUIStreamResponse } from "ai";
import { supportAgent } from "@/lib/agent/support-agent";

export async function POST(req: Request) {
  const { messages } = await req.json();

  return createAgentUIStreamResponse({
    agent: supportAgent,
    uiMessages: messages,
  });
}
