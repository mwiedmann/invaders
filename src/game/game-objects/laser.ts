import { CollisionCategory, EnemyLaserCollisionMask, GuyLaserCollisionMask } from '../collisions'
import { gameSettings, settingsHelpers } from '../consts'
import { state } from '../states'
import { Hitable } from './hit'

export const createLaser = (scene: Phaser.Scene, x: number, y: number, isPlayers: boolean) => {
  const laser = new Laser(
    scene.matter.world,
    x,
    y,
    isPlayers ? 'guy-laser' : 'enemy-laser',
    0,
    {
      collisionFilter: {
        mask: isPlayers ? GuyLaserCollisionMask : EnemyLaserCollisionMask,
        category: isPlayers ? CollisionCategory.GuyLaser : CollisionCategory.EnemyLaser
      },
      mass: 5,
      friction: 0,
      frictionAir: 0,
      frictionStatic: 0
    },
    isPlayers
  )

  if (isPlayers) {
    state.playerProjectiles.add(laser, true)
  } else {
    state.enemyProjectiles.add(laser, true)
  }

  const force = new Phaser.Math.Vector2(0, isPlayers ? gameSettings.playerLaserForce * -0.8 : 0.2)

  laser.applyForce(force)
  return laser
}

export class Laser extends Phaser.Physics.Matter.Sprite implements Hitable {
  constructor(
    world: Phaser.Physics.Matter.World,
    x: number,
    y: number,
    texture: string,
    frame: string | integer,
    options: Phaser.Types.Physics.Matter.MatterBodyConfig,
    public isPlayers: boolean
  ) {
    super(world, x, y, texture, frame, options)

    this.setOnCollide(() => {
      this.hit()
    })

    this.particleEmitter = state.laserParticleManager.createEmitter({
      speed: 30,
      frame: isPlayers ? 0 : 1,
      scale: { start: 0.75, end: 0 },
      blendMode: 'ADD',
      lifespan: 50
    })

    this.particleEmitter.startFollow(this)
  }

  particleEmitter: Phaser.GameObjects.Particles.ParticleEmitter

  removeProjectile() {
    if (this.isPlayers) {
      state.playerProjectiles.remove(this, true, true)
    } else {
      state.enemyProjectiles.remove(this, true, true)
    }
  }

  update(time: number, delta: number) {
    if (this.y < 10 || this.y > settingsHelpers.playerYPosition + 50) {
      this.hit()
    }
  }

  hit() {
    this.removeProjectile()
    this.destroy()
  }

  cleanup() {
    state.laserParticleManager.removeEmitter(this.particleEmitter)
  }

  destroy(fromScene?: boolean | undefined): void {
    this.cleanup()
    super.destroy(fromScene)
  }
}
