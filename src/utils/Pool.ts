export interface Poolable {
  active: boolean;
}
export class Pool<T extends Poolable> {
  readonly items: T[] = [];
  constructor(
    private create: () => T,
    readonly capacity: number,
  ) {}
  acquire(): T | undefined {
    for (const item of this.items) if (!item.active) return item;
    if (this.items.length >= this.capacity) return;
    const item = this.create();
    this.items.push(item);
    return item;
  }
}
