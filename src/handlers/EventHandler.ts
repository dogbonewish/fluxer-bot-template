import fs from 'fs';
import path from 'path';
import type { Client } from '@fluxerjs/core';
import type { BotEvent } from '../types';

export default class EventHandler {
  client: Client;
  events = new Map<string, BotEvent>();

  constructor(client: Client) {
    this.client = client;
  }

  // Load all events from src/events/ and register them on the client.

  async loadEvents(): Promise<void> {
    const eventsPath = path.join(__dirname, '..', 'events');

    if (!fs.existsSync(eventsPath)) {
      console.warn('[EventHandler] Events directory not found, creating...');
      fs.mkdirSync(eventsPath, { recursive: true });
      return;
    }

    const eventFiles = fs
      .readdirSync(eventsPath)
      .filter((file) => (file.endsWith('.ts') || file.endsWith('.js')) && !file.endsWith('.d.ts'));

    for (const file of eventFiles) {
      try {
        const eventPath = path.join(eventsPath, file);
        const imported = require(eventPath);
        const event: BotEvent = imported.default || imported;

        if (!event.name) {
          console.warn(`[EventHandler] Event in ${file} is missing a name, skipping...`);
          continue;
        }

        // once or persistent listener
        if (event.once) {
          this.client.once(event.name, (...args: unknown[]) => {
            try {
              const result = event.execute(...args, this.client);
              if (result && typeof (result as any).catch === 'function') {
                (result as any).catch((err: Error) => {
                  console.error(`[EventHandler] Unhandled error in event ${event.name}:`, err);
                });
              }
            } catch (err) {
              console.error(`[EventHandler] Unhandled error in event ${event.name}:`, err);
            }
          });
        } else {
          this.client.on(event.name, (...args: unknown[]) => {
            try {
              const result = event.execute(...args, this.client);
              if (result && typeof (result as any).catch === 'function') {
                (result as any).catch((err: Error) => {
                  console.error(`[EventHandler] Unhandled error in event ${event.name}:`, err);
                });
              }
            } catch (err) {
              console.error(`[EventHandler] Unhandled error in event ${event.name}:`, err);
            }
          });
        }

        this.events.set(event.name, event);
        console.log(`[EventHandler] Loaded: ${event.name}${event.once ? ' (once)' : ''}`);
      } catch (error: any) {
        console.error(`[EventHandler] Error loading event ${file}:`, error.message);
      }
    }

    console.log(`[EventHandler] ${this.events.size} events loaded.`);
  }
}
