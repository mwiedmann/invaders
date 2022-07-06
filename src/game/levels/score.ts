import * as Phaser from 'phaser'
import { gameSettings } from '../consts'

let scoreText: Phaser.GameObjects.Text

export const createScoreText = (scene: Phaser.Scene) => {
  scoreText = scene.add.text(gameSettings.screenWidth - 280, 5, '', {
    fontSize: '60px',
    color: 'blue',
    fontFamily: 'Verdana',
    align: 'left',
    fontStyle: 'bold'
  })
}

export const updateScoreText = (score: number) => {
  const s = score.toString()
  scoreText.text = '0'.repeat(6 - s.length) + score.toString()
}

export const cleanupScoreText = (frameRateText: Phaser.GameObjects.Text) => {
  scoreText.destroy()
}
