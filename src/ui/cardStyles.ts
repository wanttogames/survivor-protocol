import Phaser from 'phaser';
import type { UpgradeChoice } from '../systems/UpgradeSystem';
export type CardKind = 'Common' | 'Rare' | 'Epic' | 'evolution' | 'bossReward';
export interface CardVisualStyle {
  paper: number; border: number; accent: number; band: number; label: string;
  width: number; glow: number; hoverGlow: number; entrance: number;
  pattern: 'fibers' | 'diamond' | 'seal' | 'circle' | 'tribute';
}
export const CARD_STYLES: Record<CardKind, CardVisualStyle> = {
  Common: {paper:0xd6c49d,border:0x665039,accent:0x6a513a,band:0xc8b48b,label:'#453525',width:1,glow:0,hoverGlow:.08,entrance:120,pattern:'fibers'},
  Rare: {paper:0xe5dbc1,border:0x528783,accent:0x356c69,band:0x356c69,label:'#eff3e7',width:2,glow:.1,hoverGlow:.25,entrance:160,pattern:'diamond'},
  Epic: {paper:0xe5cc9e,border:0xbd8a38,accent:0x963c30,band:0x7f3029,label:'#f8e6bc',width:3,glow:.15,hoverGlow:.35,entrance:200,pattern:'seal'},
  evolution: {paper:0xefe0bc,border:0xd5a548,accent:0xa63529,band:0x4b2926,label:'#ffe6a3',width:3,glow:.2,hoverGlow:.42,entrance:240,pattern:'circle'},
  bossReward: {paper:0xe1c99a,border:0xb48b47,accent:0x75332b,band:0x503b26,label:'#ffe5b5',width:4,glow:.17,hoverGlow:.34,entrance:220,pattern:'tribute'},
};
/** Presentation precedence only; rarity probabilities and effects stay in UpgradeSystem. */
export function cardKind(c: UpgradeChoice, bossContext = false): CardKind {
  return c.definition.evolutionId ? 'evolution' : bossContext || c.definition.bossRewardId ? 'bossReward' : c.rarity;
}
export function ensureCardTextures(scene: Phaser.Scene, kind: CardKind) {
  const key=`choice-card-v2-${kind}`, glowKey=`${key}-glow`, s=CARD_STYLES[kind];
  if(scene.textures.exists(key))return {key,glowKey};
  const g=scene.add.graphics();
  g.fillStyle(s.paper).fillRect(0,0,300,340);
  for(let j=0;j<62;j++){
    const x=8+(j*67)%281,y=7+(j*43)%321;
    g.lineStyle(1,0x715d3e,.065).lineBetween(x,y,Math.min(290,x+5+j%15),y+1);
  }
  g.fillStyle(s.band).fillRect(0,0,300,62);
  g.lineStyle(s.width,s.border,1).strokeRect(2,2,296,336);
  if(kind!=='Common')g.lineStyle(1,s.border,.6).strokeRect(9,9,282,322);
  for(const [x,y,sx,sy] of [[14,14,1,1],[286,14,-1,1],[14,326,1,-1],[286,326,-1,-1]]){
    g.lineStyle(kind==='Common'?1:2,s.border,.8).lineBetween(x,y,x+sx*18,y).lineBetween(x,y,x,y+sy*18);
    if(kind==='bossReward')g.strokeRect(x+(sx<0?-8:0),y+(sy<0?-8:0),8,8);
  }
  // Upper artwork stays above the text body, so stronger patterns preserve readability.
  g.lineStyle(1,s.accent,kind==='Common'?.08:.2);
  if(s.pattern==='circle'){
    g.strokeCircle(150,111,49).strokeCircle(150,111,40).strokeCircle(150,111,28);
    for(let i=0;i<8;i++){const a=i*Math.PI/4;g.lineBetween(150+Math.cos(a)*42,111+Math.sin(a)*42,150+Math.cos(a)*54,111+Math.sin(a)*54);}
  }else if(s.pattern==='diamond'){
    g.strokePoints([{x:150,y:67},{x:195,y:111},{x:150,y:149},{x:105,y:111}],true);
  }else if(s.pattern==='seal'){
    g.strokeRect(114,78,72,65).strokeRect(121,85,58,51).lineBetween(150,87,150,133).lineBetween(130,103,170,103).lineBetween(135,116,165,116);
  }else if(s.pattern==='tribute'){
    for(let i=0;i<5;i++)g.lineBetween(150,137,103+i*23,75);
    g.strokePoints([{x:118,y:100},{x:182,y:100},{x:173,y:139},{x:127,y:139}],true);
  }
  // Distinct geometric seals supplement both color and localized labels.
  g.lineStyle(2,s.accent,.9).fillStyle(s.accent,.12);
  if(kind==='evolution')g.fillCircle(258,99,19).strokeCircle(258,99,19).strokeCircle(258,99,13);
  else if(kind==='Rare')g.strokePoints([{x:258,y:80},{x:277,y:99},{x:258,y:118},{x:239,y:99}],true);
  else if(kind==='bossReward')g.strokePoints([{x:240,y:81},{x:276,y:81},{x:276,y:106},{x:258,y:121},{x:240,y:106}],true);
  else g.strokeRect(243,84,30,30);
  g.lineBetween(249,92,267,107).lineBetween(267,92,249,107);
  g.lineStyle(1,s.accent,.22).lineBetween(30,145,270,145).lineBetween(30,269,270,269);
  g.generateTexture(key,300,340);g.clear();
  for(let i=8;i>0;i--)g.lineStyle(2,s.border,.07).strokeRoundedRect(12-i,12-i,300+i*2,340+i*2,3);
  g.generateTexture(glowKey,324,364);g.destroy();
  return {key,glowKey};
}
