import jsdom from 'jsdom'
import fetch from 'node-fetch'
import * as canvas from 'canvas'
import * as mergeImages from 'merge-images'

const { Canvas, Image } = canvas.default
const { default: mergeImgs } = mergeImages

const { JSDOM } = jsdom

export function getChampionCounters(champ, lane) {
    return new Promise(async (resolve, reject) => {
        console.log(`> Generating counters for ${champ} ${lane}`)
        try {
            const champAmount = 5
            const imgSize = 32
            const res = await fetch(
                `https://br.op.gg/champions/${champ}/${lane}/counters`
            )
            const data = await res.text()

            const dom = new JSDOM(data.replace(/<style>.+<\/style>/g, ''))

            if (dom.window.document.querySelector('.champion_img') === null)
                return resolve(null)

            const images = [
                ...dom.window.document
                    .querySelector('.side > div > ul')
                    .querySelectorAll('.champion i'),
            ]
            images.sort((imgA, imgB) => {
                const spanA =
                    imgA.parentElement.parentElement.querySelector('.win')
                const spanB =
                    imgB.parentElement.parentElement.querySelector('.win')
                const winRateA = +spanA.textContent?.trim().replace('%', '')
                const winRateB = +spanB.textContent?.trim().replace('%', '')
                return winRateB - winRateA
            })
            const gap = 0
            const imgOptStrong = images.slice(0, champAmount).map((img, i) => {
                const imgOnStyle = dom.window
                    .getComputedStyle(img)
                    .getPropertyValue('background-image')
                const url = imgOnStyle
                    .replace('url(', '')
                    .replace(')', '')
                    .replaceAll('"', '')
                    .replaceAll("'", '')
                return {
                    src: url
                        .replace('w_128', 'w_32')
                        .replace('w_64', 'w_32')
                        .replace('w_auto', 'w_32')
                        .replace('w_96', 'w_32')
                        .replace('w_168', 'w_32'),
                    x: imgSize * i + gap * i,
                    y: 0,
                }
            })
            const imgOptCounter = images
                .reverse()
                .slice(0, champAmount)
                .map((img, i) => {
                    const imgOnStyle = dom.window
                        .getComputedStyle(img)
                        .getPropertyValue('background-image')
                    const url = imgOnStyle
                        .replace('url(', '')
                        .replace(')', '')
                        .replaceAll('"', '')
                        .replaceAll("'", '')
                    return {
                        src: url
                            .replace('w_128', 'w_32')
                            .replace('w_64', 'w_32')
                            .replace('w_auto', 'w_32')
                            .replace('w_96', 'w_32')
                            .replace('w_168', 'w_32'),
                        x: imgSize * i + gap * i,
                        y: 0,
                    }
                })
            const b64Strong = await mergeImgs(imgOptStrong, {
                Canvas: Canvas,
                Image: Image,
                width: imgSize * champAmount + gap * 2,
                height: imgSize,
            })
            const bufferStrong = new Buffer.from(
                b64Strong.split(',')[1],
                'base64'
            )

            const b64Counter = await mergeImgs(imgOptCounter, {
                Canvas: Canvas,
                Image: Image,
                width: imgSize * champAmount + gap * 2,
                height: imgSize,
            })
            const bufferCounter = new Buffer.from(
                b64Counter.split(',')[1],
                'base64'
            )
            resolve({
                strongAgainst: bufferStrong,
                weakAgainst: bufferCounter,
                imgHeight: imgSize,
            })
        } catch (e) {
            reject(e)
        }
    })
}
