import _ from 'lodash';
import Phaser from 'phaser';

import { GAME_WIDTH, GAME_HEIGHT, GAME_PADDING } from 'gameConstants';

class ResetButton extends Phaser.Scene {
  constructor() {
    super({ key: 'ResetButton', active: true });
  }

  create() {
    const displayWidth = 320;
    const displayHeight = 160;
    const displayCenterX = GAME_WIDTH / 2;
    const displayCenterY = GAME_HEIGHT - GAME_PADDING - displayHeight / 2;

    const graphics = this.add.graphics();
    graphics.setDefaultStyles({
      lineStyle: { width: 8, color: 0x44aa44 },
      fillStyle: { color: 0x88dd88 },
    });

    const slopeScene = this.scene.get('MountainSlope');
    slopeScene.events.on('crash', () => {
      const rectArgs = [
        displayCenterX - displayWidth / 2,
        displayCenterY - displayHeight / 2,
        displayWidth,
        displayHeight,
        5,
      ];
      graphics.strokeRoundedRect(...rectArgs);
      graphics.fillRoundedRect(...rectArgs);
      const resetButtonText = this.add.text(
        displayCenterX,
        displayCenterY,
        'Lift Back Up',
        { color: '#228822', fontSize: '28px', fontStyle: 'bold' }
      );
      resetButtonText.setOrigin(0.5, 0.5);
      const resetButton = this.add.zone(
        displayCenterX,
        displayCenterY,
        displayWidth,
        displayHeight
      );
      resetButton.setInteractive({ useHandCursor: true });
      resetButton.on('pointerup', () => {
        _.each(this.scene.manager.scenes, scene => scene.scene.restart());
      });
    });
  }
}

export default ResetButton;
