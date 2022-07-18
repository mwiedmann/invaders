import * as Phaser from 'phaser'
import { settingsHelpers } from './consts'

const scoreKey = 'scores'
let textList: Phaser.GameObjects.Group

export type Scores = { initials: string; score: number; updating?: boolean }[]

const emptyHighScoreList = [
  { initials: 'MRW', score: 10000 },
  { initials: 'TMW', score: 8000 },
  { initials: 'JAV', score: 6000 },
  { initials: 'NAM', score: 4000 },
  { initials: 'MID', score: 2000 }
]
export const showHighScores = (scene: Phaser.Scene, startY: number, scores?: Scores) => {
  let y = startY
  textList = new Phaser.GameObjects.Group(scene)

  scores = scores || getHighScores()

  textList.add(
    scene.add
      .text(settingsHelpers.fieldWidthMid, y, 'HIGH SCORES', {
        fontSize: `100px`,
        color: 'yellow',
        fontFamily: 'AstroSpace',
        align: 'center'
      } as any)
      .setOrigin(0.5, 0.5)
  )

  y += 100

  const scoreColor = '#5577FF'
  for (let i = 0; i < scores.length; i++, y += 80) {
    // Highlight the row if the player is entering their name
    const entryColor = scores[i].updating ? '#77ff55' : scoreColor
    textList.add(
      scene.add
        .text(settingsHelpers.fieldWidthMid - 50, y, scores[i].initials, {
          fontSize: `80px`,
          color: entryColor,
          fontFamily: 'AstroSpace',
          align: 'right'
        } as any)
        .setOrigin(1, 0.5)
    )

    textList.add(
      scene.add
        .text(settingsHelpers.fieldWidthMid + 20, y, scores[i].score.toString(), {
          fontSize: `80px`,
          color: entryColor,
          fontFamily: 'AstroSpace',
          align: 'left'
        } as any)
        .setOrigin(0, 0.5)
    )
  }
}

export const cleanupHighScores = (scene: Phaser.Scene) => {
  textList.destroy(true)
}

export const getHighScores = (): Scores => {
  if (!localStorage.getItem(scoreKey)) {
    setHighScores(emptyHighScoreList)
  }

  const scoresData = localStorage.getItem(scoreKey) || '[]'
  const scores = JSON.parse(scoresData) as Scores
  return scores
}

export const setHighScores = (scores: Scores) => {
  // Only used for bookeeping...remove it before save
  scores.forEach((s) => delete s.updating)
  localStorage.setItem(scoreKey, JSON.stringify(scores))
}
