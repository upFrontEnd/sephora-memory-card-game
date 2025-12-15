import "../scss/style.scss";
import { initGame } from "./app.js";
import { initThemeToggle } from "./modules/theme-toggle.js";
import { initSoundToggle } from "./modules/sound.js";
import "@lottiefiles/dotlottie-wc";

document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  initSoundToggle();
  initGame();
});