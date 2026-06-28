import { notFound } from "next/navigation";
import { getCollection, getCurriculum } from "@/lib/curriculum";
import { getLabels } from "@/lib/labels";
import { getCoverClassName } from "@/lib/collection-style";
import { isAdmin } from "@/lib/session";
import { PortalShell } from "@/components/PortalShell";
import { CollectionHome } from "@/components/CollectionHome";

type Props = {
  params: Promise<{ courseSlug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { courseSlug } = await params;
  const collection = await getCollection(courseSlug);
  if (!collection) return {};
  return { title: collection.title };
}

export default async function CollectionPage({ params }: Props) {
  const { courseSlug } = await params;
  const collection = await getCollection(courseSlug);
  if (!collection) notFound();

  const { site } = await getCurriculum();
  const labels = getLabels(site);
  const coverClass = getCoverClassName(collection);
  const admin = await isAdmin();

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
      />
    </PortalShell>
  );
}
