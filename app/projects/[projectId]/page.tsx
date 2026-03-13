import ProjectLanding from "@/components/ProjectLanding";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { projectId } = await params;

  return <ProjectLanding projectId={projectId} />;
}
