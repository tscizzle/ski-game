import _ from 'lodash';
import Phaser from 'phaser';

class SkiSlope extends Phaser.Scene {
  constructor() {
    super('SkiSlope');
    this.wallLeft = null;
    this.wallRight = null;
    this.wallGraphics = null;
    this.distanceMarker0 = null;
    this.distanceMarker1 = null;
    this.skiPlayer = null;
    this.skiCursors = null;
    this.slopeSteepness = Math.PI / 6; // angle with ground
    this.slopeDirection = 0; // angle rotated clockwise from forward
  }

  preload() {
    this.load.image('skis', this.publicURL('gameAssets/images/skis.png'));
  }

  create() {
    // VISUAL OBJECTS
    this.wallLeft = new Phaser.Geom.Line(-300, -100000, -300, 100000);
    this.wallRight = new Phaser.Geom.Line(300, -100000, 300, 100000);
    this.wallGraphics = this.add.graphics({
      lineStyle: { color: 0x000000 },
    });
    this.wallGraphics.strokeLineShape(this.wallLeft);
    this.wallGraphics.strokeLineShape(this.wallRight);
    this.distanceMarker0 = this.add.text(-250, 0, '0', {
      fontSize: '32px',
      fill: '#000',
    });
    this.distanceMarker1 = this.add.text(-250, -500, '500', {
      fontSize: '32px',
      fill: '#000',
    });
    this.skiPlayer = this.physics.add.sprite(0, 0, 'skis');

    // CAMERA
    this.cameras.main.setBackgroundColor(0xddeeff);
    this.cameras.main.startFollow(this.skiPlayer);

    // CONTROLS
    this.skiTurningCursors = this.input.keyboard.createCursorKeys();

    console.log('this', this);
  }

  update() {
    // CONTROL ROTATION
    if (this.skiTurningCursors.left.isDown) {
      this.skiPlayer.rotation -= Math.PI / 100;
    } else if (this.skiTurningCursors.right.isDown) {
      this.skiPlayer.rotation += Math.PI / 100;
    }

    // CONTROL MOVEMENT (TODO let the slope do this, but for testing rn do with arrow keys)
    if (this.skiTurningCursors.up.isDown) {
      this.skiPlayer.x += Math.sin(this.skiPlayer.rotation) * 2;
      this.skiPlayer.y -= Math.cos(this.skiPlayer.rotation) * 2;
    } else if (this.skiTurningCursors.down.isDown) {
      this.skiPlayer.x -= Math.sin(this.skiPlayer.rotation) * 2;
      this.skiPlayer.y += Math.cos(this.skiPlayer.rotation) * 2;
    }

    // DRAW DISTANCE MARKERS
    const skiPlayerProgress = -this.skiPlayer.y;
    const closest500Below = Math.floor(skiPlayerProgress / 500) * 500;
    const closest500Above = Math.ceil(skiPlayerProgress / 500) * 500;
    if (this.distanceMarker0.y !== -closest500Below) {
      this.distanceMarker0.y = -closest500Below;
      this.distanceMarker0.setText(String(closest500Below));
      this.distanceMarker1.y = -closest500Above;
      this.distanceMarker1.setText(String(closest500Above));
    }
  }

  /* HELPERS */

  publicURL(path) {
    return `${process.env.PUBLIC_URL}${path}`;
  }
}

export const initializeGame = () => {
  const gameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 800,
    scene: [SkiSlope],
    physics: {
      default: 'arcade',
    },
  };
  const game = new Phaser.Game(gameConfig);
  return game;
};
