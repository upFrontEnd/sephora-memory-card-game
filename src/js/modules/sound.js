const SOUND_PATHS = {
  flip: "/sound/flip.mp3",     
  match: "/sound/match.mp3",   
  win: "/sound/win.mp3",       
};

// Volume par son (0 = muet, 1 = max)
const SOUND_VOLUME = {
  flip: 1,
  unflip: 1,
  match: 1,
  win: 0.1,
};

// Etat global du son (accessible par playSound)
const soundState = {
  enabled: false, // état initial : son coupé
};

// Cache des instances Audio pour éviter de recréer à chaque fois
const audioMap = {};

/**
 * Crée et configure une instance Audio pour un son.
 */
function createAudio(key) {
  const src = SOUND_PATHS[key];
  if (!src) return null;

  const audio = new Audio(src);
  audio.preload = "auto";

  const volume = SOUND_VOLUME[key];
  audio.volume = typeof volume === "number" ? volume : 1;

  audioMap[key] = audio;
  return audio;
}

/**
 * Récupère (ou crée) une instance Audio pour un son donné.
 * @param {string} key - "flip" | "match" | "win"
 */
function getAudio(key) {
  if (audioMap[key]) return audioMap[key];
  return createAudio(key);
}

/**
 * Précharge tous les sons au chargement de la page.
 * Appelle simplement .load() sur chaque Audio.
 */
export function preloadAllSounds() {
  Object.keys(SOUND_PATHS).forEach((key) => {
    const audio = getAudio(key);
    if (audio) {
      audio.load();
    }
  });
}

/**
 * Joue un son si le son est activé.
 * @param {"flip" | "match" | "win"} name
 */
export function playSound(name) {
  if (!soundState.enabled) return;

  const audio = getAudio(name);
  if (!audio) return;

  audio.currentTime = 0;
  audio.play().catch(() => {
    // En cas de blocage navigateur, on ne casse pas le jeu
  });
}

/**
 * Initialise le bouton de bascule du son (icône haut-parleur).
 * Met à jour soundState.enabled + l'UI (aria + classes).
 */
export function initSoundToggle() {
  const button = document.querySelector(".sound-toggle");
  if (!button) return;

  function render() {
    if (soundState.enabled) {
      button.classList.add("sound-toggle--on");
      button.setAttribute("aria-pressed", "true");
      button.setAttribute("aria-label", "Désactiver le son");
    } else {
      button.classList.remove("sound-toggle--on");
      button.setAttribute("aria-pressed", "false");
      button.setAttribute("aria-label", "Activer le son");
    }
  }

  button.addEventListener("click", () => {
    soundState.enabled = !soundState.enabled;
    render();
  });

  // Premier rendu cohérent avec l'état initial (son OFF)
  render();
}
