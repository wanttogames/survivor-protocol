import { t, onLocaleChange } from '../i18n';
import { effectParams, type TalismanDefinition } from '../talismans/talismanDefinitions';
/** DOM overlay keeps readable text and >=44 CSS-pixel targets even in a small itch.io iframe. */
export class TalismanPanel {
  private root?:HTMLDivElement;
  private unsubscribe?:()=>void;
  private callback?:(accept:boolean)=>void;
  private previousFocus?:HTMLElement;
  get open() {return !!this.root;}
  show(d:TalismanDefinition, callback:(accept:boolean)=>void) {
    this.close();this.callback=callback;this.previousFocus=document.activeElement as HTMLElement;
    const root=document.createElement('div');this.root=root;
    root.className='curse-overlay';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-labelledby','curse-title');
    root.innerHTML=`<style>
.curse-overlay{position:fixed;inset:0;z-index:1000;background:rgba(9,8,10,.94);display:flex;align-items:safe center;justify-content:center;overflow:auto;padding:16px;box-sizing:border-box;font-family:"Noto Sans KR","Malgun Gothic",Arial,sans-serif;color:#e7d8b7}
.curse-card{width:min(440px,100%);box-sizing:border-box;border:2px solid #814134;background:linear-gradient(125deg,#302619,#211a15);padding:22px 26px;text-align:center;box-shadow:0 0 48px #762f2940;margin:auto}
.curse-card h2{font-size:25px;line-height:1.25;margin:8px 0}.curse-card .symbol{font-size:52px;color:#cf6753;line-height:1.15}.curse-card .eyebrow{font-size:13px;color:#ccab7b}.curse-card .risk{color:#e5a064;margin:10px 0 18px}
.curse-card h3{text-align:left;font-size:15px;margin:15px 0 6px;color:#df8976}.curse-card h3.reward{color:#c9c693}.curse-card ul{text-align:left;list-style:none;margin:0;padding:0;font-size:15px;line-height:1.55}.curse-card li{padding:2px 0}.curse-card .guide{font-size:12px;color:#b9ac95;margin:18px 0}
.curse-card button{display:block;width:100%;min-height:48px;border:1px solid #b8a16a;background:#762f29;color:#eee0c6;font-family:inherit;font-size:16px;font-weight:700;cursor:pointer;margin-top:10px;padding:12px;border-radius:3px;touch-action:manipulation}.curse-card button.reject{background:#242121}.curse-card button:hover,.curse-card button:focus-visible{outline:2px solid #d7bc79;outline-offset:2px}
@media(max-height:540px){.curse-card{padding:12px 20px}.curse-card .symbol{font-size:30px}.curse-card .risk{margin:6px}.curse-card h3{margin-top:8px}.curse-card .guide{margin:10px 0}}
</style><section class="curse-card"><div class="eyebrow"></div><div class="symbol"></div><h2 id="curse-title"></h2><div class="risk"></div><h3 class="curse-heading"></h3><ul class="curses"></ul><h3 class="reward"></h3><ul class="rewards"></ul><p class="guide"></p><button class="accept"></button><button class="reject"></button></section>`;
    document.body.append(root);
    const set=(selector:string,text:string)=>{root.querySelector(selector)!.textContent=text;};
    const render=()=>{
      set('.eyebrow',t('talisman.title'));set('.symbol',d.symbol);set('h2',t(d.nameKey));
      set('.risk',t('talisman.risk',{stars:'★'.repeat(d.riskLevel)+'☆'.repeat(5-d.riskLevel)}));
      set('.curse-heading',t('talisman.curses'));set('.reward',t('talisman.rewards'));set('.guide',t('talisman.guide'));
      set('.accept',t('talisman.accept'));set('.reject',t('talisman.reject'));
      for (const [selector,effects] of [['.curses',d.curses],['.rewards',d.rewards]] as const) {
        const ul=root.querySelector(selector)!;ul.replaceChildren();
        for (const e of effects) {const li=document.createElement('li');li.textContent=t(`talisman.effects.${e.type}`,effectParams(e));ul.append(li);}
      }
    };
    render();this.unsubscribe=onLocaleChange(render);
    root.querySelector('.accept')!.addEventListener('click',()=>this.select(true));
    root.querySelector('.reject')!.addEventListener('click',()=>this.select(false));
    root.addEventListener('keydown',event=>{
      if (['1','2','Escape'].includes(event.key)) {event.preventDefault();event.stopPropagation();if(event.repeat)return;this.select(event.key==='1');}
      if(event.key==='Tab'){const buttons=Array.from(root.querySelectorAll('button'));if(event.shiftKey&&document.activeElement===buttons[0]){event.preventDefault();buttons[1].focus();}else if(!event.shiftKey&&document.activeElement===buttons[1]){event.preventDefault();buttons[0].focus();}}
    });
    (root.querySelector('.accept') as HTMLButtonElement).focus();
  }
  select(accept:boolean) {if(!this.open)return;const fn=this.callback;this.close();fn?.(accept);}
  close() {this.unsubscribe?.();this.unsubscribe=undefined;this.root?.remove();this.root=undefined;this.callback=undefined;this.previousFocus?.focus();this.previousFocus=undefined;}
}
