// config handler — env vars are parsed and validated with Zod at startup.
// if anything is missing or wrong, the process exits with a clear error message.

import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ quiet: true });

const envSchema = z.object({
  TOKEN: z.string().min(1, 'TOKEN is required PLEASE add it to your .env file'),
  PREFIX: z.string().min(1).default('!'), // defaults to ! if not set
  OWNER_ID: z.string().optional(), // leave blank if you don't need owner-only commands
  COOLDOWN_DEFAULT: z
    .string()
    .optional()
    .transform((val: string | undefined) => (val ? parseInt(val, 10) : 3000)) // defaults to 3000ms
    .pipe(z.number().int().positive('COOLDOWN_DEFAULT must be a positive integer (milliseconds)')),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // print each failing field clearly so it's easy to know what to fix
  const issues = parsed.error.issues
    .map((i: z.core.$ZodIssue) => `  • ${i.path.join('.')}: ${i.message}`)
    .join('\n');
  console.error(`\n[Config] Invalid environment variables:\n${issues}\n`);
  process.exit(1);
}

const env = parsed.data;

const config = {
  token: env.TOKEN,
  prefix: env.PREFIX,
  ownerId: env.OWNER_ID ?? null,
  cooldown: {
    default: env.COOLDOWN_DEFAULT,
  },
} as const;

export default config;
