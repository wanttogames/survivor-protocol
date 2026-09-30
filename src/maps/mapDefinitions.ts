import { BALANCE } from '../config/balance';
import type { TranslationKey } from '../i18n';
export interface MapPoint { x: number; y: number }
export interface Landmark extends MapPoint {
  id: string;
  kind: 'house' | 'gate' | 'tree' | 'shrine' | 'seal' | 'rock';
  scale: number;
  /** Visual footprint, used only for initial spawn placement, never physics. */
  footprint?: { width: number; height: number };
}
export interface MapDefinition {
  id: string;
  nameKey: TranslationKey;
  descriptionKey: TranslationKey;
  width: number;
  height: number;
  backgroundColor: number;
  start: MapPoint;
  zones: readonly { id: string; center: MapPoint; radius: number; color: string }[];
  roads: readonly (readonly MapPoint[])[];
  landmarks: readonly Landmark[];
  decorationConfig: { smallProps: number; fogLayers: number; wisps: number };
}
export const MOONLIT_VILLAGE: MapDefinition = {
  id: 'moonlit-village', nameKey: 'map.moonlitVillage.name', descriptionKey: 'map.moonlitVillage.description',
  width: BALANCE.worldSize, height: BALANCE.worldSize, backgroundColor: 0x1d2422,
  start: { x: 1800, y: 2400 },
  zones: [
    { id: 'village-road', center: { x: 1800, y: 2400 }, radius: 650, color: '#514535' },
    { id: 'abandoned-homes', center: { x: 1180, y: 2160 }, radius: 560, color: '#3b3730' },
    { id: 'jangseung-road', center: { x: 2090, y: 1680 }, radius: 520, color: '#30392e' },
    { id: 'cemetery', center: { x: 2720, y: 1160 }, radius: 580, color: '#26363a' },
    { id: 'abandoned-shrine', center: { x: 1500, y: 760 }, radius: 560, color: '#30303b' },
    { id: 'sealing-ground', center: { x: 1660, y: 1180 }, radius: 350, color: '#3b3033' },
  ],
  roads: [
    [{x:1800,y:3400},{x:1730,y:2840},{x:1800,y:2400},{x:1890,y:2050},{x:2100,y:1660},{x:2350,y:1380},{x:2700,y:1160},{x:3050,y:900}],
    [{x:470,y:2590},{x:1050,y:2310},{x:1500,y:2400},{x:1800,y:2400}],
    [{x:2600,y:1250},{x:2210,y:1060},{x:1810,y:1210},{x:1660,y:1180},{x:1540,y:930},{x:1500,y:760}],
  ],
  landmarks: [
    {id:'village-west-house',kind:'house',x:1190,y:2030,scale:1.1,footprint:{width:330,height:210}},
    {id:'village-south-house',kind:'house',x:1090,y:2620,scale:.85,footprint:{width:255,height:165}},
    {id:'village-east-house',kind:'house',x:2190,y:2450,scale:1,footprint:{width:300,height:190}},
    {id:'ruined-homestead',kind:'house',x:660,y:2160,scale:1.15,footprint:{width:340,height:220}},
    {id:'northern-house',kind:'house',x:1160,y:1560,scale:.8,footprint:{width:245,height:155}},
    {id:'jangseung-gate',kind:'gate',x:2070,y:1710,scale:1},
    {id:'cemetery-old-tree',kind:'tree',x:2750,y:930,scale:1.45},
    {id:'abandoned-shrine',kind:'shrine',x:1500,y:650,scale:1.2,footprint:{width:445,height:285}},
    {id:'broken-seal',kind:'seal',x:1660,y:1180,scale:1},
    {id:'western-boulder',kind:'rock',x:650,y:1000,scale:1.8,footprint:{width:115,height:85}},
    {id:'eastern-boulder',kind:'rock',x:3050,y:2400,scale:1.6,footprint:{width:100,height:75}},
  ],
  decorationConfig: { smallProps: 210, fogLayers: 8, wisps: 12 },
};
