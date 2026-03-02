import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabaseClient";

type Visibility = "public" | "private" | "secret" | "collaborate";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Already a member?
  const { data: existingMember } = await supabase
    .from("project_members")
    .select("role")
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existingMember?.role) return NextResponse.json({ status: "already_member" });

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("visibility")
    .eq("id", projectId)
    .single();

  if (projectError || !project) {
    return NextResponse.json({ error: projectError?.message || "Project not found" }, { status: 404 });
  }

  const visibility = (project.visibility ?? "private") as Visibility;

  if (visibility === "public") {
    const { error: addError } = await supabase.from("project_members").insert([
      {
        project_id: projectId,
        user_id: userId,
        role: "member",
      },
    ]);

    if (addError) {
      if (addError.code === "23505") return NextResponse.json({ status: "already_member" });
      return NextResponse.json({ error: addError.message }, { status: 500 });
    }

    return NextResponse.json({ status: "joined" });
  }

  if (visibility === "secret") {
    return NextResponse.json(
      { error: "This project is invite-only." },
      { status: 403 },
    );
  }

  // private / collaborate => request approval
  const { error: reqError } = await supabase.from("project_join_requests").insert([
    { project_id: projectId, user_id: userId, status: "pending" },
  ]);

  if (reqError) {
    if (reqError.code === "23505") return NextResponse.json({ status: "already_requested" });
    return NextResponse.json({ error: reqError.message }, { status: 500 });
  }

  return NextResponse.json({ status: "requested" });
}

