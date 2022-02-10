import {Guild, MessageOptions, MessagePayload, TextChannel} from 'discord.js'

export const EMOJIS = {
    star: '⭐',
}

export async function getAuditLogChannel(guild: Guild): Promise<TextChannel | undefined> {
    let channel = guild.channels.cache.find((channel) => channel.name === 'audit-log')
    if (channel instanceof TextChannel) {
        return channel
    }
    const channels = await guild.channels.fetch()
    channel = channels.find((channel) => channel.name === 'audit-log')
    if (channel instanceof TextChannel) {
        return channel
    }
    return undefined
}

export async function auditLogReport(
    message: string | MessagePayload | MessageOptions,
    guild: Guild,
) {
    const auditLogChannel = await getAuditLogChannel(guild)
    if (!auditLogChannel) {
        return
    }
    await auditLogChannel.send(message)
}
