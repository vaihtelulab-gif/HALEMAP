import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabaseClient";

async function ensureUserRow(userId: string) {
  // This endpoint is called by admins reviewing requests; it may approve a user
  // that has never been synced into `users` yet in this environment.
  const { data, error } = await supabase.from("users").select("id").eq("id", userId).maybeSingle();
  if (error) throw new Error(error.message);
  if (data?.id) return;

  // Minimal placeholder to satisfy FK constraints; user can be enriched on first login elsewhere.
  const { error: upsertError } = await supabase.from("users").upsert({
    id: userId,
    email: "",
    display_name: "",
  });
  if (upsertError) throw new Error(upsertError.message);
}

async function checkAdmin(userId: string, projectId: string) {
  const { data, error } = await supabase
    .from("project_members")
    .select("role")
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .single();

  if (error || !data) return false;
  return ["owner", "admin"].includes(data.role);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = await checkAdmin(userId, projectId);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data, error } = await supabase
    .from("project_join_requests")
    .select(
      `
      id,
      project_id,
      user_id,
      status,
      requested_at,
      reviewed_at,
      reviewed_by,
      user:users (
        display_name,
        email
      )
    `,
    )
    .eq("project_id", projectId)
    .eq("status", "pending")
    .order("requested_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = await checkAdmin(userId, projectId);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await request.json()) as {
    request_id: string;
    action: "approve" | "reject";
  };

  if (!body?.request_id || !body?.action) {
    return NextResponse.json({ error: "Missing request_id or action" }, { status: 400 });
  }

  const { data: reqRow, error: reqFetchError } = await supabase
    .from("project_join_requests")
    .select("id,user_id,status")
    .eq("id", body.request_id)
    .eq("project_id", projectId)
    .single();

  if (reqFetchError || !reqRow) {
    return NextResponse.json({ error: reqFetchError?.message || "Not found" }, { status: 404 });
  }

  if (reqRow.status !== "pending") {
    return NextResponse.json({ error: "Request is not pending" }, { status: 409 });
  }

  const nextStatus = body.action === "approve" ? "approved" : "rejected";

  const { error: updateError } = await supabase
    .from("project_join_requests")
    .update({
      status: nextStatus,
      reviewed_at: new Date().toISOString(),
      reviewed_by: userId,
    })
    .eq("id", reqRow.id);

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  if (body.action === "approve") {
    try {
      await ensureUserRow(reqRow.user_id);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return NextResponse.json({ error: `Failed to sync user: ${message}` }, { status: 500 });
    }

    const { error: addError } = await supabase.from("project_members").insert([
      {
        project_id: projectId,
        user_id: reqRow.user_id,
        role: "member",
      },
    ]);

    if (addError && addError.code !== "23505") {
      return NextResponse.json({ error: addError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}

