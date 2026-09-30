import {getCharacterManager} from "./characters/CharacterManager";
import { initLocale } from "./i18n";
import "./style.css";
import { createGame } from "./game/Game";
initLocale();
const game = createGame();
if (import.meta.env.DEV) Object.assign(window, { __SURVIVOR_GAME__: game,__GUIYA_CHARACTERS__:getCharacterManager(),__GUIYA_RESET_PROGRESS__:()=>getCharacterManager().reset() });
window.addEventListener("pagehide",()=>getCharacterManager().unlocks.flush());
