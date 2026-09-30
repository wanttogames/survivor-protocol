import type Phaser from 'phaser';
import { Weapon, type WeaponContext } from './Weapon';
import { WEAPON_RULES } from '../data/weaponConfig';
import { BALANCE } from '../config/balance';
import { inCircle } from './geometry';
interface Field {
    image: Phaser.GameObjects.Image;
    life: number;
    tick: number;
    radius: number;
    damage: number;
    duration: number;
}
export class HellfireWeapon extends Weapon {
    private fields: Field[] = [];
    constructor(ctx: WeaponContext) {
        super('hellfire', ctx);
        for (let i = 0; i < WEAPON_RULES.maxFields; i++)
            this.fields.push({ image: ctx.scene.add.image(0, 0, 'hellfire-seal').setDepth(1).setVisible(false), life: 0, tick: 0, radius: 0, damage: 0, duration: 0 });
    }
    update(dt: number) {
        for (const f of this.fields) {
            if (f.life <= 0)
                continue;
            f.life -= dt;
            f.tick -= dt;
            f.image.setAlpha(Math.min(.65, Math.max(0, f.life / .4))).setVisible(f.life > 0);
            if (f.life <= 0 || f.tick > 0)
                continue;
            f.tick = WEAPON_RULES.hellfireTick;
            for (const e of this.ctx.enemies.items)
                if (e.active && inCircle(e.x, e.y, f.image.x, f.image.y, f.radius))
                    this.ctx.strike(e, f.damage, this.id);
        }
        if (!this.due(dt))
            return;
        const s = this.stats, p = this.ctx.player, target = this.ctx.nearest(s.range);
        if (!target) {
            this.timer = WEAPON_RULES.targetRetry;
            return;
        }
        this.timer = s.cooldown / this.haste;
        for (let i = 0; i < s.projectileCount; i++) {
            const f = this.fields.find(f => f.life <= 0);
            if (!f)
                break;
            const a = Math.atan2(target.y - p.y, target.x - p.x) + Math.PI / 2;
            const x = Math.max(s.radius, Math.min(BALANCE.worldSize - s.radius, target.x + Math.cos(a) * i * WEAPON_RULES.hellfireSeparation));
            const y = Math.max(s.radius, Math.min(BALANCE.worldSize - s.radius, target.y + Math.sin(a) * i * WEAPON_RULES.hellfireSeparation));
            f.life = f.duration = s.duration;
            f.tick = 0;
            f.radius = s.radius;
            f.damage = s.damage;
            f.image.setPosition(x, y).setDisplaySize(s.radius * 2, s.radius * 2).setAlpha(.65).setVisible(true);
        }
    }
    destroy() {
        for (const f of this.fields)
            f.image.destroy();
    }
}
