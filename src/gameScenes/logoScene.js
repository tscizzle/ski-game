import Phaser from 'phaser';

import { publicURL } from 'gameHelpers';

class LogoScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LogoScene', active: true });
  }

  /* MAIN PHASER METHODS */

  preload() {
    this.load.image('logo', publicURL('/gameAssets/images/simulatorLogo.png'));
  }

  create() {
    const logo = this.add.sprite(15, 15, 'logo');
    logo.setOrigin(0, 0);
    logo.setScale(0.5);
  }
}

export default LogoScene;
