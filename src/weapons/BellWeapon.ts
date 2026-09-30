import type Phaser from 'phaser';
import type { WeaponId } from '../data/weaponConfig';
import { Weapon, type WeaponContext } from './Weapon';
import { EVOLUTION_EFFECTS } from '../data/weaponConfig';
import { inCircle } from './geometry';
export class BellWeapon extends Weapon {
    private wave: Phaser.GameObjects.Image;
    private life = 0;
    private echo = -1;
    private echoX = 0;
    private echoY = 0;
    private echoWave: Phaser.GameObjects.Image;
    private echoLife = 0;
    private radius = 0;
    constructor(ctx: WeaponContext, id: WeaponId = 'exorcism-bell') { super(id, ctx); this.echoWave = ctx.scene.add.image(0, 0, 'bell-wave').setTint(0xb5e4e5).setDepth(2).setVisible(false); this.wave = ctx.scene.add.image(0, 0, 'bell-wave').setDepth(2).setVisible(false); }
    update(dt: number) {
        if (this.echoLife > 0) {
            this.echoLife -= dt;
            const v = 1 - this.echoLife / this.stats.duration;
            this.echoWave.setDisplaySize(this.stats.radius * 2 * (.25 + v * .75), this.stats.radius * 2 * (.25 + v * .75)).setAlpha(Math.max(0, 1 - v)).setVisible(this.echoLife > 0);
        }
        if (this.echo >= 0) {
            this.echo -= dt;
            if (this.echo < 0) {
                this.echoLife = this.stats.duration;
                this.echoWave.setPosition(this.echoX, this.echoY).setVisible(true);
                for (const e of this.ctx.enemies.items)
                    if (e.active && inCircle(e.x, e.y, this.echoX, this.echoY, this.stats.radius))
                        this.ctx.strike(e, this.stats.damage * EVOLUTION_EFFECTS.echoDamage, this.id);
            }
        }
        if (this.life > 0) {
            this.life -= dt;
            const progress = 1 - this.life / this.stats.duration;
            this.wave.setDisplaySize(this.radius * 2 * (.25 + progress * .75), this.radius * 2 * (.25 + progress * .75)).setAlpha(Math.max(0, 1 - progress)).setVisible(this.life > 0);
        }
        if (!this.due(dt))
            return;
        const s = this.stats, p = this.ctx.player;
        this.timer = s.cooldown / this.haste;
        if (this.id === 'soul-bell') {
            this.echo = EVOLUTION_EFFECTS.echoDelay;
            this.echoX = p.x;
            this.echoY = p.y;
        }
        this.life = s.duration;
        this.radius = s.radius;
        this.wave.setPosition(p.x, p.y).setVisible(true).setAlpha(.9).setDisplaySize(s.radius * .5, s.radius * .5);
        for (const e of this.ctx.enemies.items)
            if (e.active && inCircle(e.x, e.y, p.x, p.y, s.radius))
                this.ctx.strike(e, s.damage, this.id);
    }
    destroy() { this.wave.destroy(); this.echoWave.destroy(); }
}
