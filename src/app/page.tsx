import { redirect } from "next/navigation";
import { checkAuthenticated, isAdmin } from "@/lib/session";
import { getCollections, getCurriculum } from "@/lib/curriculum";
import { DEFAULT_COURSE_PATH } from "@/lib/constants";
import { CollectionGrid } from "@/components/CollectionGrid";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ password?: string }>;
};

export default async function Home({ searchParams }: Props) {
  if (!(await checkAuthenticated())) {
    redirect("/login");
  }

  const collections = await getCollections();
  const { site } = await getCurriculum();
  const admin = await isAdmin();
  const passwordUpdated = (await searchParams).password === "updated";

  if (collections.length === 1) {
    redirect(
      passwordUpdated
        ? `${DEFAULT_COURSE_PATH}?password=updated`
        : DEFAULT_COURSE_PATH,
    );
  }

  return (
    <CollectionGrid
      site={site}
      collections={collections}
      showAdminLink={admin}
      passwordUpdated={passwordUpdated}
    />
  );
}
