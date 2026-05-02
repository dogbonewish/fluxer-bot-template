import fs from 'fs';
import path from 'path';
import type { Client } from '@fluxerjs/core';
import type { BotEvent } from '@/types';

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

        const handler = (...args: unknown[]) => {
          try {
            const result = event.execute(...args, this.client);
            if (result && typeof result.catch === 'function') {
              result.catch((err: Error) => {
                console.error(`[EventHandler] Unhandled error in event ${event.name}:`, err);
              });
            }
          } catch (err) {
            console.error(`[EventHandler] Unhandled error in event ${event.name}:`, err);
          }
        };

        const names = new Set<string>();
        const original = event.name;
        names.add(original);

        const camelToSnakeUpper = (s: string) =>
          s.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase();
        const snakeUpperToCamel = (s: string) =>
          s.toLowerCase().replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());

        if (original.includes('_')) {
          names.add(snakeUpperToCamel(original));
        } else {
          names.add(camelToSnakeUpper(original));
        }

        for (const name of names) {
          if (event.once) this.client.once(name, handler);
          else this.client.on(name, handler);
        }

        this.events.set(event.name, event);
        console.log(
          `[EventHandler] Loaded: ${event.name}${event.once ? ' (once)' : ''}${
            names.size > 1 ? ` (aliases: ${Array.from(names).join(', ')})` : ''
          }`
        );
      } catch (error) {
        console.error(
          `[EventHandler] Error loading event ${file}:`,
          error instanceof Error ? error.message : error
        );
      }
    }

    console.log(`[EventHandler] ${this.events.size} events loaded.`);
  }
}
