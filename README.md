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
  approvals, backed by Neon Postgres (`lib/db.ts`, `db/schema.sql`)
- **Chat widget** — floating bubble, bottom right, open it and ask something
- **Agent** (`lib/agent/support-agent.ts`) — a `ToolLoopAgent` (AI SDK) with
  four tools: `searchDocs`, `getAccountStatus`, `createTicket`, `issueRefund`
- **Refund approval gate** (`lib/data/approvals.ts`,
  `app/api/approvals/`) — `issueRefund` never moves money itself; it creates
  a pending `RefundApproval` that only `PATCH /api/approvals/[id]` (the
  dashboard's Approve/Deny buttons) can resolve. A denial leaves the ticket
  untouched; an approval attaches the refund to the ticket
- **RAG** (`lib/rag/search.ts`, `lib/rag/embed.ts`) — real vector search:
  markdown docs in `lib/data/docs/` are embedded with a local model
  ([`onnx-community/all-MiniLM-L6-v2-ONNX`](https://huggingface.co/onnx-community/all-MiniLM-L6-v2-ONNX)
  via `@huggingface/transformers`, CPU-only, no API key) into a
  `vector(384)` column, queried with Neon's `lakebase_vector` extension
  (pgvector-compatible) by cosine distance
- **Provider switch** (`lib/ai/providers.ts`) — reads `LLM_PROVIDER` to pick
  Claude or GPT for the same agent code
- **Agent activity log** (`lib/data/agent-runs.ts`, dashboard's "Agent
  activity" section) — every chat turn is logged to Postgres on completion
  (`onEnd` in `app/api/chat/route.ts`): the user's message, the agent's
  reply, every tool it called with input/output, outcome, and latency.
  Logging is best-effort and wrapped in try/catch — a DB hiccup here never
  breaks the chat response itself

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

### Database

Postgres is on Neon. If you have the [Neon CLI](https://neon.com/docs/cli/install)
and are signed in:

```bash
neon link --org-id <your-org-id> --project-name DeskCopilot --region-id aws-us-east-2
npm run db:setup   # applies db/schema.sql, then db/seed.sql
npm run db:embed   # downloads the local model once, embeds lib/data/docs/*.md
```

`neon link` writes `DATABASE_URL` (and friends) straight into `.env.local` —
nothing to copy by hand. `db/schema.sql` enables `lakebase_vector`, Neon's
pgvector-compatible extension — on a non-Neon Postgres, swap that one line
for plain `pgvector` (`CREATE EXTENSION vector`) and the `USING lakebase_ann`
index for `USING ivfflat` or `hnsw`; everything else is standard SQL.

`db/schema.sql` is idempotent (`IF NOT EXISTS` everywhere) and `db/seed.sql`
truncates before inserting, so `npm run db:setup` is safe to re-run any time
you want to reset back to the demo's starting state. `db:embed` upserts by
filename, so it's safe to re-run too (e.g. after editing a doc).

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

## Development

```bash
npm run lint        # eslint
npm run typecheck   # tsc --noEmit
npm run test        # vitest — unit tests for lib/data/*.ts and lib/rag/search.ts
npm run build       # next build — needs no env vars at all, DB calls are all runtime
```

All four run in CI on every push and PR to `main` ([.github/workflows/ci.yml](.github/workflows/ci.yml))
with zero required secrets. Tests mock `lib/db.ts`'s pool and `lib/rag/embed.ts`'s
embedder, so they run fully offline — no live Postgres or model download needed.

## Known simplifications (intentional, for a demo)

- **A tiny, general-purpose embedding model** — `all-MiniLM-L6-v2` (384 dims)
  is fast and needs no API key, but a larger or domain-tuned model would
  rank closely-related docs more precisely at real knowledge-base scale.
  Swapping it means re-running `db:embed` and matching the new dimension
  in `db/schema.sql`'s `vector(384)` column.

## Stack

Next.js 16 (App Router, Cache Components) · Vercel AI SDK (`ai`, `@ai-sdk/react`,
`@ai-sdk/anthropic`, `@ai-sdk/openai`) · Neon Postgres (`pg`, `lakebase_vector`) ·
`@huggingface/transformers` (local embeddings) · Tailwind CSS v4 · TypeScript ·
Vitest · GitHub Actions
