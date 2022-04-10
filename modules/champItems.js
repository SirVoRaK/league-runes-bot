import jsdom from 'jsdom'
import fetch from 'node-fetch'
import * as canvas from 'canvas'
import * as mergeImages from 'merge-images'

const { Canvas, Image } = canvas.default
const { default: mergeImgs } = mergeImages

const { JSDOM } = jsdom

export function getChampionItems(champ, lane) {
    return new Promise(async (resolve, reject) => {
        console.log(`> Generating items for ${champ} ${lane}`)
        try {
            const imgSize = 32
            const res = await fetch(
                `https://br.op.gg/champions/${champ}/${lane}/items`
            )
            const data = await res.text()

            const dom = new JSDOM(data.replace(/<style>.+<\/style>/g, ''))

            if (dom.window.document.querySelector('.champion_img') === null)
                return resolve(null)

            const images = [
                ...dom.window.document
                    .querySelectorAll('tr[type="coreBuild"]')[0]
                    .querySelectorAll('img'),
            ]
            const gap = 0
            const imgOpt = images.map((img, i) => {
                return {
                    src: img.src
                        .replace('w_128', 'w_32')
                        .replace('w_auto', 'w_32')
                        .replace('w_96', 'w_32')
                        .replace('w_168', 'w_32'),
                    x: imgSize * i + gap * i,
                    y: 0,
                }
            })
            const b64 = await mergeImgs(imgOpt, {
                Canvas: Canvas,
                Image: Image,
                width: imgSize * 3 + gap * 2,
                height: imgSize,
            })
            const buffer = new Buffer.from(b64.split(',')[1], 'base64')
            resolve({
                img: buffer,
                imgHeight: imgSize,
            })
        } catch (e) {
            reject(e)
        }
    })
}
