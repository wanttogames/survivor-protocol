import type Phaser from 'phaser';
import { Weapon, type WeaponContext } from './Weapon';
import { WEAPON_RULES } from '../data/weaponConfig';
import { inSector } from './geometry';
export class LightningSwordWeapon extends Weapon {
    private slashes: Phaser.GameObjects.Image[];
    private life = 0;
    constructor(ctx: WeaponContext) { super('lightning-sword', ctx); this.slashes = [0, 1].map(() => ctx.scene.add.image(0, 0, 'sword-slash').setDepth(4).setOrigin(.5).setVisible(false)); }
    update(dt: number) {
        if (this.life > 0) {
            this.life -= dt;
            for (const slash of this.slashes)
                slash.setAlpha(Math.max(0, this.life / this.stats.duration));
        }
        if (!this.due(dt))
            return;
        const s = this.stats, p = this.ctx.player, target = this.ctx.nearest(s.range);
        if (!target) {
            this.timer = WEAPON_RULES.targetRetry;
            return;
        }
        this.timer = s.cooldown / this.haste;
        this.life = s.duration;
        const angle = Math.atan2(target.y - p.y, target.x - p.x);
        for (let i = 0; i < this.slashes.length; i++) {
            const a = angle + i * WEAPON_RULES.swordEchoAngle;
            this.slashes[i].setVisible(i < s.projectileCount).setPosition(p.x, p.y).setRotation(a).setDisplaySize(s.range * 2, s.range * 2).setAlpha(1);
            if (i >= s.projectileCount)
                continue;
            for (const e of this.ctx.enemies.items)
                if (e.active && inSector(e.x, e.y, p.x, p.y, a, s.range, WEAPON_RULES.swordHalfAngle))
                    this.ctx.strike(e, s.damage, this.id);
        }
    }
    destroy() {
        for (const s of this.slashes)
            s.destroy();
    }
}
