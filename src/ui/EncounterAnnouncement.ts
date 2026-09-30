import type Phaser from 'phaser';
import { label } from './common';
import { t, type TranslationKey } from '../i18n';
import { ENCOUNTER_CONFIG } from '../encounters/encounterConfig';
export class EncounterAnnouncement {
    private text: Phaser.GameObjects.Text;
    private shade: Phaser.GameObjects.Rectangle;
    private life = 0;
    constructor(private scene: Phaser.Scene) { this.shade = scene.add.rectangle(640, 400, 1280, 800, 0x140c11, 0).setScrollFactor(0).setDepth(82); this.text = label(scene, 640, 205, '', 26, '#dbc097').setOrigin(.5).setDepth(110).setVisible(false); }
    show(key: 'boss.appear' | 'boss.phase' | 'boss.elite', nameKey?: TranslationKey) { this.life = ENCOUNTER_CONFIG.announcementSeconds; this.text.setText(t(key, nameKey ? { name: t(nameKey) } : {})).setVisible(true).setAlpha(1); this.scene.cameras.main.shake(160, .002); }
    update(dt: number) { this.life = Math.max(0, this.life - dt); this.shade.setAlpha(Math.min(.17, this.life * .2)); this.text.setAlpha(Math.min(1, this.life * 2)).setVisible(this.life > 0); }
    destroy() { this.shade.destroy(); this.text.destroy(); }
}
