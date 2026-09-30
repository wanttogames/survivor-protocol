import { BOSSES, type BossId } from '../encounters/encounterConfig';
import { WEAPONS, type WeaponId } from '../data/weaponConfig';
import { characterById } from "../characters/characterDefinitions";
import type { CharacterId } from "../characters/characterTypes";
import { AudioManager } from "../audio/AudioManager";
import { addAudioControls } from "../audio/audioControls";
import { nightBackdrop, frame } from "../theme/ornaments";
import { t } from "../i18n";
import Phaser from "phaser";
import { label, button, timeLabel } from "../ui/common";
export interface RunResult {
    time: number;
    level: number;
    kills: number;
    won: boolean;
    unlocked?: CharacterId[];
    characterId?: CharacterId;
    evolvedWeapons?: WeaponId[];
    eliteKills?: number;
    bossesDefeated?: BossId[];
    bossKills?: number;
    victory?: boolean;
}
export class GameOverScene extends Phaser.Scene {
    constructor() {
        super("GameOver");
    }
    create(result: RunResult) {
        addAudioControls(this);
        nightBackdrop(this);
        this.add.rectangle(640, 390, 940, 590, 0x10151a, 0.88);
        frame(this.add.graphics(), 170, 95, 940, 590);
        label(this, 640, 165, () => t(result.won ? "gameOver.won" : "gameOver.lost"), 14, result.won ? "#b8a16a" : "#b86451").setOrigin(0.5);
        label(this, 640, 226, () => t(result.won ? "gameOver.wonMessage" : "gameOver.lostMessage"), 45).setOrigin(0.5);
        const values = [
            timeLabel(result.time),
            String(result.level),
            String(result.kills),
        ];
        (["gameOver.time", "gameOver.level", "gameOver.kills"] as const).forEach((key, i) => {
            const x = 390 + i * 250;
            label(this, x, 350, values[i], 44, "#b8a16a").setOrigin(0.5);
            label(this, x, 406, () => t(key), 12, "#a69e8c").setOrigin(0.5);
        });
        const details = [() => t('result.character', { name: t(characterById(result.characterId ?? 'exorcist').nameKey) }), () => t('result.evolved', { names: result.evolvedWeapons?.length ? result.evolvedWeapons.map(id => t(WEAPONS[id].nameKey)).join(' · ') : t('result.none') }), () => t('result.bosses', { names: result.bossesDefeated?.length ? result.bossesDefeated.map(id => t(BOSSES[id].nameKey)).join(' · ') : t('result.none') }) + '   ' + t('result.elites', { count: result.eliteKills ?? 0 })];
        details.forEach((text, i) => label(this, 640, 437 + i * 21, text, 12, '#c8b993').setOrigin(.5).setWordWrapWidth(850).setAlign('center'));
        if (result.unlocked?.length)
            label(this, 640, 650, () => t("character.select.unlocked", { names: result.unlocked!.map(id => t(characterById(id).nameKey)).join(" · ") }), 14, "#cdb574").setOrigin(.5).setWordWrapWidth(850).setAlign("center");
        button(this, 640, 515, () => t("gameOver.retry"), () => { AudioManager.forGame(this.game).unlock(); this.scene.start("Game"); });
        button(this, 640, 593, () => t("gameOver.mainMenu"), () => this.scene.start("Menu"));
        this.input.keyboard?.once("keydown-ENTER", () => { AudioManager.forGame(this.game).unlock(); this.scene.start("Game"); });
    }
}
