import type Phaser from 'phaser';
import { WEAPON_RULES } from '../data/weaponConfig';
/** Small reusable textures generated once at boot; no runtime texture regeneration. */
export function createWeaponTextures(scene: Phaser.Scene) {
    const g = scene.add.graphics();
    const save = (key: string, size: number) => { g.generateTexture(key, size, size); g.clear(); };
    g.fillStyle(0x201919).fillCircle(16, 16, 12).fillStyle(0x8c6540).fillCircle(16, 16, 9);
    g.lineStyle(2, 0xd1b275).strokeCircle(16, 16, 8).fillStyle(0xe2ca92).fillRect(11, 10, 4, 4);
    g.fillStyle(0x863e32).fillRect(14, 21, 4, 8);
    save('rosary-bead', 32);
    g.lineStyle(3, 0xcfbb82, .9).strokeCircle(128, 128, 122).lineStyle(1, 0xd8e0cc, .65).strokeCircle(128, 128, 110);
    for (let i = 0; i < 12; i++) {
        const a = i * Math.PI / 6;
        g.lineStyle(3, 0xcbb47d, .8).lineBetween(128 + Math.cos(a) * 98, 128 + Math.sin(a) * 98, 128 + Math.cos(a) * 111, 128 + Math.sin(a) * 111);
    }
    save('bell-wave', 256);
    const half = WEAPON_RULES.swordHalfAngle;
    g.fillStyle(0x6e9199, .15).slice(128, 128, 121, -half, half, false).fillPath();
    g.lineStyle(12, 0x1a2d36, .85).beginPath().arc(128, 128, 108, -half, half).strokePath();
    g.lineStyle(5, 0xc5d5d0, .95).beginPath().arc(128, 128, 109, -half, half).strokePath();
    g.lineStyle(2, 0xe1ddbc, .8).beginPath().moveTo(160, 126).lineTo(191, 112).lineTo(180, 130).lineTo(224, 122).strokePath();
    save('sword-slash', 256);
    g.lineStyle(3, 0x211c17).lineBetween(5, 24, 42, 24).lineStyle(2, 0xc7b17d).lineBetween(7, 24, 39, 24);
    g.fillStyle(0xd1d9ce).fillTriangle(45, 24, 34, 19, 34, 29).fillStyle(0x8b4337).fillRect(14, 21, 6, 6);
    g.lineStyle(2, 0xaaa58a).lineBetween(5, 18, 13, 24).lineBetween(5, 30, 13, 24);
    save('ghost-arrow', 48);
    g.fillStyle(0x6e3026, .25).fillCircle(128, 128, 121).lineStyle(3, 0xa94d32, .9).strokeCircle(128, 128, 118).lineStyle(2, 0xc69151, .7).strokeCircle(128, 128, 98);
    g.lineStyle(2, 0xb24e32, .85).strokeTriangle(128, 32, 45, 177, 211, 177).strokeTriangle(128, 222, 45, 79, 211, 79);
    for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4, x = 128 + Math.cos(a) * 78, y = 128 + Math.sin(a) * 78;
        g.fillStyle(0xb55932, .8).fillTriangle(x, y - 11, x - 5, y + 4, x + 5, y + 4).fillStyle(0xd5a665, .8).fillRect(x - 2, y - 3, 4, 7);
    }
    save('hellfire-seal', 256);
    g.destroy();
}
