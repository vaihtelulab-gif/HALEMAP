import ProjectLanding from "@/components/ProjectLanding";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return <ProjectLanding projectId={projectId} />;
}
