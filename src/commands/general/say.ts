// this is an example command! remove at your own discretion!

import type { Command } from '@/types';
import config from '@/config';

const command: Command = {
  name: 'say',
  description: 'Make the bot say something.',
  usage: '<message>',
  category: 'general',
  cooldown: 5,

  async execute(message, args) {
    if (!args.length) {
      return void (await message.reply(`Usage: \`${config.prefix}say <message>\``).catch(() => {}));
    }

    const text = args.join(' ');

    try {
      await message.delete();
    } catch {}

    await message.channel?.send?.({ content: text }).catch(() => {
      // fallbacks to a reply
      message.reply(text).catch(() => {});
    });
  },
};

export default command;
