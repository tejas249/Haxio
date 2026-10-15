export type AccountStatus = "active" | "past_due" | "suspended";

export interface Account {
  id: string;
  company: string;
  contactEmail: string;
  plan: "starter" | "pro" | "enterprise";
  status: AccountStatus;
  openInvoiceCents: number;
  suspendedReason?: string;
  lastLogin: string;
}

// Static seed data: read synchronously at module scope so it's a
// "predictable value" under Next's Cache Components model and can be
// part of the prerendered shell with no Suspense boundary needed.
const accounts: Account[] = [
  {
    id: "ACC-1001",
    company: "Northwind Traders",
    contactEmail: "ops@northwind.example",
    plan: "pro",
    status: "active",
    openInvoiceCents: 0,
    lastLogin: "2026-10-12T09:14:00Z",
  },
  {
    id: "ACC-1002",
    company: "Bluebird Analytics",
    contactEmail: "billing@bluebird.example",
    plan: "starter",
    status: "past_due",
    openInvoiceCents: 4900,
    lastLogin: "2026-10-10T17:02:00Z",
  },
  {
    id: "ACC-1003",
    company: "Granite Logistics",
    contactEmail: "it@graniteco.example",
    plan: "enterprise",
    status: "suspended",
    openInvoiceCents: 129900,
    suspendedReason: "Unpaid invoice INV-8831 from 2026-09-12",
    lastLogin: "2026-09-29T11:45:00Z",
  },
  {
    id: "ACC-1004",
    company: "Cedar & Co",
    contactEmail: "hello@cedarco.example",
    plan: "pro",
    status: "active",
    openInvoiceCents: 0,
    lastLogin: "2026-10-13T20:30:00Z",
  },
];

export function listAccounts(): Account[] {
  return accounts;
}

export function getAccount(accountId: string): Account | undefined {
  return accounts.find(
    (a) => a.id.toLowerCase() === accountId.trim().toLowerCase(),
  );
}
