# Fluxer Bot Template

A clean, everything included starter template for building bots with [`@fluxerjs/core`](https://fluxer.js.org/).

This comes with a custom command handler, event handler, console logging, and a silly persons project structure -- so you can focus on building your own commands instead of all the other nonsense!

![Demo](assets/demo.gif)

## Features

- **Custom Command Handler** - auto-loads commands from categorized folders, with aliases, permissions, cooldowns, and support for commands only the "Owner" can run (config  in .env).
- **Custom Event Handler** - auto-loads events with async error catching.
- **TypeScript** - fully typed with strict mode (you love typescript right! right..?).

## Project Structure

```
src/
  index.ts
  config.ts
  commands/
    general/
      help.ts
      ping.ts
      say.ts
  events/
      ready.ts
      messageCreate.ts
  handlers/
      CommandHandler.ts
      EventHandler.ts
  types/
      Command.ts
      Config.ts
      Event.ts
      index.ts
  utils/
      logger.ts
```

## Quick start

### 1. Clone it and install this sucker!

```bash
git clone https://github.com/dogbonewish/fluxer-bot-template.git
cd fluxer-bot-template
npm install
```

### 2. Configure .env

```bash
cp .env.example .env
```

Edit `.env` and fill the info out:

```env
TOKEN=your-fluxer-bot-token-here
PREFIX=!
OWNER_ID=your-user-id
COOLDOWN_DEFAULT=3000
```

### 3. Run dis bitch

```bash
# development builds
npm run dev

# production builds
npm run build
npm start
```

## Adding Commands

Create a new file in `src/commands/<category>/` - the handler will pick it up automatically!

```ts
// src/commands/general/hello.ts
import type { Command } from '../../types';

const command: Command = {
  name: 'hello',
  description: 'Say hello!',
  category: 'general',

  async execute(message, args, client) {
    await message.reply('Hello! 👋');
  },
};

export default command;
```

### Command Options

| Property      | Type       | Description                                    |
| ------------- | ---------- | ---------------------------------------------- |
| `name`        | `string`   | Command name (required)                        |
| `description` | `string`   | Shown in `!help`                               |
| `usage`       | `string`   | Usage hint, e.g. `<user> [reason]`             |
| `aliases`     | `string[]` | Alternative names                              |
| `permissions` | `string[]` | Required Fluxer permission flags               |
| `cooldown`    | `number`   | Cooldown in seconds                            |
| `ownerOnly`   | `boolean`  | Restrict to `OWNER_ID`                         |
| `allowDM`     | `boolean`  | Allow in DMs (default: guild-only)             |
| `hidden`      | `boolean`  | Hide from `!help`                              |

## Adding Events

Create a new file in `src/events/` - the handler will register it auto-magically.

```ts
// src/events/guildCreate.ts
import type { BotEvent } from '../types';

const event: BotEvent = {
  name: 'guildCreate',

  execute(guild: any, client: any) {
    console.log(`Joined guild: ${guild.name}`);
  },
};

export default event;
```

## Extending

This template is very minimal on purpose. Here's some ideas for what you could add!

- **Database** - add a database for any persistent storage, there's a ton!
- **Per-guild prefixes** - extend the command handler to look up prefixes from a database.
- **Automod** - add some fancy message filtering in `messageCreate`
- **Dashboard** - add an Express API + React frontend for a fancy shmancy dashboard
- **Error Tracking** - integrate any external error tracking solutions, i'd recommend sentry but there is plenty more!

## Built with
- [`@fluxerjs/core`](https://fluxer.js.org/) - None of this would be possible without the work of [Blstmo!](https://github.com/blstmo) his and his contributors work on fluxer.js has made all of this possible. Sponsor him or else!!!!!
- [TypeScript](https://www.typescriptlang.org/) - and typescript yea.. yea check it out or some thing i dont know what to say we're reaching the end of the readme file, how about you go eat some typescript

## License

MIT - use this code HOWEVER you want do whatever you want with it. Be creative and make the best bot for fluxer there ever will be.
