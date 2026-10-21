import { checkPassword, createSessionValue, SESSION_COOKIE } from "@/lib/auth/session";

export async function POST(req: Request) {
  const { password } = await req.json();

  if (typeof password !== "string" || !checkPassword(password)) {
    return Response.json({ error: "Incorrect password" }, { status: 401 });
  }

  const response = Response.json({ ok: true });
  response.headers.append(
    "Set-Cookie",
    `${SESSION_COOKIE}=${createSessionValue()}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}${
      process.env.NODE_ENV === "production" ? "; Secure" : ""
    }`,
  );
  return response;
}
