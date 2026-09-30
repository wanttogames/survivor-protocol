import type { WeaponId } from "../data/weaponConfig";
import { Weapon, type WeaponContext } from './Weapon';
import { CombatSystem } from '../systems/CombatSystem';
import type { Projectile } from '../entities/Projectile';
import type { Pool } from '../utils/Pool';
export class TalismanWeapon extends Weapon {
    readonly combat: CombatSystem;
    constructor(ctx: WeaponContext, bolts: Pool<Projectile>, onShot: () => void, id: WeaponId = 'arc-bolt') {
        super(id, ctx);
        this.combat = new CombatSystem(ctx.player, ctx.enemies, bolts, onShot, range => ctx.nearest(range), () => this.stats, b => { b.source = this.id; b.setScale(1); if (this.id === 'thunder-talisman')
            b.setTexture('thunder-talisman').setTint(0xffffff).setScale(1.25); });
    }
    update(dt: number) { this.combat.update(dt); }
    destroy() { }
}
