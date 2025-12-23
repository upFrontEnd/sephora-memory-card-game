import { shuffleCards } from "./shuffle.js";
import { playSound } from "./sound.js";

export function createGame() {
  const cards = Array.from(document.querySelectorAll(".memory-card"));

  const gameContainer = document.querySelector(".memory-game");
  const overlay = document.querySelector(".win-overlay");
  const lottieEl = document.querySelector("#win-lottie");
  const replayButton = document.querySelector(".replay-button");

  // === Etat du jeu ===
  let hasFlippedCard = false; // indique si on a déjà retourné 1 carte (en attente de la 2e)
  let lockBoard = false;      // true = le plateau est verrouillé pendant une animation, false = clics autorisés
  let firstCard = null;       // référence DOM de la 1ère carte retournée
  let secondCard = null;      // référence DOM de la 2e carte retournée

  // Remet l’état interne du tour à zéro (match ou non)
  function resetBoard() {
    hasFlippedCard = false;
    lockBoard = false;
    firstCard = null;
    secondCard = null;
  }

  /**
   * Cas "non match" :
   * - on bloque temporairement le plateau
   * - on re-retourne les deux cartes après un délai
   */
  function unflipCard() {
    lockBoard = true;

    setTimeout(() => {
      firstCard.classList.remove("flip");
      secondCard.classList.remove("flip");
      lockBoard = false;
    }, 900);
  }

  /**
   * Cas "match" :
   * - on enlève les listeners
   * - on marque les cartes comme trouvées
   * - on vérifie si la partie est gagnée
   */
  function disableCards() {
    lockBoard = true;

    const matchedA = firstCard;
    const matchedB = secondCard;

    matchedA.removeEventListener("click", flipCard);
    matchedB.removeEventListener("click", flipCard);

    setTimeout(() => {
      matchedA.classList.add("memory-card-shadow");
      matchedB.classList.add("memory-card-shadow");

      resetBoard();
      allFlippedCard();
      playSound("match");
    }, 900);
  }

  // Compare les deux cartes retournées
  function checkForMatch() {
    const isMatch = firstCard.dataset.product === secondCard.dataset.product;
    isMatch ? disableCards() : unflipCard();
  }

  // Handler de clic sur une carte
  function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;

    this.classList.add("flip");
    playSound("flip");

    if (!hasFlippedCard) {
      hasFlippedCard = true;
      firstCard = this;
      return;
    }

    hasFlippedCard = false;
    secondCard = this;
    checkForMatch();
  }

  // Affiche l’overlay de victoire et lance l’animation Lottie
  function playWinLottie() {
    if (!overlay || !lottieEl) return;

    overlay.hidden = false;

    const start = () => lottieEl.dotLottie?.play?.();
    if (lottieEl.dotLottie) {
      start();
    } else {
      lottieEl.addEventListener("ready", start, { once: true });
    }
  }

  // Vérifie si toutes les cartes ont été trouvées
  function allFlippedCard() {
    if (!gameContainer) return;

    if (gameContainer.classList.contains("win")) return;

    const total = cards.length;
    const matched = document.querySelectorAll(".memory-card.memory-card-shadow").length;

    if (total > 0 && matched === total) {
      gameContainer.classList.add("win");
      playSound("win");
      playWinLottie();
    }
  }

  // Réinitialise complètement la partie
  function restartGame() {
    resetBoard();

    cards.forEach((card) => {
      card.classList.remove("flip", "memory-card-shadow");
      card.addEventListener("click", flipCard);
    });

    if (gameContainer) {
      gameContainer.classList.remove("win");
    }

    if (overlay) {
      overlay.hidden = true;
    }
    if (lottieEl?.dotLottie) {
      lottieEl.dotLottie.stop();
    }

    shuffleCards(cards);
  }

  // Démarre le jeu
  function mount() {
    shuffleCards(cards);
    cards.forEach((card) => card.addEventListener("click", flipCard));

    if (replayButton) {
      replayButton.addEventListener("click", restartGame);
    }

    if (overlay) {
      overlay.hidden = true;
    }
    if (gameContainer) {
      gameContainer.classList.remove("win");
    }
  }

  return { mount };
}
