import { pool } from "@/lib/db";

export type ApprovalStatus = "pending" | "approved" | "denied";

export interface RefundApproval {
  id: string;
  accountId: string;
  amountCents: number;
  reason: string;
  ticketId?: string;
  status: ApprovalStatus;
  requestedAt: string;
  resolvedAt?: string;
}

interface ApprovalRow {
  id: string;
  account_id: string;
  amount_cents: number;
  reason: string;
  ticket_id: string | null;
  status: ApprovalStatus;
  requested_at: Date;
  resolved_at: Date | null;
}

function toApproval(row: ApprovalRow): RefundApproval {
  return {
    id: row.id,
    accountId: row.account_id,
    amountCents: row.amount_cents,
    reason: row.reason,
    ticketId: row.ticket_id ?? undefined,
    status: row.status,
    requestedAt: row.requested_at.toISOString(),
    resolvedAt: row.resolved_at?.toISOString(),
  };
}

export async function listApprovals(): Promise<RefundApproval[]> {
  const { rows } = await pool.query<ApprovalRow>(
    "select * from refund_approvals order by requested_at desc",
  );
  return rows.map(toApproval);
}

export async function getApproval(id: string): Promise<RefundApproval | undefined> {
  const { rows } = await pool.query<ApprovalRow>(
    "select * from refund_approvals where id = $1",
    [id],
  );
  return rows[0] ? toApproval(rows[0]) : undefined;
}

export async function createApproval(input: {
  accountId: string;
  amountCents: number;
  reason: string;
  ticketId?: string;
}): Promise<RefundApproval> {
  const { rows } = await pool.query<ApprovalRow>(
    `insert into refund_approvals (account_id, amount_cents, reason, ticket_id)
     values ($1, $2, $3, $4)
     returning *`,
    [input.accountId, input.amountCents, input.reason, input.ticketId ?? null],
  );
  return toApproval(rows[0]);
}

export async function resolveApproval(
  id: string,
  decision: "approved" | "denied",
): Promise<RefundApproval | undefined> {
  const { rows } = await pool.query<ApprovalRow>(
    `update refund_approvals
     set status = $2, resolved_at = now()
     where id = $1 and status = 'pending'
     returning *`,
    [id, decision],
  );
  return rows[0] ? toApproval(rows[0]) : undefined;
}
