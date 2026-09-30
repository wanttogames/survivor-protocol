import type Phaser from 'phaser';
import { getMapCollisionZones, type MapDefinition } from './mapDefinitions';
/** Invisible static rectangles; exactly one collider, exclusively attached to the player. */
export class MapCollisionManager {
  readonly blockers: Phaser.Physics.Arcade.StaticGroup;
  readonly zones: Phaser.GameObjects.Zone[] = [];
  private playerCollider?: Phaser.Physics.Arcade.Collider;
  private debug?: Phaser.GameObjects.Graphics;
  constructor(private scene: Phaser.Scene, readonly definition: MapDefinition) {
    this.blockers=scene.physics.add.staticGroup();
    for(const rect of getMapCollisionZones(definition)){
      const zone=scene.add.zone(rect.x,rect.y,rect.width,rect.height).setName(`map-blocker:${rect.id}`);
      this.blockers.add(zone);this.zones.push(zone);
    }
    this.setDebugVisible(import.meta.env.DEV && import.meta.env.VITE_DEBUG_MAP_COLLISION === 'true');
  }
  attachPlayer(player: Phaser.Physics.Arcade.Sprite){
    this.playerCollider?.destroy();
    this.playerCollider=this.scene.physics.add.collider(player,this.blockers);
  }
  setDebugVisible(visible:boolean){
    if(!import.meta.env.DEV)return;
    if(visible&&!this.debug){
      this.debug=this.scene.add.graphics().setDepth(85).setName('map-collision-debug');
      this.debug.fillStyle(0xb93f35,.18).lineStyle(1,0xd17b62,.8);
      for(const z of getMapCollisionZones(this.definition))this.debug.fillRect(z.x-z.width/2,z.y-z.height/2,z.width,z.height).strokeRect(z.x-z.width/2,z.y-z.height/2,z.width,z.height);
    }
    this.debug?.setVisible(visible);
  }
  destroy(){
    this.playerCollider?.destroy();this.playerCollider=undefined;
    this.debug?.destroy();this.debug=undefined;
    // Phaser may already destroy the group before our Scene shutdown listener.
    this.blockers.destroy(true,true);this.zones.length=0;
  }
}
