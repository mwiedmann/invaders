import { CollisionCategory, EnemyLaserCollisionMask, GuyLaserCollisionMask } from '../collisions'
import { gameSettings, settingsHelpers } from '../consts'
import { GameScene } from '../game-init'
import { state } from '../states'
import { CollisionHitable, Hitable } from './hit'

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
    this.particleManager = this.scene.add.particles('particle').setDepth(998)

    const emitter = this.particleManager.createEmitter({
      speed: 30,
      frame: isPlayers ? 0 : 1,
      scale: { start: 0.75, end: 0 },
      blendMode: 'ADD',
      lifespan: 50
    })

    emitter.startFollow(this)
    emitter.startFollow(this)
  }

  particleManager: Phaser.GameObjects.Particles.ParticleEmitterManager

  removeProjectile() {
    if (this.isPlayers) {
      state.playerProjectiles.remove(this)
    } else {
      state.enemyProjectiles.remove(this)
    }
  }

  update(time: number, delta: number) {
    if (this.y < 10 || this.y > settingsHelpers.playerYPosition) {
      this.hit()
    }
  }

  hit() {
    this.particleManager.destroy()
    this.removeProjectile()
    this.destroy()
  }
}
