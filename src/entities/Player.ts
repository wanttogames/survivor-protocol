import { createCharacterAdornment } from "../characters/characterVisuals";
import type { CharacterDefinition } from "../characters/characterTypes";
import { characterById, applyCharacterPassive } from "../characters/characterDefinitions";
import Phaser from "phaser";
import { BALANCE, type PlayerStats } from "../config/balance";
export class Player extends Phaser.Physics.Arcade.Sprite {
    stats: PlayerStats = { ...BALANCE.player };
    invulnerable = 0;
    private walkTime = 0;
    private adornment: Phaser.GameObjects.Graphics;
    constructor(scene: Phaser.Scene, readonly character: CharacterDefinition = characterById("exorcist")) {
        super(scene, BALANCE.worldSize / 2, BALANCE.worldSize / 2, "player");
        applyCharacterPassive(character, this.stats);
        this.setTint(character.visual.tint);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.adornment = createCharacterAdornment(scene, character).setPosition(this.x, this.y);
        this.setCircle(15, 17, 17).setCollideWorldBounds(true).setDepth(5);
    }
    move(x: number, y: number, dt: number) {
        const length = Math.hypot(x, y) || 1;
        this.setVelocity((x / length) * this.stats.moveSpeed, (y / length) * this.stats.moveSpeed);
        this.walkTime += dt;
        this.adornment.setPosition(this.x, this.y).setAlpha(this.alpha);
        this.rotation = 0;
        if (x)
            this.setFlipX(x < 0);
        this.setTexture(x || y
            ? `player-walk-${1 + (Math.floor(this.walkTime * 8) % 2)}`
            : "player");
        this.invulnerable = Math.max(0, this.invulnerable - dt);
        this.setAlpha(this.invulnerable > 0 ? 0.55 + Math.sin(this.invulnerable * 45) * 0.2 : 1);
    }
}
