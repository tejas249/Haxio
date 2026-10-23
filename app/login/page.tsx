"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import HaxioMark from "@/components/HaxioMark";
import SiteFooter from "@/components/SiteFooter";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <Link
        href="/"
        className="mb-6 flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-700"
      >
        <ArrowLeft size={15} />
        Back to Haxio
      </Link>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm"
      >
        <div className="mb-6 flex items-center gap-2.5">
          <HaxioMark size={36} />
          <div>
            <div className="text-sm font-semibold text-neutral-900">Haxio</div>
            <div className="text-xs text-neutral-400">Support dashboard</div>
          </div>
        </div>

        <label className="mb-1 block text-xs font-medium text-neutral-600">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          className="mb-3 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
        />

        {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={submitting || !password}
          className="w-full rounded-full bg-brand py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand/30 transition hover:bg-brand-dark hover:shadow-md disabled:opacity-40 disabled:shadow-none"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
      </main>
      <SiteFooter />
    </div>
  );
}
