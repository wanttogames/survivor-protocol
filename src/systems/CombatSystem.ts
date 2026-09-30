import { BALANCE } from "../config/balance";
import { ARC_BOLT } from "../data/weapons";
import type { Player } from "../entities/Player";
import type { Enemy } from "../entities/Enemy";
import type { Projectile } from "../entities/Projectile";
import type { Pool } from "../utils/Pool";
import { WEAPON_RULES, type WeaponStats } from "../data/weaponConfig";
export class CombatSystem {
    private cooldown = 0;
    constructor(private player: Player, private enemies: Pool<Enemy>, private bolts: Pool<Projectile>, private onShot: () => void = () => { }, private target?: (range: number) => Enemy | undefined, private weaponStats?: () => WeaponStats) { }
    update(dt: number) {
        this.cooldown -= dt;
        if (this.cooldown > 0)
            return;
        const w = this.weaponStats?.();
        let nearest: Enemy | undefined;
        let distance = (w?.range ?? ARC_BOLT.range) ** 2;
        const p = this.player;
        if (this.target)
            nearest = this.target(w?.range ?? ARC_BOLT.range);
        else
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
            this.cooldown = WEAPON_RULES.targetRetry;
            return;
        }
        this.cooldown = (w?.cooldown ?? 1) / p.stats.attackSpeed;
        const count = p.stats.projectileCount + (w?.projectileCount ?? 0);
        const angle = Math.atan2(nearest.y - p.y, nearest.x - p.x);
        for (let i = 0; i < count; i++) {
            const b = this.bolts.acquire();
            if (!b)
                break;
            const critical = Math.random() < p.stats.criticalChance;
            b.fire(p.x, p.y, angle + (i - (count - 1) / 2) * ARC_BOLT.spread, p.stats.projectileSpeed * (w?.speed ?? 1), p.stats.damage * (w?.damage ?? 1) * (critical ? BALANCE.criticalMultiplier : 1), p.stats.piercing + (w?.pierce ?? 0), critical, w?.duration ?? ARC_BOLT.lifetime);
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
