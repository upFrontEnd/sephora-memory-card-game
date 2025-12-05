const STORAGE_KEY = "theme"; // "light" | "dark"

function getPreferredTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "light" || saved === "dark") return saved;

  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
  return prefersDark ? "dark" : "light";
}

function applyTheme(theme) {
  const root = document.documentElement; // <html>
  root.dataset.theme = theme;
  root.style.colorScheme = theme; // aide les controls natifs

  // Switch: on garde le visuel CodePen (checked = soleil / unchecked = lune)
  const input = document.getElementById("theme-switch");
  if (input) {
    input.checked = theme === "light";
    input.setAttribute("aria-checked", String(input.checked));
  }

  localStorage.setItem(STORAGE_KEY, theme);
}

export function initThemeToggle() {
  const input = document.getElementById("theme-switch");
  if (!input) return;

  // init
  applyTheme(getPreferredTheme());

  // toggle
  input.addEventListener("change", () => {
    const nextTheme = input.checked ? "light" : "dark";
    applyTheme(nextTheme);
  });
}
