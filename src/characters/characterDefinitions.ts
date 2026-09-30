import { BALANCE, type PlayerStats } from '../config/balance';
import type { CharacterDefinition, CharacterId } from './characterTypes';
const define = (id: CharacterId, rest: Omit<CharacterDefinition, 'id' | 'nameKey' | 'descriptionKey' | 'passiveKey'>): CharacterDefinition => ({ id, nameKey: `character.${id}.name`, descriptionKey: `character.${id}.description`, passiveKey: `character.${id}.passive`, ...rest });
export const CHARACTERS: CharacterDefinition[] = [
    define('exorcist', { startingWeaponId: 'arc-bolt', modifiers: { damage: { multiply: 1.05 } }, unlock: { type: 'default' }, unlockKey: 'character.unlock.default', visual: { tint: 0xffffff, accent: 0xb8a16a, decoration: 'none' } }),
    define('shaman', { startingWeaponId: 'exorcism-bell', modifiers: { pickupRadius: { multiply: 1.25 } }, unlock: { type: 'souls', target: 1000 }, unlockKey: 'character.unlock.souls', visual: { tint: 0xffc9c0, accent: 0xb95748, decoration: 'ribbon' } }),
    define('warrior', { startingWeaponId: 'lightning-sword', modifiers: { maxHp: { multiply: 1.25 } }, unlock: { type: 'runKills', target: 1000 }, unlockKey: 'character.unlock.runKills', visual: { tint: 0xa5b7bd, accent: 0xa9bbc0, decoration: 'armor' } }),
    define('archer', { startingWeaponId: 'ghost-arrow', modifiers: { projectileSpeed: { multiply: 1.15 }, piercing: { add: 1 } }, unlock: { type: 'survival', target: Math.min(600, BALANCE.duration) }, unlockKey: 'character.unlock.survival', visual: { tint: 0xc2cda2, accent: 0x939973, decoration: 'bow' } }),
    define('monk', { startingWeaponId: 'rosary', modifiers: { damageTakenMultiplier: { multiply: .9 } }, unlock: { type: 'weaponLevel', weaponId: 'rosary', target: 5 }, unlockKey: 'character.unlock.weaponLevel', visual: { tint: 0xe4c18a, accent: 0xcfa66c, decoration: 'beads' } }),
    define('forbidden_sorcerer', { startingWeaponId: 'hellfire', modifiers: { damage: { multiply: 1.2 }, maxHp: { multiply: .8 } }, unlock: { type: 'weaponKills', weaponId: 'hellfire', target: 500 }, unlockKey: 'character.unlock.weaponKills', visual: { tint: 0xd3a0bd, accent: 0x9a424d, decoration: 'seal' } }),
];
export const characterById = (id: string | undefined) => CHARACTERS.find(c => c.id === id) ?? CHARACTERS[0];
/** Applied exactly once to a fresh run; passive upgrades then accumulate normally. */
export function applyCharacterPassive(character: CharacterDefinition, stats: PlayerStats) {
    for (const [key, modifier] of Object.entries(character.modifiers)) {
        const field = key as keyof PlayerStats;
        stats[field] = stats[field] * (modifier.multiply ?? 1) + (modifier.add ?? 0);
    }
    stats.hp = stats.maxHp;
}
