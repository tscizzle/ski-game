import _ from 'lodash';
import Phaser from 'phaser';

class SkiSlope extends Phaser.Scene {
  constructor() {
    super('SkiSlope');
    this.slopeSteepness = Math.PI / 6; // angle with ground
    this.slopeDirection = 0; // angle rotated clockwise from forward
    this.gravityAccelerationConstant = 500;
  }

  preload() {
    this.load.image(
      'arrows',
      this.publicURL('gameAssets/images/racingArrows.png')
    );
    this.load.image('skis', this.publicURL('gameAssets/images/skis.png'));
    this.load.image(
      'snowParticle',
      this.publicURL('gameAssets/images/snowParticle.png')
    );
  }

  create() {
    // VISUAL OBJECTS
    this.refArrows = [
      this.add.sprite(0, 0, 'arrows'),
      this.add.sprite(0, 500, 'arrows'),
      this.add.sprite(500, 0, 'arrows'),
      this.add.sprite(500, 500, 'arrows'),
    ];
    _.each(this.refArrows, arrow => arrow.setScale(0.75));
    this.skiPlayer = this.physics.add.sprite(250, 250, 'skis');
    this.skiPlayer.setScale(0.25);
    this.edgeSnowParticles = this.add.particles('snowParticle');
    this.edgeSnowEmitter = this.edgeSnowParticles.createEmitter({
      alpha: 0.9,
      speed: 50,
      lifespan: 200,
      blendMode: 'ADD',
      on: false,
    });

    // CAMERA
    this.cameras.main.setBackgroundColor(0xdddddd);
    this.cameras.main.startFollow(this.skiPlayer);

    // CONTROLS
    this.skiTurningCursors = this.input.keyboard.createCursorKeys();

    // this.scene.pause();
  }

  update() {
    // CONTROL ROTATION
    const maxAngularVelocity = Math.PI / 100;
    const angularAcceleration = Math.PI / 2000;
    const currentAngularVelocity = _.min([
      (this.previousAngularVelocity || 0) + Math.PI / 2000,
      maxAngularVelocity,
    ]);
    if (this.skiTurningCursors.left.isDown) {
      this.skiPlayer.rotation -= currentAngularVelocity;
      this.previousAngularVelocity = currentAngularVelocity;
    } else if (this.skiTurningCursors.right.isDown) {
      this.skiPlayer.rotation += currentAngularVelocity;
      this.previousAngularVelocity = currentAngularVelocity;
    } else {
      this.previousAngularVelocity = 0;
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

    // DRAW REFERENCE OBJECTS
    const refDistance = 500;
    const closestBelow =
      Math.floor(this.skiPlayer.y / refDistance) * refDistance;
    const closestLeft =
      Math.floor(this.skiPlayer.x / refDistance) * refDistance;
    const needNewRefs =
      this.refArrows[0].x !== closestLeft ||
      this.refArrows[0].y !== closestBelow;
    if (needNewRefs) {
      const closestRight = closestLeft + refDistance;
      const closestAbove = closestBelow + refDistance;
      this.refArrows[0].setPosition(closestLeft, closestBelow);
      this.refArrows[1].setPosition(closestLeft, closestAbove);
      this.refArrows[2].setPosition(closestRight, closestBelow);
      this.refArrows[3].setPosition(closestRight, closestAbove);
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
      const ceilingScrapeStrength = 1000;
      const slowestEmitterFrequency = 50;
      const fastestEmitterFrequency = 0;
      const maxEmitterScale = 0.4;
      const minEmitterScale = 0.05;
      let newEmitterFrequency;
      let newEmitterScale;
      if (roundedScrapeStrength >= ceilingScrapeStrength) {
        newEmitterFrequency = fastestEmitterFrequency;
        newEmitterScale = maxEmitterScale;
      } else {
        newEmitterFrequency =
          slowestEmitterFrequency *
          (1 - roundedScrapeStrength / ceilingScrapeStrength);
        newEmitterScale =
          (maxEmitterScale - minEmitterScale) *
            (roundedScrapeStrength / ceilingScrapeStrength) +
          minEmitterScale;
      }
      if (newEmitterFrequency !== this.edgeSnowEmitter.frequency) {
        this.edgeSnowEmitter.setFrequency(newEmitterFrequency);
        this.edgeSnowEmitter.setScale({ start: newEmitterScale, end: 0 });
      }
    }
  }

  render() {
    this.debug.spriteInfo(this.skiPlayer);
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
