import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { templateId, name, spec } = body;

    if (!templateId || !name) {
      return NextResponse.json({ error: 'Missing required fields: templateId, name' }, { status: 400 });
    }

    // Create the blueprint
    const { data, error } = await supabase
      .from('forge_blueprints')
      .insert([
        {
          template_id: templateId,
          name: name,
          status: 'queued',
          spec: spec || {},
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error inserting blueprint:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log the event
    await supabase.from('forge_events').insert([
      {
        event_type: 'SPAWNED',
        message: `Blueprint "${name}" queued for forging (Template: ${templateId})`,
        agent_id: 'product-manager-agent',
      }
    ]);

    return NextResponse.json({ success: true, blueprint: data });
  } catch (error: any) {
    console.error('Error creating blueprint:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    let query = supabase
      .from('forge_blueprints')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ blueprints: data });
  } catch (error: any) {
    console.error('Error fetching blueprints:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
