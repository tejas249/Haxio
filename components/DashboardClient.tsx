"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CircleOff, Ticket as TicketIcon, Users } from "lucide-react";
import ChatWidget from "./ChatWidget";
import type { Account } from "@/lib/data/accounts";
import type { Ticket } from "@/lib/data/tickets";

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
};

export default function DashboardClient() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    let ignore = false;

    (async () => {
      const [accountsRes, ticketsRes] = await Promise.all([
        fetch("/api/accounts"),
        fetch("/api/tickets"),
      ]);
      const [accountsData, ticketsData] = await Promise.all([
        accountsRes.json(),
        ticketsRes.json(),
      ]);
      if (ignore) return;
      setAccounts(accountsData);
      setTickets(ticketsData);
      setLoading(false);
    })();

    return () => {
      ignore = true;
    };
  }, [refreshKey]);

  const suspended = accounts.filter((a) => a.status === "suspended").length;
  const pastDue = accounts.filter((a) => a.status === "past_due").length;
  const openTickets = tickets.filter((t) => t.status === "open").length;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900">Support Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Acme Cloud · the agent below can look up these accounts, cite help docs, open
          tickets, and issue refunds — try it from the chat bubble.
        </p>
      </header>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="Accounts" value={accounts.length} icon={Users} />
        <StatTile label="Past due" value={pastDue} icon={AlertCircle} />
        <StatTile label="Suspended" value={suspended} icon={CircleOff} />
        <StatTile label="Open tickets" value={openTickets} icon={TicketIcon} />
      </div>

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
