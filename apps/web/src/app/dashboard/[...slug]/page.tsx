import { ComingSoon } from "@/components/coming-soon";
import { ConfigPage } from "@/components/config-page";
import { pages } from "@/content";

export default async function DashboardPage({ params }: PageProps<"/dashboard/[...slug]">) {
  const { slug } = await params;
  const page = pages[slug.join("/")];
  const key = slug.join("/");
  return page ? <ConfigPage key={key} page={page} /> : <ComingSoon />;
}
