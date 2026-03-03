import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch existing agents
    const { data: existingAgents } = await supabase
      .from('agents_registry')
      .select('name, type, description, capabilities');

    // Use Gemini to invent a new agent
    const prompt = `You are the Agent Spawner in the Crucible AI Forge.
Invent ONE new specialized AI agent that fills a gap.

Current agents:
${JSON.stringify(existingAgents || [], null, 2)}

Rules:
- Must be DIFFERENT from existing ones
- Must serve a real engineering or business need
- Creative, industrial-themed name

Output raw JSON only:
{
  "name": "Agent Name",
  "type": "lowercase-type-id",
  "description": "What this agent does",
  "capabilities": ["cap1", "cap2", "cap3"]
}`;

    let newAgent: any;

    if (geminiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        let text = response.text || '';
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        newAgent = JSON.parse(text);
      } catch {
        // Fallback to mock
        newAgent = null;
      }
    }

    if (!newAgent) {
      const names = ['Flux Sentinel', 'Schema Welder', 'Cache Furnace', 'Pipeline Foreman', 'Latency Smelter'];
      const pick = names[Math.floor(Math.random() * names.length)];
      newAgent = {
        name: pick,
        type: pick.toLowerCase().replace(/\s+/g, '-'),
        description: `Autonomously spawned agent focused on ${pick.split(' ')[1].toLowerCase()} optimization`,
        capabilities: ['autonomous', 'optimization', 'monitoring'],
      };
    }

    // Check duplicates
    const isDuplicate = existingAgents?.some(
      a => a.type === newAgent.type || a.name.toLowerCase() === newAgent.name.toLowerCase()
    );

    if (isDuplicate) {
      return NextResponse.json({
        success: true,
        message: 'Agent already exists — no spawn needed',
        agent: null,
      });
    }

    const { data, error } = await supabase.from('agents_registry').insert({
      name: newAgent.name,
      type: newAgent.type,
      description: newAgent.description,
      status: 'idle',
      capabilities: newAgent.capabilities,
    }).select().single();

    if (error) throw error;

    // Log telemetry
    await supabase.from('forge_events').insert({
      event_type: 'SPAWNED',
      message: `New agent spawned via API: ${newAgent.name}`,
      agent_id: 'spawner',
    });

    return NextResponse.json({ success: true, agent: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
