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
  }).setDepth(10)

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

    // Allows player to shoot
    controls.p1Shoot.on('down', () => {
      // Player can only have a certain number of lasers on the screen at once
      if (this.dead || state.playerProjectiles.countActive() >= this.projectileLimit) {
        return
      }
      createLaser(this.scene, this.x, this.y, true)
      this.scene.sound.play('guy-laser', { volume: 0.4 })
    })

    // This is just for a quick way to clear a level for testing
    controls.p1Special.on('down', () => {
      this.nuke()
    })

    controls.p1Suicide.on('down', () => {
      this.hit()
    })

    this.setOnCollide(() => {
      this.hit()
    })

    // Repeat the ship image to show the number of extra lives
    this.livesImages = this.scene.add.tileSprite(5, gameSettings.screenHeight - 80, 98, 75, 'guy')
    this.livesImages.setOrigin(0, 0)
    this.livesImages.scale = 0.5
  }

  livesImages: Phaser.GameObjects.TileSprite
  livesRemaining = gameSettings.startingExtraLives
  pointsToNextFreeGuy = 10000
  startX: number
  startY: number

  dead = false
  comeBackTime = 0

  projectileLimit = 2

  destroy() {
    controls.p1Shoot.removeAllListeners()
    controls.p1Special.removeAllListeners()
    controls.p1Suicide.removeAllListeners()
    this.livesImages.destroy()
    super.destroy()
  }

  update(time: number, delta: number) {
    this.livesImages.width = 98 * this.livesRemaining

    // If the guy is dead, see if it is time for him to come back to life
    if (this.dead) {
      if (this.livesRemaining >= 0 && time >= this.comeBackTime) {
        this.backToLife()
      }
      return
    }

    // Set the player's move direction (or 0 if not moving)
    let leftRight = 0
    if (controls.cursors.left?.isDown) {
      leftRight -= 1
    } else if (controls.cursors.right?.isDown) {
      leftRight += 1
    }

    // Move them according to the current framerate
    this.x += leftRight * delta * gameSettings.playerSpeed

    // Make sure not moving beyond limits
    if (this.x < settingsHelpers.playerMinX) {
      this.x = settingsHelpers.playerMinX
    } else if (this.x > settingsHelpers.playerMaxX) {
      this.x = settingsHelpers.playerMaxX
    }
  }

  hit() {
    // Fire particle when hit
    state.fireParticleManager.createEmitter({
      speed: 250,
      blendMode: 'ADD',
      lifespan: 700,
      maxParticles: 30,
      scale: 1,
      x: this.x,
      y: this.y
    })

    // The player will be invisible for a few seconds after death.
    // They will then come back or the game will end
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
    // Hit all enemies on screen (this is a test only thing)
    // Enemies that take 2 hits will need to be nuked again but this works.
    ;[...state.enemies.getChildren()].forEach((c: any) => c.hit())
  }

  scorePoints(points: number) {
    // Score points and see if player got a free guy yet
    this.pointsToNextFreeGuy -= points
    if (this.pointsToNextFreeGuy <= 0) {
      this.livesRemaining++
      this.pointsToNextFreeGuy = 10000 - this.pointsToNextFreeGuy
    }

    state.score += points
  }
}
