import discordJs from 'discord.js'
import { getChampionRunes } from './modules/champRune.js'
import { getChampions } from './modules/champions.js'
import dotenv from 'dotenv'
dotenv.config()

const client = new discordJs.Client({
    intents: [discordJs.Intents.FLAGS.GUILDS, discordJs.Intents.FLAGS.GUILD_MESSAGES],
})

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
})

const prefix = '!'

const lanes = {
    jg: 'jungle',
    bot: 'adc',
    bottom: 'adc',
    sup: 'support',
    top: 'top',
    mid: 'mid',
    jungle: 'jungle',
    adc: 'adc',
    support: 'support',
}

function validateLane(lane) {
    return lanes[lane] ?? null
}

const cmd = {
    async runes(message, args) {
        const lane = validateLane(args[0])
        if (lane === null) {
            message.reply('Invalid lane!')
            return
        }
        const champ = (args[1] + (args[2] ?? '')).replace(/[\W\d]/g, '')
        const runes = await getChampionRunes(champ, lane)
        if (!runes) {
            message.reply('Invalid champion!\nUse `!champions` to get a list of champions.')
            return
        }
        message.channel.send(
            `Link: **<https://br.op.gg/champions/${champ}/${lane}/runes>**\nChampion: **${champ}**\nLane: **${lane}**\nPick rate: **${runes.pickRate}%**\nWin rate: **${runes.winRate}%**\n`
        )
        message.channel.send({
            files: [
                {
                    attachment: runes.img,
                    name: `${champ}-${lane}.png`,
                },
            ],
        })
    },
    t(message) {
        cmd.runes(message, ['jg', 'shaco'])
    },
    async champions(message) {
        const champions = await getChampions()
        message.channel.send(`**Champions:** \n${champions}`)
    },
}

client.on('messageCreate', async (message) => {
    if (!message.content.startsWith(prefix) || message.author.bot) return

    const args = message.content.slice(prefix.length).trim().split(' ')
    const command = args.shift().toLowerCase()
    const func = cmd[command]
    if (func) {
        func(message, args)
    }
})

client.login(process.env.TOKEN)
