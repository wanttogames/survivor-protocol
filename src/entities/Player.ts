import Phaser from "phaser";
import { BALANCE, type PlayerStats } from "../config/balance";
export class Player extends Phaser.Physics.Arcade.Sprite {
  stats: PlayerStats = { ...BALANCE.player };
  invulnerable = 0;
  constructor(scene: Phaser.Scene) {
    super(scene, BALANCE.worldSize / 2, BALANCE.worldSize / 2, "player");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCircle(15, 17, 17).setCollideWorldBounds(true).setDepth(5);
  }
  move(x: number, y: number, dt: number) {
    const length = Math.hypot(x, y) || 1;
    this.setVelocity(
      (x / length) * this.stats.moveSpeed,
      (y / length) * this.stats.moveSpeed,
    );
    if (x || y) this.rotation = Math.atan2(y, x) + Math.PI / 2;
    this.invulnerable = Math.max(0, this.invulnerable - dt);
    this.setAlpha(
      this.invulnerable > 0 ? 0.55 + Math.sin(this.invulnerable * 45) * 0.2 : 1,
    );
  }
}
