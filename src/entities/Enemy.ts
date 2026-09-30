import Phaser from "phaser";
import { ENEMIES, type EnemyKind } from "../data/enemies";
export class Enemy extends Phaser.Physics.Arcade.Sprite {
  rank: "normal" | "elite" | "boss" = "normal";
  eliteId?: import("../encounters/encounterConfig").EliteId;
  maxHp = 0;
  collisionRadius = 15;
  hp = 0;
  speed = 0;
  damage = 0;
  xp = 0;
  generation = 0;
  flash = 0;
  kind: EnemyKind = "grunt";
  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, "grunt");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.disableBody(true, true);
    this.setDepth(3);
  }
  spawn(
    x: number,
    y: number,
    kind: EnemyKind,
    hpScale: number,
    speedScale: number,
  ) {
    const d = ENEMIES[kind];
    this.rank="normal";this.eliteId=undefined;this.setScale(1);this.collisionRadius=d.radius;
    this.kind = kind;
    this.setTexture(kind);
    this.enableBody(true, x, y, true, true);
    this.setCircle(d.radius, 32 - d.radius, 32 - d.radius);
    this.hp = this.maxHp = d.hp * hpScale;
    this.speed = d.speed * speedScale;
    this.damage = d.damage;
    this.xp = d.xp;
    this.generation++;
    this.flash = 0;
    this.clearTint();
  }
  chase(x: number, y: number, dt: number) {
    const dx = x - this.x,
      dy = y - this.y,
      l = Math.hypot(dx, dy) || 1;
    this.setVelocity((dx / l) * this.speed, (dy / l) * this.speed);
    this.rotation = 0;
    this.setFlipX(dx < 0);
    if (this.flash > 0) {
      this.flash -= dt;
      if (this.flash <= 0) this.clearTint();
    }
  }
}
