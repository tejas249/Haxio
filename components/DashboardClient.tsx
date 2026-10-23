"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Check,
  CircleOff,
  LogOut,
  RefreshCw,
  ShieldAlert,
  Ticket as TicketIcon,
  Users,
  X,
} from "lucide-react";
import ChatWidget from "./ChatWidget";
import HaxioMark from "./HaxioMark";
import SiteFooter from "./SiteFooter";
import type { Account } from "@/lib/data/accounts";
import type { Ticket } from "@/lib/data/tickets";
import type { RefundApproval } from "@/lib/data/approvals";
import type { AgentRun } from "@/lib/data/agent-runs";

const TILE_TONES = {
  brand: "bg-brand-light text-brand",
  amber: "bg-amber-50 text-amber-600",
  red: "bg-red-50 text-red-600",
} as const;

function StatTile({
  label,
  value,
  icon: Icon,
  tone = "brand",
}: {
  label: string;
  value: number;
  icon: typeof Users;
  tone?: keyof typeof TILE_TONES;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm transition hover:shadow-md">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${TILE_TONES[tone]}`}>
        <Icon size={18} />
      </div>
      <div>
        <div className="text-2xl font-semibold text-neutral-900">{value}</div>
        <div className="text-xs text-neutral-500">{label}</div>
      </div>
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-50 text-green-700",
  past_due: "bg-amber-50 text-amber-700",
  suspended: "bg-red-50 text-red-700",
  open: "bg-amber-50 text-amber-700",
  resolved: "bg-green-50 text-green-700",
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-green-50 text-green-700",
  denied: "bg-red-50 text-red-700",
  completed: "bg-green-50 text-green-700",
  failed: "bg-red-50 text-red-700",
  aborted: "bg-neutral-100 text-neutral-600",
  unknown: "bg-neutral-100 text-neutral-600",
};

function timeAgo(iso: string): string {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function DashboardClient() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [approvals, setApprovals] = useState<RefundApproval[]>([]);
  const [agentRuns, setAgentRuns] = useState<AgentRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    let ignore = false;

    (async () => {
      setLoadError(null);
      try {
        const [accountsRes, ticketsRes, approvalsRes, agentRunsRes] = await Promise.all([
          fetch("/api/accounts"),
          fetch("/api/tickets"),
          fetch("/api/approvals"),
          fetch("/api/agent-runs"),
        ]);
        for (const res of [accountsRes, ticketsRes, approvalsRes, agentRunsRes]) {
          if (!res.ok) throw new Error(`${res.url} responded with ${res.status}`);
        }
        const [accountsData, ticketsData, approvalsData, agentRunsData] = await Promise.all([
          accountsRes.json(),
          ticketsRes.json(),
          approvalsRes.json(),
          agentRunsRes.json(),
        ]);
        if (ignore) return;
        setAccounts(accountsData);
        setTickets(ticketsData);
        setApprovals(approvalsData);
        setAgentRuns(agentRunsData);
      } catch {
        if (ignore) return;
        setLoadError(
          "Couldn't load dashboard data. The database may be unreachable — try refreshing.",
        );
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [refreshKey]);

  const resolveApproval = async (id: string, action: "approve" | "deny") => {
    setResolvingId(id);
    try {
      await fetch(`/api/approvals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      refresh();
    } finally {
      setResolvingId(null);
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const suspended = accounts.filter((a) => a.status === "suspended").length;
  const pastDue = accounts.filter((a) => a.status === "past_due").length;
  const openTickets = tickets.filter((t) => t.status === "open").length;
  const pendingApprovals = approvals.filter((a) => a.status === "pending");

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
      <Link
        href="/"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-700"
      >
        <ArrowLeft size={15} />
        Back to Haxio
      </Link>

      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <HaxioMark size={36} className="mt-0.5 shrink-0" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
              Support Dashboard
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              Acme Cloud · the agent below can look up these accounts, cite help docs, and
              open tickets — refunds it proposes wait for approval right here.
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50"
        >
          <LogOut size={14} />
          Log out
        </button>
      </header>

      {loadError ? (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0" />
            {loadError}
          </div>
          <button
            onClick={refresh}
            className="flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 shadow-sm transition hover:bg-red-100"
          >
            <RefreshCw size={13} />
            Retry
          </button>
        </div>
      ) : null}

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-6">
        <StatTile label="Accounts" value={accounts.length} icon={Users} />
        <StatTile label="Past due" value={pastDue} icon={AlertCircle} tone="amber" />
        <StatTile label="Suspended" value={suspended} icon={CircleOff} tone="red" />
        <StatTile label="Open tickets" value={openTickets} icon={TicketIcon} />
        <StatTile
          label="Pending approvals"
          value={pendingApprovals.length}
          icon={ShieldAlert}
          tone={pendingApprovals.length > 0 ? "amber" : "brand"}
        />
        <StatTile label="Agent runs" value={agentRuns.length} icon={Activity} />
      </div>

      {approvals.length > 0 ? (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold tracking-tight text-neutral-700">
            Refund approvals
          </h2>
          <div className="space-y-2">
            {approvals.map((a) => (
              <div
                key={a.id}
                className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3 shadow-sm ${
                  a.status === "pending" ? "border-amber-200" : "border-neutral-200"
                }`}
              >
                <div className="text-sm">
                  <div className="font-medium text-neutral-900">
                    ${(a.amountCents / 100).toFixed(2)} for{" "}
                    <span className="font-mono text-xs text-neutral-500">
                      {a.accountId}
                    </span>
                  </div>
                  <div className="text-neutral-500">{a.reason}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[a.status]}`}
                  >
                    {a.status}
                  </span>
                  {a.status === "pending" ? (
                    <>
                      <button
                        onClick={() => resolveApproval(a.id, "approve")}
                        disabled={resolvingId === a.id}
                        className="flex items-center gap-1 rounded-full bg-green-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-green-600/30 transition hover:bg-green-700 hover:shadow-md disabled:opacity-40 disabled:shadow-none"
                      >
                        <Check size={14} />
                        Approve
                      </button>
                      <button
                        onClick={() => resolveApproval(a.id, "deny")}
                        disabled={resolvingId === a.id}
                        className="flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                      >
                        <X size={14} />
                        Deny
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold tracking-tight text-neutral-700">
          Accounts
        </h2>
        <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-neutral-50 text-left text-xs font-medium tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-2.5">ID</th>
                <th className="px-4 py-2.5">Company</th>
                <th className="px-4 py-2.5">Plan</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Open invoice</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => (
                <tr key={a.id} className="border-t border-neutral-100 transition hover:bg-neutral-50/70">
                  <td className="px-4 py-2.5 font-mono text-xs text-neutral-500">{a.id}</td>
                  <td className="px-4 py-2.5 font-medium text-neutral-900">{a.company}</td>
                  <td className="px-4 py-2.5 capitalize text-neutral-500">{a.plan}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[a.status]}`}
                    >
                      {a.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-neutral-500">
                    {a.openInvoiceCents > 0
                      ? `$${(a.openInvoiceCents / 100).toFixed(2)}`
                      : "—"}
                  </td>
                </tr>
              ))}
              {!loading && accounts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-neutral-400">
                    No accounts
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold tracking-tight text-neutral-700">
          Tickets
        </h2>
        <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-neutral-50 text-left text-xs font-medium tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-2.5">ID</th>
                <th className="px-4 py-2.5">Account</th>
                <th className="px-4 py-2.5">Subject</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Refund</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id} className="border-t border-neutral-100 transition hover:bg-neutral-50/70">
                  <td className="px-4 py-2.5 font-mono text-xs text-neutral-500">{t.id}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-neutral-500">
                    {t.accountId}
                  </td>
                  <td className="px-4 py-2.5 font-medium text-neutral-900">{t.subject}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[t.status]}`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-neutral-500">
                    {t.refundIssuedCents ? `$${(t.refundIssuedCents / 100).toFixed(2)}` : "—"}
                  </td>
                </tr>
              ))}
              {!loading && tickets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-neutral-400">
                    No tickets
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {agentRuns.length > 0 ? (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold tracking-tight text-neutral-700">
            Agent activity
          </h2>
          <div className="space-y-2">
            {agentRuns.map((run) => (
              <div
                key={run.id}
                className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm shadow-sm"
              >
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {run.outcome ? (
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          STATUS_STYLES[run.outcome] ?? "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        {run.outcome}
                      </span>
                    ) : null}
                    {run.toolCalls.map((call, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-brand-light px-2 py-0.5 text-xs font-medium text-brand-dark"
                      >
                        {call.name}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-neutral-400">
                    {timeAgo(run.createdAt)}
                    {run.durationMs != null ? ` · ${(run.durationMs / 1000).toFixed(1)}s` : ""}
                  </span>
                </div>
                <div className="text-neutral-900">{run.userMessage}</div>
                {run.assistantText ? (
                  <div className="mt-1 text-neutral-500">{run.assistantText}</div>
                ) : null}
                {run.errorMessage ? (
                  <div className="mt-1 text-red-600">{run.errorMessage}</div>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}
      </div>

      <SiteFooter />
      <ChatWidget onActionTaken={refresh} />
    </div>
  );
}
