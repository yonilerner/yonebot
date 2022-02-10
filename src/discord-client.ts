import {SlashasaurusClient} from 'slashasaurus'
import {Intents} from 'discord.js'
import * as path from 'path'
import {handleMessage} from './message-handlers'
import {
    handleNewReaction,
    handleReactionRemoved,
    handleAllReactionsRemoved,
    handleEmojiRemoved,
} from './reaction-handlers'
import {createConnection} from 'typeorm'
import {globals} from './globals.js'
import {UserError} from './utils'

export const discordClient = new SlashasaurusClient(
    {
        intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MEMBERS,
            Intents.FLAGS.GUILD_MESSAGES,
            Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        ],
        partials: [
            'CHANNEL',
            'GUILD_MEMBER',
            'GUILD_SCHEDULED_EVENT',
            'MESSAGE',
            'USER',
            'REACTION',
        ],
    },
    {
        devServerId: globals.DEV_SERVER_ID,
    },
)

discordClient.on('messageCreate', handleMessage)
discordClient.on('messageReactionAdd', handleNewReaction)
discordClient.on('messageReactionRemove', handleReactionRemoved)
discordClient.on('messageReactionRemoveAll', handleAllReactionsRemoved)
discordClient.on('messageReactionRemoveEmoji', handleEmojiRemoved)

discordClient.once('ready', async () => {
    console.log(`${discordClient.user?.tag} logged in`)
    await discordClient.registerCommandsFrom(path.join(__dirname, 'commands'), 'dev')
})

discordClient.useCommandMiddleware(async (interaction, _, __, next) => {
    try {
        await next()
    } catch (e) {
        if (e instanceof UserError) {
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply(`:x: ${e.message}`)
            } else {
                await interaction.reply({
                    content: `:x: ${e.message}`,
                    ephemeral: true,
                })
            }
        } else {
            console.error(`Error handling command ${interaction.command?.name}`, e)
            const replyer =
                interaction.deferred || interaction.replied
                    ? interaction.editReply
                    : interaction.reply
            replyer(`Unknown server error`)
        }
    }
})

createConnection()
    .catch((e) => {
        console.error('Unable to create DB connection', e)
        process.exit(1)
    })
    .then(() => discordClient.login(globals.BOT_TOKEN))
    .catch((e) => {
        console.error('Unable to login', e)
        process.exit(1)
    })
