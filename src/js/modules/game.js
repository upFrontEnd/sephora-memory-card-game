import { shuffleCards } from "./shuffle.js";
import { playSound } from "./sound.js";
import lottie from "lottie-web";

/**
 * Cache global (module) pour éviter de re-fetch le JSON à chaque victoire.
 * Le fichier doit être ici : /public/lottie/rewards.json
 */
let winAnimationDataCache = null;

async function getWinAnimationData() {
  if (winAnimationDataCache) return winAnimationDataCache;

  // Vite : BASE_URL gère les déploiements sous sous-chemin
  const url = `${import.meta.env.BASE_URL}lottie/rewards.json`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Impossible de charger ${url} (HTTP ${res.status})`);
  }

  winAnimationDataCache = await res.json();
  return winAnimationDataCache;
}

export function createGame() {
  const cards = Array.from(document.querySelectorAll(".memory-card"));

  const gameContainer = document.querySelector(".memory-game");
  const overlay = document.querySelector(".win-overlay");
  const replayButton = document.querySelector(".replay-button");

  // Conteneur Lottie (à placer DANS l’overlay : <div class="win-lottie"></div>)
  const lottieContainer = document.querySelector(".win-lottie");

  // === Lottie state ===
  let winLottieInstance = null;

  async function playWinLottie() {
    if (!lottieContainer) return;

    // Évite les doubles instances si jamais la victoire est déclenchée plusieurs fois
    stopWinLottie();

    const animationData = await getWinAnimationData();

    winLottieInstance = lottie.loadAnimation({
      container: lottieContainer,
      renderer: "svg",
      loop: false,
      autoplay: true,
      animationData,
    });
  }

  function stopWinLottie() {
    if (winLottieInstance) {
      winLottieInstance.stop();
      winLottieInstance.destroy();
      winLottieInstance = null;
    }

    // Nettoie le DOM injecté par Lottie pour que ça disparaisse avec l’overlay
    if (lottieContainer) {
      lottieContainer.innerHTML = "";
    }
  }

  // === État du tour en cours ===
  // hasFlippedCard : indique si on a déjà retourné une 1ère carte (on attend la 2e)
  // lockBoard : bloque toute interaction pendant les animations/timeout (anti double-clics)
  // firstCard / secondCard : références des 2 cartes retournées lors du tour
  let hasFlippedCard = false;
  let lockBoard = false;
  let firstCard = null;
  let secondCard = null;

  // Réinitialise l’état du tour (après un match ou un non-match)
  function resetBoard() {
    hasFlippedCard = false;
    lockBoard = false;
    firstCard = null;
    secondCard = null;
  }

  // Cas "non match" : on attend un peu, puis on re-retourne les deux cartes
  function unflipCard() {
    lockBoard = true; // on empêche de cliquer sur d’autres cartes pendant le délai

    setTimeout(() => {
      firstCard.classList.remove("flip");
      secondCard.classList.remove("flip");
      resetBoard();
    }, 900);
  }

  // Cas "match" : on désactive les cartes et on les marque comme trouvées
  function disableCards() {
    lockBoard = true;
    firstCard.removeEventListener("click", flipCard);
    secondCard.removeEventListener("click", flipCard);

    setTimeout(() => {
      firstCard.classList.add("memory-card-shadow");
      secondCard.classList.add("memory-card-shadow");

      // Feedback audio + reset de l’état du tour, puis vérification de fin de partie
      playSound("match");
      resetBoard();
      allFlippedCard();
    }, 900);
  }

  // Compare les deux cartes retournées : match si data-product identique
  function checkForMatch() {
    const isMatch = firstCard.dataset.product === secondCard.dataset.product;
    isMatch ? disableCards() : unflipCard();
  }

  // Handler de clic sur une carte
  function flipCard() {
    // Si le plateau est verrouillé, on ignore les clics
    if (lockBoard) return;
    // Empêche de cliquer deux fois sur la même carte comme "paire"
    if (this === firstCard) return;
    // Retourne visuellement la carte
    this.classList.add("flip");
    playSound("flip");

    // 1er clic : on mémorise la carte et on attend la 2e
    if (!hasFlippedCard) {
      hasFlippedCard = true;
      firstCard = this;
      return;
    }

    // 2e clic : on mémorise la carte et on lance la comparaison
    hasFlippedCard = false;
    secondCard = this;
    checkForMatch();
  }

  // Vérifie si toutes les cartes ont été trouvées
  function allFlippedCard() {
    const total = cards.length;

    // Les cartes "trouvées" ont la classe .memory-card-shadow
    const matched = document.querySelectorAll(".memory-card.memory-card-shadow").length;

    // Si toutes les cartes sont marquées "trouvées", fin de partie
    if (total > 0 && matched === total) {
      gameContainer.classList.add("win"); // état global (utile pour styles/logic)
      playSound("win");

      // Affiche l’overlay de victoire
      overlay.hidden = false;

      // Joue l’animation Lottie dans l’overlay
      playWinLottie().catch((err) => console.error(err));
    }
  }

  // Réinitialise complètement la partie (appelée au clic sur "Rejouer")
  function restartGame() {
    resetBoard();

    // Important : éviter d’empiler des listeners à chaque redémarrage
    cards.forEach((card) => {
      // Remet l’état visuel à zéro
      card.classList.remove("flip", "memory-card-shadow");

      // Nettoie puis ré-attache le listener de clic
      card.removeEventListener("click", flipCard);
      card.addEventListener("click", flipCard);
    });

    // Stoppe complètement Lottie et le fait disparaître en même temps que l’overlay
    stopWinLottie();

    // Nettoie l’état global + masque l’overlay
    gameContainer.classList.remove("win");
    overlay.hidden = true;

    // Mélange à nouveau les cartes (randomisation)
    shuffleCards(cards);
  }

  // Démarre le jeu (à appeler une seule fois au chargement)
  function mount() {
    // Mélange initial
    shuffleCards(cards);

    // Ajoute le handler de clic sur chaque carte
    cards.forEach((card) => card.addEventListener("click", flipCard));

    // Branche le bouton "Rejouer" (sécurisé contre l’empilement si mount est rappelé)
    replayButton.removeEventListener("click", restartGame);
    replayButton.addEventListener("click", restartGame);

    // État initial (pas de victoire affichée)
    stopWinLottie();
    overlay.hidden = true;
    gameContainer.classList.remove("win");
  }

  // API minimale : le caller fait game.mount()
  return { mount };
}
