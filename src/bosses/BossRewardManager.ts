import { BOSS_REWARDS } from '../encounters/encounterConfig';
import type { UpgradeChoice, UpgradeSystem } from '../systems/UpgradeSystem';
import type { LevelSystem } from '../systems/LevelSystem';
import type { PlayerStats } from '../config/balance';
import { WEAPON_UPGRADES } from '../data/weaponUpgrades';
/** A validated one-shot selection; no UI or Boss object dependencies. */
export class BossRewardManager {
    private offered: UpgradeChoice[] = [];
    constructor(private upgrades: UpgradeSystem, private levels: LevelSystem, private grantSouls: (amount: number) => void, private random = Math.random) { }
    getBossRewardOptions(stats: PlayerStats) {
        const pool: UpgradeChoice[] = [];
        const fixed = (id: 'heal' | 'damage' | 'souls', value: number, apply: (s: PlayerStats) => void): UpgradeChoice => ({ rarity: 'Epic', definition: { id: `boss:${id}`, bossRewardId: id, nameKey: `bossReward.${id}.name`, descriptionKey: `bossReward.${id}.description`, descriptionParams: () => ({ value }), icon: '', maxLevel: 1, apply: s => apply(s) } });
        if (stats.hp < stats.maxHp)
            pool.push(fixed('heal', BOSS_REWARDS.healFraction * 100, s => { s.hp = Math.min(s.maxHp, s.hp + s.maxHp * BOSS_REWARDS.healFraction); }));
        pool.push(fixed('damage', Math.round((BOSS_REWARDS.damageMultiplier - 1) * 100), s => { s.damage *= BOSS_REWARDS.damageMultiplier; }));
        const souls = Math.floor(this.levels.required * BOSS_REWARDS.soulLevels);
        pool.push(fixed('souls', souls, () => this.grantSouls(souls)));
        const weapons = WEAPON_UPGRADES.filter(d => d.weaponId && this.upgrades.loadout?.level(d.weaponId) && this.upgrades.loadout.canUpgrade(d.weaponId));
        if (weapons.length) {
            const d = weapons[Math.floor(this.random() * weapons.length)];
            pool.push({ rarity: 'Epic', definition: { ...d, bossRewardId: 'weapon' } });
        }
        const available = this.upgrades.evolutions?.getAvailableEvolutions() ?? [];
        const chosen: UpgradeChoice[] = [];
        if (available.length) {
            const e = available[Math.floor(this.random() * available.length)];
            chosen.push({ rarity: 'Epic', definition: { id: `evolution:${e.id}`, evolutionId: e.id, nameKey: e.nameKey, descriptionKey: e.descriptionKey, descriptionParams: () => ({}), icon: '', maxLevel: 1, apply: () => { } } });
        }
        // Keep three distinct reward types when all weapons are maxed. Healing is capped at maximum HP.
        if (pool.length + chosen.length < 3)
            pool.push(fixed('heal', BOSS_REWARDS.healFraction * 100, s => { s.hp = Math.min(s.maxHp, s.hp + s.maxHp * BOSS_REWARDS.healFraction); }));
        while (chosen.length < 3 && pool.length)
            chosen.push(pool.splice(Math.floor(this.random() * pool.length), 1)[0]);
        this.offered = chosen;
        return chosen;
    }
    applyBossReward(choice: UpgradeChoice, stats: PlayerStats) {
        if (!this.offered.includes(choice))
            return false;
        this.offered = [];
        if (choice.definition.weaponId || choice.definition.evolutionId)
            this.upgrades.apply(choice, stats);
        else
            choice.definition.apply(stats, 1);
        return true;
    }
}
