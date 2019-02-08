import _ from 'lodash';
import Phaser from 'phaser';

class SkiSlope extends Phaser.Scene {
  constructor() {
    super('SkiSlope');
    this.refGraphics = null;
    this.refLines = null;
    this.refArrows = null;
    this.skiPlayer = null;
    this.edgeSnowParticles = null;
    this.edgeSnowEmitter = null;
    this.skiCursors = null;
    this.slopeSteepness = Math.PI / 6; // angle with ground
    this.slopeDirection = 0; // angle rotated clockwise from forward
    this.gravityAccelerationConstant = 500;
  }

  preload() {
    this.load.image('skis', this.publicURL('gameAssets/images/skis.png'));
    this.load.image(
      'snowParticle',
      this.publicURL('gameAssets/images/snowParticle.png')
    );
  }

  create() {
    // VISUAL OBJECTS
    this.refGraphics = this.add.graphics({
      lineStyle: { color: 0x999999, width: 1 },
    });
    this.refLines = {
      top: new Phaser.Geom.Line(-100000, 500, 100000, 500),
      right: new Phaser.Geom.Line(500, -100000, 500, 100000),
      bottom: new Phaser.Geom.Line(-100000, 0, 100000, 0),
      left: new Phaser.Geom.Line(0, -100000, 0, 100000),
    };
    _.each(this.refLines, line => this.refGraphics.strokeLineShape(line));
    this.skiPlayer = this.physics.add.sprite(0, 0, 'skis');
    this.edgeSnowParticles = this.add.particles('snowParticle');
    this.edgeSnowEmitter = this.edgeSnowParticles.createEmitter({
      alpha: 0.9,
      speed: 50,
      lifespan: 200,
      scale: { start: 0.1, end: 0 },
      blendMode: 'ADD',
      on: false,
    });

    // CAMERA
    this.cameras.main.setBackgroundColor(0xdefefe);
    this.cameras.main.startFollow(this.skiPlayer);

    // CONTROLS
    this.skiTurningCursors = this.input.keyboard.createCursorKeys();

    // this.scene.pause();
  }

  update() {
    // CONTROL ROTATION
    if (this.skiTurningCursors.left.isDown) {
      this.skiPlayer.rotation -= Math.PI / 60;
    } else if (this.skiTurningCursors.right.isDown) {
      this.skiPlayer.rotation += Math.PI / 60;
    }

    // ACCELERATE DUE TO GRAVITY
    // acceleration lessened by the ground
    const slopeFactor = Math.sin(this.slopeSteepness);
    // acceleration lessened if skis not lined up with the slope direction
    const traversalFactor = Math.cos(
      this.skiPlayer.rotation - this.slopeDirection
    );
    // slope and traversal factors scale the gravity constant to get the
    // acceleration in the direction of the skis
    const parallelAcceleration =
      this.gravityAccelerationConstant * slopeFactor * traversalFactor;
    // split this acceleration into its x-y components
    const accelerationDueToGravity = {
      x: Math.sin(this.skiPlayer.rotation) * parallelAcceleration,
      y: -Math.cos(this.skiPlayer.rotation) * parallelAcceleration,
    };

    // DECELERATE DUE TO SKI EDGES
    // acceleration decreases with velocity perpendicular to the skis
    const velocityAngle = Math.atan2(
      this.skiPlayer.body.velocity.x,
      -this.skiPlayer.body.velocity.y
    );
    const skisPerpendicularLeft = this.skiPlayer.rotation - Math.PI / 2;
    const skisPerpendicularRight = this.skiPlayer.rotation + Math.PI / 2;
    const leftDiff = Math.abs(
      this.smallestAngleDifference(skisPerpendicularLeft, velocityAngle)
    );
    const rightDiff = Math.abs(
      this.smallestAngleDifference(skisPerpendicularRight, velocityAngle)
    );
    const skisPerpendicularAngle =
      leftDiff < rightDiff ? skisPerpendicularLeft : skisPerpendicularRight;
    const turnFactor = Math.cos(velocityAngle - skisPerpendicularAngle);
    // turn factor scales the velocity to get the (negative) acceleration in the
    // direction perpendicular to the skis
    const perpendicularAcceleration = -this.skiPlayer.body.speed * turnFactor;
    // split this acceleration into its x-y components
    const accelerationDueToEdging = {
      x: Math.sin(skisPerpendicularAngle) * perpendicularAcceleration,
      y: -Math.cos(skisPerpendicularAngle) * perpendicularAcceleration,
    };

    // APPLY NET ACCELERATION
    const acceleration = {
      x: accelerationDueToGravity.x + accelerationDueToEdging.x,
      y: accelerationDueToGravity.y + accelerationDueToEdging.y,
    };
    this.skiPlayer.body.setAcceleration(acceleration.x, acceleration.y);

    // DRAW REFERENCE LINES
    const closest500Below = Math.floor(this.skiPlayer.y / 500) * 500;
    const closest500Left = Math.floor(this.skiPlayer.x / 500) * 500;
    const { top, right, bottom, left } = this.refLines;
    let needStroke = false;
    if (bottom.y1 !== closest500Below) {
      const closest500Above = closest500Below + 500;
      top.setTo(-100000, closest500Above, 100000, closest500Above);
      bottom.setTo(-100000, closest500Below, 100000, closest500Below);
      needStroke = true;
    }
    if (left.x1 !== closest500Left) {
      right.setTo(closest500Left + 500, -100000, closest500Left + 500, 100000);
      left.setTo(closest500Left, -100000, closest500Left, 100000);
      needStroke = true;
    }
    if (needStroke) {
      _.each(this.refLines, line => this.refGraphics.strokeLineShape(line));
    }

    // EMIT SNOW PARTICLES
    const scrapeStrength = Math.abs(perpendicularAcceleration);
    const isScraping = scrapeStrength >= 100;
    const isEmitterOn = this.edgeSnowEmitter.on;
    if (isEmitterOn && !isScraping) {
      this.edgeSnowEmitter.stop();
    } else if (!isEmitterOn && isScraping) {
      this.edgeSnowEmitter.start();
    }
    if (isScraping) {
      const isScrapeEdgeLeft = skisPerpendicularAngle === skisPerpendicularLeft;
      const skisBackCorner = isScrapeEdgeLeft
        ? this.skiPlayer.getBottomLeft()
        : this.skiPlayer.getBottomRight();
      const skisFrontCorner = isScrapeEdgeLeft
        ? this.skiPlayer.getTopLeft()
        : this.skiPlayer.getTopRight();
      const scrapingLine = new Phaser.Geom.Line(
        skisBackCorner.x,
        skisBackCorner.y,
        skisFrontCorner.x,
        skisFrontCorner.y
      );
      this.edgeSnowEmitter.setEmitZone({
        source: scrapingLine,
        type: 'random',
      });
      const roundedScrapeStrength = Math.floor(scrapeStrength / 200) * 200;
      const maxEmitterFrequency = 50;
      const minEmitterScale = 0.1;
      const maxEmitterScale = 0.2;
      let newEmitterFrequency;
      let newEmitterScale;
      if (roundedScrapeStrength >= 1000) {
        newEmitterFrequency = 0;
        newEmitterScale = maxEmitterScale;
      } else {
        newEmitterFrequency =
          maxEmitterFrequency * (1 - roundedScrapeStrength / 1000);
        newEmitterScale =
          (maxEmitterScale - minEmitterScale) * (roundedScrapeStrength / 1000) +
          minEmitterScale;
      }
      if (newEmitterFrequency !== this.edgeSnowEmitter.frequency) {
        this.edgeSnowEmitter.setFrequency(newEmitterFrequency);
        this.edgeSnowEmitter.setScale({ start: newEmitterScale, end: 0 });
      }
    }
  }

  /* HELPERS */

  publicURL(path) {
    return `${process.env.PUBLIC_URL}${path}`;
  }

  smallestAngleDifference(a, b) {
    return Math.atan2(Math.sin(a - b), Math.cos(a - b));
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
