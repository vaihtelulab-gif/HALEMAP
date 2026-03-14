import ProjectLanding from "@/components/ProjectLanding";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const { userId } = await auth();

  if (!userId) {
    const { data: project } = await supabase
      .from("projects")
      .select("visibility, open_access")
      .eq("id", projectId)
      .maybeSingle();

    const isOpenProject = project?.visibility === "public" && Boolean(project?.open_access);
    if (isOpenProject) {
      redirect(`/projects/${projectId}/map`);
    }
    redirect("/sign-in");
  }

  return <ProjectLanding projectId={projectId} />;
}
