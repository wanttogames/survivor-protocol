import {test} from 'node:test';
import assert from 'node:assert/strict';
import { EncounterManager } from '../src/encounters/EncounterManager';
import { encounterSpawnPoint } from '../src/encounters/spawnPoint';
import { ENCOUNTERS, ELITES, BOSSES, BOSS_REWARDS } from '../src/encounters/encounterConfig';
import { BossRewardManager } from '../src/bosses/BossRewardManager';
import { UpgradeSystem } from '../src/systems/UpgradeSystem';
import { WeaponLoadout } from '../src/weapons/WeaponLoadout';
import { LevelSystem } from '../src/systems/LevelSystem';
import { BALANCE } from '../src/config/balance';
import { WEAPON_IDS } from '../src/data/weaponConfig';
import { CharacterUnlockManager,PROGRESS_KEY } from '../src/characters/CharacterUnlockManager';
test('timeline thresholds, repeat/pause protection, scaled duration and new-run reset',()=>{
 const ids:string[]=[],m=new EncounterManager(600,e=>{ids.push(e.id);return true;});
 m.update(119.99);assert.equal(ids.length,0);m.update(120);m.update(120);assert.deepEqual(ids,['first-elite']);
 m.update(300);m.update(480);m.update(600);m.update(900);assert.equal(ids.length,5);assert.equal(new Set(ids).size,5);
 const short:string[]=[];new EncounterManager(300,e=>{short.push(e.id);return true;}).update(150);assert.deepEqual(short,['first-elite','mid-boss']);
 assert.equal(new EncounterManager(600,()=>true).triggeredEncounterIds.size,0);
 let tries=0;const delayed=new EncounterManager(600,()=>++tries>1);delayed.update(120);assert.equal(delayed.triggeredEncounterIds.size,0);delayed.update(120);assert.equal(delayed.triggeredEncounterIds.size,1);
});
test('spawn point is safely inside world, distant and outside camera at center and corners',()=>{
 for(const [x,y] of [[1800,1800],[25,25],[3575,3575],[25,1800]]){
  const view={left:Math.max(0,x-640),right:Math.min(3600,x+640),top:Math.max(0,y-400),bottom:Math.min(3600,y+400)};
  for(let i=0;i<8;i++){const p=encounterSpawnPoint(x,y,view,()=>i/8);assert.ok(p.x>=0&&p.y>=0&&p.x<=3600&&p.y<=3600);assert.ok(Math.hypot(p.x-x,p.y-y)>=600);assert.ok(p.x<view.left||p.x>view.right||p.y<view.top||p.y>view.bottom);}
 }
});
test('elite variants, boss windups and bounded attacks are data-defined',()=>{
 assert.equal(Object.keys(ELITES).length,3);assert.deepEqual(ENCOUNTERS.map(e=>e.timeRatio),[.2,.5,.8,.8,1]);
 for(const e of Object.values(ELITES)){assert.ok(e.hpMultiplier>=5&&e.hpMultiplier<=10);assert.ok(e.sizeMultiplier>=1.2);assert.ok(e.reward.soulMultiplier>=10);}
 assert.ok(BOSSES['vengeful-general'].slash!.windup>=.5);assert.equal(BOSSES['ghost-king'].phaseAt,.5);assert.ok(BOSSES['ghost-king'].spirits!.count<=12);
});
test('boss rewards: owned weapon only, max exclusion, one-shot apply, healing/damage/XP',()=>{
 const loadout=new WeaponLoadout(),u=new UpgradeSystem(()=>.5,loadout),l=new LevelSystem(),s={...BALANCE.player,hp:40};let granted=0;
 const m=new BossRewardManager(u,l,n=>{granted+=n;l.add(n);},()=>.99);
 const offered=m.getBossRewardOptions(s);assert.equal(offered.length,3);assert.equal(new Set(offered.map(c=>c.definition.id)).size,3);
 const weapon=offered.find(c=>c.definition.weaponId)!;assert.equal(weapon.definition.weaponId,'arc-bolt');assert.ok(m.applyBossReward(weapon,s));assert.equal(loadout.level('arc-bolt'),2);assert.equal(m.applyBossReward(weapon,s),false);
 const damage=m.getBossRewardOptions(s).find(c=>c.definition.bossRewardId==='damage')!;m.applyBossReward(damage,s);assert.equal(s.damage,BALANCE.player.damage*BOSS_REWARDS.damageMultiplier);
 const xp=m.getBossRewardOptions(s).find(c=>c.definition.bossRewardId==='souls')!;m.applyBossReward(xp,s);assert.ok(granted>=8);assert.ok(l.pending>=1);
 while(loadout.upgrade('arc-bolt')){};const max=m.getBossRewardOptions(s);assert.ok(max.every(c=>!c.definition.weaponId));const heal=max.find(c=>c.definition.bossRewardId==='heal')!;m.applyBossReward(heal,s);assert.equal(s.hp,80);
});
test('boss reward offers eligible evolution and preserves passive stats',()=>{
 const loadout=new WeaponLoadout(),u=new UpgradeSystem(()=>0,loadout),stats={...BALANCE.player},l=new LevelSystem();while(loadout.upgrade('arc-bolt')){};u.levels.critical=1;
 const m=new BossRewardManager(u,l,()=>{},()=>0),offer=m.getBossRewardOptions(stats),before={...stats};assert.equal(offer[0].definition.evolutionId,'thunder-talisman');m.applyBossReward(offer[0],stats);assert.equal(loadout.level('thunder-talisman'),1);assert.deepEqual(stats,before);assert.equal(u.levels.critical,1);
});
test('boss statistics persist and malformed/older saves stay compatible',()=>{
 const memory=new Map<string,string>(),storage={getItem:(k:string)=>memory.get(k)??null,setItem:(k:string,v:string)=>{memory.set(k,v);},removeItem:(k:string)=>{memory.delete(k);}};
 const u=new CharacterUnlockManager(storage);u.bossKill('vengeful-general');u.bossKill('ghost-king');u.flush();assert.equal(new CharacterUnlockManager(storage).progress.bossKills['ghost-king'],1);
 storage.setItem(PROGRESS_KEY,JSON.stringify({version:1,bossKills:{'ghost-king':'invalid','vengeful-general':-8}}));assert.equal(new CharacterUnlockManager(storage).progress.bossKills['ghost-king'],0);
 assert.deepEqual(new CharacterUnlockManager().progress.unlockedCharacters,['exorcist']);
});
test('reserved boss actors cannot be acquired by normal spawn pools; boss spawn multiplier lowers frequency',async()=>{
 const {Pool}=await import('../src/utils/Pool');const {EnemySpawnSystem}=await import('../src/systems/EnemySpawnSystem');
 const p=new Pool<{active:boolean;poolEligible:boolean}>(()=>({active:true,poolEligible:true}),3);const boss={active:false,poolEligible:false};p.items.push(boss);assert.notEqual(p.acquire(),boss);
 const count=(rate:number)=>{let n=0;const spawner=new EnemySpawnSystem({acquire:()=>({spawn:()=>n++})} as never);for(let i=0;i<100;i++)spawner.update(.1,0,1800,1800,rate);return n;};
 const normal=count(1),duringBoss=count(.6);assert.ok(duringBoss<normal&&duringBoss/normal>.5&&duringBoss/normal<.75);
});
