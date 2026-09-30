import { chromium } from '@playwright/test';
import { createServer } from 'vite';
import assert from 'node:assert/strict';
const server = await createServer({ server: { host: '127.0.0.1', port: 5176 } });
await server.listen();
let browser;
try {
    browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE_PATH || undefined, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } }), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('http://127.0.0.1:5176');
    await page.waitForFunction(() => window.__SURVIVOR_GAME__?.scene.isActive('Menu'));
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.__SURVIVOR_GAME__.scene.isActive('CharacterSelect'));
    const texts = () => page.evaluate(() => window.__SURVIVOR_GAME__.scene.getScenes(true).flatMap(s => s.children.list.filter(o => o.type === 'Text').map(o => o.text)));
    assert.equal((await texts()).filter(t => t === '잠김').length, 5);
    await page.waitForTimeout(100);
    await page.mouse.click(620, 240);
    assert.equal(await page.evaluate(() => window.__GUIYA_CHARACTERS__.character.id), 'exorcist');
    await page.screenshot({ path: 'characters-locked-preview.png' });
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.__SURVIVOR_GAME__.scene.isActive('Game'));
    assert.deepEqual(await page.evaluate(() => Array.from(window.__SURVIVOR_GAME__.scene.getScene('Game').weapons.loadout.entries())), [['arc-bolt', 1]]);
    assert.ok(Math.abs(await page.evaluate(() => window.__SURVIVOR_GAME__.scene.getScene('Game').player.stats.damage) - 23.1) < .001);
    // Use real soul collection and damage events at threshold boundaries. Production targets stay unchanged.
    await page.evaluate(() => {
        const s = window.__SURVIVOR_GAME__.scene.getScene('Game'), u = window.__GUIYA_CHARACTERS__.unlocks;
        u.collectSouls(999);
        s.orbs.acquire().spawn(s.player.x, s.player.y, 1);
    });
    await page.waitForFunction(() => window.__GUIYA_CHARACTERS__.unlocks.isUnlocked('shaman'));
    await page.evaluate(() => {
        const s = window.__SURVIVOR_GAME__.scene.getScene('Game');
        s.kills = 999;
        const e = s.enemies.acquire();
        e.spawn(s.player.x + 80, s.player.y, 'grunt', 1, 0);
        s.weapons.strike(e, 999, 'arc-bolt');
    });
    assert.ok(await page.evaluate(() => window.__GUIYA_CHARACTERS__.unlocks.isUnlocked('warrior')));
    await page.evaluate(async () => {
        const s = window.__SURVIVOR_GAME__.scene.getScene('Game'), { WEAPON_UPGRADES } = await import('/src/data/weaponUpgrades.ts');
        const c = { definition: WEAPON_UPGRADES.find(c => c.weaponId === 'rosary'), rarity: 'Common' };
        // Prepare Lv4, then choose the Lv5 card through the Scene callback.
        for (let i = 0; i < 4; i++)
            s.upgrades.apply(c, s.player.stats);
        s.weapons.syncLoadout();
        s.upgrades.roll = () => [c, c, c];
        s.levels.pending = 1;
        s.showUpgrade();
        s.panel.select(0);
    });
    assert.ok(await page.evaluate(() => window.__GUIYA_CHARACTERS__.unlocks.isUnlocked('monk')));
    await page.evaluate(() => {
        const s = window.__SURVIVOR_GAME__.scene.getScene('Game'), u = window.__GUIYA_CHARACTERS__.unlocks;
        for (let i = 0; i < 499; i++)
            u.kill('hellfire', 1);
        const e = s.enemies.acquire();
        e.spawn(s.player.x + 100, s.player.y, 'grunt', 1, 0);
        s.weapons.strike(e, 999, 'hellfire');
    });
    assert.ok(await page.evaluate(() => window.__GUIYA_CHARACTERS__.unlocks.isUnlocked('forbidden_sorcerer')));
    await page.evaluate(() => { const s = window.__SURVIVOR_GAME__.scene.getScene('Game'); s.elapsed = 599.99; });
    await page.waitForFunction(() => window.__SURVIVOR_GAME__.scene.isActive('GameOver'));
    assert.ok(await page.evaluate(() => window.__GUIYA_CHARACTERS__.unlocks.isUnlocked('archer')));
    assert.ok((await texts()).some(t => t.startsWith('새 인물 해금')));
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('survivor-protocol.progress')).unlockedCharacters.length), 6);
    await page.mouse.click(640, 593);
    await page.waitForFunction(() => window.__SURVIVOR_GAME__.scene.isActive('Menu'));
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.__SURVIVOR_GAME__.scene.isActive('CharacterSelect'));
    await page.screenshot({ path: 'characters-unlocked-preview.png' });
    const expected = [['exorcist', 'arc-bolt'], ['shaman', 'exorcism-bell'], ['warrior', 'lightning-sword'], ['archer', 'ghost-arrow'], ['monk', 'rosary'], ['forbidden_sorcerer', 'hellfire']];
    for (let i = 0; i < 6; i++) {
        const [id, weapon] = expected[i];
        await page.waitForTimeout(150);
        await page.mouse.move(20, 90);
        await page.mouse.click(220 + (i % 3) * 395, 240 + Math.floor(i / 3) * 285);
        await page.waitForFunction(id => window.__GUIYA_CHARACTERS__.character.id === id, id);
        await page.keyboard.press('Enter');
        await page.waitForFunction(() => window.__SURVIVOR_GAME__.scene.isActive('Game'));
        const stats = await page.evaluate(() => { const s = window.__SURVIVOR_GAME__.scene.getScene('Game'); s.player.invulnerable = 100; return { stats: s.player.stats, loadout: Array.from(s.weapons.loadout.entries()), character: s.player.character.id }; });
        assert.equal(stats.character, id);
        assert.deepEqual(stats.loadout, [[weapon, 1]]);
        if (id === 'shaman')
            assert.equal(stats.stats.pickupRadius, 131.25);
        if (id === 'warrior')
            assert.equal(stats.stats.maxHp, 125);
        if (id === 'archer') {
            assert.equal(stats.stats.piercing, 1);
            assert.ok(Math.abs(stats.stats.projectileSpeed - 678.5) < .01);
        }
        if (id === 'monk')
            assert.equal(stats.stats.damageTakenMultiplier, .9);
        if (id === 'forbidden_sorcerer') {
            assert.equal(stats.stats.maxHp, 80);
            assert.ok(Math.abs(stats.stats.damage - 26.4) < .01);
        }
        await page.evaluate(() => { const s = window.__SURVIVOR_GAME__.scene.getScene('Game'); for (let j = 0; j < 12; j++) {
            const a = j * Math.PI / 6;
            s.enemies.acquire().spawn(s.player.x + Math.cos(a) * 65, s.player.y + Math.sin(a) * 65, 'tank', 100, 0);
        } });
        await page.waitForFunction(weapon => window.__SURVIVOR_GAME__.scene.getScene('Game').weapons.hits[weapon] > 0, weapon);
        // Starting weapon can upgrade and another weapon can be acquired.
        await page.evaluate(async (weapon) => {
            const s = window.__SURVIVOR_GAME__.scene.getScene('Game'), { WEAPON_UPGRADES } = await import('/src/data/weaponUpgrades.ts');
            s.upgrades.apply({ definition: WEAPON_UPGRADES.find(w => w.weaponId === weapon), rarity: 'Common' }, s.player.stats);
            s.upgrades.apply({ definition: WEAPON_UPGRADES.find(w => w.weaponId !== weapon), rarity: 'Common' }, s.player.stats);
            s.weapons.syncLoadout();
        }, weapon);
        assert.equal(await page.evaluate(weapon => window.__SURVIVOR_GAME__.scene.getScene('Game').weapons.loadout.level(weapon), weapon), 2);
        // Monk takes 9, not 10, points from real contact; invulnerability still gates repeated damage.
        if (id === 'monk') {
            await page.evaluate(() => { const s = window.__SURVIVOR_GAME__.scene.getScene('Game'); for (const e of s.enemies.items)
                e.disableBody(true, true); s.player.invulnerable = 0; s.enemies.acquire().spawn(s.player.x, s.player.y, 'grunt', 100, 0); });
            await page.waitForFunction(() => window.__SURVIVOR_GAME__.scene.getScene('Game').player.stats.hp === 91);
        }
        await page.evaluate(() => window.__SURVIVOR_GAME__.scene.getScene('Game').finish(false));
        await page.waitForFunction(() => window.__SURVIVOR_GAME__.scene.isActive('GameOver'));
        await page.keyboard.press('Enter');
        await page.waitForFunction(() => window.__SURVIVOR_GAME__.scene.isActive('Game'));
        assert.deepEqual(await page.evaluate(() => Array.from(window.__SURVIVOR_GAME__.scene.getScene('Game').weapons.loadout.entries())), [[weapon, 1]]);
        await page.evaluate(() => window.__SURVIVOR_GAME__.scene.getScene('Game').finish(false));
        await page.waitForFunction(() => window.__SURVIVOR_GAME__.scene.isActive('GameOver'));
        await page.mouse.click(640, 593);
        await page.waitForFunction(() => window.__SURVIVOR_GAME__.scene.isActive('Menu'));
        await page.keyboard.press('Enter');
        await page.waitForFunction(() => window.__SURVIVOR_GAME__.scene.isActive('CharacterSelect'));
    }
    // KO/EN layout, including all locked conditions. Rendering uses system Korean fallback fonts.
    await page.evaluate(async () => { const { setLocale } = await import('/src/i18n/index.ts'); setLocale('en'); });
    const overflow = await page.evaluate(() => window.__SURVIVOR_GAME__.scene.getScene('CharacterSelect').children.list.filter(o => o.type === 'Text' && o.y >= 125 && o.y < 700 && (o.width > 335 || o.height > 42)).map(o => o.text));
    assert.deepEqual(overflow, []);
    await page.reload();
    await page.waitForFunction(() => window.__SURVIVOR_GAME__?.scene.isActive('Menu'));
    assert.equal(await page.evaluate(() => window.__GUIYA_CHARACTERS__.character.id), 'forbidden_sorcerer');
    assert.equal(await page.evaluate(() => window.__GUIYA_CHARACTERS__.unlocks.progress.unlockedCharacters.length), 6);
    await page.evaluate(() => { localStorage.setItem('survivor-protocol.progress', '{invalid'); localStorage.setItem('survivor-protocol.selectedCharacter', 'archer'); });
    await page.reload();
    await page.waitForFunction(() => window.__SURVIVOR_GAME__?.scene.isActive('Menu'));
    assert.equal(await page.evaluate(() => window.__GUIYA_CHARACTERS__.character.id), 'exorcist');
    assert.deepEqual(errors, []);
    console.log('PASS: 6 starts/passives/live attacks/Retry, 5 unlock events, saved progress, notification, selection UI, KO/EN layout, refresh and corrupt save fallback');
}
finally {
    await browser?.close();
    await server.close();
}
