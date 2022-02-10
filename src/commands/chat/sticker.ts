import {SlashCommand} from 'slashasaurus'
import {auditLogReport, UserError} from '../../utils'
import {MessageEmbed} from 'discord.js'
import {RateLimiterMemory, RateLimiterRes} from 'rate-limiter-flexible'

const rateLimiter = new RateLimiterMemory({
    points: 4,
    duration: 60 * 5,
})

export default new SlashCommand(
    {
        name: 'sticker',
        description: 'Send a random yone sticker',
        options: [],
    },
    {
        async run(interaction, client) {
            const guild = await interaction.guild?.fetch()
            if (!guild) {
                throw new Error('missing guild')
            }
            const stickers = await guild.stickers.fetch()
            const randomSticker = stickers.at(Math.floor(Math.random() * stickers.size))
            if (!randomSticker) {
                throw new UserError('This server has no stickers')
            }
            const channel = await interaction.channel?.fetch()
            if (!channel) {
                throw new Error('missing channel')
            }

            try {
                await rateLimiter.consume(interaction.user.id)
            } catch (e) {
                const response: RateLimiterRes = e as any
                throw new UserError(
                    `Yo, slow down. You can send a sticker again in <t:${Math.floor(
                        (Date.now() + response.msBeforeNext) / 1000,
                    )}:R>`,
                )
            }

            const message = await channel.send({
                stickers: [randomSticker],
            })

            Promise.resolve().then(async () => {
                const member = await guild.members.fetch(interaction.user.id)
                await auditLogReport(
                    {
                        embeds: [
                            new MessageEmbed()
                                .setAuthor({
                                    name: member.displayName,
                                    iconURL: member.displayAvatarURL(),
                                })
                                .setDescription(`${member} sent ${randomSticker.name}`)
                                .setTitle(message.url),
                        ],
                    },
                    guild,
                )
            })

            return interaction.reply({
                ephemeral: true,
                content: `I sent ${randomSticker.name}`,
            })
        },
    },
)
