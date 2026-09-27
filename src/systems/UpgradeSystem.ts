import { BALANCE, type PlayerStats } from "../config/balance";
import {
  UPGRADES,
  type UpgradeDefinition,
  type Rarity,
} from "../data/upgrades";
export interface UpgradeChoice {
  definition: UpgradeDefinition;
  rarity: Rarity;
}
export class UpgradeSystem {
  levels: Record<string, number> = {};
  constructor(private random: () => number = Math.random) {}
  roll(): UpgradeChoice[] {
    const pool = UPGRADES.filter((u) => (this.levels[u.id] ?? 0) < u.maxLevel);
    const choices: UpgradeChoice[] = [];
    while (choices.length < 3 && pool.length) {
      const i = Math.floor(this.random() * pool.length);
      const definition = pool.splice(i, 1)[0];
      const r = this.random() * 100;
      choices.push({
        definition,
        rarity:
          r < BALANCE.rarity.Common
            ? "Common"
            : r < BALANCE.rarity.Common + BALANCE.rarity.Rare
              ? "Rare"
              : "Epic",
      });
    }
    // All permanent upgrades exhausted: repeat the unlimited consumable to preserve three choices.
    while (choices.length < 3)
      choices.push({
        definition: UPGRADES.find((u) => u.id === "recovery")!,
        rarity: "Common",
      });
    return choices;
  }
  apply(c: UpgradeChoice, s: PlayerStats) {
    if ((this.levels[c.definition.id] ?? 0) >= c.definition.maxLevel) return;
    c.definition.apply(s, BALANCE.rarityMultiplier[c.rarity]);
    this.levels[c.definition.id] = (this.levels[c.definition.id] ?? 0) + 1;
  }
}
