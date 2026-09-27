import "./style.css";
import { createGame } from "./game/Game";
const game = createGame();
if (import.meta.env.DEV) Object.assign(window, { __SURVIVOR_GAME__: game });
