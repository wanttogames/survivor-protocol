import {getCharacterManager} from "./characters/CharacterManager";
import { setLocale, DEFAULT_LOCALE } from "./i18n";
import "./style.css";
import { createGame } from "./game/Game";
setLocale(DEFAULT_LOCALE);
const game = createGame();
if (import.meta.env.DEV) Object.assign(window, { __SURVIVOR_GAME__: game,__GUIYA_CHARACTERS__:getCharacterManager(),__GUIYA_RESET_PROGRESS__:()=>getCharacterManager().reset() });
window.addEventListener("pagehide",()=>getCharacterManager().unlocks.flush());
