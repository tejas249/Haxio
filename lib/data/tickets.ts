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

// In-memory mutable store. Resets whenever the dev/server process
// restarts — intentional for this demo. Swap for a real table (e.g.
// Neon Postgres) to persist across restarts/instances.
const tickets: Ticket[] = [
  {
    id: "TCK-4001",
    accountId: "ACC-1002",
    subject: "Invoice looks wrong",
    description: "Customer flagged a possible duplicate charge on INV-7742.",
    priority: "normal",
    status: "open",
    createdAt: "2026-10-09T13:00:00Z",
  },
];

let nextId = 4002;

export function listTickets(): Ticket[] {
  return [...tickets].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function createTicket(input: {
  accountId: string;
  subject: string;
  description: string;
  priority?: TicketPriority;
}): Ticket {
  const ticket: Ticket = {
    id: `TCK-${nextId++}`,
    accountId: input.accountId,
    subject: input.subject,
    description: input.description,
    priority: input.priority ?? "normal",
    status: "open",
    createdAt: new Date().toISOString(),
  };
  tickets.push(ticket);
  return ticket;
}

export function attachRefundToTicket(ticketId: string, amountCents: number) {
  const ticket = tickets.find((t) => t.id === ticketId);
  if (ticket) ticket.refundIssuedCents = amountCents;
  return ticket;
}
