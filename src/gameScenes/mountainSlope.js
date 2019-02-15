import _ from 'lodash';
import Phaser from 'phaser';

import { publicURL, smallestAngleDifference } from 'gameHelpers';
import { GAME_WIDTH, GAME_HEIGHT } from 'gameConstants';

class MountainSlope extends Phaser.Scene {
  constructor() {
    super('MountainSlope');
  }

  /* MAIN PHASER METHODS */

  preload() {
    this.load.image('arrows', publicURL('/gameAssets/images/racingArrows.png'));
    this.load.image('skiBody', publicURL('/gameAssets/images/skiBody.png'));
    this.load.image('leftSki', publicURL('/gameAssets/images/leftSki.png'));
    this.load.image('rightSki', publicURL('/gameAssets/images/rightSki.png'));
    this.load.image(
      'snowParticle',
      publicURL('/gameAssets/images/snowParticle.png')
    );
    this.load.image(
      'crashedSkis',
      publicURL('/gameAssets/images/crashedSkis.png')
    );
  }

  create() {
    // INITIALIZE CONSTANTS
    this.slopeSteepness = Math.PI / 6; // angle with ground
    this.slopeDirection = 0; // angle rotated clockwise from forward
    this.gravityAccelerationConstant = 500;

    // INITIALIZE VALUES THAT GET UPDATED
    this.previousAngularVelocity = 0;
    this.previousTurnDirection = null;
    this.previousTiltAmount = 0;
    this.previousTiltDirection = null;
    this.previousBackCorner = null;
    this.isCrashed = false;

    // VISUAL OBJECTS
    this.refDistance = _.max([GAME_WIDTH, GAME_HEIGHT]) / 2 + 100;
    this.refArrows = [
      this.add.sprite(0, 0, 'arrows'),
      this.add.sprite(0, this.refDistance, 'arrows'),
      this.add.sprite(this.refDistance, 0, 'arrows'),
      this.add.sprite(this.refDistance, this.refDistance, 'arrows'),
    ];
    _.each(this.refArrows, arrow => arrow.setScale(0.75));
    this.skiBody = this.add.sprite(0, 0, 'skiBody');
    this.leftSki = this.add.sprite(-40, 0, 'leftSki');
    this.rightSki = this.add.sprite(40, 0, 'rightSki');
    this.skiPlayer = this.add.container(
      this.refDistance / 2,
      this.refDistance / 2,
      [this.skiBody, this.leftSki, this.rightSki]
    );
    this.skiPlayer.setScale(0.25);
    this.physics.world.enable(this.skiPlayer);
    this.edgeSnowParticles = this.add.particles('snowParticle');
    this.edgeSnowEmitter = this.edgeSnowParticles.createEmitter({
      radial: false,
      lifespan: 375,
      quantity: 5,
      angle: { min: -100, max: -80 },
      blendMode: 'ADD',
      on: false,
    });

    // CAMERA
    this.cameras.main.setBackgroundColor(0xf0f0f0);
    this.cameras.main.startFollow(this.skiPlayer);

    // CONTROLS
    this.skiTurningCursors = this.input.keyboard.createCursorKeys();
    this.skiTiltCursors = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });

    // this.scene.pause();
  }

  update() {
    this.drawReferenceObjects();

    if (!this.isCrashed) {
      this.controlRotation();
      this.controlTilt();
    }

    // ACCELERATION DUE TO GRAVITY
    let accelerationDueToGravity = { x: 0, y: 0 };
    if (!this.isCrashed) {
      // acceleration lessened by the ground
      const slopeFactor = Math.sin(this.slopeSteepness);
      // acceleration is parallel to skis if they are tilted. otherwise
      // acceleration is in direction of the slope.
      const gravityAccelerationDirection = _.isNull(this.previousTiltDirection)
        ? this.slopeDirection
        : this.skiPlayer.rotation;
      // acceleration lessened if acceleration not lined up with the slope
      // direction
      const traversalFactor = Math.cos(
        gravityAccelerationDirection - this.slopeDirection
      );
      // slope and traversal factors scale the gravity constant to get the
      // acceleration
      const accelerationMagnitude =
        this.gravityAccelerationConstant * slopeFactor * traversalFactor;
      // split this acceleration into its x-y components
      accelerationDueToGravity = {
        x: Math.sin(gravityAccelerationDirection) * accelerationMagnitude,
        y: -Math.cos(gravityAccelerationDirection) * accelerationMagnitude,
      };
    }

    // DECELERATE DUE TO SKI EDGES
    // acceleration decreases with velocity perpendicular to the skis
    const velocityAngle = Math.atan2(
      this.skiPlayer.body.velocity.x,
      -this.skiPlayer.body.velocity.y
    );
    const skisPerpendicularLeft = this.skiPlayer.rotation - Math.PI / 2;
    const skisPerpendicularRight = this.skiPlayer.rotation + Math.PI / 2;
    const leftDiff = Math.abs(
      smallestAngleDifference(skisPerpendicularLeft, velocityAngle)
    );
    const rightDiff = Math.abs(
      smallestAngleDifference(skisPerpendicularRight, velocityAngle)
    );
    const skisPerpendicularAngle =
      leftDiff < rightDiff ? skisPerpendicularLeft : skisPerpendicularRight;
    const turnFactor = Math.cos(velocityAngle - skisPerpendicularAngle);
    // turn factor scales the velocity to get the (negative) acceleration in the
    // direction perpendicular to the skis
    const skisPerpendicularSpeed = this.skiPlayer.body.speed * turnFactor;
    // scale the acceleration by the amount the skis are tilted, with some
    // scrape even when there's no tilt
    const tiltFactor = 0.1 + this.previousTiltAmount * 0.9;
    const skisPerpendicularAcceleration = -skisPerpendicularSpeed * tiltFactor;
    // split this acceleration into its x-y components
    const accelerationDueToEdges = {
      x: Math.sin(skisPerpendicularAngle) * skisPerpendicularAcceleration,
      y: -Math.cos(skisPerpendicularAngle) * skisPerpendicularAcceleration,
    };

    // APPLY NET ACCELERATION
    const acceleration = {
      x: accelerationDueToGravity.x + accelerationDueToEdges.x,
      y: accelerationDueToGravity.y + accelerationDueToEdges.y,
    };
    this.skiPlayer.body.setAcceleration(acceleration.x, acceleration.y);

    // SCRAPE EFFECTS
    const snowEmissionSpeed = skisPerpendicularSpeed * 1.1;
    const scrapeStrength = Math.abs(skisPerpendicularAcceleration);
    const isScraping = scrapeStrength >= 100;
    const isEmitterOn = this.edgeSnowEmitter.on;
    if (isScraping) {
      if (!isEmitterOn) {
        this.edgeSnowEmitter.start();
      }
      // set the angle and speed of the snow emissions
      const scrapeEdge =
        skisPerpendicularAngle === skisPerpendicularLeft ? 'left' : 'right';
      const skisBackCorner =
        scrapeEdge === 'left'
          ? this.skiBody.getBottomLeft(null, true)
          : this.skiBody.getBottomRight(null, true);
      const skisFrontCorner =
        scrapeEdge === 'left'
          ? this.skiBody.getTopLeft(null, true)
          : this.skiBody.getTopRight(null, true);
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
      this.edgeSnowEmitter.setSpeed(snowEmissionSpeed);
      // set the frequency and size of the snow emissions
      const roundedScrapeStrength = Math.floor(scrapeStrength / 200) * 200;
      const ceilingScrapeStrength = 1000;
      const slowestEmitterFrequency = 50;
      const fastestEmitterFrequency = 0;
      const maxEmitterScale = 0.25;
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
      // leave a trail in the snow
      if (this.previousBackCorner) {
        const graphics = this.add.graphics();
        graphics.setDefaultStyles({ lineStyle: { width: 3, color: 0xcccccc } });
        const line = graphics.lineBetween(
          this.previousBackCorner.x,
          this.previousBackCorner.y,
          skisBackCorner.x,
          skisBackCorner.y
        );
        this.add.tween({
          targets: [line],
          duration: 1000,
          alpha: 0,
          onComplete() {
            line.destroy();
            graphics.destroy();
          },
        });
      }
      this.previousBackCorner = skisBackCorner;

      // fall off skis if tilting toward the scrape
      if (scrapeEdge === this.previousTiltDirection) {
        this.crash();
      }
    } else {
      if (isEmitterOn) {
        this.edgeSnowEmitter.stop();
      }
      this.previousBackCorner = null;
    }
  }

  /* GAME HELPERS */

  controlRotation() {
    const maxAngularVelocity = Math.PI / 70;
    const angularAcceleration = Math.PI / 1000;
    const currentAngularVelocity = _.min([
      this.previousAngularVelocity + angularAcceleration,
      maxAngularVelocity,
    ]);
    if (this.skiTurningCursors.left.isDown) {
      if (this.previousTurnDirection !== 'right') {
        this.skiPlayer.rotation -= currentAngularVelocity;
        this.previousAngularVelocity = currentAngularVelocity;
      } else {
        this.previousAngularVelocity = 0;
      }
      this.previousTurnDirection = 'left';
    } else if (this.skiTurningCursors.right.isDown) {
      if (this.previousTurnDirection !== 'left') {
        this.skiPlayer.rotation += currentAngularVelocity;
        this.previousAngularVelocity = currentAngularVelocity;
      } else {
        this.previousAngularVelocity = 0;
      }
      this.previousTurnDirection = 'right';
    } else {
      this.previousAngularVelocity = 0;
      this.previousTurnDirection = null;
    }
  }

  controlTilt() {
    const maxSkisScale = 1;
    const minSkisScale = 0.8;
    const maxTilt = 1;
    const minTilt = 0;
    const tiltVelocity = 0.05;
    let tiltAmount;
    let tiltDirection = this.previousTiltDirection;
    if (this.skiTiltCursors.left.isDown) {
      if (this.previousTiltDirection !== 'right') {
        tiltAmount = _.min([this.previousTiltAmount + tiltVelocity, maxTilt]);
        tiltDirection = 'left';
      } else {
        tiltAmount = _.max([this.previousTiltAmount - tiltVelocity, minTilt]);
      }
    } else if (this.skiTiltCursors.right.isDown) {
      if (this.previousTiltDirection !== 'left') {
        tiltAmount = _.min([this.previousTiltAmount + tiltVelocity, maxTilt]);
        tiltDirection = 'right';
      } else {
        tiltAmount = _.max([this.previousTiltAmount - tiltVelocity, minTilt]);
      }
    } else {
      tiltAmount = _.max([this.previousTiltAmount - tiltVelocity, minTilt]);
    }
    if (tiltAmount === 0) {
      tiltDirection = null;
    }
    const skisScaleX =
      maxSkisScale * (1 - tiltAmount) + minSkisScale * tiltAmount;
    this.leftSki.setScale(skisScaleX, maxSkisScale);
    this.rightSki.setScale(skisScaleX, maxSkisScale);
    this.previousTiltAmount = tiltAmount;
    this.previousTiltDirection = tiltDirection;
  }

  drawReferenceObjects() {
    const closestBelow =
      Math.floor(this.skiPlayer.y / this.refDistance) * this.refDistance;
    const closestLeft =
      Math.floor(this.skiPlayer.x / this.refDistance) * this.refDistance;
    const needNewRefs =
      this.refArrows[0].x !== closestLeft ||
      this.refArrows[0].y !== closestBelow;
    if (needNewRefs) {
      const closestRight = closestLeft + this.refDistance;
      const closestAbove = closestBelow + this.refDistance;
      this.refArrows[0].setPosition(closestLeft, closestBelow);
      this.refArrows[1].setPosition(closestLeft, closestAbove);
      this.refArrows[2].setPosition(closestRight, closestBelow);
      this.refArrows[3].setPosition(closestRight, closestAbove);
    }
  }

  crash() {
    this.isCrashed = true;
    this.skiPlayer.body.setVelocity(0);
    this.skiPlayer.body.setAcceleration(0);
    this.leftSki.destroy();
    this.rightSki.destroy();
    this.crashedSkis = this.add.sprite(0, 0, 'crashedSkis');
    this.skiPlayer.add(this.crashedSkis);
    this.edgeSnowEmitter.setScale({ start: 1, end: 0 });
    this.edgeSnowEmitter.setAngle({ min: 0, max: 360 });
    this.edgeSnowEmitter.setLifespan(750);
    this.edgeSnowEmitter.setSpeed(150);
    this.edgeSnowEmitter.explode(30, 0, 0);
    this.cameras.main.shake(300, 0.07);
    this.events.emit('crash');
  }
}

export default MountainSlope;
