import "../scss/style.scss";
import { initGame } from "./app.js";
import { initThemeToggle } from "./modules/theme-toggle.js";

document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  initGame();
});