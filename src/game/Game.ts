import Phaser from "phaser";
import { VIEW } from "../config/gameConfig";
import { BootScene } from "../scenes/BootScene";
import { MenuScene } from "../scenes/MenuScene";
import { GameScene } from "../scenes/GameScene";
import { GameOverScene } from "../scenes/GameOverScene";
export function createGame() {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent: "game",
    backgroundColor: "#10151a",
    width: VIEW.width,
    height: VIEW.height,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    physics: { default: "arcade", arcade: { debug: false } },
    render: { antialias: true, powerPreference: "high-performance" },
    scene: [BootScene, MenuScene, GameScene, GameOverScene],
  });
}
