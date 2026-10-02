import test from 'node:test';
import assert from 'node:assert/strict';
import { MetaProgression, META_KEY, coinReward, CHARMS, TRAINING } from '../src/progression/MetaProgression';
import { BALANCE } from '../src/config/balance';
const memory = () => { const values = new Map<string,string>(); return { getItem: (key:string) => values.get(key) ?? null, setItem: (key:string,value:string) => { values.set(key,value); }, removeItem: (key:string) => { values.delete(key); } }; };
const rich = () => { const storage=memory(); const meta=new MetaProgression(storage); for(let i=0;i<10;i++)meta.settle(`run-${i}`,{time:600,eliteKills:20,bossKills:3,won:true}); return {storage,meta}; };
test('settlement rewards performance, protects duplicate run and persists coins',()=>{
 assert.equal(coinReward({time:59,eliteKills:0,bossKills:0,won:false}),0);
 assert.equal(coinReward({time:600,eliteKills:2,bossKills:2,won:true}),306);
 const storage=memory(),meta=new MetaProgression(storage);
 assert.equal(meta.settle('a',{time:120,eliteKills:1,bossKills:0,won:false}),32);
 assert.equal(meta.settle('a',{time:600,eliteKills:9,bossKills:9,won:true}),0);
 assert.equal(new MetaProgression(storage).state.coins,32);
});
test('three bounded trainings, permanent unlocks and exactly one equipped charm',()=>{
 const {meta,storage}=rich();
 for(const id of Object.keys(TRAINING) as (keyof typeof TRAINING)[]) { for(let i=0;i<3;i++)assert.equal(meta.train(id),true); assert.equal(meta.train(id),false); }
 for(const id of Object.keys(CHARMS) as (keyof typeof CHARMS)[]) { assert.equal(meta.unlock(id),true); assert.equal(meta.unlock(id),false); assert.equal(meta.equip(id),true); assert.equal(meta.state.equipped,id); }
 const restored=new MetaProgression(storage); assert.deepEqual(restored.state,meta.state);
 const copy=meta.state;copy.coins=999999;assert.notEqual(meta.state.coins,copy.coins);
 assert.equal(meta.equip(null),true);assert.equal(meta.state.equipped,null);
 assert.equal(new MetaProgression().equip('guardian'),false);assert.equal(new MetaProgression().train('vitality'),false);
});
test('five starting effects, shield consumed once, fresh snapshots and XP expiry',()=>{
 const {meta}=rich(); for(const id of Object.keys(CHARMS) as (keyof typeof CHARMS)[])meta.unlock(id);
 meta.train('vitality');meta.train('gathering');meta.train('footwork');
 meta.equip('guardian');const guardian=meta.snapshot();const stats={...BALANCE.player};guardian.apply(stats);
 assert.ok(Math.abs(stats.maxHp-100*1.03*1.1)<1e-9);assert.equal(stats.hp,stats.maxHp);
 assert.equal(guardian.absorbHit(),true);assert.equal(guardian.absorbHit(),false);assert.equal(meta.snapshot().absorbHit(),true);
 meta.equip('summoning');assert.equal(meta.snapshot().pickup,1.05*1.2);
 meta.equip('stride');assert.equal(meta.snapshot().speed,1.02*1.05);
 meta.equip('scholar');const scholar=meta.snapshot();assert.equal(scholar.xpMultiplier(119.99),1.1);assert.equal(scholar.xpMultiplier(120),1);
 meta.equip('breaker');assert.equal(meta.snapshot().bossDamage,1.05);assert.equal(guardian.bossDamage,1);
});
test('malformed, unknown and denied saves stay safe without corrupting character progress',()=>{
 const storage=memory();storage.setItem(META_KEY,'{"version":1,"coins":-7,"training":{"vitality":999},"unlocked":["guardian","bad"],"equipped":"bad"}');
 const meta=new MetaProgression(storage);assert.equal(meta.state.coins,0);assert.equal(meta.state.training.vitality,3);assert.deepEqual(meta.state.unlocked,['guardian']);assert.equal(meta.state.equipped,null);
 storage.setItem(META_KEY,'broken');assert.equal(new MetaProgression(storage).state.coins,0);
 const denied=new MetaProgression({getItem(){throw Error();},setItem(){throw Error();},removeItem(){throw Error();}});assert.equal(denied.settle('r',{time:60,eliteKills:0,bossKills:0,won:false}),12);assert.equal(denied.state.coins,12);
});
