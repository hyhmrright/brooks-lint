export class Queue {
  constructor() {
    this.entries = [];
    this.generations = new Map();
    this.nextGeneration = 0;
  }
  put(item) {
    const generation = ++this.nextGeneration;
    this.generations.set(item.id, generation);
    this.entries.push({ ...item, generation });
    return { id: item.id, generation };
  }
  cancel(token) {
    if (this.generations.get(token.id) === token.generation)
      this.generations.delete(token.id);
  }
  take() {
    const items = this.entries.filter(
      (item) => this.generations.get(item.id) === item.generation,
    );
    this.entries = [];
    for (const item of items) this.generations.delete(item.id);
    return items;
  }
}
