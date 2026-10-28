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
  Inbox,
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
  ink: "bg-neutral-100 text-ink",
  amber: "bg-amber-50 text-amber-600",
  red: "bg-red-50 text-red-600",
} as const;

function StatTile({
  label,
  value,
  icon: Icon,
  tone = "brand",
  highlight = false,
}: {
  label: string;
  value: number;
  icon: typeof Users;
  tone?: keyof typeof TILE_TONES;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border bg-white px-4 py-3.5 shadow-sm transition hover:shadow-md ${
        highlight ? "border-amber-300 ring-1 ring-amber-200" : "border-neutral-200"
      }`}
    >
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${TILE_TONES[tone]}`}>
        <Icon size={19} />
      </div>
      <div>
        <div className="text-2xl font-semibold tracking-tight text-neutral-900">{value}</div>
        <div className="text-xs text-neutral-500">{label}</div>
      </div>
    </div>
  );
}

function SectionHeading({ icon: Icon, title }: { icon: typeof Users; title: string }) {
  return (
    <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-tight text-neutral-700">
      <Icon size={15} className="text-neutral-400" />
      {title}
    </h2>
  );
}

function TableSkeleton({ cols }: { cols: number }) {
  return (
    <>
      {[0, 1, 2].map((row) => (
        <tr key={row} className="border-t border-neutral-100">
          {Array.from({ length: cols }).map((_, col) => (
            <td key={col} className="px-4 py-3">
              <div className="h-3.5 w-full max-w-24 animate-pulse rounded bg-neutral-100" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function EmptyRow({ colSpan, label }: { colSpan: number; label: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center text-neutral-400">
        <div className="flex flex-col items-center gap-1.5">
          <Inbox size={20} className="text-neutral-300" />
          <span className="text-sm">{label}</span>
        </div>
      </td>
    </tr>
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
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [resolving, setResolving] = useState<{ id: string; action: "approve" | "deny" } | null>(
    null,
  );
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    let ignore = false;

    (async () => {
      setLoadError(null);
      setRefreshing(true);
      try {
        const [accountsRes, ticketsRes, approvalsRes, agentRunsRes] = await Promise.all([
          fetch("/api/accounts"),
          fetch("/api/tickets"),
          fetch("/api/approvals"),
          fetch("/api/agent-runs"),
        ]);
        const responses = [accountsRes, ticketsRes, approvalsRes, agentRunsRes];
        if (responses.some((res) => res.status === 401)) {
          router.push("/login");
          return;
        }
        for (const res of responses) {
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
        if (!ignore) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    })();

    return () => {
      ignore = true;
    };
  }, [refreshKey, router]);

  const resolveApproval = async (id: string, action: "approve" | "deny") => {
    setResolving({ id, action });
    setResolveError(null);
    try {
      const res = await fetch(`/api/approvals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Request failed with status ${res.status}`);
      }
      refresh();
    } catch (err) {
      setResolveError(err instanceof Error ? err.message : "Couldn't update the approval.");
    } finally {
      setResolving(null);
    }
  };

  const logout = async () => {
    setLoggingOut(true);
    setLogoutError(null);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) throw new Error(`Logout failed with status ${res.status}`);
      router.push("/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
      setLogoutError("Couldn't log out — check your connection and try again.");
    }
  };

  const suspended = accounts.filter((a) => a.status === "suspended").length;
  const pastDue = accounts.filter((a) => a.status === "past_due").length;
  const openTickets = tickets.filter((t) => t.status === "open").length;
  const pendingApprovals = approvals.filter((a) => a.status === "pending");

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="shrink-0">
              <HaxioMark size={32} />
            </Link>
            <div className="hidden h-6 w-px bg-neutral-200 sm:block" />
            <div className="hidden sm:block">
              <div className="text-sm font-semibold text-neutral-900">Haxio</div>
              <div className="text-xs text-neutral-400">Support dashboard</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 sm:flex"
            >
              <ArrowLeft size={13} />
              Back to Haxio
            </Link>
            <div className="flex flex-col items-end gap-1">
              <button
                onClick={logout}
                disabled={loggingOut}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50 disabled:opacity-60"
              >
                <LogOut size={14} className={loggingOut ? "animate-pulse" : ""} />
                {loggingOut ? "Logging out…" : "Log out"}
              </button>
              {logoutError ? (
                <span className="text-xs text-red-600">{logoutError}</span>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Support Dashboard
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-neutral-500">
          Acme Cloud · the agent below can look up these accounts, cite help docs, and
          open tickets — refunds it proposes wait for approval right here.
        </p>
      </div>

      {loadError ? (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0" />
            {loadError}
          </div>
          <button
            onClick={refresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 shadow-sm transition hover:bg-red-100 disabled:opacity-60"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Retrying…" : "Retry"}
          </button>
        </div>
      ) : null}

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile label="Accounts" value={accounts.length} icon={Users} />
        <StatTile label="Past due" value={pastDue} icon={AlertCircle} tone="amber" />
        <StatTile label="Suspended" value={suspended} icon={CircleOff} tone="red" />
        <StatTile label="Open tickets" value={openTickets} icon={TicketIcon} />
        <StatTile
          label="Pending approvals"
          value={pendingApprovals.length}
          icon={ShieldAlert}
          tone={pendingApprovals.length > 0 ? "amber" : "brand"}
          highlight={pendingApprovals.length > 0}
        />
        <StatTile label="Agent runs" value={agentRuns.length} icon={Activity} tone="ink" />
      </div>

      {approvals.length > 0 ? (
        <section className="mb-8">
          <SectionHeading icon={ShieldAlert} title="Refund approvals" />
          {resolveError ? (
            <div className="mb-2 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              <AlertTriangle size={14} className="shrink-0" />
              {resolveError}
            </div>
          ) : null}
          <div className="space-y-2">
            {approvals.map((a) => (
              <div
                key={a.id}
                className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border-y border-r bg-white py-3 pl-4 pr-4 shadow-sm ${
                  a.status === "pending"
                    ? "border-amber-200 border-l-4 border-l-amber-400"
                    : "border-neutral-200 border-l-4 border-l-neutral-200"
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
                        disabled={resolving?.id === a.id}
                        className="flex items-center gap-1 rounded-full bg-green-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-green-600/30 transition hover:bg-green-700 hover:shadow-md disabled:opacity-40 disabled:shadow-none"
                      >
                        <Check
                          size={14}
                          className={
                            resolving?.id === a.id && resolving.action === "approve"
                              ? "animate-pulse"
                              : ""
                          }
                        />
                        {resolving?.id === a.id && resolving.action === "approve"
                          ? "Approving…"
                          : "Approve"}
                      </button>
                      <button
                        onClick={() => resolveApproval(a.id, "deny")}
                        disabled={resolving?.id === a.id}
                        className="flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                      >
                        <X
                          size={14}
                          className={
                            resolving?.id === a.id && resolving.action === "deny"
                              ? "animate-pulse"
                              : ""
                          }
                        />
                        {resolving?.id === a.id && resolving.action === "deny"
                          ? "Denying…"
                          : "Deny"}
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
        <SectionHeading icon={Users} title="Accounts" />
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
              {loading ? <TableSkeleton cols={5} /> : null}
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
                <EmptyRow colSpan={5} label="No accounts" />
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <SectionHeading icon={TicketIcon} title="Tickets" />
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
              {loading ? <TableSkeleton cols={5} /> : null}
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
                <EmptyRow colSpan={5} label="No tickets" />
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {agentRuns.length > 0 ? (
        <section className="mt-8">
          <SectionHeading icon={Activity} title="Agent activity" />
          <div className="relative space-y-3 before:absolute before:bottom-2 before:left-[13px] before:top-2 before:w-px before:bg-neutral-200">
            {agentRuns.map((run) => (
              <div key={run.id} className="relative flex gap-3 pl-0">
                <div className="relative z-[1] mt-3.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white">
                  <div className="h-2 w-2 rounded-full bg-brand" />
                </div>
                <div className="flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm shadow-sm">
                  <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
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
