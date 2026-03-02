import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: memberRows, error: memberError } = await supabase
    .from("project_members")
    .select("project_id")
    .eq("user_id", userId);

  if (memberError) return NextResponse.json({ error: memberError.message }, { status: 500 });

  const memberIds = new Set((memberRows ?? []).map((r: { project_id: string }) => r.project_id));

  const { data: projects, error } = await supabase
    .from("projects")
    .select("id,name,description,created_by,created_at,start_at,end_at,start_date,end_date,thumbnail_url,visibility")
    .in("visibility", ["public", "private", "collaborate"])
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const visible = (projects ?? []).filter((p: { id: string }) => !memberIds.has(p.id));
  return NextResponse.json(visible);
}

