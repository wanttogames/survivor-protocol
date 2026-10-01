/** Raw stored EXP; the existing run XP multiplier applies once at pickup. */
export const SOUL_CONFIG = {
  tiers: [
    {min:0,texture:'orb',scale:1},
    {min:10,texture:'orb-medium',scale:1.15},
    {min:30,texture:'orb-large',scale:1.3},
    {min:100,texture:'orb-great',scale:1.45},
  ],
} as const;
export function soulTier(value:number) {
  for(let i=SOUL_CONFIG.tiers.length-1;i>0;i--)if(value>=SOUL_CONFIG.tiers[i].min)return i;
  return 0;
}
