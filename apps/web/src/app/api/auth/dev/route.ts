import { NextResponse } from "next/server";
import { createSession, saveLogin } from "@/lib/session";

/** Development-only login so the panel can be used before a Discord app exists. */
export async function POST() {
  if (process.env.NODE_ENV === "production") return new NextResponse("Not found", { status: 404 });

  await saveLogin(
    { id: "000000000000000001", username: "umt", displayName: "Umt", avatar: null, email: "umt@helmo.dev" },
    [
      { guildId: "100000000000000001", name: "Umt Server", icon: null, isOwner: true },
      { guildId: "100000000000000002", name: "Test Community", icon: null, isOwner: false },
      { guildId: "100000000000000003", name: "Gaming Hub", icon: null, isOwner: false },
    ],
  );
  await createSession("000000000000000001");
  return NextResponse.redirect(new URL("/servers", process.env.AUTH_URL), 303);
}
