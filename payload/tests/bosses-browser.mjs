import {chromium} from '@playwright/test';
import {createServer} from 'vite';
import assert from 'node:assert/strict';
const server=await createServer({server:{host:'127.0.0.1',port:5177}});await server.listen();let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||undefined,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[],missing=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()===404)missing.push(r.url());});
 await page.goto('http://127.0.0.1:5177');await page.waitForFunction(()=>window.__SURVIVOR_GAME__?.scene.isActive('Menu'));await page.keyboard.press('Enter');await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('CharacterSelect'));await page.keyboard.press('Enter');await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('Game'));
 // Isolate legacy boss-pattern regression tests; mixed modal ordering is covered by talismans-browser.
 await page.evaluate(async()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game');s.talismans.times=[];s.events.on('create',()=>{s.talismans.times=[];});const {setLocale}=await import('/src/i18n/index.ts');setLocale('ko');});
 const elite=await page.evaluate(()=>{
  const s=window.__SURVIVOR_GAME__.scene.getScene('Game');s.paused=true;s.physics.pause();for(const e of s.enemies.items)e.disableBody(true,true);
  s.elapsed=119.99;s.encounters.update(s.elapsed);const before=s.enemies.items.filter(e=>e.active&&e.rank==='elite').length;
  s.elapsed=120;s.encounters.update(s.elapsed);s.encounters.update(s.elapsed);const elites=s.enemies.items.filter(e=>e.active&&e.rank==='elite'),e=elites[0];s.elites.update(.01);
  const stats={before,count:elites.length,hp:e.hp,scale:e.scaleX,xp:e.xp,distance:Math.hypot(e.x-s.player.x,e.y-s.player.y)};
  s.player.stats.hp=30;e.setPosition(s.player.x+40,s.player.y);const random=Math.random;Math.random=()=>0;s.weapons.strike(e,10000,'arc-bolt');Math.random=random;
  stats.kills=s.runStats.eliteKills;stats.drop=s.orbs.items.some(o=>o.active&&o.value>=32);const f=s.elites.healing.find(f=>f.life>0);stats.healDrop=!!f;s.player.setPosition(f.image.x,f.image.y);s.elites.update(.01);stats.healed=s.player.stats.hp>30;
  return stats;
 });
 assert.equal(elite.before,0);assert.equal(elite.count,1);assert.ok(elite.hp>32*5&&elite.scale>1&&elite.distance>=600);assert.equal(elite.kills,1);assert.ok(elite.drop&&elite.healDrop&&elite.healed);
 const general=await page.evaluate(()=>{
  const s=window.__SURVIVOR_GAME__.scene.getScene('Game');s.elapsed=300;s.encounters.update(s.elapsed);s.encounters.update(s.elapsed);const state=s.bosses.states.find(s=>s.boss.definition.id==='vengeful-general'),b=state.boss;const distance=Math.hypot(b.x-s.player.x,b.y-s.player.y);
  b.setPosition(s.player.x+120,s.player.y);s.player.stats.hp=s.player.stats.maxHp;s.player.invulnerable=0;s.paused=false;state.slash=0;s.bosses.update(.01);const windup=state.cast?.type==='slash',hp=s.player.stats.hp;
  s.player.x-=400;s.bosses.update(.8);const dodged=s.player.stats.hp===hp;
  b.setPosition(s.player.x+120,s.player.y);state.slash=0;s.bosses.update(.01);s.player.invulnerable=0;s.bosses.update(.8);const hit=s.player.stats.hp<hp;s.player.invulnerable=0;const before=s.enemies.items.filter(e=>e.active&&e.rank==='normal').length;state.summon=0;s.bosses.update(.01);const summoned=s.enemies.items.filter(e=>e.active&&e.rank==='normal').length>before;
  s.paused=true;s.bossHud.update();return {count:s.bosses.activeBosses.length,distance,windup,dodged,hit,summoned,bar:s.bossHud.names[0].visible};
 });
 for(const k of ['windup','dodged','hit','summoned','bar'])assert.equal(general[k],true,k);assert.equal(general.count,1);assert.ok(general.distance>=600);
 await page.evaluate(()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game');s.player.invulnerable=0;s.player.move(0,0,0);s.hud.update(s.player,s.levels,s.elapsed,s.kills);for(const d of s.damageTexts){d.ttl=0;d.text.setVisible(false);}s.announcement.update(2);s.bosses.startCast(s.bosses.states[0],'slash');s.bosses.update(.01);});await page.waitForTimeout(180);await page.screenshot({path:'boss-general-preview.png'});
 await page.evaluate(()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game'),b=s.bosses.states[0].boss;s.bossRewards.random=()=>.99;s.weapons.strike(b,1000000,'arc-bolt');s.showBossReward();s.paused=false;});
 const rewards=await page.evaluate(async()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game'),{setLocale}=await import('/src/i18n/index.ts');const fits=[];for(const lang of ['ko','en']){setLocale(lang);fits.push(s.panel.objects.filter(o=>o.type==='Text'&&o.y>=288&&o.y<=545).every(t=>t.width<=270&&t.y+t.height<601));}setLocale('ko');return {count:s.panel.choices.length,weapon:s.panel.choices[0].definition.weaponId,fits,paused:s.physics.world.isPaused,bar:s.bossHud.names[0].visible};});
 assert.equal(rewards.count,3);assert.equal(rewards.weapon,'arc-bolt');assert.ok(rewards.fits.every(Boolean)&&rewards.paused&&!rewards.bar);
 await page.waitForTimeout(250);assert.equal(await page.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScene('Game').elapsed),300);await page.screenshot({path:'boss-reward-preview.png'});await page.mouse.move(40,100);await page.waitForTimeout(150);await page.mouse.click(310,440);await page.waitForFunction(()=>!window.__SURVIVOR_GAME__.scene.getScene('Game').panel.open);
 assert.equal(await page.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScene('Game').weapons.loadout.level('arc-bolt')),2);assert.equal(await page.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScene('Game').physics.world.isPaused),false);await page.evaluate(()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game');s.paused=true;s.physics.pause();});
 const late=await page.evaluate(()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game');s.elapsed=480;s.encounters.update(s.elapsed);s.encounters.update(s.elapsed);return s.enemies.items.filter(e=>e.active&&e.rank==='elite').map(e=>({id:e.eliteId,hp:e.hp,scale:e.scaleX}));});assert.equal(late.length,2);assert.deepEqual(late.map(e=>e.id).sort(),['flesh-elite','night-elite']);
 const king=await page.evaluate(()=>{
  const s=window.__SURVIVOR_GAME__.scene.getScene('Game');s.elapsed=600;s.encounters.update(s.elapsed);s.encounters.update(s.elapsed);for(const e of s.enemies.items)if(e.active&&e.rank!=='boss')e.disableBody(true,true);
  const state=s.bosses.states.find(s=>s.boss.definition.id==='ghost-king'),b=state.boss;b.setPosition(s.player.x+270,s.player.y);s.paused=false;s.player.stats.hp=s.player.stats.maxHp;s.player.invulnerable=0;
  state.wave=0;s.bosses.update(.01);const telegraph=state.cast?.type==='wave',hp=s.player.stats.hp;s.player.y+=250;s.bosses.update(1);const dodged=s.player.stats.hp===hp;
  state.wave=0;state.cast=undefined;s.bosses.update(.01);s.player.invulnerable=0;s.bosses.update(1);const hit=s.player.stats.hp<hp;
  state.wave=100;state.spirits=0;state.cast=undefined;s.bosses.update(.01);const shotWarning=state.cast?.type==='spirits';s.bosses.update(.71);const bullets=s.bosses.bullets.filter(f=>f.life>0).length;
  const projectile=s.bosses.bullets.find(f=>f.life>0);projectile.image.setPosition(s.player.x,s.player.y);s.player.invulnerable=0;const shotHp=s.player.stats.hp;s.bosses.update(.001);const shotHit=s.player.stats.hp<shotHp;
  state.summon=0;s.bosses.update(.01);const gates=s.bosses.gates.filter(g=>g.life>0).length;const before=s.enemies.items.filter(e=>e.active&&e.rank==='normal').length;s.bosses.update(1.9);const gateSpawn=s.enemies.items.filter(e=>e.active&&e.rank==='normal').length>before;
  b.hp=b.maxHp*.49;const wave=state.wave;s.bosses.update(.01);const phase=b.phase===2,haste=wave-state.wave>.012;
  s.paused=true;s.bossHud.update();return {telegraph,dodged,hit,shotWarning,bullets,shotHit,gates,gateSpawn,phase,haste,notVictory:!s.ended,kingCount:s.enemies.items.filter(e=>e.active&&e.rank==='boss').length};
 });
 for(const k of ['telegraph','dodged','hit','shotWarning','shotHit','gateSpawn','phase','haste','notVictory'])assert.equal(king[k],true,k+JSON.stringify(king));assert.equal(king.bullets,8);assert.equal(king.gates,2);assert.equal(king.kingCount,1);
 const attacks=await page.evaluate(async()=>{
  const s=window.__SURVIVOR_GAME__.scene.getScene('Game'),{WEAPON_IDS}=await import('/src/data/weaponConfig.ts'),{WEAPON_EVOLUTIONS}=await import('/src/weapons/evolution/weaponEvolutionDefinitions.ts');
  for(const e of s.enemies.items)if(e.rank!=='boss')e.disableBody(true,true);for(const f of s.bosses.bullets){f.life=0;f.image.setVisible(false);}const b=s.bosses.states[1].boss;b.hp=b.maxHp;
  for(const id of WEAPON_IDS)while(s.weapons.loadout.upgrade(id)){};s.weapons.syncLoadout();s.player.stats.criticalChance=0;
  const check=id=>{b.setPosition(s.player.x+70,s.player.y);s.weapons.searched=false;const w=s.weapons.weapons.get(id);w.timer=0;if(w.combat)w.combat.cooldown=0;const hp=b.hp;w.update(.01);if(id==='hellfire'||id==='infernal-hellfire')w.update(.01);for(const p of s.bolts.items)if(p.active&&p.source===id)s.weapons.hit(p,b);return b.hp<hp;};
  const base=WEAPON_IDS.map(id=>[id,check(id)]);
  for(const e of WEAPON_EVOLUTIONS){s.upgrades.levels[e.requiredUpgradeIds[0]]=1;s.upgrades.evolutions.evolve(e.id);}s.weapons.syncLoadout();const evolved=WEAPON_EVOLUTIONS.map(e=>[e.evolvedWeaponId,check(e.evolvedWeaponId)]);
  s.bosses.update(8);const gateExpired=s.bosses.gates.every(g=>g.life<=0&&!g.image.visible);return {base,evolved,gateExpired};
 });
 assert.ok([...attacks.base,...attacks.evolved].every(x=>x[1]),JSON.stringify(attacks));assert.ok(attacks.gateExpired);
 await page.evaluate(()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game');s.player.stats.hp=s.player.stats.maxHp;s.player.invulnerable=999;s.paused=false;s.physics.resume();const b=s.bosses.states[1].boss;b.hp=b.maxHp*.48;b.setPosition(s.player.x+320,s.player.y);});await page.waitForTimeout(350);await page.screenshot({path:'boss-king-preview.png'});
 await page.evaluate(()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game');s.elapsed=665;s.weapons.strike(s.bosses.states[1].boss,1000000,'thunder-talisman');});await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('GameOver'));
 const result=await page.evaluate(()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('GameOver');return {text:s.children.list.filter(o=>o.type==='Text').map(o=>o.text).join('\n'),data:s.scene.settings.data};});assert.ok(result.text.includes('귀왕을 봉인했습니다')&&result.text.includes('승리'));assert.ok(result.text.includes('11:05'));assert.ok(result.text.includes('원귀 장군')&&result.text.includes('귀왕')&&result.text.includes('천뢰파사부'));
 await page.screenshot({path:'boss-victory-preview.png'});const resultFit=await page.evaluate(async()=>{const {setLocale}=await import('/src/i18n/index.ts'),scene=window.__SURVIVOR_GAME__.scene.getScene('GameOver');setLocale('en');const fit=scene.children.list.filter(o=>o.type==='Text'&&o.y>=226&&o.y<=479).every(t=>t.width<=900);setLocale('ko');return fit;});assert.ok(resultFit);await page.keyboard.press('Enter');await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('Game'));
 const reset=await page.evaluate(()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game');s.paused=true;s.physics.pause();const reset={elapsed:s.elapsed,triggered:s.encounters.triggeredEncounterIds.size,bosses:s.bosses.activeBosses.length,bar:s.bossHud.names.some(t=>t.visible),weapons:[...s.weapons.loadout.entries()]};s.encounters.update(300);s.finish(false);return reset;});assert.ok(reset.elapsed<.3&&reset.triggered===0&&reset.bosses===0&&!reset.bar);assert.deepEqual(reset.weapons,[['arc-bolt',1]]);
 await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('GameOver'));await page.keyboard.press('Enter');await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('Game'));
 assert.equal(await page.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScene('Game').bosses.spawnedIds.size),0);
 const balance=await page.evaluate(async()=>{
  const s=window.__SURVIVOR_GAME__.scene.getScene('Game');s.paused=true;s.physics.pause();for(const e of s.enemies.items)e.disableBody(true,true);
  const {WeaponSystem}=await import('/src/weapons/WeaponSystem.ts'),{BALANCE}=await import('/src/config/balance.ts'),{WEAPON_IDS}=await import('/src/data/weaponConfig.ts'),{UPGRADES}=await import('/src/data/upgrades.ts');
  const original={...s.player.stats},out={};let seed=7;const random=Math.random;Math.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  try{for(const id of ['vengeful-general','ghost-king']){
   const final=id==='ghost-king',b=s.bosses.states.find(state=>state.boss.definition.id===id).boss;
   s.player.stats={...BALANCE.player,damage:BALANCE.player.damage*1.05};for(const key of ['power','rapid','multi','critical'])UPGRADES.find(u=>u.id===key).apply(s.player.stats,1);if(final)for(const key of ['power','rapid','critical','magnet'])UPGRADES.find(u=>u.id===key).apply(s.player.stats,1);
   b.awaken(s.player.x+(final?270:210),s.player.y);b.hp=1e9;
   const bench=new WeaponSystem(s,s.player,s.enemies,s.bolts,()=>{},()=>{});for(const weapon of WEAPON_IDS)while(bench.loadout.level(weapon)<(final?5:3))bench.loadout.upgrade(weapon);
   if(final)for(const [base,evo] of [['arc-bolt','thunder-talisman'],['exorcism-bell','soul-bell'],['hellfire','infernal-hellfire']])bench.loadout.replaceWeapon(base,evo);
   bench.syncLoadout();for(const p of s.bolts.items)p.disableBody(true,true);
   for(let i=0;i<200;i++){bench.update(.05);for(const p of s.bolts.items)if(p.active){p.x+=p.body.velocity.x*.05;p.y+=p.body.velocity.y*.05;if(Math.hypot(p.x-b.x,p.y-b.y)<=b.collisionRadius+5)bench.hit(p,b);}}
   const dps=(1e9-b.hp)/10;out[id]={dps:Math.round(dps),standingFightSeconds:Math.round(b.definition.hp/dps)};bench.destroy();b.disableBody(true,true);
  }}finally{Math.random=random;s.player.stats=original;}
  return out;
 });
 assert.ok(balance['vengeful-general'].standingFightSeconds>=20&&balance['vengeful-general'].standingFightSeconds<=60,JSON.stringify(balance));
 assert.ok(balance['ghost-king'].standingFightSeconds>=50&&balance['ghost-king'].standingFightSeconds<=120,JSON.stringify(balance));
 // Boss XP reward queues a normal level-up. A short keypress must choose exactly one card.
 await page.evaluate(()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game');s.levels.level=1;s.levels.xp=0;s.levels.pending=0;s.bossRewards.random=()=>.4;s.pendingRewards.push('vengeful-general');s.paused=false;s.showBossReward();});
 assert.equal(await page.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScene('Game').panel.choices[0].definition.bossRewardId),'souls');
 await page.keyboard.press('1',{delay:5});
 await page.waitForFunction(()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game');return s.panel.open&&s.panel.choices.every(c=>!c.definition.bossRewardId);});
 await page.waitForTimeout(180);assert.equal(await page.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScene('Game').panel.open),true);
 await page.keyboard.press('2',{delay:5});await page.waitForFunction(()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game');return !s.panel.open&&!s.physics.world.isPaused;});
 await page.evaluate(()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game');s.paused=true;s.physics.pause();});
 const performanceResult=await page.evaluate(()=>{
  const s=window.__SURVIVOR_GAME__.scene.getScene('Game');for(let i=0;i<350;i++){const a=i*2.39996,r=60+i%12*38;s.enemies.acquire()?.spawn(s.player.x+Math.cos(a)*r,s.player.y+Math.sin(a)*r,['grunt','runner','tank'][i%3],100,0);}
  s.bosses.spawnBoss('ghost-king');s.bosses.states[1].boss.hp*=.49;const costs=[];
  for(let i=0;i<240;i++){const start=performance.now();s.bosses.update(.05);s.elites.update(.05);s.bossHud.update();costs.push(performance.now()-start);}costs.sort((a,b)=>a-b);
  return {enemies:s.enemies.items.filter(e=>e.active).length,p95Ms:costs[Math.floor(costs.length*.95)],bullets:s.bosses.bullets.length,gates:s.bosses.gates.length};
 });assert.ok(performanceResult.enemies>=350&&performanceResult.p95Ms<12,JSON.stringify(performanceResult));assert.equal(performanceResult.bullets,32);assert.equal(performanceResult.gates,3);
 assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);console.log(JSON.stringify({result:'PASS',elite,general,rewards,king,attacks,reset,balance,performanceResult,notes:'12 weapon damage paths; real boss reward selection; timer is not victory; king defeat wins; Retry after victory/death'}));
}finally{await browser?.close();await server.close();}
