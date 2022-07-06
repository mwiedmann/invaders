import { settingsHelpers } from '../consts'
import { state } from '../states'

export class ShowLevel {
  constructor(scene: Phaser.Scene) {
    this.text = scene.add.text(settingsHelpers.fieldWidthMid, settingsHelpers.fieldHeightMid, '', {
      fontSize: '80px',
      color: 'yellow',
      fontFamily: 'Verdana',
      boundsAlignH: 'center',
      boundsAlignV: 'middle',
      fontStyle: 'bold'
    } as any)

    this.text.setOrigin(0.5, 0.5)
    this.text.text = `LEVEL: ${state.level}`
  }

  text: Phaser.GameObjects.Text

  destroy() {
    this.text.destroy()
  }
}