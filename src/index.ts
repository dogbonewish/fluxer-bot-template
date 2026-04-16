// this is the entry point of the bot. It initializes the client, loads commands/events, and starts the bot.

import { Client } from '@fluxerjs/core';
import config from './config';
import CommandHandler from './handlers/CommandHandler';
import EventHandler from './handlers/EventHandler';
import log from './utils/logger';
import packageJson from '../package.json';

function dumpProcessState(reason: string): void {
  if (!process.env.DEBUG_PROCESS_EXIT) return;

  try {
    const handles = (process as any)._getActiveHandles?.() ?? [];
    const requests = (process as any)._getActiveRequests?.() ?? [];

    const summarize = (x: any) => {
      const name = x?.constructor?.name ?? typeof x;
      const extra: Record<string, unknown> = {};
      if (Object.prototype.hasOwnProperty.call(x, '_idleTimeout'))
        extra._idleTimeout = x._idleTimeout;
      if (Object.prototype.hasOwnProperty.call(x, '_repeat')) extra._repeat = x._repeat;
      if (typeof x?.listenerCount === 'function') extra.listeners = x.listenerCount('close');
      if (x?.localAddress) extra.local = `${x.localAddress}:${x.localPort}`;
      if (x?.remoteAddress) extra.remote = `${x.remoteAddress}:${x.remotePort}`;
      return { name, extra };
    };

    log.warn('ProcessExit', `${reason}`);
    log.info(
      'ProcessExit',
      `pid=${process.pid} node=${process.version} platform=${process.platform}`
    );
    log.info('ProcessExit', `activeHandles=${handles.length} activeRequests=${requests.length}`);
    if (handles.length)
      log.info('ProcessExit', `handles=${JSON.stringify(handles.map(summarize))}`);
    if (requests.length)
      log.info('ProcessExit', `requests=${JSON.stringify(requests.map(summarize))}`);
  } catch (e) {
    log.error('ProcessExit', e instanceof Error ? e.message : e);
  }
}

// this is used to create the client :)
const client = new Client({
  intents: 0, // fluxer.js does not support intents.
  presence: {
    status: 'online' as const,
    custom_status: { text: 'Building a bot for fluxer!' }, // you can change the text to whatever you want!
    afk: false,
  },
});

// init handlers
const commandHandler = new CommandHandler(client);
const eventHandler = new EventHandler(client);

client.commandHandler = commandHandler;
client.eventHandler = eventHandler;

// bot startup
async function start(): Promise<void> {
  log.banner([`Fluxer Bot Template  v${packageJson.version}`]);

  log.divider('Loading');

  // loads commands
  let t = Date.now();
  await commandHandler.loadCommands();
  log.step('Commands', Date.now() - t);

  // loads events
  t = Date.now();
  await eventHandler.loadEvents();
  log.step('Events', Date.now() - t);

  log.divider('Connecting');

  // this connects the bot to the fluxer gateway
  t = Date.now();
  await client.login(config.token);
  log.step('Gateway', Date.now() - t);

  // this may fix an issue another person is having 🥀
  setInterval(() => {}, 1 << 30);
}

// "GRACEFUL SHUTDOWN."
let isShuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (isShuttingDown) return;
  isShuttingDown = true;

  log.warn('Shutdown', `Received ${signal}, shutting down...`);

  try {
    client.destroy();
  } catch {}

  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('beforeExit', (code) => dumpProcessState(`beforeExit code=${code}`));
process.on('exit', (code) => dumpProcessState(`exit code=${code}`));

// catch unhandled errors and log them to prevent the bot from crashing without any logs. This is especially useful for catching errors in events/commands that aren't properly handled.
process.on('unhandledRejection', (error) => {
  log.error('Unhandled', error instanceof Error ? error.message : error);
});

process.on('uncaughtException', (error) => {
  log.fatal('Uncaught', error instanceof Error ? error.message : error);
  setTimeout(() => process.exit(1), 1000);
});

// go!
start().catch((err) => {
  log.fatal('Startup', err.message || err);
  process.exit(1);
});

// this adds the handler types to the client, for autocomplete
declare module '@fluxerjs/core' {
  interface Client {
    commandHandler: CommandHandler;
    eventHandler: EventHandler;
  }
}
