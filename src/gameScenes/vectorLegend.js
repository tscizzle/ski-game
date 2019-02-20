import _ from 'lodash';
import Phaser from 'phaser';

import { makeArrow } from 'gameHelpers';
import { GAME_WIDTH, GAME_PADDING, VECTOR_COLORS } from 'gameConstants';

class VectorLegend extends Phaser.Scene {
  constructor() {
    super({ key: 'VectorLegend', active: true });
  }

  /* MAIN PHASER METHODS */

  create() {
    this.boxGraphics = {};
    this.vectorInfos = {
      rotation: {
        key: 'rotation',
        color: VECTOR_COLORS.rotationArrowColor,
        on: false,
        idx: 0,
      },
      velocity: {
        key: 'velocity',
        color: VECTOR_COLORS.velocityArrowColor,
        on: false,
        idx: 1,
      },
    };
    _.each(this.vectorInfos, ({ key }) => {
      this.drawLegendItem({ key });
    });
  }

  /* GAME HELPERS */

  drawLegendItem({ key }) {
    const vectorInfo = this.vectorInfos[key];
    const { color, idx } = vectorInfo;
    const displayWidth = 240;
    const displayHeight = 110;
    const displayCenterX = GAME_WIDTH - GAME_PADDING - displayWidth / 2;
    const displayCenterY =
      (GAME_PADDING + displayHeight) * idx + GAME_PADDING + displayHeight / 2;

    const graphics = this.add.graphics();
    graphics.setDefaultStyles({ fillStyle: { color: 0xdddddd } });
    graphics.fillRect(
      displayCenterX - displayWidth / 2,
      displayCenterY - displayHeight / 2,
      displayWidth,
      displayHeight
    );
    makeArrow({
      scene: this,
      start: { x: displayCenterX - 50, y: displayCenterY + 20 },
      end: { x: displayCenterX + 50, y: displayCenterY - 20 },
      color,
    });

    const toggleButton = this.add.zone(
      displayCenterX,
      displayCenterY,
      displayWidth,
      displayHeight
    );
    toggleButton.setInteractive({ useHandCursor: true });
    toggleButton.on('pointerup', () => {
      vectorInfo.on = !vectorInfo.on;
      this.drawLegendItemBorder({ key });
    });
  }

  drawLegendItemBorder({ key }) {
    const vectorInfo = this.vectorInfos[key];
    const { color, idx } = vectorInfo;
    const displayWidth = 240;
    const displayHeight = 110;
    const displayCenterX = GAME_WIDTH - GAME_PADDING - displayWidth / 2;
    const displayCenterY =
      (GAME_PADDING + displayHeight) * idx + GAME_PADDING + displayHeight / 2;

    if (this.boxGraphics[key]) {
      this.boxGraphics[key].destroy();
    }
    this.boxGraphics[key] = this.add.graphics();
    this.boxGraphics[key].setDefaultStyles({ lineStyle: { width: 3, color } });
    if (vectorInfo.on) {
      this.boxGraphics[key].strokeRect(
        displayCenterX - displayWidth / 2,
        displayCenterY - displayHeight / 2,
        displayWidth,
        displayHeight
      );
    }
  }
}

export default VectorLegend;
