import { controls } from "../game-init";
import { constructState, gameState } from ".";
import { settingsHelpers } from "../consts";

let titleScreen: Phaser.GameObjects.Image

export const titleUpdate = (
  scene: Phaser.Scene,
  time: number,
  delta: number,
  init: boolean
) => {
  if (init) {
    titleScreen = scene.add.image(settingsHelpers.fieldWidthMid, settingsHelpers.fieldHeightMid, 'title')
    return;
  }

  // When spacebar pressed, close the title screen and create a player and ball for testing
  if (controls.p1Shoot.isDown) {
    // scene.add.image(settingsHelpers.fieldWidthMid, settingsHelpers.fieldHeightMid, 'background')
    titleScreen.destroy();

    constructState(scene);

    gameState.phase = "game";

    // scene.cameras.main.setZoom(gameSettings.gameCameraZoom)
    // scene.cameras.main.setDeadzone(100, 100)
    // scene.cameras.main.startFollow(state.player)
    // scene.cameras.main.setLerp(0.1, 0.1)
    // scene.cameras.main.setBounds(0, 0, gameSettings.fieldWidth, gameSettings.fieldHeight)

    // Don't think we really need a mini-map in this game
    // Keep code here for reference though
    // state.mapCamera = scene.cameras.add(0, 0, settingsHelpers.mapCameraWidth, settingsHelpers.mapCameraHeight)
    // state.mapCamera.setScroll(settingsHelpers.fieldWidthMid, settingsHelpers.fieldHeightMid)
    // state.mapCamera.setZoom(gameSettings.mapCameraZoom)

    // state.debugImage = scene.add.image(0, 0, 'x')
  }
};
