export const run = ({ transports, signals }) => Promise.allSettled(transports.map((t, i) => t.open({ signal: signals[i] })));
