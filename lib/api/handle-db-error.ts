// Shared by the read-only dashboard GET routes: a DB outage should come
// back as a clean {error} JSON body the client can always res.json(),
// not Next's default HTML 500 page.
export async function withDbError<T>(fn: () => Promise<T>): Promise<Response> {
  try {
    return Response.json(await fn());
  } catch (err) {
    console.error("Database query failed:", err);
    return Response.json(
      { error: "Database unavailable, try again shortly." },
      { status: 503 },
    );
  }
}

export async function parseJsonBody<T>(req: Request): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}
