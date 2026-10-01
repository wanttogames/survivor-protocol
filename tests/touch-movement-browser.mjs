import {chromium} from '@playwright/test';
import {createServer} from 'vite';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const server=await createServer({server:{host:'127.0.0.1',port:5187}});await server.listen();let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||undefined,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const errors=[];
 const start=async page=>{page.on('pageerror',e=>{errors.push(e.message);console.error(e.stack);});await page.goto('http://127.0.0.1:5187');await page.waitForFunction(()=>window.__SURVIVOR_GAME__?.scene.isActive('Menu'));if(await page.evaluate(()=>navigator.maxTouchPoints>0)){const tap=async(x,y)=>{const c=await page.locator('canvas').boundingBox();await page.touchscreen.tap(c.x+x*c.width/1280,c.y+y*c.height/800);};await tap(242,560);await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('CharacterSelect'));assert.equal(await page.locator('.virtual-joystick').count(),0);await tap(640,744);}else await page.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScene('Menu').scene.start('Game'));await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('Game'));await page.evaluate(()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game');s.player.invulnerable=99999;s.spawn.update=()=>{};});};
 const state=page=>page.evaluate(()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game');return {x:s.player.x,y:s.player.y,vx:s.player.body.velocity.x,vy:s.player.body.velocity.y,speed:s.player.stats.moveSpeed,d:s.movementInput.getMovementVector()};});
 const desktop=await browser.newPage({viewport:{width:1280,height:800}});await start(desktop);assert.equal(await desktop.locator('.virtual-joystick').count(),0);
 for(const keys of [['d'],['ArrowLeft'],['w','d'],['ArrowUp','ArrowRight']]){
  const before=await state(desktop);for(const key of keys)await desktop.keyboard.down(key);await desktop.waitForTimeout(350);const after=await state(desktop);
  assert.ok(Math.hypot(after.x-before.x,after.y-before.y)>10);assert.ok(Math.abs(Math.hypot(after.vx,after.vy)-after.speed)<1e-5);
  for(const key of keys)await desktop.keyboard.up(key);await desktop.waitForTimeout(70);assert.equal((await state(desktop)).vx,0);assert.equal((await state(desktop)).vy,0);
 }
 await desktop.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScene('Game').finish(false));await desktop.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('GameOver'));assert.equal(await desktop.locator('.mobile-result-actions').count(),0);
 await desktop.mouse.click(640,584);await desktop.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('Game'));
 await desktop.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScene('Game').finish(true));await desktop.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('GameOver'));await desktop.mouse.click(640,649);await desktop.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('Menu'));
 await desktop.close();
 const page=await browser.newPage({viewport:{width:844,height:390},isMobile:true,hasTouch:true});await start(page);
 const cdp=await page.context().newCDPSession(page);const touch=(type,touchPoints)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints});
 const box=async()=>{const b=await page.locator('.virtual-joystick').boundingBox();assert.ok(b);return {b,x:b.x+b.width/2,y:b.y+b.height/2};};
 for(const [dx,dy] of [[65,0],[-65,0],[0,65],[0,-65],[65,65]]){
  const center=await box(),before=await state(page);await touch('touchStart',[{id:7,x:center.x,y:center.y}]);await touch('touchMove',[{id:7,x:center.x+dx,y:center.y+dy}]);await page.waitForTimeout(350);const after=await state(page);
  assert.ok(Math.hypot(after.x-before.x,after.y-before.y)>2,JSON.stringify({dx,dy,before,after}));assert.ok(Math.abs(Math.hypot(after.vx,after.vy)-after.speed)<1e-5);assert.ok(Math.sign(after.vx)===Math.sign(dx)&&Math.sign(after.vy)===Math.sign(dy));
  await touch('touchEnd',[]);assert.deepEqual((await state(page)).d,{x:0,y:0});assert.equal((await state(page)).vx,0);assert.equal((await state(page)).vy,0);
 }
 const center=await box();await touch('touchStart',[{id:7,x:center.x,y:center.y}]);await touch('touchMove',[{id:7,x:center.x+2,y:center.y}]);await page.waitForTimeout(80);assert.deepEqual((await state(page)).d,{x:0,y:0});await touch('touchEnd',[]);
 // Drag outside the base, camera follow and second finger neither redirect nor release the owner.
 const fixed=await box();await touch('touchStart',[{id:7,x:fixed.x,y:fixed.y}]);await touch('touchMove',[{id:7,x:fixed.x+160,y:fixed.y}]);await page.waitForTimeout(350);assert.deepEqual((await state(page)).d,{x:1,y:0});
 const fixedAfter=await box();assert.deepEqual(fixedAfter.b,fixed.b);
 await touch('touchStart',[{id:7,x:fixed.x+160,y:fixed.y},{id:9,x:160,y:190}]);await touch('touchMove',[{id:7,x:fixed.x+160,y:fixed.y},{id:9,x:100,y:100}]);assert.deepEqual((await state(page)).d,{x:1,y:0});
 await touch('touchEnd',[{id:9,x:100,y:100}]);assert.deepEqual((await state(page)).d,{x:1,y:0});await touch('touchCancel',[]);assert.deepEqual((await state(page)).d,{x:0,y:0});assert.equal((await state(page)).vx,0);
 // Existing keyboard still wins on a touch-capable machine.
 const hybrid=await box();await touch('touchStart',[{id:7,x:hybrid.x,y:hybrid.y}]);await touch('touchMove',[{id:7,x:hybrid.x+60,y:hybrid.y}]);await page.keyboard.down('a');await page.waitForTimeout(80);assert.ok((await state(page)).vx<0);await page.keyboard.up('a');await touch('touchEnd',[]);
 // Level up while holding the stick: hidden, reset, tap a real card, fresh touch required.
 const held=await box();await touch('touchStart',[{id:7,x:held.x,y:held.y}]);await touch('touchMove',[{id:7,x:held.x+60,y:held.y}]);
 await page.evaluate(()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game');s.levels.pending=1;s.showUpgrade();});await touch('touchEnd',[]);assert.equal(await page.locator('.virtual-joystick').isVisible(),false);assert.deepEqual((await state(page)).d,{x:0,y:0});
 const canvas=await page.locator('canvas').boundingBox();await page.touchscreen.tap(canvas.x+310*canvas.width/1280,canvas.y+432*canvas.height/800);await page.waitForTimeout(120);assert.ok(await page.locator('.virtual-joystick').isVisible());assert.deepEqual((await state(page)).d,{x:0,y:0});
 // Existing DOM talisman buttons still accept touch and suspend joystick.
 await page.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScene('Game').triggerTalismanEvent('trick'));assert.equal(await page.locator('.virtual-joystick').isVisible(),false);await page.locator('.reject').tap();await page.waitForTimeout(90);assert.ok(await page.locator('.virtual-joystick').isVisible());
 // Boss rewards use the same input exclusion without changing reward selection.
 await page.evaluate(()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game');s.pendingRewards.push('vengeful-general');s.showBossReward();});assert.equal(await page.locator('.virtual-joystick').isVisible(),false);
 const soulIndex=await page.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScene('Game').panel.choices.findIndex(c=>c.definition.bossRewardId==='souls'));assert.ok(soulIndex>=0);
 await page.touchscreen.tap(canvas.x+(310+soulIndex*330)*canvas.width/1280,canvas.y+432*canvas.height/800);await page.waitForTimeout(150);
 assert.ok(await page.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScene('Game').panel.open));
 for(let i=0;i<20&&await page.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScene('Game').panel.open);i++){
  assert.equal(await page.locator('.virtual-joystick').isVisible(),false);
  await page.touchscreen.tap(canvas.x+310*canvas.width/1280,canvas.y+432*canvas.height/800);await page.waitForTimeout(150);
 }
 await page.waitForFunction(()=>!window.__SURVIVOR_GAME__.scene.getScene('Game').panel.open);assert.ok(await page.locator('.virtual-joystick').isVisible());
 await mkdir('touch-previews',{recursive:true});
 for(const viewport of [{width:390,height:844},{width:844,height:390},{width:320,height:568},{width:1024,height:768}]){
  await page.setViewportSize(viewport);await page.waitForTimeout(800);const r=await box();assert.ok(r.b.x>=0&&r.b.y>=0&&r.b.x+r.b.width<=viewport.width&&r.b.y+r.b.height<=viewport.height);
  const frame=await page.locator('canvas').boundingBox();assert.ok(frame.x>=-1&&frame.y>=-1&&frame.x+frame.width<=viewport.width+1&&frame.y+frame.height<=viewport.height+1,JSON.stringify({viewport,frame,metrics:await page.evaluate(()=>({width:innerWidth,height:innerHeight,visualWidth:visualViewport.width,visualHeight:visualViewport.height,scale:visualViewport.scale,game:document.getElementById('game').getBoundingClientRect().toJSON()}))}));
  assert.ok(Math.abs(viewport.width-r.b.x-r.b.width-Math.max(18,viewport.width-frame.x-frame.width+18))<1);
  assert.ok(r.b.y>=frame.y+frame.height||r.b.y+r.b.height<frame.y+704*frame.height/800);
  await page.screenshot({path:`touch-previews/${viewport.width}.png`});
 }
 // Blur/Scene pause/death release ownership; Retry creates exactly one fresh control.
 await page.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScene('Game').scene.pause());assert.equal(await page.locator('.virtual-joystick').isVisible(),false);await page.evaluate(()=>window.__SURVIVOR_GAME__.scene.resume('Game'));await page.waitForTimeout(80);
 await page.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScene('Game').finish(false));await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('GameOver'));assert.equal(await page.locator('.virtual-joystick').count(),0);
 await page.locator('.mobile-result-actions [data-action=retry]').tap();await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('Game'));assert.equal(await page.locator('.mobile-result-actions').count(),0);assert.equal(await page.locator('.virtual-joystick').count(),1);assert.deepEqual((await state(page)).d,{x:0,y:0});
 await page.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScene('Game').finish(true));await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('GameOver'));assert.equal(await page.locator('.virtual-joystick').count(),0);
 const tapCanvas=async(x,y)=>{await page.waitForTimeout(150);const c=await page.locator('canvas').boundingBox();await page.touchscreen.tap(c.x+x*c.width/1280,c.y+y*c.height/800);};
 await page.locator('.mobile-result-actions [data-action=menu]').tap();await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('Menu'));assert.equal(await page.locator('.virtual-joystick').count(),0);
 await tapCanvas(242,560);await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('CharacterSelect'));await tapCanvas(640,744);await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('Game'));assert.equal(await page.locator('.virtual-joystick').count(),1);assert.deepEqual((await state(page)).d,{x:0,y:0});
 // Small offset taps must still work: original FIT buttons were only ~18px high in portrait.
 for(const [i,viewport] of [{width:390,height:844},{width:844,height:390},{width:320,height:568},{width:1024,height:768}].entries()){
  await page.setViewportSize(viewport);await page.waitForTimeout(800);
  await page.evaluate(async locale=>{(await import('/src/i18n/index.ts')).setLocale(locale);const s=window.__SURVIVOR_GAME__.scene.getScene('Game');s.player.invulnerable=99999;s.spawn.update=()=>{};},i%2?'en':'ko');
  const owner=await box();await touch('touchStart',[{id:7,x:owner.x,y:owner.y}]);await touch('touchMove',[{id:7,x:owner.x-60,y:owner.y}]);
  await page.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScene('Game').finish(false));await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('GameOver'));await touch('touchEnd',[]);
  assert.equal(await page.locator('.virtual-joystick').count(),0);assert.equal(await page.locator('.mobile-result-actions').count(),1);
  assert.ok(await page.evaluate(()=>window.__SURVIVOR_GAME__.input.pointers.slice(1).every(p=>!p.active)),'No stuck Phaser touch after death while dragging');
  const retry=await page.locator('.mobile-result-actions [data-action=retry]').boundingBox();const menu=await page.locator('.mobile-result-actions [data-action=menu]').boundingBox();
  for(const r of [retry,menu])assert.ok(r.height>=48&&r.x>=0&&r.y>=0&&r.x+r.width<=viewport.width&&r.y+r.height<=viewport.height);
  assert.ok(retry.x+retry.width<=menu.x);await page.screenshot({path:`touch-previews/result-${viewport.width}.png`});
  await page.touchscreen.tap(retry.x+retry.width/2,retry.y+retry.height/2-14);await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('Game'));
  assert.equal(await page.locator('.mobile-result-actions').count(),0);assert.equal(await page.locator('.virtual-joystick').count(),1);assert.deepEqual((await state(page)).d,{x:0,y:0});
  await page.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScene('Game').finish(true));await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('GameOver'));
  const m=await page.locator('.mobile-result-actions [data-action=menu]').boundingBox();await page.touchscreen.tap(m.x+m.width/2,m.y+m.height/2+14);await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('Menu'));
  assert.equal(await page.locator('.mobile-result-actions').count(),0);assert.equal(await page.locator('.virtual-joystick').count(),0);
  await tapCanvas(242,560);await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('CharacterSelect'));await tapCanvas(640,744);await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('Game'));assert.equal(await page.locator('.virtual-joystick').count(),1);
 }
 assert.deepEqual(errors,[]);console.log(JSON.stringify({result:'PASS',keyboard:true,cardinal:true,diagonal:true,deadZone:true,outside:true,cancel:true,multiTouch:true,hybrid:true,cameraFixed:true,cards:true,talismans:true,bossReward:true,responsive:true,retry:true,victory:true,menuTouch:true,newGame:true,rightHanded:true,resultTouchTargets:true,resultOffsetTaps:true,desktopResults:true,errors}));
}finally{await browser?.close();await server.close();}
