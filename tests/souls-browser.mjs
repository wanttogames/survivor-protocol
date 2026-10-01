import {chromium} from '@playwright/test';
import {createServer} from 'vite';
import assert from 'node:assert/strict';
const server=await createServer({server:{host:'127.0.0.1',port:5186}});await server.listen();let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||undefined,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:5186');await page.waitForFunction(()=>window.__SURVIVOR_GAME__?.scene.isActive('Menu'));
 await page.keyboard.press('Enter');await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('CharacterSelect'));await page.keyboard.press('Enter');await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('Game'));
 const result=await page.evaluate(async()=>{
  const s=window.__SURVIVOR_GAME__.scene.getScene('Game');s.paused=true;s.physics.pause();for(const e of s.enemies.items)e.disableBody(true,true);
  for(const orb of s.orbs.items)orb.setActive(false).setVisible(false);
  const {LevelSystem}=await import('/src/systems/LevelSystem.ts');s.levels=new LevelSystem();
  // Real enemy death -> raw drop -> pool -> existing pickup/XP multiplier.
  for(let i=0;i<120;i++){const e=s.enemies.acquire();e.spawn(s.player.x+400,s.player.y+400,'grunt',1,0);e.xp=1;s.kill(e,'arc-bolt');}
  const before=s.getSoulDebugInfo();const acquire=s.orbs.acquire.bind(s.orbs);s.orbs.acquire=()=>{throw new Error('Acquire called at cap');};
  for(let i=0;i<100;i++){const e=s.enemies.acquire();e.spawn(9000,9000,'grunt',1,0);e.xp=10;s.kill(e,'arc-bolt');}
  const after=s.getSoulDebugInfo();s.orbs.acquire=acquire;
  // Value and tier boundaries, cached texture reuse and pool respawn reset.
  const textures=s.textures.getTextureKeys().length;
  const o=s.orbs.items[0];o.value=1;o.spawn(s.player.x+80,s.player.y,1);
  const tiers=[];for(const amount of [0,9,20,70]){o.addExp(amount);tiers.push({value:o.value,key:o.texture.key,scale:o.scaleX});}
  // Restore this orb's 11 EXP so the total conservation test stays exact.
  o.spawn(s.player.x+400,s.player.y+400,11);
  const debug=s.getSoulDebugInfo();const texturesStable=textures===s.textures.getTextureKeys().length;
  s.talismans.modifiers.xpMultiplier=1.35;const expected=new LevelSystem();expected.add(1120*1.35);
  for(const orb of s.orbs.items)if(orb.active)orb.setPosition(s.player.x,s.player.y);
  let received=0;const grant=s.grantXp.bind(s);s.grantXp=amount=>{received+=amount;grant(amount);};s.updateOrbs(.01);
  const levels={level:s.levels.level,xp:s.levels.xp,pending:s.levels.pending};
  const clear=s.getSoulDebugInfo();
  s.paused=false;s.continueAfterCard();
  return {before,after,debug,clear,received,levels,expected:{level:expected.level,xp:expected.xp,pending:expected.pending},tiers,texturesStable,open:s.panel.open};
 });
 assert.equal(result.before.activeSouls,120);assert.equal(result.after.activeSouls,120);assert.equal(result.after.storedExp,1120);assert.equal(result.after.mergedExp,1000);assert.equal(result.received,1120);assert.equal(result.levels.level,result.expected.level);assert.equal(result.levels.pending,result.expected.pending);assert.ok(Math.abs(result.levels.xp-result.expected.xp)<1e-9);assert.equal(result.clear.storedExp,0);assert.equal(result.clear.activeSouls,0);assert.equal(result.clear.mergeIndex,0);assert.ok(result.open,"Level-up panel opens");assert.ok(result.levels.pending>1);assert.ok(result.texturesStable,"No new textures on EXP additions");
 assert.deepEqual(result.tiers.map(x=>x.key),['orb','orb-medium','orb-large','orb-great']);assert.ok(result.tiers.every(x=>x.scale<=1.45));
 // UI pause: an attracted orb stays still; massive EXP uses the existing one-panel queue.
 await page.evaluate(()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game');s.orbs.deposit(s.player.x+100,s.player.y,2);s.orbs.items.find(o=>o.active).magnetized=true;});
 const stationary=await page.evaluate(()=>{const o=window.__SURVIVOR_GAME__.scene.getScene('Game').orbs.items.find(o=>o.active);return [o.x,o.y,o.value];});await page.waitForTimeout(180);
 assert.deepEqual(await page.evaluate(()=>{const o=window.__SURVIVOR_GAME__.scene.getScene('Game').orbs.items.find(o=>o.active);return [o.x,o.y,o.value];}),stationary);
 const queue=await page.evaluate(()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game');let selections=0;while(s.panel.open&&selections<100){s.panel.select(0);selections++;}return {selections,pending:s.levels.pending,open:s.panel.open,paused:s.physics.world.isPaused};});
 assert.equal(queue.selections,result.levels.pending);assert.equal(queue.pending,0);assert.equal(queue.open,false);assert.equal(queue.paused,false);
 // Death and actual king victory each restart a fresh pool and counters.
 for(const won of [false,true]){
  await page.evaluate(won=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game');s.paused=true;s.physics.pause();s.orbs.deposit(200,200,1000);if(won){s.bosses.spawnBoss('ghost-king');s.weapons.strike(s.bosses.activeBosses[0],1e9,'arc-bolt');s.paused=false;s.update(0,1);}else{s.paused=false;s.player.invulnerable=0;s.hurtPlayer(10000);}},won);
  await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('GameOver'));await page.keyboard.press('Enter');await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('Game'));
  const reset=await page.evaluate(()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game');s.paused=true;s.physics.pause();const clean=s.getSoulDebugInfo();s.orbs.deposit(200,200,1);return {clean,newOrb:s.orbs.items.find(o=>o.active).value};});
  assert.equal(reset.clean.activeSouls,0);assert.equal(reset.clean.storedExp,0);assert.equal(reset.clean.mergeIndex,0);assert.equal(reset.clean.mergedDrops,0);assert.equal(reset.newOrb,1);
 }
 assert.deepEqual(errors,[]);console.log(JSON.stringify({result:'PASS',conservation:result,queue,pause:true,deathRetry:true,victoryRetry:true,errors}));
}finally{await browser?.close();await server.close();}
