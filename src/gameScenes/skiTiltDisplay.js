import Phaser from 'phaser';

import { publicURL } from 'gameHelpers';
import { GAME_WIDTH, GAME_HEIGHT, GAME_PADDING } from 'gameConstants';

class SkiTiltDisplay extends Phaser.Scene {
  constructor() {
    super({ key: 'SkiTiltDisplay', active: true });
  }

  /* MAIN PHASER METHODS */

  preload() {
    this.load.image(
      'leftSkiBack',
      publicURL('/gameAssets/images/leftSkiBack.png')
    );
    this.load.image(
      'rightSkiBack',
      publicURL('/gameAssets/images/rightSkiBack.png')
    );
  }

  create() {
    const displayWidth = 240;
    const displayHeight = 110;
    const displayCenterX = GAME_WIDTH - GAME_PADDING - displayWidth / 2;
    const displayCenterY = GAME_HEIGHT - GAME_PADDING - displayHeight / 2;

    const graphics = this.add.graphics();
    graphics.setDefaultStyles({
      lineStyle: { width: 3, color: 0x777777 },
      fillStyle: { color: 0xdddddd },
    });
    graphics.fillRect(
      displayCenterX - displayWidth / 2,
      displayCenterY - displayHeight / 2,
      displayWidth,
      displayHeight
    );
    graphics.strokeRect(
      displayCenterX - displayWidth / 2,
      displayCenterY - displayHeight / 2,
      displayWidth,
      displayHeight
    );

    this.leftSki = this.add.sprite(-220, 0, 'leftSkiBack');
    this.rightSki = this.add.sprite(220, 0, 'rightSkiBack');
    this.skis = this.add.container(displayCenterX, displayCenterY, [
      this.leftSki,
      this.rightSki,
    ]);
    this.skis.setScale(0.23);
  }

  update() {
    const slopeScene = this.scene.get('MountainSlope');
    const {
      previousTiltAmount: tiltAmount,
      previousTiltDirection: tiltDirection,
    } = slopeScene;
    const minRotation = 0;
    const maxRotation = Math.PI / 4;
    const tiltRotationSign = tiltDirection === 'left' ? -1 : 1;
    const tiltRotationMagnitude =
      minRotation * (1 - tiltAmount) + maxRotation * tiltAmount;
    const tiltRotation = tiltRotationMagnitude * tiltRotationSign;
    this.leftSki.rotation = tiltRotation;
    this.rightSki.rotation = tiltRotation;
  }
}

export default SkiTiltDisplay;
