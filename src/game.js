import Phaser from 'phaser';

import { GAME_WIDTH, GAME_HEIGHT } from 'gameConstants';
import MountainSlope from 'gameScenes/mountainSlope';
import VectorLegend from 'gameScenes/vectorLegend';
import SkiTiltDisplay from 'gameScenes/skiTiltDisplay';
import ResetButton from 'gameScenes/resetButton';

export const initializeGame = ({ parent }) => {
  const gameConfig = {
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    scene: [MountainSlope, VectorLegend, SkiTiltDisplay, ResetButton],
    physics: {
      default: 'arcade',
    },
    type: Phaser.AUTO,
    parent,
  };
  const game = new Phaser.Game(gameConfig);
  return game;
};
