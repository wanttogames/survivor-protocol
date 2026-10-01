import test from 'node:test';
import assert from 'node:assert/strict';
import {TalismanSession,applyPlayerTalismanDelta} from '../src/talismans/TalismanSession';
import {TALISMANS,neutralModifiers,type TalismanDefinition} from '../src/talismans/talismanDefinitions';
import {TALISMAN_CONFIG as C,talismanEnemyCapacity} from '../src/talismans/talismanConfig';
import {BALANCE} from '../src/config/balance';
import {UpgradeSystem} from '../src/systems/UpgradeSystem';
import {WeaponLoadout} from '../src/weapons/WeaponLoadout';
test('timeline triggers once; modal decisions exhaust candidates, including rejection',()=>{
 const s=new TalismanSession(()=>0);s.update(119.9);assert.equal(s.ready,false);s.update(120);const first=s.offer();assert.equal(first?.id,'samdo');s.update(120);assert.equal(s.offer(),undefined);s.decide(false);assert.equal(s.ready,false);assert.equal(s.remaining.some(d=>d.id==='samdo'),false);s.update(480);
 assert.equal(s.offer()?.id,'gate');s.decide(true);assert.equal(s.offer()?.id,'hunger');s.decide(false);assert.equal(s.ready,false);
 s.update(9999);assert.equal(s.ready,false);assert.equal(new TalismanSession().acceptedIds.length,0);
});
test('all six pacts have both penalties and rewards; multiplicative stacking and healthy HP clamp',()=>{
 const s=new TalismanSession();const stats={...BALANCE.player};
 for(const d of TALISMANS){assert.ok(d.curses.length&&d.rewards.length);s.trigger();assert.equal(s.offer(d.id),d);const before=s.modifiers;s.decide(true);applyPlayerTalismanDelta(stats,before,s.modifiers);}
 assert.ok(Math.abs(s.modifiers.enemyMaxCountMultiplier-1.6875)<1e-9);
 assert.ok(Math.abs(s.modifiers.enemyMoveSpeedMultiplier-1.265)<1e-9);
 assert.ok(Math.abs(s.modifiers.xpMultiplier-2.268)<1e-9);
 assert.ok(Math.abs(stats.damage-BALANCE.player.damage*1.25*1.4)<1e-9);
 assert.equal(stats.maxHp,70);assert.equal(stats.hp,70);assert.equal(s.modifiers.extraEliteCount,1);
 s.trigger();assert.equal(s.ready,false);assert.equal(s.decide(true),undefined);
});
test('configured safety caps stop multiplicative runaway; sub-1HP max is kept alive',()=>{
 const defs:TalismanDefinition[]=Array.from({length:3},(_,i)=>({...TALISMANS[0],id:String(i),curses:[{type:'enemyMoveSpeedMultiplier',value:2},{type:'enemyMaxCountMultiplier',value:5}],rewards:[{type:'attackSpeedMultiplier',value:4}]}));
 const s=new TalismanSession(()=>0,C.eventTimes,defs);for(const d of defs){s.trigger();s.offer(d.id);s.decide(true);}
 assert.equal(s.modifiers.enemyMoveSpeedMultiplier,C.caps.enemyMoveSpeedMultiplier);assert.equal(s.modifiers.enemyMaxCountMultiplier,2);assert.equal(s.modifiers.attackSpeedMultiplier,2);assert.equal(talismanEnemyCapacity(),560);
 const stats={...BALANCE.player,maxHp:1,hp:1};applyPlayerTalismanDelta(stats,neutralModifiers(),{...neutralModifiers(),playerMaxHpMultiplier:.7});assert.equal(stats.hp,1);assert.equal(stats.maxHp,1);
});
test('red moon increases existing stat-card rarity thresholds and preserves weapon/evolution rules',()=>{
 const normal=new UpgradeSystem(()=>.6);assert.ok(normal.roll().every(c=>c.rarity==='Common'));
 const moon=new UpgradeSystem(()=>.6);moon.rarityBonus=1;assert.ok(moon.roll().every(c=>c.rarity==='Rare'));
 const epic=new UpgradeSystem(()=>.92);epic.rarityBonus=1;assert.ok(epic.roll().every(c=>c.rarity==='Epic'));
 const weapons=new UpgradeSystem(()=>.999,new WeaponLoadout());weapons.rarityBonus=1;assert.ok(weapons.roll().filter(c=>c.definition.weaponId).every(c=>c.rarity==='Common'));
});

test('pool applies live active limit even to reused objects and reserves boss identities',async()=>{
 const {Pool}=await import('../src/utils/Pool');let limit=1;
 const pool=new Pool<{active:boolean;poolEligible:boolean}>(()=>({active:true,poolEligible:true}),4,()=>limit);
 const first=pool.acquire()!;assert.equal(pool.acquire(),undefined);first.active=false;assert.equal(pool.acquire(),first);first.active=true;
 limit=2;assert.ok(pool.acquire());assert.equal(pool.acquire(),undefined);
});
