export const gameSettings = {
  screenWidth: 1232,
  screenHeight: 1584,
  gameCameraZoom: 1,
  playerSpeed: 0.33,
  playerEdge: 96,
  playerRadius: 32,
  playerLaserForce: 0.35,
  marchSpeed: 50,
  marchSize: 80,
  showFrameRate: false,
  maxDivers: 5,
  maxLasers: 5,
  startingExtraLives: 2
}

export const settingsHelpers = {
  fieldWidthMid: gameSettings.screenWidth / 2,
  fieldWidth3Quarters: gameSettings.screenWidth / 2 + gameSettings.screenWidth / 4,
  fieldWidth1Quarter: gameSettings.screenWidth / 2 - gameSettings.screenWidth / 4,
  fieldHeightMid: gameSettings.screenHeight / 2,
  fieldHeight3Quarters: gameSettings.screenHeight / 2 + gameSettings.screenHeight / 4,
  fieldHeight1Quarter: gameSettings.screenHeight / 2 - gameSettings.screenHeight / 4,
  fieldHeightTopPath: gameSettings.screenHeight / 2 - gameSettings.screenHeight / 6,
  worldBoundWidth: gameSettings.screenWidth,
  worldBoundHeight: gameSettings.screenHeight,
  playerMinX: gameSettings.playerEdge,
  playerMaxX: gameSettings.screenWidth - gameSettings.playerEdge,
  playerYPosition: gameSettings.screenHeight - gameSettings.playerRadius * 4
}
