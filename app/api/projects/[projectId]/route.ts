import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { auth } from '@clerk/nextjs/server';

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

export async function PUT(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const isAdmin = await checkAdmin(userId, projectId);
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const {
    name,
    description,
    details,
    map_config,
    start_at,
    end_at,
    start_date,
    end_date,
    thumbnail_url,
    visibility,
  } = body;

  const derivedStartDate =
    typeof start_at === "string" && start_at.length >= 10 ? start_at.slice(0, 10) : start_date;
  const derivedEndDate =
    typeof end_at === "string" && end_at.length >= 10 ? end_at.slice(0, 10) : end_date;

  const { data, error } = await supabase
    .from('projects')
    .update({
      name,
      description,
      details,
      map_config,
      start_at,
      end_at,
      start_date: derivedStartDate,
      end_date: derivedEndDate,
      thumbnail_url,
      visibility,
    })
    .eq('id', projectId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const isAdmin = await checkAdmin(userId, projectId);
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
