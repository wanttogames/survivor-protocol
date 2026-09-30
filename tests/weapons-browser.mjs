import { chromium } from '@playwright/test';
import { createServer } from 'vite';
import assert from 'node:assert/strict';
const server = await createServer({ server: { host: '127.0.0.1', port: 5175 } });
await server.listen();
let browser;
try {
    browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE_PATH || undefined, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } }), errors = [], missing = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('response', r => {
        if (r.status() === 404)
            missing.push(r.url());
    });
    await page.goto('http://127.0.0.1:5175');
    await page.waitForFunction(() => window.__SURVIVOR_GAME__?.scene.isActive('Menu'));
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.__SURVIVOR_GAME__.scene.isActive('Game'));
    assert.deepEqual(await page.evaluate(() => Array.from(window.__SURVIVOR_GAME__.scene.getScene('Game').weapons.loadout.entries())), [['arc-bolt', 1]]);
    // Force only the RNG, not the acquisition path: real level-up -> roll -> card -> apply.
    const choose = async (id, pointer = false) => {
        const offer = await page.evaluate(async (id) => {
            const s = window.__SURVIVOR_GAME__.scene.getScene('Game');
            const { UPGRADES } = await import('/src/data/upgrades.ts'), { WEAPON_UPGRADES } = await import('/src/data/weaponUpgrades.ts');
            const pool = [...UPGRADES.filter(u => (s.upgrades.levels[u.id] ?? 0) < u.maxLevel), ...WEAPON_UPGRADES.filter(u => s.weapons.loadout.canUpgrade(u.weaponId))];
            const index = pool.findIndex(u => u.weaponId === id);
            let calls = 0;
            s.upgrades.random = () => calls++ === 0 ? (index + .1) / pool.length : .1;
            s.levels.pending = 1;
            s.showUpgrade();
            s.upgrades.random = Math.random;
            return { ids: s.panel.choices.map(c => c.definition.id), first: s.panel.choices[0].definition.weaponId };
        }, id);
        assert.equal(offer.first, id);
        assert.equal(new Set(offer.ids).size, 3);
        if (pointer) {
            await page.mouse.move(40, 100);
            await page.waitForTimeout(150);
            await page.mouse.click(310, 440);
        }
        else
            await page.evaluate(() => window.__SURVIVOR_GAME__.scene.getScene('Game').panel.select(0));
        await page.waitForFunction(() => !window.__SURVIVOR_GAME__.scene.getScene('Game').panel.open, null, { timeout: 5000 });
        await page.waitForTimeout(70);
    };
    for (const id of ['rosary', 'exorcism-bell', 'lightning-sword', 'ghost-arrow', 'hellfire'])
        await choose(id, true);
    assert.equal(await page.evaluate(() => window.__SURVIVOR_GAME__.scene.getScene('Game').weapons.loadout.size), 6);
    // Freeze the Scene between controlled simulation steps; use real weapon objects and real enemies.
    const result = await page.evaluate(() => {
        const s = window.__SURVIVOR_GAME__.scene.getScene('Game');
        s.paused = true;
        s.physics.pause();
        s.player.stats.criticalChance = 0;
        const clean = () => {
            for (const e of s.enemies.items)
                e.disableBody(true, true);
            for (const b of s.bolts.items)
                b.disableBody(true, true);
            s.weapons.searched = false;
        };
        const spawn = (dx, dy) => { const e = s.enemies.acquire(); e.spawn(s.player.x + dx, s.player.y + dy, 'tank', 100, 0); return e; };
        const out = {};
        clean();
        const rosary = s.weapons.weapons.get('rosary');
        rosary.update(.01);
        const b = rosary.beads[0], e = spawn(b.x - s.player.x, b.y - s.player.y), hp = e.hp;
        rosary.scan = 0;
        rosary.update(.001);
        const once = e.hp;
        rosary.scan = 0;
        rosary.update(.001);
        out.rosary = { damaged: once < hp, cooldown: e.hp === once };
        s.player.x += 20;
        rosary.update(.1);
        out.rosary.follows = Math.abs(Math.hypot(rosary.beads[0].x - s.player.x, rosary.beads[0].y - s.player.y) - rosary.stats.range) < .01;
        clean();
        const inside = spawn(80, 0), outside = spawn(260, 0), bell = s.weapons.weapons.get('exorcism-bell');
        bell.timer = 0;
        bell.update(.01);
        const before = inside.hp;
        bell.update(.05);
        out.bell = { inside: before < 17000, outside: outside.hp === 17000, notEveryFrame: inside.hp === before };
        clean();
        const front = spawn(100, 0), back = spawn(-120, 0), far = spawn(260, 0), sword = s.weapons.weapons.get('lightning-sword');
        sword.timer = 0;
        sword.update(.01);
        out.sword = { front: front.hp < 17000, back: back.hp === 17000, far: far.hp === 17000 };
        clean();
        const a = spawn(100, 0), c = spawn(160, 0), d = spawn(220, 0), fourth = spawn(280, 0), arrow = s.weapons.weapons.get('ghost-arrow');
        arrow.timer = 0;
        arrow.update(.01);
        const bolt = s.bolts.items.find(b => b.active && b.source === 'ghost-arrow');
        const speed = Math.hypot(bolt.body.velocity.x, bolt.body.velocity.y);
        s.weapons.hit(bolt, a);
        const first = a.hp;
        s.weapons.hit(bolt, a);
        const duplicate = a.hp === first;
        s.weapons.hit(bolt, c);
        s.weapons.hit(bolt, d);
        const expired = !bolt.active;
        s.weapons.hit(bolt, fourth);
        out.arrow = { duplicate, threeTargets: [a, c, d].every(e => e.hp < 17000), expired, fourth: fourth.hp === 17000, speed: Math.abs(speed - 920) < 1 };
        clean();
        const f = spawn(190, 0), h = s.weapons.weapons.get('hellfire');
        for (const field of h.fields)
            field.life = 0;
        h.timer = 0;
        h.update(.01);
        const field = h.fields.find(f => f.life > 0), old = f.hp;
        h.update(.01);
        const hit = f.hp;
        h.update(.1);
        const gated = f.hp === hit;
        h.update(.31);
        out.hellfire = { created: !!field, tick: hit < old, gated, second: f.hp < hit };
        h.timer = 100;
        for (let i = 0; i < 60; i++)
            h.update(.05);
        out.hellfire.expired = h.fields.every(f => f.life <= 0 && !f.image.visible);
        return out;
    });
    for (const [weapon, checks] of Object.entries(result))
        for (const [check, value] of Object.entries(checks))
            assert.equal(value, true, `${weapon}.${check}`);
    // Upgrade all via cards, verify actual stage changes, then maxed cards disappear.
    for (const id of ['arc-bolt', 'rosary', 'exorcism-bell', 'lightning-sword', 'ghost-arrow', 'hellfire'])
        for (let i = 1; i < 5; i++)
            await choose(id);
    const maxed = await page.evaluate(() => { const s = window.__SURVIVOR_GAME__.scene.getScene('Game'); return { levels: Array.from(s.weapons.loadout.entries()), roll: s.upgrades.roll().map(c => c.definition.weaponId) }; });
    assert.ok(maxed.levels.every(([, lv]) => lv === 5));
    assert.ok(maxed.roll.every(id => !id));
    // All 30 weapon card stages in KO/EN fit their card boxes.
    for (const locale of ['ko', 'en']) {
        const overflow = await page.evaluate(async (locale) => {
            const { setLocale } = await import('/src/i18n/index.ts');
            const { WEAPON_UPGRADES } = await import('/src/data/weaponUpgrades.ts');
            setLocale(locale);
            const s = window.__SURVIVOR_GAME__.scene.getScene('Game'), bad = [];
            const saved = s.upgrades.currentLevel.bind(s.upgrades);
            for (let lv = 0; lv < 5; lv++)
                for (let offset = 0; offset < 6; offset += 3) {
                    s.upgrades.currentLevel = () => lv;
                    s.panel.show(WEAPON_UPGRADES.slice(offset, offset + 3).map(definition => ({ definition, rarity: 'Common' })), () => { });
                    for (const o of s.children.list)
                        if (o.type === 'Text' && o.depth === 202 && o.y >= 418 && o.y <= 545 && (o.width > 250 || o.height > 65))
                            bad.push(o.text);
                }
            s.upgrades.currentLevel = saved;
            s.panel.close();
            return bad;
        }, locale);
        assert.deepEqual(overflow, [], locale + ' text overflow');
    }
    // End-to-end simultaneous live combat against hundreds of durable moving targets.
    await page.evaluate(async () => {
        const { setLocale } = await import('/src/i18n/index.ts');
        setLocale('ko');
        const s = window.__SURVIVOR_GAME__.scene.getScene('Game');
        for (const e of s.enemies.items)
            e.disableBody(true, true);
        s.player.stats.hp = 100;
        s.player.invulnerable = 100;
        s.paused = false;
        s.physics.resume();
        s.particles.resume();
        for (const w of s.weapons.weapons.values())
            w.timer = 0;
        for (let i = 0; i < 350; i++) {
            const a = i * 2.39996, r = 60 + (i % 12) * 38;
            s.enemies.acquire()?.spawn(s.player.x + Math.cos(a) * r, s.player.y + Math.sin(a) * r, ['grunt', 'runner', 'tank'][i % 3], 100, 1);
        }
        window.weaponCosts = [];
        const originalUpdate = s.weapons.update.bind(s.weapons);
        s.weapons.update = dt => { const start = performance.now(); originalUpdate(dt); window.weaponCosts.push(performance.now() - start); };
        window.beforeHits = { ...s.weapons.hits };
        window.frames = [];
        window.last = performance.now();
        window.sample = true;
        const loop = now => {
            if (!window.sample)
                return;
            window.frames.push(now - window.last);
            window.last = now;
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    });
    await page.waitForTimeout(3800);
    const live = await page.evaluate(() => { window.sample = false; const s = window.__SURVIVOR_GAME__.scene.getScene('Game'); return { hits: { ...s.weapons.hits }, before: window.beforeHits, frames: window.frames, costs: window.weaponCosts, enemyCount: s.enemies.items.filter(e => e.active).length, beads: s.weapons.weapons.get('rosary').beads.length, fields: s.weapons.weapons.get('hellfire').fields.filter(f => f.life > 0).length, bolts: s.bolts.items.length }; });
    for (const id of ['arc-bolt', 'rosary', 'exorcism-bell', 'lightning-sword', 'ghost-arrow', 'hellfire'])
        assert.ok(live.hits[id] > (live.before[id] ?? 0), 'live damage ' + id);
    assert.equal(live.beads, 4);
    assert.ok(live.bolts <= 200);
    assert.ok(live.frames.length > 25, 'render loop remains responsive');
    await page.screenshot({ path: 'weapons-combat-preview.png' });
    await page.evaluate(() => {
        const s = window.__SURVIVOR_GAME__.scene.getScene('Game');
        for (const [id, w] of s.weapons.weapons)
            if (id !== 'arc-bolt') {
                w.destroy();
                s.weapons.weapons.delete(id);
            }
        let i = 0;
        for (const e of s.enemies.items)
            if (e.active) {
                const a = i * 2.39996, r = 60 + (i % 12) * 38;
                e.setPosition(s.player.x + Math.cos(a) * r, s.player.y + Math.sin(a) * r);
                i++;
            }
        window.frames = [];
        window.last = performance.now();
        window.sample = true;
        const loop = now => { if (!window.sample)
            return; window.frames.push(now - window.last); window.last = now; requestAnimationFrame(loop); };
        requestAnimationFrame(loop);
    });
    await page.waitForTimeout(3800);
    const baseline = await page.evaluate(() => { window.sample = false; return window.frames.sort((a, b) => a - b); });
    await page.evaluate(async () => { const s = window.__SURVIVOR_GAME__.scene.getScene('Game'); const { WEAPON_UPGRADES } = await import('/src/data/weaponUpgrades.ts'); s.physics.pause(); s.paused = true; s.upgrades.currentLevel = () => 2; s.panel.show([WEAPON_UPGRADES[1], WEAPON_UPGRADES[3], WEAPON_UPGRADES[5]].map(definition => ({ definition, rarity: 'Common' })), () => { }); });
    await page.screenshot({ path: 'weapons-cards-preview.png' });
    await page.evaluate(() => window.__SURVIVOR_GAME__.scene.getScene('Game').finish(false));
    await page.waitForFunction(() => window.__SURVIVOR_GAME__.scene.isActive('GameOver'));
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.__SURVIVOR_GAME__.scene.isActive('Game'));
    assert.equal(await page.evaluate(() => window.__SURVIVOR_GAME__.scene.getScene('Game').weapons.loadout.size), 1);
    assert.deepEqual(errors, []);
    assert.deepEqual(missing, []);
    const frames = live.frames.sort((a, b) => a - b);
    console.log(JSON.stringify({ result: 'PASS', checks: result, enemies: live.enemyCount, medianFrameMs: frames[Math.floor(frames.length * .5)], p95FrameMs: frames[Math.floor(frames.length * .95)], baselineMedianMs: baseline[Math.floor(baseline.length * .5)], weaponUpdateP95Ms: live.costs.sort((a, b) => a - b)[Math.floor(live.costs.length * .95)], liveHits: live.hits, notes: '6 weapons, all acquisition/level cards, KO/EN fit, level 5 exclusion, simultaneous combat, Retry reset, no 404' }));
}
finally {
    await browser?.close();
    await server.close();
}
