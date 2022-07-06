import { gameSettings, settingsHelpers } from '../consts'

const createLoop = (startBottom: Phaser.Math.Vector2, radius: number, direction: number, count: number) => {
  const inc = (Math.PI * 2) / count
  const centerY = startBottom.y - radius
  const centerX = startBottom.x
  const path: Phaser.Math.Vector2[] = []
  let angle = Math.PI + Math.PI / 2

  for (let i = 0; i < count; i++) {
    path.push(new Phaser.Math.Vector2(centerX + Math.cos(angle) * radius, centerY - Math.sin(angle) * radius))
    angle += inc * direction
  }

  path.push(startBottom)
  return path
}

const flipPath = (paths: Phaser.Math.Vector2[]) =>
  paths.map((p) => new Phaser.Math.Vector2(gameSettings.screenWidth - p.x, p.y))

const pathTypes = {
  quarterZigZag: [
    new Phaser.Math.Vector2(settingsHelpers.fieldWidth1Quarter, settingsHelpers.fieldHeight3Quarters),
    new Phaser.Math.Vector2(settingsHelpers.fieldWidth3Quarters, settingsHelpers.fieldHeightMid),
    new Phaser.Math.Vector2(settingsHelpers.fieldWidth1Quarter, settingsHelpers.fieldHeightTopPath)
  ],
  midZig: [
    new Phaser.Math.Vector2(settingsHelpers.fieldWidth1Quarter, settingsHelpers.fieldHeight3Quarters),
    new Phaser.Math.Vector2(settingsHelpers.fieldWidthMid, settingsHelpers.fieldHeightMid)
  ],
  upAndDown: [
    new Phaser.Math.Vector2(settingsHelpers.fieldWidth1Quarter, settingsHelpers.fieldHeightTopPath),
    new Phaser.Math.Vector2(settingsHelpers.fieldWidthMid, settingsHelpers.fieldHeight3Quarters),
    new Phaser.Math.Vector2(settingsHelpers.fieldWidth3Quarters, settingsHelpers.fieldHeightMid)
  ],
  bottomMidLoopZig: [
    ...createLoop(
      new Phaser.Math.Vector2(settingsHelpers.fieldWidthMid, settingsHelpers.fieldHeight3Quarters),
      128,
      1,
      16
    ),
    new Phaser.Math.Vector2(settingsHelpers.fieldWidth3Quarters, settingsHelpers.fieldHeightMid)
  ],
  midSideLoop: [
    ...createLoop(
      new Phaser.Math.Vector2(settingsHelpers.fieldWidth3Quarters, settingsHelpers.fieldHeightMid),
      128,
      1,
      16
    )
  ],
  midDoubleLoop: [
    ...createLoop(
      new Phaser.Math.Vector2(settingsHelpers.fieldWidth1Quarter, settingsHelpers.fieldHeightMid),
      128,
      1,
      16
    ),
    ...createLoop(
      new Phaser.Math.Vector2(settingsHelpers.fieldWidth3Quarters, settingsHelpers.fieldHeightMid),
      128,
      1,
      16
    )
  ]
}

export const levels = [
  {
    enemies: [
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [1, 1, 1]
    ],
    paths: [
      {
        start: { side: 0, y: settingsHelpers.fieldHeightTopPath },
        path: pathTypes.quarterZigZag
      },
      {
        start: { side: 1, y: settingsHelpers.fieldHeightTopPath },
        path: flipPath(pathTypes.quarterZigZag)
      },
      {
        start: { side: 0, y: settingsHelpers.fieldHeight3Quarters },
        path: pathTypes.midSideLoop
      }
    ]
  },
  {
    enemies: [
      [1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1]
    ],
    paths: [
      {
        start: { side: 0, y: settingsHelpers.fieldHeightTopPath },
        path: pathTypes.midZig
      },
      {
        start: { side: 1, y: settingsHelpers.fieldHeight3Quarters },
        path: flipPath(pathTypes.midDoubleLoop)
      },
      {
        start: { side: 0, y: settingsHelpers.fieldHeightMid },
        path: pathTypes.upAndDown
      }
    ]
  },
  {
    enemies: [
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [1, 1]
    ],
    paths: [
      {
        start: { side: 1, y: settingsHelpers.fieldHeight3Quarters },
        path: flipPath(pathTypes.bottomMidLoopZig)
      },
      {
        start: { side: 0, y: settingsHelpers.fieldHeight3Quarters },
        path: pathTypes.midDoubleLoop
      },
      {
        start: { side: 0, y: settingsHelpers.fieldHeightTopPath },
        path: pathTypes.quarterZigZag
      },
      {
        start: { side: 1, y: settingsHelpers.fieldHeightMid },
        path: pathTypes.midZig
      }
    ]
  },
  {
    enemies: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1]
    ],
    paths: [
      {
        start: { side: 1, y: settingsHelpers.fieldHeightMid },
        path: flipPath(pathTypes.midDoubleLoop)
      },
      {
        start: { side: 1, y: settingsHelpers.fieldHeight3Quarters },
        path: flipPath(pathTypes.upAndDown)
      },
      {
        start: { side: 0, y: settingsHelpers.fieldHeightTopPath },
        path: pathTypes.midSideLoop
      },
      {
        start: { side: 0, y: settingsHelpers.fieldHeightMid },
        path: pathTypes.quarterZigZag
      }
    ]
  },
  {
    enemies: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1]
    ],
    paths: [
      {
        start: { side: 0, y: settingsHelpers.fieldHeight3Quarters },
        path: pathTypes.upAndDown
      },
      {
        start: { side: 1, y: settingsHelpers.fieldHeight3Quarters },
        path: flipPath(pathTypes.midDoubleLoop)
      },
      {
        start: { side: 1, y: settingsHelpers.fieldHeightTopPath },
        path: flipPath(pathTypes.quarterZigZag)
      },
      {
        start: { side: 0, y: settingsHelpers.fieldHeightMid },
        path: pathTypes.bottomMidLoopZig
      }
    ]
  }
]
