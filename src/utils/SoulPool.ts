import { Pool, type Poolable } from './Pool';
export interface StoredSoul extends Poolable {
  value:number;
  onActiveChange?: (active:boolean)=>void;
  spawn(x:number,y:number,value:number):void;
  addExp(amount:number):void;
}
/** Existing pool with O(1) active membership and round-robin overflow deposits. */
export class SoulPool<T extends StoredSoul> extends Pool<T> {
  private activeSouls:T[]=[];
  private indices=new Map<T,number>();
  private mergeIndex=0;
  private mergedDrops=0;
  private mergedExp=0;
  constructor(create:()=>T,capacity:number){
    if(!Number.isInteger(capacity)||capacity<1)throw new RangeError('Soul capacity must be positive');
    super(()=>{
      const orb=create();
      orb.onActiveChange=active=>this.track(orb,active);
      return orb;
    },capacity);
  }
  get activeCount(){return this.activeSouls.length;}
  private track(orb:T,active:boolean){
    if(active){
      if(this.indices.has(orb))return;
      this.indices.set(orb,this.activeSouls.length);this.activeSouls.push(orb);
    }else{
      const index=this.indices.get(orb);if(index===undefined)return;
      const last=this.activeSouls.pop()!;this.indices.delete(orb);
      if(index<this.activeSouls.length){this.activeSouls[index]=last;this.indices.set(last,index);}
      this.mergeIndex=this.activeSouls.length?this.mergeIndex%this.activeSouls.length:0;
    }
  }
  deposit(x:number,y:number,exp:number){
    if(!Number.isFinite(exp)||exp<0)throw new RangeError('Invalid soul EXP');
    if(exp===0)return;
    if(this.activeCount<this.capacity){
      const orb=this.acquire();
      if(!orb)throw new Error('Soul pool membership is inconsistent');
      orb.spawn(x,y,exp);return;
    }
    // No acquire(), sorting or nearest search at capacity; no EXP is discarded.
    const target=this.activeSouls[this.mergeIndex];target.addExp(exp);
    this.mergeIndex=(this.mergeIndex+1)%this.activeSouls.length;
    this.mergedDrops++;this.mergedExp+=exp;
  }
  /** On-demand development diagnostics, never reduced per frame. */
  debugSnapshot(){
    return {activeSouls:this.activeCount,maxSouls:this.capacity,storedExp:this.activeSouls.reduce((sum,o)=>sum+o.value,0),mergedDrops:this.mergedDrops,mergedExp:this.mergedExp,mergeIndex:this.mergeIndex};
  }
}
