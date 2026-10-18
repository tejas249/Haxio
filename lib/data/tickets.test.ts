import { describe, it, expect, vi, beforeEach } from "vitest";

const queryMock = vi.fn();
vi.mock("@/lib/db", () => ({
  pool: { query: queryMock },
}));

const { listTickets, createTicket, attachRefundToTicket } = await import("./tickets");

describe("listTickets", () => {
  beforeEach(() => {
    queryMock.mockReset();
  });

  it("maps snake_case DB rows to camelCase Ticket objects", async () => {
    queryMock.mockResolvedValueOnce({
      rows: [
        {
          id: "TCK-4001",
          account_id: "ACC-1002",
          subject: "Invoice looks wrong",
          description: "Possible duplicate charge.",
          priority: "normal",
          status: "open",
          created_at: new Date("2026-10-09T13:00:00Z"),
          refund_issued_cents: null,
        },
      ],
    });

    const tickets = await listTickets();

    expect(tickets).toEqual([
      {
        id: "TCK-4001",
        accountId: "ACC-1002",
        subject: "Invoice looks wrong",
        description: "Possible duplicate charge.",
        priority: "normal",
        status: "open",
        createdAt: "2026-10-09T13:00:00.000Z",
        refundIssuedCents: undefined,
      },
    ]);
  });
});

describe("createTicket", () => {
  beforeEach(() => {
    queryMock.mockReset();
  });

  it("defaults priority to normal when not given", async () => {
    queryMock.mockResolvedValueOnce({
      rows: [
        {
          id: "TCK-4002",
          account_id: "ACC-1001",
          subject: "Can't log in",
          description: "Locked out after password reset.",
          priority: "normal",
          status: "open",
          created_at: new Date("2026-10-18T00:00:00Z"),
          refund_issued_cents: null,
        },
      ],
    });

    await createTicket({
      accountId: "ACC-1001",
      subject: "Can't log in",
      description: "Locked out after password reset.",
    });

    expect(queryMock).toHaveBeenCalledWith(expect.any(String), [
      "ACC-1001",
      "Can't log in",
      "Locked out after password reset.",
      "normal",
    ]);
  });

  it("passes an explicit priority through unchanged", async () => {
    queryMock.mockResolvedValueOnce({
      rows: [
        {
          id: "TCK-4003",
          account_id: "ACC-1003",
          subject: "Urgent outage",
          description: "Production down.",
          priority: "high",
          status: "open",
          created_at: new Date("2026-10-18T00:00:00Z"),
          refund_issued_cents: null,
        },
      ],
    });

    await createTicket({
      accountId: "ACC-1003",
      subject: "Urgent outage",
      description: "Production down.",
      priority: "high",
    });

    expect(queryMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.arrayContaining(["high"]),
    );
  });
});

describe("attachRefundToTicket", () => {
  beforeEach(() => {
    queryMock.mockReset();
  });

  it("returns the updated ticket with the refund amount mapped", async () => {
    queryMock.mockResolvedValueOnce({
      rows: [
        {
          id: "TCK-4001",
          account_id: "ACC-1002",
          subject: "Invoice looks wrong",
          description: "Possible duplicate charge.",
          priority: "normal",
          status: "open",
          created_at: new Date("2026-10-09T13:00:00Z"),
          refund_issued_cents: 4900,
        },
      ],
    });

    const ticket = await attachRefundToTicket("TCK-4001", 4900);

    expect(ticket?.refundIssuedCents).toBe(4900);
    expect(queryMock).toHaveBeenCalledWith(expect.any(String), ["TCK-4001", 4900]);
  });

  it("returns undefined when the ticket doesn't exist", async () => {
    queryMock.mockResolvedValueOnce({ rows: [] });

    const ticket = await attachRefundToTicket("TCK-9999", 100);

    expect(ticket).toBeUndefined();
  });
});
