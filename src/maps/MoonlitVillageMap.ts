import type Phaser from 'phaser';
import { label } from '../ui/common';
import { t } from '../i18n';
import { createMapTextures } from './mapTextures';
import { isMapSpawnSafe } from './spawnSafety';
import type { MapDefinition, MapPoint } from './mapDefinitions';
export type MapMood = 'quiet' | 'general' | 'king' | 'sealed';
type StaticObject = { key: string; x: number; y: number; margin: number; scale: number; alpha: number; rotation: number };
type Floating = { image: Phaser.GameObjects.Image; x: number; y: number; phase: number };
function rng(seed:number){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
/** Static canvas terrain is cached for the entire game. Only a bounded atmospheric set moves. */
export class MoonlitVillageMap {
  readonly staticObjects: StaticObject[] = [];
  readonly fog: Floating[] = [];
  readonly wisps: Floating[] = [];
  readonly papers: Floating[] = [];
  readonly smoke: Floating[] = [];
  readonly lights: Phaser.GameObjects.Image[] = [];
  mood: MapMood = 'quiet';
  private objects: Phaser.GameObjects.GameObject[] = [];
  private title: Phaser.GameObjects.Text[] = [];
  private terrain: Phaser.GameObjects.Image[] = [];
  private clock = 0;
  private cullTimer = 0;
  private intensity = 0;
  private bakedKeys: string[] = [];
  private seal!: Phaser.GameObjects.Image;
  private sealActive!: Phaser.GameObjects.Image;
  private sealBound!: Phaser.GameObjects.Image;
  private wave!: Phaser.GameObjects.Image;
  constructor(private scene: Phaser.Scene, readonly definition: MapDefinition) {}
  create(){
    const s=this.scene,d=this.definition;
    createMapTextures(s);
    this.createGround();
    const add=(key:string,x:number,y:number,scale=1,alpha=1,rotation=0)=>{
      const texture=s.textures.get(key).getSourceImage() as HTMLCanvasElement;
      this.staticObjects.push({key,x,y,scale,alpha,rotation,margin:Math.max(texture.width,texture.height)*scale/2+100});
    };
    for(const l of d.landmarks){
      if(l.kind==='gate'){
        add('mv-jangseung-0',l.x-160,l.y,1.8,1,-.04);add('mv-jangseung-1',l.x+155,l.y+12,1.75,1,.06);
        add('mv-rock',l.x-200,l.y+145,.65);add('mv-rock',l.x+200,l.y+115,.55);
      }else if(l.kind!=='seal')add(`mv-${l.kind}`,l.x,l.y,l.scale);
    }
    // Architecture clusters remain fixed; paths and their entrances remain clear.
    for(const house of d.landmarks.filter(l=>l.kind==='house')){
      add('mv-wall',house.x-145,house.y+175,.9);add('mv-wall',house.x+145,house.y+175,.8);
      add('mv-jar',house.x+205,house.y+110,1);add('mv-jar',house.x+241,house.y+125,.75);
      add('mv-crate',house.x-192,house.y+110);add('mv-fence',house.x-205,house.y-100,.8,.8,-.1);
    }
    for(let i=0;i<7;i++){
      const x=1910+i*66,y=2000-i*88;
      add(`mv-jangseung-${i%4}`,x-190,y,1+(i%3)*.14,.85,-.06+i%2*.1);
      add(`mv-jangseung-${(i+1)%4}`,x+235,y-15,.95+(i%2)*.15,.83,.05);
      if(i%2===0)add('mv-altar',x-260,y+80,.8,.8);
    }
    for(let row=0;row<4;row++)for(let col=0;col<5;col++){
      const x=2490+col*137+(row%2)*43,y=810+row*151;
      if(Math.hypot(x-2750,y-930)>155)add('mv-grave',x,y,.85+(col%3)*.12,.92,(col%2?-.05:.03));
    }
    add('mv-altar',1500,925,1.1);add('mv-wall',1205,795,1);add('mv-wall',1800,795,1);
    for(let i=0;i<5;i++)add('mv-jangseung-'+i%4,1220+i*135,480,.8,.8);
    // Sparse, run-varying dressing. Local RNG cannot perturb combat randomness.
    const random=rng(Math.floor(Math.random()*0xffffffff)),keys=['mv-rock','mv-jar','mv-fence','mv-grave','mv-tree'];
    for(let i=0;i<d.decorationConfig.smallProps;i++){
      const x=100+random()*(d.width-200),y=100+random()*(d.height-200);
      if(Math.hypot(x-d.start.x,y-d.start.y)<230||!isMapSpawnSafe(x,y,80,d)||this.onRoad(x,y,130))continue;
      let key=keys[i%keys.length];if(key==='mv-grave'&&(x<2250||y>1600))key='mv-rock';
      add(key,x,y,key==='mv-tree'?.5+random()*.35:.35+random()*.55,.56+random()*.18,random()*.14-.07);
    }
    // Silhouettes frame the boundary without creating walls or off-world physics bodies.
    for(let i=0;i<18;i++){const p=150+i*190;add('mv-tree',p,155,.7,.55);add('mv-tree',p,d.height-130,.75,.55);if(i%2===0){add('mv-tree',130,p,.8,.55);add('mv-tree',d.width-135,p,.75,.55);}}
    for(const [x,y] of [[1630,2570],[1900,2230],[960,2280],[2090,2020],[2330,1550],[1430,929]]){
      add('mv-lantern',x,y,1.1,.92);const glow=s.add.image(x+18,y-4,'mv-glow').setScale(2.2).setDepth(-5).setAlpha(.6);this.lights.push(glow);this.objects.push(glow);
    }
    const seal=d.landmarks.find(l=>l.kind==='seal')!;
    const sealImage=(key:string,depth:number)=>{const image=s.add.image(seal.x,seal.y,key).setDepth(depth);this.objects.push(image);return image;};
    this.seal=sealImage('mv-seal',-5).setAlpha(.55);
    this.sealActive=sealImage('mv-seal-awake',-4).setAlpha(0);
    this.sealBound=sealImage('mv-seal-bound',-4).setAlpha(0);
    this.wave=sealImage('mv-seal-awake',-4).setAlpha(0);
    for(let i=0;i<8;i++){
      const a=i*Math.PI/4,x=seal.x+Math.cos(a)*187,y=seal.y+Math.sin(a)*187;
      add('mv-jangseung-'+i%4,x,y,.53,.68);
      const image=s.add.image(x,y-15,'mv-paper').setDepth(-3).setScale(.65);this.papers.push({image,x,y:y-15,phase:a});this.objects.push(image);
    }
    const fogSpots=[[1800,2500],[1180,2080],[2100,1710],[2600,1130],[2890,900],[1500,700],[1660,1200],[2100,1070]];
    for(let i=0;i<d.decorationConfig.fogLayers;i++){
      const [x,y]=fogSpots[i%fogSpots.length],image=s.add.image(x,y,'mv-fog').setScale(2.4,1.6).setDepth(-1).setAlpha(.33);
      this.fog.push({image,x,y,phase:i*1.7});this.objects.push(image);
    }
    for(let i=0;i<d.decorationConfig.wisps;i++){
      const x=i<7?2470+(i%4)*180:1340+(i%3)*160,y=i<7?900+Math.floor(i/4)*300:810+Math.floor((i-7)/3)*250;
      const image=s.add.image(x,y,'mv-wisp').setDepth(-.5).setScale(.75).setAlpha(.47);
      this.wisps.push({image,x,y,phase:i*1.8});this.objects.push(image);
    }
    for(let i=0;i<3;i++){
      const x=seal.x-100+i*95,y=seal.y-40,image=s.add.image(x,y,'mv-smoke').setDepth(-2).setAlpha(.2);
      this.smoke.push({image,x,y,phase:i*2});this.objects.push(image);
    }
    // Bake static silhouettes into opaque terrain chunks: no live sprite per decoration.
    this.bakeScenery();
    this.title=[label(s,640,300,()=>t(d.nameKey),35,'#d2c7a8').setOrigin(.5),label(s,640,345,()=>t(d.descriptionKey),15,'#aea993').setOrigin(.5)];
    for(const text of this.title){text.setDepth(95).setShadow(0,2,'#111819',5);this.objects.push(text);}
  }
  setMood(mood:MapMood){this.mood=mood;}
  private onRoad(x:number,y:number,r:number){
    return this.definition.roads.some(road=>road.some((p,i)=>{
      if(!i)return false;const a=road[i-1],dx=p.x-a.x,dy=p.y-a.y,q=Math.max(0,Math.min(1,((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy)));
      return Math.hypot(x-a.x-dx*q,y-a.y-dy*q)<r;
    }));
  }
  private createGround(){
    const s=this.scene,d=this.definition,size=600;
    for(let y=0;y<d.height;y+=size)for(let x=0;x<d.width;x+=size){
      const key=`mv-ground-${x}-${y}`;
      if(!s.textures.exists(key)){
        const texture=s.textures.createCanvas(key,300,300)!,c=texture.context,random=rng(x*31+y*127+159);
        c.scale(.5,.5);c.translate(-x,-y);c.fillStyle='#252d27';c.fillRect(x,y,size,size);
        for(const z of d.zones){const g=c.createRadialGradient(z.center.x,z.center.y,0,z.center.x,z.center.y,z.radius);g.addColorStop(0,z.color);g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(x,y,size,size);}
        // Continuous broad dirt tracks, tapered shoulders and a pale worn center.
        for(const road of d.roads){
          const stroke=(width:number,color:string)=>{c.beginPath();c.moveTo(road[0].x,road[0].y);for(let i=1;i<road.length-1;i++)c.quadraticCurveTo(road[i].x,road[i].y,(road[i].x+road[i+1].x)/2,(road[i].y+road[i+1].y)/2);const last=road[road.length-1];c.lineTo(last.x,last.y);c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();};
          stroke(184,'rgba(73,65,47,.3)');stroke(128,'rgba(82,70,49,.5)');stroke(78,'rgba(97,80,54,.25)');
        }
        for(let i=0;i<1050;i++){
          const px=x+random()*size,py=y+random()*size,r=random();c.fillStyle=r<.5?'rgba(126,111,76,.10)':'rgba(8,23,20,.12)';c.fillRect(px,py,2+random()*6,1+random()*3);
          if(i%14===0){c.strokeStyle='#4e5940';c.globalAlpha=.38;c.lineWidth=1;c.beginPath();c.moveTo(px-3,py+4);c.lineTo(px-6,py-5);c.moveTo(px,py+4);c.lineTo(px+1,py-7);c.moveTo(px+2,py+4);c.lineTo(px+6,py-2);c.stroke();c.globalAlpha=1;}
          if(i%28===0){c.fillStyle='#525a49';c.globalAlpha=.3;c.beginPath();c.ellipse(px,py,3,1.5,.3,0,Math.PI*2);c.fill();c.globalAlpha=1;}
        }
        c.setTransform(1,0,0,1,0,0);texture.refresh();
      }
      const image=s.add.image(x,y,key).setOrigin(0).setDisplaySize(size,size).setDepth(-10).setName('map:terrain');this.terrain.push(image);this.objects.push(image);
    }
  }
  private bakeScenery(){
    const s=this.scene;
    for(const tile of this.terrain){
      const key=`mv-run-ground-${tile.x}-${tile.y}`,base=s.textures.get(tile.texture.key).getSourceImage() as HTMLCanvasElement;
      const texture=s.textures.createCanvas(key,300,300)!,c=texture.context;
      c.drawImage(base,0,0);c.scale(.5,.5);c.translate(-tile.x,-tile.y);
      for(const o of this.staticObjects){
        if(o.x+o.margin<tile.x||o.x-o.margin>tile.x+600||o.y+o.margin<tile.y||o.y-o.margin>tile.y+600)continue;
        const source=s.textures.get(o.key).getSourceImage() as HTMLCanvasElement;
        c.save();c.translate(o.x,o.y);c.rotate(o.rotation);c.scale(o.scale,o.scale);c.globalAlpha=o.alpha;c.drawImage(source,-source.width/2,-source.height/2);c.restore();
      }
      c.setTransform(1,0,0,1,0,0);texture.refresh();tile.setTexture(key);this.bakedKeys.push(key);
    }
  }
  private cameraRect(){
    const c=this.scene.cameras.main;
    return {left:c.scrollX,top:c.scrollY,right:c.scrollX+c.width/c.zoom,bottom:c.scrollY+c.height/c.zoom};
  }
  private cull(){
    const v=this.cameraRect(),i=this.intensity;
    const tint=(Math.round(255*(1-i*.08))<<16)|(Math.round(255*(1-i*.07))<<8)|Math.round(255*(1-i*.03));
    for(const tile of this.terrain)tile.setVisible(tile.x+600>=v.left&&tile.x<=v.right&&tile.y+600>=v.top&&tile.y<=v.bottom).setTint(tint);
  }
  update(dt:number){
    this.clock+=dt;this.cullTimer-=dt;if(this.cullTimer<=0){this.cullTimer=.25;this.cull();}
    const goal=this.mood==='king'?1:this.mood==='general'?.4:0;this.intensity+=(goal-this.intensity)*Math.min(1,dt*1.8);
    const v=this.cameraRect();
    const visible=(x:number,y:number,pad:number)=>x+pad>=v.left&&x-pad<=v.right&&y+pad>=v.top&&y-pad<=v.bottom;
    for(const f of this.fog){f.image.setPosition(f.x+Math.sin(this.clock*.09+f.phase)*80,f.y+Math.cos(this.clock*.07+f.phase)*23).setAlpha(.32+this.intensity*.22).setVisible(visible(f.x,f.y,550));}
    for(const f of this.wisps){f.image.setPosition(f.x+Math.sin(this.clock*.2+f.phase)*7,f.y+Math.sin(this.clock*.7+f.phase)*7).setAlpha(.42+Math.sin(this.clock*.9+f.phase)*.06+this.intensity*.13).setVisible(visible(f.x,f.y,50));}
    for(const f of this.papers)f.image.setRotation(Math.sin(this.clock*(.5+this.intensity)+f.phase)*(.02+this.intensity*.12));
    for(const f of this.smoke)f.image.setPosition(f.x+Math.sin(this.clock*.13+f.phase)*20,f.y-Math.sin(this.clock*.2+f.phase)*15).setAlpha(.18+this.intensity*.45);
    for(const image of this.lights)image.setAlpha(.53+Math.sin(this.clock*.7+image.x)*.035);
    this.sealActive.setAlpha(this.mood==='king'?.38+Math.sin(this.clock*.9)*.07:0);
    this.sealBound.setAlpha(this.mood==='sealed'?.8:0);this.seal.setAlpha(this.mood==='sealed'?.22:.5);
    const p=(this.clock*.17)%1;this.wave.setScale(1+p*.5).setAlpha(this.mood==='king'?(1-p)*.13:0);
    const a=Math.min(1,Math.max(0,(2.2-this.clock)/.7));for(const text of this.title)text.setAlpha(a).setVisible(a>0);
  }
  destroy(){for(const o of this.objects)o.destroy();this.objects=[];this.staticObjects.length=0;this.fog.length=0;this.wisps.length=0;this.papers.length=0;this.smoke.length=0;this.lights.length=0;this.terrain=[];this.title=[];for(const key of this.bakedKeys)this.scene.textures.remove(key);this.bakedKeys=[];}
}
