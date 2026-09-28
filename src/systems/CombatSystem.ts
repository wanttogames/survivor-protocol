import { BALANCE } from "../config/balance";
import { ARC_BOLT } from "../data/weapons";
import type { Player } from "../entities/Player";
import type { Enemy } from "../entities/Enemy";
import type { Projectile } from "../entities/Projectile";
import type { Pool } from "../utils/Pool";
export class CombatSystem {
    private cooldown = 0;
    constructor(private player: Player, private enemies: Pool<Enemy>, private bolts: Pool<Projectile>, private onShot: () => void = () => { }) { }
    update(dt: number) {
        this.cooldown -= dt;
        for (const b of this.bolts.items)
            if (b.active) {
                b.ttl -= dt;
                if (b.ttl <= 0)
                    b.disableBody(true, true);
            }
        if (this.cooldown > 0)
            return;
        let nearest: Enemy | undefined;
        let distance = ARC_BOLT.range ** 2;
        const p = this.player;
        for (const e of this.enemies.items) {
            if (!e.active)
                continue;
            const d = (e.x - p.x) ** 2 + (e.y - p.y) ** 2;
            if (d < distance) {
                nearest = e;
                distance = d;
            }
        }
        if (!nearest) {
            this.cooldown = 0.08;
            return;
        }
        this.cooldown = 1 / p.stats.attackSpeed;
        const angle = Math.atan2(nearest.y - p.y, nearest.x - p.x);
        for (let i = 0; i < p.stats.projectileCount; i++) {
            const b = this.bolts.acquire();
            if (!b)
                break;
            const critical = Math.random() < p.stats.criticalChance;
            b.fire(p.x, p.y, angle + (i - (p.stats.projectileCount - 1) / 2) * ARC_BOLT.spread, p.stats.projectileSpeed, p.stats.damage * (critical ? BALANCE.criticalMultiplier : 1), p.stats.piercing, critical, ARC_BOLT.lifetime);
            this.onShot();
        }
    }
    hit(b: Projectile, e: Enemy): boolean {
        if (!b.active || !e.active || b.hits.get(e) === e.generation)
            return false;
        b.hits.set(e, e.generation);
        e.hp -= b.damage;
        e.setTintFill(0xffffff);
        e.flash = 0.07;
        if (b.pierce-- <= 0)
            b.disableBody(true, true);
        return true;
    }
}
