import * as Phaser from 'phaser'
import { gameSettings, settingsHelpers } from '../consts'

let backgrounds: { dir: number; cycleRate: number; moveRate: number; bg: Phaser.GameObjects.TileSprite }[]

export const createStarField = (scene: Phaser.Scene) => {
  // Create some different colored tilesprites for the scrolling background
  // We fade them in/out
  const whiteBg = scene.add
    .tileSprite(
      settingsHelpers.fieldWidthMid,
      settingsHelpers.fieldHeightMid,
      gameSettings.screenWidth,
      gameSettings.screenHeight,
      'background'
    )
    .setAlpha(0.1)

  const redBg = scene.add
    .tileSprite(
      settingsHelpers.fieldWidthMid + 64,
      settingsHelpers.fieldHeightMid + 96,
      gameSettings.screenWidth,
      gameSettings.screenHeight,
      'background'
    )
    .setTint(0xff4444)
    .setAlpha(0.5)

  const greenBg = scene.add
    .tileSprite(
      settingsHelpers.fieldWidthMid + 128,
      settingsHelpers.fieldHeightMid - 96,
      gameSettings.screenWidth,
      gameSettings.screenHeight,
      'background'
    )
    .setTint(0x44ff44)
    .setAlpha(0.9)

  // Create the background tiles
  backgrounds = [
    {
      dir: 1,
      cycleRate: 0.01,
      moveRate: 4,
      bg: whiteBg
    },
    { dir: 1, cycleRate: 0.013, moveRate: 4.5, bg: redBg },
    { dir: -1, cycleRate: 0.008, moveRate: 3.5, bg: greenBg }
  ]
}

export const updateStarField = (scene: Phaser.Scene, time: number, delta: number) => {
  backgrounds.forEach((b) => {
    b.bg.tilePositionY -= delta / b.moveRate
    b.bg.alpha += b.cycleRate * b.dir
    if (b.bg.alpha >= 0.9) {
      b.bg.alpha = 0.9
      b.dir *= -1
    } else if (b.bg.alpha <= 0.1) {
      b.bg.alpha = 0.1
      b.dir *= -1
    }
  })
}

export const cleanupStarField = () => {
  backgrounds.forEach((b) => {
    b.bg.destroy()
  })
  backgrounds = []
}
