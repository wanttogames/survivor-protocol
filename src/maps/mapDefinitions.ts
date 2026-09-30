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
export interface CollisionZone {
  id: string;
  landmarkId: string;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
  scaleWithLandmark?: boolean;
}
export interface CollisionRect extends MapPoint { id: string; width: number; height: number }
export interface MapWall extends MapPoint { id: string; landmarkId: string; offsetX: number; offsetY: number; scale: number }
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
  collisionZones: readonly CollisionZone[];
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
  collisionZones: [],
  decorationConfig: { smallProps: 210, fogLayers: 8, wisps: 12 },
};

/** The same landmark-relative wall layout drives both baked visuals and segmented blockers. */
export function getMapWalls(map: MapDefinition): MapWall[] {
  return map.landmarks.flatMap(l => {
    const parts = l.kind === 'house'
      ? [{offsetX:-145,offsetY:175,scale:.9},{offsetX:145,offsetY:175,scale:.8}]
      : l.kind === 'shrine' ? [{offsetX:-295,offsetY:145,scale:1},{offsetX:300,offsetY:145,scale:1}] : [];
    return parts.map((p,i)=>({...p,id:`${l.id}:wall-${i}`,landmarkId:l.id,x:l.x+p.offsetX,y:l.y+p.offsetY}));
  });
}
export function getMapCollisionZones(map: MapDefinition): CollisionRect[] {
  return map.collisionZones.map(z=>{
    const l=map.landmarks.find(l=>l.id===z.landmarkId);
    if(!l)throw new Error(`Missing collision landmark: ${z.landmarkId}`);
    const scale=z.scaleWithLandmark?l.scale:1;
    return {id:z.id,x:l.x+z.offsetX*scale,y:l.y+z.offsetY*scale,width:z.width*scale,height:z.height*scale};
  });
}
// Bodies lie below the roofs; the front steps and open approach to each door remain walkable.
MOONLIT_VILLAGE.collisionZones = [
  ...MOONLIT_VILLAGE.landmarks.filter(l=>['house','shrine','rock'].includes(l.kind)).map(l=>({
    id:`${l.id}:body`,landmarkId:l.id,offsetX:0,offsetY:l.kind==='house'?35:l.kind==='shrine'?30:12,
    width:l.kind==='house'?260:l.kind==='shrine'?320:62,
    height:l.kind==='rock'?36:90,scaleWithLandmark:true,
  })),
  ...getMapWalls(MOONLIT_VILLAGE).flatMap(w=>[-1,1].map(side=>({
    id:`${w.id}:${side<0?'left':'right'}`,landmarkId:w.landmarkId,
    offsetX:w.offsetX+side*41*w.scale,offsetY:w.offsetY+7*w.scale,
    width:82*w.scale,height:22*w.scale,
  }))),
  {id:'shrine-altar',landmarkId:'abandoned-shrine',offsetX:0,offsetY:275+17*1.1,width:76*1.1,height:26*1.1},
];
