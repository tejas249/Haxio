import { describe, it, expect, beforeEach, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  vi.resetModules();
  process.env = { ...ORIGINAL_ENV, SESSION_SECRET: "test-secret", ADMIN_PASSWORD: "correct-horse" };
});

describe("createSessionValue / isValidSession", () => {
  it("round-trips a freshly created session as valid", async () => {
    const { createSessionValue, isValidSession } = await import("./session");
    expect(isValidSession(createSessionValue())).toBe(true);
  });

  it("rejects an undefined or empty value", async () => {
    const { isValidSession } = await import("./session");
    expect(isValidSession(undefined)).toBe(false);
    expect(isValidSession(null)).toBe(false);
    expect(isValidSession("")).toBe(false);
  });

  it("rejects a malformed value with no signature", async () => {
    const { isValidSession } = await import("./session");
    expect(isValidSession("just-some-garbage")).toBe(false);
  });

  it("rejects a tampered expiry (signature won't match)", async () => {
    const { createSessionValue, isValidSession } = await import("./session");
    const [, signature] = createSessionValue().split(".");
    const farFuture = String(Date.now() + 1000 * 60 * 60 * 24 * 365);
    expect(isValidSession(`${farFuture}.${signature}`)).toBe(false);
  });

  it("rejects a session signed with a different secret", async () => {
    const a = await import("./session");
    const value = a.createSessionValue();

    vi.resetModules();
    process.env.SESSION_SECRET = "a-different-secret";
    const b = await import("./session");
    expect(b.isValidSession(value)).toBe(false);
  });

  it("rejects an expired session even with a valid signature", async () => {
    vi.resetModules();
    vi.useFakeTimers();
    try {
      const { createSessionValue, isValidSession } = await import("./session");
      const value = createSessionValue();
      expect(isValidSession(value)).toBe(true);

      vi.advanceTimersByTime(1000 * 60 * 60 * 24 * 8); // 8 days, TTL is 7
      expect(isValidSession(value)).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("checkPassword", () => {
  it("accepts the configured password", async () => {
    const { checkPassword } = await import("./session");
    expect(checkPassword("correct-horse")).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const { checkPassword } = await import("./session");
    expect(checkPassword("wrong")).toBe(false);
  });

  it("rejects when ADMIN_PASSWORD isn't configured", async () => {
    vi.resetModules();
    process.env = { ...ORIGINAL_ENV, SESSION_SECRET: "test-secret", ADMIN_PASSWORD: "" };
    const { checkPassword } = await import("./session");
    expect(checkPassword("anything")).toBe(false);
  });
});
