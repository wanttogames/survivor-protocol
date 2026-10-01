import { TALISMAN_CONFIG } from './talismanConfig';
import type { TranslationKey } from '../i18n';
export type TalismanEffectType =
  | 'enemyMaxCountMultiplier' | 'enemyMoveSpeedMultiplier' | 'enemyDamageMultiplier'
  | 'enemyHpMultiplier' | 'xpMultiplier' | 'playerDamageMultiplier'
  | 'playerMoveSpeedMultiplier' | 'attackSpeedMultiplier' | 'bossDamageMultiplier'
  | 'playerMaxHpMultiplier' | 'eliteRewardMultiplier' | 'upgradeRarityBonus' | 'extraEliteCount';
export interface TalismanEffect { type: TalismanEffectType; value: number }
export interface TalismanDefinition {
  id: string; nameKey: TranslationKey; symbol: string; riskLevel: number;
  curses: readonly TalismanEffect[]; rewards: readonly TalismanEffect[];
}
export const TALISMANS: readonly TalismanDefinition[] = [
  { id: 'samdo', nameKey: 'talisman.names.samdo', symbol: '三', riskLevel: 3,
    curses: [{type:'enemyMaxCountMultiplier',value:1.25},{type:'enemyMoveSpeedMultiplier',value:1.1}],
    rewards: [{type:'xpMultiplier',value:1.35}] },
  { id: 'gate', nameKey: 'talisman.names.gate', symbol: '鬼', riskLevel: 3,
    curses: [{type:'enemyDamageMultiplier',value:1.2}],
    rewards: [{type:'playerDamageMultiplier',value:1.25},{type:'bossDamageMultiplier',value:1.1}] },
  { id: 'hunger', nameKey: 'talisman.names.hunger', symbol: '餓', riskLevel: 4,
    curses: [{type:'enemyHpMultiplier',value:1.3}],
    rewards: [{type:'xpMultiplier',value:1.4},{type:'eliteRewardMultiplier',value:1.3}] },
  { id: 'trick', nameKey: 'talisman.names.trick', symbol: '妖', riskLevel: 2,
    curses: [{type:'enemyMoveSpeedMultiplier',value:1.15}],
    rewards: [{type:'playerMoveSpeedMultiplier',value:1.12},{type:'attackSpeedMultiplier',value:1.1}] },
  { id: 'reaper', nameKey: 'talisman.names.reaper', symbol: '死', riskLevel: 5,
    curses: [{type:'playerMaxHpMultiplier',value:.7}],
    rewards: [{type:'playerDamageMultiplier',value:1.4},{type:'bossDamageMultiplier',value:1.2}] },
  { id: 'moon', nameKey: 'talisman.names.moon', symbol: '赤', riskLevel: 4,
    curses: [{type:'enemyMaxCountMultiplier',value:1.35},{type:'extraEliteCount',value:1}],
    rewards: [{type:'upgradeRarityBonus',value:1},{type:'xpMultiplier',value:1.2}] },
];
export type TalismanModifiers = Record<TalismanEffectType, number>;
export const neutralModifiers = (): TalismanModifiers => ({
  enemyMaxCountMultiplier:1,enemyMoveSpeedMultiplier:1,enemyDamageMultiplier:1,enemyHpMultiplier:1,
  xpMultiplier:1,playerDamageMultiplier:1,playerMoveSpeedMultiplier:1,attackSpeedMultiplier:1,
  bossDamageMultiplier:1,playerMaxHpMultiplier:1,eliteRewardMultiplier:1,upgradeRarityBonus:0,extraEliteCount:0,
});
export const effectParams = (e:TalismanEffect) => ({rare:TALISMAN_CONFIG.rarityBonus.rareIncrease*e.value,epic:TALISMAN_CONFIG.rarityBonus.epicIncrease*e.value,value: e.type === 'extraEliteCount' ? e.value : Math.round((e.value-1)*100)});
