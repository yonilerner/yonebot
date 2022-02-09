import {SlashCommand} from 'slashasaurus'
import {InteractionResponseTypes, InteractionTypes} from 'discord.js/typings/enums'

export default new SlashCommand({
    name: 'sticker',
    description: 'Send a random yone sticker',
    options: []
}, {
    async run(interaction, client) {
        const guild = await interaction.guild?.fetch()
        if (!guild) {
            return interaction.reply({content: 'Watcha doin', ephemeral: true})
        }
        const stickers = await guild.stickers.fetch()
        const randomSticker = stickers.at(Math.floor((Math.random() * stickers.size)))
        if (!randomSticker) {
            return interaction.reply({content: 'Aint no stickers', ephemeral: true})
        }
        const channel = await interaction.channel?.fetch()
        if (!channel) {
            return interaction.reply({content: 'WAT DOING', ephemeral: true})
        }

        await channel.send({
            stickers: [randomSticker]
        })

        return interaction.reply({
            ephemeral: true,
            content: `I sent ${randomSticker.name}`
        })
    }
})