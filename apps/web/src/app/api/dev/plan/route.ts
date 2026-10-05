import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { isPlanKey } from "@/lib/plans";
import { getUser } from "@/lib/session";

/** Development only: switch the logged-in account's plan to try the limits. Payments replace this in v0.7. */
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") return new NextResponse("Not found", { status: 404 });
  const user = await getUser();
  const plan = request.nextUrl.searchParams.get("plan");
  if (!user || !isPlanKey(plan)) return new NextResponse("Bad request", { status: 400 });

  await db.update(users).set({ plan }).where(eq(users.id, user.id));
  return NextResponse.redirect(new URL("/dashboard/bot-settings/bots", process.env.AUTH_URL));
}
