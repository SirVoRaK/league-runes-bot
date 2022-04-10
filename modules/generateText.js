import * as canvas from 'canvas'

const { Canvas, Image } = canvas.default

export function generateText(text) {
    return new Promise(async (resolve, reject) => {
        try {
            const fontSize = 24
            const font = 'Arial'
            const fontColor = '#ffffff'
            const fontStyle = 'bold'
            const fontWeight = 'bold'
            const canvas = new Canvas(fontSize * text.length, 32)
            const ctx = canvas.getContext('2d')
            ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${font}`
            ctx.fillStyle = fontColor
            ctx.textAlign = 'left'
            ctx.fillText(text, 5, canvas.height * 0.8)
            const img = new Image()
            img.src = canvas.toDataURL()
            resolve({
                img: img.src,
                imgHeight: 32,
            })
        } catch (e) {
            console.error(e)
            reject(e)
        }
    })
}
