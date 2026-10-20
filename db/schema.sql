-- DeskCopilot schema. Human-readable IDs (ACC-1001, TCK-4002, APR-3) are
-- kept as primary keys to match the app's existing contract — tickets and
-- approvals get theirs from a sequence via a DEFAULT expression, accounts
-- are seeded with fixed IDs since the app never creates new accounts.

create sequence if not exists ticket_id_seq start with 4002;
create sequence if not exists approval_id_seq start with 1;

create table if not exists accounts (
  id text primary key,
  company text not null,
  contact_email text not null,
  plan text not null check (plan in ('starter', 'pro', 'enterprise')),
  status text not null check (status in ('active', 'past_due', 'suspended')),
  open_invoice_cents integer not null default 0,
  suspended_reason text,
  last_login timestamptz not null
);

create table if not exists tickets (
  id text primary key default ('TCK-' || nextval('ticket_id_seq')),
  account_id text not null references accounts (id),
  subject text not null,
  description text not null,
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high')),
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now(),
  refund_issued_cents integer
);

create table if not exists refund_approvals (
  id text primary key default ('APR-' || nextval('approval_id_seq')),
  account_id text not null references accounts (id),
  amount_cents integer not null,
  reason text not null,
  ticket_id text references tickets (id),
  status text not null default 'pending' check (status in ('pending', 'approved', 'denied')),
  requested_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists idx_tickets_account on tickets (account_id);
create index if not exists idx_approvals_account on refund_approvals (account_id);
create index if not exists idx_approvals_status on refund_approvals (status);

-- RAG knowledge base: real vector search over lib/data/docs/*.md.
-- 384 dims matches Xenova/all-MiniLM-L6-v2 (lib/rag/embed.ts) — a small
-- local embedding model, so this runs with no embeddings API key or
-- paid Neon plan (the AI Gateway's embeddings endpoint needs one).
create extension if not exists lakebase_vector cascade;

create table if not exists kb_docs (
  id text primary key, -- source filename, e.g. 'api-keys.md'
  title text not null,
  content text not null,
  embedding vector(384)
);

create index if not exists kb_docs_embedding_ann on kb_docs
  using lakebase_ann (embedding vector_cosine_ops);

-- Observability: one row per chat turn the agent completes. `integer`
-- identity, not the app's human-readable ID pattern — this is a log
-- table, not a business entity anything else references.
create table if not exists agent_runs (
  id integer generated always as identity primary key,
  created_at timestamptz not null default now(),
  user_message text not null,
  assistant_text text,
  tool_calls jsonb not null default '[]',
  finish_reason text,
  outcome text,
  error_message text,
  duration_ms integer
);

create index if not exists idx_agent_runs_created_at on agent_runs (created_at desc);
