import {test} from 'node:test';
import assert from 'node:assert/strict';
import {SoulPool} from '../src/utils/SoulPool';
import {soulTier} from '../src/config/soulConfig';
import {LevelSystem} from '../src/systems/LevelSystem';
class Soul {
 active=false;value=0;x=0;y=0;onActiveChange?: (active:boolean)=>void;
 spawn(x:number,y:number,value:number){this.x=x;this.y=y;this.value=value;this.active=true;this.onActiveChange?.(true);}
 addExp(value:number){this.value+=value;}
 collect(){const value=this.value;this.value=0;this.active=false;this.onActiveChange?.(false);return value;}
}
test('120 souls plus 100 overflow drops preserve every EXP; full pool never acquires',()=>{
 const pool=new SoulPool(()=>new Soul(),120);
 for(let i=0;i<119;i++)pool.deposit(i,0,1);
 assert.equal(pool.activeCount,119);pool.deposit(119,0,1);assert.equal(pool.activeCount,120);
 pool.acquire=()=>{throw new Error('Must merge at capacity');};
 for(let i=0;i<100;i++)pool.deposit(9000,9000,10);
 assert.equal(pool.items.length,120);assert.equal(pool.activeCount,120);
 assert.equal(pool.debugSnapshot().storedExp,1120);assert.equal(pool.debugSnapshot().mergedExp,1000);
 assert.equal(pool.items.filter(o=>o.value===11).length,100);
 const levels=new LevelSystem();let received=0;
 for(const orb of pool.items){const xp=orb.collect();received+=xp;levels.add(xp);}
 assert.equal(received,1120);assert.equal(pool.activeCount,0);assert.equal(pool.debugSnapshot().mergeIndex,0);
 const expected=new LevelSystem();expected.add(1120);assert.deepEqual(levels,expected);
});
test('inactive slots are reused; removing a merge target does not lose subsequent drops',()=>{
 const pool=new SoulPool(()=>new Soul(),3);
 for(let i=0;i<3;i++)pool.deposit(i,0,2);
 pool.deposit(0,0,10);const first=pool.items[0].collect();
 pool.deposit(1,1,7);pool.deposit(2,2,5);
 assert.equal(pool.items.length,3);assert.equal(pool.activeCount,3);
 assert.equal(first+pool.debugSnapshot().storedExp,28);
});
test('soul visual tiers change at exact raw EXP thresholds',()=>{
 assert.deepEqual([1,9,10,29,30,99,100,10000].map(soulTier),[0,0,1,1,2,2,3,3]);
});
