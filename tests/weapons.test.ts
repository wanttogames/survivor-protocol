import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WeaponLoadout } from '../src/weapons/WeaponLoadout';
import { WEAPON_IDS, WEAPONS, weaponDescriptionParams } from '../src/data/weaponConfig';
import { UpgradeSystem } from '../src/systems/UpgradeSystem';
import { WEAPON_UPGRADES } from '../src/data/weaponUpgrades';
import { BALANCE } from '../src/config/balance';
import { inSector, inCircle } from '../src/weapons/geometry';
import { setLocale, t } from '../src/i18n';
test('starting weapon, six slots, five stages and reset', () => {
    const loadout = new WeaponLoadout();
    assert.equal(loadout.level('arc-bolt'), 1);
    assert.equal(loadout.size, 1);
    for (const id of WEAPON_IDS) {
        while (loadout.canUpgrade(id))
            assert.ok(loadout.upgrade(id));
        assert.equal(loadout.level(id), 5);
        assert.equal(loadout.upgrade(id), false);
    }
    assert.equal(loadout.size, 6);
    assert.equal(new WeaponLoadout().size, 1);
    const one = new WeaponLoadout(1);
    assert.equal(one.upgrade('rosary'), false);
    assert.ok(one.upgrade('arc-bolt'));
});
test('mixed cards acquire and upgrade weapons, max and unavailable are excluded', () => {
    const loadout = new WeaponLoadout(), system = new UpgradeSystem(Math.random, loadout), stats = { ...BALANCE.player };
    for (const def of WEAPON_UPGRADES) {
        while (loadout.canUpgrade(def.weaponId!))
            system.apply({ definition: def, rarity: 'Common' }, stats);
    }
    for (let i = 0; i < 30; i++) {
        const cards = system.roll();
        assert.equal(cards.length, 3);
        assert.equal(new Set(cards.map(c => c.definition.id)).size, 3);
        assert.ok(cards.every(c => !c.definition.weaponId));
    }
    assert.deepEqual(stats, BALANCE.player, 'weapon cards must not mutate passive stats');
    const limited = new UpgradeSystem(Math.random, new WeaponLoadout(1));
    for (let i = 0; i < 30; i++)
        assert.ok(limited.roll().every(c => !c.definition.weaponId || c.definition.weaponId === 'arc-bolt'));
});
test('weapon stages provide structural upgrades and both translations resolve', () => {
    assert.equal(WEAPONS.rosary.levels[2].projectileCount, 3);
    assert.equal(WEAPONS['ghost-arrow'].levels[2].pierce, 4);
    assert.equal(WEAPONS.hellfire.levels[4].projectileCount, 2);
    assert.ok(WEAPONS['exorcism-bell'].levels[2].radius > WEAPONS['exorcism-bell'].levels[1].radius);
    for (const locale of ['ko', 'en'] as const) {
        setLocale(locale);
        for (const id of WEAPON_IDS)
            for (let i = 1; i <= 5; i++)
                assert.doesNotMatch(t(WEAPONS[id].stepKeys[i - 1], weaponDescriptionParams(id, i)), /\{\w+\}/);
    }
    setLocale('ko');
});
test('sector hits only forward close targets; circle boundary is inclusive', () => {
    assert.ok(inSector(50, 0, 0, 0, 0, 100, Math.PI / 3));
    assert.ok(!inSector(-50, 0, 0, 0, 0, 100, Math.PI / 3));
    assert.ok(!inSector(101, 0, 0, 0, 0, 100, Math.PI / 3));
    assert.ok(inSector(-50, -1, 0, 0, Math.PI, 100, Math.PI / 3));
    assert.ok(inCircle(3, 4, 0, 0, 5));
    assert.ok(!inCircle(3, 5, 0, 0, 5));
});
