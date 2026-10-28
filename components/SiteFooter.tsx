import Link from "next/link";
import HaxioMark from "./HaxioMark";

const YEAR = new Date().getFullYear();

export default function SiteFooter() {
  return (
    <footer className="border-t border-neutral-100 bg-neutral-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm">
          <Link href="/" className="flex items-center gap-2">
            <HaxioMark size={24} />
            <span className="text-sm font-semibold text-neutral-900">Haxio</span>
          </Link>
          <p className="mt-2 text-xs text-neutral-400">
            An AI support agent for SaaS teams — Acme Cloud is the sample workspace.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
              Product
            </span>
            <Link href="/" className="text-neutral-600 hover:text-neutral-900">
              Overview
            </Link>
            <Link href="/login" className="text-neutral-600 hover:text-neutral-900">
              Sign in
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
              Resources
            </span>
            <Link href="/#features" className="text-neutral-600 hover:text-neutral-900">
              Features
            </Link>
            <Link href="/#how-it-works" className="text-neutral-600 hover:text-neutral-900">
              How it works
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 pb-8 text-xs text-neutral-400">
        © {YEAR} Haxio. Built by Tejas with Next.js, the Vercel AI SDK, and Neon Postgres.
      </div>
    </footer>
  );
}
