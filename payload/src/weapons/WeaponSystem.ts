import type Phaser from 'phaser';
import { BALANCE } from '../config/balance';
import { EVOLUTION_EFFECTS as C, type WeaponId } from '../data/weaponConfig';
import type { Player } from '../entities/Player';
import type { Enemy } from '../entities/Enemy';
import type { Projectile } from '../entities/Projectile';
import type { Pool } from '../utils/Pool';
import { WeaponLoadout } from './WeaponLoadout';
import { Weapon, type WeaponContext } from './Weapon';
import { CombatSystem } from '../systems/CombatSystem';
import { TalismanWeapon } from './TalismanWeapon';
import { RosaryWeapon } from './RosaryWeapon';
import { BellWeapon } from './BellWeapon';
import { LightningSwordWeapon } from './LightningSwordWeapon';
import { GhostArrowWeapon } from './GhostArrowWeapon';
import { EvolutionEffects } from './evolution/EvolutionEffects';
import { HellfireWeapon } from './HellfireWeapon';
/** One owner for weapons, targeting and damage feedback. Scene only forwards lifecycle/events. */
export class WeaponSystem {
    private effects: EvolutionEffects;
    readonly loadout: WeaponLoadout;
    private bolts: Pool<Projectile>;
    private collision: CombatSystem;
    private weapons = new Map<WeaponId, Weapon>();
    private context: WeaponContext;
    private cached?: Enemy;
    private searched = false;
    private seenRevision = -1;
    readonly hits: Partial<Record<WeaponId, number>> = {};
    constructor(scene: Phaser.Scene, private player: Player, private enemies: Pool<Enemy>, bolts: Pool<Projectile>, onShot: () => void, private onDamage: (e: Enemy, value: number, crit: boolean, source: WeaponId) => void, startingWeapon: WeaponId = 'arc-bolt') {
        this.effects = new EvolutionEffects(scene);
        this.loadout = new WeaponLoadout(undefined, startingWeapon);
        this.bolts = bolts;
        this.collision = new CombatSystem(player, enemies, bolts);
        this.context = { scene, player, enemies, loadout: this.loadout, nearest: range => this.nearest(range), strike: (e, d, id) => this.strike(e, d, id), burst: (x, y, d, id) => this.burst(x, y, d, id) };
        // Factories are invoked only when a new card is chosen, never every frame.
        this.factories = { 'arc-bolt': () => new TalismanWeapon(this.context, bolts, onShot), rosary: () => new RosaryWeapon(this.context), 'exorcism-bell': () => new BellWeapon(this.context), 'lightning-sword': () => new LightningSwordWeapon(this.context), 'ghost-arrow': () => new GhostArrowWeapon(this.context, bolts), hellfire: () => new HellfireWeapon(this.context) };
        Object.assign(this.factories, {
            'thunder-talisman': () => new TalismanWeapon(this.context, bolts, onShot, 'thunder-talisman'),
            'vajra-rosary': () => new RosaryWeapon(this.context, 'vajra-rosary'),
            'soul-bell': () => new BellWeapon(this.context, 'soul-bell'),
            'thunder-god-sword': () => new LightningSwordWeapon(this.context, 'thunder-god-sword'),
            'demon-slayer-bow': () => new GhostArrowWeapon(this.context, bolts, 'demon-slayer-bow'),
            'infernal-hellfire': () => new HellfireWeapon(this.context, 'infernal-hellfire')
        });
        this.syncLoadout();
    }
    private factories: Partial<Record<WeaponId, () => Weapon>>;
    private nearest(range: number) {
        // Lazy shared query: at most one full scan unless the cached target dies within this update.
        if (!this.searched || (this.cached && !this.cached.active)) {
            this.searched = true;
            this.cached = undefined;
            let distance = Infinity;
            for (const e of this.enemies.items)
                if (e.active) {
                    const d = (e.x - this.player.x) ** 2 + (e.y - this.player.y) ** 2;
                    if (d < distance) {
                        distance = d;
                        this.cached = e;
                    }
                }
        }
        return this.cached && (this.cached.x - this.player.x) ** 2 + (this.cached.y - this.player.y) ** 2 <= range ** 2 ? this.cached : undefined;
    }
    syncLoadout() {
        if (this.seenRevision !== this.loadout.revision) {
            for (const [id, w] of this.weapons)
                if (!this.loadout.level(id)) {
                    w.destroy();
                    this.weapons.delete(id);
                    for (const b of this.bolts.items)
                        if (b.active && b.source === id)
                            b.disableBody(true, true);
                    this.effects.clear();
                }
            for (const [id] of this.loadout.entries())
                if (!this.weapons.has(id)) {
                    const factory = this.factories[id];
                    if (factory)
                        this.weapons.set(id, factory());
                }
            this.seenRevision = this.loadout.revision;
        }
    }
    update(dt: number) {
        this.effects.update(dt);
        for (const b of this.bolts.items)
            if (b.active) {
                b.ttl -= dt;
                if (b.ttl <= 0)
                    b.disableBody(true, true);
            }
        this.searched = false;
        this.syncLoadout();
        for (const w of this.weapons.values())
            w.update(dt);
    }
    private strike(e: Enemy, base: number, id: WeaponId) {
        if (!e.active)
            return;
        const crit = Math.random() < this.player.stats.criticalChance;
        const value = base * this.player.stats.damage / BALANCE.player.damage * (crit ? BALANCE.criticalMultiplier : 1) * (e.rank === "boss" ? this.player.bossDamageMultiplier : 1);
        e.hp -= value;
        e.setTintFill(0xffffff);
        e.flash = .07;
        this.hits[id] = (this.hits[id] ?? 0) + 1;
        this.onDamage(e, value, crit, id);
    }
    hit(b: Projectile, e: Enemy) {
        if (!this.collision.hit(b, e))
            return false;
        this.hits[b.source] = (this.hits[b.source] ?? 0) + 1;
        const x = e.x, y = e.y;
        this.onDamage(e, this.collision.lastDamage, b.critical, b.source);
        if (b.source === 'thunder-talisman') {
            // Bounded nearest hops. Secondary strikes do not recursively trigger chains.
            let cx = x, cy = y;
            const visited = new Set<Enemy>([e]);
            for (let i = 0; i < C.chainTargets; i++) {
                let target: Enemy | undefined;
                let distance = C.chainRange ** 2;
                for (const next of this.enemies.items)
                    if (next.active && !visited.has(next)) {
                        const d = (next.x - cx) ** 2 + (next.y - cy) ** 2;
                        if (d < distance) {
                            distance = d;
                            target = next;
                        }
                    }
                if (!target)
                    break;
                visited.add(target);
                this.effects.line(cx, cy, target.x, target.y);
                cx = target.x;
                cy = target.y;
                this.strike(target, this.loadout.stats(b.source).damage * BALANCE.player.damage * C.chainDamage, b.source);
            }
        }
        return true;
    }
    private burst(x: number, y: number, damage: number, id: WeaponId) {
        this.effects.line(x - C.explosionRadius / 2, y, x + C.explosionRadius / 2, y);
        for (const e of this.enemies.items)
            if (e.active && (e.x - x) ** 2 + (e.y - y) ** 2 <= C.explosionRadius ** 2)
                this.strike(e, damage, id);
    }
    destroy() {
        this.effects.destroy();
        for (const w of this.weapons.values())
            w.destroy();
        this.weapons.clear();
    }
}
