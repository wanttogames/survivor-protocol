import type { BaseWeaponId } from '../../data/weaponConfig';
import type { WeaponLoadout } from '../WeaponLoadout';
import { WEAPON_EVOLUTIONS, type WeaponEvolutionDefinition } from './weaponEvolutionDefinitions';
/** Eligibility depends on owned cards, never character stats or permanent save data. */
export class WeaponEvolutionManager {
    constructor(private loadout: WeaponLoadout, private upgrades: Record<string, number>) { }
    isEvolved(base: BaseWeaponId) { return WEAPON_EVOLUTIONS.some(e => e.baseWeaponId === base && this.loadout.level(e.evolvedWeaponId) > 0); }
    canEvolve(base: BaseWeaponId) { const e = WEAPON_EVOLUTIONS.find(e => e.baseWeaponId === base); return !!e && !this.isEvolved(base) && this.loadout.level(base) >= e.requiredWeaponLevel && e.requiredUpgradeIds.every(id => (this.upgrades[id] ?? 0) > 0); }
    getAvailableEvolutions() { return WEAPON_EVOLUTIONS.filter(e => this.canEvolve(e.baseWeaponId)); }
    evolve(id: string) { const e = WEAPON_EVOLUTIONS.find(e => e.id === id); return !!e && this.canEvolve(e.baseWeaponId) && this.loadout.replaceWeapon(e.baseWeaponId, e.evolvedWeaponId); }
}
