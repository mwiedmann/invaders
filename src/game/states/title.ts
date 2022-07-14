import { controls } from '../game-init'
import { constructState, gameState, state } from '.'
import { settingsHelpers } from '../consts'
import { createEnemy, Enemy } from '../game-objects/enemy'

let titleScreen: Phaser.GameObjects.Image
let enemy: Enemy

export const titleUpdate = (scene: Phaser.Scene, time: number, delta: number, init: boolean) => {
  if (init) {
    titleScreen = scene.add.image(settingsHelpers.fieldWidthMid, settingsHelpers.fieldHeightMid, 'title')

    // enemy = createEnemy(scene, 0, settingsHelpers.fieldWidthMid, settingsHelpers.fieldHeightMid, 5, 10, false)

    return
  }

  // enemy.update(time, delta, 2)

  // When spacebar pressed, close the title screen and create a player and ball for testing
  if (controls.p1Shoot.isDown) {
    titleScreen.destroy()

    // enemy.destroy()

    constructState(scene)

    gameState.phase = 'game'
  }
}
