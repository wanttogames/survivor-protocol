import { setLocale, DEFAULT_LOCALE } from "./i18n";
import "./style.css";
import { createGame } from "./game/Game";
setLocale(DEFAULT_LOCALE);
const game = createGame();
if (import.meta.env.DEV) Object.assign(window, { __SURVIVOR_GAME__: game });
