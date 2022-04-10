import discordJs from 'discord.js'
import { getChampionRunes } from './modules/champRune.js'
import { getChampions } from './modules/champions.js'
import dotenv from 'dotenv'
import { getChampionItems } from './modules/champItems.js'
import { getChampionSkills } from './modules/champSkills.js'
import { getChampionCounters } from './modules/champCounters.js'
import * as canvas from 'canvas'
import * as mergeImages from 'merge-images'
import { generateText } from './modules/generateText.js'

const { Canvas, Image } = canvas.default
const { default: mergeImgs } = mergeImages

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
            generateText('Runes'),
            getChampionRunes(champ, lane),
            generateText('Items'),
            getChampionItems(champ, lane),
            generateText('Skills'),
            getChampionSkills(champ, lane),
            generateText('Counters'),
            getChampionCounters(champ, lane),
        ])
        const runes = results[1]
        const items = results[3]
        const skills = results[5]
        const counters = results[7]
        if (!runes || !items || !skills || !counters) {
            message.reply(
                'Invalid champion!\nUse `!champions` to get a list of champions.'
            )
            return
        }
        let nextX = 0
        let nextY = 0
        const columnGap = 10
        const allImgsOpt = results.map((r, i) => {
            const obj = {
                src: r.img ?? r.weakAgainst,
                x: nextX,
                y: nextY,
            }
            nextY += r.imgHeight

            if (i > 0) nextX = runes.imgWidth + columnGap

            if (i === 1) nextY = 0

            return obj
        })
        const strongText = await generateText(`Strong vs`)
        allImgsOpt.push({
            src: strongText.img,
            x: nextX,
            y: nextY,
        })
        nextY += strongText.imgHeight
        allImgsOpt.push({
            src: counters.strongAgainst,
            x: nextX,
            y: nextY,
        })
        const b64All = await mergeImgs(allImgsOpt, {
            Canvas: Canvas,
            Image: Image,
            width: 32 * 5 + columnGap + 32 * 4,
            height: runes.imgHeight + results[0].imgHeight,
        })
        const bufferAll = new Buffer.from(b64All.split(',')[1], 'base64')

        message.channel.send(
            `Link: **<https://br.op.gg/champions/${champ}/${lane}/runes>**\nChampion: **${champ}**\nLane: **${lane}**\n`
        )
        await message.channel.send({
            files: [
                {
                    attachment: bufferAll,
                    name: `${champ}_${lane}.png`,
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
