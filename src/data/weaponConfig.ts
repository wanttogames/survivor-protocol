import type { TranslationKey } from '../i18n';
export const WEAPON_IDS = ['arc-bolt', 'rosary', 'exorcism-bell', 'lightning-sword', 'ghost-arrow', 'hellfire'] as const;
export type BaseWeaponId = typeof WEAPON_IDS[number];
export const EVOLVED_WEAPON_IDS = ["thunder-talisman", "vajra-rosary", "soul-bell", "thunder-god-sword", "demon-slayer-bow", "infernal-hellfire"] as const;
export type EvolvedWeaponId = typeof EVOLVED_WEAPON_IDS[number];
export type WeaponId = BaseWeaponId | EvolvedWeaponId;
export interface WeaponStats {
    damage: number;
    cooldown: number;
    projectileCount: number;
    range: number;
    duration: number;
    pierce: number;
    radius: number;
    speed: number;
}
export interface WeaponDefinition {
    id: WeaponId;
    baseWeaponId?: BaseWeaponId;
    nameKey: TranslationKey;
    descriptionKey: TranslationKey;
    stepKeys: readonly TranslationKey[];
    maxLevel: number;
    levels: readonly WeaponStats[];
}
const levels = (base: WeaponStats, changes: Partial<WeaponStats>[]): WeaponStats[] => {
    let current = base;
    return [base, ...changes.map(change => (current = { ...current, ...change }))];
};
const make = (id: WeaponId, key: string, values: WeaponStats[]): WeaponDefinition => ({
    id, nameKey: `weapon.${key}.name` as TranslationKey,
    descriptionKey: `weapon.${key}.description` as TranslationKey,
    stepKeys: [1, 2, 3, 4, 5].map(i => `weapon.${key}.level${i}` as TranslationKey),
    maxLevel: 5, levels: values,
});
/** Seconds / world pixels. Talisman damage & cooldown are multipliers of existing player stats. */
export const WEAPONS: Record<WeaponId, WeaponDefinition> = {
    'thunder-talisman': { id: 'thunder-talisman', baseWeaponId: 'arc-bolt', nameKey: 'evolution.thunder-talisman.name', descriptionKey: 'evolution.thunder-talisman.description', stepKeys: [], maxLevel: 1, levels: [{ "damage": 2, "cooldown": 0.72, "projectileCount": 2, "range": 780, "duration": 1.8, "pierce": 2, "radius": 5, "speed": 1.15 }] },
    'vajra-rosary': { id: 'vajra-rosary', baseWeaponId: 'rosary', nameKey: 'evolution.vajra-rosary.name', descriptionKey: 'evolution.vajra-rosary.description', stepKeys: [], maxLevel: 1, levels: [{ "damage": 36, "cooldown": 0.38, "projectileCount": 6, "range": 112, "duration": 0, "pierce": 0, "radius": 15, "speed": 3.3 }] },
    'soul-bell': { id: 'soul-bell', baseWeaponId: 'exorcism-bell', nameKey: 'evolution.soul-bell.name', descriptionKey: 'evolution.soul-bell.description', stepKeys: [], maxLevel: 1, levels: [{ "damage": 67, "cooldown": 1.65, "projectileCount": 1, "range": 295, "duration": 0.5, "pierce": 0, "radius": 295, "speed": 0 }] },
    'thunder-god-sword': { id: 'thunder-god-sword', baseWeaponId: 'lightning-sword', nameKey: 'evolution.thunder-god-sword.name', descriptionKey: 'evolution.thunder-god-sword.description', stepKeys: [], maxLevel: 1, levels: [{ "damage": 120, "cooldown": 1.5, "projectileCount": 2, "range": 290, "duration": 0.3, "pierce": 0, "radius": 0, "speed": 0 }] },
    'demon-slayer-bow': { id: 'demon-slayer-bow', baseWeaponId: 'ghost-arrow', nameKey: 'evolution.demon-slayer-bow.name', descriptionKey: 'evolution.demon-slayer-bow.description', stepKeys: [], maxLevel: 1, levels: [{ "damage": 67, "cooldown": 1.1, "projectileCount": 4, "range": 1200, "duration": 1.5, "pierce": 14, "radius": 3, "speed": 1200 }] },
    'infernal-hellfire': { id: 'infernal-hellfire', baseWeaponId: 'hellfire', nameKey: 'evolution.infernal-hellfire.name', descriptionKey: 'evolution.infernal-hellfire.description', stepKeys: [], maxLevel: 1, levels: [{ "damage": 24, "cooldown": 3.8, "projectileCount": 3, "range": 600, "duration": 5.2, "pierce": 0, "radius": 138, "speed": 0 }] },
    'arc-bolt': make('arc-bolt', 'talisman', levels({ damage: 1, cooldown: 1, projectileCount: 0, range: 780, duration: 1.8, pierce: 0, radius: 5, speed: 1 }, [
        { damage: 1.2 }, { projectileCount: 1 }, { cooldown: .85 }, { damage: 1.4, pierce: 1 },
    ])),
    rosary: make('rosary', 'rosary', levels({ damage: 13, cooldown: .45, projectileCount: 2, range: 68, duration: 0, pierce: 0, radius: 11, speed: 2.5 }, [
        { damage: 18 }, { projectileCount: 3 }, { range: 86, speed: 3 }, { projectileCount: 4, damage: 23 },
    ])),
    'exorcism-bell': make('exorcism-bell', 'bell', levels({ damage: 30, cooldown: 2.8, projectileCount: 1, range: 150, duration: .42, pierce: 0, radius: 150, speed: 0 }, [
        { damage: 40 }, { range: 195, radius: 195 }, { cooldown: 2.2 }, { damage: 52, range: 230, radius: 230 },
    ])),
    'lightning-sword': make('lightning-sword', 'lightningSword', levels({ damage: 54, cooldown: 2.1, projectileCount: 1, range: 175, duration: .24, pierce: 0, radius: 0, speed: 0 }, [
        { damage: 72 }, { range: 220 }, { cooldown: 1.65 }, { projectileCount: 2, damage: 84 },
    ])),
    'ghost-arrow': make('ghost-arrow', 'ghostArrow', levels({ damage: 30, cooldown: 1.25, projectileCount: 1, range: 1000, duration: 1.25, pierce: 2, radius: 3, speed: 920 }, [
        { damage: 40 }, { pierce: 4 }, { projectileCount: 2 }, { damage: 50, pierce: 6 },
    ])),
    hellfire: make('hellfire', 'hellfire', levels({ damage: 11, cooldown: 3.8, projectileCount: 1, range: 560, duration: 2.4, pierce: 0, radius: 72, speed: 0 }, [
        { damage: 15 }, { radius: 94 }, { duration: 3.4 }, { projectileCount: 2 },
    ])),
};
export const WEAPON_RULES = {
    slots: 6, talismanSpread: .13, targetRetry: .08, rosaryScan: .05, hellfireTick: .4,
    swordHalfAngle: Math.PI * .3, swordEchoAngle: Math.PI * .45,
    arrowSpread: .065, hellfireSeparation: 125, maxFields: 4,
};
export function weaponDescriptionParams(id: WeaponId, nextLevel: number) {
    const s = WEAPONS[id].levels[Math.min(WEAPONS[id].levels.length - 1, Math.max(0, nextLevel - 1))];
    return { damage: s.damage, damagePercent: Math.round((s.damage - 1) * 100), cooldownPercent: Math.round((1 - s.cooldown) * 100), cooldown: s.cooldown, count: s.projectileCount, range: s.range, radius: s.radius, duration: s.duration, pierce: s.pierce };
}
export const EVOLUTION_EFFECTS = { chainRange: 150, chainTargets: 3, chainDamage: .45, explosionRadius: 84, explosionDamage: .4, explosionsPerCast: 3, echoDelay: .3, echoDamage: .7, infernalTick: .3, maxFields: 8, visualPool: 12, visualLifetime: .2 };
export function baseWeaponId(id: WeaponId): BaseWeaponId { return WEAPONS[id].baseWeaponId ?? id as BaseWeaponId; }
