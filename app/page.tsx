import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Code2,
  Database,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";

const FEATURES = [
  {
    icon: Bot,
    title: "A real tool-calling agent",
    description:
      "Not a chatbot that just talks — it looks up accounts, opens tickets, and searches docs by actually calling tools, live, in front of you.",
  },
  {
    icon: Sparkles,
    title: "Real vector search",
    description:
      "Help docs are embedded with a local model into Postgres and queried by cosine similarity — genuine RAG, not keyword matching.",
  },
  {
    icon: ShieldCheck,
    title: "Refunds need a human",
    description:
      "The agent can propose a refund, never issue one. A support lead approves it on the dashboard before any money moves.",
  },
  {
    icon: Workflow,
    title: "Every run is logged",
    description:
      "Each chat turn — message, reply, every tool call, outcome, latency — lands in Postgres and shows up on the dashboard.",
  },
];

const STACK = [
  "Next.js 16",
  "Vercel AI SDK",
  "Neon Postgres",
  "pgvector",
  "TypeScript",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">
            <Bot size={18} />
          </div>
          <span className="text-sm font-semibold text-neutral-900">Haxio</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/tejas249/deskcopilot"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900"
          >
            <Code2 size={16} />
            Source
          </a>
          <Link
            href="/login"
            className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-700"
          >
            View demo
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 pb-20 pt-16 text-center sm:pt-24">
        <div className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-brand-light px-3 py-1 text-xs font-medium text-brand-dark">
          <Sparkles size={13} />
          Agent + RAG, for real
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl">
          A support agent that
          <br />
          <span className="text-brand">actually does things</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-neutral-500 sm:text-lg">
          Haxio is a demo support desk for a fictional SaaS. The agent
          searches real help docs, looks up accounts, opens tickets, and
          proposes refunds — every action visible, every refund held for
          human approval.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-brand/30 transition hover:bg-brand-dark hover:shadow-md"
          >
            View live demo
            <ArrowRight size={16} />
          </Link>
          <a
            href="https://github.com/tejas249/deskcopilot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-6 py-3 text-sm font-semibold text-neutral-700 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50"
          >
            <Code2 size={16} />
            View source
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light text-brand">
                <Icon size={20} />
              </div>
              <h3 className="mb-1.5 text-base font-semibold text-neutral-900">
                {title}
              </h3>
              <p className="text-sm text-neutral-500">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-neutral-100 bg-neutral-50">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="flex items-center gap-2 text-xs font-medium text-neutral-400">
            <Database size={14} />
            Built with
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {STACK.map((item) => (
              <span
                key={item}
                className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-600"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-5xl px-6 py-8 text-center text-xs text-neutral-400">
        A portfolio demo — Acme Cloud is fictional, data resets on request.
      </footer>
    </main>
  );
}
