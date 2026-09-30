export interface PlayerStats {
  hp: number;
  maxHp: number;
  moveSpeed: number;
  damage: number;
  attackSpeed: number;
  projectileSpeed: number;
  projectileCount: number;
  pickupRadius: number;
  criticalChance: number;
  piercing: number;
  damageTakenMultiplier:number;
}
export const BALANCE = {
  duration: 600,
  worldSize: 3600,
  player: {
    hp: 100,
    maxHp: 100,
    moveSpeed: 235,
    damage: 22,
    attackSpeed: 2.2,
    projectileSpeed: 590,
    projectileCount: 1,
    pickupRadius: 105,
    criticalChance: 0.05,
    piercing: 0,
    damageTakenMultiplier:1,
  } satisfies PlayerStats,
  exp: { base: 8, growth: 1.24 },
  spawn: {
    initialInterval: 0.65,
    minInterval: 0.1,
    ramp: 500,
    hpPerMinute: 0.13,
    speedPerMinute: 0.018,
    runnerAt: 120,
    tankAt: 300,
  },
  limits: {
    enemies: 420,
    projectiles: 200,
    orbs: 600,
    damageTexts: 28,
    particles: 100,
  },
  contactInvulnerability: 0.65,
  criticalMultiplier: 2,
  orbSpeed: 470,
  rarity: { Common: 70, Rare: 25, Epic: 5 },
  rarityMultiplier: { Common: 1, Rare: 1.4, Epic: 1.9 },
  effects: {
    damage: 0.15,
    attackSpeed: 0.12,
    moveSpeed: 0.1,
    maxHp: 20,
    heal: 35,
    projectileCount: 1,
    projectileSpeed: 0.15,
    pickupRadius: 0.2,
    criticalChance: 0.07,
    piercing: 1,
  },
};
export const requiredExp = (level: number) =>
  Math.floor(BALANCE.exp.base * Math.pow(level, BALANCE.exp.growth));
