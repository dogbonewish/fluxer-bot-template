// this is another example command! a;slo remove at your own discretion!

import { EmbedBuilder, Routes } from '@fluxerjs/core';
import type { Command } from '@/types';

const command: Command = {
  name: 'ping',
  description: 'Check if the bot is online and see the response time.',
  usage: '',
  category: 'general',
  cooldown: 3,

  async execute(message, _args, client) {
    try {
      const msgStart = Date.now();
      const msg = await message.reply('Pinging...');
      const msgLatency = Date.now() - msgStart;

      const restStart = Date.now();
      await client.rest.get(Routes.currentUser());
      const restLatency = Date.now() - restStart;

      const embed = new EmbedBuilder()
        .setTitle('Pong!')
        .setColor(0x5865f2)
        .addFields(
          { name: 'REST API', value: `\`${restLatency}ms\``, inline: true },
          { name: 'Message Round-trip', value: `\`${msgLatency}ms\``, inline: true }
        )
        .setTimestamp();

      await msg.edit({ content: '', embeds: [embed] });
    } catch (error: any) {
      console.error(`Error in !ping: ${error.message || error}`);
    }
  },
};

export default command;
