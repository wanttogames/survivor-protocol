import Phaser from 'phaser';
import { getLocale, onLocaleChange, setLocale, t, type Locale } from '../i18n';
import { label } from './common';
/** Menu-only preference control. Changes text in place and never restarts a run. */
export function addLanguageSelector(scene: Phaser.Scene) {
  label(scene, 945, 48, () => t('language.label'), 13, '#a69e8c').setOrigin(1,.5);
  const controls = (['ko','en'] as const).map((locale: Locale, i) => {
    const x = 1025+i*145;
    const box = scene.add.rectangle(x,48,132,44,0x111719,.92).setDepth(100)
      .setScrollFactor(0).setName(`locale:${locale}`).setInteractive({useHandCursor:true});
    const text = label(scene,x,48,()=>{
      const name=t(locale==='ko'?'language.korean':'language.english');
      return getLocale()===locale?`[ ${name} ]`:name;
    },16).setOrigin(.5);
    box.on('pointerdown',()=>setLocale(locale));
    return {box,text,locale};
  });
  const refresh=()=>{for(const c of controls){const active=c.locale===getLocale();c.box.setStrokeStyle(active?2:1,active?0xc6b074:0x655640);c.text.setColor(active?'#e5ce91':'#a69e8c');}};
  refresh();
  const off=onLocaleChange(refresh);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN,off);
}
