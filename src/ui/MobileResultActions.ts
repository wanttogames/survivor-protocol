import Phaser from 'phaser';
import { onLocaleChange, t } from '../i18n';

/** Screen-space buttons: canvas FIT must not shrink mobile hit targets. */
export function addMobileResultActions(scene: Phaser.Scene, retry: () => void, mainMenu: () => void, summary?: () => string) {
  const root = document.createElement('div');
  root.className = 'mobile-result-actions';
  // Native buttons handle their own gestures; Phaser's Window touch listener
  // must not allocate pointers for this DOM overlay.
  for (const event of ['touchstart', 'touchmove', 'touchend', 'touchcancel']) {
    root.addEventListener(event, event => event.stopPropagation(), { passive: true });
  }
  const caption = document.createElement("p");
  if (summary) { caption.className = "mobile-result-summary"; root.append(caption); }
  let chosen = false;
  const actions = [
    { id: 'retry', key: 'gameOver.retry', run: retry },
    { id: 'menu', key: 'gameOver.mainMenu', run: mainMenu },
  ] as const;
  const buttons = actions.map(action => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.action = action.id;
    const activate = () => {
      if (chosen) return;
      chosen = true;
      for (const button of buttons) button.disabled = true;
      action.run();
    };
    // A touch release can arrive without a synthetic click after capture/scene
    // changes. Handle a real tap directly, while preserving keyboard click input.
    let press: { id: number; x: number; y: number } | undefined;
    button.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'mouse' && !press) {
        press = { id: event.pointerId, x: event.clientX, y: event.clientY };
      }
    });
    button.addEventListener('pointercancel', event => {
      if (event.pointerId === press?.id) press = undefined;
    });
    button.addEventListener('pointerup', event => {
      if (event.pointerId !== press?.id) return;
      const start = press;
      press = undefined;
      const rect = button.getBoundingClientRect();
      if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 12 ||
          event.clientX < rect.left || event.clientX > rect.right ||
          event.clientY < rect.top || event.clientY > rect.bottom) return;
      event.preventDefault();
      event.stopPropagation();
      activate();
    });
    button.addEventListener('click', event => {
      event.stopPropagation();
      activate();
    });
    root.append(button);
    return button;
  });
  const refresh = () => {
    if (summary) caption.textContent = summary();
    actions.forEach((action, i) => { buttons[i].textContent = t(action.key); });
  };
  refresh();
  const offLocale = onLocaleChange(refresh);
  document.body.append(root);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    offLocale();
    root.remove();
  });
}
