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
  terminate: [new Phaser.Math.Vector2(settingsHelpers.fieldWidthMid, -100)],
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

const paths = [
  [
    pathTypes.closeMidLoop,
    [...pathTypes.farDown, ...pathTypes.closeTop],
    [...pathTypes.mid, ...pathTypes.farTop],
    [...pathTypes.closeDown, ...pathTypes.farMid]
  ],
  [
    [...pathTypes.closeDown, ...pathTypes.midTop],
    [...pathTypes.closeMidLoop, ...pathTypes.farMidLoop],
    [...pathTypes.farDown, ...pathTypes.mid],
    [...pathTypes.closeTop, ...pathTypes.farMid]
  ],
  [
    [...pathTypes.closeDown, ...pathTypes.closeMidLoop, ...pathTypes.terminate],
    [...pathTypes.farMid, ...pathTypes.closeTop, ...pathTypes.terminate],
    [...pathTypes.midDown, ...pathTypes.midTop, ...pathTypes.terminate],
    [...pathTypes.farTop, ...pathTypes.mid, ...pathTypes.terminate]
  ],
  [
    [...pathTypes.closeMid, ...pathTypes.farTop],
    [...pathTypes.midTop, ...pathTypes.farDown],
    [...pathTypes.closeTop, ...pathTypes.midLoop],
    [...pathTypes.farDown, ...pathTypes.farTop]
  ],
  [
    [...pathTypes.farMid, ...pathTypes.farTop],
    [...pathTypes.closeDown, ...pathTypes.midTop],
    [...pathTypes.midTop, ...pathTypes.farMidLoop],
    [...pathTypes.closeTop, ...pathTypes.farDown],
    [...pathTypes.mid] // Boss
  ]
]

type EnemyDef = {
  x: number
  y: number
  shipUpgrades?: number[]
  shieldLevel?: number
  isUFO?: boolean
}

type GroupConfig = {
  start: { side: -1 | 1; y: number }
  path: Phaser.Math.Vector2[]
}

type Group = {
  enemies: EnemyDef[]
  flip?: boolean
  terminate?: boolean
}

type Wave = Group & GroupConfig

type Level = Wave[]

export const makeLevel = (level: number): Level => {
  let pathIdx = (level - 1) % paths.length
  const enemies = level % 5 === 0 ? bossLevel : standardLevels
  const waves = enemies.map((e, idx) => {
    // "flip" paths will be on both sides so just set the side to -1
    const side = e.flip ? -1 : (level + idx) % 2 === 1 ? 1 : -1
    const eCopy: Group = JSON.parse(JSON.stringify(e)) as Group

    // The paths are designed for the left side (-1), flip the vectors if starting from the right
    const path = side === 1 ? flipPath(paths[pathIdx][idx]) : paths[pathIdx][idx]

    return {
      ...eCopy,
      start: { side, y: settingsHelpers.fieldHeightMid },
      path,
      terminate: level % 5 === 3
    } as Wave
  })

  return waves
}

// 34 enemies each level
// 8 - 10 - 10 - 6
const standardLevels: Group[] = [
  {
    enemies: [
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 0, y: 2, shipUpgrades: [4, 9], shieldLevel: 7 },
      { x: 1, y: 2 },
      { x: 2, y: 1, shipUpgrades: [3, 8], shieldLevel: 4 },
      { x: 2, y: 2 }
    ],
    flip: true
  },
  {
    enemies: [
      { x: 3, y: 1, shipUpgrades: [2, 7], shieldLevel: 8 },
      { x: 3, y: 0, shipUpgrades: [1, 6], shieldLevel: 1 },
      { x: 4, y: 1, shipUpgrades: [1, 6], shieldLevel: 2 },
      { x: 5, y: 0, shipUpgrades: [1, 3], shieldLevel: 1 },
      { x: 3, y: 2 },
      { x: 6, y: 0, shipUpgrades: [1, 6], shieldLevel: 1 },
      { x: 4, y: 2 },
      { x: 7, y: 0, shipUpgrades: [3, 8], shieldLevel: 6 }
    ]
  },
  {
    enemies: [
      { x: 1, y: 0 },
      { x: 6, y: 1, shipUpgrades: [2, 7], shieldLevel: 3 },
      { x: 2, y: 0 },
      { x: 5, y: 1, shipUpgrades: [1, 6], shieldLevel: 2 },
      { x: 8, y: 0 },
      { x: 6, y: 2 },
      { x: 4, y: 0, shipUpgrades: [1, 3], shieldLevel: 1 },
      { x: 5, y: 2 }
    ]
  },
  {
    enemies: [
      { x: 2, y: 3 },
      { x: 3, y: 3 },
      { x: 4, y: 3 },
      { x: 5, y: 3 },
      { x: 6, y: 3 },
      { x: 7, y: 3 }
    ]
  }
]

const bossLevel: Group[] = [
  {
    enemies: [
      { x: 1, y: 3 },
      { x: 2, y: 3 },
      { x: 3, y: 3 },
      { x: 4, y: 3 },
      { x: 5, y: 3 },
      { x: 6, y: 3 },
      { x: 7, y: 3 },
      { x: 8, y: 3 }
    ]
  },
  {
    enemies: [
      { x: 0, y: 2 },
      { x: 1, y: 2 },
      { x: 2, y: 2, shipUpgrades: [15, 20], shieldLevel: 20 },
      { x: 3, y: 2, shipUpgrades: [10, 15], shieldLevel: 15 },
      { x: 4, y: 2, shipUpgrades: [5, 10], shieldLevel: 5 },
      { x: 5, y: 2, shipUpgrades: [5, 10], shieldLevel: 5 },
      { x: 6, y: 2, shipUpgrades: [10, 15], shieldLevel: 10 },
      { x: 7, y: 2, shipUpgrades: [15, 20], shieldLevel: 20 },
      { x: 8, y: 2 },
      { x: 9, y: 2 }
    ]
  },
  {
    enemies: [
      { x: 0, y: 1 },
      { x: 1, y: 1, shipUpgrades: [15, 20], shieldLevel: 20 },
      { x: 2, y: 1, shipUpgrades: [5, 10], shieldLevel: 5 },
      { x: 3, y: 1, shipUpgrades: [5, 10], shieldLevel: 5 },
      // Gap for UFO
      { x: 6, y: 1, shipUpgrades: [5, 10], shieldLevel: 5 },
      { x: 7, y: 1, shipUpgrades: [5, 10], shieldLevel: 5 },
      { x: 8, y: 1, shipUpgrades: [15, 20], shieldLevel: 15 },
      { x: 9, y: 1 }
    ]
  },
  {
    enemies: [
      { x: 0, y: 0 },
      { x: 1, y: 0, shipUpgrades: [15, 20], shieldLevel: 20 },
      { x: 2, y: 0, shipUpgrades: [10, 15], shieldLevel: 10 },
      { x: 3, y: 0, shipUpgrades: [5, 10], shieldLevel: 5 },
      // Gap for UFO
      { x: 6, y: 0, shipUpgrades: [5, 10], shieldLevel: 5 },
      { x: 7, y: 0, shipUpgrades: [10, 15], shieldLevel: 15 },
      { x: 8, y: 0, shipUpgrades: [15, 20], shieldLevel: 15 },
      { x: 9, y: 0 }
    ]
  },
  {
    enemies: [{ x: 4.5, y: 0.5, isUFO: true }]
  }
]
