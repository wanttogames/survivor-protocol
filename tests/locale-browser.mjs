import {chromium} from '@playwright/test';
import {createServer} from 'vite';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const server=await createServer({server:{host:'127.0.0.1',port:5183}});await server.listen();let browser;
const url='http://127.0.0.1:5183';
try {
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||undefined,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const errors=[],warnings=[];
 const ready=async page=>{page.on('pageerror',e=>errors.push(e.stack));page.on('console',m=>{if(m.type()==='warning'&&m.text().includes('[i18n]'))warnings.push(m.text());});await page.goto(url);await page.waitForFunction(()=>window.__SURVIVOR_GAME__?.scene.isActive('Menu'));};
 const text=page=>page.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScenes(true).flatMap(s=>s.children.list.filter(o=>o.type==='Text'&&o.visible).map(o=>o.text)));
 const detection=[];
 for(const [language,saved,expected] of [['ko-KR',null,'ko'],['ko',null,'ko'],['en-US',null,'en'],['ja-JP',null,'en'],['de-DE',null,'en'],['ko-KR','en','en'],['en-US','ko','ko'],['ko-KR','invalid','ko']]){
  const context=await browser.newContext({locale:language,viewport:{width:1280,height:800}});
  if(saved!==null)await context.addInitScript(value=>localStorage.setItem('survivor-protocol.locale',value),saved);
  const page=await context.newPage();await ready(page);const actual=await page.locator('html').getAttribute('lang');assert.equal(actual,expected);
  if(saved===null)assert.equal(await page.evaluate(()=>localStorage.getItem('survivor-protocol.locale')),null);
  assert.ok((await text(page)).includes(expected==='ko'?'시작':'Start'));detection.push({language,saved,actual});await context.close();
 }
 // A denied iframe-like Storage getter must not crash boot or deliberate switching.
 const deniedContext=await browser.newContext({locale:'ja-JP'});await deniedContext.addInitScript(()=>Object.defineProperty(window,'localStorage',{configurable:true,get(){throw new DOMException('Storage blocked','SecurityError');}}));
 const denied=await deniedContext.newPage();await ready(denied);assert.equal(await denied.locator('html').getAttribute('lang'),'en');await denied.mouse.click(1025,48);assert.equal(await denied.locator('html').getAttribute('lang'),'ko');await deniedContext.close();
 const context=await browser.newContext({locale:'ko-KR',viewport:{width:1280,height:800}}),page=await context.newPage();await ready(page);
 await page.evaluate(async()=>{const {getCharacterManager}=await import('/src/characters/CharacterManager.ts'),{AudioManager}=await import('/src/audio/AudioManager.ts');const m=getCharacterManager();m.unlocks.collectSouls(1500);m.unlocks.flush();m.select('shaman');AudioManager.forGame(window.__SURVIVOR_GAME__).setMute(true);});
 const preserved=()=>page.evaluate(()=>Object.fromEntries(Object.entries(localStorage).filter(([k])=>k!=='survivor-protocol.locale')));
 const before=await preserved();await page.evaluate(()=>window.__menuIdentity=window.__SURVIVOR_GAME__.scene.getScene('Menu').children.list[0]);
 await page.mouse.click(1170,48);assert.equal(await page.locator('html').getAttribute('lang'),'en');assert.ok((await text(page)).includes('[ English ]'));assert.deepEqual(await preserved(),before);
 assert.ok(await page.evaluate(()=>window.__menuIdentity===window.__SURVIVOR_GAME__.scene.getScene('Menu').children.list[0]));
 await page.reload();await page.waitForFunction(()=>window.__SURVIVOR_GAME__?.scene.isActive('Menu'));assert.equal(await page.locator('html').getAttribute('lang'),'en');
 await page.mouse.click(1025,48);await page.reload();await page.waitForFunction(()=>window.__SURVIVOR_GAME__?.scene.isActive('Menu'));assert.equal(await page.locator('html').getAttribute('lang'),'ko');assert.deepEqual(await preserved(),before);
 fs.mkdirSync('locale-previews',{recursive:true});const screens={},fitFailures=[];
 const capture=async(name,locale)=>{await page.waitForTimeout(140);await page.screenshot({path:`locale-previews/${locale}-${name}.png`});};
 for(const locale of ['ko','en']){
  await page.evaluate(async locale=>{const {setLocale}=await import('/src/i18n/index.ts');setLocale(locale);window.__SURVIVOR_GAME__.scene.getScenes(true)[0].scene.start('Menu');},locale);await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('Menu'));
  screens[locale]={menu:await text(page)};await capture('menu',locale);
  await page.mouse.click(242,560);await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('CharacterSelect'));
  assert.deepEqual(await page.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScenes(true).map(s=>s.scene.key)),['CharacterSelect']);
  screens[locale].characters=await text(page);
  if(locale==='en')assert.ok(screens[locale].characters.every(t=>!/[가-힣]/.test(t)));
  const characterFit=await page.evaluate(()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('CharacterSelect');return s.children.list.filter(o=>o.type==='Text').filter(o=>{if(o.y<125||o.y>665)return false;const x=55+Math.floor((o.x-55)/395)*395;return o.x+o.width>x+365;}).map(o=>o.text);});assert.deepEqual(characterFit,[]);await capture('characters',locale);
  await page.mouse.click(640,744);await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('Game'));
  const gameTexts=await page.evaluate(()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game');s.paused=true;s.physics.pause();s.hud.update(s.player,s.levels,0,0);s.mapManager.update(0,[],false);return s.children.list.filter(o=>o.type==='Text'&&o.visible).map(o=>o.text);});
  if(locale==='en')assert.ok(gameTexts.every(t=>!/[가-힣]/.test(t)));
  screens[locale].hudMap=gameTexts;assert.ok(gameTexts.includes(locale==='ko'?'월하촌':'Moonlit Village'));assert.ok(gameTexts.includes(locale==='ko'?'체력':'HP'));await capture('hud-map',locale);
  // Exercise every base weapon stage, passive card and evolution in the real panel.
  const cards=await page.evaluate(async()=>{
   const s=window.__SURVIVOR_GAME__.scene.getScene('Game'),{WEAPON_UPGRADES}=await import('/src/data/weaponUpgrades.ts'),{UPGRADES}=await import('/src/data/upgrades.ts'),{WEAPON_EVOLUTIONS}=await import('/src/weapons/evolution/weaponEvolutionDefinitions.ts');
   const saved=s.upgrades.currentLevel.bind(s.upgrades),bad=[],names=[];
   const check=()=>{
    const texts=s.panel.objects.filter(o=>o.type==='Text');names.push(...texts.map(o=>o.text));
    for(let i=0;i<3;i++){
     const title=texts.find(o=>o.x===190+i*330&&o.y===418),description=texts.find(o=>o.x===190+i*330&&o.y===466),footer=texts.find(o=>o.x===190+i*330&&o.y===545);
     if(title&&(title.width>250||title.y+title.height>466))bad.push(['title',title.text,title.width,title.height]);
     if(description&&(description.width>250||description.y+description.height>531))bad.push(['description',description.text,description.width,description.height]);
     if(footer&&(footer.width>250||footer.y+footer.height>598))bad.push(['footer',footer.text,footer.width,footer.height]);
    }
   };
   for(let level=0;level<5;level++){s.upgrades.currentLevel=()=>level;for(let i=0;i<6;i+=3){s.panel.show(WEAPON_UPGRADES.slice(i,i+3).map(definition=>({definition,rarity:'Common'})),()=>{});check();}}
   s.upgrades.currentLevel=saved;
   for(let i=0;i<UPGRADES.length;i+=3){s.panel.show(UPGRADES.slice(i,i+3).map(definition=>({definition,rarity:'Epic'})),()=>{});check();}
   for(let i=0;i<6;i+=3){s.panel.show(WEAPON_EVOLUTIONS.slice(i,i+3).map(e=>({rarity:'Epic',definition:{id:`evolution:${e.id}`,evolutionId:e.id,nameKey:e.nameKey,descriptionKey:e.descriptionKey,descriptionParams:()=>({})}})),()=>{});check();}
   return {bad,translated:names.every(n=>!n.includes('undefined')&&!/\{\w+\}/.test(n)),count:names.length};
  });fitFailures.push(...cards.bad.map(b=>[locale,...b]));assert.ok(cards.translated);screens[locale].cards=cards;await capture('evolution',locale);
  const combat=await page.evaluate(async()=>{
   const s=window.__SURVIVOR_GAME__.scene.getScene('Game'),{WEAPON_EVOLUTIONS}=await import('/src/weapons/evolution/weaponEvolutionDefinitions.ts');s.panel.close();
   s.announcement.show('boss.elite');const elite=s.announcement.text.text;
   s.bosses.spawnBoss('vengeful-general');s.bosses.spawnBoss('ghost-king');s.bossHud.update();s.announcement.show('boss.appear','boss.king.name');
   const bossNames=s.bossHud.names.map(o=>o.text),announcement=s.announcement.text.text;
   s.player.stats.hp=s.player.stats.maxHp/2;const rewards=s.bossRewards.getBossRewardOptions(s.player.stats);s.panel.show(rewards,()=>{}, {bossNameKey:'boss.general.name'});
   const rewardTexts=s.panel.objects.filter(o=>o.type==='Text').map(o=>o.text);
   // All six evolved names in the result and build readout are the longest supported build.
   for(const e of WEAPON_EVOLUTIONS)s.weapons.loadout.replaceWeapon(e.baseWeaponId,e.evolvedWeaponId);
   const {WEAPON_IDS}=await import('/src/data/weaponConfig.ts');for(const id of WEAPON_IDS)while(s.weapons.loadout.upgrade(id)){};
   for(const e of WEAPON_EVOLUTIONS)s.weapons.loadout.replaceWeapon(e.baseWeaponId,e.evolvedWeaponId);s.weaponBar.refresh();
   const bar=s.weaponBar.text,buildFit=bar.y+bar.height<750;
   s.__localeResult={time:665,level:40,kills:1250,won:true,characterId:'forbidden_sorcerer',evolvedWeapons:WEAPON_EVOLUTIONS.map(e=>e.evolvedWeaponId),bossesDefeated:['vengeful-general','ghost-king'],eliteKills:7,unlocked:['shaman','warrior','archer','monk','forbidden_sorcerer']};
   return {elite,bossNames,announcement,rewardTexts,buildFit,buildBounds:[bar.width,bar.height]};
  });screens[locale].combat=combat;assert.ok(combat.buildFit,JSON.stringify(combat));await capture('reward',locale);
  await page.evaluate(()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game');s.scene.start('GameOver',s.__localeResult);});await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('GameOver'));
  screens[locale].victory=await text(page);if(locale==='en')assert.ok(screens[locale].victory.every(t=>!/[가-힣]/.test(t)));
  const results=await page.evaluate(()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('GameOver');return s.children.list.filter(o=>o.type==='Text').map(o=>({text:o.text,x:o.x,y:o.y,w:o.width,h:o.height,top:o.y-o.height*o.originY,bottom:o.y+o.height*(1-o.originY)}));});
  for(const r of results)assert.ok(r.w<920&&r.bottom<=(r.y<700?700:800),JSON.stringify(r));
  const unlock=results.find(r=>r.y===665);assert.ok(unlock.top>644&&unlock.bottom<=685,JSON.stringify(unlock));
  const details=results.filter(r=>r.y>=437&&r.y<=495);for(let i=0;i<details.length-1;i++)assert.ok(details[i].bottom<=details[i+1].top,JSON.stringify(details));await capture('victory',locale);
  await page.evaluate(()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('GameOver');s.scene.restart({...s.scene.settings.data,won:false});});await page.waitForTimeout(100);screens[locale].gameOver=await text(page);await capture('game-over',locale);
  await page.keyboard.press('Enter',{delay:80});await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('Game'));assert.equal(await page.locator('html').getAttribute('lang'),locale);
  await page.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScene('Game').finish(false));await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('GameOver'));
 }
 assert.deepEqual(fitFailures,[]);assert.deepEqual(errors,[]);assert.deepEqual(warnings,[]);
 // The responsive canvas keeps controls accessible without changing the logical UI layout.
 await page.evaluate(()=>window.__SURVIVOR_GAME__.scene.getScenes(true)[0].scene.start('Menu'));await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive('Menu'));await page.setViewportSize({width:390,height:844});await page.waitForTimeout(200);await capture('mobile-menu','en');const canvas=await page.locator('canvas').boundingBox();assert.ok(canvas.width<=391&&canvas.height<=844);
 console.log(JSON.stringify({result:'PASS',detection,storageDenied:true,preserved:true,persistence:true,fitFailures,errors,warnings,screenCounts:Object.fromEntries(Object.entries(screens).map(([lang,s])=>[lang,{characters:s.characters.length,cards:s.cards.count,result:s.victory.length,buildBounds:s.combat.buildBounds}])),mobile:canvas}));
 await context.close();
} finally {await browser?.close();await server.close();}
