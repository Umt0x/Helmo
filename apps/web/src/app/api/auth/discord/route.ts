import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { authorizeUrl, isDiscordConfigured } from "@/lib/discord";

export async function GET() {
  if (!isDiscordConfigured()) {
    return NextResponse.redirect(new URL("/login?error=not_configured", process.env.AUTH_URL));
  }
  const state = randomBytes(16).toString("base64url");
  (await cookies()).set("helmo_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  return NextResponse.redirect(authorizeUrl(state));
}
