import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { DEV_USER, realDevGuilds } from "@/lib/dev";
import { createSession, saveLogin } from "@/lib/session";


/** Development-only login so the panel can be used before a Discord app exists. */
export async function POST() {
  if (process.env.NODE_ENV === "production") return new NextResponse("Not found", { status: 404 });

  // The servers the test user's bots are really in: settings saved for them match the ids Discord sends to the bot.
  const real = await realDevGuilds();

  // With no real servers yet, fall back to made-up ones so the panel can still be explored.
  const fake = [
    { guildId: "100000000000000001", name: "Umt Server", icon: null },
    { guildId: "100000000000000002", name: "Test Community", icon: null },
    { guildId: "100000000000000003", name: "Gaming Hub", icon: null },
  ];

  await saveLogin(
    { id: DEV_USER, username: "umt", displayName: "Umt", avatar: null, email: "umt@helmo.dev" },
    (real.length ? real : fake).map((g) => ({ ...g, isOwner: true })),
  );
  // The test user is on Pro so every feature can be tried.
  await db.update(users).set({ plan: "pro" }).where(eq(users.id, DEV_USER));
  await createSession(DEV_USER);
  return NextResponse.redirect(new URL("/servers", process.env.AUTH_URL), 303);
}
