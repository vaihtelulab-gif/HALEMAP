import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { auth } from '@clerk/nextjs/server';

type Visibility = 'public' | 'private' | 'secret' | 'collaborate';

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

export async function GET(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Allow members to see other members
  const { data: members, error } = await supabase
    .from('project_members')
    .select(`
      user_id,
      role,
      joined_at,
      user:users (
        display_name,
        email
      )
    `)
    .eq('project_id', projectId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(members);
}

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const isAdmin = await checkAdmin(userId, projectId);
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const { email, role } = body; // Invite by email
  const requestedRole = (role || 'member') as 'admin' | 'member' | 'guest';
  const normalizedEmail =
    typeof email === "string" ? email.trim().toLowerCase() : "";
  if (!normalizedEmail) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  // For guest invite, project must be collaborate
  if (requestedRole === 'guest') {
    const { data: project } = await supabase
      .from('projects')
      .select('visibility')
      .eq('id', projectId)
      .single();

    const visibility = (project?.visibility ?? 'private') as Visibility;
    if (visibility !== 'collaborate') {
      return NextResponse.json({ error: 'Guest invitations are allowed only for collaborate projects.' }, { status: 400 });
    }
  }

  // 1. Find user by email
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', normalizedEmail)
    .single();

  if (userError || !user) {
    return NextResponse.json(
      {
        code: "USER_NOT_FOUND",
        error:
          "招待するユーザーが見つかりません。先にアプリにログイン（サインアップ）してもらう必要があります。",
      },
      { status: 404 },
    );
  }

  // If inviting as guest, ensure the account isn't already in other projects
  if (requestedRole === 'guest') {
    const { data: otherMembership, error: otherError } = await supabase
      .from('project_members')
      .select('project_id')
      .eq('user_id', user.id)
      .neq('project_id', projectId)
      .limit(1);

    if (otherError) {
      return NextResponse.json({ error: otherError.message }, { status: 500 });
    }
    if ((otherMembership ?? []).length > 0) {
      return NextResponse.json(
        { error: 'This user is already participating in another project and cannot be invited as a guest.' },
        { status: 400 },
      );
    }
  }

  // 2. Add to project
  const { error: addError } = await supabase
    .from('project_members')
    .insert([
      {
        project_id: projectId,
        user_id: user.id,
        role: requestedRole,
      },
    ]);

  if (addError) {
    if (addError.code === '23505') { // Unique violation
      return NextResponse.json({ error: 'User already in project' }, { status: 409 });
    }
    return NextResponse.json({ error: addError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function PUT(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const isAdmin = await checkAdmin(userId, projectId);
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const { target_user_id, role } = body;

  const { error } = await supabase
    .from('project_members')
    .update({ role })
    .eq('project_id', projectId)
    .eq('user_id', target_user_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const isAdmin = await checkAdmin(userId, projectId);
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const targetUserId = searchParams.get('user_id');

  if (!targetUserId) return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });

  // Prevent removing oneself if owner (optional safety)
  if (userId === targetUserId) {
     // Allow leaving? Yes. But maybe check if last owner? Skip for MVP.
  }

  const { error } = await supabase
    .from('project_members')
    .delete()
    .eq('project_id', projectId)
    .eq('user_id', targetUserId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
