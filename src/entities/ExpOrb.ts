import Phaser from "phaser";
import { SOUL_CONFIG, soulTier } from '../config/soulConfig';
export class ExpOrb extends Phaser.GameObjects.Image {
  value = 0;
  magnetized = false;
  onActiveChange?: (active:boolean)=>void;
  private currentTier=-1;
  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, "orb");
    scene.add.existing(this);
    this.setActive(false).setVisible(false).setDepth(2);
  }
  override setActive(active:boolean):this {
    const changed=this.active!==active;super.setActive(active);
    if(changed)this.onActiveChange?.(active);
    return this;
  }
  spawn(x: number, y: number, value: number) {
    this.value=value;this.magnetized=false;this.refreshVisual();
    this.setPosition(x, y).setActive(true).setVisible(true);
  }
  addExp(amount:number){
    if(!Number.isFinite(amount)||amount<0)throw new RangeError('Invalid soul EXP');
    this.value+=amount;this.refreshVisual();
  }
  private refreshVisual(){
    const tier=soulTier(this.value);if(tier===this.currentTier)return;
    this.currentTier=tier;
    const visual=SOUL_CONFIG.tiers[tier];this.setTexture(visual.texture).setScale(visual.scale);
  }
  collect(){
    if(!this.active)return 0;
    const value=this.value;this.value=0;this.magnetized=false;
    this.setActive(false).setVisible(false);return value;
  }
}
