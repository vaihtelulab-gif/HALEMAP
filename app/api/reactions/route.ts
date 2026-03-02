import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { report_id, emoji } = await request.json();

  if (!report_id || !emoji) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // 1. Check if reaction already exists
  const { data: existingReaction, error: fetchError } = await supabase
    .from('reactions')
    .select('id')
    .eq('report_id', report_id)
    .eq('user_id', userId)
    .eq('emoji', emoji)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "No rows found"
    console.error('Error fetching reaction:', fetchError);
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (existingReaction) {
    // 2. If exists, delete it (toggle off)
    const { error: deleteError } = await supabase
      .from('reactions')
      .delete()
      .eq('id', existingReaction.id);

    if (deleteError) {
      console.error('Error deleting reaction:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }
    return NextResponse.json({ action: 'removed' });
  } else {
    // 3. If not exists, insert it (toggle on)
    const { error: insertError } = await supabase
      .from('reactions')
      .insert([
        {
          report_id,
          user_id: userId,
          emoji,
        },
      ]);

    if (insertError) {
      console.error('Error inserting reaction:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
    return NextResponse.json({ action: 'added' });
  }
}
