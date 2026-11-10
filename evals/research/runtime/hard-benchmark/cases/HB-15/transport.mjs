export class Wire {
  constructor() {
    this.sent = [];
  }
  send(entries) {
    this.sent.push(...entries.map(({ id, deadline }) => ({ id, deadline })));
    return entries.map((x) => x.id);
  }
}
