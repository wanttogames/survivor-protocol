import { Weapon, type WeaponContext } from './Weapon';
import { BALANCE } from '../config/balance';
import { WEAPON_RULES } from '../data/weaponConfig';
import type { Projectile } from '../entities/Projectile';
import type { Pool } from '../utils/Pool';
export class GhostArrowWeapon extends Weapon {
    constructor(ctx: WeaponContext, private bolts: Pool<Projectile>) { super('ghost-arrow', ctx); }
    update(dt: number) {
        if (!this.due(dt))
            return;
        const s = this.stats, p = this.ctx.player, target = this.ctx.nearest(s.range);
        if (!target) {
            this.timer = WEAPON_RULES.targetRetry;
            return;
        }
        this.timer = s.cooldown / this.haste;
        const angle = Math.atan2(target.y - p.y, target.x - p.x), count = s.projectileCount + p.stats.projectileCount - 1;
        for (let i = 0; i < count; i++) {
            const bolt = this.bolts.acquire();
            if (!bolt)
                break;
            const crit = Math.random() < p.stats.criticalChance;
            bolt.fire(p.x, p.y, angle + (i - (count - 1) / 2) * WEAPON_RULES.arrowSpread, s.speed * p.stats.projectileSpeed / BALANCE.player.projectileSpeed, s.damage * p.stats.damage / BALANCE.player.damage * (crit ? BALANCE.criticalMultiplier : 1), s.pierce + p.stats.piercing, crit, s.duration);
            bolt.source = this.id;
            bolt.setTexture('ghost-arrow').setCircle(s.radius, 24 - s.radius, 24 - s.radius);
        }
    }
    destroy() { }
}
