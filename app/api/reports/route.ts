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

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { spot_id, type, photo_url, memo, poster_name, removal_deadline } = body;

  if (!spot_id || !type) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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
        performed_by: userId,
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

  return NextResponse.json({ success: true });
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
