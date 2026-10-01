import {CharacterSelectScene} from "../scenes/CharacterSelectScene";
import Phaser from "phaser";
import { VIEW } from "../config/gameConfig";
import { BootScene } from "../scenes/BootScene";
import { MenuScene } from "../scenes/MenuScene";
import { GameScene } from "../scenes/GameScene";
import { GameOverScene } from "../scenes/GameOverScene";
export function createGame() {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: "game",
    backgroundColor: "#10151a",
    width: VIEW.width,
    height: VIEW.height,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    physics: { default: "arcade", arcade: { debug: false } },
    render: { antialias: true, powerPreference: "high-performance" },
    scene: [BootScene, MenuScene, CharacterSelectScene, GameScene, GameOverScene],
  });
  // Mobile orientation can refresh FIT using the previous parent size. Re-read the
  // actual container after layout, including while gameplay is paused.
  game.events.once(Phaser.Core.Events.READY, () => {
    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        game.scale.getParentBounds();
        game.scale.refresh();
      });
    });
    observer.observe(game.canvas.parentElement!);
    game.events.once(Phaser.Core.Events.DESTROY, () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    });
  });
  return game;
}
