import type Phaser from 'phaser';
import type { Player } from '../entities/Player';
import type { Enemy } from '../entities/Enemy';
import type { Pool } from '../utils/Pool';
import type { WeaponLoadout } from './WeaponLoadout';
import type { WeaponId } from '../data/weaponConfig';
import { BALANCE } from '../config/balance';
export interface WeaponContext {
    scene: Phaser.Scene;
    player: Player;
    enemies: Pool<Enemy>;
    loadout: WeaponLoadout;
    nearest(range: number): Enemy | undefined;
    strike(enemy: Enemy, damage: number, source: WeaponId): void;
    burst(x:number,y:number,damage:number,source:WeaponId):void;
}
export abstract class Weapon {
    protected timer = 0;
    constructor(readonly id: WeaponId, protected ctx: WeaponContext) { }
    get stats() { return this.ctx.loadout.stats(this.id); }
    protected get haste() { return this.ctx.player.stats.attackSpeed / BALANCE.player.attackSpeed; }
    protected due(dt: number) { this.timer -= dt; return this.timer <= 0; }
    abstract update(dt: number): void;
    abstract destroy(): void;
}
