import { CollisionCategory, EnemyCollisionMask } from '../collisions'
import { gameSettings, settingsHelpers } from '../consts'
import { state } from '../states'
import { Hitable } from './hit'
import { createLaser } from './laser'

const turnAmount = Math.PI / 24

export const createEnemy = (scene: Phaser.Scene, delay: number, x: number, y: number, level = 1, health = 1) => {
  const enemy = new Enemy(
    scene.matter.world,
    x,
    y,
    `enemy1`,
    0,
    {
      mass: 6,
      circleRadius: 40,
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
    level,
    health
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
    public level: number,
    public health: number
  ) {
    super(world, x, y, texture, frame, options)

    this.startX = x
    this.startY = y
    this.name = `Enemy-${enemyNum++}`

    this.setOnCollide(() => {
      this.hit()
    })

    this.angle = 90

    if (health > 1) {
      const blue = 0x2222ff
      this.setTint(blue)
    }
  }

  startX: number
  startY: number
  lastX = 0
  lastY = 0
  lastShot = 0

  speed = 8
  hiSpeed = 14

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

    if (this.delay > 0) {
      this.delay -= delta
      return
    }

    // Try to detect if wrapped from other side
    const wrappedX =
      (this.lastX < 0 && this.x > gameSettings.screenWidth) || (this.lastX > gameSettings.screenWidth && this.x < 0)
    const wrappedY =
      (this.lastY < 0 && this.x > gameSettings.screenHeight) || (this.lastY > gameSettings.screenHeight && this.y < 0)

    this.lastX = this.x
    this.lastY = this.y

    // If wrapped through the bottom, just return home
    if (wrappedY) {
      this.moveTo = undefined
      this.returning = true
    }

    // If moving to a spot and just wrapped left/right
    // adjust the x spot as it may be off screen
    if (this.moveTo) {
      if (wrappedX && this.moveTo.x < 0) {
        this.moveTo.x = gameSettings.screenWidth + this.moveTo.x
      } else if (wrappedX && this.moveTo?.x > gameSettings.screenWidth) {
        this.moveTo.x = this.moveTo.x - gameSettings.screenWidth
      }
    }

    // See if following a path
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
      if (Phaser.Math.Within(angleDelta, 0, turnAmount * 2)) {
        this.rotation = angleToPointer
      } else {
        this.rotation += angleDeltaDirection * turnAmount
      }

      // Calc the velocity vector for this angle and scale it for speed
      // Move a little faster for returning to the start pos and initial fly-in...this also affects the initial fly in
      const moveSpeed = this.returning || !this.finishedFlyIn ? this.hiSpeed : this.speed
      const vel = Phaser.Physics.Arcade.ArcadePhysics.prototype.velocityFromRotation(this.rotation, moveSpeed)

      // TODO: setVelocity doesn't seem to work if not already moving
      // Not sure if asleep or the physics engine doesn't like setting directly
      // Giving a nudge here fixes for now.
      // In theory we should be applying forces, not setting velocity directly
      // this.applyForce(vel.scale(0.01))
      this.setVelocity(vel.x, vel.y)

      // Once close enough to the path point, remove this path point and see if any more
      if (distanceToPos <= 32) {
        this.moveTo = undefined

        // If returning to home, set a new path time
        if (this.path[0]) {
          this.path.shift()
          if (!this.path[0]) {
            this.returning = true
          }
        } else if (this.returning) {
          this.returning = false
          this.finishedFlyIn = true
          this.newPathTime(time)
        } else if (this.y >= this.diveY) {
          this.returning = true
        } else {
          this.nextPathPoint()
        }
      }
    } else {
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
  }

  hit() {
    this.health--

    if (this.health === 0) {
      let score = 25
      // Biggest score if on flyIn path
      if (this.path[0]) {
        score = 200
      } else if (this.moveTo) {
        // Medium score if diving
        score = 100
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
    return (
      this.x >= gameSettings.playerEdge &&
      this.y <= gameSettings.screenWidth - gameSettings.playerEdge &&
      this.enemiesToWaitFor.length === 0 &&
      (this.path[0] || this.returning || this.moveTo) &&
      this.lastShot + shotTimeWait <= time
    )
  }

  shoot(time: number) {
    this.lastShot = time
    // createLaser(this.scene, this.x, this.y, false)
  }
}
