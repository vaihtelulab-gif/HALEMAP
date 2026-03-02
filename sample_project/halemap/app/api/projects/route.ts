import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { auth } from '@clerk/nextjs/server';

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

  const body = await request.json();
  const { name, description, start_date, end_date } = body;

  if (!name) {
    return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
  }

  // 1. Create Project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert([
      {
        name,
        description,
        start_date: start_date || null,
        end_date: end_date || null,
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
