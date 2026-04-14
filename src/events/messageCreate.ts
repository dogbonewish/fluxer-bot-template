import type { BotEvent } from '@/types';

const event: BotEvent = {
  name: 'messageCreate',

  async execute(message: any, client: any) {
    // ignores bot messages because bots have no souls therefore they dont deserve to be listened to. also prevents potential infinite loops if the bot responds to itself. hehe
    if (message.author?.bot) return;

    // pass this along to the command handler
    const commandHandler = (client as any).commandHandler;
    if (commandHandler) {
      await commandHandler.handleMessage(message);
    }
  },
};

export default event;
