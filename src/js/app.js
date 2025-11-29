import { createGame } from "./modules/game.js";

export function initGame() {
  const game = createGame();
  game.mount();
}
