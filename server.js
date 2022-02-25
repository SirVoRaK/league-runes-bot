import discordJs from 'discord.js'
import { getChampionRunes } from './modules/champRune.js'
import dotenv from 'dotenv'
dotenv.config()

const client = new discordJs.Client({
    intents: [discordJs.Intents.FLAGS.GUILDS, discordJs.Intents.FLAGS.GUILD_MESSAGES],
})

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
})

const prefix = '!'

const lanes = ['top', 'jungle', 'mid', 'adc', 'support']

function validateLane(lane) {
    if (lane === 'jg') return 'jungle'
    if (lane === 'bot' || lane === 'bottom') return 'adc'
    if (lane === 'sup') return 'support'
    if (lanes.includes(lane)) return lane
    return null
}

client.on('messageCreate', async (message) => {
    if (!message.content.startsWith(prefix) || message.author.bot) return

    const args = message.content.slice(prefix.length).trim().split(' ')
    const command = args.shift().toLowerCase()
    if (command === 'runes') {
        const lane = validateLane(args[0])
        if (lane === null) {
            message.reply('Invalid lane!')
            return
        }
        const champ = args[1]
        const img = await getChampionRunes(champ, lane)
        if (!img) {
            message.reply('Invalid champion!')
            return
        }
        message.channel.send(
            `Link: **<https://br.op.gg/champions/${champ}/${lane}/runes>**\nChampion: **${champ}**\nLane: **${lane}**`
        )
        message.channel.send({
            files: [
                {
                    attachment: img,
                    name: `${champ}-${lane}.png`,
                },
            ],
        })
        /* message.channel.send(`Champion: **${champ}**\nLane: **${lane}**`)
        for (let i = 0; i < img.length; i++) {
            message.channel.send({
                files: [
                    {
                        attachment: img[i].src,
                        name: `${champ}-${lane}-${i}.png`,
                    },
                ],
            })
            await sleep(1000)
        } */
    } else if (command === 't') {
        const champ = 'shaco'
        const lane = 'jungle'
        const img = await getChampionRunes(champ, lane)
        if (!img) {
            message.reply('Invalid champion!')
            return
        }
        message.channel.send(
            `Link: **<https://br.op.gg/champions/${champ}/${lane}/runes>**\nChampion: **${champ}**\nLane: **${lane}**`
        )
        message.channel.send({
            files: [
                {
                    attachment: img,
                    name: `${champ}-${lane}.png`,
                },
            ],
        })
    }
})

function sleep(delay) {
    return new Promise((resolve) => setTimeout(resolve, delay))
}

client.login(process.env.TOKEN)
// getChampionRunes('jinx')
