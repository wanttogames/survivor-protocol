import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MOONLIT_VILLAGE} from '../src/maps/mapDefinitions';
import {isMapSpawnSafe,safeMapSpawn} from '../src/maps/spawnSafety';
import {encounterSpawnPoint} from '../src/encounters/spawnPoint';
import {t,setLocale} from '../src/i18n';
test('map footprints: normal, elite, boss and summon-sized positions stay in-world outside structures',()=>{
 for(const radius of [15,45,75])for(const l of MOONLIT_VILLAGE.landmarks){
  const p=safeMapSpawn(l.x,l.y,radius);assert.ok(isMapSpawnSafe(p.x,p.y,radius),l.id);
 }
 for(const [x,y] of [[-100,50],[4000,4000],[1500,650],[1190,2030],[650,1000]]){
  const p=safeMapSpawn(x,y,75);assert.ok(isMapSpawnSafe(p.x,p.y,75));
 }
 for(let x=80;x<3600;x+=310)for(let y=80;y<3600;y+=310){const view={left:Math.max(0,x-640),right:Math.min(3600,x+640),top:Math.max(0,y-400),bottom:Math.min(3600,y+400)};const p=encounterSpawnPoint(x,y,view,()=>.3);assert.ok(isMapSpawnSafe(p.x,p.y,75));assert.ok(Math.hypot(p.x-x,p.y-y)>=600);}
});
test('map data and localized title: fixed start, six connected areas and core landmarks',()=>{
 assert.equal(MOONLIT_VILLAGE.id,'moonlit-village');assert.equal(MOONLIT_VILLAGE.zones.length,6);assert.ok(isMapSpawnSafe(MOONLIT_VILLAGE.start.x,MOONLIT_VILLAGE.start.y));
 assert.ok(['gate','tree','shrine','seal'].every(kind=>MOONLIT_VILLAGE.landmarks.some(l=>l.kind===kind)));
 for(const lang of ['ko','en'] as const){setLocale(lang);assert.notEqual(t(MOONLIT_VILLAGE.nameKey),MOONLIT_VILLAGE.nameKey);assert.notEqual(t(MOONLIT_VILLAGE.descriptionKey),MOONLIT_VILLAGE.descriptionKey);}setLocale('ko');
});
