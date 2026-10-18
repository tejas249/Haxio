import { describe, it, expect, vi, beforeEach } from "vitest";

const queryMock = vi.fn();
vi.mock("@/lib/db", () => ({
  pool: { query: queryMock },
}));

const { listApprovals, getApproval, createApproval, resolveApproval } = await import(
  "./approvals"
);

describe("listApprovals", () => {
  beforeEach(() => {
    queryMock.mockReset();
  });

  it("maps snake_case DB rows to camelCase RefundApproval objects", async () => {
    queryMock.mockResolvedValueOnce({
      rows: [
        {
          id: "APR-1",
          account_id: "ACC-1002",
          amount_cents: 4900,
          reason: "Duplicate charge",
          ticket_id: "TCK-4001",
          status: "pending",
          requested_at: new Date("2026-10-15T06:27:49Z"),
          resolved_at: null,
        },
      ],
    });

    const approvals = await listApprovals();

    expect(approvals).toEqual([
      {
        id: "APR-1",
        accountId: "ACC-1002",
        amountCents: 4900,
        reason: "Duplicate charge",
        ticketId: "TCK-4001",
        status: "pending",
        requestedAt: "2026-10-15T06:27:49.000Z",
        resolvedAt: undefined,
      },
    ]);
  });
});

describe("getApproval", () => {
  beforeEach(() => {
    queryMock.mockReset();
  });

  it("returns undefined when no row matches", async () => {
    queryMock.mockResolvedValueOnce({ rows: [] });

    const approval = await getApproval("APR-999");

    expect(approval).toBeUndefined();
  });
});

describe("createApproval", () => {
  beforeEach(() => {
    queryMock.mockReset();
  });

  it("passes null for ticketId when none is given", async () => {
    queryMock.mockResolvedValueOnce({
      rows: [
        {
          id: "APR-2",
          account_id: "ACC-1004",
          amount_cents: 1000,
          reason: "Goodwill credit",
          ticket_id: null,
          status: "pending",
          requested_at: new Date("2026-10-18T00:00:00Z"),
          resolved_at: null,
        },
      ],
    });

    await createApproval({
      accountId: "ACC-1004",
      amountCents: 1000,
      reason: "Goodwill credit",
    });

    expect(queryMock).toHaveBeenCalledWith(expect.any(String), [
      "ACC-1004",
      1000,
      "Goodwill credit",
      null,
    ]);
  });
});

describe("resolveApproval", () => {
  beforeEach(() => {
    queryMock.mockReset();
  });

  it("only resolves approvals that are still pending (query-level guard)", async () => {
    queryMock.mockResolvedValueOnce({ rows: [] });

    const result = await resolveApproval("APR-1", "approved");

    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining("status = 'pending'"),
      ["APR-1", "approved"],
    );
    expect(result).toBeUndefined();
  });

  it("returns the resolved row when the update succeeds", async () => {
    queryMock.mockResolvedValueOnce({
      rows: [
        {
          id: "APR-1",
          account_id: "ACC-1002",
          amount_cents: 4900,
          reason: "Duplicate charge",
          ticket_id: "TCK-4001",
          status: "denied",
          requested_at: new Date("2026-10-15T06:27:49Z"),
          resolved_at: new Date("2026-10-18T00:00:00Z"),
        },
      ],
    });

    const result = await resolveApproval("APR-1", "denied");

    expect(result?.status).toBe("denied");
    expect(result?.resolvedAt).toBe("2026-10-18T00:00:00.000Z");
  });
});
