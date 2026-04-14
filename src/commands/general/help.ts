import { EmbedBuilder } from '@fluxerjs/core';
import type { Command } from '@/types';
import config from '@/config';

const CATEGORY_ORDER = ['general', 'moderation', 'admin', 'info'];

const command: Command = {
  name: 'help',
  description: 'Show all commands, or detailed info on a specific command.',
  usage: '[command]',
  category: 'general',
  cooldown: 5,

  async execute(message, args, client) {
    const commandHandler = (client as any).commandHandler;
    if (!commandHandler) return void (await message.reply('Command handler not available.'));

    const prefix = config.prefix;
    const isOwner = config.ownerId && (message as any).author.id === config.ownerId;

    try {
      // specific command info
      if (args[0]) {
        const cmdName = args[0].toLowerCase();
        const cmd = commandHandler.getCommand(cmdName);

        if (!cmd || cmd.hidden || (cmd.ownerOnly && !isOwner)) {
          return void (await message
            .reply(
              `No command called \`${cmdName}\` found. Use \`${prefix}help\` to see all commands.`
            )
            .catch(() => {}));
        }

        const embed = new EmbedBuilder()
          .setTitle(cmd.name)
          .setDescription(
            Array.isArray(cmd.description) ? cmd.description.join('\n') : cmd.description
          )
          .setColor(0x5865f2)
          .addFields({
            name: 'Usage',
            value: `\`${prefix}${cmd.name}${cmd.usage ? ' ' + cmd.usage : ''}\``,
          });

        if (cmd.aliases?.length) {
          embed.addFields({
            name: 'Aliases',
            value: cmd.aliases.map((a: string) => `\`${a}\``).join(' '),
            inline: true,
          });
        }
        if (cmd.permissions?.length) {
          embed.addFields({ name: 'Permissions', value: cmd.permissions.join(', '), inline: true });
        }
        if (cmd.cooldown) {
          embed.addFields({ name: 'Cooldown', value: `${cmd.cooldown}s`, inline: true });
        }

        embed.setTimestamp();
        return void (await message.reply({ embeds: [embed] }).catch(() => {}));
      }

      // trhre full command list
      const categories = commandHandler.getCommandsByCategory();
      const embed = new EmbedBuilder()
        .setTitle('Commands')
        .setDescription(`Use \`${prefix}help <command>\` for details on a specific command.`)
        .setColor(0x5865f2);

      const sortedCategories = Object.keys(categories).sort((a, b) => {
        const ia = CATEGORY_ORDER.indexOf(a);
        const ib = CATEGORY_ORDER.indexOf(b);
        return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
      });

      for (const cat of sortedCategories) {
        const cmds = categories[cat]
          .filter((c: Command) => !c.hidden && (!c.ownerOnly || isOwner))
          .map((c: Command) => `\`${c.name}\``)
          .join('  ');

        if (cmds) {
          embed.addFields({
            name: cat.charAt(0).toUpperCase() + cat.slice(1),
            value: cmds,
          });
        }
      }

      embed.setTimestamp();
      await message.reply({ embeds: [embed] }).catch(() => {});
    } catch (error: any) {
      console.error(`Error in !help: ${error.message || error}`);
    }
  },
};

export default command;
