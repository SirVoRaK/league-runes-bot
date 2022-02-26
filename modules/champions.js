import jsdom from 'jsdom'
import fetch from 'node-fetch'
const { JSDOM } = jsdom

export function getChampions() {
    return new Promise(async (resolve, reject) => {
        console.log(`> Generating champions`)
        try {
            const res = await fetch(`https://br.op.gg/champions`)
            const data = await res.text()
            if (data.includes('<p>The page you have requested does not exist</p>')) {
                resolve(null)
                return
            }
            const dom = new JSDOM(data.replace(/<style>.+<\/style>/g, ''))
            const championsA = [
                ...dom.window.document.querySelectorAll('a[href*="/champions"].e1n0mtzi2'),
            ]
            const championsName = championsA.map((a) => {
                return a.href.split('/')[2]
            })
            resolve(championsName.join('\n'))
        } catch (e) {
            reject(e)
        }
    })
}
