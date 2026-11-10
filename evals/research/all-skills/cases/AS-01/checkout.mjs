export const checkout = (cents, points) => cents - Math.floor(cents * (points >= 100 ? .1 : 0));
