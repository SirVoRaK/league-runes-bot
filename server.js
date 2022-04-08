import discordJs from 'discord.js'
import { getChampionRunes } from './modules/champRune.js'
import { getChampions } from './modules/champions.js'
import dotenv from 'dotenv'
import { getChampionItems } from './modules/champItems.js'
import { getChampionSkills } from './modules/champSkills.js'
dotenv.config()

const client = new discordJs.Client({
    intents: [
        discordJs.Intents.FLAGS.GUILDS,
        discordJs.Intents.FLAGS.GUILD_MESSAGES,
    ],
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
        const results = await Promise.all([
            getChampionRunes(champ, lane),
            getChampionItems(champ, lane),
            getChampionSkills(champ, lane),
        ])
        const runes = results[0]
        const items = results[1]
        const skills = results[2]
        if (!runes || !items || !skills) {
            message.reply(
                'Invalid champion!\nUse `!champions` to get a list of champions.'
            )
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
                {
                    attachment: items.img,
                    name: `${champ}-${lane}-items.png`,
                },
                {
                    attachment: skills.img,
                    name: `${champ}-${lane}-skills.png`,
                },
            ],
        })
        console.log('> Sent')
    },
    t(message) {
        cmd.runes(message, ['jg', 'shaco'])
    },
    async champions(message) {
        const champions = await getChampions()
        message.channel.send(`**Champions:** \n${champions}`)
    },
    r(...args) {
        cmd.runes(...args)
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
