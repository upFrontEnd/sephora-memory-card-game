import "../scss/style.scss";
import { initGame } from "./app.js";
import { initThemeToggle } from "./modules/theme-toggle.js";
import { initSoundToggle, preloadAllSounds } from "./modules/sound.js";
import "@lottiefiles/dotlottie-wc";

document.addEventListener("DOMContentLoaded", () => {
  preloadAllSounds();
  initThemeToggle();
  initSoundToggle();
  initGame();
});
