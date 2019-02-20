import Phaser from 'phaser';

export const publicURL = path => {
  return `${process.env.PUBLIC_URL}${path}`;
};

export const mapValBetween = (min, max, val) => {
  /* Function to linearly map val=0 to min and val=1 to max */
  return (max - min) * val + min;
};

export const mapInfToOne = (n, stretch = 0.999) => {
  /* Function to map n=0 to 0 and n=infinity to 1
  > stretch should be between 0 and 1 and the higher it is, the slower the
  function grows to 1
  */
  return 1 - stretch ** n;
};

export const smallestAngleDifference = (a, b) => {
  return Math.atan2(Math.sin(a - b), Math.cos(a - b));
};

export const angleFromUp = (x, y) => {
  /* using Phaser's x and y axes (positive x is right, positive y is down), get
  the angle between the vector <x, y> and the straight up direction (the
  negative y axis) */
  return Math.atan2(x, -y);
};

export const makeArrow = ({ scene, start, end, color }) => {
  // compute shaft and head oriented straight up
  const arrowLength = Math.sqrt(
    (end.x - start.x) ** 2 + (end.y - start.y) ** 2
  );
  const preRotatedEnd = { x: start.x, y: start.y - arrowLength };
  const headSideLength = 12;
  const headAltitudeLength = headSideLength * Math.sin(Math.PI / 3);
  const shaft = new Phaser.Geom.Line(
    start.x,
    start.y,
    preRotatedEnd.x,
    preRotatedEnd.y + headAltitudeLength // the head covers the end of the shaft
  );
  const head = new Phaser.Geom.Triangle(
    end.x,
    end.y,
    end.x - headSideLength / 2,
    end.y + headAltitudeLength,
    end.x + headSideLength / 2,
    end.y + headAltitudeLength
  );
  // rotate the shaft and head
  const directionX = end.x - start.x;
  const directionY = end.y - start.y;
  const rotation = angleFromUp(directionX, directionY);
  Phaser.Geom.Triangle.RotateAroundPoint(head, end, rotation);
  Phaser.Geom.Line.RotateAroundPoint(shaft, start, rotation);
  // stroke the shaft and head
  const graphics = scene.add.graphics();
  graphics.setDefaultStyles({
    lineStyle: { width: 3, color },
    fillStyle: { color },
  });
  graphics.fillTriangleShape(head);
  graphics.strokeLineShape(shaft);
  return graphics;
};
