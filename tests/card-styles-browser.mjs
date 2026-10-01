import {chromium} from '@playwright/test';
import {createServer} from 'vite';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const server=await createServer({server:{host:'127.0.0.1',port:5185}});await server.listen();let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||undefined,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5185');await page.waitForFunction(()=>window.__SURVIVOR_GAME__?.scene.isActive('Menu'));
 await page.keyboard.press('Enter');await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('CharacterSelect'));await page.keyboard.press('Enter');await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('Game'));
 await mkdir('card-previews',{recursive:true});
 const show=async(mode,locale)=>{
  await page.mouse.move(20,30);
  await page.evaluate(async({mode,locale})=>{
   const s=window.__SURVIVOR_GAME__.scene.getScene('Game'),{UPGRADES}=await import('/src/data/upgrades.ts'),{WEAPON_EVOLUTIONS}=await import('/src/weapons/evolution/weaponEvolutionDefinitions.ts'),{setLocale}=await import('/src/i18n/index.ts');
   s.paused=true;s.physics.pause();setLocale(locale);window.cardSelected=[];
   let choices=['Common','Rare','Epic'].map((rarity,i)=>({rarity,definition:UPGRADES[i]}));
   if(mode==='common')choices=choices.map(c=>({...c,rarity:'Common'}));
   if(mode==='special'){
    const e=WEAPON_EVOLUTIONS[0];choices[1]={rarity:'Epic',definition:{id:e.id,evolutionId:e.id,nameKey:e.nameKey,descriptionKey:e.descriptionKey,descriptionParams:()=>({}),maxLevel:1,icon:'',apply:()=>{}}};
    choices[2]=s.bossRewards.getBossRewardOptions(s.player.stats)[1];
   }
   if(mode==='boss')choices=s.bossRewards.getBossRewardOptions(s.player.stats);
   s.panel.show(choices,c=>window.cardSelected.push(c.definition.id),mode==='boss'?{bossNameKey:'boss.general.name'}:undefined);
  },{mode,locale});
  await page.waitForTimeout(400);
  const state=await page.evaluate(()=>{
   const s=window.__SURVIVOR_GAME__.scene.getScene('Game');return {kinds:s.panel.objects.filter(o=>o.getData('cardKind')).map(o=>o.getData('cardKind')),overflow:s.panel.objects.filter(o=>o.type==='Text'&&o.x>=190&&o.x<=850&&o.y>=280&&o.y<602).filter(o=>o.width>250.1||o.y+o.height>595).map(o=>o.text)};
  });assert.deepEqual(state.overflow,[]);await page.screenshot({path:`card-previews/${mode}-${locale}.png`});return state;
 };
 for(const locale of ['ko','en']){
  assert.deepEqual((await show('common',locale)).kinds,['Common','Common','Common']);
  assert.deepEqual((await show('mixed',locale)).kinds,['Common','Rare','Epic']);
  assert.deepEqual((await show('special',locale)).kinds,['Common','evolution','bossReward']);
  assert.deepEqual((await show('boss',locale)).kinds,['bossReward','bossReward','bossReward']);
 }
 // Live locale change with the existing cards open, including evolution requirements.
 await show('special','ko');await page.evaluate(async()=>{(await import('/src/i18n/index.ts')).setLocale('en');});
 assert.ok(await page.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScene('Game').panel.objects.some(o=>o.type==='Text'&&o.text.includes('EVOLUTION'))));
 await show('mixed','ko');await page.mouse.move(640,430);await page.waitForTimeout(150);
 assert.equal(await page.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScene('Game').panel.objects.find(o=>o.getData('choiceIndex')===1).lineWidth),3);
 await page.screenshot({path:'card-previews/hover-ko.png'});await page.mouse.click(640,430);
 assert.equal(await page.evaluate(()=>window.cardSelected.length),1);assert.equal(await page.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScene('Game').panel.open),false);
 assert.ok(await page.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScene('Game').panel.feedback?.active));
 await page.keyboard.press('2');assert.equal(await page.evaluate(()=>window.cardSelected.length),1);
 await page.waitForTimeout(220);assert.equal(await page.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScene('Game').panel.feedback?.active),false);
 // Cached textures plateau; close removes all card objects, subscribers and entrance tweens.
 const counts=[];for(let i=0;i<4;i++){await show('special','en');counts.push(await page.evaluate(()=>window.__SURVIVOR_GAME__.textures.getTextureKeys().length));await page.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScene('Game').panel.close());}
 assert.equal(new Set(counts).size,1);
 // All real descriptions/requirements at every weapon level in both locales fit.
 for(const locale of ['ko','en'])await page.evaluate(async locale=>{
  const s=window.__SURVIVOR_GAME__.scene.getScene('Game'),{WEAPON_UPGRADES}=await import('/src/data/weaponUpgrades.ts'),{UPGRADES}=await import('/src/data/upgrades.ts'),{setLocale}=await import('/src/i18n/index.ts');setLocale(locale);
  const original=s.upgrades.currentLevel.bind(s.upgrades);
  for(let level=0;level<5;level++)for(const def of [...WEAPON_UPGRADES,...UPGRADES]){
   s.upgrades.currentLevel=()=>level;s.panel.show([{definition:def,rarity:'Epic'}],()=>{});
   const bad=s.panel.objects.filter(o=>o.type==='Text'&&o.x===190&&o.y>=418&&o.y<590&&(o.width>250.1||o.y+o.height>601));if(bad.length)throw Error('Overflow '+bad.map(o=>o.text));
  }s.upgrades.currentLevel=original;s.panel.close();
 },locale);
 await page.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScene('Game').finish(false));await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('GameOver'));await page.keyboard.press('Enter');await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('Game'));await show('mixed','ko');
 assert.equal(await page.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScene('Game').panel.objects.filter(o=>o.getData('cardKind')).length),3);
 const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});mobile.on('pageerror',e=>errors.push(e.message));
 await mobile.goto('http://127.0.0.1:5185');await mobile.waitForFunction(()=>window.__SURVIVOR_GAME__?.scene.isActive('Menu'));
 await mobile.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScene('Menu').scene.start('Game'));await mobile.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('Game'));
 for(const viewport of [{width:390,height:844},{width:844,height:390}]){
  await mobile.setViewportSize(viewport);await mobile.evaluate(async()=>{
   const s=window.__SURVIVOR_GAME__.scene.getScene('Game'),{UPGRADES}=await import('/src/data/upgrades.ts');s.paused=true;s.physics.pause();window.mobileSelections=0;
   s.panel.show(['Common','Rare','Epic'].map((rarity,i)=>({definition:UPGRADES[i],rarity})),()=>window.mobileSelections++);
  });await mobile.waitForTimeout(400);
  const canvas=await mobile.locator('canvas').boundingBox();assert.ok(canvas.width<=viewport.width+1&&canvas.height<=viewport.height+1);
  await mobile.screenshot({path:`card-previews/mobile-${viewport.width}.png`});
  await mobile.touchscreen.tap(canvas.x+640*canvas.width/1280,canvas.y+430*canvas.height/800);
  assert.equal(await mobile.evaluate(()=>window.mobileSelections),1);assert.equal(await mobile.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScene('Game').panel.open),false);
 }
 assert.deepEqual(errors,[]);console.log(JSON.stringify({result:'PASS',fiveKinds:true,locales:true,hover:true,selection:true,fit:true,cache:true,retry:true,mobile:true,errors}));
}finally{await browser?.close();await server.close();}
