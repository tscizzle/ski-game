import _ from 'lodash';
import Phaser from 'phaser';

const gameOptions = {};
const gameObjects = {};

class PlayGame extends Phaser.Scene {
  constructor() {
    super('PlayGame');
  }

  preload() {
    this.load.image('skis', this.publicURL('gameAssets/images/skis.png'));
  }

  create() {
    console.log('this', this);
    gameObjects.camera = _.first(this.cameras.cameras);
    console.log(gameObjects.camera);
    gameObjects.camera.setBackgroundColor(0xddeeff);
    this.skis = this.add.sprite(100, 100, 'skis');
  }

  update() {}

  /* HELPERS */

  publicURL(path) {
    return `${process.env.PUBLIC_URL}${path}`;
  }
}

export const initializeGame = () => {
  const gameConfig = {
    type: Phaser.CANVAS,
    width: 800,
    height: 800,
    scene: [PlayGame],
  };
  const game = new Phaser.Game(gameConfig);
  return game;
};
