import {chromium} from '@playwright/test';
import {createServer} from 'vite';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const server=await createServer({server:{host:'127.0.0.1',port:5181}});await server.listen();let browser;
const approx=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||undefined,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5181');await page.waitForFunction(()=>window.__SURVIVOR_GAME__?.scene.isActive('Menu'));
 await page.keyboard.press('Enter');await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('CharacterSelect'));await page.keyboard.press('Enter');await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('Game'));
 const restart=async()=>{await page.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScene('Game').scene.restart());await page.waitForTimeout(140);await page.evaluate(()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game');s.player.invulnerable=99999;s.player.stats.criticalChance=0;});};
 const offer=async id=>{await page.evaluate(id=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game');s.paused=false;s.triggerTalismanEvent(id);},id);await page.waitForSelector('.curse-overlay');};
 await page.evaluate(async()=>{const {setLocale}=await import('/src/i18n/index.ts');setLocale('ko');});
 await mkdir('talisman-previews',{recursive:true});
 const observed=[];
 for(const id of ['samdo','gate','hunger','trick','reaper','moon']){
  console.log('testing',id);await restart();
  const before=await page.evaluate(()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game');s.paused=true;s.physics.pause();const e=s.enemies.acquire();window.__testEnemy=e;e.spawn(s.player.x+120,s.player.y,'grunt',1,1);const b=s.bolts.acquire();b.fire(s.player.x,s.player.y,0,400,10,0,false,5);return {enemy:{hp:e.hp,speed:e.speed,damage:e.damage,xp:e.xp},stats:{...s.player.stats},elapsed:s.elapsed};});
  await offer(id);
  const frozen=await page.evaluate(()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game');return {elapsed:s.elapsed,x:s.player.x,enemy:s.enemies.items.filter(e=>e.active).map(e=>[e.x,e.y,e.hp]),bolts:s.bolts.items.filter(e=>e.active).map(e=>[e.x,e.y,e.ttl]),time:s.bosses.states.map(e=>e.slash)};});
  await page.waitForTimeout(160);assert.deepEqual(await page.evaluate(()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game');return {elapsed:s.elapsed,x:s.player.x,enemy:s.enemies.items.filter(e=>e.active).map(e=>[e.x,e.y,e.hp]),bolts:s.bolts.items.filter(e=>e.active).map(e=>[e.x,e.y,e.ttl]),time:s.bosses.states.map(e=>e.slash)};}),frozen);
  if(id==='samdo')await page.screenshot({path:'talisman-previews/desktop-ko.png'});
  const result=await page.evaluate(()=>{document.querySelector('.accept').click();const s=window.__SURVIVOR_GAME__.scene.getScene('Game');const resumed=!s.physics.world.isPaused&&!s.talismanPanel.open;s.paused=true;s.physics.pause();return {resumed,m:s.talismans.modifiers,stats:{...s.player.stats},enemy:{hp:window.__testEnemy.hp,speed:window.__testEnemy.speed,damage:window.__testEnemy.damage},ids:s.talismans.acceptedIds};});
  assert.ok(result.resumed);assert.deepEqual(result.ids,[id]);
  approx(result.stats.damage,before.stats.damage*result.m.playerDamageMultiplier);approx(result.stats.moveSpeed,before.stats.moveSpeed*result.m.playerMoveSpeedMultiplier);approx(result.stats.attackSpeed,before.stats.attackSpeed*result.m.attackSpeedMultiplier);approx(result.stats.maxHp,before.stats.maxHp*result.m.playerMaxHpMultiplier);assert.ok(result.stats.hp>0&&result.stats.hp<=result.stats.maxHp);
  approx(result.enemy.hp,before.enemy.hp*result.m.enemyHpMultiplier);approx(result.enemy.speed,before.enemy.speed*result.m.enemyMoveSpeedMultiplier);approx(result.enemy.damage,before.enemy.damage*result.m.enemyDamageMultiplier);
  const combat=await page.evaluate(()=>{
   const s=window.__SURVIVOR_GAME__.scene.getScene('Game');const e=s.enemies.acquire();e.spawn(s.player.x,s.player.y,'grunt',1,1);const spawn={hp:e.hp,speed:e.speed,damage:e.damage};
   for(const o of s.orbs.items)o.setActive(false).setVisible(false);s.weapons.strike(e,100000,'arc-bolt');const orb=s.orbs.items.find(o=>o.active);for(const o of s.orbs.items)if(o!==orb)o.setActive(false).setVisible(false);const value=orb.value;orb.setPosition(s.player.x,s.player.y);const xp=s.levels.xp;s.updateOrbs(.01);const xpGain=s.levels.xp-xp; // base XP is below level threshold
   s.bosses.spawnBoss('vengeful-general');const b=s.bosses.activeBosses[0];const bossSpawn={hp:b.hp,speed:b.speed,damage:b.damage};const hp=b.hp;s.weapons.strike(b,10,'arc-bolt');const strike=hp-b.hp;
   const bolt=s.bolts.acquire();bolt.fire(s.player.x,s.player.y,0,0,10,0,false,5);const hp2=b.hp;s.weapons.hit(bolt,b);const projectile=hp2-b.hp;
   const eliteBase=s.enemies.items.find(e=>e.active&&e.rank==='normal');if(eliteBase)eliteBase.disableBody(true,true);
   s.elites.spawn('night-elite',1,0);const elite=s.enemies.items.find(e=>e.active&&e.rank==='elite');const eliteXp=elite.xp;s.weapons.strike(elite,100000,'arc-bolt');const dropped=s.orbs.items.find(o=>o.active);
   // Global XP and elite bonus each apply exactly once.
   const eliteValue=dropped.value;
   return {spawn,bossSpawn,strike,projectile,value,xpGain,eliteXp,eliteValue};
  });
  approx(combat.xpGain,combat.value*result.m.xpMultiplier);approx(combat.strike,10*result.stats.damage/22*result.m.bossDamageMultiplier);approx(combat.projectile,10*result.m.bossDamageMultiplier);approx(combat.eliteValue,combat.eliteXp*result.m.eliteRewardMultiplier);
  observed.push({id,modifiers:result.m,combat});
 }
 console.log("six complete");
 // Real scheduled timing, stacking and rejected candidates.
 await restart();await page.evaluate(()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game');s.talismans.random=()=>0;s.elapsed=119.99;s.update(0,20);});await page.waitForSelector('.curse-overlay');assert.equal(await page.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScene('Game').talismans.offered.id),'samdo');
 await page.keyboard.press('2');assert.equal(await page.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScene('Game').talismans.rejectedIds[0]),'samdo');
 await offer('gate');await page.locator('.accept').click();await offer('reaper');await page.locator('.accept').click();
 const stacked=await page.evaluate(()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game');s.paused=true;s.physics.pause();return {...s.player.stats,boss:s.player.bossDamageMultiplier,ids:[...s.talismans.acceptedIds]};});approx(stacked.damage,22*1.05*1.25*1.4);approx(stacked.boss,1.1*1.2);assert.equal(stacked.maxHp,70);
 await restart();for(const id of ['samdo','moon','hunger']){await offer(id);await page.locator('.accept').click();}
 approx(await page.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScene('Game').talismans.modifiers.xpMultiplier),2.268);
 console.log("stacking complete");
 // Existing upgrade remains open; queued talisman precedes subsequent levels and boss rewards.
 await restart();await page.evaluate(()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game');s.levels.pending=2;s.showUpgrade();s.triggerTalismanEvent('trick');});assert.equal(await page.locator('.curse-overlay').count(),0);
 await page.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScene('Game').panel.select(0));await page.waitForSelector('.curse-overlay');
 await page.evaluate(()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game');s.pendingRewards.push('vengeful-general');s.levels.pending++;});
 await page.locator('.reject').click();assert.ok(await page.evaluate(()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game');return s.panel.open&&s.panel.choices.some(c=>c.definition.bossRewardId);}));
 await page.evaluate(()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game');const souls=s.panel.choices.findIndex(c=>c.definition.bossRewardId==='souls');s.panel.select(souls>=0?souls:0);});assert.ok(await page.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScene('Game').panel.open));
 await page.evaluate(()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game');let guard=20;while(s.panel.open&&guard--)s.panel.select(0);});assert.equal(await page.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScene('Game').physics.world.isPaused),false);
 console.log("queue complete");
 // Red moon adds elites only to future encounters; enforce count and absolute performance ceiling.
 await restart();await offer('moon');await page.locator('.accept').click();
 const spawn=await page.evaluate(()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game');s.talismans.times=[];s.elapsed=120;s.player.invulnerable=99999;s.update(0,1);s.paused=true;s.physics.pause();const elites=s.enemies.items.filter(e=>e.active&&e.rank==='elite').length;for(const e of s.enemies.items)if(e.rank!=='boss')e.disableBody(true,true);const random=Math.random;Math.random=()=>.5;for(let i=0;i<600;i++)s.spawn.update(1,600,s.player.x,s.player.y);Math.random=random;return {elites,active:s.enemies.items.filter(e=>e.active).length,capacity:s.enemies.capacity};});assert.equal(spawn.elites,2);assert.ok(spawn.active<=560&&spawn.capacity===560);
 console.log("pool complete");
 // Retry, menu/new game, death, victory, scene restart all create neutral sessions.
 for(const won of [false,true]){
  await restart();await offer('reaper');await page.locator('.accept').click();
  if(won)await page.evaluate(()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game');s.bosses.spawnBoss('ghost-king');s.weapons.strike(s.bosses.activeBosses[0],1000000,'arc-bolt');});
  else await page.evaluate(()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game');s.player.invulnerable=0;s.hurtPlayer(10000);});
  await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('GameOver'));assert.deepEqual(await page.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScene('GameOver').scene.settings.data.talismanIds),['reaper']);
  assert.ok(await page.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScene('GameOver').children.list.some(o=>o.type==='Text'&&o.text.includes('저승사자'))));
  if(won)await page.screenshot({path:'talisman-previews/victory.png'});
  await page.keyboard.press('Enter');await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('Game'));
  const reset=await page.evaluate(()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game');return {stats:s.player.stats,m:s.talismans.modifiers,ids:s.talismans.acceptedIds,boss:s.player.bossDamageMultiplier,rarity:s.upgrades.rarityBonus};});assert.equal(reset.stats.maxHp,100);approx(reset.stats.damage,22*1.05);assert.equal(reset.m.xpMultiplier,1);assert.equal(reset.m.enemyHpMultiplier,1);assert.equal(reset.m.enemyDamageMultiplier,1);assert.equal(reset.m.enemyMoveSpeedMultiplier,1);assert.equal(reset.m.enemyMaxCountMultiplier,1);assert.equal(reset.m.eliteRewardMultiplier,1);assert.equal(reset.boss,1);assert.equal(reset.rarity,0);assert.deepEqual(reset.ids,[]);
 }
 await page.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScene('Game').scene.start('Menu'));await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('Menu'));await page.keyboard.press('Enter');await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('CharacterSelect'));await page.keyboard.press('Enter');await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('Game'));assert.equal(await page.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScene('Game').talismans.acceptedIds.length),0);
 console.log("reset complete");
 // Mobile portrait and landscape, touch, translated text and >=44 actual CSS pixel buttons.
 const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,locale:'ko-KR'});mobile.on('pageerror',e=>errors.push(e.message));await mobile.goto('http://127.0.0.1:5181');await mobile.waitForFunction(()=>window.__SURVIVOR_GAME__?.scene.isActive('Menu'));await mobile.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScene('Menu').scene.start('Game'));await mobile.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('Game'));await mobile.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScene('Game').triggerTalismanEvent('hunger'));await mobile.waitForSelector('.curse-overlay');
 await mobile.screenshot({path:'talisman-previews/mobile-ko.png'});const bounds=await mobile.locator('.accept').boundingBox();assert.ok(bounds.height>=44&&bounds.x>=0&&bounds.x+bounds.width<=390);await mobile.locator('.accept').tap();assert.equal(await mobile.locator('.curse-overlay').count(),0);
 await mobile.setViewportSize({width:844,height:390});await mobile.evaluate(async()=>{const {setLocale}=await import('/src/i18n/index.ts');setLocale('en');window.__SURVIVOR_GAME__.scene.getScene('Game').triggerTalismanEvent('moon');});await mobile.waitForSelector('.curse-overlay');await mobile.locator('.reject').scrollIntoViewIfNeeded();await mobile.screenshot({path:'talisman-previews/mobile-landscape-en.png'});await mobile.locator('.reject').tap();assert.equal(await mobile.locator('.curse-overlay').count(),0);
 assert.deepEqual(errors,[]);console.log(JSON.stringify({success:true,individual:observed.map(x=>x.id),pause:true,stacking:true,queue:true,boss:true,retry:true,menu:true,mobile:true,spawn,errors},null,2));
}finally{await browser?.close();await server.close();}
