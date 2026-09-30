import type Phaser from 'phaser';
type C = CanvasRenderingContext2D;
const poly=(c:C,points:number[],color:string)=>{c.fillStyle=color;c.beginPath();for(let i=0;i<points.length;i+=2)i?c.lineTo(points[i],points[i+1]):c.moveTo(points[i],points[i+1]);c.closePath();c.fill();};
const rect=(c:C,x:number,y:number,w:number,h:number,color:string)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
const line=(c:C,p:number[],color:string,width=2)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();for(let i=0;i<p.length;i+=2)i?c.lineTo(p[i],p[i+1]):c.moveTo(p[i],p[i+1]);c.stroke();};
const oval=(c:C,x:number,y:number,rx:number,ry:number,color:string)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();};
function paper(c:C,x:number,y:number,angle=0){c.save();c.translate(x,y);c.rotate(angle);rect(c,-4,-14,8,28,'#aa9970');line(c,[0,-9,-2,-3,2,1,-2,6,1,10],'#703c32',1.6);c.restore();}
function tiledRoof(c:C,x:number,y:number,w:number,h:number){
  poly(c,[x,y+h,x+24,y+h-20,x+48,y+8,x+w-48,y+8,x+w-24,y+h-20,x+w,y+h,x+w/2,y+h+17],'#151e24');
  for(let i=0;i<w-80;i+=13){const xx=x+43+i;line(c,[xx,y+10,xx-14,y+h-9],'#39434a',3);line(c,[xx+4,y+10,xx-10,y+h-9],'#202c31',4);}
  line(c,[x+46,y+8,x+w-46,y+8],'#647069',4);
  line(c,[x,y+h,x+24,y+h-20,x+w/2,y+h-3,x+w-24,y+h-20,x+w,y+h],'#4c5857',4);
  line(c,[x,y+h+2,x+w/2,y+h+19,x+w,y+h+2],'#0e171c',5);
  rect(c,x+w/2-8,y,16,12,'#57605a');
}
function house(c:C,shrine=false){
  const w=shrine?400:340;
  oval(c,w/2,228,w/2-2,35,'#111a1c');
  rect(c,35,125,w-70,100,'#554c3a');rect(c,42,134,w-84,83,'#30362f');
  for(let x=57;x<w-40;x+=55){rect(c,x,145,44,64,'#797563');rect(c,x+2,148,40,59,'#555c50');for(let i=7;i<43;i+=10)rect(c,x+i,148,2,59,'#34382e');rect(c,x,169,44,3,'#33392f');rect(c,x,194,44,3,'#33392f');}
  for(const x of [40,w/2-5,w-50]){rect(c,x,119,10,112,'#2d2b24');rect(c,x+2,122,3,105,'#65523c');}
  rect(c,26,220,w-52,10,'#656050');rect(c,20,230,w-40,12,'#3c423b');rect(c,51,242,w-102,9,'#4a5149');
  tiledRoof(c,4,32,w-8,95);
  paper(c,w/2-14,159,.06);paper(c,w/2+13,182,-.07);
  if(shrine){tiledRoof(c,35,1,w-70,49);rect(c,w/2-40,109,80,23,'#2b312a');line(c,[w/2-20,116,w/2-9,123,w/2+2,115,w/2+17,125],'#897d59',3);for(const x of [65,110,275,320])paper(c,x,144,.12);}
  else{line(c,[51,63,82,83,77,111],'#131e25',5);rect(c,245,146,8,61,'#242a27');}
}
function tree(c:C){
  oval(c,144,239,90,18,'#182324');
  poly(c,[120,251,134,220,136,139,119,95,131,107,148,145,156,98,169,77,162,150,166,211,178,247,151,230,135,248],'#4d4c41');
  line(c,[147,229,151,153,148,107,160,57,181,23],'#696452',5);
  for(const [p,w] of [ [[145,157,106,119,79,64,44,52],9],[[107,120,77,123,37,100],6],[[148,126,191,103,215,59,245,47],10],[[194,105,239,112,270,91],6],[[146,106,117,64,88,32],7],[[159,76,183,57,210,35],6],[[81,68,65,28],4],[[213,64,220,23],4] ] as [number[],number][]){line(c,p,'#4a4d43',w);line(c,p,'#343f39',Math.max(2,w-4));}
  for(const x of [130,153,163])paper(c,x,176,x===153?-.1:.15);
  line(c,[109,157,178,165],'#807c59',2);oval(c,149,249,20,7,'#242d2a');
}
export function createMapTextures(scene:Phaser.Scene){
  const make=(key:string,w:number,h:number,draw:(c:C)=>void)=>{if(scene.textures.exists(key))return;const t=scene.textures.createCanvas(key,w,h)!;draw(t.context);t.refresh();};
  make('mv-house',340,270,c=>house(c));make('mv-shrine',400,290,c=>house(c,true));make('mv-tree',288,270,tree);
  for(let v=0;v<4;v++)make(`mv-jangseung-${v}`,64,166,c=>{
    oval(c,32,151,28,10,'#172120');poly(c,[16,150,20,33,17,19,25,10,49,14,47,37,44,152],'#68573d');
    rect(c,24,19,18,122,v%2?'#776042':'#5d503b');line(c,[28,26,25,58,29,89,26,147],'#3b3d2e',2);line(c,[39,23,36,51,40,122],'#a08350',1);
    poly(c,[20,47,31,40,33,46,21,52],'#252b25');poly(c,[35,46,47,40,46,51,36,52],'#252b25');
    rect(c,28,62,10,7,'#262d27');line(c,[23,39,31,35,34,39,43,34],'#242d27',3);
    line(c,[29,82,36,88,28,96,37,105,28,114,35,123],'#773b30',3);if(v%2===0)paper(c,41,113,-.09);
  });
  make('mv-grave',120,88,c=>{oval(c,60,68,56,17,'#162322');oval(c,62,48,50,28,'#3e4937');oval(c,57,43,43,22,'#515942');line(c,[24,53,28,46,34,42,39,52,47,40,56,51],'#687057',2);rect(c,54,45,19,37,'#72786b');poly(c,[54,45,54,40,63,36,73,40,73,45],'#737d72');rect(c,58,49,3,25,'#414f47');rect(c,66,49,2,25,'#414f47');});
  make('mv-rock',94,75,c=>{oval(c,47,63,44,10,'#172222');poly(c,[6,48,16,25,33,12,66,17,87,38,80,61,24,66],'#4d5953');poly(c,[17,26,34,13,65,18,56,40,26,49],'#667067');line(c,[34,17,41,36,57,42,70,59],'#303f3b',2);});
  make('mv-wall',180,53,c=>{rect(c,3,20,174,26,'#424b41');for(let y=22;y<46;y+=12)for(let x=4;x<170;x+=27){rect(c,x+(y===22?0:12),y,24,9,'#5e6453');}line(c,[2,21,20,10,158,10,178,21],'#27352e',8);line(c,[20,11,158,11],'#717159',2);});
  make('mv-fence',130,65,c=>{for(let x=7;x<127;x+=23){poly(c,[x,60,x-2,13,x+5,4,x+10,12,x+11,60],'#665339');line(c,[x+2,14,x+4,55],'#87714b',1);}line(c,[8,29,120,25],'#423e2e',5);line(c,[9,49,83,45],'#494330',5);});
  make('mv-jar',42,54,c=>{oval(c,21,46,19,6,'#192623');oval(c,21,30,17,20,'#5b4d39');oval(c,21,13,13,5,'#82735b');oval(c,21,12,10,3,'#2b322a');line(c,[24,17,20,26,25,33,23,43],'#232d26',3);line(c,[11,23,10,35],'#766149',2);});
  make('mv-crate',48,45,c=>{rect(c,4,9,40,32,'#584a33');poly(c,[4,9,15,2,47,3,44,9],'#786447');rect(c,8,13,32,22,'#453f2e');line(c,[8,13,40,35,8,35,40,13],'#87714f',3);});
  make('mv-altar',100,83,c=>{oval(c,50,74,46,7,'#172321');rect(c,15,41,70,31,'#3d4941');rect(c,6,34,88,14,'#6d7464');rect(c,11,27,78,9,'#90907b');rect(c,34,20,33,10,'#413c30');rect(c,27,12,3,14,'#a39461');rect(c,72,12,3,14,'#a39461');paper(c,51,53);});
  make('mv-lantern',54,95,c=>{oval(c,27,86,22,5,'#192320');rect(c,26,8,4,78,'#625a40');line(c,[17,17,41,17,41,29],'#75664b',3);rect(c,33,28,16,28,'#795334');rect(c,35,31,12,22,'#b68647');for(const y of [33,43,51])rect(c,35,y,12,1,'#634932');rect(c,30,25,22,4,'#373c2d');rect(c,31,56,20,3,'#333a2c');});
  make('mv-glow',96,96,c=>{const g=c.createRadialGradient(48,48,2,48,48,48);g.addColorStop(0,'rgba(186,122,52,.35)');g.addColorStop(.35,'rgba(153,110,47,.12)');g.addColorStop(1,'rgba(150,110,50,0)');c.fillStyle=g;c.fillRect(0,0,96,96);});
  make('mv-wisp',44,64,c=>{const g=c.createRadialGradient(22,33,2,22,33,27);g.addColorStop(0,'rgba(81,126,132,.5)');g.addColorStop(1,'rgba(39,89,101,0)');c.fillStyle=g;c.fillRect(0,0,44,64);poly(c,[20,49,12,37,14,29,19,21,19,11,28,25,30,36,26,47],'#568289');poly(c,[20,43,18,35,22,28,25,35,23,43],'#9baaaa');});
  make('mv-fog',256,128,c=>{for(const [x,y,r] of [[75,68,64],[132,62,64],[183,67,54]]){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(116,137,143,.22)');g.addColorStop(1,'rgba(105,127,139,0)');c.fillStyle=g;c.fillRect(x-r,y-r,2*r,2*r);}});
  make('mv-smoke',128,256,c=>{for(let i=0;i<6;i++){const x=65+Math.sin(i*2)*18,y=240-i*35,r=28+i*5,g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(7,13,21,.42)');g.addColorStop(1,'rgba(7,13,21,0)');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}});
  for(const [key,color] of [['mv-seal','#684d40'],['mv-seal-awake','#8b473c'],['mv-seal-bound','#7c9893']])make(key,330,330,c=>{
    c.strokeStyle=color;c.lineWidth=3;for(const r of [106,139]){c.beginPath();c.arc(165,165,r,.12,Math.PI*2-.13);c.stroke();}
    for(let i=0;i<8;i++){const a=i*Math.PI/4;c.save();c.translate(165+Math.cos(a)*122,165+Math.sin(a)*122);c.rotate(a);line(c,[-7,-10,8,-10,8,2,-7,2,-7,11,7,11],color,3);c.restore();}
    poly(c,[165,80,221,181,122,181],'#27312f');line(c,[165,83,231,202,99,202,165,83],color,3);line(c,[107,108,134,133,128,160,140,194], '#222c2a',8);
    for(let i=0;i<7;i++){const a=i*2.1;line(c,[165+Math.cos(a)*145,165+Math.sin(a)*145,165+Math.cos(a)*155,165+Math.sin(a)*155],color,2);}
  });
  make('mv-paper',18,56,c=>paper(c,9,28));
}
