import * as Phaser from 'phaser'
import { gameState, state } from '.'
import { gameSettings, settingsHelpers } from '../consts'
import { controls } from '../game-init'
import { cleanupHighScores, getHighScores, Scores, setHighScores, showHighScores } from '../highscores'

let textList: Phaser.GameObjects.Group
let madeScoreList = false
let done = false

export const scorelistUpdate = (scene: Phaser.Scene, time: number, delta: number, init: boolean) => {
  if (init) {
    madeScoreList = true

    const scores = getHighScores()
    const newEntry = { initials: '', score: state.score, updating: true }

    scores.push(newEntry)
    scores.sort((a, b) => b.score - a.score)

    // Did the player make the high score list?
    if (scores.indexOf(newEntry) > 4) {
      // Didn't make it, jump out
      madeScoreList = false
      return
    }

    // Trim off whoever got dropped
    scores.splice(5)
    showHighScores(scene, settingsHelpers.fieldHeightMid + 100, scores)

    const refreshHighScores = () => {
      cleanupHighScores(scene)
      showHighScores(scene, settingsHelpers.fieldHeightMid + 100, scores)
    }

    textList = new Phaser.GameObjects.Group(scene)

    textList.add(
      scene.add
        .text(settingsHelpers.fieldWidthMid, settingsHelpers.fieldHeightMid, 'CLICK TO ENTER YOUR INITIALS', {
          fontSize: `70px`,
          color: 'yellow',
          fontFamily: 'AstroSpace',
          boundsAlignH: 'center',
          boundsAlignV: 'middle'
        } as any)
        .setOrigin(0.5, 0.5)
    )

    const textSize = 150
    const startChar = 'A'.charCodeAt(0)
    const startX = textSize
    let x = startX
    let y = textSize
    const yChange = textSize
    const xChange = textSize

    for (let i = 0; i < 28; i++, x += xChange) {
      let scoreText: Phaser.GameObjects.Text
      if (i === 26) {
        scoreText = scene.add
          .text(x, y, 'DEL', {
            fontSize: `55px`,
            color: 'red',
            fontFamily: 'AstroSpace',
            boundsAlignH: 'center',
            boundsAlignV: 'middle'
          } as any)
          .setOrigin(0.5, 0.5)
          .setInteractive()

        scoreText.on('pointerdown', () => {
          newEntry.initials = newEntry.initials.slice(0, -1)
          refreshHighScores()
        })
      } else if (i === 27) {
        scoreText = scene.add
          .text(x, y, 'DONE', {
            fontSize: `55px`,
            color: 'green',
            fontFamily: 'AstroSpace',
            boundsAlignH: 'center',
            boundsAlignV: 'middle'
          } as any)
          .setOrigin(0.5, 0.5)
          .setInteractive()

        scoreText.on('pointerdown', () => {
          setHighScores(scores)
          done = true
        })
      } else {
        scoreText = scene.add
          .text(x, y, String.fromCharCode(startChar + i), {
            fontSize: `${textSize}px`,
            color: 'orange',
            fontFamily: 'AstroSpace',
            boundsAlignH: 'center',
            boundsAlignV: 'middle'
          } as any)
          .setOrigin(0.5, 0.5)
          .setInteractive()

        scoreText.on('pointerdown', () => {
          if (newEntry.initials.length === 3) {
            return
          }
          newEntry.initials += String.fromCharCode(startChar + i)
          refreshHighScores()
        })
      }

      textList.add(scoreText)

      if (x + xChange > gameSettings.screenWidth - xChange) {
        x = 0
        y += yChange
      }
    }

    return
  }

  // Didn't make the high score list...jump back to title screen
  // No cleanup needed
  if (!madeScoreList) {
    gameState.phase = 'title'
    return
  }

  // Done entering their score
  if (done) {
    cleanupHighScores(scene)
    textList.getChildren().forEach((c) => c.removeAllListeners())
    textList.destroy(true)
    gameState.phase = 'title'
  }
}
