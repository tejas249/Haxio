import { getApproval, resolveApproval } from "@/lib/data/approvals";
import { attachRefundToTicket } from "@/lib/data/tickets";

export async function PATCH(req: Request, ctx: RouteContext<"/api/approvals/[id]">) {
  const { id } = await ctx.params;
  const { action } = await req.json();

  if (action !== "approve" && action !== "deny") {
    return Response.json(
      { error: "action must be 'approve' or 'deny'" },
      { status: 400 },
    );
  }

  const approval = await getApproval(id);
  if (!approval) {
    return Response.json({ error: `No approval found with ID ${id}` }, { status: 404 });
  }
  if (approval.status !== "pending") {
    return Response.json(
      { error: `Approval ${id} is already ${approval.status}` },
      { status: 409 },
    );
  }

  const resolved = await resolveApproval(id, action === "approve" ? "approved" : "denied");

  // Only a real approval moves money (attaches the refund to the ticket).
  // A denial just records the decision — nothing on the ticket changes.
  if (resolved?.status === "approved" && resolved.ticketId) {
    await attachRefundToTicket(resolved.ticketId, resolved.amountCents);
  }

  return Response.json(resolved);
}
