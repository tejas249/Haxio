# DeskCopilot

A demo support agent for a fictional SaaS ("Acme Cloud"), built to show three
things together: Next.js App Router, the Vercel AI SDK's agent/tool-calling
layer, and a RAG-style retrieval step — the stack most "agent + RAG" job
postings are actually asking for.

The agent doesn't just answer questions — it calls real tools: it searches
a help-doc knowledge base, looks up account records, opens support tickets,
and requests refunds, all visible as they happen in the chat widget. Refunds
stop short of a human: the agent can only *propose* one, and a support lead
has to approve it on the dashboard before any money moves.

## What's here

- **Dashboard** (`/dashboard`) — accounts, tickets, and pending refund
  approvals, mock data
- **Chat widget** — floating bubble, bottom right, open it and ask something
- **Agent** (`lib/agent/support-agent.ts`) — a `ToolLoopAgent` (AI SDK) with
  four tools: `searchDocs`, `getAccountStatus`, `createTicket`, `issueRefund`
- **Refund approval gate** (`lib/data/approvals.ts`,
  `app/api/approvals/`) — `issueRefund` never moves money itself; it creates
  a pending `RefundApproval` that only `PATCH /api/approvals/[id]` (the
  dashboard's Approve/Deny buttons) can resolve. A denial leaves the ticket
  untouched; an approval attaches the refund to the ticket
- **RAG** (`lib/rag/search.ts`) — TF-IDF retrieval over markdown docs in
  `lib/data/docs/`. No embeddings API call, so the whole thing runs with a
  single LLM key. Swap this module for real vector search later — it's the
  only thing the agent depends on
- **Provider switch** (`lib/ai/providers.ts`) — reads `LLM_PROVIDER` to pick
  Claude or GPT for the same agent code

## Setup

```bash
npm install
cp .env.example .env.local
```

Edit `.env.local`:

```
LLM_PROVIDER=anthropic        # or "openai"
ANTHROPIC_API_KEY=sk-ant-...  # whichever matches LLM_PROVIDER
```

```bash
npm run dev
```

Open http://localhost:3000 — it redirects to `/dashboard`.

## Try it

Click the chat bubble and ask one of the suggested prompts, or:

- `Why is account ACC-1003 suspended?` → agent calls `getAccountStatus` +
  `searchDocs`, cites the suspension policy
- `ACC-1002 says they were double charged $49, can you check and refund it?`
  → agent looks up the account, checks the refund policy doc, opens a
  ticket, and *requests* a refund — then go to the dashboard's "Refund
  approvals" section and click Approve to actually issue it
- `How do I reset my API key?` → pure RAG, no account lookup needed

Any action the agent takes (new ticket, refund request) shows up on the
dashboard within a few seconds — the chat widget refetches the tables after
each turn. Approving/denying a refund on the dashboard does the same.

## Known simplifications (intentional, for a demo)

- **In-memory data** (`lib/data/accounts.ts`, `lib/data/tickets.ts`,
  `lib/data/approvals.ts`) — resets on server restart. Swap for a real
  Postgres table (Neon is a good fit — branch-per-PR, pgvector if you
  upgrade the RAG step) when this becomes more than a demo.
- **Lexical RAG, not embeddings** — accurate enough for a handful of docs;
  won't scale to a real knowledge base. The retrieval contract
  (`search(query): SearchResult[]`) is isolated so swapping it is a
  one-file change.

## Stack

Next.js 16 (App Router, Cache Components) · Vercel AI SDK (`ai`, `@ai-sdk/react`,
`@ai-sdk/anthropic`, `@ai-sdk/openai`) · Tailwind CSS v4 · TypeScript
