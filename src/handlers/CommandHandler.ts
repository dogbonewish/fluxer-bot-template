// dis be the command handler! it loads commands from src/commands/"your category blah blah" and executes them when a message is sent with the correct prefix. it also handles permissions, cooldowns, owner-only commands, and more!

import fs from 'fs';
import path from 'path';
import { PermissionFlags } from '@fluxerjs/core';
import type { Client, Message } from '@fluxerjs/core';
import type { Command } from '../types';
import config from '../config';

export default class CommandHandler {
  client: Client;
  commands = new Map<string, Command>();
  private cooldowns = new Map<string, number>();
  prefix: string;

  constructor(client: Client) {
    this.client = client;
    this.prefix = config.prefix;
  }

  async loadCommands(): Promise<void> {
    const commandsPath = path.join(__dirname, '..', 'commands');

    if (!fs.existsSync(commandsPath)) {
      console.warn('[CommandHandler] Commands directory not found, creating...');
      fs.mkdirSync(commandsPath, { recursive: true });
      return;
    }

    const categories = fs
      .readdirSync(commandsPath, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    for (const category of categories) {
      const categoryPath = path.join(commandsPath, category);
      const commandFiles = fs
        .readdirSync(categoryPath)
        .filter(
          (file) => (file.endsWith('.ts') || file.endsWith('.js')) && !file.endsWith('.d.ts')
        );

      for (const file of commandFiles) {
        try {
          const commandPath = path.join(categoryPath, file);
          const imported = require(commandPath);
          const command: Command = imported.default || imported;

          if (!command.name) {
            console.warn(`[CommandHandler] Command in ${file} is missing a name, skipping...`);
            continue;
          }

          this.commands.set(command.name, {
            ...command,
            category,
          });

          // registers aliases
          if (command.aliases && Array.isArray(command.aliases)) {
            for (const alias of command.aliases) {
              this.commands.set(alias, {
                ...command,
                category,
                isAlias: true,
              });
            }
          }

          console.log(`[CommandHandler] Loaded: ${command.name} (${category})`);
        } catch (error: any) {
          console.error(`[CommandHandler] Error loading command ${file}:`, error.message);
        }
      }
    }

    console.log(`[CommandHandler] ${this.commands.size} commands loaded.`);
  }

  /**
   * Process an incoming message and execute the matching command.
   */
  async handleMessage(message: Message): Promise<void> {
    if ((message as any).author?.bot || !message.content) return;

    // Check prefix
    if (!message.content.startsWith(this.prefix)) return;

    const args = message.content.slice(this.prefix.length).trim().split(/\s+/);
    const commandName = args.shift()?.toLowerCase();
    if (!commandName) return;

    const command = this.commands.get(commandName);
    if (!command) return;

    // Guild-only check
    const guild = (message as any).guild;
    if (!guild && !command.allowDM) {
      await message.reply('This command can only be used in a server.').catch(() => {});
      return;
    }

    // Permission check
    if (command.permissions && command.permissions.length > 0 && guild) {
      const member = await this.getMember(message);
      if (!member) {
        await message.reply('Could not fetch your member data.').catch(() => {});
        return;
      }

      const hasPermission = command.permissions.some((perm) => {
        return (member as any).permissions?.has(
          (PermissionFlags as unknown as Record<string, bigint>)[perm]
        );
      });

      if (!hasPermission) {
        await message
          .reply(`You need the following permissions: ${command.permissions.join(', ')}`)
          .catch(() => {});
        return;
      }
    }

    // Owner-only check
    if (command.ownerOnly && config.ownerId) {
      if ((message as any).author.id !== config.ownerId) {
        await message.reply('This command is restricted to the bot owner.').catch(() => {});
        return;
      }
    }

    // Cooldown check
    const cooldownInfo = this.checkCooldown((message as any).author.id, commandName);
    if (!cooldownInfo.ready) {
      await message
        .reply(`Please wait ${cooldownInfo.remaining} second(s) before using this command again.`)
        .catch(() => {});
      return;
    }

    // Execute
    try {
      await command.execute(message, args, this.client);
    } catch (error: any) {
      console.error(`[CommandHandler] Error in !${commandName}:`, error.message || error);
      await message.reply('There was an error executing this command.').catch(() => {});
    }
  }

  /**
   * Resolve a guild member from a message.
   */
  private async getMember(message: Message): Promise<unknown> {
    let guild = (message as any).guild;

    if (!guild && (message as any).guildId) {
      try {
        guild = await this.client.guilds.fetch((message as any).guildId);
      } catch {
        return null;
      }
    }
    if (!guild) return null;

    let member = guild.members?.get((message as any).author.id);
    if (!member) {
      try {
        member = await guild.fetchMember((message as any).author.id);
      } catch {
        return null;
      }
    }
    return member;
  }

  /**
   * Check (and set) per-user command cooldowns.
   */
  checkCooldown(userId: string, commandName: string): { ready: boolean; remaining: number } {
    const key = `${userId}-${commandName}`;
    const now = Date.now();
    const cooldownAmount = config.cooldown.default;

    if (this.cooldowns.has(key)) {
      const expirationTime = this.cooldowns.get(key)! + cooldownAmount;
      if (now < expirationTime) {
        const remaining = Math.ceil((expirationTime - now) / 1000);
        return { ready: false, remaining };
      }
    }

    this.cooldowns.set(key, now);
    setTimeout(() => this.cooldowns.delete(key), cooldownAmount);

    return { ready: true, remaining: 0 };
  }

  /** Get a single command by name or alias. */
  getCommand(name: string): Command | undefined {
    return this.commands.get(name);
  }

  /** Get all commands grouped by category (excludes aliases). */
  getCommandsByCategory(): Record<string, Command[]> {
    const categories: Record<string, Command[]> = {};

    for (const [, command] of this.commands) {
      if (command.isAlias) continue;
      if (!categories[command.category]) {
        categories[command.category] = [];
      }
      categories[command.category].push(command);
    }

    return categories;
  }
}
