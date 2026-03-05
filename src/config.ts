// config handler

import dotenv from 'dotenv';
import type { BotConfig } from './types';

dotenv.config();

const config: BotConfig = {
  token: process.env.TOKEN || '',
  prefix: process.env.PREFIX || '!',
  ownerId: process.env.OWNER_ID || null,
  cooldown: {
    default: parseInt(process.env.COOLDOWN_DEFAULT || '3000', 10),
  },

  validate(): boolean {
    const required: [string, string][] = [['TOKEN', this.token]];

    let valid = true;
    for (const [name, value] of required) {
      if (!value) {
        console.error(`Missing required environment variable: ${name}`);
        valid = false;
      }
    }

    return valid;
  },
};

export default config;
