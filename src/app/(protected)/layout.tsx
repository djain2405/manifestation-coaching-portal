import { redirect } from "next/navigation";
import { checkAuthenticated } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await checkAuthenticated())) {
    redirect("/login");
  }

  return <>{children}</>;
}
