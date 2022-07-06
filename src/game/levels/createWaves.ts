import { gameSettings, settingsHelpers } from '../consts'
import { createEnemy, Enemy } from '../game-objects/enemy'
import { state } from '../states'
import { levels } from './levels'

export const createWaves = (scene: Phaser.Scene) => {
  const spacePerEnemy = 108
  const flyInSpacePerEnemy = 118
  const rowSpace = 88
  const level = levels[(state.level - 1) % levels.length]
  let yPos = 96
  let lastRowEnemies: Enemy[] = []

  state.diveMax = 1 + state.level
  state.laserMax = 1 + state.level

  for (let r = 0; r < level.enemies.length; r++) {
    const enemiesThisRow = level.enemies[r].length
    const roomNeeded = enemiesThisRow * spacePerEnemy
    const startX = settingsHelpers.fieldWidthMid - roomNeeded / 2 + spacePerEnemy / 2
    let offscreenX = level.paths[r].start.side === 0 ? -50 : gameSettings.screenWidth + 50
    const offsceenXChange = level.paths[r].start.side === 0 ? -flyInSpacePerEnemy : flyInSpacePerEnemy
    const rotationToFirstPath = level.paths[r].start.side === 0 ? 0 : Math.PI
    let thisRowEnemies: Enemy[] = []
    const startingVector = new Phaser.Math.Vector2(offscreenX, level.paths[r].start.y)

    for (let i = 0; i < enemiesThisRow; i++) {
      const enemy = createEnemy(scene, 500, startX + spacePerEnemy * i, yPos)
      enemy.enemiesToWaitFor = lastRowEnemies
      thisRowEnemies.push(enemy)

      // Start enemy off screen
      // They will fly in like galaga
      enemy.setPosition(offscreenX, level.paths[r].start.y)
      enemy.rotation = rotationToFirstPath
      offscreenX += offsceenXChange

      // enemy.returning = true
      enemy.path = [startingVector, ...level.paths[r].path]
    }

    lastRowEnemies = thisRowEnemies

    yPos += rowSpace
  }
}
