import { WEAPON_UPGRADES } from "../data/weaponUpgrades";
import type { WeaponLoadout } from "../weapons/WeaponLoadout";
import { BALANCE, type PlayerStats } from "../config/balance";
import { UPGRADES, type UpgradeDefinition, type Rarity, } from "../data/upgrades";
export interface UpgradeChoice {
    definition: UpgradeDefinition;
    rarity: Rarity;
}
export class UpgradeSystem {
    levels: Record<string, number> = {};
    constructor(private random: () => number = Math.random, readonly loadout?: WeaponLoadout) { }
    currentLevel(definition: UpgradeDefinition) { return definition.weaponId ? this.loadout?.level(definition.weaponId) ?? 0 : this.levels[definition.id] ?? 0; }
    roll(): UpgradeChoice[] {
        const pool = [...UPGRADES.filter((u) => (this.levels[u.id] ?? 0) < u.maxLevel), ...WEAPON_UPGRADES.filter(u => u.weaponId && this.loadout?.canUpgrade(u.weaponId))];
        const choices: UpgradeChoice[] = [];
        while (choices.length < 3 && pool.length) {
            const i = Math.floor(this.random() * pool.length);
            const definition = pool.splice(i, 1)[0];
            const r = this.random() * 100;
            choices.push({
                definition,
                rarity: definition.weaponId ? "Common" : r < BALANCE.rarity.Common
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
        if (c.definition.weaponId) {
            if (this.loadout?.upgrade(c.definition.weaponId))
                this.levels[c.definition.id] = this.loadout.level(c.definition.weaponId);
            return;
        }
        if ((this.levels[c.definition.id] ?? 0) >= c.definition.maxLevel)
            return;
        c.definition.apply(s, BALANCE.rarityMultiplier[c.rarity]);
        this.levels[c.definition.id] = (this.levels[c.definition.id] ?? 0) + 1;
    }
}
