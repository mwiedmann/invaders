import * as Phaser from 'phaser'
import { CollisionCategory, GuyCollisionMask } from '../collisions'
import { gameSettings, settingsHelpers } from '../consts'
import { controls } from '../game-init'
import { state } from '../states'
import { Hitable } from './hit'
import { createLaser } from './laser'

export const createGuy = (scene: Phaser.Scene) => {
  const guy = new Guy(scene.matter.world, settingsHelpers.fieldWidthMid, settingsHelpers.playerYPosition, `guy`, 0, {
    circleRadius: 40,
    collisionFilter: {
      mask: GuyCollisionMask,
      category: CollisionCategory.Guy
    }
  })

  scene.add.existing(guy)

  return guy
}

export class Guy extends Phaser.Physics.Matter.Sprite implements Hitable {
  constructor(
    world: Phaser.Physics.Matter.World,
    x: number,
    y: number,
    texture: string,
    frame: string | integer,
    options: Phaser.Types.Physics.Matter.MatterBodyConfig
  ) {
    super(world, x, y, texture, frame, options)

    this.startX = x
    this.startY = y

    controls.p1Shoot.on('down', () => {
      if (this.dead || state.playerProjectiles.countActive() >= this.projectileLimit) {
        return
      }
      createLaser(this.scene, this.x, this.y, true)
    })

    controls.p1Special.on('down', () => {
      this.nuke()
    })

    this.setOnCollide(() => {
      this.hit()
    })

    this.livesText = this.scene.add.text(20, gameSettings.screenHeight - 50, '', {
      fontSize: '32px',
      color: 'blue',
      fontFamily: 'Verdana',
      align: 'left',
      fontStyle: 'bold'
    })
  }

  livesText: Phaser.GameObjects.Text
  livesRemaining = 2
  pointsToNextFreeGuy = 10000
  startX: number
  startY: number

  dead = false
  comeBackTime = 0

  projectileLimit = 2

  destroy() {
    controls.p1Shoot.removeAllListeners()
    this.livesText.destroy()
    super.destroy()
  }

  update(time: number, delta: number) {
    this.livesText.text = this.livesRemaining >= 0 ? `Ships: ${this.livesRemaining}` : 'GAME OVER'

    // If the guy is dead, see if it is time for him to come back to life
    if (this.dead) {
      if (this.livesRemaining >= 0 && time >= this.comeBackTime) {
        this.backToLife()
      }
      return
    }

    let leftRight = 0
    if (controls.cursors.left?.isDown) {
      leftRight -= 1
    } else if (controls.cursors.right?.isDown) {
      leftRight += 1
    }

    this.x += leftRight * delta * gameSettings.playerSpeed

    if (this.x < settingsHelpers.playerMinX) {
      this.x = settingsHelpers.playerMinX
    } else if (this.x > settingsHelpers.playerMaxX) {
      this.x = settingsHelpers.playerMaxX
    }
  }

  hit() {
    state.fireParticleManager.createEmitter({
      speed: 250,
      blendMode: 'ADD',
      lifespan: 700,
      maxParticles: 30,
      scale: 1,
      x: this.x,
      y: this.y
    })

    this.livesRemaining--
    this.dead = true
    this.setVisible(false)
    this.setCollisionCategory(0)
    this.comeBackTime = this.scene.time.now + 3000
  }

  backToLife() {
    this.dead = false
    this.setPosition(this.startX, this.startY)

    // Make sure all the physics stuff is cleared
    // The collision will have pushed the Guy slightly
    // Is there a better way?
    this.setAngularVelocity(0)
    this.setAngle(0)
    this.setVelocityY(0)
    this.setY(this.startY)

    this.setVisible(true)
    this.setCollisionCategory(CollisionCategory.Guy)
  }

  nuke() {
    ;[...state.enemies.getChildren()].forEach((c: any) => c.hit())
  }

  scorePoints(points: number) {
    this.pointsToNextFreeGuy -= points
    if (this.pointsToNextFreeGuy <= 0) {
      this.livesRemaining++
      this.pointsToNextFreeGuy = 10000 - this.pointsToNextFreeGuy
    }

    state.score += points
  }
}
