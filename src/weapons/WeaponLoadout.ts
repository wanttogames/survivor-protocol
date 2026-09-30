import { WEAPONS, WEAPON_RULES, type WeaponId } from '../data/weaponConfig';
/** Run-owned progression; contains no Phaser objects and resets on Retry. */
export class WeaponLoadout {
    private levels = new Map<WeaponId, number>([['arc-bolt', 1]]);
    revision = 0;
    constructor(readonly slots: number = WEAPON_RULES.slots) { }
    get size() { return this.levels.size; }
    level(id: WeaponId) { return this.levels.get(id) ?? 0; }
    canUpgrade(id: WeaponId) { return this.level(id) < WEAPONS[id].maxLevel && (this.level(id) > 0 || this.size < this.slots); }
    upgrade(id: WeaponId) {
        if (!this.canUpgrade(id))
            return false;
        this.levels.set(id, this.level(id) + 1);
        this.revision++;
        return true;
    }
    entries() { return this.levels.entries(); }
    stats(id: WeaponId) { return WEAPONS[id].levels[Math.max(0, this.level(id) - 1)]; }
}
