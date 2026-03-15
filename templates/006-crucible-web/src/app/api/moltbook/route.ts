import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const rootDir = path.resolve(process.cwd(), '../../scripts');
    
    // Read Intel
    const intelPath = path.join(rootDir, 'daily-intel.json');
    let intel = {};
    if (fs.existsSync(intelPath)) {
      intel = JSON.parse(fs.readFileSync(intelPath, 'utf-8'));
    }

    // Read State
    const statePath = path.join(rootDir, 'state', 'CrucibleForge_main-state.json');
    let state = null;
    if (fs.existsSync(statePath)) {
      state = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
    } else {
      // Try just CrucibleForge
      const fallbackPath = path.join(rootDir, 'state', 'CrucibleForge-state.json');
      if (fs.existsSync(fallbackPath)) {
         state = JSON.parse(fs.readFileSync(fallbackPath, 'utf-8'));
      }
    }

    return NextResponse.json({
      success: true,
      intel_keys: Object.keys(intel),
      state: state || {}
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
