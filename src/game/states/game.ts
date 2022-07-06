import * as Phaser from 'phaser'

import { gameState, state } from '.'
import { gameSettings } from '../consts'
import { Enemy } from '../game-objects/enemy'
import { createWaves } from '../levels/createWaves'
import { cleanupFrameRateText, createFrameRateText, updateFrameRateText } from '../levels/frameRate'
import { createScoreText, updateScoreText } from '../levels/score'

let shotTimeWait = 3000

let frameRateText: Phaser.GameObjects.Text

export const gameUpdate = (scene: Phaser.Scene, time: number, delta: number, init: boolean) => {
  if (init) {
    createWaves(scene)
    createScoreText(scene)
    if (gameSettings.showFrameRate) {
      frameRateText = createFrameRateText(scene)
    }

    return
  }

  if (frameRateText) {
    updateFrameRateText(frameRateText, delta)
  }

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

  state.player.update(time, delta)
  state.playerProjectiles.getChildren().forEach((c) => c.update(time, delta))
  state.enemyProjectiles.getChildren().forEach((c) => c.update(time, delta))
  state.enemies.getChildren().forEach((c) => c.update(time, delta, state.diveMax))

  // Fire a laser if below the max for this level
  if (state.enemyProjectiles.countActive() < state.laserMax) {
    // Find enemies who can shoot
    const enemies = [...(state.enemies.getChildren() as Enemy[])].filter((c) => c.canShoot(time, shotTimeWait))
    if (enemies.length > 0) {
      const enemy = Phaser.Utils.Array.Shuffle([...enemies])[0] as Enemy
      enemy.shoot(time)
    }
  }

  // If the wave is clear, make more enemies
  if (state.enemies.countActive() === 0) {
    state.level++
    state.marchPosition = 0
    createWaves(scene)
  }

  // If the game is over for the player, reset everything after a delay
  if (state.player.dead && state.player.livesRemaining < 0 && time >= state.player.comeBackTime) {
    if (frameRateText) {
      cleanupFrameRateText(frameRateText)
    }
    state.playerProjectiles.destroy(true)
    state.enemyProjectiles.destroy(true)
    state.enemies.destroy(true)
    state.player.destroy()
    state.level = 1

    gameState.phase = 'title'
  }
}
