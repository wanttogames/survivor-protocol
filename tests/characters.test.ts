import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CharacterManager, SELECTED_KEY } from '../src/characters/CharacterManager';
import { CharacterUnlockManager, PROGRESS_KEY, type SaveStorage } from '../src/characters/CharacterUnlockManager';
import { CHARACTERS, applyCharacterPassive } from '../src/characters/characterDefinitions';
import { BALANCE } from '../src/config/balance';
import { WeaponLoadout } from '../src/weapons/WeaponLoadout';
import { UpgradeSystem } from '../src/systems/UpgradeSystem';
import { WEAPON_UPGRADES } from '../src/data/weaponUpgrades';
class Memory implements SaveStorage {
    data = new Map<string, string>();
    getItem(k: string) { return this.data.get(k) ?? null; }
    setItem(k: string, v: string) { this.data.set(k, v); }
    removeItem(k: string) { this.data.delete(k); }
}
test('fresh, locked selection, malformed and future saves, blocked storage', () => {
    const m = new Memory(), c = new CharacterManager(m);
    assert.deepEqual(c.unlocks.progress.unlockedCharacters, ['exorcist']);
    assert.equal(c.select('archer'), false);
    m.setItem(PROGRESS_KEY, '{bad');
    m.setItem(SELECTED_KEY, 'archer');
    assert.equal(new CharacterManager(m).character.id, 'exorcist');
    m.setItem(PROGRESS_KEY, JSON.stringify({ version: 99, unlockedCharacters: ['archer'] }));
    assert.equal(new CharacterManager(m).character.id, 'exorcist');
    assert.doesNotThrow(() => new CharacterManager({ getItem() { throw Error(); }, setItem() { throw Error(); }, removeItem() { throw Error(); } }));
});
test('all five thresholds, no duplicate notification, persistence and selected restore', () => {
    const storage = new Memory(), m = new CharacterManager(storage), u = m.unlocks;
    u.collectSouls(999);
    assert.equal(u.isUnlocked('shaman'), false);
    u.collectSouls(1);
    assert.equal(u.isUnlocked('shaman'), true);
    u.kill('arc-bolt', 999);
    assert.equal(u.isUnlocked('warrior'), false);
    u.kill('arc-bolt', 1000);
    assert.equal(u.isUnlocked('warrior'), true);
    u.survival(599);
    assert.equal(u.isUnlocked('archer'), false);
    u.finishRun(1000, 600);
    assert.equal(u.isUnlocked('archer'), true);
    u.weaponLevel('rosary', 4);
    assert.equal(u.isUnlocked('monk'), false);
    u.weaponLevel('rosary', 5);
    assert.equal(u.isUnlocked('monk'), true);
    for (let i = 0; i < 499; i++)
        u.kill('hellfire', 1);
    assert.equal(u.isUnlocked('forbidden_sorcerer'), false);
    u.kill('hellfire', 1);
    assert.equal(u.isUnlocked('forbidden_sorcerer'), true);
    assert.equal(new Set(u.takeNotifications()).size, 5);
    u.collectSouls(1);
    u.weaponLevel('rosary', 5);
    assert.deepEqual(u.takeNotifications(), []);
    m.select('archer');
    u.flush();
    const restored = new CharacterManager(storage);
    assert.equal(restored.character.id, 'archer');
    assert.equal(restored.unlocks.progress.unlockedCharacters.length, 6);
    restored.reset();
    assert.equal(new CharacterManager(storage).character.id, 'exorcist');
    assert.equal(restored.unlocks.progress.unlockedCharacters.length, 1);
});
test('six starting loadouts, modifiers and upgrade compatibility', () => {
    const expected = [{ damage: 23.1 }, { pickupRadius: 131.25 }, { maxHp: 125, hp: 125 }, { projectileSpeed: 678.5, piercing: 1 }, { damageTakenMultiplier: .9 }, { damage: 26.4, maxHp: 80, hp: 80 }];
    CHARACTERS.forEach((c, i) => {
        const stats = { ...BALANCE.player };
        applyCharacterPassive(c, stats);
        for (const [key, value] of Object.entries(expected[i]))
            assert.ok(Math.abs(stats[key as keyof typeof stats] - value) < .0001, `${c.id}.${key}`);
        const loadout = new WeaponLoadout(undefined, c.startingWeaponId);
        assert.equal(loadout.size, 1);
        assert.equal(loadout.level(c.startingWeaponId), 1);
        const system = new UpgradeSystem(Math.random, loadout), definition = WEAPON_UPGRADES.find(w => w.weaponId === c.startingWeaponId)!;
        system.apply({ definition, rarity: 'Common' }, stats);
        assert.equal(loadout.level(c.startingWeaponId), 2);
    });
});
test('negative and unknown data sanitized; bounded levels', () => {
    const m = new Memory();
    m.setItem(PROGRESS_KEY, JSON.stringify({ version: 1, totalSoulCollected: -10, maxKillsInRun: '1000', weaponMaxLevels: { rosary: 999 }, unlockedCharacters: ['not-real'] }));
    const u = new CharacterUnlockManager(m);
    assert.equal(u.progress.totalSoulCollected, 0);
    assert.equal(u.progress.maxKillsInRun, 0);
    assert.equal(u.progress.weaponMaxLevels.rosary, 5);
    assert.ok(u.isUnlocked('monk'));
    assert.ok(!u.progress.unlockedCharacters.includes('not-real' as never));
});
