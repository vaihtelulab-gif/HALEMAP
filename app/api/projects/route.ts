import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { auth, currentUser } from '@clerk/nextjs/server';

async function ensureUserRow(userId: string) {
  const user = await currentUser();
  if (!user) {
    const { error } = await supabase.from("users").upsert({
      id: userId,
      email: "",
      display_name: "",
    });
    if (error) {
      // Surface this as a hard error; without the user row, FK constraints will fail.
      throw new Error(error.message);
    }
    return;
  }

  const email = user.emailAddresses[0]?.emailAddress || "";
  const displayName = user.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : user.username || email;

  const { error } = await supabase.from("users").upsert({
    id: userId,
    email,
    display_name: displayName,
  });

  if (error) {
    // Surface this as a hard error; without the user row, FK constraints will fail.
    throw new Error(error.message);
  }
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get projects where the user is a member
  const { data: memberProjects, error: memberError } = await supabase
    .from('project_members')
    .select('project_id')
    .eq('user_id', userId);

  if (memberError) {
    return NextResponse.json({ error: memberError.message }, { status: 500 });
  }

  const projectIds = (memberProjects ?? []).map((mp: { project_id: string }) => mp.project_id);

  if (projectIds.length === 0) {
    return NextResponse.json([]);
  }

  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('*')
    .in('id', projectIds)
    .order('created_at', { ascending: false });

  if (projectsError) {
    return NextResponse.json({ error: projectsError.message }, { status: 500 });
  }

  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await ensureUserRow(userId);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Failed to sync user: ${message}` }, { status: 500 });
  }

  const body = await request.json();
  const { name, description, details, start_at, end_at, start_date, end_date, visibility, open_access } = body;

  if (!name) {
    return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
  }

  // Guest accounts are limited to a single project
  const { data: guestMembership } = await supabase
    .from("project_members")
    .select("project_id")
    .eq("user_id", userId)
    .eq("role", "guest")
    .maybeSingle();

  if (guestMembership?.project_id) {
    return NextResponse.json(
      { error: "Guest accounts cannot create new projects." },
      { status: 403 },
    );
  }

  const derivedStartDate =
    typeof start_at === "string" && start_at.length >= 10 ? start_at.slice(0, 10) : start_date;
  const derivedEndDate =
    typeof end_at === "string" && end_at.length >= 10 ? end_at.slice(0, 10) : end_date;

  // 1. Create Project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert([
      {
        name,
        description,
        details,
        start_at: start_at || null,
        end_at: end_at || null,
        start_date: derivedStartDate || null,
        end_date: derivedEndDate || null,
        visibility: visibility || "private",
        open_access: Boolean(open_access) && (visibility || "private") === "public",
        created_by: userId,
      },
    ])
    .select()
    .single();

  if (projectError) {
    return NextResponse.json({ error: projectError.message }, { status: 500 });
  }

  // 2. Add creator as member (owner)
  const { error: memberError } = await supabase
    .from('project_members')
    .insert([
      {
        project_id: project.id,
        user_id: userId,
        role: 'owner',
      },
    ]);

  if (memberError) {
    console.error('Error adding member:', memberError);
    // Ideally rollback project creation, but for MVP we just log
    return NextResponse.json({ error: 'Failed to add member' }, { status: 500 });
  }

  return NextResponse.json(project);
}
