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

export const flipPath = (paths: Phaser.Math.Vector2[]) =>
  paths.map((p) => new Phaser.Math.Vector2(gameSettings.screenWidth - p.x, p.y))

const pathTypes = {
  closeDown: [new Phaser.Math.Vector2(settingsHelpers.fieldWidth1Quarter, settingsHelpers.fieldHeight3Quarters)],
  closeMid: [new Phaser.Math.Vector2(settingsHelpers.fieldWidth1Quarter, settingsHelpers.fieldHeightMid)],
  closeTop: [new Phaser.Math.Vector2(settingsHelpers.fieldWidth1Quarter, settingsHelpers.fieldHeightTopPath)],
  midDown: [new Phaser.Math.Vector2(settingsHelpers.fieldWidthMid, settingsHelpers.fieldHeight3Quarters)],
  mid: [new Phaser.Math.Vector2(settingsHelpers.fieldWidthMid, settingsHelpers.fieldHeightMid)],
  midTop: [new Phaser.Math.Vector2(settingsHelpers.fieldWidthMid, settingsHelpers.fieldHeightTopPath)],
  farDown: [new Phaser.Math.Vector2(settingsHelpers.fieldWidth3Quarters, settingsHelpers.fieldHeight3Quarters)],
  farMid: [new Phaser.Math.Vector2(settingsHelpers.fieldWidth3Quarters, settingsHelpers.fieldHeightMid)],
  farTop: [new Phaser.Math.Vector2(settingsHelpers.fieldWidth3Quarters, settingsHelpers.fieldHeightTopPath)],
  closeDownLoop: [
    ...createLoop(
      new Phaser.Math.Vector2(settingsHelpers.fieldWidth1Quarter, settingsHelpers.fieldHeight3Quarters),
      196,
      1,
      16
    )
  ],
  closeMidLoop: [
    ...createLoop(
      new Phaser.Math.Vector2(settingsHelpers.fieldWidth1Quarter, settingsHelpers.fieldHeightMid),
      196,
      1,
      16
    )
  ],
  closeTopLoop: [
    ...createLoop(
      new Phaser.Math.Vector2(settingsHelpers.fieldWidth1Quarter, settingsHelpers.fieldHeightTopPath),
      196,
      1,
      16
    )
  ],
  midDownLoop: [
    ...createLoop(
      new Phaser.Math.Vector2(settingsHelpers.fieldWidthMid, settingsHelpers.fieldHeight3Quarters),
      196,
      1,
      16
    )
  ],
  midLoop: [
    ...createLoop(new Phaser.Math.Vector2(settingsHelpers.fieldWidthMid, settingsHelpers.fieldHeightMid), 196, 1, 16)
  ],
  midTopLoop: [
    ...createLoop(
      new Phaser.Math.Vector2(settingsHelpers.fieldWidthMid, settingsHelpers.fieldHeightTopPath),
      196,
      1,
      16
    )
  ],
  farDownLoop: [
    ...createLoop(
      new Phaser.Math.Vector2(settingsHelpers.fieldWidth3Quarters, settingsHelpers.fieldHeight3Quarters),
      196,
      1,
      16
    )
  ],
  farMidLoop: [
    ...createLoop(
      new Phaser.Math.Vector2(settingsHelpers.fieldWidth3Quarters, settingsHelpers.fieldHeightMid),
      196,
      1,
      16
    )
  ],
  farTopLoop: [
    ...createLoop(
      new Phaser.Math.Vector2(settingsHelpers.fieldWidth3Quarters, settingsHelpers.fieldHeightTopPath),
      196,
      1,
      16
    )
  ]
}

type EnemyDef = {
  level?: number
  health?: number
  x: number
  y: number
}

type Group = {
  enemies: EnemyDef[]
  start: { side: -1 | 1; y: number }
  path: Phaser.Math.Vector2[]
  flip?: boolean
}

type Wave = Group[]

type Level = Wave[]

export const levels: Level[] = [
  // Level 1
  [
    [
      {
        enemies: [
          { x: 1, y: 1 },
          { x: 2, y: 1 },
          { x: 1, y: 2 },
          { x: 2, y: 2 }
        ],
        start: { side: -1, y: settingsHelpers.fieldHeight3Quarters },
        path: pathTypes.closeMidLoop,
        flip: true
      }
    ],
    [
      {
        enemies: [
          { x: 3, y: 1 },
          { x: 4, y: 1 },
          { x: 3, y: 2 },
          { x: 4, y: 2 }
        ],
        start: { side: -1, y: settingsHelpers.fieldHeightMid },
        path: [...pathTypes.farDown, ...pathTypes.closeTop]
      }
    ],
    [
      {
        enemies: [
          { x: 6, y: 1 },
          { x: 5, y: 1 },
          { x: 6, y: 2 },
          { x: 5, y: 2 }
        ],
        start: { side: 1, y: settingsHelpers.fieldHeightTopPath },
        path: [...pathTypes.farMid, ...pathTypes.closeTop]
      }
    ],
    [
      {
        enemies: [
          { x: 1, y: 0 },
          { x: 2, y: 0 },
          { x: 3, y: 0 },
          { x: 4, y: 0 }
        ],
        start: { side: -1, y: settingsHelpers.fieldHeight3Quarters },
        path: [...pathTypes.farDown, ...pathTypes.midTop],
        flip: true
      }
    ]
  ]

  // Level 2
]

// export const levelsOld = [
//   {
//     enemies: [
//       [1, 1, 1, 1, 1],
//       [1, 1, 1, 1, 1],
//       [1, 1, 1]
//     ],
//     paths: [
//       {
//         start: { side: 0, y: settingsHelpers.fieldHeightTopPath },
//         path: pathTypes.quarterZigZag
//       },
//       {
//         start: { side: 1, y: settingsHelpers.fieldHeightTopPath },
//         path: flipPath(pathTypes.quarterZigZag)
//       },
//       {
//         start: { side: 0, y: settingsHelpers.fieldHeight3Quarters },
//         path: pathTypes.midSideLoop
//       }
//     ]
//   },
//   {
//     enemies: [
//       [1, 1, 1, 1, 1, 1],
//       [1, 1, 1, 1, 1, 1],
//       [1, 1, 1, 1]
//     ],
//     paths: [
//       {
//         start: { side: 0, y: settingsHelpers.fieldHeightTopPath },
//         path: pathTypes.midZig
//       },
//       {
//         start: { side: 1, y: settingsHelpers.fieldHeight3Quarters },
//         path: flipPath(pathTypes.midDoubleLoop)
//       },
//       {
//         start: { side: 0, y: settingsHelpers.fieldHeightMid },
//         path: pathTypes.upAndDown
//       }
//     ]
//   },
//   {
//     enemies: [
//       [1, 1, 1, 1, 1, 1, 1],
//       [1, 1, 1, 1, 1, 1, 1],
//       [1, 1, 1, 1, 1],
//       [1, 1]
//     ],
//     paths: [
//       {
//         start: { side: 1, y: settingsHelpers.fieldHeight3Quarters },
//         path: flipPath(pathTypes.bottomMidLoopZig)
//       },
//       {
//         start: { side: 0, y: settingsHelpers.fieldHeight3Quarters },
//         path: pathTypes.midDoubleLoop
//       },
//       {
//         start: { side: 0, y: settingsHelpers.fieldHeightTopPath },
//         path: pathTypes.quarterZigZag
//       },
//       {
//         start: { side: 1, y: settingsHelpers.fieldHeightMid },
//         path: pathTypes.midZig
//       }
//     ]
//   },
//   {
//     enemies: [
//       [1, 1, 1, 1, 1, 1, 1, 1, 1],
//       [1, 1, 1, 1, 1, 1, 1, 1],
//       [1, 1, 1, 1, 1, 1],
//       [1, 1, 1, 1]
//     ],
//     paths: [
//       {
//         start: { side: 1, y: settingsHelpers.fieldHeightMid },
//         path: flipPath(pathTypes.midDoubleLoop)
//       },
//       {
//         start: { side: 1, y: settingsHelpers.fieldHeight3Quarters },
//         path: flipPath(pathTypes.upAndDown)
//       },
//       {
//         start: { side: 0, y: settingsHelpers.fieldHeightTopPath },
//         path: pathTypes.midSideLoop
//       },
//       {
//         start: { side: 0, y: settingsHelpers.fieldHeightMid },
//         path: pathTypes.quarterZigZag
//       }
//     ]
//   },
//   {
//     enemies: [
//       [1, 1, 1, 1, 1, 1, 1, 1, 1],
//       [1, 1, 1, 1, 1, 1, 1, 1, 1],
//       [1, 1, 1, 1, 1, 1, 1],
//       [1, 1, 1, 1, 1, 1]
//     ],
//     paths: [
//       {
//         start: { side: 0, y: settingsHelpers.fieldHeight3Quarters },
//         path: pathTypes.upAndDown
//       },
//       {
//         start: { side: 1, y: settingsHelpers.fieldHeight3Quarters },
//         path: flipPath(pathTypes.midDoubleLoop)
//       },
//       {
//         start: { side: 1, y: settingsHelpers.fieldHeightTopPath },
//         path: flipPath(pathTypes.quarterZigZag)
//       },
//       {
//         start: { side: 0, y: settingsHelpers.fieldHeightMid },
//         path: pathTypes.bottomMidLoopZig
//       }
//     ]
//   }
// ]
