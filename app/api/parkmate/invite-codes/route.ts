import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabaseClient";

function normalizeCode(code: string) {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

function generateCode(length = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
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

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("project_id");
  if (!projectId) return NextResponse.json({ error: "Missing project_id" }, { status: 400 });

  const isAdmin = await checkAdmin(userId, projectId);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data, error } = await supabase
    .from("project_invite_codes")
    .select("code,created_at,revoked_at")
    .eq("project_id", projectId)
    .is("revoked_at", null)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as { project_id?: string };
  const projectId = body.project_id;
  if (!projectId) return NextResponse.json({ error: "Missing project_id" }, { status: 400 });

  const isAdmin = await checkAdmin(userId, projectId);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Try a few times to avoid collision.
  for (let i = 0; i < 8; i++) {
    const code = generateCode(8);
    const { error } = await supabase.from("project_invite_codes").insert([
      {
        code,
        project_id: projectId,
        created_by: userId,
      },
    ]);
    if (!error) return NextResponse.json({ code });

    // Unique violation => retry
    if ((error as { code?: string } | null)?.code === "23505") continue;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ error: "Failed to generate invite code" }, { status: 500 });
}

export async function PUT(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as { code?: string };
  const raw = body.code;
  if (!raw) return NextResponse.json({ error: "Missing code" }, { status: 400 });
  const code = normalizeCode(raw);

  const { data: existing, error: lookupError } = await supabase
    .from("project_invite_codes")
    .select("project_id,revoked_at")
    .eq("code", code)
    .maybeSingle();

  if (lookupError) return NextResponse.json({ error: lookupError.message }, { status: 500 });
  if (!existing) return NextResponse.json({ error: "Invite code not found" }, { status: 404 });

  const isAdmin = await checkAdmin(userId, existing.project_id);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { error } = await supabase
    .from("project_invite_codes")
    .update({ revoked_at: new Date().toISOString() })
    .eq("code", code);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

