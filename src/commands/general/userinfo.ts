// this is an example command! remove at your own discretion!

import { EmbedBuilder } from '@fluxerjs/core';
import type { Command } from '@/types';

// derives account creation date from a fluxer snowflake id (no createdAt property on User)
function snowflakeToDate(id: string): Date {
  const EPOCH = 1420070400000n;
  const ms = (BigInt(id) >> 22n) + EPOCH;
  return new Date(Number(ms));
}

const command: Command = {
  name: 'userinfo',
  description: 'Show information about a user.',
  usage: '<@user>',
  category: 'general',
  cooldown: 10,
  permissions: ['ManageMessages'],

  async execute(message, _args, _client) {
    try {
      // message.mentions is a User[] in fluxer — grab the first one, or fall back to the author
      const target = message.mentions[0] ?? message.author;

      const createdAt = snowflakeToDate(target.id).toUTCString();
      const displayName = target.globalName ?? target.username;
      const avatarUrl = target.displayAvatarURL({ size: 256 });

      const embed = new EmbedBuilder()
        .setTitle(displayName)
        .setThumbnail(avatarUrl)
        .setColor(0x5865f2)
        .addFields(
          { name: 'Username', value: `\`${target.username}\``, inline: true },
          { name: 'ID', value: `\`${target.id}\``, inline: true },
          { name: 'Bot', value: target.bot ? 'Yes' : 'No', inline: true },
          { name: 'Account Created', value: createdAt }
        )
        .setTimestamp();

      await message.reply({ embeds: [embed] }).catch(() => {});
    } catch (error: any) {
      console.error(`Error in !userinfo: ${error.message || error}`);
    }
  },
};

export default command;
