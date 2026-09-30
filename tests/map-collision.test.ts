import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getMapCollisionZones,getMapWalls,MOONLIT_VILLAGE} from '../src/maps/mapDefinitions';
import {isMapSpawnSafe,safeMapSpawn} from '../src/maps/spawnSafety';
test('limited anchored footprints, segmented walls and open decorative areas',()=>{
 const zones=getMapCollisionZones(MOONLIT_VILLAGE);assert.equal(zones.length,33);assert.equal(new Set(zones.map(z=>z.id)).size,33);
 const area=zones.reduce((n,z)=>n+z.width*z.height,0);assert.ok(area/(3600*3600)<.025);
 for(const z of zones){assert.ok(z.width>0&&z.height>0&&z.x-z.width/2>=0&&z.y-z.height/2>=0&&z.x+z.width/2<=3600&&z.y+z.height/2<=3600);for(const r of [15,22,45,75]){const p=safeMapSpawn(z.x,z.y,r);assert.ok(isMapSpawnSafe(p.x,p.y,r),z.id);}}
 const inside=(x:number,y:number)=>zones.some(z=>Math.abs(x-z.x)<z.width/2&&Math.abs(y-z.y)<z.height/2);
 for(const l of MOONLIT_VILLAGE.landmarks.filter(l=>l.kind==='house'||l.kind==='shrine'))assert.equal(inside(l.x,l.y-75*l.scale),false,'roof is not a wall');
 for(const l of MOONLIT_VILLAGE.landmarks.filter(l=>['gate','tree','seal'].includes(l.kind)))assert.equal(inside(l.x,l.y),false,l.id);
 assert.equal(zones.filter(z=>z.id.includes(':wall-')).length,getMapWalls(MOONLIT_VILLAGE).length*2);
});
test('moving a landmark moves its body and wall collision with the drawing',()=>{
 const original=getMapCollisionZones(MOONLIT_VILLAGE),moved={...MOONLIT_VILLAGE,landmarks:MOONLIT_VILLAGE.landmarks.map(l=>l.id==='village-east-house'?{...l,x:l.x+123,y:l.y+65}:l)};
 for(const before of original.filter(z=>z.id.startsWith('village-east-house:'))){const after=getMapCollisionZones(moved).find(z=>z.id===before.id)!;assert.equal(after.x-before.x,123);assert.equal(after.y-before.y,65);}
 const before=getMapWalls(MOONLIT_VILLAGE).find(w=>w.landmarkId==='village-east-house')!,after=getMapWalls(moved).find(w=>w.id===before.id)!;assert.equal(after.x-before.x,123);assert.equal(after.y-before.y,65);
});
