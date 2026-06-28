import { redirect } from "next/navigation";
import { checkAuthenticated } from "@/lib/session";
import { getCollections, getCurriculum } from "@/lib/curriculum";
import { DEFAULT_COURSE_PATH } from "@/lib/constants";
import { CollectionGrid } from "@/components/CollectionGrid";

export const dynamic = "force-dynamic";

export default async function Home() {
  if (!(await checkAuthenticated())) {
    redirect("/login");
  }

  const collections = await getCollections();
  const { site } = await getCurriculum();

  if (collections.length === 1) {
    redirect(DEFAULT_COURSE_PATH);
  }

  return <CollectionGrid site={site} collections={collections} />;
}
