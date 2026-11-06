export const run = ({ optionalTransport, essentialTransport }) => ({ optional: { run: (signal) => optionalTransport.run(signal) }, essential: { run: (signal) => essentialTransport.run(signal) } });
