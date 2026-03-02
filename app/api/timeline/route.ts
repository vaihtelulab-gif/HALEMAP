import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { auth } from '@clerk/nextjs/server';

type ReactionRow = { emoji: string; user_id: string };
type ReportRow = {
  reactions?: ReactionRow[];
  [key: string]: unknown;
};

export async function GET(request: Request) {
  const { userId } = await auth();
  const { searchParams } = new URL(request.url);
  const spotId = searchParams.get('spot_id');
  const projectId = searchParams.get('project_id');

  let query = supabase
    .from('reports')
    .select(`
      id,
      type,
      photo_url,
      memo,
      created_at,
      poster_name,
      performed_by:users (
        display_name
      ),
      spot:spots!inner (
        name,
        project_id
      ),
      reactions (
        emoji,
        user_id
      )
    `)
    .order('created_at', { ascending: false })
    .limit(50); // 最新50件のみ取得

  if (spotId) {
    query = query.eq('spot_id', spotId);
  }

  if (projectId) {
    // Filter by spot's project_id
    // Note: We use !inner join on spots to filter by spot's project_id
    query = query.eq('spot.project_id', projectId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Process reactions to calculate counts and check if current user reacted
  const reportsWithReactions = (data as ReportRow[]).map((report) => {
    const reactions = report.reactions ?? [];
    const reactionCounts: Record<string, number> = {};

    reactions.forEach((r) => {
      reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1;
    });

    // For now, we only care about thumbs up '👍'
    const thumbsUpCount = reactionCounts['👍'] || 0;
    const isLiked = userId
      ? reactions.some((r) => r.emoji === '👍' && r.user_id === userId)
      : false;

    return {
      ...report,
      reactions: undefined, // Remove raw reactions data
      reaction_counts: reactionCounts,
      is_liked: isLiked,
      thumbs_up_count: thumbsUpCount,
    };
  });

  return NextResponse.json(reportsWithReactions);
}
