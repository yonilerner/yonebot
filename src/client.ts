import {SlashasaurusClient} from 'slashasaurus'
import {Intents} from 'discord.js'
import {globals} from './globals'
import * as path from 'path'

const client = new SlashasaurusClient(
    {
        intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES],
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

client.once('ready', async () => {
    console.log(`${client.user?.tag} logged in`)
    await client.registerCommandsFrom(path.join(__dirname, 'commands'), 'dev')
})
client.login(globals.BOT_TOKEN)
