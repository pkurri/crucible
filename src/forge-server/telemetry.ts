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
      "OPTIMIZING NEURAL PATHWAYS...",
      "SYNCING WITH CLOUDE CODE [LATEST]",
      "FORGING NEW SECURITY TOKENS...",
      "ANALYZING ARCHITECTURE HOTSPOTS...",
      "DEPLOYING EDGE MONITORING [PICOCLAW]",
      "REFINING TEMPLATE #042...",
      "UPDATING ARMORY CACHE..."
    ];

    setInterval(() => {
      const log = logs[Math.floor(Math.random() * logs.length)];
      this.broadcast(log);
    }, 5000);
  }
}
