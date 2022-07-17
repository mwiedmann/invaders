import * as Phaser from 'phaser'
import { settingsHelpers } from '../consts'
import { state } from '../states'

const messages: Record<0 | 3, { type: string; msg: string }> = {
  0: {
    type: 'warning',
    msg: 'BEWARE THE UFO'
  },
  3: {
    type: 'bonus',
    msg: 'BONUS STAGE'
  }
}

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

    const mod = state.level % 5

    if (mod === 0 || mod === 3) {
      const messageData = messages[mod]

      const messageColor = messageData.type === 'warning' ? 'red' : 'green'

      this.message = scene.add.text(settingsHelpers.fieldWidthMid, settingsHelpers.fieldHeightMid + 100, '', {
        fontSize: '80px',
        color: messageColor,
        fontFamily: 'AstroSpace',
        boundsAlignH: 'center',
        boundsAlignV: 'middle'
      } as any)

      this.message.setOrigin(0.5, 0.5)
      this.message.text = messageData.msg
    }
  }

  text: Phaser.GameObjects.Text
  message?: Phaser.GameObjects.Text

  destroy() {
    this.text.destroy()
    this.message?.destroy()
  }
}
