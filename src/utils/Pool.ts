export interface Poolable {
  active: boolean;
  poolEligible?: boolean;
}
export class Pool<T extends Poolable> {
  readonly items: T[] = [];
  constructor(
    private create: () => T,
    readonly capacity: number,
    private activeLimit?: () => number,
  ) {}
  acquire(): T | undefined {
    if (this.activeLimit) {
      let active=0;
      let reusable:T|undefined;
      for(const item of this.items) {
        if(item.active)active++;
        else if(!reusable && item.poolEligible !== false)reusable=item;
      }
      if(active>=this.activeLimit())return;
      if(reusable)return reusable;
    } else for (const item of this.items) if (!item.active && item.poolEligible !== false) return item;
    if (this.items.length >= this.capacity) return;
    const item = this.create();
    this.items.push(item);
    return item;
  }
}
