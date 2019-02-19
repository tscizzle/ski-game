import Phaser from 'phaser';

export const publicURL = path => {
  return `${process.env.PUBLIC_URL}${path}`;
};

export const mapInfToOne = (n, stretch = 0.999) => {
  /* Function to map 0 to 0 and infinity to 1
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

export const makeArrow = (start, end, scene) => {
  const graphics = scene.add.graphics();
  graphics.setDefaultStyles({
    lineStyle: { width: 2, color: 0x333333 },
    fillStyle: { color: 0x333333 },
  });
  const shaft = new Phaser.Geom.Line(start.x, start.y, end.x, end.y);
  graphics.strokeLineShape(shaft);
  const headSideLength = 10;
  const headAltitudeLength = headSideLength * Math.sin(Math.PI / 3);
  const head = new Phaser.Geom.Triangle(
    end.x,
    end.y,
    end.x - headSideLength / 2,
    end.y + headAltitudeLength,
    end.x + headSideLength / 2,
    end.y + headAltitudeLength
  );
  const directionX = end.x - start.x;
  const directionY = end.y - start.y;
  const headRotation = angleFromUp(directionX, directionY);
  Phaser.Geom.Triangle.RotateAroundPoint(head, end, headRotation);
  graphics.fillTriangleShape(head);
  return graphics;
};
