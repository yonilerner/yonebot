import {getMongoManager} from 'typeorm'
import {StarModel} from './models/star-model'
import {EMOJIS} from './utils'
import {StarboardMessageModel} from './models/starboard-message-model'
import {discordClient} from './discord-client'
import {
    Constants,
    Message,
    MessageActionRow,
    MessageButton,
    MessageEmbed,
    PartialMessage,
    TextChannel,
} from 'discord.js'
import PQueue from 'p-queue'
import {MessageButtonStyles} from 'discord.js/typings/enums.js'

export const STARBOARD_THRESHOLD = 3
export const STARBOARD_CHANNEL_DEFAULT_NAME = 'starboard'

export const starboardUpdateQueue = new PQueue()

export function handleStarboardUpdate(message: Message | PartialMessage) {
    starboardUpdateQueue.add(() => handleStarboardUpdateInternal(message))
}

async function handleStarboardUpdateInternal(message: Message | PartialMessage) {
    if (!message.inGuild()) {
        return
    }
    const fullMessage = await message.fetch()
    if (!fullMessage.member) {
        return
    }
    const messageId = message.id
    const numStars = await getMongoManager().count(StarModel, {messageId})

    if (!fullMessage.member) {
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
            name: fullMessage.member.displayName,
            iconURL: fullMessage.member.displayAvatarURL({size: 16}),
        })
        .setColor(Constants.Colors.BLUE)
        .setDescription(message.content)
    const attachment = fullMessage.attachments.first()
    if (attachment) {
        embed.setImage(attachment.url)
    }

    embed
        .setTimestamp(message.createdAt)
        .addField('Channel', `<#${message.channelId}>`)
        .addField('# Stars', `${numStars} ${EMOJIS.star}`)

    const component = new MessageActionRow().addComponents(
        new MessageButton()
            .setURL(fullMessage.url)
            .setLabel('Go to message')
            .setStyle(MessageButtonStyles.LINK),
    )

    const starboardMessageModel = await getMongoManager().findOne(StarboardMessageModel, {
        starredMessageId: messageId,
    })
    if (!starboardMessageModel) {
        if (numStars < STARBOARD_THRESHOLD) {
            return
        }
        const message = await starboardChannel.send({
            embeds: [embed],
            components: [component],
        })
        await getMongoManager().save(
            new StarboardMessageModel({
                starredMessageId: messageId,
                starboardMessageId: message.id,
            }),
        )
    } else {
        const starboardMessage = await starboardChannel.messages.fetch(
            starboardMessageModel.starboardMessageId,
        )
        await starboardMessage.edit({embeds: [embed], components: [component]})
    }
}
