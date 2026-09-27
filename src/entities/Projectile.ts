import Phaser from "phaser";
import { type Enemy } from "./Enemy";
export class Projectile extends Phaser.Physics.Arcade.Sprite {
  ttl = 0;
  damage = 0;
  pierce = 0;
  critical = false;
  hits = new Map<Enemy, number>();
  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, "bolt");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCircle(5, 7, 7).setDepth(4);
    this.disableBody(true, true);
  }
  fire(
    x: number,
    y: number,
    angle: number,
    speed: number,
    damage: number,
    pierce: number,
    critical: boolean,
    ttl: number,
  ) {
    this.enableBody(true, x, y, true, true);
    this.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    this.rotation = angle;
    this.damage = damage;
    this.pierce = pierce;
    this.critical = critical;
    this.ttl = ttl;
    this.hits.clear();
    this.setTint(critical ? 0xffe58c : 0x65ffe3);
  }
}
