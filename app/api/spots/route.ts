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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('project_id');

  let query = supabase
    .from('spots')
    .select('*')
    .order('created_at', { ascending: false });

  if (projectId) {
    query = query.eq('project_id', projectId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const { userId } = await auth();
  const body = await request.json();
  const { name, latitude, longitude, status, memo, project_id } = body;

  if (!name || !latitude || !longitude) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (!project_id) {
    return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
  }

  // Determine actor (logged-in user or anonymous when project is open)
  let actorId = userId || "";
  let shouldSetAnonCookie = false;
  let anonCookieValue = "";

  if (!actorId) {
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("visibility, open_access")
      .eq("id", project_id)
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
    // Clerkのユーザー情報を取得して、Supabaseのusersテーブルと同期する
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const email = user.emailAddresses[0]?.emailAddress || '';
    const displayName = user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.username || email;

    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: actorId,
        email: email,
        display_name: displayName,
      });

    if (userError) {
      console.error('Error syncing user:', userError);
      return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 });
    }
  }

  const { data, error } = await supabase
    .from('spots')
    .insert([
      {
        name,
        latitude,
        longitude,
        status: status || 'vacant',
        memo,
        created_by: actorId,
        project_id,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error saving spot:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const res = NextResponse.json(data);
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

export async function PUT(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { id, name, memo, project_id } = body;

  if (!id || !project_id) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const isAdmin = await checkAdmin(userId, project_id);
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { data, error } = await supabase
    .from('spots')
    .update({ name, memo })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
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
    .from('spots')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
