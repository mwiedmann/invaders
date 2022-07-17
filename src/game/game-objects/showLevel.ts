import * as Phaser from 'phaser'
import { settingsHelpers } from '../consts'
import { state } from '../states'

export class ShowLevel {
  constructor(scene: Phaser.Scene) {
    this.text = scene.add.text(settingsHelpers.fieldWidthMid, settingsHelpers.fieldHeightMid, '', {
      fontSize: '80px',
      color: 'yellow',
      fontFamily: 'AstroSpace',
      boundsAlignH: 'center',
      boundsAlignV: 'middle'
    } as any)

    this.text.setOrigin(0.5, 0.5)
    this.text.text = `LEVEL ${state.level}`

    const showMessage = state.level % 5 === 0
    const messageType = 'warning'
    const messageColor = messageType === 'warning' ? 'red' : 'green'
    const messageText = 'BEWARE THE UFO'

    this.message = scene.add.text(settingsHelpers.fieldWidthMid, settingsHelpers.fieldHeightMid + 100, '', {
      fontSize: '80px',
      color: messageColor,
      fontFamily: 'AstroSpace',
      boundsAlignH: 'center',
      boundsAlignV: 'middle'
    } as any)

    this.message.setOrigin(0.5, 0.5)
    this.message.text = messageText
    this.message.setVisible(showMessage)
  }

  text: Phaser.GameObjects.Text
  message: Phaser.GameObjects.Text

  destroy() {
    this.text.destroy()
    this.message.destroy()
  }
}
