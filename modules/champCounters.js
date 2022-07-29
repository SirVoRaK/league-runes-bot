import jsdom from "jsdom"
import fetch from "node-fetch"
import * as canvas from "canvas"
import * as mergeImages from "merge-images"

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
                `https://br.op.gg/champions/${champ}/${lane}/build`
            )
            const data = await res.text()

            const dom = new JSDOM(data.replace(/<style>.+<\/style>/g, ""))

            if (dom.window.document.querySelector(".champion-img") === null)
                return resolve(null)

            const weakImages = [
                ...dom.window.document.querySelectorAll(
                    "ul.css-sw0n2m:nth-child(4) > li"
                ),
            ]
            /*
            weakImages.sort((imgA, imgB) => {
                const winRateA = +imgA
                    .querySelector(".win-rate")
                    .textContent.trim()
                    .replace("%", "")
                const winRateB = +imgB
                    .querySelector(".win-rate")
                    .textContent.trim()
                    .replace("%", "")
                return winRateB - winRateA
            })
            */

            const gap = 0
            const weakOpt = weakImages.map((img, i) => {
                return {
                    src: img
                        .querySelector("img")
                        .src.replace(/w_[^,]+&v/, "w_32&v"),
                    x: imgSize * i + gap * i,
                    y: 0,
                }
            })

            const b64Weak = await mergeImgs(weakOpt, {
                Canvas: Canvas,
                Image: Image,
                width: imgSize * champAmount + gap * 2,
                height: imgSize,
            })
            const bufferWeak = new Buffer.from(b64Weak.split(",")[1], "base64")

            const strongImages = [
                ...dom.window.document.querySelectorAll(
                    "ul.css-sw0n2m:nth-child(6) > li"
                ),
            ]
            /*
            strongImages.sort((imgA, imgB) => {
                const winRateA = +imgA
                    .querySelector(".win-rate")
                    .textContent.trim()
                    .replace("%", "")
                const winRateB = +imgB
                    .querySelector(".win-rate")
                    .textContent.trim()
                    .replace("%", "")
                return winRateA - winRateB
            })
            */

            const strongOpt = strongImages.map((img, i) => {
                return {
                    src: img
                        .querySelector("img")
                        .src.replace(/w_[^,]+&v/, "w_32&v"),
                    x: imgSize * i + gap * i,
                    y: 0,
                }
            })

            const b64Strong = await mergeImgs(strongOpt, {
                Canvas: Canvas,
                Image: Image,
                width: imgSize * champAmount + gap * 2,
                height: imgSize,
            })
            const bufferStrong = new Buffer.from(
                b64Strong.split(",")[1],
                "base64"
            )

            resolve({
                strongAgainst: bufferStrong,
                weakAgainst: bufferWeak,
                imgHeight: imgSize,
            })
        } catch (e) {
            reject(e)
        }
    })
}
