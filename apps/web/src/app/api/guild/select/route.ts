import { NextResponse, type NextRequest } from "next/server";
import { getUser, getUserGuilds, selectGuildCookie } from "@/lib/session";

export async function GET(request: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.redirect(new URL("/login", process.env.AUTH_URL));

  const id = request.nextUrl.searchParams.get("id");
  // Only servers this user can manage may be selected.
  const owned = (await getUserGuilds(user.id)).some((g) => g.guildId === id);
  if (!id || !owned) return NextResponse.redirect(new URL("/servers", process.env.AUTH_URL));

  await selectGuildCookie(id);
  return NextResponse.redirect(new URL("/dashboard/stats/guild", process.env.AUTH_URL));
}
