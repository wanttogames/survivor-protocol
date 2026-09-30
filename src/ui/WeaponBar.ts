import type Phaser from 'phaser';
import { WEAPONS } from '../data/weaponConfig';
import type { WeaponLoadout } from '../weapons/WeaponLoadout';
import { t } from '../i18n';
import { label } from './common';
/** Compact build readout, updated on card changes (not reconstructed each frame). */
export class WeaponBar {
    private text: Phaser.GameObjects.Text;
    constructor(scene: Phaser.Scene, private loadout: WeaponLoadout) {
        this.text = label(scene, 35, 718, () => this.content(), 13, '#cbbb92').setDepth(100).setBackgroundColor('#111719').setPadding(7, 4);
    }
    private content() { return t('hud.weapons', { count: this.loadout.size, max: this.loadout.slots }) + '   ' + Array.from(this.loadout.entries(), ([id, level]) => `${t(WEAPONS[id].nameKey)} ${level}`).join('  ·  '); }
    refresh() { this.text.setText(this.content()); }
}
