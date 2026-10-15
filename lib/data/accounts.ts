import { pool } from "@/lib/db";

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

interface AccountRow {
  id: string;
  company: string;
  contact_email: string;
  plan: Account["plan"];
  status: AccountStatus;
  open_invoice_cents: number;
  suspended_reason: string | null;
  last_login: Date;
}

function toAccount(row: AccountRow): Account {
  return {
    id: row.id,
    company: row.company,
    contactEmail: row.contact_email,
    plan: row.plan,
    status: row.status,
    openInvoiceCents: row.open_invoice_cents,
    suspendedReason: row.suspended_reason ?? undefined,
    lastLogin: row.last_login.toISOString(),
  };
}

export async function listAccounts(): Promise<Account[]> {
  const { rows } = await pool.query<AccountRow>(
    "select * from accounts order by id",
  );
  return rows.map(toAccount);
}

export async function getAccount(accountId: string): Promise<Account | undefined> {
  const { rows } = await pool.query<AccountRow>(
    "select * from accounts where lower(id) = lower($1)",
    [accountId.trim()],
  );
  return rows[0] ? toAccount(rows[0]) : undefined;
}
