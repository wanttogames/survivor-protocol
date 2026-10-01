import Phaser from "phaser";
/** Built once. Every entity retains its original texture dimensions/body center. */
export function createObjectTextures(scene: Phaser.Scene) {
  const g = scene.add.graphics();
  const r = (x: number, y: number, w: number, h: number, c: number, a = 1) =>
    g.fillStyle(c, a).fillRect(x, y, w, h);
  const make = (key: string, size: number, draw: () => void) => {
    g.clear();
    draw();
    g.generateTexture(key, size, size);
    scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
  };
  for (let frame = 0; frame < 3; frame++)
    make(frame ? `player-walk-${frame}` : "player", 64, () => {
      // Ground sigil is baked into the texture, never another per-actor object.
      g.lineStyle(1, 0x82b5b5, 0.55).strokeEllipse(32, 48, 40, 15);
      g.lineStyle(1, 0xb8a16a, 0.7)
        .lineBetween(12, 48, 16, 48)
        .lineBetween(48, 48, 52, 48);
      r(22, 45, 20, 7, 0x070c10);
      r(23, 46 + (frame === 1 ? 2 : 0), 7, 6, 0xaca48a);
      r(35, 46 + (frame === 2 ? 2 : 0), 7, 6, 0xaca48a);
      r(21, 24, 22, 25, 0x080f17);
      r(17, 27, 30, 12, 0x0a131c);
      r(22, 25, 19, 21, 0x293d4b);
      r(19, 30, 5, 11, 0x597278);
      r(40, 30, 5, 11, 0x597278);
      r(27, 28, 3, 19, 0xa9a58b);
      r(34, 27, 4, 22, 0x172631);
      r(23, 34, 18, 4, 0x963f35);
      r(34, 37, 3, 10, 0xa6503b);
      r(40, 35, 5, 9, 0xd6c49d);
      r(42, 37, 1, 5, 0x963f35);
      r(27, 16, 12, 11, 0x10151a);
      r(28, 19, 10, 7, 0xbeb59c);
      r(29, 23, 2, 2, 0x2d2522);
      r(36, 23, 2, 2, 0x2d2522);
      // Gat: broad brim, narrow crown, small gold trim.
      r(15, 16, 34, 5, 0x080e13);
      r(20, 14, 24, 4, 0x27343c);
      r(25, 7, 14, 9, 0x0b141d);
      r(27, 8, 3, 7, 0x40515a);
      r(18, 19, 28, 1, 0xb8a16a);
    });
  for (const kind of ["grunt", "runner", "tank"])
    make(kind, 64, () => {
      if (kind === "grunt") {
        r(22, 18, 20, 26, 0x26363c);
        r(26, 12, 12, 7, 0x26363c);
        r(23, 20, 18, 21, 0xadb9b4);
        r(27, 14, 10, 16, 0xd6d9ca);
        r(19, 27, 6, 12, 0x8b9e9e);
        r(40, 27, 5, 13, 0x8b9e9e);
        r(26, 30, 5, 15, 0xc1c9bf);
        r(34, 32, 4, 15, 0x829b9d);
        r(24, 42, 5, 7, 0x829b9d, 0.65);
        r(33, 44, 4, 8, 0xa1b4b0, 0.5);
        r(39, 40, 3, 7, 0x829b9d, 0.4);
        r(28, 22, 3, 3, 0x3f282b);
        r(35, 22, 3, 3, 0x3f282b);
        r(31, 28, 3, 4, 0x667477);
      } else if (kind === "runner") {
        r(19, 25, 26, 15, 0x1c1722);
        r(24, 20, 17, 19, 0x544454);
        r(25, 22, 14, 11, 0x796071);
        r(21, 15, 5, 12, 0x362837);
        r(39, 15, 5, 12, 0x362837);
        r(21, 15, 2, 5, 0xb07359);
        r(42, 15, 2, 5, 0xb07359);
        r(16, 31, 7, 7, 0x66505b);
        r(43, 31, 7, 7, 0x66505b);
        r(14, 36, 8, 3, 0xb08a80);
        r(45, 36, 7, 3, 0xb08a80);
        r(24, 37, 5, 7, 0x362837);
        r(37, 37, 5, 7, 0x362837);
        r(21, 42, 8, 3, 0x927269);
        r(37, 42, 9, 3, 0x927269);
        r(26, 27, 4, 2, 0xd47659);
        r(36, 27, 4, 2, 0xd47659);
        r(31, 32, 4, 3, 0xc0b3a0);
      } else {
        r(9, 20, 46, 28, 0x211b1b);
        r(16, 13, 32, 36, 0x5c4039);
        r(11, 24, 12, 19, 0x796054);
        r(43, 24, 11, 19, 0x796054);
        r(22, 12, 20, 16, 0x4c3f39);
        r(24, 14, 16, 12, 0x9a8971);
        r(24, 19, 5, 3, 0x542e2a);
        r(35, 19, 5, 3, 0x542e2a);
        r(20, 29, 24, 17, 0x483e3a);
        r(22, 31, 8, 12, 0x817264);
        r(34, 31, 8, 12, 0x6c5d52);
        r(18, 45, 11, 9, 0x362d2a);
        r(36, 45, 12, 9, 0x362d2a);
        r(13, 25, 5, 12, 0x9c654a);
        r(47, 25, 4, 12, 0x9c654a);
        r(28, 26, 7, 15, 0xc1aa78);
        r(31, 28, 1, 10, 0x963f35);
      }
    });
  make("bolt", 24, () => {
    r(0, 10, 10, 4, 0xb8a16a, 0.18);
    r(3, 9, 8, 6, 0xb8a16a, 0.25);
    r(6, 6, 16, 12, 0x51402d);
    r(7, 7, 14, 10, 0xe4d6b6);
    r(9, 9, 10, 1, 0x963f35);
    r(11, 9, 2, 6, 0x963f35);
    r(16, 9, 1, 5, 0x963f35);
    r(9, 13, 10, 1, 0x963f35);
    r(20, 8, 2, 2, 0xf3e8c5);
  });
  make("orb", 24, () => {
    g.fillStyle(0x82b5b5, 0.1).fillCircle(12, 13, 10);
    r(9, 9, 7, 9, 0x416d7b);
    r(10, 6, 4, 12, 0x82b5b5);
    r(12, 3, 3, 6, 0x719caa);
    r(8, 12, 3, 4, 0x82b5b5);
    r(11, 11, 3, 5, 0xe1ede0);
    r(9, 20, 7, 1, 0x82b5b5, 0.5);
  });
  // Baked tier art: constant-size images, no additional bodies or per-orb glow objects.
  for(const [key,color,gold] of [
    ['orb-medium',0x65d6c4,false],['orb-large',0xd8f7ef,false],['orb-great',0xeffff6,true],
  ] as const)make(key,24,()=>{
    g.fillStyle(color,.14).fillCircle(12,12,10);
    g.lineStyle(1,gold?0xd8b45b:color,.8).strokeCircle(12,12,gold?9:7);
    r(10,4,4,15,color);r(8,9,8,8,color);r(11,9,3,7,0xffffff);
    if(gold){r(11,1,2,3,0xd8b45b);r(11,20,2,3,0xd8b45b);}
  });
  make("spark", 8, () => {
    r(1, 2, 5, 3, 0xffffff);
    r(2, 1, 2, 5, 0xffffff);
  });
  make("ash", 8, () => {
    r(1, 1, 5, 5, 0xffffff, 0.6);
    r(2, 0, 3, 7, 0xffffff, 0.2);
  });
  make("seal", 96, () => {
    g.lineStyle(2, 0xb8a16a, 0.8).strokeCircle(48, 48, 40);
    g.lineStyle(1, 0x963f35, 0.9).strokeCircle(48, 48, 32);
    r(35, 25, 26, 46, 0xb8a16a, 0.13);
    g.lineStyle(2, 0xb8a16a).lineBetween(48, 27, 48, 69);
    for (let i = 0; i < 4; i++) g.lineBetween(37, 34 + i * 8, 59, 34 + i * 8);
  });
  make("prop-stake", 64, () => {
    r(27, 17, 12, 38, 0x332d27);
    r(29, 18, 3, 35, 0x5a4734);
    r(26, 22, 15, 11, 0x5b4a36);
    r(28, 24, 3, 3, 0x151a19);
    r(35, 24, 3, 3, 0x151a19);
    r(29, 30, 8, 1, 0xa39678);
    r(31, 36, 7, 14, 0xb2a079);
    r(34, 38, 1, 10, 0x82392d);
  });
  make("prop-stone", 64, () => {
    r(13, 39, 39, 12, 0x262e30);
    r(19, 33, 15, 14, 0x414747);
    r(36, 37, 12, 12, 0x343d40);
    r(25, 27, 13, 12, 0x53564f);
    r(27, 28, 8, 2, 0x727464);
  });
  make("prop-lantern", 64, () => {
    g.fillStyle(0xb8a16a, 0.04).fillCircle(32, 36, 26);
    r(28, 41, 7, 14, 0x44382c);
    r(23, 23, 18, 20, 0x47372b);
    r(26, 25, 12, 15, 0xb09254);
    r(30, 27, 4, 11, 0xd5ba7a);
    r(20, 20, 24, 4, 0x554939);
    r(23, 42, 18, 3, 0x554939);
  });
  g.destroy();
}
