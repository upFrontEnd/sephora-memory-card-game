import { shuffleCards } from "./shuffle.js";
import { playSound } from "./sound.js";

export function createGame() {
  const cards = Array.from(document.querySelectorAll(".memory-card"));

  const gameContainer = document.querySelector(".memory-game");
  const overlay = document.querySelector(".win-overlay");
  const replayButton = document.querySelector(".replay-button");

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
      overlay.hidden = false; // affiche l’overlay de victoire + bouton "Rejouer"
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

    // Branche le bouton "Rejouer"
    replayButton.addEventListener("click", restartGame);

    // État initial (pas de victoire affichée)
    overlay.hidden = true;
    gameContainer.classList.remove("win");
  }

  // API minimale : le caller fait game.mount()
  return { mount };
}
