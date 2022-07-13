import { controls } from '../game-init'
import { constructState, gameState } from '.'
import { settingsHelpers } from '../consts'

let titleScreen: Phaser.GameObjects.Image

export const titleUpdate = (scene: Phaser.Scene, time: number, delta: number, init: boolean) => {
  if (init) {
    titleScreen = scene.add.image(settingsHelpers.fieldWidthMid, settingsHelpers.fieldHeightMid, 'title')
    return
  }

  // When spacebar pressed, close the title screen and create a player and ball for testing
  if (controls.p1Shoot.isDown) {
    titleScreen.destroy()

    constructState(scene)

    gameState.phase = 'game'
  }
}
