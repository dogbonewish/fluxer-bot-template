// this is an example command! remove at your own discretion!
// ownerOnly: true — only the bot owner (OWNER_ID in .env) can run this
// hidden: true    — won't show up in !help for regular users

import type { Command } from '@/types';

const command: Command = {
  name: 'secret',
  description: 'A command only the bot owner can run.',
  category: 'general',
  ownerOnly: true,
  hidden: true,

  async execute(message, _args, _client) {
    await message.reply('👋 Hey owner! This is a secret owner-only command.').catch(() => {});
  },
};

export default command;
