import Phaser from "phaser";
/** Bounded presentation effects, independent of damage and collision decisions. */
export class CombatVisuals {
  private hitEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
  private seal: Phaser.GameObjects.Image;
  private hurt: Phaser.GameObjects.Rectangle;
  private sealTime = 0;
  private hurtTime = 0;
  constructor(scene: Phaser.Scene) {
    this.hitEmitter = scene.add
      .particles(0, 0, "spark", {
        emitting: false,
        lifespan: 180,
        speed: { min: 25, max: 70 },
        scale: { start: 0.65, end: 0 },
        alpha: { start: 0.7, end: 0 },
        tint: [0xd6c49d, 0x963f35],
        maxParticles: 40,
      })
      .setDepth(6);
    this.seal = scene.add.image(0, 0, "seal").setDepth(6).setVisible(false);
    this.hurt = scene.add
      .rectangle(640, 400, 1280, 800, 0x853728, 0)
      .setScrollFactor(0)
      .setDepth(85);
  }
  hit(x: number, y: number) {
    this.hitEmitter.emitParticleAt(x, y, 3);
  }
  playerHit() {
    this.hurtTime = 0.18;
  }
  awaken(x: number, y: number) {
    this.sealTime = 0.7;
    this.seal.setPosition(x, y).setVisible(true);
  }
  update(dt: number) {
    this.hurtTime = Math.max(0, this.hurtTime - dt);
    this.hurt.setFillStyle(0x853728, (this.hurtTime / 0.18) * 0.16);
    this.sealTime = Math.max(0, this.sealTime - dt);
    if (this.sealTime > 0)
      this.seal
        .setScale(1 + (1 - this.sealTime / 0.7) * 1.1)
        .setAlpha((this.sealTime / 0.7) * 0.7);
    else this.seal.setVisible(false);
  }
}
