import type { TranslationKey } from '../i18n';
export const WEAPON_IDS = ['arc-bolt', 'rosary', 'exorcism-bell', 'lightning-sword', 'ghost-arrow', 'hellfire'] as const;
export type WeaponId = typeof WEAPON_IDS[number];
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
    const s = WEAPONS[id].levels[Math.min(4, Math.max(0, nextLevel - 1))];
    return { damage: s.damage, damagePercent: Math.round((s.damage - 1) * 100), cooldownPercent: Math.round((1 - s.cooldown) * 100), cooldown: s.cooldown, count: s.projectileCount, range: s.range, radius: s.radius, duration: s.duration, pierce: s.pierce };
}
