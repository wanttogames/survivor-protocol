import type Phaser from 'phaser';
import {label} from './common';
import {t} from '../i18n';
import {TALISMANS} from '../talismans/talismanDefinitions';
export class TalismanHud {
  private text:Phaser.GameObjects.Text;
  private ids:string[]=[];
  constructor(scene:Phaser.Scene) {this.text=label(scene,36,132,()=>t('talisman.hud',{symbols:this.ids.map(id=>TALISMANS.find(d=>d.id===id)?.symbol??'').join('  ')}),18,'#d8b384').setBackgroundColor('#211a15').setPadding(6).setVisible(false);}
  refresh(ids:readonly string[]) {this.ids=[...ids];this.text.setText(t('talisman.hud',{symbols:this.ids.slice(0,5).map(id=>TALISMANS.find(d=>d.id===id)?.symbol??'').join('  ')+(this.ids.length>5?' +'+(this.ids.length-5):'')})).setVisible(ids.length>0);}
}
