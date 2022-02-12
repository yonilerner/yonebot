import {EMOJIS} from './utils'
import {discordClient} from './discord-client'
import {
    Constants,
    MessageActionRow,
    MessageButton,
    MessageEmbed,
    MessageReaction,
    PartialMessageReaction,
    TextChannel,
} from 'discord.js'
import PQueue from 'p-queue'
import {MessageButtonStyles} from 'discord.js/typings/enums.js'
import e from './edgeql-js'
import {edgedbClient} from './edgedb'

export const STARBOARD_THRESHOLD = 3
export const STARBOARD_CHANNEL_DEFAULT_NAME = 'starboard'

export const starboardUpdateQueue = new PQueue()

export function handleStarboardUpdate(reaction: MessageReaction | PartialMessageReaction) {
    starboardUpdateQueue.add(() => handleStarboardUpdateInternal(reaction))
}

async function handleStarboardUpdateInternal(reaction: MessageReaction | PartialMessageReaction) {
    if (!reaction.message.inGuild()) {
        return
    }
    const message = await reaction.message.fetch()
    if (!message.member || !message.inGuild()) {
        return
    }
    const messageId = message.id
    const numStars = message.reactions.cache.get(reaction.emoji.toString())?.count ?? 0

    if (!message.member) {
        return
    }
    const guild = discordClient.guilds.cache.get(message.guildId)
    if (!guild) {
        console.error(`Guild ${message.guildId} not found when updating starboard`)
        return
    }
    const starboardChannel = guild.channels.cache.find(
        (channel) => channel.name === STARBOARD_CHANNEL_DEFAULT_NAME,
    )
    if (!starboardChannel || !(starboardChannel instanceof TextChannel)) {
        return
    }

    const embed = new MessageEmbed()
        .setAuthor({
            name: message.member.displayName,
            iconURL: message.member.displayAvatarURL({size: 16}),
        })
        .setColor(Constants.Colors.BLUE)
        .setDescription(message.content)
    const attachment = message.attachments.first()
    if (attachment) {
        embed.setImage(attachment.url)
    }

    embed
        .setTimestamp(message.createdAt)
        .addField('Channel', `<#${message.channelId}>`)
        .addField('# Stars', `${numStars} ${EMOJIS.star}`)

    const component = new MessageActionRow().addComponents(
        new MessageButton()
            .setURL(message.url)
            .setLabel('Go to message')
            .setStyle(MessageButtonStyles.LINK),
    )

    const starboardMessageModel = await e
        .select(e.StarboardMessage, (s) => ({
            starredMessageId: true,
            starboardMessageId: true,
            filter: e.op(s.starredMessageId, '=', messageId),
        }))
        .run(edgedbClient)

    if (!starboardMessageModel) {
        if (numStars < STARBOARD_THRESHOLD) {
            return
        }
        const message = await starboardChannel.send({
            embeds: [embed],
            components: [component],
        })
        await e
            .insert(e.StarboardMessage, {
                starredMessageId: messageId,
                starboardMessageId: message.id,
            })
            .run(edgedbClient)
    } else {
        const starboardMessage = await starboardChannel.messages.fetch(
            starboardMessageModel.starboardMessageId,
        )
        await starboardMessage.edit({embeds: [embed], components: [component]})
    }
}
