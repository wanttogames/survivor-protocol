import {chromium} from '@playwright/test';
import {createServer} from 'vite';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const server=await createServer({server:{host:'127.0.0.1',port:5182}});await server.listen();let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||undefined,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[],missing=[];page.on('pageerror',e=>{errors.push(e.message);console.error(e.stack);});page.on('response',r=>{if(r.status()===404)missing.push(r.url());});
 await page.goto('http://127.0.0.1:5182');await page.waitForFunction(()=>window.__SURVIVOR_GAME__?.scene.isActive('Menu'));await page.keyboard.press('Enter',{delay:80});await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('CharacterSelect'));await page.keyboard.press('Enter',{delay:80});await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('Game'));
 const geometry=await page.evaluate(async()=>{
  const s=window.__SURVIVOR_GAME__.scene.getScene('Game'),{getMapCollisionZones}=await import('/src/maps/mapDefinitions.ts');s.paused=true;s.physics.pause();for(const e of s.enemies.items)e.disableBody(true,true);s.player.invulnerable=999;
  s.__collisionRects=getMapCollisionZones(s.mapManager.definition);
  s.__collisionStep=(vx,vy,n=60)=>{s.physics.resume();s.player.setVelocity(vx,vy);for(let i=0;i<n;i++){s.physics.world.update(i*1000/60,1000/60);s.physics.world.postUpdate();}s.physics.pause();s.player.setVelocity(0,0);};
  s.__place=(x,y)=>{s.player.body.reset(x,y);s.player.move(0,0,0);s.player.setAlpha(1);};
  return {count:s.mapManager.collisions.zones.length,staticBodies:s.physics.world.staticBodies.size,bodyRadius:s.player.body.radius,colliders:s.physics.world.colliders.getActive().length,area:s.__collisionRects.reduce((n,z)=>n+z.width*z.height,0)/(3600*3600)};
 });assert.equal(geometry.count,33);assert.equal(geometry.staticBodies,33);assert.equal(geometry.bodyRadius,15);assert.equal(geometry.colliders,3);assert.ok(geometry.area<.025);
 const solids=await page.evaluate(()=>{
  const s=window.__SURVIVOR_GAME__.scene.getScene('Game'),results={};
  for(const id of ['village-east-house:body','abandoned-shrine:body','village-east-house:wall-0:left','western-boulder:body','shrine-altar']){
   const z=s.__collisionRects.find(z=>z.id===id),bottom=z.y+z.height/2;
   s.__place(z.x,bottom+45);s.__collisionStep(0,-180,55);
   const positions=[];for(let i=0;i<10;i++){s.__collisionStep(0,-180,1);positions.push(s.player.y);}
   results[id]={blocked:s.player.y>=bottom+14.8&&s.player.y<=bottom+15.2,jitter:Math.max(...positions)-Math.min(...positions),position:[s.player.x,s.player.y]};
  }
  const house=s.__collisionRects.find(z=>z.id==='village-east-house:body'),x=house.x-house.width/2-16,y=house.y+house.height/2+18;
  s.__place(x,y);s.__collisionStep(125,-125,180);results.diagonal={escaped:s.player.x>house.x+house.width/2||s.player.y<house.y-house.height/2,position:[s.player.x,s.player.y]};
  // Slide horizontally across both halves of a stone wall without an internal seam trap.
  const wall=s.__collisionRects.find(z=>z.id==='village-east-house:wall-0:left');s.__place(wall.x-wall.width/2-18,wall.y+wall.height/2+16);s.__collisionStep(150,-100,95);results.wallSeam={passed:s.player.x>wall.x+wall.width*1.5,position:[s.player.x,s.player.y]};
  // Rooves do not block motion; the body stays below their visual overhang.
  s.__place(house.x-house.width/2-40,2450-75);const start=s.player.x;s.__collisionStep(180,0,140);results.roof={passed:s.player.x>start+300};
  return results;
 });for(const [id,r] of Object.entries(solids)){if('blocked'in r)assert.ok(r.blocked&&r.jitter<.1,id+JSON.stringify(r));else assert.ok(r.escaped??r.passed,id+JSON.stringify(r));}
 const decor=await page.evaluate(()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game'),out={};for(const [id,x,y] of [['jangseung',1910,1710],['graveyard',2580,1400],['seal',1660,1180]]){s.__place(x-55,y);s.__collisionStep(160,0,55);out[id]=s.player.x>x+55;}return out;});assert.ok(Object.values(decor).every(Boolean));
 // One actual held-key approach, using normal GameScene update and Arcade collision.
 const target=await page.evaluate(()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game'),z=s.__collisionRects.find(z=>z.id==='village-east-house:body');s.__place(z.x,z.y+z.height/2+45);s.paused=false;s.physics.resume();return z.y+z.height/2+15;});await page.keyboard.down('W');await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.getScene('Game').player.body.blocked.up);await page.keyboard.up('W');const keyboard=await page.evaluate(()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game');s.paused=true;s.physics.pause();s.player.setVelocity(0,0);return s.player.y;});assert.ok(Math.abs(keyboard-target)<.3);
 fs.mkdirSync('collision-previews',{recursive:true});
 for(const [name,x,y] of [['house',2190,2450],['shrine',1500,780],['wall',2045,2625],['rock',650,1000]]){
  await page.evaluate(({x,y})=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game');s.mapManager.collisions.setDebugVisible(true);s.cameras.main.stopFollow();s.cameras.main.centerOn(x,y);s.mapManager.update(.3,[],false);},{x,y});await page.waitForTimeout(180);await page.screenshot({path:`collision-previews/${name}.png`});
 }
 const bypass=await page.evaluate(()=>{
  const s=window.__SURVIVOR_GAME__.scene.getScene('Game'),z=s.__collisionRects.find(z=>z.id==='village-east-house:body'),bottom=z.y+z.height/2;
  s.mapManager.collisions.setDebugVisible(false);s.__place(z.x+170,z.y);const e=s.enemies.acquire();e.spawn(z.x,bottom+40,'grunt',100,1);e.setVelocity(0,-180);s.__collisionStep(0,0,70);const enemyPassed=e.y<z.y-z.height/2;
  const b=s.bolts.acquire();b.fire(z.x,bottom+40,-Math.PI/2,180,1,0,false,10);s.__collisionStep(0,0,70);const projectilePassed=b.y<z.y-z.height/2;b.disableBody(true,true);e.disableBody(true,true);
  const bosses={};for(const id of ['vengeful-general','ghost-king']){s.bosses.spawnBoss(id);const boss=s.bosses.activeBosses.find(b=>b.definition.id===id);boss.body.reset(z.x,bottom+60);s.__place(z.x,z.y-z.height/2-150);for(let i=0;i<300;i++){boss.chase(s.player.x,s.player.y,1/60);s.__collisionStep(0,0,1);}bosses[id]=boss.y<z.y-z.height/2;boss.disableBody(true,true);}
  return {enemyPassed,projectilePassed,bosses};
 });assert.ok(bypass.enemyPassed&&bypass.projectilePassed&&Object.values(bypass.bosses).every(Boolean));
 const drops=await page.evaluate(async()=>{
  const s=window.__SURVIVOR_GAME__.scene.getScene('Game'),{isMapSpawnSafe}=await import('/src/maps/spawnSafety.ts'),z=s.__collisionRects.find(z=>z.id==='village-east-house:body');s.__place(z.x,z.y+z.height/2+15.1);
  const orb=s.orbs.acquire();orb.spawn(z.x,z.y,2);const xp=s.levels.xp;for(let i=0;i<50;i++)s.updateOrbs(.02);const xpCollected=!orb.active&&s.levels.xp>xp;
  const elite=s.enemies.acquire();elite.spawn(z.x,z.y,'grunt',1,1);elite.rank='elite';elite.eliteId='spirit-elite';s.elites.defeated(elite,()=>0);elite.disableBody(true,true);const f=s.elites.healing.find(f=>f.life>0),healSafe=isMapSpawnSafe(f.image.x,f.image.y,22);s.player.stats.hp=20;s.__place(f.image.x,f.image.y);s.elites.update(.01);return {xpCollected,healSafe,healed:s.player.stats.hp>20};
 });assert.ok(drops.xpCollected&&drops.healSafe&&drops.healed);
 const spawn=await page.evaluate(async()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game'),{isMapSpawnSafe}=await import('/src/maps/spawnSafety.ts'),out={};for(const z of s.__collisionRects){s.spawn.update(10,300,z.x,z.y);s.elites.spawn('spirit-elite',1,300);}for(const e of s.enemies.items)if(e.active){out.safe=(out.safe??true)&&isMapSpawnSafe(e.x,e.y,e.rank==='elite'?75:45);e.disableBody(true,true);}return out;});assert.ok(spawn.safe);
 // Rebinding player does not add duplicate colliders.
 assert.equal(await page.evaluate(()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game');s.mapManager.attachPlayer(s.player);s.__collisionStep(0,0,1);return s.physics.world.colliders.getActive().length;}),3);
 const retries=[];for(let i=0;i<3;i++){
  await page.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScene('Game').finish(false));await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('GameOver'));await page.keyboard.press('Enter',{delay:80});await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('Game'));
  retries.push(await page.evaluate(()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game');s.paused=true;s.physics.pause();return {blockers:s.mapManager.collisions.zones.length,staticBodies:s.physics.world.staticBodies.size,dynamicBodies:s.physics.world.bodies.size,terrain:s.children.list.filter(o=>o.name==='map:terrain').length,fog:s.mapManager.view.fog.length,debugVisible:s.children.list.some(o=>o.name==='map-collision-debug'&&o.visible),textures:Object.keys(s.textures.list).filter(k=>k.startsWith('mv-')).length};}));
 }for(const r of retries){assert.equal(r.blockers,33);assert.equal(r.staticBodies,33);assert.equal(r.terrain,36);assert.equal(r.fog,8);assert.equal(r.debugVisible,false);assert.deepEqual(r,retries[0]);}
 assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);console.log(JSON.stringify({result:'PASS',geometry,solids,decor,keyboard,bypass,drops,spawn,retries,errors,missing}));
}finally{await browser?.close();await server.close();}
