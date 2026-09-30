import {WEAPONS,WEAPON_RULES} from './weaponConfig';
// Compatibility for the original HUD/combat API; numbers live in weaponConfig.
export const ARC_BOLT = {
  nameKey: WEAPONS['arc-bolt'].nameKey,
  range: WEAPONS['arc-bolt'].levels[0].range,
  lifetime: WEAPONS['arc-bolt'].levels[0].duration,
  spread: WEAPON_RULES.talismanSpread,
};
