import Link from "next/link";
import { Code2 } from "lucide-react";
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
            A portfolio demo — Acme Cloud is fictional, data resets on request.
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
              Live demo
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
              Project
            </span>
            <a
              href="https://github.com/tejas249/Haxio"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-neutral-600 hover:text-neutral-900"
            >
              <Code2 size={14} />
              Source on GitHub
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 pb-8 text-xs text-neutral-400">
        © {YEAR} Haxio. Built by Tejas with Next.js, the Vercel AI SDK, and Neon Postgres.
      </div>
    </footer>
  );
}
