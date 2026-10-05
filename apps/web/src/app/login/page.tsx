import { redirect } from "next/navigation";
import { LogIn, FlaskConical } from "lucide-react";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";
import { getUser } from "@/lib/session";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  if (await getUser()) redirect("/servers");

  const t = getDictionary(await getLocale());
  const { error } = await searchParams;
  const message = typeof error === "string" ? t.auth.errors[error] : undefined;
  const dev = process.env.NODE_ENV !== "production";

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="card glow-green w-full max-w-md p-8 text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-foreground text-xl font-black text-background">
          H
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">{t.auth.loginTitle}</h1>
        <p className="mt-2 text-sm text-muted">{t.auth.loginSubtitle}</p>

        {message && <p className="mt-5 rounded-xl bg-bad/15 px-4 py-3 text-sm text-bad">{message}</p>}

        <a href="/api/auth/discord" className="btn btn-primary mt-6 w-full justify-center py-2.5">
          <LogIn className="size-4" />
          {t.auth.discord}
        </a>

        {dev && (
          <form action="/api/auth/dev" method="post" className="mt-3">
            <button className="btn btn-secondary w-full justify-center py-2.5">
              <FlaskConical className="size-4" />
              {t.auth.dev}
            </button>
            <p className="mt-2 text-xs text-muted-2">{t.auth.devNote}</p>
          </form>
        )}
      </div>
    </main>
  );
}
