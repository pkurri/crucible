import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('agents_registry')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ success: true, agents: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
