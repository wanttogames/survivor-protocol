import type { PlayerStats } from '../config/balance';
import { TALISMAN_CONFIG as C } from './talismanConfig';
import { TALISMANS, neutralModifiers, type TalismanDefinition, type TalismanModifiers } from './talismanDefinitions';
/** One run's decisions and cached multipliers. No permanent storage or per-frame stat reduction. */
export class TalismanSession {
  readonly acceptedIds: string[] = [];
  readonly rejectedIds: string[] = [];
  modifiers = neutralModifiers();
  offered?: TalismanDefinition;
  private nextEvent = 0;
  private pending = 0;
  constructor(private random = Math.random, private times = C.eventTimes, private definitions = TALISMANS) {}
  update(elapsed:number) {
    while (this.nextEvent < this.times.length && elapsed >= this.times[this.nextEvent]) {
      this.nextEvent++; this.pending++;
    }
  }
  trigger() { if (this.remaining.length && !this.offered) this.pending++; }
  get remaining() { return this.definitions.filter(d => !this.acceptedIds.includes(d.id) && !this.rejectedIds.includes(d.id)); }
  get ready() { return this.pending > 0 && this.remaining.length > 0 && !this.offered; }
  offer(id?:string) {
    if (this.offered || !this.ready) return;
    const pool=this.remaining;
    const d=id ? pool.find(d=>d.id===id) : pool[Math.min(pool.length-1,Math.floor(this.random()*pool.length))];
    if (!d) return;
    this.pending--; this.offered=d; return d;
  }
  decide(accept:boolean) {
    const d=this.offered;
    if (!d) return;
    this.offered=undefined;
    (accept ? this.acceptedIds : this.rejectedIds).push(d.id);
    if (accept) {
      const m={...this.modifiers};
      for (const e of [...d.curses,...d.rewards]) {
        if (e.type==='upgradeRarityBonus' || e.type==='extraEliteCount') m[e.type]+=e.value;
        else m[e.type]*=e.value;
      }
      for (const k of Object.keys(C.caps) as (keyof typeof C.caps)[]) m[k]=Math.min(C.caps[k],m[k]);
      this.modifiers=m;
    }
    return d;
  }
}
/** Apply only the change in cached factors, retaining character passives and upgrades. */
export function applyPlayerTalismanDelta(stats:PlayerStats, before:TalismanModifiers, after:TalismanModifiers) {
  stats.damage*=after.playerDamageMultiplier/before.playerDamageMultiplier;
  stats.moveSpeed*=after.playerMoveSpeedMultiplier/before.playerMoveSpeedMultiplier;
  stats.attackSpeed*=after.attackSpeedMultiplier/before.attackSpeedMultiplier;
  stats.maxHp=Math.max(1,stats.maxHp*after.playerMaxHpMultiplier/before.playerMaxHpMultiplier);
  stats.hp=Math.min(stats.hp,stats.maxHp);
}
