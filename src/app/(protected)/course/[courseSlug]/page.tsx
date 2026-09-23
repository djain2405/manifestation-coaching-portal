import { notFound } from "next/navigation";
import { getCollection, getCurriculum } from "@/lib/curriculum";
import { getLabels } from "@/lib/labels";
import { getCoverClassName } from "@/lib/collection-style";
import { isAdmin, getProfile } from "@/lib/session";
import { PortalShell } from "@/components/PortalShell";
import { CollectionHome } from "@/components/CollectionHome";
import { firstName } from "@/lib/site";

type Props = {
  params: Promise<{ courseSlug: string }>;
  searchParams: Promise<{ password?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { courseSlug } = await params;
  const collection = await getCollection(courseSlug);
  if (!collection) return {};
  return { title: collection.title };
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const { courseSlug } = await params;
  const collection = await getCollection(courseSlug);
  if (!collection) notFound();

  const { site } = await getCurriculum();
  const labels = getLabels(site);
  const coverClass = getCoverClassName(collection);
  const admin = await isAdmin();
  const profile = await getProfile();
  const passwordUpdated = (await searchParams).password === "updated";

  return (
    <PortalShell
      site={site}
      collection={collection}
      labels={labels}
      showAdminLink={admin}
    >
      <CollectionHome
        collection={collection}
        labels={labels}
        coverClass={coverClass}
        firstName={firstName(profile?.full_name)}
        passwordUpdated={passwordUpdated}
      />
    </PortalShell>
  );
}
