import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { exchangeCode, fetchManageableGuilds, fetchUser } from "@/lib/discord";
import { createSession, saveLogin } from "@/lib/session";

const fail = (reason: string) => NextResponse.redirect(new URL(`/login?error=${reason}`, process.env.AUTH_URL));

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const jar = await cookies();
  const expected = jar.get("helmo_oauth_state")?.value;
  jar.delete("helmo_oauth_state");

  // Without a matching state the request may have been forged (CSRF).
  if (!code || !state || !expected || state !== expected) return fail("invalid_state");

  try {
    const token = await exchangeCode(code);
    const [user, guilds] = await Promise.all([fetchUser(token), fetchManageableGuilds(token)]);
    await saveLogin(
      {
        id: user.id,
        username: user.username,
        displayName: user.global_name,
        avatar: user.avatar,
        email: user.email ?? null,
      },
      guilds.map((g) => ({ guildId: g.id, name: g.name, icon: g.icon, isOwner: g.owner })),
    );
    await createSession(user.id);
  } catch (err) {
    console.error("Discord login failed:", err);
    return fail("discord_failed");
  }
  return NextResponse.redirect(new URL("/servers", process.env.AUTH_URL));
}
