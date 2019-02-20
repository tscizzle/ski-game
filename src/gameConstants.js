import _ from 'lodash';

export const GAME_WIDTH = _.max([window.innerWidth - 6, 1200]);
export const GAME_HEIGHT = _.max([window.innerHeight - 6, 800]);
export const GAME_PADDING = 45;

export const VECTOR_COLORS = {
  rotationArrowColor: 0x3388aa,
  velocityArrowColor: 0x33aa00,
};
