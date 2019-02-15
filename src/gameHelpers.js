export const publicURL = path => {
  return `${process.env.PUBLIC_URL}${path}`;
};

export const smallestAngleDifference = (a, b) => {
  return Math.atan2(Math.sin(a - b), Math.cos(a - b));
};
