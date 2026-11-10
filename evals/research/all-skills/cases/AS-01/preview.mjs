export const preview = (cents, points) => cents - Math.floor(cents * (points >= 120 ? .1 : 0));
