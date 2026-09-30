import type { EnemyKind } from '../data/enemies';
import type { TranslationKey } from '../i18n';
export type BossId = 'vengeful-general' | 'ghost-king';
export type EliteId = 'spirit-elite' | 'night-elite' | 'flesh-elite';
export interface EliteDefinition {
    id: EliteId;
    baseEnemyId: EnemyKind;
    hpMultiplier: number;
    damageMultiplier: number;
    speedMultiplier: number;
    sizeMultiplier: number;
    color: number;
    reward: {
        soulMultiplier: number;
        healChance: number;
        healFraction: number;
    };
}
export const ELITES: Record<EliteId, EliteDefinition> = {
    'spirit-elite': { id: 'spirit-elite', baseEnemyId: 'grunt', hpMultiplier: 8, damageMultiplier: 1.6, speedMultiplier: .95, sizeMultiplier: 1.4, color: 0xb69962, reward: { soulMultiplier: 16, healChance: .25, healFraction: .2 } },
    'night-elite': { id: 'night-elite', baseEnemyId: 'runner', hpMultiplier: 9, damageMultiplier: 1.7, speedMultiplier: 1.05, sizeMultiplier: 1.3, color: 0xac6964, reward: { soulMultiplier: 15, healChance: .25, healFraction: .2 } },
    'flesh-elite': { id: 'flesh-elite', baseEnemyId: 'tank', hpMultiplier: 6, damageMultiplier: 1.5, speedMultiplier: .9, sizeMultiplier: 1.4, color: 0xa887b0, reward: { soulMultiplier: 12, healChance: .25, healFraction: .2 } },
};
export interface BossDefinition {
    id: BossId;
    nameKey: TranslationKey;
    hp: number;
    speed: number;
    damage: number;
    scale: number;
    radius: number;
    texture: string;
    phaseAt: number;
    phaseHaste: number;
    slash?: {
        cooldown: number;
        windup: number;
        range: number;
        halfAngle: number;
        damage: number;
    };
    wave?: {
        cooldown: number;
        windup: number;
        radius: number;
        damage: number;
    };
    spirits?: {
        cooldown: number;
        windup: number;
        count: number;
        speed: number;
        damage: number;
        ttl: number;
        radius: number;
    };
    summon: {
        cooldown: number;
        count: number;
        radius: number;
    };
}
export const BOSSES: Record<BossId, BossDefinition> = {
    'vengeful-general': { id: 'vengeful-general', nameKey: 'boss.general.name', hp: 10000, speed: 67, damage: 22, scale: 1.25, radius: 35, texture: 'boss-general', phaseAt: 0, phaseHaste: 1,
        slash: { cooldown: 3.6, windup: .75, range: 215, halfAngle: Math.PI * .32, damage: 26 }, summon: { cooldown: 11, count: 4, radius: 140 } },
    'ghost-king': { id: 'ghost-king', nameKey: 'boss.king.name', hp: 110000, speed: 53, damage: 28, scale: 1.6, radius: 42, texture: 'boss-king', phaseAt: .5, phaseHaste: 1.28,
        wave: { cooldown: 5, windup: .95, radius: 155, damage: 30 }, spirits: { cooldown: 6.2, windup: .7, count: 8, speed: 145, damage: 18, ttl: 7, radius: 8 }, summon: { cooldown: 14, count: 2, radius: 260 } },
};
export const ENCOUNTER_CONFIG = { attackFlashDuration: .18, initialSlash: 2, initialWave: 2, initialSpirits: 4, initialSummon: 6, slashActivationMargin: 90, gateInitialDelay: .8, cameraMargin: 90, spawnDistance: 860, spawnMinDistance: 600, normalSpawnMultiplier: .6,
    reinforcedStrength: 1.45, announcementSeconds: 1.6, bulletCapacity: 32, gateCapacity: 3, gateLifetime: 7, gateInterval: 1.8, gateSpawnLimit: 3,
    healPickupCapacity: 8, healPickupLifetime: 35, healPickupRadius: 22, minionHpScale: 1.5, minionSpeedScale: 1.1,
    summonAliveLimit: 16, worldMargin: 70 };
export const BOSS_REWARDS = { healFraction: .4, damageMultiplier: 1.1, soulLevels: 1.5 };
export type EncounterDefinition = {
    id: string;
    timeRatio: number;
} & ({
    type: 'elite';
    eliteId: EliteId;
    strength: number;
} | {
    type: 'boss';
    bossId: BossId;
});
export const ENCOUNTERS: readonly EncounterDefinition[] = [
    { id: 'first-elite', timeRatio: .2, type: 'elite', eliteId: 'spirit-elite', strength: 1 },
    { id: 'mid-boss', timeRatio: .5, type: 'boss', bossId: 'vengeful-general' },
    { id: 'late-night-elite', timeRatio: .8, type: 'elite', eliteId: 'night-elite', strength: ENCOUNTER_CONFIG.reinforcedStrength },
    { id: 'late-flesh-elite', timeRatio: .8, type: 'elite', eliteId: 'flesh-elite', strength: ENCOUNTER_CONFIG.reinforcedStrength },
    { id: 'final-boss', timeRatio: 1, type: 'boss', bossId: 'ghost-king' },
];
