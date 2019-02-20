import _ from 'lodash';
import Phaser from 'phaser';

import { makeArrow } from 'gameHelpers';
import { GAME_WIDTH, GAME_PADDING } from 'gameConstants';

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
        title: 'Ski Tips Pointing',
        color: 0x3388aa,
        on: false,
        idx: 0,
      },
      velocity: {
        key: 'velocity',
        title: 'Velocity',
        color: 0x33aa00,
        on: false,
        idx: 1,
      },
    };
    _.each(this.vectorInfos, ({ key }) => {
      this.drawLegendItem({ key });
    });

    const vectorsListHeader = this.add.text(
      GAME_WIDTH - GAME_PADDING,
      GAME_PADDING,
      'Show Vectors',
      {
        color: '#444444',
        fontSize: `${this.vectorsListTitleSize}px`,
        fontStyle: 'bold',
      }
    );
    vectorsListHeader.setOrigin(1, 0);
  }

  /* GAME HELPERS */

  itemWidth = 100;

  itemHeight = 50;

  itemMargin = 26;

  itemTitleSize = 14;

  vectorsListTitleSize = 20;

  drawLegendItem({ key }) {
    const vectorInfo = this.vectorInfos[key];
    const { x: centerX, y: centerY } = this.legendItemCenter(vectorInfo.idx);

    // draw the box background and arrow
    const graphics = this.add.graphics();
    graphics.setDefaultStyles({ fillStyle: { color: 0xdddddd } });
    graphics.fillRect(
      centerX - this.itemWidth / 2,
      centerY - this.itemHeight / 2,
      this.itemWidth,
      this.itemHeight
    );
    makeArrow({
      scene: this,
      start: { x: centerX - 30, y: centerY + 8 },
      end: { x: centerX + 30, y: centerY - 8 },
      color: vectorInfo.color,
    });

    // make the box clickable to show/hide the vector on the skis
    const toggleButton = this.add.zone(
      centerX,
      centerY,
      this.itemWidth,
      this.itemHeight
    );
    toggleButton.setInteractive({ useHandCursor: true });
    toggleButton.on('pointerup', () => {
      vectorInfo.on = !vectorInfo.on;
      this.drawLegendItemBorder({ key });
    });

    // title text
    const textColor = `#${vectorInfo.color.toString(16)}`;
    const legendItemText = this.add.text(
      centerX + this.itemWidth / 2,
      centerY - this.itemHeight / 2 - this.itemMargin / 2,
      vectorInfo.title,
      { color: textColor, fontSize: `${this.itemTitleSize}px` }
    );
    legendItemText.setOrigin(1, 0.5);
  }

  drawLegendItemBorder({ key }) {
    const vectorInfo = this.vectorInfos[key];
    const { x: centerX, y: centerY } = this.legendItemCenter(vectorInfo.idx);

    // draw the box border
    if (this.boxGraphics[key]) {
      this.boxGraphics[key].destroy();
    }
    this.boxGraphics[key] = this.add.graphics();
    this.boxGraphics[key].setDefaultStyles({
      lineStyle: { width: 3, color: vectorInfo.color },
    });
    if (vectorInfo.on) {
      this.boxGraphics[key].strokeRect(
        centerX - this.itemWidth / 2,
        centerY - this.itemHeight / 2,
        this.itemWidth,
        this.itemHeight
      );
    }
  }

  legendItemCenter = idx => {
    return {
      x: GAME_WIDTH - GAME_PADDING - this.itemWidth / 2,
      y:
        GAME_PADDING +
        this.vectorsListTitleSize +
        10 +
        this.itemMargin +
        (this.itemMargin + this.itemHeight) * idx +
        this.itemHeight / 2,
    };
  };
}

export default VectorLegend;
