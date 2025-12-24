import { shuffleCards } from "./shuffle.js";
import { playSound } from "./sound.js";
import { initCardsA11y } from "./a11y.js";

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

  /**
   * Remet l’état interne du tour à zéro (qu’il y ait eu match ou non).
   * Ne touche pas à l’état global "win" ni à l’overlay.
   */
  function resetBoard() {
    hasFlippedCard = false;
    lockBoard = false;
    firstCard = null;
    secondCard = null;
  }

  /**
   * Cas "Non match" :
   * - on bloque temporairement le plateau
   * - on re-retourne les deux cartes après un délai 
   */
  function unflipCard() {
    lockBoard = true; // on bloque les clics pendant le "retournement"

    setTimeout(() => {
      firstCard.classList.remove("flip");
      secondCard.classList.remove("flip");
      lockBoard = false; // on ré-autorise les clics après l’animation
    }, 900); 
  }

  /**
   * Cas "match" :
   * - on capture les deux cartes matchées
   * - on enlève leurs listeners de clic (plus cliquables)
   * - on leur applique un style "trouvé" (memory-card-shadow)
   * - on vérifie ensuite si toutes les cartes sont trouvées (victoire)
   */
  function disableCards() {
    lockBoard = true; // bloque les clics pendant qu'on “finalise” le match

    // On capture les références au moment du match pour éviter que
    // firstCard/secondCard soient modifiées avant le setTimeout
    const matchedA = firstCard;
    const matchedB = secondCard;

    matchedA.removeEventListener("click", flipCard);
    matchedB.removeEventListener("click", flipCard);

    setTimeout(() => {
      matchedA.classList.add("memory-card-shadow");
      matchedB.classList.add("memory-card-shadow");

      resetBoard();       // Prépare le tour suivant (et déverrouille le plateau)
      allFlippedCard();   // Vérifie si la partie est gagnée
      playSound("match"); // Son de "match" déclenché après validation du match
    }, 900);
  }

  /**
   * Compare les deux cartes retournées via leur data-attribute
   * (ex: data-product="lipstick").
   * - Si match → on les "gèle" (disableCards)
   * - Sinon → on les re-retourne (unflipCard)
   */
  function checkForMatch() {
    const isMatch = firstCard.dataset.product === secondCard.dataset.product;
    isMatch ? disableCards() : unflipCard();
  }

  /**
   * Handler de clic / activation sur une carte :
   * - ignore si le plateau est verrouillé
   * - ignore si on reclique sur la même carte
   * - gère la logique "1ère carte / 2ème carte", puis lance la comparaison
   */
  function flipCard() {
    // Si le plateau est verrouillé (animation en cours), on ignore le clic
    if (lockBoard) return;

    // Empêche de double-cliquer la même carte comme "2e carte"
    if (this === firstCard) return;

    // On retourne visuellement la carte (CSS: .flip => rotateY(180deg))
    this.classList.add("flip");

    // Son de flip (déclenché à chaque carte retournée)
    playSound("flip");

    // Si c’est la 1ère carte du tour :
    if (!hasFlippedCard) {
      hasFlippedCard = true; // on attend maintenant une 2e carte
      firstCard = this;      // mémorise la 1ère carte
      return;
    }

    // Sinon, c’est la 2e carte :
    hasFlippedCard = false; // le tour est "complet", on repasse à false
    secondCard = this;      // mémorise la 2e carte
    checkForMatch();        // on compare les deux
  }

  /**
   * Affiche l’overlay de victoire et lance l’animation Lottie.
   */
  // function playWinLottie() {
  //   if (!overlay || !lottieEl) return;

  //   overlay.hidden = false;

  //   const start = () => lottieEl.dotLottie?.play?.();
  //   if (lottieEl.dotLottie) {
  //     start();
  //   } else {
  //     lottieEl.addEventListener("ready", start, { once: true });
  //   }
  // }

  /**
   * Vérifie si toutes les cartes ont été trouvées :
   * - on compte le nombre total de cartes
   * - on compte combien ont la classe "memory-card-shadow"
   * - si tous les éléments sont matchés, on passe en mode "win"
   *   (classe .win sur le conteneur + animation Lottie + son de victoire)
   */
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

  /**
   * Réinitialise complètement la partie.
   */
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

  /**
   * Démarre le jeu :
   * - mélange les cartes
   * - attache les listeners de clic sur chaque carte
   * - initialise l’A11y (role, tabindex, clavier)
   * - attache le listener sur le bouton "Rejouer" si présent
   */
  function mount() {
    shuffleCards(cards);

    cards.forEach((card) => {
      card.addEventListener("click", flipCard);
    });

    // A11y : rôle bouton + focus clavier + Enter/Espace
    initCardsA11y(cards);

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
