import type { SaveStorage } from '../characters/CharacterUnlockManager';
import { BALANCE, type PlayerStats } from '../config/balance';
export const META_CONFIG = { coinsPerMinute: 12, eliteCoins: 8, bossCoins: 35, victoryCoins: 100, scholarDuration: 120 } as const;
export const META_KEY = 'survivor-protocol.village.v1';
export const TRAINING = {
  vitality: { costs: [80, 160, 280], perLevel: .03 },
  gathering: { costs: [60, 120, 220], perLevel: .05 },
  footwork: { costs: [100, 200, 320], perLevel: .02 },
} as const;
export type TrainingId = keyof typeof TRAINING;
export const CHARMS = { guardian: 180, summoning: 120, stride: 160, scholar: 220, breaker: 240 } as const;
export type CharmId = keyof typeof CHARMS;
export interface MetaSave {
  version: 1; coins: number; training: Record<TrainingId, number>;
  unlocked: CharmId[]; equipped: CharmId | null; settled: string[];
}
export interface RunPerformance { time: number; eliteKills: number; bossKills: number; won: boolean }
const integer = (v: unknown, max = 1_000_000_000) => typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(0, Math.floor(v))) : 0;
export function coinReward(run: RunPerformance) {
  const time = integer(run.time, BALANCE.duration);
  // No participation bonus: a sub-minute run earns nothing without an encounter kill.
  return Math.floor(time / 60) * META_CONFIG.coinsPerMinute + integer(run.eliteKills, 100) * META_CONFIG.eliteCoins + integer(run.bossKills, 10) * META_CONFIG.bossCoins + (run.won ? META_CONFIG.victoryCoins : 0);
}
export class MetaProgression {
  private save: MetaSave = { version: 1, coins: 0, training: { vitality: 0, gathering: 0, footwork: 0 }, unlocked: [], equipped: null, settled: [] };
  constructor(private storage?: SaveStorage) {
    try {
      const raw = JSON.parse(storage?.getItem(META_KEY) ?? 'null');
      if (raw?.version !== 1) return;
      this.save.coins = integer(raw.coins);
      for (const id of Object.keys(TRAINING) as TrainingId[]) this.save.training[id] = integer(raw.training?.[id], 3);
      this.save.unlocked = (Object.keys(CHARMS) as CharmId[]).filter(id => Array.isArray(raw.unlocked) && raw.unlocked.includes(id));
      this.save.equipped = this.save.unlocked.includes(raw.equipped) ? raw.equipped : null;
      this.save.settled = Array.isArray(raw.settled) ? raw.settled.filter((id: unknown) => typeof id === 'string').slice(-32) : [];
    } catch { /* Corrupt/disabled storage never blocks gameplay. */ }
  }
  get state(): MetaSave { return structuredClone(this.save); }
  private persist() { try { this.storage?.setItem(META_KEY, JSON.stringify(this.save)); } catch { /* Continue in memory when browser storage is unavailable. */ } }
  settle(id: string, run: RunPerformance) {
    if (this.save.settled.includes(id)) return 0;
    const earned = coinReward(run);
    this.save.coins = integer(this.save.coins + earned);
    this.save.settled = [...this.save.settled, id].slice(-32);
    this.persist(); return earned;
  }
  train(id: TrainingId) {
    const level = this.save.training[id];
    const cost = TRAINING[id].costs[level];
    if (cost === undefined || this.save.coins < cost) return false;
    this.save.coins -= cost; this.save.training[id]++; this.persist(); return true;
  }
  unlock(id: CharmId) {
    if (this.save.unlocked.includes(id) || this.save.coins < CHARMS[id]) return false;
    this.save.coins -= CHARMS[id]; this.save.unlocked.push(id); this.persist(); return true;
  }
  equip(id: CharmId | null) {
    if (id !== null && !this.save.unlocked.includes(id)) return false;
    this.save.equipped = id; this.persist(); return true;
  }
  snapshot() { return new StartingBenefits(this.save); }
}
export class StartingBenefits {
  readonly hp: number; readonly pickup: number; readonly speed: number;
  readonly bossDamage: number; readonly scholar: boolean; shield: boolean;
  constructor(save: MetaSave) {
    this.hp = (1 + save.training.vitality * TRAINING.vitality.perLevel) * (save.equipped === 'guardian' ? 1.1 : 1);
    this.pickup = (1 + save.training.gathering * TRAINING.gathering.perLevel) * (save.equipped === 'summoning' ? 1.2 : 1);
    this.speed = (1 + save.training.footwork * TRAINING.footwork.perLevel) * (save.equipped === 'stride' ? 1.05 : 1);
    this.bossDamage = save.equipped === 'breaker' ? 1.05 : 1;
    this.scholar = save.equipped === 'scholar'; this.shield = save.equipped === 'guardian';
  }
  apply(stats: PlayerStats) { stats.maxHp *= this.hp; stats.hp = Math.min(stats.maxHp, stats.hp * this.hp); stats.pickupRadius *= this.pickup; stats.moveSpeed *= this.speed; }
  xpMultiplier(elapsed: number) { return this.scholar && elapsed < META_CONFIG.scholarDuration ? 1.1 : 1; }
  absorbHit() { if (!this.shield) return false; this.shield = false; return true; }
}
let instance: MetaProgression | undefined;
export function getMetaProgression() {
  if (!instance) { let storage: SaveStorage | undefined; try { storage = globalThis.localStorage; } catch { /* optional persistence */ } instance = new MetaProgression(storage); }
  return instance;
}
