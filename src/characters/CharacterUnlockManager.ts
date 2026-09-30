import { baseWeaponId } from '../data/weaponConfig';
import { CHARACTERS } from './characterDefinitions';
import type { CharacterDefinition, CharacterId } from './characterTypes';
import { WEAPON_IDS, type WeaponId } from '../data/weaponConfig';
export interface SaveStorage {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
}
export interface CharacterProgress {
    version: 1;
    totalSoulCollected: number;
    maxKillsInRun: number;
    maxSurvivalTime: number;
    weaponMaxLevels: Partial<Record<WeaponId, number>>;
    weaponKillCounts: Partial<Record<WeaponId, number>>;
    unlockedCharacters: CharacterId[];
}
export const PROGRESS_KEY = 'survivor-protocol.progress';
const fresh = (): CharacterProgress => ({ version: 1, totalSoulCollected: 0, maxKillsInRun: 0, maxSurvivalTime: 0, weaponMaxLevels: {}, weaponKillCounts: {}, unlockedCharacters: ['exorcist'] });
const number = (v: unknown) => typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(Number.MAX_SAFE_INTEGER, v)) : 0;
const record = (v: unknown): Record<string, unknown> => v && typeof v === 'object' && !Array.isArray(v) ? v as Record<string, unknown> : {};
export class CharacterUnlockManager {
    readonly progress: CharacterProgress;
    private dirty = false;
    private notifications: CharacterId[] = [];
    constructor(private storage?: SaveStorage) {
        this.progress = fresh();
        try {
            const saved = record(JSON.parse(storage?.getItem(PROGRESS_KEY) ?? 'null'));
            if (saved.version === 1) {
                this.progress.totalSoulCollected = number(saved.totalSoulCollected);
                this.progress.maxKillsInRun = Math.floor(number(saved.maxKillsInRun));
                this.progress.maxSurvivalTime = number(saved.maxSurvivalTime);
                for (const id of WEAPON_IDS) {
                    this.progress.weaponMaxLevels[id] = Math.min(5, Math.floor(number(record(saved.weaponMaxLevels)[id])));
                    this.progress.weaponKillCounts[id] = Math.floor(number(record(saved.weaponKillCounts)[id]));
                }
                const unlocked = Array.isArray(saved.unlockedCharacters) ? saved.unlockedCharacters : [];
                this.progress.unlockedCharacters = CHARACTERS.filter(c => c.id === 'exorcist' || unlocked.includes(c.id)).map(c => c.id);
            }
        }
        catch { /* Malformed or denied storage starts with a safe default. */ }
        this.check(false);
        this.flush();
    }
    isUnlocked(id: CharacterId) { return this.progress.unlockedCharacters.includes(id); }
    value(character: CharacterDefinition) { const c = character.unlock; switch (c.type) {
        case 'default': return 1;
        case 'souls': return this.progress.totalSoulCollected;
        case 'runKills': return this.progress.maxKillsInRun;
        case 'survival': return this.progress.maxSurvivalTime;
        case 'weaponLevel': return this.progress.weaponMaxLevels[c.weaponId] ?? 0;
        case 'weaponKills': return this.progress.weaponKillCounts[c.weaponId] ?? 0;
    } }
    private check(notify = true) { for (const c of CHARACTERS) {
        if (this.isUnlocked(c.id))
            continue;
        const target = c.unlock.type === 'default' ? 1 : c.unlock.target;
        if (this.value(c) >= target) {
            this.progress.unlockedCharacters.push(c.id);
            if (notify)
                this.notifications.push(c.id);
            this.dirty = true;
        }
    } }
    private changed() { this.dirty = true; const before = this.progress.unlockedCharacters.length; this.check(); if (this.progress.unlockedCharacters.length > before)
        this.flush(); }
    collectSouls(amount: number) { this.progress.totalSoulCollected = Math.min(Number.MAX_SAFE_INTEGER, this.progress.totalSoulCollected + number(amount)); this.changed(); }
    kill(source: WeaponId, runKills: number) { source=baseWeaponId(source); this.progress.weaponKillCounts[source] = (this.progress.weaponKillCounts[source] ?? 0) + 1; this.progress.maxKillsInRun = Math.max(this.progress.maxKillsInRun, Math.floor(number(runKills))); this.changed(); }
    weaponLevel(id: WeaponId, level: number) { this.progress.weaponMaxLevels[id] = Math.max(this.progress.weaponMaxLevels[id] ?? 0, Math.min(5, Math.floor(number(level)))); this.changed(); }
    survival(seconds: number) { if (seconds > this.progress.maxSurvivalTime) {
        this.progress.maxSurvivalTime = number(seconds);
        this.changed();
    } }
    finishRun(kills: number, seconds: number) { this.progress.maxKillsInRun = Math.max(this.progress.maxKillsInRun, Math.floor(number(kills))); this.survival(seconds); this.changed(); this.flush(); }
    takeNotifications() { const result = this.notifications; this.notifications = []; return result; }
    flush() { if (!this.dirty)
        return; try {
        this.storage?.setItem(PROGRESS_KEY, JSON.stringify(this.progress));
        this.dirty = false;
    }
    catch { /* Gameplay continues with in-memory progress. */ } }
    resetProgress() { Object.assign(this.progress, fresh()); this.notifications = []; this.dirty = true; this.flush(); }
}
