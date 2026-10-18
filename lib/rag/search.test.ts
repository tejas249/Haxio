import { describe, it, expect, vi, beforeEach } from "vitest";

const queryMock = vi.fn();
const embedOneMock = vi.fn();

vi.mock("@/lib/db", () => ({
  pool: { query: queryMock },
}));
vi.mock("@/lib/rag/embed", () => ({
  embedOne: embedOneMock,
}));

const { search } = await import("./search");

describe("search", () => {
  beforeEach(() => {
    queryMock.mockReset();
    embedOneMock.mockReset();
  });

  it("embeds the query and passes it as a vector literal with topK as the limit", async () => {
    embedOneMock.mockResolvedValueOnce([0.1, 0.2, 0.3]);
    queryMock.mockResolvedValueOnce({ rows: [] });

    await search("why is my account suspended", 5);

    expect(embedOneMock).toHaveBeenCalledWith("why is my account suspended");
    expect(queryMock).toHaveBeenCalledWith(expect.any(String), ["[0.1,0.2,0.3]", 5]);
  });

  it("defaults topK to 3", async () => {
    embedOneMock.mockResolvedValueOnce([0.5]);
    queryMock.mockResolvedValueOnce({ rows: [] });

    await search("some query");

    expect(queryMock).toHaveBeenCalledWith(expect.any(String), ["[0.5]", 3]);
  });

  it("flips cosine distance into a 0-1 similarity score and strips the title line", async () => {
    embedOneMock.mockResolvedValueOnce([0.1]);
    queryMock.mockResolvedValueOnce({
      rows: [
        {
          id: "refunds.md",
          title: "Refund policy",
          content: "# Refund policy\n\nSupport can issue a full refund when...",
          distance: 0.28,
        },
      ],
    });

    const [result] = await search("refund");

    expect(result.source).toBe("refunds.md");
    expect(result.title).toBe("Refund policy");
    expect(result.score).toBe(0.72);
    expect(result.excerpt).not.toMatch(/^#/);
    expect(result.excerpt).toContain("Support can issue a full refund");
  });

  it("truncates long content to 500 characters", async () => {
    embedOneMock.mockResolvedValueOnce([0.1]);
    queryMock.mockResolvedValueOnce({
      rows: [
        {
          id: "long.md",
          title: "Long doc",
          content: "# Long doc\n\n" + "x".repeat(1000),
          distance: 0.1,
        },
      ],
    });

    const [result] = await search("long");

    expect(result.excerpt.length).toBe(500);
  });
});
