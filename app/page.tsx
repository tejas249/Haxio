import Link from "next/link";
import HaxioMark from "@/components/HaxioMark";
import SiteFooter from "@/components/SiteFooter";
import ChatMockup from "@/components/ChatMockup";
import {
  ArrowRight,
  Bot,
  Code2,
  Database,
  MessageSquare,
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

const STATS = [
  { value: "4", label: "tools the agent can call" },
  { value: "384-dim", label: "local vector embeddings" },
  { value: "100%", label: "refunds human-approved" },
  { value: "0", label: "mocked data — real Postgres" },
];

const STEPS = [
  {
    step: "01",
    title: "Ask in plain language",
    description:
      "Open the chat widget on the dashboard and describe the issue — a suspended account, a billing question, a refund request.",
  },
  {
    step: "02",
    title: "The agent investigates",
    description:
      "It calls real tools live: searches help docs by vector similarity, pulls up the account, and drafts a ticket — you watch every call happen.",
  },
  {
    step: "03",
    title: "A human signs off on money",
    description:
      "If a refund is warranted, the agent proposes one and stops. A support lead approves or denies it on the dashboard before anything moves.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-10 border-b border-neutral-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <HaxioMark size={32} />
            <span className="text-sm font-semibold text-neutral-900">Haxio</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-medium text-neutral-600 md:flex">
            <a href="#features" className="hover:text-neutral-900">Features</a>
            <a href="#how-it-works" className="hover:text-neutral-900">How it works</a>
            <a href="#stack" className="hover:text-neutral-900">Stack</a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="https://github.com/tejas249/Haxio"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900"
            >
              <Code2 size={16} />
              <span className="hidden sm:inline">Source</span>
            </a>
            <Link
              href="/login"
              className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-700"
            >
              View demo
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-40 -z-10 flex justify-center"
        >
          <div className="h-[480px] w-[480px] rounded-full bg-brand-light opacity-60 blur-3xl sm:h-[640px] sm:w-[640px]" />
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-12 px-6 pb-20 pt-16 sm:pt-24 lg:grid-cols-2 lg:gap-8">
          <div className="text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-brand-light px-3 py-1 text-xs font-medium text-brand-dark">
              <Sparkles size={13} />
              Agent + RAG, for real
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl">
              A support agent that
              <br />
              <span className="text-brand">actually does things</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-neutral-500 sm:text-lg lg:mx-0">
              Haxio is a demo support desk for a fictional SaaS. The agent
              searches real help docs, looks up accounts, opens tickets, and
              proposes refunds — every action visible, every refund held for
              human approval.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-brand/30 transition hover:bg-brand-dark hover:shadow-md"
              >
                View live demo
                <ArrowRight size={16} />
              </Link>
              <a
                href="https://github.com/tejas249/Haxio"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-6 py-3 text-sm font-semibold text-neutral-700 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50"
              >
                <Code2 size={16} />
                View source
              </a>
            </div>
          </div>

          <ChatMockup />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="grid grid-cols-2 gap-6 border-y border-neutral-100 py-8 sm:grid-cols-4">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-semibold text-neutral-900 sm:text-3xl">{value}</div>
              <div className="mt-1 text-xs text-neutral-500">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="mx-auto max-w-5xl scroll-mt-20 px-6 pb-20">
        <div className="mb-10 max-w-xl">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-neutral-400">
            <Bot size={14} />
            Features
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
            Everything a support agent should do — and nothing it shouldn&apos;t
          </h2>
        </div>
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

      <section id="how-it-works" className="mx-auto max-w-5xl scroll-mt-20 px-6 pb-20">
        <div className="mb-10 max-w-xl">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-neutral-400">
            <MessageSquare size={14} />
            How it works
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
            From a question to a resolved ticket
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {STEPS.map(({ step, title, description }) => (
            <div key={step}>
              <div className="mb-3 text-sm font-semibold text-brand">{step}</div>
              <h3 className="mb-1.5 text-base font-semibold text-neutral-900">{title}</h3>
              <p className="text-sm text-neutral-500">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="stack" className="scroll-mt-20 border-t border-neutral-100 bg-neutral-50">
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

      <section className="bg-ink">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-6 py-16 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            See the agent work, live
          </h2>
          <p className="max-w-md text-sm text-neutral-300">
            Log in with the demo password and watch it search, look things up,
            and open tickets — in real time.
          </p>
          <Link
            href="/login"
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-brand/30 transition hover:bg-brand-dark hover:shadow-md"
          >
            View live demo
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
      </main>

      <SiteFooter />
    </div>
  );
}
