import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { auth, currentUser } from '@clerk/nextjs/server';

// Helper to check if user is admin/owner
async function checkAdmin(userId: string, projectId: string) {
  const { data, error } = await supabase
    .from('project_members')
    .select('role')
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .single();
  
  if (error || !data) return false;
  return ['owner', 'admin'].includes(data.role);
}

export async function POST(request: Request) {
  const { userId } = await auth();
  const body = await request.json();
  const { spot_id, type, photo_url, memo, poster_name, removal_deadline } = body;

  if (!spot_id || !type) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Determine actor (logged-in user or anonymous when project is open)
  let actorId = userId || "";
  let shouldSetAnonCookie = false;
  let anonCookieValue = "";

  if (!actorId) {
    const { data: spot, error: spotError } = await supabase
      .from("spots")
      .select("project_id")
      .eq("id", spot_id)
      .maybeSingle();

    if (spotError) {
      return NextResponse.json({ error: spotError.message }, { status: 500 });
    }

    const projectId = spot?.project_id;
    if (!projectId) {
      return NextResponse.json({ error: "Spot not found" }, { status: 404 });
    }

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("visibility, open_access")
      .eq("id", projectId)
      .maybeSingle();

    if (projectError) {
      return NextResponse.json({ error: projectError.message }, { status: 500 });
    }

    const isOpenProject = project?.visibility === "public" && Boolean(project?.open_access);
    if (!isOpenProject) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cookieHeader = request.headers.get("cookie") || "";
    const match = cookieHeader.match(/(?:^|;\s*)hm_anon=([^;]+)/);
    const existing = match ? decodeURIComponent(match[1]) : "";
    const nextId = existing || `anon_${crypto.randomUUID()}`;

    actorId = nextId;
    if (!existing) {
      shouldSetAnonCookie = true;
      anonCookieValue = nextId;
    }

    const { error: anonUserError } = await supabase.from("users").upsert({
      id: actorId,
      email: "",
      display_name: "匿名",
    });

    if (anonUserError) {
      return NextResponse.json({ error: anonUserError.message }, { status: 500 });
    }
  } else {
    // Best-effort: ensure FK-compatible users row exists
    try {
      const user = await currentUser();
      const email = user?.emailAddresses?.[0]?.emailAddress || "";
      const displayName = user?.firstName
        ? `${user.firstName} ${user.lastName || ""}`.trim()
        : user?.username || email;

      const { error: userError } = await supabase.from("users").upsert({
        id: actorId,
        email,
        display_name: displayName,
      });
      if (userError) return NextResponse.json({ error: userError.message }, { status: 500 });
    } catch {
      // If Clerk lookup fails transiently, keep going; DB may already have the user row
    }
  }

  // 1. レポート（作業記録）を作成
  const { error: reportError } = await supabase
    .from('reports')
    .insert([
      {
        spot_id,
        type,
        photo_url,
        memo,
        poster_name: type === 'post' ? poster_name : null,
        removal_deadline: type === 'post' ? (removal_deadline || null) : null,
        performed_by: actorId,
      },
    ]);

  if (reportError) {
    console.error('Error creating report:', reportError);
    return NextResponse.json({ error: reportError.message }, { status: 500 });
  }

  // 2. スポットの状態を更新
  const newStatus = type === 'post' ? 'posted' : 'vacant';
  const newPosterName = type === 'post' ? poster_name : null;
  const newDeadline = type === 'post' ? (removal_deadline || null) : null;

  const { error: spotError } = await supabase
    .from('spots')
    .update({ 
      status: newStatus, 
      current_poster_name: newPosterName,
      current_deadline: newDeadline,
      updated_at: new Date().toISOString() 
    })
    .eq('id', spot_id);

  if (spotError) {
    console.error('Error updating spot:', spotError);
    return NextResponse.json({ error: spotError.message }, { status: 500 });
  }

  const res = NextResponse.json({ success: true });
  if (shouldSetAnonCookie) {
    res.cookies.set({
      name: "hm_anon",
      value: anonCookieValue,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return res;
}

export async function DELETE(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const projectId = searchParams.get('project_id');

  if (!id || !projectId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const isAdmin = await checkAdmin(userId, projectId);
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { error } = await supabase
    .from('reports')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
