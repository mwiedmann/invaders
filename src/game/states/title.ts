import { controls } from '../game-init'
import { constructState, gameState, state } from '.'
import { gameSettings, settingsHelpers } from '../consts'
import { createEnemy, Enemy } from '../game-objects/enemy'

let titleScreen: Phaser.GameObjects.Image
let nextShotTime = 0
let shotTimeWait = 3000

export const titleUpdate = (scene: Phaser.Scene, time: number, delta: number, init: boolean) => {
  if (init) {
    titleScreen = scene.add.image(settingsHelpers.fieldWidthMid, settingsHelpers.fieldHeightMid, 'title').setDepth(100)
    constructState(scene)

    // Don't show the number of lives on the title screen
    state.player.livesImages.visible = false

    // Contructing the state creates the player
    // Just move him off the screen...easiest for now
    state.player.x = -1000

    let spacePerEnemy = 108
    let xPos = settingsHelpers.fieldWidthMid - spacePerEnemy * 1.5
    let yPos = settingsHelpers.fieldHeightTopPath
    let rowTwo = 96

    createEnemy(scene, 0, xPos, yPos, 3, 8)
    createEnemy(scene, 0, xPos + spacePerEnemy, yPos, 4, 8, { shipType: 2, health: 2 })
    createEnemy(scene, 0, xPos + spacePerEnemy * 2, yPos, 5, 8, { shipType: 2, health: 2 })
    createEnemy(scene, 0, xPos + spacePerEnemy * 3, yPos, 6, 8)
    createEnemy(scene, 0, xPos, yPos + rowTwo, 3, 9)
    createEnemy(scene, 0, xPos + spacePerEnemy, yPos + rowTwo, 4, 9)
    createEnemy(scene, 0, xPos + spacePerEnemy * 2, yPos + rowTwo, 5, 9)
    createEnemy(scene, 0, xPos + spacePerEnemy * 3, yPos + rowTwo, 6, 9)
    ;(state.enemies.getChildren() as Enemy[]).forEach((e) => (e.finishedFlyIn = true))
    return
  }

  // Update the march position
  // This is so the enemies slide back-and-forth together
  state.marchPosition += state.marchDir * (gameSettings.marchSpeed * (delta / 1000))
  if (
    (state.marchDir === -1 && state.marchPosition < gameSettings.marchSize * -1) ||
    (state.marchDir === 1 && state.marchPosition > gameSettings.marchSize)
  ) {
    state.marchDir *= -1
  }

  state.enemyProjectiles.getChildren().forEach((c) => c.update(time, delta))
  ;(state.enemies.getChildren() as Enemy[]).forEach((e) => e.update(time, delta, 3))

  // Fire a laser if below the max for this level
  if (state.enemyProjectiles.countActive() < state.laserMax) {
    // Find enemies who can shoot
    const enemies = [...(state.enemies.getChildren() as Enemy[])].filter((c) => c.canShoot(time, shotTimeWait))
    if (enemies.length > 0) {
      const enemy = Phaser.Utils.Array.Shuffle([...enemies])[0] as Enemy
      enemy.shoot(time)
      nextShotTime = time + Phaser.Math.RND.between(125, 500)
    }
  }

  // When fire is pressed, close the title screen and create a player and ball for testing
  if (controls.p1Shoot.isDown) {
    titleScreen.destroy()
    constructState(scene)
    gameState.phase = 'game'
  }
}
