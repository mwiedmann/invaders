import * as Phaser from 'phaser'

export const createFloatingPoints = (scene: Phaser.Scene, points: number, x: number, y: number) => {
  const scoreText = scene.add.text(x, y, '', {
    fontSize: '28px',
    color: 'yellow',
    fontFamily: 'AstroSpace',
    boundsAlignH: 'center',
    boundsAlignV: 'middle'
  } as any)

  scoreText.setOrigin(0.5, 0.5)
  scoreText.text = `${points}`

  setTimeout(() => {
    scoreText.destroy()
  }, 1000)
}
