import { createAgentUIStreamResponse } from "ai";
import { supportAgent } from "@/lib/agent/support-agent";
import { createAgentRun, type AgentToolCallLog } from "@/lib/data/agent-runs";

// Generous: the local embedding model can take a while to download on a
// cold serverless instance (first searchDocs call after a deploy/idle).
export const maxDuration = 60;

interface IncomingPart {
  type: string;
  text?: string;
}

interface IncomingMessage {
  role: string;
  parts?: IncomingPart[];
}

function extractText(parts: IncomingPart[] | undefined): string {
  return (parts ?? [])
    .filter((p) => p.type === "text" && typeof p.text === "string")
    .map((p) => p.text)
    .join("\n");
}

export async function POST(req: Request) {
  const { messages } = (await req.json()) as { messages: IncomingMessage[] };
  const startedAt = Date.now();
  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");

  return createAgentUIStreamResponse({
    agent: supportAgent,
    uiMessages: messages,
    onEnd: async ({ responseMessage, outcome, finishReason }) => {
      try {
        const toolCalls: AgentToolCallLog[] = [];
        let assistantText = "";

        for (const part of responseMessage.parts as IncomingPart[]) {
          if (part.type === "text" && part.text) {
            assistantText += part.text;
          } else if (part.type.startsWith("tool-")) {
            const toolPart = part as IncomingPart & {
              input?: unknown;
              output?: unknown;
              errorText?: string;
              state?: string;
            };
            toolCalls.push({
              name: part.type.replace("tool-", ""),
              input: toolPart.input ?? null,
              output:
                toolPart.state === "output-error"
                  ? { error: toolPart.errorText }
                  : (toolPart.output ?? null),
            });
          }
        }

        await createAgentRun({
          userMessage: extractText(lastUserMessage?.parts).slice(0, 2000),
          assistantText: assistantText ? assistantText.slice(0, 4000) : null,
          toolCalls,
          finishReason: finishReason ?? null,
          outcome: outcome.status,
          errorMessage:
            outcome.status === "failed" ? String((outcome.error ?? "unknown error")) : null,
          durationMs: Date.now() - startedAt,
        });
      } catch (err) {
        // Logging must never break the chat response itself.
        console.error("Failed to log agent run:", err);
      }
    },
  });
}
