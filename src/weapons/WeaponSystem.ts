import type Phaser from 'phaser';
import { BALANCE } from '../config/balance';
import { type WeaponId } from '../data/weaponConfig';
import type { Player } from '../entities/Player';
import type { Enemy } from '../entities/Enemy';
import type { Projectile } from '../entities/Projectile';
import type { Pool } from '../utils/Pool';
import { WeaponLoadout } from './WeaponLoadout';
import { Weapon, type WeaponContext } from './Weapon';
import { TalismanWeapon } from './TalismanWeapon';
import { RosaryWeapon } from './RosaryWeapon';
import { BellWeapon } from './BellWeapon';
import { LightningSwordWeapon } from './LightningSwordWeapon';
import { GhostArrowWeapon } from './GhostArrowWeapon';
import { HellfireWeapon } from './HellfireWeapon';
/** One owner for weapons, targeting and damage feedback. Scene only forwards lifecycle/events. */
export class WeaponSystem {
    readonly loadout = new WeaponLoadout();
    private weapons = new Map<WeaponId, Weapon>();
    private context: WeaponContext;
    private cached?: Enemy;
    private searched = false;
    private seenRevision = -1;
    readonly hits: Partial<Record<WeaponId, number>> = {};
    private talisman: TalismanWeapon;
    constructor(scene: Phaser.Scene, private player: Player, private enemies: Pool<Enemy>, bolts: Pool<Projectile>, onShot: () => void, private onDamage: (e: Enemy, value: number, crit: boolean) => void) {
        this.context = { scene, player, enemies, loadout: this.loadout, nearest: range => this.nearest(range), strike: (e, d, id) => this.strike(e, d, id) };
        this.talisman = new TalismanWeapon(this.context, bolts, onShot);
        this.weapons.set('arc-bolt', this.talisman);
        // Factories are invoked only when a new card is chosen, never every frame.
        this.factories = { rosary: () => new RosaryWeapon(this.context), 'exorcism-bell': () => new BellWeapon(this.context), 'lightning-sword': () => new LightningSwordWeapon(this.context), 'ghost-arrow': () => new GhostArrowWeapon(this.context, bolts), hellfire: () => new HellfireWeapon(this.context) };
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
        this.searched = false;
        this.syncLoadout();
        for (const w of this.weapons.values())
            w.update(dt);
    }
    private strike(e: Enemy, base: number, id: WeaponId) {
        if (!e.active)
            return;
        const crit = Math.random() < this.player.stats.criticalChance;
        const value = base * this.player.stats.damage / BALANCE.player.damage * (crit ? BALANCE.criticalMultiplier : 1);
        e.hp -= value;
        e.setTintFill(0xffffff);
        e.flash = .07;
        this.hits[id] = (this.hits[id] ?? 0) + 1;
        this.onDamage(e, value, crit);
    }
    hit(b: Projectile, e: Enemy) {
        if (!this.talisman.combat.hit(b, e))
            return false;
        this.hits[b.source] = (this.hits[b.source] ?? 0) + 1;
        this.onDamage(e, b.damage, b.critical);
        return true;
    }
    destroy() {
        for (const w of this.weapons.values())
            w.destroy();
        this.weapons.clear();
    }
}
