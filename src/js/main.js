import "../scss/style.scss";
import { initThemeToggle } from "./modules/theme-toggle.js";
import { initSoundToggle, preloadAllSounds } from "./modules/sound.js";
import { createGame } from "./modules/game.js";
//import "@lottiefiles/dotlottie-wc";

document.addEventListener("DOMContentLoaded", () => {
  preloadAllSounds();
  initThemeToggle();
  initSoundToggle();
  initGame();
});

export function initGame() {
  const game = createGame();
  game.mount();
}
