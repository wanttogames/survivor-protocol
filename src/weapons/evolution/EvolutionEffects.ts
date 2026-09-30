import type Phaser from 'phaser';
import { EVOLUTION_EFFECTS as C } from '../../data/weaponConfig';
export class EvolutionEffects {
    private effects: {
        image: Phaser.GameObjects.Image;
        life: number;
    }[];
    constructor(scene: Phaser.Scene) {
        if (!scene.textures.exists('evolution-lightning')) {
            const g = scene.make.graphics({ x: 0, y: 0 });
            g.lineStyle(2, 0xd7f4ee, .95);
            g.beginPath();
            g.moveTo(0, 8);
            g.lineTo(22, 3);
            g.lineTo(38, 13);
            g.lineTo(52, 4);
            g.lineTo(64, 8);
            g.strokePath();
            g.generateTexture('evolution-lightning', 64, 16);
            g.destroy();
        }
        if (!scene.textures.exists('infernal-seal')) {
            const g = scene.make.graphics({ x: 0, y: 0 });
            g.fillStyle(0x6d2019, .28).fillCircle(64, 64, 59);
            g.lineStyle(2, 0xd87935, .85).strokeCircle(64, 64, 56).strokeCircle(64, 64, 40);
            for (let i = 0; i < 12; i++) {
                const a = i * Math.PI / 6, x = 64 + Math.cos(a) * 48, y = 64 + Math.sin(a) * 48;
                g.fillStyle(i % 2 ? 0xb64729 : 0xeab76a, .85).fillTriangle(x, y - 6, x - 3, y + 5, x + 4, y + 3);
            }
            g.generateTexture('infernal-seal', 128, 128);
            g.destroy();
        }
        if (!scene.textures.exists('thunder-talisman')) {
            const g = scene.make.graphics({ x: 0, y: 0 });
            g.fillStyle(0xb3e5e5, .18).fillCircle(12, 12, 11);
            g.fillStyle(0xefdeb0).fillRect(5, 8, 15, 8);
            g.lineStyle(1, 0x9c4638).lineBetween(8, 10, 17, 10).lineBetween(8, 13, 16, 13).lineBetween(11, 9, 11, 15);
            g.lineStyle(1, 0xd3f4f4, .95).lineBetween(2, 6, 9, 3).lineBetween(9, 3, 7, 7).lineBetween(7, 7, 18, 5).lineBetween(16, 20, 23, 17);
            g.generateTexture('thunder-talisman', 24, 24);
            g.destroy();
        }
        this.effects = Array.from({ length: C.visualPool }, () => ({ image: scene.add.image(0, 0, 'evolution-lightning').setDepth(5).setVisible(false), life: 0 }));
    }
    line(x: number, y: number, tx: number, ty: number) { const f = this.effects.find(f => f.life <= 0); if (!f)
        return; f.life = C.visualLifetime; f.image.setPosition((x + tx) / 2, (y + ty) / 2).setRotation(Math.atan2(ty - y, tx - x)).setDisplaySize(Math.max(18, Math.hypot(tx - x, ty - y)), 18).setAlpha(1).setVisible(true); }
    update(dt: number) { for (const f of this.effects)
        if (f.life > 0) {
            f.life -= dt;
            f.image.setAlpha(Math.max(0, f.life / C.visualLifetime)).setVisible(f.life > 0);
        } }
    clear() { for (const f of this.effects) {
        f.life = 0;
        f.image.setVisible(false);
    } }
    destroy() { for (const f of this.effects)
        f.image.destroy(); }
}
