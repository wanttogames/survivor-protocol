import type Phaser from 'phaser';
import type { Enemy } from '../entities/Enemy';
import type { Player } from '../entities/Player';
import type { Pool } from '../utils/Pool';
import { BALANCE } from '../config/balance';
import { ELITES, ENCOUNTER_CONFIG as C, type EliteId } from './encounterConfig';
import { ENEMIES } from '../data/enemies';
import { encounterSpawnPoint } from './spawnPoint';
export class EliteManager {
    private aura: Phaser.GameObjects.Graphics;
    private healing: {
        image: Phaser.GameObjects.Image;
        life: number;
        amount: number;
    }[];
    constructor(private scene: Phaser.Scene, private enemies: Pool<Enemy>, private player: Player, private heal: (amount: number) => void) {
        this.aura = scene.add.graphics().setDepth(2);
        this.healing = Array.from({ length: C.healPickupCapacity }, () => ({ image: scene.add.image(0, 0, 'healing-charm').setDepth(2).setVisible(false), life: 0, amount: 0 }));
    }
    spawn(id: EliteId, strength: number, elapsed: number) {
        const e = this.enemies.acquire();
        if (!e)
            return false;
        const d = ELITES[id], p = encounterSpawnPoint(this.player.x, this.player.y, this.scene.cameras.main.worldView);
        e.spawn(p.x, p.y, d.baseEnemyId, (1 + elapsed / 60 * BALANCE.spawn.hpPerMinute) * d.hpMultiplier * strength, (1 + elapsed / 60 * BALANCE.spawn.speedPerMinute) * d.speedMultiplier);
        e.rank = 'elite';
        e.eliteId = id;
        e.damage *= d.damageMultiplier * strength;
        e.xp = ENEMIES[d.baseEnemyId].xp * d.reward.soulMultiplier * strength;
        e.setScale(d.sizeMultiplier);
        e.collisionRadius = ENEMIES[d.baseEnemyId].radius * d.sizeMultiplier;
        return true;
    }
    defeated(e: Enemy, random = Math.random) {
        const d = e.eliteId && ELITES[e.eliteId];
        if (!d || random() >= d.reward.healChance)
            return;
        const f = this.healing.find(f => f.life <= 0);
        if (!f)
            return;
        f.life = C.healPickupLifetime;
        f.amount = d.reward.healFraction;
        f.image.setPosition(e.x, e.y).setVisible(true);
    }
    update(dt: number) {
        this.aura.clear();
        for (const e of this.enemies.items)
            if (e.active && e.rank === 'elite' && e.eliteId) {
                const d = ELITES[e.eliteId], r = e.collisionRadius + 12;
                this.aura.lineStyle(2, d.color, .8).strokeCircle(e.x, e.y, r).fillStyle(d.color).fillTriangle(e.x, e.y - r - 17, e.x - 7, e.y - r - 6, e.x + 7, e.y - r - 6);
            }
        for (const f of this.healing)
            if (f.life > 0) {
                f.life -= dt;
                if (Math.hypot(this.player.x - f.image.x, this.player.y - f.image.y) < C.healPickupRadius) {
                    this.heal(this.player.stats.maxHp * f.amount);
                    f.life = 0;
                }
                f.image.setVisible(f.life > 0);
            }
    }
    destroy() { this.aura.destroy(); for (const f of this.healing)
        f.image.destroy(); }
}
