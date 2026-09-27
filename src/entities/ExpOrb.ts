import Phaser from "phaser";
export class ExpOrb extends Phaser.GameObjects.Image {
  value = 0;
  magnetized = false;
  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, "orb");
    scene.add.existing(this);
    this.setActive(false).setVisible(false).setDepth(2);
  }
  spawn(x: number, y: number, value: number) {
    this.setPosition(x, y).setActive(true).setVisible(true);
    this.value = value;
    this.magnetized = false;
    this.setScale(value > 4 ? 1.35 : 1);
  }
}
