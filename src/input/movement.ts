export const JOYSTICK_CONFIG={deadZone:.12,minSize:104,maxSize:136,edge:18,bottom:38,hudReservedHeight:96,hudGap:12} as const;
export function movementDirection(x:number,y:number){
  const length=Math.hypot(x,y);return length?{x:x/length,y:y/length}:{x:0,y:0};
}
export function stickOffset(x:number,y:number,radius:number){
  const length=Math.hypot(x,y),scale=length>radius?radius/length:1;
  return {x:x*scale,y:y*scale};
}
export function stickDirection(x:number,y:number,radius:number){
  return Math.hypot(x,y)<=radius*JOYSTICK_CONFIG.deadZone?{x:0,y:0}:movementDirection(x,y);
}
