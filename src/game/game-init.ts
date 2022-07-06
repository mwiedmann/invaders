import * as Phaser from 'phaser'
import { settingsHelpers, gameSettings } from './consts'
import { gameState, IGamePhase } from './states'
import { gameUpdate } from './states/game'
import { titleUpdate } from './states/title'

export let controls: {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys
  p1Shoot: Phaser.Input.Keyboard.Key
  p1Special: Phaser.Input.Keyboard.Key
}

const updateFunctions = {
  title: titleUpdate,
  game: gameUpdate
}

let lastState: IGamePhase | undefined = undefined

export class GameScene extends Phaser.Scene {
  constructor() {
    super('game-scene')
  }

  /** Load all the images we need and assign them names */
  preload(this: Phaser.Scene) {
    // this.load.image('background', 'images/background.png')
    this.load.image('title', 'images/title.png')

    this.load.spritesheet('guy', 'images/guy.png', { frameWidth: 98, frameHeight: 75 })
    this.load.image('guy-laser', 'images/guy-laser.png')
    this.load.spritesheet('enemy1', 'images/enemy1.png', { frameWidth: 84, frameHeight: 104 })
    this.load.image('enemy-laser', 'images/enemy-laser.png')
    this.load.spritesheet('particle', 'images/particle.png', { frameWidth: 16 })
    this.load.image('fire1', 'images/fire1.png')

    // this.matter.enableWrapPlugin()
  }

  create(this: Phaser.Scene) {
    controls = {
      cursors: this.input.keyboard.createCursorKeys(),
      p1Shoot: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
      p1Special: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X)
    }

    // this.matter.world.setBounds(0, 0, settingsHelpers.worldBoundWidth, settingsHelpers.worldBoundHeight)
  }

  update(this: Phaser.Scene, time: number, delta: number) {
    let init = false
    if (lastState !== gameState.phase) {
      lastState = gameState.phase
      init = true
    }
    updateFunctions[gameState.phase](this, time, delta, init)
  }
}

export const startGame = () => {
  new Phaser.Game({
    type: Phaser.AUTO,
    width: gameSettings.screenWidth,
    height: gameSettings.screenHeight,
    scale: {
      mode: Phaser.Scale.ScaleModes.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
      default: 'matter',
      matter: {
        // debug: {
        //   showBody: true
        // },
        // enableSleeping: true,
        gravity: {
          y: 0,
          x: 0
        }
        // plugins: {
        //   wrap: true,
        // }
      } as any
    },
    scene: [GameScene],
    input: {
      gamepad: true
    },
    parent: 'root'
  })
}
