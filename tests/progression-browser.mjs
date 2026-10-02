import { chromium } from '@playwright/test';
import { createServer } from 'vite';
import assert from 'node:assert/strict';
const server=await createServer({server:{host:'127.0.0.1',port:5191}});await server.listen();let browser;
try {
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||undefined,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const errors=[];const page=await browser.newPage({viewport:{width:1280,height:800}});page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5191');await page.waitForFunction(()=>window.__SURVIVOR_GAME__?.scene.isActive('Menu'));
 await page.evaluate(async()=>{const {getMetaProgression}=await import('/src/progression/MetaProgression.ts');for(let i=0;i<10;i++)getMetaProgression().settle(`fixture-${i}`,{time:600,eliteKills:20,bossKills:3,won:true});});
 await page.mouse.click(560,560);await page.locator('.village-shop').waitFor();
 for(const id of ['vitality','gathering','footwork'])await page.locator(`[data-training="${id}"] button`).click();
 for(const id of ['guardian','summoning','stride','scholar','breaker'])await page.locator(`[data-charm="${id}"] button`).click();
 await page.locator('[data-charm="guardian"] button').click();
 assert.equal(await page.locator('.equipped').count(),1);
 await page.locator('footer button').last().click();await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('Menu'));
 await page.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScene('Menu').scene.start('Game'));await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('Game'));
 const shield=await page.evaluate(()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game');s.spawn.update=()=>{};const max=s.player.stats.maxHp;const speed=s.player.stats.moveSpeed;const pickup=s.player.stats.pickupRadius;s.player.invulnerable=0;s.hurtPlayer(10);const first=s.player.stats.hp;s.player.invulnerable=0;s.hurtPlayer(10);return {max,speed,pickup,first,second:s.player.stats.hp};});
 assert.ok(Math.abs(shield.max-113.3)<1e-8);assert.equal(shield.speed,235*1.02);assert.equal(shield.pickup,105*1.05);assert.equal(shield.first,shield.max);assert.equal(shield.second,shield.max-10);
 const beforeSettlement=await page.evaluate(async()=>{const {getMetaProgression}=await import('/src/progression/MetaProgression.ts');return getMetaProgression().state.coins;});
 await page.evaluate(()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game');s.elapsed=120;s.runStats.eliteKills=2;s.runStats.bossKills=1;s.finish(false);s.finish(false);});await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('GameOver'));
 const balance=await page.evaluate(async()=>{const {getMetaProgression}=await import('/src/progression/MetaProgression.ts');return getMetaProgression().state.coins;});
 assert.equal(balance-beforeSettlement,75);
 await page.mouse.click(640,584);await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('Game'));
 assert.equal(await page.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScene('Game').startingBenefits.shield),true);
 assert.ok(Math.abs(await page.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScene('Game').player.stats.maxHp)-113.3)<1e-8);
 await page.evaluate(()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game');s.spawn.update=()=>{};s.finish(false);});await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('GameOver'));await page.mouse.click(640,649);await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('Menu'));
 await page.reload();await page.waitForFunction(()=>window.__SURVIVOR_GAME__?.scene.isActive('Menu'));
 assert.equal(await page.evaluate(async()=>{const {getMetaProgression}=await import('/src/progression/MetaProgression.ts');return getMetaProgression().state.coins;}),balance);
 for(const charm of ['summoning','stride','scholar','breaker']) {
  await page.mouse.click(560,560);await page.locator('.village-shop').waitFor();await page.locator(`[data-charm="${charm}"] button`).click();await page.locator('footer button').last().click();await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('Menu'));
  await page.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScene('Menu').scene.start('Game'));await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('Game'));
  const stats=await page.evaluate(()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game');s.spawn.update=()=>{};s.player.invulnerable=999;s.elapsed=0;s.grantXp(1);const before=s.levels.xp;s.elapsed=120;s.grantXp(1);s.elapsed=0;return {pickup:s.player.stats.pickupRadius,speed:s.player.stats.moveSpeed,boss:s.player.bossDamageMultiplier,before,after:s.levels.xp};});
  if(charm==='summoning')assert.ok(Math.abs(stats.pickup-105*1.05*1.2)<1e-8);
  if(charm==='stride')assert.ok(Math.abs(stats.speed-235*1.02*1.05)<1e-8);
  if(charm==='scholar'){assert.equal(stats.before,1.1);assert.equal(stats.after,2.1);}
  if(charm==='breaker') {
   assert.equal(stats.boss,1.05);
   await page.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScene('Game').triggerTalismanEvent('gate'));
   await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.getScene('Game').talismanPanel.open);
   await page.keyboard.press('1');await page.waitForFunction(()=>!window.__SURVIVOR_GAME__.scene.getScene('Game').talismanPanel.open);
   assert.ok(Math.abs(await page.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScene('Game').player.bossDamageMultiplier)-1.155)<1e-8);
  }
  await page.evaluate(()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game');s.elapsed=0;s.finish(false);});await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('GameOver'));await page.mouse.click(640,649);await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('Menu'));
 }
 const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});mobile.on('pageerror',e=>errors.push(e.message));
 await mobile.goto('http://127.0.0.1:5191');await mobile.waitForFunction(()=>window.__SURVIVOR_GAME__?.scene.isActive('Menu'));
 await mobile.locator('.mobile-village-entry').tap();await mobile.locator('.village-shop').waitFor();
 for(const locale of ['ko','en']) {
  await mobile.evaluate(async locale=>{const {setLocale}=await import('/src/i18n/index.ts');setLocale(locale);},locale);
  assert.equal(await mobile.locator('.village-shop article').count(),8);
  assert.ok((await mobile.locator('[data-training="vitality"] button').boundingBox()).height>=48);
  await mobile.locator('[data-training="vitality"] button').tap();assert.ok(await mobile.locator('[role="status"]').textContent());
  assert.equal(await mobile.evaluate(()=>{const el=document.querySelector('.village-shop');return el.scrollWidth<=el.clientWidth;}),true);
 }
 await mobile.locator('footer button').last().tap();await mobile.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('Menu'));assert.equal(await mobile.locator('.village-shop').count(),0);
 await mobile.setViewportSize({width:844,height:390});await mobile.locator('.mobile-village-entry').tap();await mobile.locator('.village-shop').waitFor();assert.equal(await mobile.evaluate(()=>{const el=document.querySelector('.village-shop');return el.scrollWidth<=el.clientWidth;}),true);
 await mobile.screenshot({path:'/tmp/survivor-village-mobile.png'});
 assert.deepEqual(errors,[]);console.log('PASS: 5 charms, training, purchases, persistence, settlement, retry, cursed stacking, ko/en and mobile shop');
} finally { await browser?.close();await server.close(); }
