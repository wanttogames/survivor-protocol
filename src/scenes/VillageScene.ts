import Phaser from 'phaser';
import { t, onLocaleChange, type TranslationKey } from '../i18n';
import { getMetaProgression, TRAINING, CHARMS, type TrainingId, type CharmId } from '../progression/MetaProgression';
import { nightBackdrop } from '../theme/ornaments';
const key = (id: string) => `village.${id}` as TranslationKey;
/** Native controls stay readable and touchable independently of the FIT canvas scale. */
export class VillageScene extends Phaser.Scene {
  constructor() { super('Village'); }
  create() {
    nightBackdrop(this);
    const root = document.createElement('section');
    root.className = 'village-shop';
    root.setAttribute('aria-label', t('village.title'));
    document.body.append(root);
    // Don't forward shop touches into Phaser's global pointer bookkeeping.
    const stop = (event: Event) => event.stopPropagation();
    for (const event of ['touchstart', 'touchmove', 'touchend', 'touchcancel']) root.addEventListener(event, stop, { passive: true });
    const meta = getMetaProgression();
    let message = '';
    const render = () => {
      root.replaceChildren();
      const state = meta.state;
      const text = (tag: string, value: string, parent: HTMLElement = root) => { const el = document.createElement(tag); el.textContent = value; parent.append(el); return el; };
      const action = (parent: HTMLElement, caption: string, run: () => void, disabled = false) => {
        const button = document.createElement('button'); button.type = 'button'; button.textContent = caption; button.disabled = disabled;
        button.addEventListener('click', run); parent.append(button); return button;
      };
      text('h1', t('village.title'));
      text('p', t('village.coins', { value: state.coins })).className = 'village-balance';
      text('p', t('village.guide'));
      const status = text('p', message); status.setAttribute('role', 'status');
      text('h2', t('village.training'));
      const training = text('div', ''); training.className = 'village-grid';
      for (const id of Object.keys(TRAINING) as TrainingId[]) {
        const card = text('article', '', training); card.dataset.training = id;
        const level = state.training[id]; const cost = TRAINING[id].costs[level];
        text('h3', t(key(id)), card); text('p', t(key(`${id}Desc`)), card); text('p', t('village.level', { level }), card);
        action(card, cost === undefined ? t('village.max') : t('village.train', { cost }), () => { message = meta.train(id) ? '' : t('village.insufficient'); render(); }, cost === undefined);
      }
      text('h2', t('village.charms'));
      const charms = text('div', ''); charms.className = 'village-grid';
      for (const id of Object.keys(CHARMS) as CharmId[]) {
        const card = text('article', '', charms); card.dataset.charm = id;
        card.classList.toggle('equipped', state.equipped === id);
        text('h3', t(key(id)), card); text('p', t(key(`${id}Desc`)), card);
        const unlocked = state.unlocked.includes(id);
        action(card, !unlocked ? t('village.buy', { cost: CHARMS[id] }) : t(state.equipped === id ? 'village.equipped' : 'village.equip'), () => {
          if (!unlocked) message = meta.unlock(id) ? '' : t('village.insufficient');
          else { meta.equip(id); message = ''; }
          render();
        }, state.equipped === id);
      }
      const footer = text('footer', '');
      action(footer, t('village.unequip'), () => { meta.equip(null); render(); }, state.equipped === null);
      action(footer, t('village.back'), () => this.scene.start('Menu'));
    };
    render();
    const off = onLocaleChange(render);
    this.events.once('shutdown', () => { off(); root.remove(); });
    this.input.keyboard?.once('keydown-ESC', () => this.scene.start('Menu'));
  }
}
