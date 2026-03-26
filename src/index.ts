// this is the entry point of the bot. It initializes the client, loads commands/events, and starts the bot.

import { Client } from '@fluxerjs/core';
import config from './config';
import CommandHandler from './handlers/CommandHandler';
import EventHandler from './handlers/EventHandler';
import log from './utils/logger';

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

(client as any).commandHandler = commandHandler;
(client as any).eventHandler = eventHandler;

// bot startup
async function start(): Promise<void> {
  log.banner([`Fluxer Bot Template  v${require('../package.json').version}`]);

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
  await new Promise<never>(() => {});
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

// catch unhandled errors and log them to prevent the bot from crashing without any logs. This is especially useful for catching errors in events/commands that aren't properly handled.
process.on('unhandledRejection', (error: any) => {
  log.error('Unhandled', error?.message || error);
});

process.on('uncaughtException', (error: any) => {
  log.fatal('Uncaught', error?.message || error);
  setTimeout(() => process.exit(1), 1000);
});

// go!
start().catch((err) => {
  log.fatal('Startup', err.message || err);
  process.exit(1);
});
