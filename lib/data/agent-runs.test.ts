import { describe, it, expect, vi, beforeEach } from "vitest";

const queryMock = vi.fn();
vi.mock("@/lib/db", () => ({
  pool: { query: queryMock },
}));

const { listAgentRuns, createAgentRun } = await import("./agent-runs");

describe("listAgentRuns", () => {
  beforeEach(() => {
    queryMock.mockReset();
  });

  it("maps snake_case DB rows to camelCase AgentRun objects", async () => {
    queryMock.mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          created_at: new Date("2026-10-20T00:00:00Z"),
          user_message: "How do I reset my API key?",
          assistant_text: "Go to Settings > API Keys and click Revoke.",
          tool_calls: [{ name: "searchDocs", input: { query: "api key" }, output: [] }],
          finish_reason: "stop",
          outcome: "completed",
          error_message: null,
          duration_ms: 842,
        },
      ],
    });

    const runs = await listAgentRuns();

    expect(runs).toEqual([
      {
        id: 1,
        createdAt: "2026-10-20T00:00:00.000Z",
        userMessage: "How do I reset my API key?",
        assistantText: "Go to Settings > API Keys and click Revoke.",
        toolCalls: [{ name: "searchDocs", input: { query: "api key" }, output: [] }],
        finishReason: "stop",
        outcome: "completed",
        errorMessage: null,
        durationMs: 842,
      },
    ]);
  });

  it("defaults to limit 20 when not given", async () => {
    queryMock.mockResolvedValueOnce({ rows: [] });

    await listAgentRuns();

    expect(queryMock).toHaveBeenCalledWith(expect.any(String), [20]);
  });

  it("passes a custom limit through", async () => {
    queryMock.mockResolvedValueOnce({ rows: [] });

    await listAgentRuns(5);

    expect(queryMock).toHaveBeenCalledWith(expect.any(String), [5]);
  });
});

describe("createAgentRun", () => {
  beforeEach(() => {
    queryMock.mockReset();
  });

  it("serializes toolCalls to a JSON string for the jsonb column", async () => {
    queryMock.mockResolvedValueOnce({
      rows: [
        {
          id: 2,
          created_at: new Date("2026-10-20T00:00:00Z"),
          user_message: "refund please",
          assistant_text: null,
          tool_calls: [],
          finish_reason: "stop",
          outcome: "completed",
          error_message: null,
          duration_ms: 500,
        },
      ],
    });

    await createAgentRun({
      userMessage: "refund please",
      assistantText: null,
      toolCalls: [{ name: "issueRefund", input: { amountCents: 100 }, output: null }],
      finishReason: "stop",
      outcome: "completed",
      errorMessage: null,
      durationMs: 500,
    });

    const [, params] = queryMock.mock.calls[0];
    expect(params[2]).toBe(
      JSON.stringify([{ name: "issueRefund", input: { amountCents: 100 }, output: null }]),
    );
  });
});
