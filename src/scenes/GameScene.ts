import { AUDIO_KEYS as K } from "../audio/audioKeys";
import { AudioManager } from "../audio/AudioManager";
import { addAudioControls } from "../audio/audioControls";
import { CombatVisuals } from "../theme/CombatVisuals";
import { addWorldProps } from "../theme/worldProps";
import { talisman } from "../theme/ornaments";
import { t, FONT_FAMILY } from "../i18n";
import Phaser from "phaser";
import { BALANCE } from "../config/balance";
import { Player } from "../entities/Player";
import { Enemy } from "../entities/Enemy";
import { Projectile } from "../entities/Projectile";
import { ExpOrb } from "../entities/ExpOrb";
import { Pool } from "../utils/Pool";
import { EnemySpawnSystem } from "../systems/EnemySpawnSystem";
import { WeaponSystem } from "../weapons/WeaponSystem";
import { WeaponBar } from "../ui/WeaponBar";
import { LevelSystem } from "../systems/LevelSystem";
import { UpgradeSystem } from "../systems/UpgradeSystem";
import { Hud } from "../ui/Hud";
import { UpgradePanel } from "../ui/UpgradePanel";
import { label } from "../ui/common";
export class GameScene extends Phaser.Scene {
    private audio!: AudioManager;
    player!: Player;
    enemies!: Pool<Enemy>;
    bolts!: Pool<Projectile>;
    orbs!: Pool<ExpOrb>;
    levels!: LevelSystem;
    upgrades!: UpgradeSystem;
    panel!: UpgradePanel;
    elapsed = 0;
    kills = 0;
    paused = false;
    ended = false;
    private spawn!: EnemySpawnSystem;
    weapons!: WeaponSystem;
    private weaponBar!: WeaponBar;
    private hud!: Hud;
    private keys!: Record<string, Phaser.Input.Keyboard.Key>;
    private pauseText!: Phaser.GameObjects.Text;
    private visuals!: CombatVisuals;
    private particles!: Phaser.GameObjects.Particles.ParticleEmitter;
    private damageTexts: {
        text: Phaser.GameObjects.Text;
        ttl: number;
    }[] = [];
    constructor() {
        super("Game");
    }
    create() {
        addAudioControls(this);
        this.audio = AudioManager.forGame(this.game);
        this.audio.stopSfx();
        this.audio.playBgm(K.NIGHT_STAGE);
        this.elapsed = 0;
        this.kills = 0;
        this.paused = false;
        this.ended = false;
        this.damageTexts = [];
        this.physics.world.setBounds(0, 0, BALANCE.worldSize, BALANCE.worldSize);
        this.physics.world.resume();
        this.add.tileSprite(BALANCE.worldSize / 2, BALANCE.worldSize / 2, BALANCE.worldSize, BALANCE.worldSize, "grid");
        const marks = this.add.graphics().lineStyle(3, 0xb8a16a, 0.12);
        for (let y = 400; y < 3600; y += 800)
            for (let x = 400; x < 3600; x += 800) {
                talisman(marks, x - 20, y - 40, 40, 80, 0x594738);
            }
        addWorldProps(this, BALANCE.worldSize);
        this.visuals = new CombatVisuals(this);
        this.player = new Player(this);
        this.cameras.main
            .setBounds(0, 0, BALANCE.worldSize, BALANCE.worldSize)
            .startFollow(this.player, true, 0.12, 0.12);
        const enemyGroup = this.physics.add.group();
        const boltGroup = this.physics.add.group();
        this.enemies = new Pool(() => {
            const e = new Enemy(this);
            enemyGroup.add(e);
            return e;
        }, BALANCE.limits.enemies);
        this.bolts = new Pool(() => {
            const b = new Projectile(this);
            boltGroup.add(b);
            return b;
        }, BALANCE.limits.projectiles);
        this.orbs = new Pool(() => new ExpOrb(this), BALANCE.limits.orbs);
        this.levels = new LevelSystem();
        this.weapons = new WeaponSystem(this, this.player, this.enemies, this.bolts, () => this.audio.playSfx(K.TALISMAN_SHOT), (enemy, value, critical) => this.enemyDamaged(enemy, value, critical));
        this.upgrades = new UpgradeSystem(Math.random, this.weapons.loadout);
        this.weaponBar = new WeaponBar(this, this.weapons.loadout);
        this.panel = new UpgradePanel(this, this.upgrades);
        this.hud = new Hud(this, this.weapons.loadout);
        this.spawn = new EnemySpawnSystem(this.enemies);
        this.particles = this.add
            .particles(0, 0, "ash", {
            emitting: false,
            lifespan: 440,
            speed: { min: 30, max: 100 },
            scale: { start: 1, end: 0 },
            alpha: { start: 0.8, end: 0 },
            maxParticles: BALANCE.limits.particles,
            tint: [0x263337, 0x82b5b5, 0x5c7a82],
        })
            .setDepth(6);
        this.physics.add.overlap(boltGroup, enemyGroup, (a, b) => {
            const bolt = a as Projectile;
            const enemy = b as Enemy;
            if (this.ended || this.paused || this.panel.open)
                return;
            this.weapons.hit(bolt, enemy);
        });
        this.physics.add.overlap(this.player, enemyGroup, (_p, e) => {
            const enemy = e as Enemy;
            if (!enemy.active || this.player.invulnerable > 0 || this.ended)
                return;
            this.player.stats.hp = Math.max(0, this.player.stats.hp - enemy.damage);
            this.player.invulnerable = BALANCE.contactInvulnerability;
            this.cameras.main.shake(90, 0.003);
            this.visuals.playerHit();
            this.audio.playSfx(K.PLAYER_HIT);
            if (this.player.stats.hp <= 0)
                this.finish(false);
        });
        this.keys = this.input.keyboard!.addKeys("W,A,S,D,UP,DOWN,LEFT,RIGHT,ESC,ONE,TWO,THREE") as Record<string, Phaser.Input.Keyboard.Key>;
        this.pauseText = label(this, 640, 365, () => t("pause.message"), 26, "#b8a16a")
            .setOrigin(0.5)
            .setAlign("center")
            .setBackgroundColor("#111719")
            .setPadding(50)
            .setDepth(210)
            .setVisible(false);
        const blur = () => {
            if (!this.ended && !this.panel.open && !this.paused)
                this.togglePause();
        };
        this.game.events.on(Phaser.Core.Events.BLUR, blur);
        this.events.once("shutdown", () => {
            this.game.events.off(Phaser.Core.Events.BLUR, blur);
            this.panel.close();
            this.weapons.destroy();
            this.audio.stopBgm();
            if (!this.ended)
                this.audio.stopSfx();
        });
        this.cameras.main.fadeIn(250);
        this.hud.update(this.player, this.levels, 0, 0);
    }
    private togglePause() {
        this.paused = !this.paused;
        this.pauseText.setVisible(this.paused);
        if (this.paused) {
            this.physics.pause();
            this.particles.pause();
        }
        else {
            this.physics.resume();
            this.particles.resume();
        }
    }
    update(_time: number, delta: number) {
        if (this.ended)
            return;
        this.visuals.update(Math.min(delta / 1000, 0.05));
        if (this.panel.open) {
            if (Phaser.Input.Keyboard.JustDown(this.keys.ONE))
                this.panel.select(0);
            else if (Phaser.Input.Keyboard.JustDown(this.keys.TWO))
                this.panel.select(1);
            else if (Phaser.Input.Keyboard.JustDown(this.keys.THREE))
                this.panel.select(2);
            return;
        }
        if (Phaser.Input.Keyboard.JustDown(this.keys.ESC))
            this.togglePause();
        if (this.paused)
            return;
        const dt = Math.min(delta / 1000, 0.05);
        this.elapsed += dt;
        const x = Number(this.keys.D.isDown || this.keys.RIGHT.isDown) -
            Number(this.keys.A.isDown || this.keys.LEFT.isDown);
        const y = Number(this.keys.S.isDown || this.keys.DOWN.isDown) -
            Number(this.keys.W.isDown || this.keys.UP.isDown);
        this.player.move(x, y, dt);
        this.spawn.update(dt, this.elapsed, this.player.x, this.player.y);
        for (const e of this.enemies.items)
            if (e.active) {
                if (Phaser.Math.Distance.Squared(e.x, e.y, this.player.x, this.player.y) >
                    1500 ** 2)
                    e.disableBody(true, true);
                else
                    e.chase(this.player.x, this.player.y, dt);
            }
        this.weapons.update(dt);
        this.updateOrbs(dt);
        for (const d of this.damageTexts)
            if (d.ttl > 0) {
                d.ttl -= dt;
                d.text.y -= dt * 38;
                d.text.setAlpha(Math.max(0, d.ttl / 0.55));
                if (d.ttl <= 0)
                    d.text.setVisible(false);
            }
        this.hud.update(this.player, this.levels, this.elapsed, this.kills);
        if (this.elapsed >= BALANCE.duration) {
            this.finish(true);
            return;
        }
        if (this.levels.pending > 0)
            this.showUpgrade();
    }
    private enemyDamaged(enemy: Enemy, value: number, critical: boolean) {
        this.audio.playSfx(K.ENEMY_HIT);
        this.damage(enemy.x, enemy.y, Math.round(value), critical);
        this.visuals.hit(enemy.x, enemy.y);
        if (enemy.hp <= 0)
            this.kill(enemy);
    }
    private kill(enemy: Enemy) {
        const x = enemy.x, y = enemy.y, xp = enemy.xp;
        enemy.disableBody(true, true);
        this.kills++;
        this.audio.playSfx(K.ENEMY_DEATH);
        this.particles.emitParticleAt(x, y, 5);
        const orb = this.orbs.acquire();
        if (orb)
            orb.spawn(x, y, xp);
        else {
            let nearest: ExpOrb | undefined;
            let dist = Infinity;
            for (const o of this.orbs.items) {
                const d = (o.x - x) ** 2 + (o.y - y) ** 2;
                if (d < dist) {
                    dist = d;
                    nearest = o;
                }
            }
            if (nearest)
                nearest.value += xp;
        }
    }
    private updateOrbs(dt: number) {
        const p = this.player;
        for (const orb of this.orbs.items) {
            if (!orb.active)
                continue;
            const dx = p.x - orb.x, dy = p.y - orb.y;
            const dist = Math.hypot(dx, dy);
            if (dist < p.stats.pickupRadius)
                orb.magnetized = true;
            if (dist < 20) {
                this.levels.add(orb.value);
                this.audio.playSfx(K.SOUL_PICKUP);
                orb.setActive(false).setVisible(false);
            }
            else if (orb.magnetized) {
                const step = Math.min(dist, BALANCE.orbSpeed * dt);
                orb.x += (dx / dist) * step;
                orb.y += (dy / dist) * step;
            }
        }
    }
    private damage(x: number, y: number, value: number, critical: boolean) {
        let d = this.damageTexts.find((d) => d.ttl <= 0);
        if (!d) {
            if (this.damageTexts.length >= BALANCE.limits.damageTexts)
                return;
            d = {
                text: this.add
                    .text(0, 0, "", {
                    fontFamily: FONT_FAMILY,
                    fontSize: 14,
                    fontStyle: "bold",
                })
                    .setDepth(7),
                ttl: 0,
            };
            this.damageTexts.push(d);
        }
        d.ttl = 0.55;
        d.text
            .setPosition(x, y - 15)
            .setText(critical ? `${value}!` : String(value))
            .setColor(critical ? "#d7bd7d" : "#cbc8b9")
            .setFontSize(critical ? 20 : 14)
            .setAlpha(1)
            .setVisible(true);
    }
    private showUpgrade() {
        if (!this.levels.consume())
            return;
        this.audio.playSfx(K.LEVEL_UP);
        this.physics.pause();
        this.particles.pause();
        this.visuals.awaken(this.player.x, this.player.y);
        this.cameras.main.flash(100, 184, 161, 106, false);
        this.panel.show(this.upgrades.roll(), (choice) => {
            this.audio.playSfx(K.UPGRADE_SELECT);
            this.upgrades.apply(choice, this.player.stats);
            this.weapons.syncLoadout();
            this.weaponBar.refresh();
            this.hud.update(this.player, this.levels, this.elapsed, this.kills);
            if (this.levels.pending > 0)
                this.showUpgrade();
            else {
                this.physics.resume();
                this.particles.resume();
            }
        });
    }
    finish(won: boolean) {
        if (this.ended)
            return;
        this.ended = true;
        this.audio.endRun(!won);
        this.physics.pause();
        this.scene.start("GameOver", {
            time: Math.min(this.elapsed, BALANCE.duration),
            level: this.levels.level,
            kills: this.kills,
            won,
        });
    }
}
