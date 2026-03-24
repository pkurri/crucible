/**
 * 🤖 THE FORGE DISPATCHER (Crucix 2.0 Bot)
 * Handles multi-channel notifications for intelligence escalations.
 */

interface AlertPayload {
  title: string;
  category: 'market' | 'news' | 'tech' | 'social';
  severity: 'low' | 'medium' | 'high' | 'critical';
  content: string;
  metadata?: any;
}

export class ForgeDispatcher {
  /**
   * Dispatches a high-veracity alert to active channels.
   */
  static async dispatch(payload: AlertPayload) {
    console.log(`[DISPATCH] Broadcasting: ${payload.title} (${payload.severity})`);

    const promises = [];

    // 1. Discord Webhook
    if (process.env.DISCORD_WEBHOOK_URL) {
      promises.push(this.sendDiscordAlert(payload));
    }

    // 2. Telegram Bot
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      promises.push(this.sendTelegramAlert(payload));
    }

    await Promise.allSettled(promises);
  }

  private static async sendDiscordAlert(p: AlertPayload) {
    const color = p.severity === 'critical' ? 0xff0000 : p.severity === 'high' ? 0xff8c00 : 0x00ecff;
    
    const embed = {
      title: `⚡ [${p.category.toUpperCase()}] ${p.title}`,
      description: p.content,
      color: color,
      timestamp: new Date().toISOString(),
      footer: { text: 'CRUCIBLE FORGE — INTEL DISPATCH' },
      fields: Object.entries(p.metadata || {}).map(([key, val]) => ({
        name: key.toUpperCase(),
        value: String(val),
        inline: true
      }))
    };

    try {
      await fetch(process.env.DISCORD_WEBHOOK_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds: [embed] })
      });
    } catch (e) {
      console.error('[DISPATCH] Discord fail:', e);
    }
  }

  private static async sendTelegramAlert(p: AlertPayload) {
    const emoji = p.severity === 'critical' || p.severity === 'high' ? '🚨' : '📡';
    const text = `${emoji} *[${p.category.toUpperCase()}] ${p.title}*\n\n${p.content}\n\n_Forge Intelligence v2.0_`;

    try {
      await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text: text,
          parse_mode: 'Markdown'
        })
      });
    } catch (e) {
      console.error('[DISPATCH] Telegram fail:', e);
    }
  }
}
