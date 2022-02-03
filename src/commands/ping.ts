import {UserCommand} from 'slashasaurus'

export default new UserCommand(
    {
        name: 'ping',
    },
    (interaction) => {
        interaction.reply('Pong')
    },
)
