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
  let lockBoard = false;      // bloque les clics pendant les animations (évite de casser l’état)
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
   * Cas "pas match" :
   * - on bloque temporairement le plateau
   * - on joue le son d'unflip
   * - on re-retourne les deux cartes après un délai (le temps de les voir)
   */
  function unflipCard() {
    lockBoard = true; // on bloque les clics pendant le "retournement"

    // Son spécifique pour le cas "raté"
    playSound("unflip");

    setTimeout(() => {
      // `?.` évite une erreur si firstCard/secondCard est null (sécurité)
      firstCard?.classList.remove("flip");
      secondCard?.classList.remove("flip");
      lockBoard = false; // on ré-autorise les clics après l’animation
    }, 900); // 900ms ≈ durée de l’animation CSS de flip
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

    matchedA?.removeEventListener("click", flipCard);
    matchedB?.removeEventListener("click", flipCard);

    // Son de "match" déclenché immédiatement après la validation du match
    playSound("match");

    setTimeout(() => {
      matchedA?.classList.add("memory-card-shadow");
      matchedB?.classList.add("memory-card-shadow");

      resetBoard();      // prépare le tour suivant (et déverrouille le plateau)
      allFlippedCard();  // vérifie si la partie est gagnée
    }, 900);
  }

  /**
   * Compare les deux cartes retournées via leur data-attribute
   * (ex: data-product="lipstick").
   * - Si match → on les "gèle" (disableCards)
   * - Sinon → on les re-retourne (unflipCard)
   */
  function checkForMatch() {
    const isMatch = firstCard?.dataset.product === secondCard?.dataset.product;
    isMatch ? disableCards() : unflipCard();
  }

  /**
   * Handler de clic sur une carte :
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
   * - Affiche le conteneur .win-overlay
   * - Attend que dotLottie soit prêt pour lancer l’animation si nécessaire
   */
  function playWinLottie() {
    if (!overlay || !lottieEl) return;

    // Affiche l’overlay
    overlay.hidden = false;

    // Quand l’instance dotLottie est prête, on lance l’animation
    const start = () => lottieEl.dotLottie?.play?.();
    if (lottieEl.dotLottie) {
      start();
    } else {
      lottieEl.addEventListener("ready", start, { once: true });
    }
  }

  /**
   * Vérifie si toutes les cartes ont été trouvées :
   * - on compte le nombre total de cartes
   * - on compte combien ont la classe "memory-card-shadow"
   * - si tous les éléments sont matchés, on passe en mode "win"
   *   (classe .win sur le conteneur + animation Lottie + son de victoire)
   */
  function allFlippedCard() {
    // Sécurité : si le conteneur n’existe pas, on sort
    if (!gameContainer) return;

    // Si la victoire a déjà été déclarée, on ne refait rien
    if (gameContainer.classList.contains("win")) return;

    const total = cards.length;
    const matched = document.querySelectorAll(".memory-card.memory-card-shadow").length;

    // Sécurité: si total = 0, on ne déclenche jamais la victoire
    if (total > 0 && matched === total) {
      gameContainer.classList.add("win");

      // Son de victoire
      playSound("win");

      // Animation de victoire
      playWinLottie();
    }
  }

  /**
   * Réinitialise complètement la partie :
   * - remet l’état interne à zéro
   * - enlève les classes "flip" et "memory-card-shadow" sur toutes les cartes
   * - supprime l’état "win" sur le conteneur
   * - masque l’overlay et stoppe l’animation Lottie
   * - remélange les cartes et réattache les listeners de clic
   */
  function restartGame() {
    // Réinitialise l’état interne
    resetBoard();

    // Nettoie les classes visuelles et réactive les clics sur chaque carte
    cards.forEach((card) => {
      card.classList.remove("flip", "memory-card-shadow");
      card.addEventListener("click", flipCard);
    });

    // Supprime l’état de victoire sur le plateau
    if (gameContainer) {
      gameContainer.classList.remove("win");
    }

    // Masque l’overlay et stoppe Lottie
    if (overlay) {
      overlay.hidden = true;
    }
    if (lottieEl?.dotLottie) {
      lottieEl.dotLottie.stop();
      // Optionnel : revenir au début de l’anim
      // lottieEl.dotLottie.goToAndStop(0, true);
    }

    // Nouveau mélange
    shuffleCards(cards);
  }

  /**
   * Démarre le jeu :
   * - mélange les cartes
   * - attache les listeners de clic sur chaque carte
   * - attache le listener sur le bouton "Rejouer" si présent
   */
  function mount() {
    shuffleCards(cards);
    cards.forEach((card) => card.addEventListener("click", flipCard));

    if (replayButton) {
      replayButton.addEventListener("click", restartGame);
    }

    // On s’assure que l’overlay est bien masqué au premier lancement
    if (overlay) {
      overlay.hidden = true;
    }
    if (gameContainer) {
      gameContainer.classList.remove("win");
    }
  }

  // API publique du module : on expose juste `mount()`
  return { mount };
}
