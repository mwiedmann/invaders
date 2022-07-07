import { gameSettings, settingsHelpers } from '../consts'
import { createEnemy, Enemy } from '../game-objects/enemy'
import { state } from '../states'
import { flipPath, levels } from './levels'

export const createWaves = (scene: Phaser.Scene) => {
  const spacePerEnemy = 108
  const flyInSpacePerEnemy = 118
  const rowSpace = 88
  const level = state.level <= levels.length ? levels[state.level - 1] : levels[levels.length - 1] //  levels[(state.level - 1) % levels.length] // Wrap
  let yPos = 96
  let lastBatchEnemies: Enemy[] = []

  state.diveMax = 1 + state.level
  state.laserMax = 1 + state.level

  for (let w = 0; w < level.length; w++) {
    const wave = level[w]

    for (let g = 0; g < wave.length; g++) {
      const thisBatchEnemies: Enemy[] = []
      let group = wave[g]

      for (let f = 0; f < 2; f++) {
        // Check if we need to flip this group (makes a copy and flips)
        if (f === 1) {
          if (group.flip) {
            // Create a copy and flip
            group = JSON.parse(JSON.stringify(group))
            group.enemies.forEach((e) => {
              e.x = 9 - e.x
            })
            group.path = flipPath(group.path)
            group.start.side *= -1
          } else {
            // Not flipping, just quit
            break
          }
        }

        let offscreenX = group.start.side < 0 ? -50 : gameSettings.screenWidth + 50
        const offsceenXChange = group.start.side < 0 ? -flyInSpacePerEnemy : flyInSpacePerEnemy
        const rotationToFirstPath = group.start.side < 0 ? 0 : Math.PI
        const startingVector = new Phaser.Math.Vector2(offscreenX + (group.start.side < 0 ? 1 : -1), group.start.y)

        for (let e = 0; e < group.enemies.length; e++) {
          const eConfig = group.enemies[e]
          const enemy = createEnemy(
            scene,
            500,
            spacePerEnemy + spacePerEnemy * eConfig.x,
            yPos + rowSpace * eConfig.y,
            eConfig.level || 1,
            eConfig.health || 1,
            eConfig.type || 1
          )
          enemy.enemiesToWaitFor = lastBatchEnemies
          thisBatchEnemies.push(enemy)

          // Start enemy off screen
          // They will fly in like galaga
          enemy.setPosition(offscreenX, group.start.y)
          enemy.rotation = rotationToFirstPath
          offscreenX += offsceenXChange

          // enemy.returning = true
          console.log(startingVector)
          enemy.path = [startingVector, ...group.path]
        }
      }

      lastBatchEnemies = thisBatchEnemies
    }
  }

  // for (let r = 0; r < level.enemies.length; r++) {
  //   const enemiesThisRow = level.enemies[r].length
  //   const roomNeeded = enemiesThisRow * spacePerEnemy
  //   const startX = settingsHelpers.fieldWidthMid - roomNeeded / 2 + spacePerEnemy / 2
  //   let offscreenX = level.paths[r].start.side === 0 ? -50 : gameSettings.screenWidth + 50
  //   const offsceenXChange = level.paths[r].start.side === 0 ? -flyInSpacePerEnemy : flyInSpacePerEnemy
  //   const rotationToFirstPath = level.paths[r].start.side === 0 ? 0 : Math.PI
  //   let thisRowEnemies: Enemy[] = []
  //   const startingVector = new Phaser.Math.Vector2(offscreenX, level.paths[r].start.y)

  //   for (let i = 0; i < enemiesThisRow; i++) {
  //     const enemy = createEnemy(scene, 500, startX + spacePerEnemy * i, yPos)
  //     enemy.enemiesToWaitFor = lastRowEnemies
  //     thisRowEnemies.push(enemy)

  //     // Start enemy off screen
  //     // They will fly in like galaga
  //     enemy.setPosition(offscreenX, level.paths[r].start.y)
  //     enemy.rotation = rotationToFirstPath
  //     offscreenX += offsceenXChange

  //     // enemy.returning = true
  //     enemy.path = [startingVector, ...level.paths[r].path]
  //   }

  //   lastRowEnemies = thisRowEnemies

  //   yPos += rowSpace
  // }
}
