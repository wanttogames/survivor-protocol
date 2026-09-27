import { requiredExp } from "../config/balance";
export class LevelSystem {
  level = 1;
  xp = 0;
  pending = 0;
  get required() {
    return requiredExp(this.level);
  }
  add(amount: number) {
    this.xp += amount;
    while (this.xp >= this.required) {
      this.xp -= this.required;
      this.level++;
      this.pending++;
    }
  }
  consume() {
    if (this.pending > 0) {
      this.pending--;
      return true;
    }
    return false;
  }
}
