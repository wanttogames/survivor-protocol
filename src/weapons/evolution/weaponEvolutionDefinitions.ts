import type { BaseWeaponId, EvolvedWeaponId } from '../../data/weaponConfig';
import type { TranslationKey } from '../../i18n';
export interface WeaponEvolutionDefinition {
    id: string;
    baseWeaponId: BaseWeaponId;
    evolvedWeaponId: EvolvedWeaponId;
    requiredWeaponLevel: number;
    requiredUpgradeIds: readonly string[];
    nameKey: TranslationKey;
    descriptionKey: TranslationKey;
}
export const WEAPON_EVOLUTIONS: readonly WeaponEvolutionDefinition[] = [
    { id: 'thunder-talisman', baseWeaponId: 'arc-bolt', evolvedWeaponId: 'thunder-talisman', requiredWeaponLevel: 5, requiredUpgradeIds: ['critical'], nameKey: 'evolution.thunder-talisman.name', descriptionKey: 'evolution.thunder-talisman.description' },
    { id: 'vajra-rosary', baseWeaponId: 'rosary', evolvedWeaponId: 'vajra-rosary', requiredWeaponLevel: 5, requiredUpgradeIds: ['vitality'], nameKey: 'evolution.vajra-rosary.name', descriptionKey: 'evolution.vajra-rosary.description' },
    { id: 'soul-bell', baseWeaponId: 'exorcism-bell', evolvedWeaponId: 'soul-bell', requiredWeaponLevel: 5, requiredUpgradeIds: ['rapid'], nameKey: 'evolution.soul-bell.name', descriptionKey: 'evolution.soul-bell.description' },
    { id: 'thunder-god-sword', baseWeaponId: 'lightning-sword', evolvedWeaponId: 'thunder-god-sword', requiredWeaponLevel: 5, requiredUpgradeIds: ['power'], nameKey: 'evolution.thunder-god-sword.name', descriptionKey: 'evolution.thunder-god-sword.description' },
    { id: 'demon-slayer-bow', baseWeaponId: 'ghost-arrow', evolvedWeaponId: 'demon-slayer-bow', requiredWeaponLevel: 5, requiredUpgradeIds: ['pierce'], nameKey: 'evolution.demon-slayer-bow.name', descriptionKey: 'evolution.demon-slayer-bow.description' },
    { id: 'infernal-hellfire', baseWeaponId: 'hellfire', evolvedWeaponId: 'infernal-hellfire', requiredWeaponLevel: 5, requiredUpgradeIds: ['magnet'], nameKey: 'evolution.infernal-hellfire.name', descriptionKey: 'evolution.infernal-hellfire.description' },
];
