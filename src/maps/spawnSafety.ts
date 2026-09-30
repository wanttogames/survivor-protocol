import { MOONLIT_VILLAGE, type MapDefinition, type MapPoint } from './mapDefinitions';
export function isMapSpawnSafe(x: number, y: number, radius = 45, map = MOONLIT_VILLAGE): boolean {
  return x >= radius && y >= radius && x <= map.width - radius && y <= map.height - radius &&
    !map.landmarks.some(l => l.footprint && Math.abs(x-l.x) < l.footprint.width/2+radius && Math.abs(y-l.y) < l.footprint.height/2+radius);
}
/** Project out of visual structures; no random retries, allocations of physics bodies or pathfinding. */
export function safeMapSpawn(x: number, y: number, radius = 45, map: MapDefinition = MOONLIT_VILLAGE): MapPoint {
  const clamp = (p: MapPoint) => ({ x: Math.max(radius, Math.min(map.width-radius,p.x)), y: Math.max(radius, Math.min(map.height-radius,p.y)) });
  let p = clamp({x,y});
  if (isMapSpawnSafe(p.x,p.y,radius,map)) return p;
  for (const l of map.landmarks) {
    if (!l.footprint || Math.abs(p.x-l.x)>=l.footprint.width/2+radius || Math.abs(p.y-l.y)>=l.footprint.height/2+radius) continue;
    const w=l.footprint.width/2+radius+2,h=l.footprint.height/2+radius+2;
    const candidates=[{x:l.x-w,y:p.y},{x:l.x+w,y:p.y},{x:p.x,y:l.y-h},{x:p.x,y:l.y+h}].map(clamp)
      .sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y));
    const valid=candidates.find(c=>isMapSpawnSafe(c.x,c.y,radius,map));
    if(valid)return valid;
    p=candidates[0];
  }
  // A bounded search also covers overlapping footprints in future map definitions.
  for(let r=80;r<map.width+map.height;r+=80)for(let i=0;i<16;i++){
    const a=i*Math.PI/8,q=clamp({x:x+Math.cos(a)*r,y:y+Math.sin(a)*r});
    if(isMapSpawnSafe(q.x,q.y,radius,map))return q;
  }
  return clamp(map.start);
}
