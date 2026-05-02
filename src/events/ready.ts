import type { BotEvent } from '@/types';
import log from '@/utils/logger';
import type { Client } from '@fluxerjs/core';

function formatUptime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

const event: BotEvent = {
  name: 'ready',
  once: true,

  execute(client: Client) {
    const guilds = client.guilds?.size || 0;
    const user = client.user;

    log.box('Bot Online', [
      { label: 'User', value: user?.username || 'Unknown' },
      { label: 'Guilds', value: String(guilds) },
      { label: 'Node', value: process.version },
    ]);

    // Optional: heartbeat log every 5 minutes
    const startedAt = Date.now();
    setInterval(
      () => {
        const memMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
        log.info(
          'Heartbeat',
          `Uptime: ${formatUptime(Date.now() - startedAt)} | Memory: ${memMB} MB | Guilds: ${client.guilds?.size || 0}`
        );
      },
      5 * 60 * 1000
    );
  },
};

export default event;
