import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";
import { I18nProvider } from "@/i18n/provider";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin", "latin-ext"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Helmo",
  description: "Discord bot infrastructure, hosting and management panel.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();

  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <I18nProvider locale={locale} dictionary={getDictionary(locale)}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
