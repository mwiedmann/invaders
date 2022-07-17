import { gameSettings, settingsHelpers } from '../consts'
import { createEnemy, Enemy } from '../game-objects/enemy'
import { state } from '../states'
import { flipPath, makeLevel } from './levels'

export const createWaves = (scene: Phaser.Scene) => {
  const spacePerEnemy = 108
  const flyInSpacePerEnemy = 118
  const rowSpace = 88
  const level = makeLevel(state.level)
  let yPos = 96
  let lastBatchEnemies: Enemy[] = []

  state.diveMax = Math.min(Math.ceil(1 + state.level / 2), gameSettings.maxDivers)
  state.laserMax = Math.min(Math.ceil(1 + state.level / 2), gameSettings.maxLasers)

  console.log(`Level ${state.level}, diveMax: ${state.diveMax}, laserMax: ${state.laserMax}`)
  for (let w = 0; w < level.length; w++) {
    let group = level[w]

    const thisBatchEnemies: Enemy[] = []

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

        // shipUpgrades gives a ship upgrade at each level in this list. Count how many.
        const shipUpgrades = eConfig.shipUpgrades ? eConfig.shipUpgrades.filter((s) => state.level >= s).length : 0

        const enemy = createEnemy(
          scene,
          500,
          spacePerEnemy + spacePerEnemy * eConfig.x,
          yPos + rowSpace * eConfig.y,
          eConfig.x,
          eConfig.y,
          {
            health: eConfig.shieldLevel
              ? // If we've hit this enemies shield level, give them a shield (2 health) else just 1
                state.level >= eConfig.shieldLevel
                ? 2
                : 1
              : // If a UFO, it gets 10...all others default to 1
              eConfig.isUFO
              ? 10
              : 1,

            shipType: eConfig.isUFO ? 9 : 1 + shipUpgrades,
            terminate: group.terminate
          }
        )
        enemy.enemiesToWaitFor = lastBatchEnemies
        thisBatchEnemies.push(enemy)

        // Start enemy off screen
        // They will fly in like galaga
        // Boss enemies needs a little more room (shipType: 9)
        enemy.setPosition(eConfig.isUFO ? offscreenX * 2 : offscreenX, group.start.y)
        enemy.rotation = rotationToFirstPath
        offscreenX += offsceenXChange

        enemy.path = [startingVector, ...group.path]
      }
    }

    lastBatchEnemies = thisBatchEnemies
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
