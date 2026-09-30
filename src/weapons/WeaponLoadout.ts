import { WEAPONS, WEAPON_RULES, type WeaponId } from '../data/weaponConfig';
/** Run-owned progression; contains no Phaser objects and resets on Retry. */
export class WeaponLoadout {
    private levels: Map<WeaponId, number>;
    revision = 0;
    constructor(readonly slots: number = WEAPON_RULES.slots, startingWeapon: WeaponId = 'arc-bolt') { this.levels = new Map([[startingWeapon, 1]]); }
    get size() { return this.levels.size; }
    level(id: WeaponId) { return this.levels.get(id) ?? 0; }
    canUpgrade(id: WeaponId) { return !WEAPONS[id].baseWeaponId && !Array.from(this.levels.keys()).some(owned => WEAPONS[owned].baseWeaponId === id) && this.level(id) < WEAPONS[id].maxLevel && (this.level(id) > 0 || this.size < this.slots); }
    upgrade(id: WeaponId) {
        if (!this.canUpgrade(id))
            return false;
        this.levels.set(id, this.level(id) + 1);
        this.revision++;
        return true;
    }
    replaceWeapon(base: WeaponId, evolved: WeaponId) {
        if (this.level(base) < 5 || WEAPONS[evolved].baseWeaponId !== base || this.level(evolved) > 0)
            return false;
        this.levels = new Map(Array.from(this.levels, ([id, level]) => id === base ? [evolved, 1] : [id, level]));
        this.revision++;
        return true;
    }
    entries() { return this.levels.entries(); }
    stats(id: WeaponId) { return WEAPONS[id].levels[Math.max(0, this.level(id) - 1)]; }
}
