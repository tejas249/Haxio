"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  Check,
  CircleOff,
  ShieldAlert,
  Ticket as TicketIcon,
  Users,
  X,
} from "lucide-react";
import ChatWidget from "./ChatWidget";
import type { Account } from "@/lib/data/accounts";
import type { Ticket } from "@/lib/data/tickets";
import type { RefundApproval } from "@/lib/data/approvals";

function StatTile({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Users;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3">
      <Icon size={20} className="text-neutral-400" />
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
};

export default function DashboardClient() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [approvals, setApprovals] = useState<RefundApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    let ignore = false;

    (async () => {
      const [accountsRes, ticketsRes, approvalsRes] = await Promise.all([
        fetch("/api/accounts"),
        fetch("/api/tickets"),
        fetch("/api/approvals"),
      ]);
      const [accountsData, ticketsData, approvalsData] = await Promise.all([
        accountsRes.json(),
        ticketsRes.json(),
        approvalsRes.json(),
      ]);
      if (ignore) return;
      setAccounts(accountsData);
      setTickets(ticketsData);
      setApprovals(approvalsData);
      setLoading(false);
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

  const suspended = accounts.filter((a) => a.status === "suspended").length;
  const pastDue = accounts.filter((a) => a.status === "past_due").length;
  const openTickets = tickets.filter((t) => t.status === "open").length;
  const pendingApprovals = approvals.filter((a) => a.status === "pending");

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900">Support Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Acme Cloud · the agent below can look up these accounts, cite help docs, and
          open tickets — refunds it proposes wait for approval right here.
        </p>
      </header>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
        <StatTile label="Accounts" value={accounts.length} icon={Users} />
        <StatTile label="Past due" value={pastDue} icon={AlertCircle} />
        <StatTile label="Suspended" value={suspended} icon={CircleOff} />
        <StatTile label="Open tickets" value={openTickets} icon={TicketIcon} />
        <StatTile
          label="Pending approvals"
          value={pendingApprovals.length}
          icon={ShieldAlert}
        />
      </div>

      {approvals.length > 0 ? (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold text-neutral-700">
            Refund approvals
          </h2>
          <div className="space-y-2">
            {approvals.map((a) => (
              <div
                key={a.id}
                className={`flex items-center justify-between rounded-xl border bg-white px-4 py-3 ${
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
                    className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[a.status]}`}
                  >
                    {a.status}
                  </span>
                  {a.status === "pending" ? (
                    <>
                      <button
                        onClick={() => resolveApproval(a.id, "approve")}
                        disabled={resolvingId === a.id}
                        className="flex items-center gap-1 rounded-full bg-green-600 px-3 py-1 text-xs font-medium text-white disabled:opacity-40"
                      >
                        <Check size={14} />
                        Approve
                      </button>
                      <button
                        onClick={() => resolveApproval(a.id, "deny")}
                        disabled={resolvingId === a.id}
                        className="flex items-center gap-1 rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-600 disabled:opacity-40"
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
        <h2 className="mb-3 text-sm font-semibold text-neutral-700">Accounts</h2>
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-xs text-neutral-500">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Company</th>
                <th className="px-4 py-2">Plan</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Open invoice</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => (
                <tr key={a.id} className="border-t border-neutral-100">
                  <td className="px-4 py-2 font-mono text-xs text-neutral-500">{a.id}</td>
                  <td className="px-4 py-2 text-neutral-900">{a.company}</td>
                  <td className="px-4 py-2 capitalize text-neutral-500">{a.plan}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[a.status]}`}
                    >
                      {a.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-neutral-500">
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
        <h2 className="mb-3 text-sm font-semibold text-neutral-700">Tickets</h2>
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-xs text-neutral-500">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Account</th>
                <th className="px-4 py-2">Subject</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Refund</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id} className="border-t border-neutral-100">
                  <td className="px-4 py-2 font-mono text-xs text-neutral-500">{t.id}</td>
                  <td className="px-4 py-2 font-mono text-xs text-neutral-500">
                    {t.accountId}
                  </td>
                  <td className="px-4 py-2 text-neutral-900">{t.subject}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[t.status]}`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-neutral-500">
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

      <ChatWidget onActionTaken={refresh} />
    </div>
  );
}
