import { Weapon, type WeaponContext } from './Weapon';
import { CombatSystem } from '../systems/CombatSystem';
import type { Projectile } from '../entities/Projectile';
import type { Pool } from '../utils/Pool';
export class TalismanWeapon extends Weapon {
    readonly combat: CombatSystem;
    constructor(ctx: WeaponContext, bolts: Pool<Projectile>, onShot: () => void) {
        super('arc-bolt', ctx);
        this.combat = new CombatSystem(ctx.player, ctx.enemies, bolts, onShot, range => ctx.nearest(range), () => this.stats);
    }
    update(dt: number) { this.combat.update(dt); }
    destroy() { }
}
