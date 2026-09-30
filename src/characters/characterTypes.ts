import type { TranslationKey } from '../i18n';
import type { WeaponId } from '../data/weaponConfig';
import type { PlayerStats } from '../config/balance';
export type CharacterId = 'exorcist' | 'shaman' | 'warrior' | 'archer' | 'monk' | 'forbidden_sorcerer';
export type UnlockCondition = {
    type: 'default';
} | {
    type: 'souls' | 'runKills' | 'survival';
    target: number;
} | {
    type: 'weaponLevel' | 'weaponKills';
    weaponId: WeaponId;
    target: number;
};
export interface CharacterDefinition {
    id: CharacterId;
    nameKey: TranslationKey;
    descriptionKey: TranslationKey;
    passiveKey: TranslationKey;
    startingWeaponId: WeaponId;
    modifiers: Partial<Record<keyof PlayerStats, {
        multiply?: number;
        add?: number;
    }>>;
    unlock: UnlockCondition;
    unlockKey: TranslationKey;
    visual: {
        tint: number;
        accent: number;
        decoration: 'none' | 'ribbon' | 'armor' | 'bow' | 'beads' | 'seal';
    };
}
