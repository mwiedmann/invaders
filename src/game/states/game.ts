import * as Phaser from 'phaser'

import { gameState, state } from '.'
import { gameSettings, settingsHelpers } from '../consts'
import { controls } from '../game-init'
import { Enemy } from '../game-objects/enemy'
import { ShowLevel } from '../game-objects/showLevel'
import { createWaves } from '../levels/createWaves'
import { cleanupFrameRateText, createFrameRateText, updateFrameRateText } from '../levels/frameRate'
import { cleanupScoreText, createScoreText, updateScoreText } from '../levels/score'

let shotTimeWait = 3000

let frameRateText: Phaser.GameObjects.Text
let subState: 'game' | 'showLevel' = 'showLevel'
let subStateTime = 3000
let showLevel: ShowLevel | undefined
let backgrounds: { dir: number; cycleRate: number; moveRate: number; bg: Phaser.GameObjects.TileSprite }[]
let nextShotTime = 0

// This runs once when transitioning to this game state
const gameInit = (scene: Phaser.Scene) => {
  // Switch tot he showLevel sub-state for 3 secs to show the level
  subState = 'showLevel'
  subStateTime = 3000
  createScoreText(scene)

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

  // We can show an optional framerate
  if (gameSettings.showFrameRate) {
    frameRateText = createFrameRateText(scene)
  }

  // Setup the pause button
  controls.pause.on('down', () => {
    state.paused = !state.paused
    if (state.paused) {
      scene.matter.world.pause()
    } else {
      scene.matter.world.resume()
    }
  })
}

// This runs once per game loop (hopefully 60 times a sec)
export const gameUpdate = (scene: Phaser.Scene, time: number, delta: number, init: boolean) => {
  // Run gameInit once
  if (init) {
    gameInit(scene)
    return
  }

  // If we are paused, exit early
  if (state.paused) {
    return
  }

  // Optional framerate text on screen
  if (frameRateText) {
    updateFrameRateText(frameRateText, delta)
  }

  // Some housekeeping each loop
  // Update the score and scroll the background
  updateScoreText(state.score)

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

  // Update the march position
  // This is so the enemies slide back-and-forth together
  state.marchPosition += state.marchDir * (gameSettings.marchSpeed * (delta / 1000))
  if (
    (state.marchDir === -1 && state.marchPosition < gameSettings.marchSize * -1) ||
    (state.marchDir === 1 && state.marchPosition > gameSettings.marchSize)
  ) {
    state.marchDir *= -1
  }

  // Update the player and any of their projectiles
  state.player.update(time, delta)
  state.playerProjectiles.getChildren().forEach((c) => c.update(time, delta))

  // If we are in the game sub-state, update the enemies
  if (subState === 'game') {
    state.enemyProjectiles.getChildren().forEach((c) => c.update(time, delta))
    state.enemies.getChildren().forEach((c) => c.update(time, delta, state.diveMax))

    // Fire a laser if below the max for this level
    if (!state.player.dead && time > nextShotTime && state.enemyProjectiles.countActive() < state.laserMax) {
      // Find enemies who can shoot
      const enemies = [...(state.enemies.getChildren() as Enemy[])].filter((c) => c.canShoot(time, shotTimeWait))
      if (enemies.length > 0) {
        const enemy = Phaser.Utils.Array.Shuffle([...enemies])[0] as Enemy
        enemy.shoot(time)
        nextShotTime = time + Phaser.Math.RND.between(125, 500)
      }
    }
  }

  // If the wave is clear, make more enemies
  if (subState === 'showLevel' || state.enemies.countActive() === 0) {
    if (subState === 'game') {
      subState = 'showLevel'
      subStateTime = 3000
      state.level++
    } else if (subState === 'showLevel') {
      if (!showLevel) {
        showLevel = new ShowLevel(scene)
      }
      subStateTime -= delta
      if (subStateTime <= 0) {
        subState = 'game'
        state.marchPosition = 0
        showLevel.destroy()
        showLevel = undefined
        createWaves(scene)
      }
    }
  }

  // If the game is over for the player, reset everything after a delay
  if (state.player.dead && state.player.livesRemaining < 0 && time >= state.player.comeBackTime) {
    if (frameRateText) {
      cleanupFrameRateText(frameRateText)
    }

    cleanupScoreText()
    if (showLevel) {
      showLevel.destroy()
      showLevel = undefined
    }

    backgrounds.forEach((b) => {
      b.bg.destroy()
    })
    backgrounds = []
    state.playerProjectiles.destroy(true)
    state.enemyProjectiles.destroy(true)
    state.enemies.destroy(true)
    state.player.destroy()
    state.level = 1

    gameState.phase = 'scorelist'
  }
}
