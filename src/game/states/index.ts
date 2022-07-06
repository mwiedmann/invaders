import { Guy, createGuy } from '../game-objects/guy'

export interface IState {
  player: Guy
  enemies: Phaser.GameObjects.Group
  enemyProjectiles: Phaser.GameObjects.Group
  playerProjectiles: Phaser.GameObjects.Group
  marchPosition: number
  marchDir: number
  level: number
  diveMax: number
  laserMax: number
  score: number
}

export let state: IState

export type IGamePhase = 'title' | 'game'

interface IGameState {
  phase: IGamePhase
}

export const gameState: IGameState = {
  phase: 'title'
}

export const constructState = (scene: Phaser.Scene) => {
  state = {
    player: createGuy(scene),
    // runChildUpdate was not working. Maybe because we are using MatterSprite?
    // We can just call manually each loop...no big deal
    enemyProjectiles: new Phaser.GameObjects.Group(scene),
    playerProjectiles: new Phaser.GameObjects.Group(scene),
    enemies: new Phaser.GameObjects.Group(scene),
    marchPosition: 0,
    marchDir: 1,
    level: 1,
    diveMax: 0,
    laserMax: 0,
    score: 0
  }

  scene.add.group(state.enemyProjectiles)
  scene.add.group(state.playerProjectiles)
  scene.add.group(state.enemies)
}
