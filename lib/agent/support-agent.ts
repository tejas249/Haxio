import { ToolLoopAgent, tool, stepCountIs, type InferAgentUIMessage } from "ai";
import { z } from "zod";
import { getChatModel } from "@/lib/ai/providers";
import { search } from "@/lib/rag/search";
import { getAccount } from "@/lib/data/accounts";
import { createTicket } from "@/lib/data/tickets";
import { createApproval } from "@/lib/data/approvals";

export const supportAgent = new ToolLoopAgent({
  model: getChatModel(),
  instructions: `You are the support copilot for Acme Cloud, a B2B SaaS product.

Rules:
- For any question about policy, how-to steps, or "why" something happened, call searchDocs first and cite the article title in your answer.
- For any question about a specific customer, call getAccountStatus with their account ID (format ACC-XXXX) before answering. Ask for the account ID if the user hasn't given one.
- If a customer needs something fixed that you can't resolve yourself, call createTicket so a human can follow up.
- You cannot issue refunds yourself. When a billing issue matches the refund policy from searchDocs, call issueRefund to REQUEST one and always also open a ticket for the record. This only creates a pending request — tell the customer the refund is pending approval from a support lead, never that it has been issued.
- Be concise. State what you found and what you did, not your internal reasoning.`,
  tools: {
    searchDocs: tool({
      description:
        "Search the Acme Cloud help docs for policy and how-to articles. Always use this before answering a policy or how-to question.",
      inputSchema: z.object({
        query: z.string().describe("The user's question, in plain words"),
      }),
      execute: async ({ query }) => {
        const results = search(query);
        return results.length > 0
          ? results
          : { message: "No matching docs found." };
      },
    }),

    getAccountStatus: tool({
      description:
        "Look up a customer account by its account ID to check plan, status, and any open invoice.",
      inputSchema: z.object({
        accountId: z.string().describe("Account ID, e.g. ACC-1002"),
      }),
      execute: async ({ accountId }) => {
        const account = getAccount(accountId);
        if (!account) {
          return { error: `No account found with ID ${accountId}` };
        }
        return account;
      },
    }),

    createTicket: tool({
      description:
        "Open a support ticket for a customer issue that needs human follow-up or a record of an action taken.",
      inputSchema: z.object({
        accountId: z.string(),
        subject: z.string(),
        description: z.string(),
        priority: z.enum(["low", "normal", "high"]).default("normal"),
      }),
      execute: async (input) => createTicket(input),
    }),

    issueRefund: tool({
      description:
        "Request a refund for a customer's account for a confirmed billing issue, per the refund policy. This does NOT issue the refund — it creates a pending request that a human support lead must approve on the dashboard before any money moves.",
      inputSchema: z.object({
        accountId: z.string(),
        amountCents: z.number().int().positive(),
        reason: z.string(),
        ticketId: z
          .string()
          .optional()
          .describe("Ticket to attach this refund request to, if one was opened"),
      }),
      execute: async ({ accountId, amountCents, reason, ticketId }) => {
        const account = getAccount(accountId);
        if (!account) {
          return { error: `No account found with ID ${accountId}` };
        }
        const approval = createApproval({ accountId, amountCents, reason, ticketId });
        return {
          status: "pending_approval",
          approvalId: approval.id,
          accountId,
          amountCents,
          reason,
          ticketId: ticketId ?? null,
        };
      },
    }),
  },
  stopWhen: stepCountIs(8),
});

export type SupportAgentMessage = InferAgentUIMessage<typeof supportAgent>;
