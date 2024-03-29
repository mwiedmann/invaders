import * as Phaser from 'phaser'

import { gameState, state } from '.'
import { gameSettings, settingsHelpers } from '../consts'
import { controls } from '../game-init'
import { Enemy } from '../game-objects/enemy'
import { ShowLevel } from '../game-objects/showLevel'
import { createWaves } from '../levels/createWaves'
import { cleanupFrameRateText, createFrameRateText, updateFrameRateText } from '../levels/frameRate'
import { cleanupScoreText, createScoreText, updateScoreText } from '../levels/score'
import { cleanupStarField, createStarField, updateStarField } from './starfield'

let shotTimeWait = 3000

let frameRateText: Phaser.GameObjects.Text
let subState: 'game' | 'showLevel' = 'showLevel'
let subStateTime = 3000
let showLevel: ShowLevel | undefined

let nextShotTime = 0

// This runs once when transitioning to this game state
const gameInit = (scene: Phaser.Scene) => {
  // Switch tot he showLevel sub-state for 3 secs to show the level
  subState = 'showLevel'
  subStateTime = 3000
  createScoreText(scene)

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

  controls.mute.on('down', () => {
    scene.sound.volume = scene.sound.volume === 0 ? 1 : 0
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

    state.playerProjectiles.destroy(true)
    state.enemyProjectiles.destroy(true)
    state.enemies.destroy(true)
    state.player.destroy()
    state.level = 1

    controls.pause.removeAllListeners()
    controls.mute.removeAllListeners()

    gameState.phase = 'scorelist'
  }
}
