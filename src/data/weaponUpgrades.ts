import { WEAPON_IDS, WEAPONS } from './weaponConfig';
import type { UpgradeDefinition } from './upgrades';
/** Weapon cards have fixed progression, so rarity never promises an unimplemented multiplier. */
export const WEAPON_UPGRADES: UpgradeDefinition[] = WEAPON_IDS.map(id => ({
    id: `weapon:${id}`, weaponId: id, nameKey: WEAPONS[id].nameKey, descriptionKey: WEAPONS[id].descriptionKey,
    descriptionParams: () => ({}), icon: '', maxLevel: WEAPONS[id].maxLevel, apply: () => { },
}));
