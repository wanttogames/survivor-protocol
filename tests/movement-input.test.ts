import {test} from 'node:test';
import assert from 'node:assert/strict';
import {movementDirection,stickDirection,stickOffset} from '../src/input/movement';
test('keyboard and stick diagonals have the same unit speed as cardinal movement',()=>{
 for(const [x,y] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1]]){
  const d=movementDirection(x,y);assert.ok(Math.abs(Math.hypot(d.x,d.y)-1)<1e-9);
 }assert.deepEqual(movementDirection(0,0),{x:0,y:0});
});
test('stick dead zone stops drift, thumb clamps and outside drag keeps direction',()=>{
 assert.deepEqual(stickDirection(4,0,40),{x:0,y:0});
 assert.deepEqual(stickDirection(400,0,40),{x:1,y:0});
 const o=stickOffset(400,400,40);assert.ok(Math.abs(Math.hypot(o.x,o.y)-40)<1e-9);
});
