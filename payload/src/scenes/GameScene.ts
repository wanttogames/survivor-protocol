import { TalismanSession, applyPlayerTalismanDelta } from '../talismans/TalismanSession';
import { talismanEnemyCapacity, TALISMAN_CONFIG } from '../talismans/talismanConfig';
import { TalismanPanel } from '../ui/TalismanPanel';
import { TalismanHud } from '../ui/TalismanHud';
import { MapManager } from '../maps/MapManager';
import { BossManager } from '../bosses/BossManager';
import { Boss } from '../bosses/Boss';
import { BossRewardManager } from '../bosses/BossRewardManager';
import { EliteManager } from '../encounters/EliteManager';
import { EncounterManager } from '../encounters/EncounterManager';
import { BOSSES, ENCOUNTER_CONFIG as C, type BossId } from '../encounters/encounterConfig';
import { BossHud } from '../ui/BossHud';
import { EncounterAnnouncement } from '../ui/EncounterAnnouncement';
import { WEAPONS } from '../data/weaponConfig';
import { getCharacterManager } from "../characters/CharacterManager";
import type { WeaponId } from "../data/weaponConfig";
import { AUDIO_KEYS as K } from "../audio/audioKeys";
import { AudioManager } from "../audio/AudioManager";
import { addAudioControls } from "../audio/audioControls";
import { CombatVisuals } from "../theme/CombatVisuals";
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
    talismans!: TalismanSession;
    talismanPanel!: TalismanPanel;
    private talismanHud!: TalismanHud;
    private extraElites: {id:import('../encounters/encounterConfig').EliteId;strength:number;count:number}[]=[];
    mapManager!: MapManager;
    bosses!: BossManager;
    encounters!: EncounterManager;
    bossRewards!: BossRewardManager;
    private elites!: EliteManager;
    private bossHud!: BossHud;
    private announcement!: EncounterAnnouncement;
    private pendingRewards: BossId[] = [];
    runStats = { eliteKills: 0, bossKills: 0, bossesDefeated: [] as BossId[], victory: false };
    private saveTimer = 0;
    private progress = getCharacterManager().unlocks;
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
        this.pendingRewards = [];
        this.extraElites=[];
        this.talismans=new TalismanSession();
        this.talismanPanel=new TalismanPanel();
        this.talismanHud=new TalismanHud(this);
        this.runStats = { eliteKills: 0, bossKills: 0, bossesDefeated: [], victory: false };
        this.elapsed = 0;
        this.saveTimer = 0;
        this.kills = 0;
        this.paused = false;
        this.ended = false;
        this.damageTexts = [];
        this.mapManager = new MapManager(this);
        this.physics.world.setBounds(0, 0, this.mapManager.definition.width, this.mapManager.definition.height);
        this.physics.world.resume();
        this.mapManager.create();
        this.visuals = new CombatVisuals(this);
        this.player = new Player(this, getCharacterManager().character);
        this.player.setPosition(this.mapManager.definition.start.x, this.mapManager.definition.start.y);
        this.mapManager.attachPlayer(this.player);
        this.cameras.main
            .setBounds(0, 0, this.mapManager.definition.width, this.mapManager.definition.height)
            .centerOn(this.player.x, this.player.y)
            .startFollow(this.player, true, 0.12, 0.12);
        const enemyGroup = this.physics.add.group();
        const boltGroup = this.physics.add.group();
        this.enemies = new Pool(() => {
            const e = new Enemy(this,()=>this.talismans.modifiers);
            enemyGroup.add(e);
            return e;
        }, talismanEnemyCapacity(),()=>Math.min(TALISMAN_CONFIG.enemyHardLimit,Math.floor(BALANCE.limits.enemies*this.talismans.modifiers.enemyMaxCountMultiplier)));
        this.bolts = new Pool(() => {
            const b = new Projectile(this);
            boltGroup.add(b);
            return b;
        }, BALANCE.limits.projectiles);
        this.orbs = new Pool(() => new ExpOrb(this), BALANCE.limits.orbs);
        this.levels = new LevelSystem();
        this.weapons = new WeaponSystem(this, this.player, this.enemies, this.bolts, () => this.audio.playSfx(K.TALISMAN_SHOT), (enemy, value, critical, source) => this.enemyDamaged(enemy, value, critical, source), this.player.character.startingWeaponId);
        this.progress.weaponLevel(this.player.character.startingWeaponId, 1);
        this.upgrades = new UpgradeSystem(Math.random, this.weapons.loadout);
        this.weaponBar = new WeaponBar(this, this.weapons.loadout);
        this.panel = new UpgradePanel(this, this.upgrades);
        this.hud = new Hud(this, this.weapons.loadout);
        this.spawn = new EnemySpawnSystem(this.enemies,()=>this.talismans.modifiers);
        this.announcement = new EncounterAnnouncement(this);
        this.bosses = new BossManager(this, this.player, this.enemies, enemyGroup, d => this.hurtPlayer(d*this.talismans.modifiers.enemyDamageMultiplier), (key, name) => { this.announcement.show(key, name); this.audio.playSfx(K.LEVEL_UP); },()=>this.talismans.modifiers);
        this.bossHud = new BossHud(this, this.bosses);
        this.elites = new EliteManager(this, this.enemies, this.player, amount => { this.player.stats.hp = Math.min(this.player.stats.maxHp, this.player.stats.hp + amount); this.audio.playSfx(K.SOUL_PICKUP); });
        this.encounters = new EncounterManager(BALANCE.duration, e => { if (e.type === 'boss')
            return this.bosses.spawnBoss(e.bossId); const spawned = this.elites.spawn(e.eliteId, e.strength, this.elapsed); if (spawned) {
            this.announcement.show('boss.elite');
            const count=this.talismans.modifiers.extraEliteCount;
            if(count)this.extraElites.push({id:e.eliteId,strength:e.strength,count});
        } return spawned; });
        this.bossRewards = new BossRewardManager(this.upgrades, this.levels, amount => { this.grantXp(amount); });
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
            if (this.ended || this.paused || this.panel.open || this.talismanPanel.open)
                return;
            this.weapons.hit(bolt, enemy);
        });
        this.physics.add.overlap(this.player, enemyGroup, (_p, e) => {
            const enemy = e as Enemy;
            if (enemy.active)
                this.hurtPlayer(enemy.damage);
        });
        this.keys = this.input.keyboard!.addKeys("W,A,S,D,UP,DOWN,LEFT,RIGHT,ESC,ONE,TWO,THREE") as Record<string, Phaser.Input.Keyboard.Key>;
        // Event-based card input survives a short keypress between slow render frames.
        ["ONE", "TWO", "THREE"].forEach((name,index)=>{
            const eventName=`keydown-${name}`;
            const select=(event:KeyboardEvent)=>{if(!event.repeat&&this.panel.open)this.panel.select(index);};
            this.input.keyboard!.on(eventName,select);
            this.events.once("shutdown",()=>this.input.keyboard?.off(eventName,select));
        });
        this.pauseText = label(this, 640, 365, () => t("pause.message"), 26, "#b8a16a")
            .setOrigin(0.5)
            .setAlign("center")
            .setBackgroundColor("#111719")
            .setPadding(50)
            .setDepth(210)
            .setVisible(false);
        const blur = () => {
            if (!this.ended && !this.panel.open && !this.talismanPanel.open && !this.paused)
                this.togglePause();
        };
        this.game.events.on(Phaser.Core.Events.BLUR, blur);
        this.events.once("shutdown", () => {
            this.game.events.off(Phaser.Core.Events.BLUR, blur);
            this.panel.close();
            this.talismanPanel.close();
            this.weapons.destroy();
            this.bosses.destroy();
            this.bossHud.destroy();
            this.elites.destroy();
            this.announcement.destroy();
            this.mapManager.destroy();
            this.progress.flush();
            this.audio.stopBgm();
            if (!this.ended)
                this.audio.stopSfx();
        });
        this.cameras.main.fadeIn(250);
        this.hud.update(this.player, this.levels, 0, 0);
        this.mapManager.update(0, [], false);
    }
    private hurtPlayer(damage: number) {
        if (this.ended || this.paused || this.panel.open || this.talismanPanel.open || this.player.invulnerable > 0)
            return;
        this.player.stats.hp = Math.max(0, this.player.stats.hp - damage * this.player.stats.damageTakenMultiplier);
        this.player.invulnerable = BALANCE.contactInvulnerability;
        this.cameras.main.shake(90, .003);
        this.visuals.playerHit();
        this.audio.playSfx(K.PLAYER_HIT);
        if (this.player.stats.hp <= 0)
            this.finish(false);
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
        if (this.panel.open || this.talismanPanel.open)
            return;
        if (Phaser.Input.Keyboard.JustDown(this.keys.ESC))
            this.togglePause();
        if (this.paused)
            return;
        const dt = Math.min(delta / 1000, 0.05);
        this.elapsed += dt;
        this.talismans.update(this.elapsed);
        // A due talisman is resolved before further combat or queued level-up cards.
        if(this.talismans.ready){this.continueAfterCard();return;}
        this.visuals.update(dt);
        this.announcement.update(dt);
        this.encounters.update(this.elapsed);
        for(const extra of this.extraElites) while(extra.count>0 && this.elites.spawn(extra.id,extra.strength,this.elapsed))extra.count--;
        this.extraElites=this.extraElites.filter(e=>e.count>0);
        this.saveTimer += dt;
        if (this.saveTimer >= 1) {
            this.saveTimer = 0;
            this.progress.survival(this.elapsed);
            this.progress.flush();
        }
        const x = Number(this.keys.D.isDown || this.keys.RIGHT.isDown) -
            Number(this.keys.A.isDown || this.keys.LEFT.isDown);
        const y = Number(this.keys.S.isDown || this.keys.DOWN.isDown) -
            Number(this.keys.W.isDown || this.keys.UP.isDown);
        this.player.move(x, y, dt);
        this.spawn.update(dt, Math.min(this.elapsed, BALANCE.duration), this.player.x, this.player.y, this.bosses.active ? C.normalSpawnMultiplier : 1);
        for (const e of this.enemies.items)
            if (e.active && e.rank !== 'boss') {
                if (e.rank === 'normal' && Phaser.Math.Distance.Squared(e.x, e.y, this.player.x, this.player.y) >
                    1500 ** 2)
                    e.disableBody(true, true);
                else
                    e.chase(this.player.x, this.player.y, dt);
            }
        this.bosses.update(dt);
        if (this.ended)
            return;
        this.elites.update(dt);
        this.weapons.update(dt);
        this.bossHud.update();
        this.mapManager.update(dt, this.bosses.activeBosses.map(b => b.definition.id), this.bosses.finalDefeated);
        if (this.bosses.finalDefeated) {
            this.finish(true);
            return;
        }
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
        this.continueAfterCard();
    }
    private enemyDamaged(enemy: Enemy, value: number, critical: boolean, source: WeaponId) {
        this.audio.playSfx(K.ENEMY_HIT);
        this.damage(enemy.x, enemy.y, Math.round(value), critical);
        this.visuals.hit(enemy.x, enemy.y);
        if (enemy.hp <= 0)
            this.kill(enemy, source);
    }
    private kill(enemy: Enemy, source: WeaponId) {
        const x = enemy.x, y = enemy.y, xp = enemy.xp * (enemy.rank === "elite" ? this.talismans.modifiers.eliteRewardMultiplier : 1);
        if (enemy.rank === 'elite') {
            this.runStats.eliteKills++;
            this.elites.defeated(enemy);
        }
        if (enemy instanceof Boss) {
            const id = enemy.definition.id;
            this.bosses.defeated(enemy);
            this.mapManager.bossDefeated(id);
            this.runStats.bossKills++;
            this.runStats.bossesDefeated.push(id);
            this.progress.bossKill(id);
            if (id === 'vengeful-general')
                this.pendingRewards.push(id);
        }
        enemy.disableBody(true, true);
        if (enemy instanceof Boss)
            this.bossHud.update();
        this.kills++;
        this.progress.kill(source, this.kills);
        this.audio.playSfx(K.ENEMY_DEATH);
        this.particles.emitParticleAt(x, y, 5);
        if (xp <= 0)
            return;
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
                this.grantXp(orb.value);
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
    private showBossReward() {
        const id = this.pendingRewards.shift();
        if (!id)
            return;
        this.audio.playSfx(K.LEVEL_UP);
        this.physics.pause();
        this.particles.pause();
        this.panel.show(this.bossRewards.getBossRewardOptions(this.player.stats), choice => {
            if (this.bossRewards.applyBossReward(choice, this.player.stats))
                this.afterCard(choice);
            this.continueAfterCard();
        }, { bossNameKey: BOSSES[id].nameKey });
    }
    private continueAfterCard() {
        if(this.ended || this.paused || this.panel.open || this.talismanPanel.open)return;
        if(this.talismans.ready)
            this.showTalisman();
        else if (this.pendingRewards.length)
            this.showBossReward();
        else if (this.levels.pending > 0)
            this.showUpgrade();
        else if (!this.paused) {
            this.physics.resume();
            this.particles.resume();
        }
    }
    private afterCard(choice: import('../systems/UpgradeSystem').UpgradeChoice) {
        this.audio.playSfx(K.UPGRADE_SELECT);
        this.weapons.syncLoadout();
        if (choice.definition.evolutionId) {
            this.audio.playSfx(K.LEVEL_UP);
            this.visuals.awaken(this.player.x, this.player.y);
            this.cameras.main.flash(180, 204, 167, 88, false);
            this.cameras.main.shake(90, .002);
            const title = label(this, 640, 260, () => t('evolution.announcement', { name: t(choice.definition.nameKey) }), 26, '#efd49b').setOrigin(.5).setDepth(205);
            this.tweens.add({ targets: title, alpha: 0, delay: 700, duration: 600, onComplete: () => title.destroy() });
        }
        if (choice.definition.weaponId)
            this.progress.weaponLevel(choice.definition.weaponId, this.weapons.loadout.level(choice.definition.weaponId));
        this.weaponBar.refresh();
        this.hud.update(this.player, this.levels, this.elapsed, this.kills);
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
            const oldMax=this.player.stats.maxHp;
            this.upgrades.apply(choice, this.player.stats);
            if(choice.definition.id==='vitality') {
                const correction=(this.player.stats.maxHp-oldMax)*(this.talismans.modifiers.playerMaxHpMultiplier-1);
                this.player.stats.maxHp+=correction;this.player.stats.hp=Math.min(this.player.stats.maxHp,this.player.stats.hp+correction);
            }
            this.afterCard(choice);
            this.continueAfterCard();
        });
    }
    private grantXp(amount:number) {
        const xp=amount*this.talismans.modifiers.xpMultiplier;
        this.levels.add(xp);this.progress.collectSouls(xp);
    }
    /** Dev-only invocation; no production UI or debug controls. */
    triggerTalismanEvent(id?:string) {
        if(!import.meta.env.DEV || this.ended)return;
        this.talismans.trigger();
        if(!this.panel.open && !this.talismanPanel.open && !this.paused)this.showTalisman(id);
    }
    private showTalisman(id?:string) {
        const d=this.talismans.offer(id);if(!d)return;
        this.physics.pause();this.particles.pause();
        this.events.emit('talisman:appear',d.id); // Optional sound hook; intentionally silent.
        this.talismanPanel.show(d,accept=>{
            const before=this.talismans.modifiers;
            this.talismans.decide(accept);
            const after=this.talismans.modifiers;
            if(accept){
                applyPlayerTalismanDelta(this.player.stats,before,after);
                this.player.bossDamageMultiplier=after.bossDamageMultiplier;
                this.upgrades.rarityBonus=after.upgradeRarityBonus;
                // One pass on acceptance, never a per-frame effect scan. Preserve HP fraction.
                for(const e of this.enemies.items)if(e.active){
                    e.hp*=after.enemyHpMultiplier/before.enemyHpMultiplier;
                    e.maxHp*=after.enemyHpMultiplier/before.enemyHpMultiplier;
                    e.speed*=after.enemyMoveSpeedMultiplier/before.enemyMoveSpeedMultiplier;
                    e.damage*=after.enemyDamageMultiplier/before.enemyDamageMultiplier;
                }
                this.talismanHud.refresh(this.talismans.acceptedIds);
                this.cameras.main.flash(180,130,32,26,false);
                const vignette=this.add.graphics().setScrollFactor(0).setDepth(195);
                vignette.lineStyle(22,0x862e26,.35).strokeRect(11,11,1258,778);
                this.tweens.add({targets:vignette,alpha:0,duration:650,onComplete:()=>vignette.destroy()});
            }
            this.events.emit(accept?'talisman:accept':'talisman:reject',d.id);
            const feedback=label(this,640,220,()=>t(accept?'talisman.accepted':'talisman.rejected',{name:t(d.nameKey)}),20,'#e0bd8d').setOrigin(.5).setDepth(195);
            this.tweens.add({targets:feedback,alpha:0,delay:400,duration:450,onComplete:()=>feedback.destroy()});
            this.hud.update(this.player,this.levels,this.elapsed,this.kills);
            this.continueAfterCard();
        });
    }
    finish(won: boolean) {
        if (this.ended)
            return;
        this.ended = true;
        this.runStats.victory = won;
        this.progress.finishRun(this.kills, this.elapsed);
        this.audio.endRun(!won);
        if (won)
            this.audio.playSfx(K.LEVEL_UP);
        this.physics.pause();
        this.scene.start("GameOver", {
            time: this.elapsed,
            level: this.levels.level,
            kills: this.kills,
            won,
            characterId: this.player.character.id,
            evolvedWeapons: Array.from(this.weapons.loadout.entries()).filter(([id]) => WEAPONS[id].baseWeaponId).map(([id]) => id),
            ...this.runStats,
            talismanIds:[...this.talismans.acceptedIds],
            rejectedTalismanIds:[...this.talismans.rejectedIds],
            unlocked: this.progress.takeNotifications(),
        });
    }
}
