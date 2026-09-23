import { redirect } from "next/navigation";
import { checkAuthenticated, getProfile, isAdmin } from "@/lib/session";
import { getCollections, getCurriculum } from "@/lib/curriculum";
import { CollectionGrid } from "@/components/CollectionGrid";
import { firstName } from "@/lib/site";
import { getLabels } from "@/lib/labels";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ password?: string }>;
};

export default async function Home({ searchParams }: Props) {
  if (!(await checkAuthenticated())) {
    redirect("/login");
  }

  const profile = await getProfile();
  if (profile && !profile.welcome_seen_at) {
    redirect("/welcome");
  }

  const collections = await getCollections();
  const { site } = await getCurriculum();
  const admin = await isAdmin();
  const labels = getLabels(site);
  const passwordUpdated = (await searchParams).password === "updated";

  if (collections.length === 1) {
    const next = `/course/${collections[0].slug}`;
    redirect(passwordUpdated ? `${next}?password=updated` : next);
  }

  return (
    <CollectionGrid
      site={site}
      collections={collections}
      labels={labels}
      showAdminLink={admin}
      firstName={firstName(profile?.full_name)}
      passwordUpdated={passwordUpdated}
    />
  );
}
