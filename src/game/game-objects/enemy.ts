import * as Phaser from 'phaser'
import { CollisionCategory, EnemyCollisionMask } from '../collisions'
import { gameSettings, settingsHelpers } from '../consts'
import { state } from '../states'
import { createFloatingPoints } from './floatingPoints'
import { Hitable } from './hit'
import { createLaser } from './laser'

const turnAmount = Math.PI / 24

export const createEnemy = (
  scene: Phaser.Scene,
  delay: number,
  x: number,
  y: number,
  row: number,
  column: number,
  options: {
    health?: number
    shipType?: number
    terminate?: boolean
  } = {}
) => {
  const { health, shipType, terminate } = {
    ...{ health: 1, shipType: 1, terminate: false },
    ...options
  }
  // Check if any enemies already in this location
  ;(state.enemies.getChildren() as Enemy[]).forEach((e) => {
    if (e.startX === x && e.startY === y) {
      console.warn('Duplicate position', row, column)
    }
  })

  const enemy = new Enemy(
    scene.matter.world,
    x,
    y,
    `enemy${shipType}`,
    0,
    {
      mass: 6,
      circleRadius: shipType === 9 ? 80 : 40,
      collisionFilter: {
        mask: EnemyCollisionMask,
        category: CollisionCategory.Enemy
      },
      plugin: {
        wrap: {
          min: {
            x: 0,
            y: 0
          },
          max: {
            x: gameSettings.screenWidth,
            y: gameSettings.screenHeight
          }
        }
      }
    },
    delay,
    health,
    shipType,
    terminate
  )

  state.enemies.add(enemy, true)

  return enemy
}

let enemyNum = 1

export class Enemy extends Phaser.Physics.Matter.Sprite implements Hitable {
  constructor(
    world: Phaser.Physics.Matter.World,
    x: number,
    y: number,
    texture: string,
    frame: string | integer,
    options: Phaser.Types.Physics.Matter.MatterBodyConfig,
    public delay: number,
    public health: number,
    public shipType: number,
    public terminate: boolean
  ) {
    super(world, x, y, texture, frame, options)

    this.startX = x
    this.startY = y
    this.name = `Enemy-${enemyNum++}`
    this.startingHealth = health

    // Each type is a little faster when diving
    // highSpeed is the same for all so formations don't get messed up
    this.speed = 7 + this.shipType

    this.setOnCollide(() => {
      this.hit()
    })

    // Highlight the enemy in blue when they have more than 1 health
    // Their color will return to normal when hit
    if (shipType < 9 && health > 1) {
      const blue = 0x2222ff
      this.setTint(blue)
    }

    // The UFO rotates
    if (shipType === 9) {
      this.anims.play('enemy9')
    }
  }

  startX: number
  startY: number
  lastY = 0
  lastShot = 0
  startingHealth: number

  speed: number
  highSpeed = 14

  newPathMinTime = 2000
  newPathMaxTime = 8000
  timeNextPath = 0

  path: Phaser.Math.Vector2[] = []
  moveTo?: Phaser.Math.Vector2
  diveY = 0
  returning = false
  finishedFlyIn = false
  dead = false

  enemiesToWaitFor: Enemy[] = []

  newPathTime(time: number) {
    // Pick the next time this enemy can possibly dive
    this.timeNextPath = time + Phaser.Math.RND.between(this.newPathMinTime, this.newPathMaxTime)
  }

  update(time: number, delta: number, diveMax: number) {
    // Wait to begin until group before is done flying in
    const groupBeforeNotFinished = this.enemiesToWaitFor.findIndex((e) => !e.dead && !e.finishedFlyIn) > -1
    if (this.dead || groupBeforeNotFinished) {
      return
    }

    // Also, if hasn't done flyIn yet, and the player is currently dead...keep holding up
    if (state.player.dead && this.enemiesToWaitFor.length > 0) {
      return
    }

    // Release the list of enemies so they can be cleaned up
    this.enemiesToWaitFor = []

    // When an enemy activates, wait some time before flying in.
    // All enemies start off screen and wait for the group before them to finish.
    // Then, they will still wait a tad before starting their run.
    if (this.delay > 0) {
      this.delay -= delta
      return
    }

    // Check if wrapped through bottom of screen to top
    const wrappedY =
      (this.lastY < 0 && this.x > gameSettings.screenHeight) || (this.lastY > gameSettings.screenHeight && this.y < 0)
    this.lastY = this.y

    // If wrapped through the bottom, just return home
    if (wrappedY) {
      this.moveTo = undefined
      this.returning = true
    }

    // See if moving to a spot
    // The alternative is the enemy is just marching in formation at the top
    const pos = this.returning
      ? new Phaser.Math.Vector2(this.startX + state.marchPosition, this.startY)
      : this.path[0]
      ? this.path[0]
      : this.moveTo

    if (pos) {
      const distanceToPos = Phaser.Math.Distance.Between(this.x, this.y, pos.x, pos.y)
      // Calc the angle to the next path point and aim towards it
      const angleToPointer = Phaser.Math.Angle.Between(this.x, this.y, pos.x, pos.y)
      const angleDelta = Phaser.Math.Angle.Wrap(angleToPointer - this.rotation)
      const angleDeltaDirection = angleDelta > 0 ? 1 : -1

      // Once pointing close enough to the path point, just set the exact angle
      // This prevents shaking when pointing almost at the exact angle
      if (Phaser.Math.Within(angleDelta, 0, turnAmount * 2) || distanceToPos <= 96) {
        this.rotation = angleToPointer
      } else {
        this.rotation += angleDeltaDirection * turnAmount
      }

      // Calc the velocity vector for this angle and scale it for speed
      // Move a little faster for returning to the start pos and initial fly-in
      const moveSpeed = this.returning || !this.finishedFlyIn ? this.highSpeed : this.speed
      const vel = Phaser.Physics.Arcade.ArcadePhysics.prototype.velocityFromRotation(this.rotation, moveSpeed)
      this.setVelocity(vel.x, vel.y)

      // Once close enough to the path point, remove this path point and see if any more
      // We will never be able to hit the exact spot as the enemy is turning and moving.
      // Once they are close enough, point them at the next spot.
      // TODO: We still sometimes see an enemy tightly circling trying to get close to a spot
      // Maybe nothing to do here as the player can just shoot it and it doesn't happen often.
      if (distanceToPos <= 48) {
        this.moveTo = undefined

        // If following a path, look for the next point or starting returning home
        if (this.path[0]) {
          this.path.shift()
          if (!this.path[0]) {
            this.returning = true
          }
        } else if (this.returning) {
          // Done returning home
          this.returning = false
          this.finishedFlyIn = true
          this.newPathTime(time)
        } else if (this.y >= this.diveY) {
          // If diving and reached the end, starting returning home
          this.returning = true
        } else {
          // Last option is just pick a next path point, enemy is diving
          this.nextPathPoint()
        }
      }
    } else {
      // This enemy is just marching in formation at the top of the screen
      this.setVelocity(0, 0)
      this.setPosition(this.startX + state.marchPosition, this.startY)
      this.angle = 90

      // All enemies are not ready yet...get a new path time
      // TODO: This is wasteful. We should find a way to just do this once all enemies have finished their fly ins
      // but this works for now
      const idx = state.enemies.getChildren().findIndex((c: any) => !c.finishedFlyIn)
      if (idx > -1) {
        this.newPathTime(time)
      }

      // There is no current path, see if its time to create a new path
      if (time > this.timeNextPath) {
        // Only dive if there aren't too many divers already (diveMax)
        const enemiesMovingCount = (state.enemies.getChildren() as Enemy[]).filter(
          (e) => e.returning || e.moveTo
        ).length

        // also don't dive if player is dead
        if (!state.player.dead && enemiesMovingCount < diveMax) {
          // Dive to somewhere between 1/2 way down and off the bottom of screen (which wraps to the top)
          this.diveY = Phaser.Math.RND.between(
            settingsHelpers.fieldHeightMid,
            gameSettings.screenHeight + gameSettings.screenHeight / 4
          )
          this.nextPathPoint()
        } else {
          // Too many divers, get a new dive time
          this.newPathTime(time)
        }
      }
    }

    // Wrap from bottom of screen to top
    if (this.y > gameSettings.screenHeight + 32) {
      this.y = -32
    }

    // Terminate means to clear this enemy when it flies off the top of screen
    if (this.y < 0 && this.terminate) {
      state.enemies.remove(this)
      this.dead = true
      this.destroy()
    }
  }

  hit() {
    this.health--

    // We give points based on the ship type and more if diving or flying in
    if (this.health === 0) {
      // This ship is just sitting in marching order...lowest points
      let score = 25 * this.shipType + 50 * (this.startingHealth - 1)
      let showPoints = false
      if (this.moveTo) {
        // Medium score if diving
        score = 50 + 50 * this.shipType + 100 * (this.startingHealth - 1)
        showPoints = true
      } else if (this.path[0]) {
        // Biggest score if on flyIn path
        score = 100 + 100 * this.shipType + 200 * (this.startingHealth - 1)
        showPoints = true
      }

      if (showPoints) {
        createFloatingPoints(this.scene, score, this.x, this.y)
      }
      state.player.scorePoints(score)

      state.fireParticleManager.createEmitter({
        speed: 150,
        blendMode: 'ADD',
        lifespan: 700,
        maxParticles: 15,
        scale: 0.7,
        x: this.x,
        y: this.y
      })

      state.enemies.remove(this)
      this.dead = true
      this.destroy()
    } else {
      state.fireParticleManager.createEmitter({
        speed: 150,
        blendMode: 'ADD',
        lifespan: 500,
        maxParticles: 15,
        scale: 0.3,
        x: this.x,
        y: this.y
      })

      if (this.health === 1) {
        this.clearTint()
      }
    }
  }

  nextPathPoint() {
    const heightJump = 200
    const xMove = 300
    // This allows enemy to dip off screen a tad
    this.moveTo = new Phaser.Math.Vector2(
      Phaser.Math.RND.between(Math.max(-32, this.x - xMove), Math.min(gameSettings.screenWidth + 32, this.x + xMove)),
      this.y + heightJump
    )
  }

  canShoot(time: number, shotTimeWait: number) {
    // Can only shoot if
    // - not terminating after fly-in
    // - on screen
    // - not waiting for other enemies to finish their fly-in
    // - not marching
    // - haven't shot recently
    return (
      !this.terminate &&
      this.x >= gameSettings.playerEdge &&
      this.y <= gameSettings.screenWidth - gameSettings.playerEdge &&
      this.enemiesToWaitFor.length === 0 &&
      (this.path[0] || this.returning || this.moveTo) &&
      this.lastShot + shotTimeWait <= time
    )
  }

  shoot(time: number) {
    this.lastShot = time
    createLaser(this.scene, this.x, this.y, false)
  }
}
