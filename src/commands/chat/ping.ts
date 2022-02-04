import {SlashCommand} from 'slashasaurus'

export default new SlashCommand(
    {
        name: 'ping',
        description: 'Ping',
        options: [],
    },
    {
        run: (interaction) => {
            interaction.reply({content: 'Pong', ephemeral: true})
        },
    },
)
