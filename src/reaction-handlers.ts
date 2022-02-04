import {
    Collection,
    Message,
    MessageReaction,
    PartialMessage,
    PartialMessageReaction,
    PartialUser,
    Snowflake,
    User,
} from 'discord.js'
import {getMongoManager} from 'typeorm'
import {StarModel} from './models/star-model'
import {EMOJIS} from './utils'
import {handleStarboardUpdate} from './starboard'

export async function handleNewReaction(
    reaction: MessageReaction | PartialMessageReaction,
    user: User | PartialUser,
) {
    if (!reaction.message.guildId) {
        return
    }
    if (reaction.emoji.toString() === EMOJIS.star) {
        return handleStarReactionCreated(reaction, user)
    }
}

export async function handleReactionRemoved(
    reaction: MessageReaction | PartialMessageReaction,
    user: User | PartialUser,
) {
    if (!reaction.message.guildId) {
        return
    }
    if (reaction.emoji.toString() === EMOJIS.star) {
        return handleStarReactionRemoved(reaction, user)
    }
}

export async function handleAllReactionsRemoved(
    message: Message | PartialMessage,
    reactions: Collection<string | Snowflake, MessageReaction>,
) {
    if (!message.guildId) {
        return
    }
    await Promise.all(
        reactions.map(async (reaction) => {
            if (reaction.emoji.toString() === EMOJIS.star) {
                return handleStarReactionRemoved(reaction)
            }
        }),
    )
}

export async function handleEmojiRemoved(reaction: MessageReaction | PartialMessageReaction) {
    if (!reaction.message.guildId) {
        return
    }
    if (reaction.emoji.toString() === EMOJIS.star) {
        return handleStarReactionRemoved(reaction)
    }
}

async function handleStarReactionCreated(
    reaction: MessageReaction | PartialMessageReaction,
    user: User | PartialUser,
) {
    const star = {
        userId: user.id,
        messageId: reaction.message.id,
    }
    await getMongoManager().replaceOne(StarModel, star, star, {upsert: true})
    await handleStarboardUpdate(reaction.message)
}

async function handleStarReactionRemoved(
    reaction: MessageReaction | PartialMessageReaction,
    user?: User | PartialUser,
) {
    const star = {
        messageId: reaction.message.id,
        userId: user?.id,
    }
    if (star.userId) {
        await getMongoManager().deleteOne(StarModel, star)
    } else {
        await getMongoManager().deleteMany(StarModel, star)
    }
    await handleStarboardUpdate(reaction.message)
}
