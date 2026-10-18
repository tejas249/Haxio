import { describe, it, expect, vi, beforeEach } from "vitest";

const queryMock = vi.fn();
vi.mock("@/lib/db", () => ({
  pool: { query: queryMock },
}));

const { listAccounts, getAccount } = await import("./accounts");

describe("listAccounts", () => {
  beforeEach(() => {
    queryMock.mockReset();
  });

  it("maps snake_case DB rows to camelCase Account objects", async () => {
    queryMock.mockResolvedValueOnce({
      rows: [
        {
          id: "ACC-1001",
          company: "Northwind Traders",
          contact_email: "ops@northwind.example",
          plan: "pro",
          status: "active",
          open_invoice_cents: 0,
          suspended_reason: null,
          last_login: new Date("2026-10-12T09:14:00Z"),
        },
      ],
    });

    const accounts = await listAccounts();

    expect(accounts).toEqual([
      {
        id: "ACC-1001",
        company: "Northwind Traders",
        contactEmail: "ops@northwind.example",
        plan: "pro",
        status: "active",
        openInvoiceCents: 0,
        suspendedReason: undefined,
        lastLogin: "2026-10-12T09:14:00.000Z",
      },
    ]);
  });

  it("keeps a real suspendedReason when the column isn't null", async () => {
    queryMock.mockResolvedValueOnce({
      rows: [
        {
          id: "ACC-1003",
          company: "Granite Logistics",
          contact_email: "it@graniteco.example",
          plan: "enterprise",
          status: "suspended",
          open_invoice_cents: 129900,
          suspended_reason: "Unpaid invoice INV-8831",
          last_login: new Date("2026-09-29T11:45:00Z"),
        },
      ],
    });

    const [account] = await listAccounts();

    expect(account.suspendedReason).toBe("Unpaid invoice INV-8831");
  });
});

describe("getAccount", () => {
  beforeEach(() => {
    queryMock.mockReset();
  });

  it("looks up by id case-insensitively and trims whitespace", async () => {
    queryMock.mockResolvedValueOnce({ rows: [] });

    await getAccount("  acc-1002  ");

    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining("lower(id) = lower($1)"),
      ["acc-1002"],
    );
  });

  it("returns undefined when no row matches", async () => {
    queryMock.mockResolvedValueOnce({ rows: [] });

    const account = await getAccount("ACC-9999");

    expect(account).toBeUndefined();
  });
});
