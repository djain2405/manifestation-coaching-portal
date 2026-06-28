import { notFound } from "next/navigation";
import { getCollection, getCurriculum, getItem } from "@/lib/curriculum";
import { isActivityItem } from "@/lib/items";
import { getLabels, formatLabel } from "@/lib/labels";
import { isAdmin } from "@/lib/session";
import { PortalShell } from "@/components/PortalShell";
import { WatchView } from "@/components/WatchView";
import { ActivityView } from "@/components/ActivityView";
import { StepIndicator } from "@/components/StepIndicator";

type Props = {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { courseSlug, lessonSlug } = await params;
  const result = await getItem(courseSlug, lessonSlug);
  if (!result) return {};
  return { title: result.item.title };
}

export default async function ItemPage({ params }: Props) {
  const { courseSlug, lessonSlug } = await params;
  const result = await getItem(courseSlug, lessonSlug);
  if (!result) notFound();

  const { collection, item, index } = result;
  const { site } = await getCurriculum();
  const labels = getLabels(site);
  const total = collection.items.length;
  const admin = await isAdmin();

  return (
    <PortalShell
      site={site}
      collection={collection}
      labels={labels}
      activeItemSlug={item.slug}
      showAdminLink={admin}
    >
      <div className="learner-content space-y-6">
        <StepIndicator
          current={index + 1}
          total={total}
          label={formatLabel(labels.stepOf, {
            current: index + 1,
            total,
          })}
        />
        {isActivityItem(item) ? (
          <ActivityView
            collection={collection}
            item={item}
            index={index}
            labels={labels}
          />
        ) : (
          <WatchView
            collection={collection}
            item={item}
            index={index}
            labels={labels}
          />
        )}
      </div>
    </PortalShell>
  );
}
