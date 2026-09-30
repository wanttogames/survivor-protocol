import type Phaser from 'phaser';
import type { Enemy } from '../entities/Enemy';
import { ENEMIES } from '../data/enemies';
import { WEAPON_RULES } from '../data/weaponConfig';
import type { WeaponId } from '../data/weaponConfig';
import { Weapon, type WeaponContext } from './Weapon';
import { inCircle } from './geometry';
export class RosaryWeapon extends Weapon {
    private angle = 0;
    private clock = 0;
    private scan = 0;
    private beads: Phaser.GameObjects.Image[] = [];
    // One cooldown per pooled enemy generation, shared by all beads (no per-frame damage).
    private hits = new Map<Enemy, {
        generation: number;
        next: number;
    }>();
    constructor(ctx: WeaponContext, id: WeaponId = 'rosary') { super(id, ctx); }
    update(dt: number) {
        const s = this.stats, p = this.ctx.player;
        while (this.beads.length < s.projectileCount)
            this.beads.push(this.ctx.scene.add.image(p.x, p.y, 'rosary-bead').setDepth(4).setScale(this.id === 'vajra-rosary' ? 1.35 : 1).setTint(this.id === 'vajra-rosary' ? 0xffe5a0 : 0xffffff));
        this.angle += dt * s.speed;
        this.clock += dt;
        this.scan -= dt;
        for (let i = 0; i < this.beads.length; i++) {
            const a = this.angle + i * Math.PI * 2 / this.beads.length;
            this.beads[i].setPosition(p.x + Math.cos(a) * s.range, p.y + Math.sin(a) * s.range);
        }
        if (this.scan > 0)
            return;
        this.scan = WEAPON_RULES.rosaryScan;
        for (const e of this.ctx.enemies.items) {
            if (!e.active || !inCircle(e.x, e.y, p.x, p.y, s.range + s.radius + ENEMIES[e.kind].radius))
                continue;
            const hit = this.hits.get(e);
            if (hit?.generation === e.generation && hit.next > this.clock)
                continue;
            for (const b of this.beads)
                if (inCircle(e.x, e.y, b.x, b.y, s.radius + ENEMIES[e.kind].radius)) {
                    if (hit) {
                        hit.generation = e.generation;
                        hit.next = this.clock + s.cooldown;
                    }
                    else
                        this.hits.set(e, { generation: e.generation, next: this.clock + s.cooldown });
                    this.ctx.strike(e, s.damage, this.id);
                    break;
                }
        }
    }
    destroy() {
        for (const b of this.beads)
            b.destroy();
        this.hits.clear();
    }
}
