import type { BotEvent } from '@/types';
import log from '@/utils/logger';
import type { GuildMember, Client } from '@fluxerjs/core';

// fires whenever a new member joins a guild the bot is in
const event: BotEvent = {
  name: 'guildMemberAdd',

  async execute(member: GuildMember, _client: Client) {
    const username = member?.user?.username ?? 'Unknown';
    const guildName = member?.guild?.name ?? 'Unknown Guild';
    const memberCount = member?.guild?.members?.size ?? '?'; // size of the cached member collection

    log.info('MemberJoin', `${username} joined ${guildName} (${memberCount} members)`);
  },
};

export default event;
