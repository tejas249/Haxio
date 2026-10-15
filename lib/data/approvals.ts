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

// In-memory, mutable — same intentional simplification as tickets.ts.
const approvals: RefundApproval[] = [];

let nextId = 1;

export function listApprovals(): RefundApproval[] {
  return [...approvals].sort(
    (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime(),
  );
}

export function getApproval(id: string): RefundApproval | undefined {
  return approvals.find((a) => a.id === id);
}

export function createApproval(input: {
  accountId: string;
  amountCents: number;
  reason: string;
  ticketId?: string;
}): RefundApproval {
  const approval: RefundApproval = {
    id: `APR-${nextId++}`,
    accountId: input.accountId,
    amountCents: input.amountCents,
    reason: input.reason,
    ticketId: input.ticketId,
    status: "pending",
    requestedAt: new Date().toISOString(),
  };
  approvals.push(approval);
  return approval;
}

export function resolveApproval(
  id: string,
  decision: "approved" | "denied",
): RefundApproval | undefined {
  const approval = approvals.find((a) => a.id === id);
  if (!approval || approval.status !== "pending") return undefined;
  approval.status = decision;
  approval.resolvedAt = new Date().toISOString();
  return approval;
}
