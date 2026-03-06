// ═══════════════════════════════════════════════════════════════════════
// NEON ARCADE — Workspace Manager (Shared Agent State)
// ═══════════════════════════════════════════════════════════════════════

import * as fs from 'node:fs';
import * as path from 'node:path';
import type { AgentId, AgentMessage } from './game-schemas';

/**
 * Central workspace where all agents read/write artifacts.
 * Acts as the shared "GitHub Repo" for the multi-agent system.
 */
export class WorkspaceManager {
  private basePath: string;
  private messageLog: AgentMessage[] = [];

  constructor(basePath: string = './workspace') {
    this.basePath = path.resolve(basePath);
    this.initDirectories();
  }

  // ─── Directory Structure ────────────────────────────────────────

  private initDirectories(): void {
    const dirs = [
      '',                         // root
      'artifacts/market',         // PULSE outputs
      'artifacts/prd',            // SCHEMA outputs
      'artifacts/tasks',          // DISPATCH outputs
      'artifacts/code',           // PIXEL outputs
      'artifacts/tests',          // GLITCH outputs
      'artifacts/performance',    // TURBO outputs
      'artifacts/compliance',     // GATEWAY outputs
      'status-reports',           // All status reports
      'messages',                 // Inter-agent message log
    ];

    for (const dir of dirs) {
      const fullPath = path.join(this.basePath, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    }
  }

  // ─── Read/Write Operations ──────────────────────────────────────

  write(agentId: AgentId, filename: string, data: unknown): string {
    const agentDir = this.getAgentDir(agentId);
    const filePath = path.join(agentDir, filename);
    const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`  💾 [${agentId}] wrote → ${filename}`);
    return filePath;
  }

  read(agentId: AgentId, filename: string): unknown {
    const agentDir = this.getAgentDir(agentId);
    const filePath = path.join(agentDir, filename);

    if (!fs.existsSync(filePath)) {
      throw new Error(`[WorkspaceManager] File not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf-8');

    try {
      return JSON.parse(content);
    } catch {
      return content; // return raw string if not JSON
    }
  }

  readLatest(agentId: AgentId): unknown {
    const agentDir = this.getAgentDir(agentId);
    const files = fs.readdirSync(agentDir)
      .filter(f => f.endsWith('.json'))
      .sort()
      .reverse();

    if (files.length === 0) {
      throw new Error(`[WorkspaceManager] No output found for agent: ${agentId}`);
    }

    return this.read(agentId, files[0]);
  }

  // ─── Message Bus ────────────────────────────────────────────────

  sendMessage(message: AgentMessage): void {
    this.messageLog.push(message);

    const logPath = path.join(this.basePath, 'messages', 'message-log.jsonl');
    fs.appendFileSync(logPath, JSON.stringify(message) + '\n', 'utf-8');
  }

  getMessages(filter?: { from?: AgentId; to?: AgentId }): AgentMessage[] {
    let messages = [...this.messageLog];

    if (filter?.from) {
      messages = messages.filter(m => m.from === filter.from);
    }
    if (filter?.to) {
      messages = messages.filter(m => m.to === filter.to);
    }

    return messages;
  }

  // ─── Status Reports ────────────────────────────────────────────

  writeStatusReport(agentId: AgentId, report: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${agentId}-${timestamp}.md`;
    const filePath = path.join(this.basePath, 'status-reports', filename);

    fs.writeFileSync(filePath, report, 'utf-8');
    console.log(`  📄 [${agentId}] status report → ${filename}`);
    return filePath;
  }

  // ─── Code Files ─────────────────────────────────────────────────

  writeCodeFile(relativePath: string, content: string): string {
    const filePath = path.join(this.basePath, 'artifacts', 'code', relativePath);
    const dir = path.dirname(filePath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, content, 'utf-8');
    return filePath;
  }

  readCodeFile(relativePath: string): string {
    const filePath = path.join(this.basePath, 'artifacts', 'code', relativePath);
    return fs.readFileSync(filePath, 'utf-8');
  }

  listCodeFiles(): string[] {
    const codeDir = path.join(this.basePath, 'artifacts', 'code');
    return this.listFilesRecursive(codeDir);
  }

  // ─── Helpers ────────────────────────────────────────────────────

  private getAgentDir(agentId: AgentId): string {
    const mapping: Record<string, string> = {
      PULSE:     'artifacts/market',
      SCHEMA:    'artifacts/prd',
      DISPATCH:  'artifacts/tasks',
      PIXEL:     'artifacts/code',
      GLITCH:    'artifacts/tests',
      TURBO:     'artifacts/performance',
      GATEWAY:   'artifacts/compliance',
      MAINFRAME: 'artifacts',
    };

    return path.join(this.basePath, mapping[agentId] || 'artifacts');
  }

  private listFilesRecursive(dir: string, prefix = ''): string[] {
    if (!fs.existsSync(dir)) return [];

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
      const relPath = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        files.push(...this.listFilesRecursive(path.join(dir, entry.name), relPath));
      } else {
        files.push(relPath);
      }
    }

    return files;
  }

  getWorkspacePath(): string {
    return this.basePath;
  }
}
