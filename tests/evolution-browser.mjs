import { chromium } from '@playwright/test';
import { createServer } from 'vite';
import assert from 'node:assert/strict';
const server=await createServer({server:{host:'127.0.0.1',port:5176}});await server.listen();let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||undefined,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[],missing=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()===404)missing.push(r.url());});
 await page.goto('http://127.0.0.1:5176');await page.waitForFunction(()=>window.__SURVIVOR_GAME__?.scene.isActive('Menu'));await page.keyboard.press('Enter');await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('CharacterSelect'));await page.keyboard.press('Enter');await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('Game'));
 await page.evaluate(async()=>{
  const s=window.__SURVIVOR_GAME__.scene.getScene('Game');s.paused=true;s.physics.pause();
  const {WEAPON_IDS}=await import('/src/data/weaponConfig.ts'),{UPGRADES}=await import('/src/data/upgrades.ts'),{WEAPON_EVOLUTIONS}=await import('/src/weapons/evolution/weaponEvolutionDefinitions.ts');
  for(const id of WEAPON_IDS)while(s.weapons.loadout.upgrade(id)){}
  for(const e of WEAPON_EVOLUTIONS)s.upgrades.apply({definition:UPGRADES.find(u=>u.id===e.requiredUpgradeIds[0]),rarity:'Common'},s.player.stats);
  s.weapons.syncLoadout();window.evolutionDefs=WEAPON_EVOLUTIONS;window.passiveStats={...s.player.stats};
 });
 const results=[];
 for(let i=0;i<6;i++){
  const offer=await page.evaluate(i=>{
   const s=window.__SURVIVOR_GAME__.scene.getScene('Game'),e=window.evolutionDefs[i], available=s.upgrades.evolutions.getAvailableEvolutions();let calls=0;
   s.upgrades.random=()=>calls++===0?(available.findIndex(x=>x.id===e.id)+.1)/available.length:.2;s.levels.pending=1;s.showUpgrade();s.upgrades.random=Math.random;
   window.previousWeapon=s.weapons.weapons.get(e.baseWeaponId);const w=window.previousWeapon;w.update(.001);window.previousVisuals=[...(w.beads??[]),...(w.fields??[]).map(f=>f.image),w.wave,w.echoWave,...(w.slashes??[])].filter(Boolean);window.oldBolt=s.bolts.acquire();window.oldBolt.fire(s.player.x,s.player.y,0,0,1,0,false,10);window.oldBolt.source=e.baseWeaponId;
   return {first:s.panel.choices[0].definition.evolutionId,count:s.panel.choices.filter(c=>c.definition.evolutionId).length};
  },i);
  assert.equal(offer.first,await page.evaluate(i=>window.evolutionDefs[i].id,i));assert.equal(offer.count,1);
  {if(i===0){await page.waitForTimeout(300);await page.screenshot({path:'evolution-cards-preview.png'});}const fit=await page.evaluate(async()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game');const {setLocale}=await import('/src/i18n/index.ts');const out=[];for(const lang of ['ko','en']){setLocale(lang);const texts=s.panel.objects.filter(o=>o.type==='Text'&&o.x<470&&o.y>=288);out.push({lang,fit:texts.every(t=>t.width<=270&&t.y+t.height<(t.y===466?531:601)),text:texts.map(t=>t.text)});}setLocale('ko');return out;});assert.ok(fit.every(x=>x.fit),JSON.stringify(fit));}
  await page.mouse.move(40,100);await page.waitForTimeout(180);await page.mouse.click(310,440);await page.waitForFunction(()=>!window.__SURVIVOR_GAME__.scene.getScene('Game').panel.open);await page.waitForTimeout(100);
  const changed=await page.evaluate(i=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game'),e=window.evolutionDefs[i];s.physics.pause();return {base:s.weapons.loadout.level(e.baseWeaponId),evolved:s.weapons.loadout.level(e.evolvedWeaponId),size:s.weapons.loadout.size,removed:!s.weapons.weapons.has(e.baseWeaponId),replaced:s.weapons.weapons.get(e.evolvedWeaponId)!==window.previousWeapon,cleaned:!window.oldBolt.active&&window.previousVisuals.every(v=>!v.scene),passives:JSON.stringify(s.player.stats)===JSON.stringify(window.passiveStats),repeat:s.upgrades.roll().some(c=>c.definition.evolutionId===e.id)};},i);
  assert.deepEqual(changed,{base:0,evolved:1,size:6,removed:true,replaced:true,cleaned:true,passives:true,repeat:false});results.push(changed);
 }
 const attacks=await page.evaluate(()=>{
  const s=window.__SURVIVOR_GAME__.scene.getScene('Game');s.player.stats.criticalChance=0;
  const clean=()=>{for(const e of s.enemies.items)e.disableBody(true,true);for(const b of s.bolts.items)b.disableBody(true,true);s.weapons.searched=false;};
  const spawn=(x,y)=>{const e=s.enemies.acquire();e.spawn(s.player.x+x,s.player.y+y,'tank',100,0);return e;};const out={};
  clean();const target=spawn(80,0),near=spawn(145,0),far=spawn(700,0),t=s.weapons.weapons.get('thunder-talisman');t.update(1);const bolt=s.bolts.items.find(b=>b.active&&b.source===t.id);const before=near.hp;s.weapons.hit(bolt,target);out.chain=near.hp<before&&far.hp===17000;
  clean();const r=s.weapons.weapons.get('vajra-rosary');r.update(.01);const bead=r.beads[0],re=spawn(bead.x-s.player.x,bead.y-s.player.y);r.scan=0;r.update(.001);const hp=re.hp;r.scan=0;r.update(.001);out.rosary=r.beads.length===6&&r.stats.range>86&&hp<17000&&re.hp===hp;
  clean();const be=spawn(260,0),bell=s.weapons.weapons.get('soul-bell');bell.timer=0;bell.update(.01);const bh=be.hp;bell.update(.1);const unchanged=be.hp===bh;bell.update(.21);out.echo=bh<17000&&unchanged&&be.hp<bh&&bell.echoWave.visible;
  clean();spawn(100,0);const peripheral=spawn(110,70),sword=s.weapons.weapons.get('thunder-god-sword');sword.timer=0;sword.update(.01);out.sword=peripheral.hp<17000&&s.weapons.effects.effects.some(f=>f.life>0)&&sword.stats.range>220;
  clean();const ae=spawn(110,0),ae2=spawn(200,0),arrow=s.weapons.weapons.get('demon-slayer-bow');arrow.timer=0;arrow.update(.01);const arrows=s.bolts.items.filter(b=>b.active&&b.source===arrow.id),a=arrows[0];const damage=a.damage;s.weapons.hit(a,ae);s.weapons.hit(a,ae2);out.arrow=arrows.length===4&&a.pierce>=12&&a.damage===damage&&ae2.hp<17000&&Math.hypot(a.body.velocity.x,a.body.velocity.y)>920;
  clean();const he=spawn(100,0),hell=s.weapons.weapons.get('infernal-hellfire');hell.timer=0;hell.update(.01);hell.update(.01);const hh=he.hp;hell.update(.1);const tick=he.hp===hh;hell.update(.21);out.hellfire=hell.fields.filter(f=>f.life>0).length===3&&hell.stats.radius>94&&hell.stats.duration>3.4&&tick&&he.hp<hh&&hell.fields[0].image.texture.key==='infernal-seal';
  clean();for(let i=0;i<350;i++){const a=i*2.39996,r=60+(i%12)*38;spawn(Math.cos(a)*r,Math.sin(a)*r);}const costs=[];for(let i=0;i<120;i++){const start=performance.now();s.weapons.update(.05);for(const b of s.bolts.items)if(b.active){const e=s.enemies.items.find(e=>e.active&&Math.hypot(e.x-b.x,e.y-b.y)<180);if(e)s.weapons.hit(b,e);}costs.push(performance.now()-start);}
  costs.sort((a,b)=>a-b);out.updateP95=costs[Math.floor(costs.length*.95)];out.pool=s.weapons.effects.effects.length;out.allHit=window.evolutionDefs.every(e=>(s.weapons.hits[e.evolvedWeaponId]??0)>0);return out;
 });
 for(const id of ['chain','rosary','echo','sword','arrow','hellfire','allHit'])assert.equal(attacks[id],true,id+JSON.stringify(attacks));assert.equal(attacks.pool,12);assert.ok(attacks.updateP95<30,JSON.stringify(attacks));
 await page.evaluate(()=>{for(const e of window.__SURVIVOR_GAME__.scene.getScene('Game').enemies.items)if(e.active){e.clearTint();e.flash=0;}});await page.waitForTimeout(1400);await page.screenshot({path:'evolution-combat-preview.png'});
 await page.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScene('Game').finish(false));await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('GameOver'));await page.keyboard.press('Enter');await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('Game'));
 assert.deepEqual(await page.evaluate(()=>[...window.__SURVIVOR_GAME__.scene.getScene('Game').weapons.loadout.entries()]),[['arc-bolt',1]]);
 assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);console.log(JSON.stringify({result:'PASS',evolutions:results.length,attacks,retry:'base Lv1',errors,missing}));
}finally{await browser?.close();await server.close();}
