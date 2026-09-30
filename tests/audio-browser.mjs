import { chromium } from '@playwright/test';
import { createServer } from 'vite';
import assert from 'node:assert/strict';
const server = await createServer({ server: { host: '127.0.0.1', port: 5174 } });
await server.listen();
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE_PATH || undefined, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors = [], bad = [], files = new Set();
    page.on('pageerror', e => errors.push(e.message));
    page.on('response', r => { if (r.url().includes('/audio/') && r.url().endsWith('.ogg')) {
        files.add(r.url());
        if (r.status() !== 200)
            bad.push(r.url());
    } });
    const attach = () => page.evaluate(async () => { const { AudioManager } = await import('/src/audio/AudioManager.ts'); window.audio = AudioManager.forGame(window.__SURVIVOR_GAME__); });
    const snap = () => page.evaluate(() => window.audio.snapshot());
    const scene = () => page.evaluate(() => window.__SURVIVOR_GAME__.scene.getScenes(true).map(s => s.scene.key));
    await page.goto('http://127.0.0.1:5174');
    await page.waitForFunction(() => window.__SURVIVOR_GAME__?.scene.isActive('Menu'));
    await attach();
    assert.equal((await snap()).bgmPlaying, false);
    assert.equal(files.size, 9);
    assert.deepEqual(bad, []);
    await page.mouse.click(242, 560);
    await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive("CharacterSelect"));
    await page.keyboard.press("Enter");
    await page.waitForFunction(() => window.audio.snapshot().bgmPlaying);
    assert.equal((await snap()).bgmLoop, true);
    assert.equal((await snap()).bgmObjects, 1);
    // A running AudioContext with nonzero output samples proves decoded assets reach the mixer.
    await page.evaluate(() => { const m = window.__SURVIVOR_GAME__.sound; window.analyser = m.context.createAnalyser(); m.masterVolumeNode.connect(window.analyser); });
    let signal = 0;
    for (let i = 0; i < 5; i++) {
        await page.waitForTimeout(120);
        signal = Math.max(signal, await page.evaluate(() => { const b = new Float32Array(window.analyser.fftSize); window.analyser.getFloatTimeDomainData(b); return Math.max(...b.map(Math.abs)); }));
    }
    assert.ok(signal > 0, 'nonzero audio output');
    await page.evaluate(() => { const s = window.__SURVIVOR_GAME__.scene.getScene('Game'); s.enemies.acquire().spawn(s.player.x + 65, s.player.y, 'grunt', .1, 0); });
    await page.waitForFunction(() => window.audio.snapshot().played['soul-pickup'] > 0);
    for (const key of ['talisman-shot', 'enemy-hit', 'enemy-death', 'soul-pickup'])
        assert.ok((await snap()).played[key] > 0, key);
    const bgmStart = await page.evaluate(() => window.__SURVIVOR_GAME__.sound.get('night-stage').startTime);
    await page.evaluate(() => window.__SURVIVOR_GAME__.scene.getScene('Game').levels.add(8));
    await page.waitForFunction(() => window.__SURVIVOR_GAME__.scene.getScene('Game').panel.open);
    assert.ok((await snap()).played['level-up'] > 0);
    assert.equal(await page.evaluate(() => window.__SURVIVOR_GAME__.sound.get('night-stage').startTime), bgmStart);
    await page.keyboard.press('1', { delay: 100 });
    await page.waitForFunction(() => !window.__SURVIVOR_GAME__.scene.getScene('Game').panel.open);
    assert.ok((await snap()).played['upgrade-select'] > 0);
    // Force real contact damage, then verify invulnerability does not retrigger the event.
    await page.evaluate(() => { const s = window.__SURVIVOR_GAME__.scene.getScene('Game'); s.enemies.acquire().spawn(s.player.x, s.player.y, 'tank', 1, 0); s.player.invulnerable = 0; });
    await page.waitForFunction(() => window.audio.snapshot().played['player-hit'] > 0);
    const hits = (await snap()).played['player-hit'];
    await page.waitForTimeout(100);
    assert.equal((await snap()).played['player-hit'], hits);
    await page.evaluate(() => { const s = window.__SURVIVOR_GAME__.scene.getScene('Game'); s.paused = true; s.physics.pause(); window.audio.stopSfx(); });
    const flood = await page.evaluate(() => { let accepted = 0; for (let i = 0; i < 100; i++)
        if (window.audio.playSfx('enemy-hit'))
            accepted++; return { accepted, state: window.audio.snapshot() }; });
    assert.equal(flood.accepted, 1);
    assert.ok(flood.state.activeSfx <= 12);
    // Force the existing source close to its natural end, then verify an actual loop event.
    await page.evaluate(() => { window.loops = 0; const b = window.__SURVIVOR_GAME__.sound.get('night-stage'); b.on('looped', () => window.loops++); b.setSeek(b.duration - .2); });
    await page.waitForFunction(() => window.loops > 0);
    assert.equal((await snap()).bgmObjects, 1);
    await page.keyboard.press('m');
    assert.equal((await snap()).muted, true);
    assert.equal(await page.evaluate(() => localStorage.getItem('survivor-protocol.audioMuted')), 'true');
    await page.waitForTimeout(100);
    const mutedSignal = await page.evaluate(() => { const b = new Float32Array(window.analyser.fftSize); window.analyser.getFloatTimeDomainData(b); return Math.max(...b.map(Math.abs)); });
    assert.ok(mutedSignal < .00001, 'muted output');
    await page.keyboard.press('m');
    assert.equal((await snap()).muted, false);
    await page.evaluate(() => { const s = window.__SURVIVOR_GAME__.scene.getScene('Game'); s.player.stats.hp = 1; s.player.invulnerable = 0; s.paused = false; s.physics.resume(); s.enemies.acquire().spawn(s.player.x, s.player.y, 'tank', 1, 0); });
    await page.waitForFunction(() => window.__SURVIVOR_GAME__.scene.isActive('GameOver'));
    assert.ok((await snap()).played['player-death'] > 0);
    assert.equal((await snap()).bgmPlaying, false);
    const shots = (await snap()).played['talisman-shot'];
    await page.waitForTimeout(300);
    assert.equal((await snap()).played['talisman-shot'], shots);
    const objects = await page.evaluate(() => window.__SURVIVOR_GAME__.sound.sounds.length);
    for (let i = 0; i < 3; i++) {
        await page.keyboard.press('Enter');
        await page.waitForFunction(() => window.__SURVIVOR_GAME__.scene.isActive('Game'));
        assert.equal((await snap()).bgmPlaying, true);
        assert.equal(await page.evaluate(() => window.__SURVIVOR_GAME__.sound.sounds.length), objects);
        await page.evaluate(() => window.__SURVIVOR_GAME__.scene.getScene('Game').finish(false));
        await page.waitForFunction(() => window.__SURVIVOR_GAME__.scene.isActive('GameOver'));
    }
    await page.keyboard.press('m');
    await page.mouse.click(640, 593);
    await page.waitForFunction(() => window.__SURVIVOR_GAME__.scene.isActive('Menu'));
    assert.equal((await snap()).muted, true);
    await page.reload();
    await page.waitForFunction(() => window.__SURVIVOR_GAME__?.scene.isActive('Menu'));
    await attach();
    assert.equal((await snap()).muted, true);
    await page.mouse.click(242, 560);
    await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive("CharacterSelect"));
    await page.keyboard.press("Enter");
    await page.waitForFunction(() => window.__SURVIVOR_GAME__.scene.isActive('Game'));
    assert.equal((await snap()).muted, true);
    assert.deepEqual(errors, []);
    // A missing asset must not prevent menu or combat entry; check once in a new page.
    const missing = await browser.newPage();
    await missing.route('**/audio/sfx/enemy-hit.ogg', r => r.fulfill({ status: 404, body: 'missing' }));
    const missingErrors = [];
    missing.on('pageerror', e => missingErrors.push(e.message));
    await missing.goto('http://127.0.0.1:5174');
    await missing.waitForFunction(() => window.__SURVIVOR_GAME__?.scene.isActive('Menu'));
    await missing.keyboard.press('Enter');
    await missing.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('CharacterSelect'));
    await missing.keyboard.press('Enter');
    await missing.waitForFunction(() => window.__SURVIVOR_GAME__.scene.isActive('Game'));
    assert.deepEqual(missingErrors, []);
    await missing.close();
    console.log(JSON.stringify({ result: 'PASS', assets: files.size, signal, mutedSignal, soundObjects: objects, checks: '9 assets, gesture start, 8 event cues, output signal, loop event, no level-up restart, invulnerability, rate limit, death silence, 3 retries, mute persistence, missing asset tolerance' }));
}
finally {
    await browser.close();
    await server.close();
}
