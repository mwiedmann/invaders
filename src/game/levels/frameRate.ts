import * as Phaser from 'phaser'

let framerates: number[] = []

export const createFrameRateText = (scene: Phaser.Scene) => {
  framerates = []
  return scene.add.text(50, 50, '', {
    fontSize: '60px',
    color: 'green',
    fontFamily: 'Verdana',
    align: 'center',
    fontStyle: 'bold'
  })
}

export const updateFrameRateText = (frameRateText: Phaser.GameObjects.Text, delta: number) => {
  if (framerates.length > 10) {
    framerates.shift()
  }
  framerates.push(delta)
  const rate = framerates.reduce((p, c) => p + c, 0) / framerates.length
  frameRateText.text = (1000 / rate).toFixed(0).toString()
}

export const cleanupFrameRateText = (frameRateText: Phaser.GameObjects.Text) => {
  frameRateText.destroy()
  framerates = []
}
