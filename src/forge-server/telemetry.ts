import { Server } from 'socket.io';

export class TelemetryHub {
  private io: Server;
  
  constructor(io: Server) {
    this.io = io;
    
    this.io.on('connection', (socket) => {
      console.log('📡 UI Connected to Flux Stream');
      socket.emit('flux-entry', {
        timestamp: new Date().toLocaleTimeString(),
        message: 'CONNECTION ESTABLISHED WITH FORGE CORE',
        type: 'system'
      });
    });
  }

  public broadcast(message: string, type: string = 'info') {
    this.io.emit('flux-entry', {
      timestamp: new Date().toLocaleTimeString(),
      message: message,
      type: type
    });
  }

  public startSimulatedActivity() {
    const logs = [
      "FORGE - OPTIMIZING NEURAL PATHWAYS...",
      "SYNCING WITH CLOUDE CODE [LATEST]",
      "FORGE - ANALYZING ARCHITECTURE HOTSPOTS...",
      "🛡️ [SENTINEL] SCANNING FOR HALLUCINATIONS IN AGENT TRACE...",
      "🛡️ [SENTINEL] TOOL-CALL GATED: 'delete_db' ATTEMPT REJECTED.",
      "🌑 [CHAOS] INJECTING ADVERSARIAL HONEYPOT INTO TRANSMISSION-0X3...",
      "🧬 [HEALER] ANALYZING LOGIC DRIFT IN VANGUARD_FLEET...",
      "🧬 [HEALER] PATCH APPLIED: DIRECTIVE_v2.1 HOT-RELOADED.",
      "🌑 [CHAOS] SIMULATING PROMPT INJECTION ATTACK: REJECTED BY SENTINEL.",
      "🔍 [AUDITOR] ROI DETECTED: 8.4 ENGINEER DAYS SAVED.",
      "💰 [ROI] AGENT-042 SAVED $1,250 IN COMPUTATIONAL OVERHEAD.",
      "🚀 [FORGE] PRO TEMPLATE #058 DEPLOYED TO EDGE NODE.",
      "🛡️ [SECURITY] AGENT-SEC BLOCKED 14 PROMPT INJECTION ATTEMPTS.",
      "📊 [REVENUE] ROI SCAN TARGET: $45,000 Q2 SAVINGS REACHED."
    ];

    setInterval(() => {
      const log = logs[Math.floor(Math.random() * logs.length)];
      this.broadcast(log);
    }, 5000);
  }
}
