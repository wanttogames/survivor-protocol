import type Phaser from 'phaser';
import {movementDirection} from './movement';
import {VirtualJoystick} from './VirtualJoystick';
export class InputManager {
  private joystick?:VirtualJoystick;
  private sceneSuspended=false;
  constructor(private keys:Record<string,Phaser.Input.Keyboard.Key>,canvas:HTMLCanvasElement,private blocked:()=>boolean,stop:()=>void,private events:Phaser.Events.EventEmitter){
    if(navigator.maxTouchPoints>0)this.joystick=new VirtualJoystick(canvas,()=>this.isBlocked(),stop);
    events.on('pause',this.pause);events.on('sleep',this.pause);
    events.on('resume',this.resume);events.on('wake',this.resume);
    window.addEventListener('blur',this.reset);document.addEventListener('visibilitychange',this.visibility);
  }
  suspend=()=>{this.joystick?.setEnabled(false);this.joystick?.reset();};
  private isBlocked(){return this.sceneSuspended||this.blocked();}
  private pause=()=>{this.sceneSuspended=true;this.suspend();};
  private resume=()=>{this.sceneSuspended=false;this.sync();};
  sync(){this.joystick?.setEnabled(!this.isBlocked());}
  getMovementVector(){
    this.sync();if(this.isBlocked())return {x:0,y:0};
    const x=Number(this.keys.D.isDown||this.keys.RIGHT.isDown)-Number(this.keys.A.isDown||this.keys.LEFT.isDown);
    const y=Number(this.keys.S.isDown||this.keys.DOWN.isDown)-Number(this.keys.W.isDown||this.keys.UP.isDown);
    return x||y?movementDirection(x,y):this.joystick?.getMovementVector()??{x:0,y:0};
  }
  private reset=()=>this.joystick?.reset();
  private visibility=()=>{if(document.hidden)this.reset();};
  destroy(){this.events.off('pause',this.pause);this.events.off('sleep',this.pause);this.events.off('resume',this.resume);this.events.off('wake',this.resume);window.removeEventListener('blur',this.reset);document.removeEventListener('visibilitychange',this.visibility);this.joystick?.destroy();}
}
