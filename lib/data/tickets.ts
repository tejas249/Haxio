import { pool } from "@/lib/db";

export type TicketPriority = "low" | "normal" | "high";
export type TicketStatus = "open" | "resolved";

export interface Ticket {
  id: string;
  accountId: string;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  refundIssuedCents?: number;
}

interface TicketRow {
  id: string;
  account_id: string;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  created_at: Date;
  refund_issued_cents: number | null;
}

function toTicket(row: TicketRow): Ticket {
  return {
    id: row.id,
    accountId: row.account_id,
    subject: row.subject,
    description: row.description,
    priority: row.priority,
    status: row.status,
    createdAt: row.created_at.toISOString(),
    refundIssuedCents: row.refund_issued_cents ?? undefined,
  };
}

export async function listTickets(): Promise<Ticket[]> {
  const { rows } = await pool.query<TicketRow>(
    "select * from tickets order by created_at desc",
  );
  return rows.map(toTicket);
}

export async function createTicket(input: {
  accountId: string;
  subject: string;
  description: string;
  priority?: TicketPriority;
}): Promise<Ticket> {
  const { rows } = await pool.query<TicketRow>(
    `insert into tickets (account_id, subject, description, priority)
     values ($1, $2, $3, $4)
     returning *`,
    [input.accountId, input.subject, input.description, input.priority ?? "normal"],
  );
  return toTicket(rows[0]);
}

export async function attachRefundToTicket(
  ticketId: string,
  amountCents: number,
): Promise<Ticket | undefined> {
  const { rows } = await pool.query<TicketRow>(
    `update tickets set refund_issued_cents = $2 where id = $1 returning *`,
    [ticketId, amountCents],
  );
  return rows[0] ? toTicket(rows[0]) : undefined;
}
