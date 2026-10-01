import { BALANCE } from '../config/balance';
export const TALISMAN_CONFIG = {
  eventTimes: [120, 300, 480] as readonly number[],
  caps: { enemyMoveSpeedMultiplier: 1.6, attackSpeedMultiplier: 2, enemyMaxCountMultiplier: 2 },
  // Absolute pooled-entity ceiling, including elites and the two boss objects.
  enemyHardLimit: 560,
  rarityBonus: { commonReduction: 15, rareIncrease: 10, epicIncrease: 5 },
};
export const talismanEnemyCapacity = () => Math.min(TALISMAN_CONFIG.enemyHardLimit, Math.ceil(BALANCE.limits.enemies * TALISMAN_CONFIG.caps.enemyMaxCountMultiplier));
