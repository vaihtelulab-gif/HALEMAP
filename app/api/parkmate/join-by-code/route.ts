import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabaseClient";

function normalizeCode(code: string) {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as { code?: string };
  const raw = body.code;
  if (!raw) return NextResponse.json({ error: "Missing code" }, { status: 400 });
  const code = normalizeCode(raw);

  const { data: invite, error: inviteError } = await supabase
    .from("project_invite_codes")
    .select("project_id,revoked_at")
    .eq("code", code)
    .maybeSingle();

  if (inviteError) return NextResponse.json({ error: inviteError.message }, { status: 500 });
  if (!invite || invite.revoked_at) {
    return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
  }

  const { error: addError } = await supabase.from("project_members").insert([
    {
      project_id: invite.project_id,
      user_id: userId,
      role: "member",
    },
  ]);

  if (addError) {
    // Already a member
    if ((addError as { code?: string } | null)?.code === "23505") {
      return NextResponse.json({ project_id: invite.project_id, already_member: true });
    }
    return NextResponse.json({ error: addError.message }, { status: 500 });
  }

  return NextResponse.json({ project_id: invite.project_id });
}

