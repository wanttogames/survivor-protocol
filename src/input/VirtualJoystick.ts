import {t,onLocaleChange} from '../i18n';
import {VIEW} from '../config/gameConfig';
import {JOYSTICK_CONFIG as C,stickDirection,stickOffset} from './movement';
/** CSS pixels and one captured DOM pointer: independent of world/camera/Phaser pointer slots. */
export class VirtualJoystick {
  readonly element=document.createElement('div');
  private thumb=document.createElement('span');
  private pointerId?:number;
  private direction={x:0,y:0};
  private enabled=true;
  private resizeObserver:ResizeObserver;
  private layoutFrame=0;
  private offLocale:()=>void;
  constructor(private canvas:HTMLCanvasElement,private blocked:()=>boolean,private stop:()=>void){
    this.element.className='virtual-joystick';this.thumb.className='virtual-joystick-thumb';
    this.element.append(this.thumb);this.element.setAttribute('role','group');
    const locale=()=>this.element.setAttribute('aria-label',t('input.move'));locale();this.offLocale=onLocaleChange(locale);
    document.body.append(this.element);
    this.element.addEventListener('pointerdown',this.down);
    this.element.addEventListener('pointermove',this.move);
    for(const event of ['pointerup','pointercancel','lostpointercapture'])this.element.addEventListener(event,this.end);
    window.addEventListener('resize',this.scheduleLayout);window.visualViewport?.addEventListener('resize',this.scheduleLayout);
    this.resizeObserver=new ResizeObserver(this.scheduleLayout);this.resizeObserver.observe(canvas);
    this.layout();this.scheduleLayout();
  }
  private scheduleLayout=()=>{
    cancelAnimationFrame(this.layoutFrame);this.layoutFrame=requestAnimationFrame(this.layout);
  };
  private layout=()=>{
    this.reset();
    const width=window.innerWidth,height=window.innerHeight;
    const size=Math.max(C.minSize,Math.min(C.maxSize,Math.min(width,height)*.3));
    const rect=this.canvas.getBoundingClientRect();
    // Portrait letterbox: use the spare area below gameplay. Otherwise stay above its HUD footer.
    const bottom=height-rect.bottom>size+C.bottom?C.bottom:Math.max(C.bottom,height-rect.bottom+C.hudReservedHeight*rect.height/VIEW.height+C.hudGap);
    this.element.style.width=this.element.style.height=`${size}px`;
    this.element.style.left=`${Math.max(C.edge,rect.left+C.edge)}px`;
    this.element.style.bottom=`${bottom}px`;
  };
  private down=(event:PointerEvent)=>{
    if(!this.enabled||this.blocked()||this.pointerId!==undefined)return;
    event.preventDefault();event.stopPropagation();this.pointerId=event.pointerId;
    this.element.setPointerCapture(event.pointerId);this.update(event);
  };
  private move=(event:PointerEvent)=>{
    if(event.pointerId!==this.pointerId)return;
    event.preventDefault();event.stopPropagation();
    if(!this.enabled||this.blocked()){this.reset();return;}this.update(event);
  };
  private update(event:PointerEvent){
    const rect=this.element.getBoundingClientRect(),radius=rect.width*.33;
    const x=event.clientX-rect.left-rect.width/2,y=event.clientY-rect.top-rect.height/2;
    this.direction=stickDirection(x,y,radius);
    const offset=stickOffset(x,y,radius);this.thumb.style.transform=`translate(${offset.x}px,${offset.y}px)`;
  }
  private end=(event:Event)=>{if((event as PointerEvent).pointerId===this.pointerId)this.reset();};
  setEnabled(enabled:boolean){
    if(this.enabled===enabled)return;
    this.enabled=enabled;this.element.hidden=!enabled;if(!enabled)this.reset();
  }
  getMovementVector(){return this.direction;}
  reset(){
    const id=this.pointerId;this.pointerId=undefined;this.direction={x:0,y:0};this.thumb.style.transform='translate(0px,0px)';
    if(id!==undefined&&this.element.hasPointerCapture(id))this.element.releasePointerCapture(id);
    this.stop();
  }
  destroy(){
    this.reset();this.offLocale();window.removeEventListener('resize',this.scheduleLayout);window.visualViewport?.removeEventListener('resize',this.scheduleLayout);
    this.resizeObserver.disconnect();cancelAnimationFrame(this.layoutFrame);
    this.element.removeEventListener('pointerdown',this.down);this.element.removeEventListener('pointermove',this.move);
    for(const event of ['pointerup','pointercancel','lostpointercapture'])this.element.removeEventListener(event,this.end);
    this.element.remove();
  }
}
