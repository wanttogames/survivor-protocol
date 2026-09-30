import type Phaser from 'phaser';
import { Weapon, type WeaponContext } from './Weapon';
import { inCircle } from './geometry';
export class BellWeapon extends Weapon {
    private wave: Phaser.GameObjects.Image;
    private life = 0;
    private radius = 0;
    constructor(ctx: WeaponContext) { super('exorcism-bell', ctx); this.wave = ctx.scene.add.image(0, 0, 'bell-wave').setDepth(2).setVisible(false); }
    update(dt: number) {
        if (this.life > 0) {
            this.life -= dt;
            const progress = 1 - this.life / this.stats.duration;
            this.wave.setDisplaySize(this.radius * 2 * (.25 + progress * .75), this.radius * 2 * (.25 + progress * .75)).setAlpha(Math.max(0, 1 - progress)).setVisible(this.life > 0);
        }
        if (!this.due(dt))
            return;
        const s = this.stats, p = this.ctx.player;
        this.timer = s.cooldown / this.haste;
        this.life = s.duration;
        this.radius = s.radius;
        this.wave.setPosition(p.x, p.y).setVisible(true).setAlpha(.9).setDisplaySize(s.radius * .5, s.radius * .5);
        for (const e of this.ctx.enemies.items)
            if (e.active && inCircle(e.x, e.y, p.x, p.y, s.radius))
                this.ctx.strike(e, s.damage, this.id);
    }
    destroy() { this.wave.destroy(); }
}
