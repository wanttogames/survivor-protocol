import type Phaser from 'phaser';
import { Enemy } from '../entities/Enemy';
import type { BossDefinition } from '../encounters/encounterConfig';
/** Shares Enemy damage/collision/targeting; pattern state is owned by BossManager. */
export class Boss extends Enemy {
    readonly poolEligible = false;
    phase = 1;
    constructor(scene: Phaser.Scene, readonly definition: BossDefinition, modifiers?:()=>import('../talismans/talismanDefinitions').TalismanModifiers) { super(scene,modifiers); }
    awaken(x: number, y: number) {
        const d = this.definition;
        this.spawn(x, y, 'tank', 1, 1);
        this.rank = 'boss';
        this.phase = 1;
        this.setTexture(d.texture).setScale(d.scale).setCircle(d.radius, 64 - d.radius, 64 - d.radius);
        this.collisionRadius = d.radius * d.scale;
        this.hp = this.maxHp = d.hp * this.curseModifiers().enemyHpMultiplier;
        this.speed = d.speed * this.curseModifiers().enemyMoveSpeedMultiplier;
        this.damage = d.damage * this.curseModifiers().enemyDamageMultiplier;
        this.xp = 0;
    }
}
