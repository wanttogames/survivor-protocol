import { safeMapSpawn } from '../maps/spawnSafety';
import type Phaser from 'phaser';
import type { Enemy } from '../entities/Enemy';
import type { Pool } from '../utils/Pool';
import type { Player } from '../entities/Player';
import { BOSSES, ENCOUNTER_CONFIG as C, type BossId } from '../encounters/encounterConfig';
import { BALANCE } from '../config/balance';
import { inSector } from '../weapons/geometry';
import { encounterSpawnPoint } from '../encounters/spawnPoint';
import { Boss } from './Boss';
import { createBossTextures } from './bossTextures';
type Cast = {
    type: 'slash' | 'wave' | 'spirits';
    remaining: number;
    x: number;
    y: number;
    angle: number;
};
interface State {
    boss: Boss;
    slash: number;
    wave: number;
    spirits: number;
    summon: number;
    cast?: Cast;
    impact?: Cast;
    impactLife: number;
}
interface Bullet {
    image: Phaser.GameObjects.Image;
    life: number;
    vx: number;
    vy: number;
    damage: number;
    radius: number;
    owner: BossId;
}
interface Gate {
    image: Phaser.GameObjects.Image;
    life: number;
    tick: number;
    spawned: number;
}
export class BossManager {
    readonly spawnedIds = new Set<BossId>();
    readonly defeatedIds: BossId[] = [];
    private states: State[];
    private telegraph: Phaser.GameObjects.Graphics;
    private bullets: Bullet[];
    private gates: Gate[];
    private summonAlive = new Map<Enemy, number>();
    constructor(private scene: Phaser.Scene, private player: Player, private enemies: Pool<Enemy>, group: Phaser.Physics.Arcade.Group, private hurt: (damage: number) => void, private announce: (key: 'boss.appear' | 'boss.phase', nameKey: import('../i18n').TranslationKey) => void) {
        createBossTextures(scene);
        this.telegraph = scene.add.graphics().setDepth(1);
        this.states = Object.values(BOSSES).map(d => { const boss = new Boss(scene, d); group.add(boss); enemies.items.push(boss); return { boss, slash: C.initialSlash, wave: C.initialWave, spirits: C.initialSpirits, summon: C.initialSummon, impactLife: 0 }; });
        this.bullets = Array.from({ length: C.bulletCapacity }, () => ({ image: scene.add.image(0, 0, 'spirit-shot').setDepth(4).setVisible(false), life: 0, vx: 0, vy: 0, damage: 0, radius: 0, owner: 'ghost-king' as BossId }));
        this.gates = Array.from({ length: C.gateCapacity }, () => ({ image: scene.add.image(0, 0, 'ghost-gate').setDepth(1).setDisplaySize(72, 72).setVisible(false), life: 0, tick: 0, spawned: 0 }));
    }
    get active() { return this.states.some(s => s.boss.active); }
    get finalDefeated() { return this.defeatedIds.includes('ghost-king'); }
    get activeBosses() { return this.states.filter(s => s.boss.active).map(s => s.boss); }
    spawnBoss(id: BossId) {
        if (this.spawnedIds.has(id))
            return true;
        const s = this.states.find(s => s.boss.definition.id === id)!;
        const p = encounterSpawnPoint(this.player.x, this.player.y, this.scene.cameras.main.worldView);
        s.boss.awaken(p.x, p.y);
        s.slash = C.initialSlash;
        s.wave = C.initialWave;
        s.spirits = C.initialSpirits;
        s.summon = C.initialSummon;
        s.cast = undefined;
        s.impact = undefined;
        s.impactLife = 0;
        this.spawnedIds.add(id);
        this.announce('boss.appear', s.boss.definition.nameKey);
        return true;
    }
    defeated(boss: Boss) {
        if (this.defeatedIds.includes(boss.definition.id))
            return;
        this.defeatedIds.push(boss.definition.id);
        const s = this.states.find(s => s.boss === boss)!;
        s.cast = undefined;
        s.impact = undefined;
        s.impactLife = 0;
        this.telegraph.clear();
        for (const b of this.bullets)
            if (b.owner === boss.definition.id) {
                b.life = 0;
                b.image.setVisible(false);
            }
        if (boss.definition.id === 'ghost-king')
            for (const g of this.gates) {
                g.life = 0;
                g.image.setVisible(false);
            }
    }
    private summon(x: number, y: number, kind: 'grunt' | 'runner') {
        for (const [e, generation] of this.summonAlive)
            if (!e.active || e.generation !== generation)
                this.summonAlive.delete(e);
        if (this.summonAlive.size >= C.summonAliveLimit)
            return;
        const e = this.enemies.acquire();
        if (!e)
            return;
        const safe = safeMapSpawn(Math.max(C.worldMargin, Math.min(BALANCE.worldSize - C.worldMargin, x)), Math.max(C.worldMargin, Math.min(BALANCE.worldSize - C.worldMargin, y)));
        e.spawn(safe.x, safe.y, kind, C.minionHpScale, C.minionSpeedScale);
        this.summonAlive.set(e, e.generation);
    }
    private startCast(s: State, type: Cast['type']) {
        const b = s.boss, d = b.definition, p = this.player, a = Math.atan2(p.y - b.y, p.x - b.x);
        const windup = type === 'slash' ? d.slash!.windup : type === 'wave' ? d.wave!.windup : d.spirits!.windup;
        s.cast = { type, remaining: windup, x: type === 'wave' ? p.x : b.x, y: type === 'wave' ? p.y : b.y, angle: a };
        b.setVelocity(0, 0);
    }
    private release(s: State, c: Cast) {
        s.impact = c;
        s.impactLife = C.attackFlashDuration;
        const d = s.boss.definition, p = this.player;
        if (c.type === 'slash') {
            if (inSector(p.x, p.y, c.x, c.y, c.angle, d.slash!.range, d.slash!.halfAngle))
                this.hurt(d.slash!.damage);
        }
        else if (c.type === 'wave') {
            if (Math.hypot(p.x - c.x, p.y - c.y) <= d.wave!.radius)
                this.hurt(d.wave!.damage);
        }
        else {
            const a = d.spirits!;
            for (let i = 0; i < a.count; i++) {
                const f = this.bullets.find(f => f.life <= 0);
                if (!f)
                    break;
                const angle = c.angle + i * Math.PI * 2 / a.count;
                f.life = a.ttl;
                f.vx = Math.cos(angle) * a.speed;
                f.vy = Math.sin(angle) * a.speed;
                f.damage = a.damage;
                f.radius = a.radius;
                f.owner = d.id;
                f.image.setPosition(c.x, c.y).setVisible(true);
            }
        }
    }
    update(dt: number) {
        this.telegraph.clear();
        for (const s of this.states) {
            const b = s.boss;
            if (!b.active)
                continue;
            const d = b.definition;
            s.impactLife = Math.max(0, s.impactLife - dt);
            if (b.phase === 1 && d.phaseAt > 0 && b.hp / b.maxHp <= d.phaseAt) {
                b.phase = 2;
                this.announce('boss.phase', d.nameKey);
            }
            const haste = b.phase === 2 ? d.phaseHaste : 1;
            s.slash -= dt * haste;
            s.wave -= dt * haste;
            s.spirits -= dt * haste;
            s.summon -= dt * haste;
            if (s.cast) {
                b.setVelocity(0, 0);
                if (b.flash > 0) {
                    b.flash -= dt;
                    if (b.flash <= 0)
                        b.clearTint();
                }
                s.cast.remaining -= dt;
                if (s.cast.remaining <= 0) {
                    this.release(s, s.cast);
                    s.cast = undefined;
                    if (this.player.stats.hp <= 0)
                        return;
                }
            }
            else {
                b.chase(this.player.x, this.player.y, dt);
                if (d.slash && s.slash <= 0 && Math.hypot(this.player.x - b.x, this.player.y - b.y) < d.slash.range + C.slashActivationMargin) {
                    s.slash = d.slash.cooldown;
                    this.startCast(s, 'slash');
                }
                else if (d.wave && s.wave <= 0) {
                    s.wave = d.wave.cooldown;
                    this.startCast(s, 'wave');
                }
                else if (d.spirits && s.spirits <= 0) {
                    s.spirits = d.spirits.cooldown;
                    this.startCast(s, 'spirits');
                }
            }
            if (s.summon <= 0) {
                s.summon = d.summon.cooldown;
                if (d.id === 'vengeful-general') {
                    for (let i = 0; i < d.summon.count; i++) {
                        const a = i * Math.PI * 2 / d.summon.count;
                        this.summon(b.x + Math.cos(a) * d.summon.radius, b.y + Math.sin(a) * d.summon.radius, 'grunt');
                    }
                }
                else
                    for (let i = 0; i < d.summon.count; i++) {
                        const g = this.gates.find(g => g.life <= 0);
                        if (!g)
                            break;
                        const a = i * Math.PI * 2 / d.summon.count + Math.PI / 4;
                        g.life = C.gateLifetime;
                        g.tick = C.gateInitialDelay;
                        g.spawned = 0;
                        const safe = safeMapSpawn(this.player.x + Math.cos(a) * d.summon.radius, this.player.y + Math.sin(a) * d.summon.radius);
                        g.image.setPosition(safe.x, safe.y).setVisible(true);
                    }
            }
            this.telegraph.lineStyle(b.phase === 2 ? 4 : 2, b.phase === 2 ? 0xa16387 : 0xa7794f, .55).strokeCircle(b.x, b.y, b.collisionRadius + 15);
            const c = s.cast ?? (s.impactLife > 0 ? s.impact : undefined);
            if (c) {
                this.telegraph.fillStyle(s.cast ? 0xa33d32 : 0xc19053, s.cast ? .23 : .3).lineStyle(s.cast ? 2 : 3, s.cast ? 0xc67451 : 0xe0cda2, .85);
                if (c.type === 'wave')
                    this.telegraph.fillCircle(c.x, c.y, d.wave!.radius).strokeCircle(c.x, c.y, d.wave!.radius);
                else if (c.type === 'slash') {
                    this.telegraph.beginPath();
                    this.telegraph.moveTo(c.x, c.y);
                    this.telegraph.arc(c.x, c.y, d.slash!.range, c.angle - d.slash!.halfAngle, c.angle + d.slash!.halfAngle, false);
                    this.telegraph.closePath();
                    this.telegraph.fillPath();
                    this.telegraph.strokePath();
                }
                else
                    for (let i = 0; i < d.spirits!.count; i++) {
                        const a = c.angle + i * Math.PI * 2 / d.spirits!.count;
                        this.telegraph.lineBetween(c.x, c.y, c.x + Math.cos(a) * 100, c.y + Math.sin(a) * 100);
                    }
            }
        }
        for (const f of this.bullets)
            if (f.life > 0) {
                f.life -= dt;
                f.image.x += f.vx * dt;
                f.image.y += f.vy * dt;
                if (Math.hypot(f.image.x - this.player.x, f.image.y - this.player.y) <= f.radius + 12) {
                    f.life = 0;
                    this.hurt(f.damage);
                    if (this.player.stats.hp <= 0)
                        return;
                }
                if (f.image.x < 0 || f.image.y < 0 || f.image.x > BALANCE.worldSize || f.image.y > BALANCE.worldSize)
                    f.life = 0;
                f.image.setVisible(f.life > 0);
            }
        for (const g of this.gates)
            if (g.life > 0) {
                g.life -= dt;
                g.tick -= dt;
                g.image.setAlpha(Math.min(.8, Math.max(0, g.life))).setVisible(g.life > 0);
                if (g.life > 0 && g.tick <= 0 && g.spawned < C.gateSpawnLimit) {
                    g.tick = C.gateInterval;
                    this.summon(g.image.x, g.image.y, g.spawned % 2 ? 'runner' : 'grunt');
                    g.spawned++;
                }
            }
    }
    destroy() { this.telegraph.destroy(); for (const f of this.bullets)
        f.image.destroy(); for (const g of this.gates)
        g.image.destroy(); this.summonAlive.clear(); }
}
