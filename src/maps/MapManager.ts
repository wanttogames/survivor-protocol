import type Phaser from 'phaser';
import type { BossId } from '../encounters/encounterConfig';
import { MOONLIT_VILLAGE, type MapDefinition } from './mapDefinitions';
import { MoonlitVillageMap } from './MoonlitVillageMap';
/** One map instance per run; GameScene owns lifecycle, not scenery implementation. */
export class MapManager {
  readonly view: MoonlitVillageMap;
  constructor(scene:Phaser.Scene,readonly definition:MapDefinition=MOONLIT_VILLAGE){this.view=new MoonlitVillageMap(scene,definition);}
  create(){this.view.create();}
  update(dt:number,activeBosses:readonly BossId[],kingDefeated:boolean){
    this.view.setMood(kingDefeated?'sealed':activeBosses.includes('ghost-king')?'king':activeBosses.includes('vengeful-general')?'general':'quiet');
    this.view.update(dt);
  }
  bossDefeated(id:BossId){if(id==='ghost-king'){this.view.setMood('sealed');this.view.update(0);}}
  destroy(){this.view.destroy();}
}
