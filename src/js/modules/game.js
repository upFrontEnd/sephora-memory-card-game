import { shuffleCards } from "./shuffle.js";

export function createGame() {
  const cards = Array.from(document.querySelectorAll(".memory-card"));
  const gameContainer = document.querySelector(".memory-game");

  // === Etat du jeu ===
  let hasFlippedCard = false; // indique si on a déjà retourné 1 carte (en attente de la 2e)
  let lockBoard = false;      // bloque les clics pendant les animations (évite de casser l’état)
  let firstCard = null;       // référence DOM de la 1ère carte retournée
  let secondCard = null;      // référence DOM de la 2e carte retournée

  // Remet l’état à zéro après un tour (match ou non)
  function resetBoard() {
    hasFlippedCard = false;
    lockBoard = false;
    firstCard = null;
    secondCard = null;
  }

  // Cas "pas match" : on re-retourne les deux cartes après un délai (le temps de voir)
  function unflipCard() {
    lockBoard = true; // on bloque les clics pendant le "retournement"

    setTimeout(() => {
      // ?. évite une erreur si firstCard/secondCard est null (sécurité)
      firstCard?.classList.remove("flip");
      secondCard?.classList.remove("flip");
      lockBoard = false; // on ré-autorise les clics
    }, 900); // 900ms = correspond à la durée/ressenti de l’animation CSS
  }

  // Cas "match" : on désactive les cartes (plus cliquables) puis on marque visuellement le match
  function disableCards() {
    lockBoard = true; // bloque les clics pendant qu'on “finalise” le match
  
    // ✅ on capture les références au moment du match
    const matchedA = firstCard;
    const matchedB = secondCard;
  
    matchedA?.removeEventListener("click", flipCard);
    matchedB?.removeEventListener("click", flipCard);
  
    setTimeout(() => {
      matchedA?.classList.add("memory-card-shadow");
      matchedB?.classList.add("memory-card-shadow");
  
      resetBoard();      // prépare le tour suivant (déverrouille aussi)
      allFlippedCard();  // check victoire -> ajoute .win si besoin
    }, 900);
  }

  // Compare les deux cartes via leur data-attribute (ex: data-product="lipstick")
  function checkForMatch() {
    const isMatch = firstCard?.dataset.product === secondCard?.dataset.product;
    // Si match -> on les "gèle", sinon on les "dé-flip"
    isMatch ? disableCards() : unflipCard();
  }

  // Handler de clic sur une carte
  function flipCard() {
    // Si le plateau est verrouillé (animation en cours), on ignore le clic
    if (lockBoard) return;

    // Empêche de double-cliquer la même carte comme "2e carte"
    if (this === firstCard) return;

    // On retourne la carte (CSS: .flip => rotateY(180deg))
    this.classList.add("flip");

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

  // Démarre le jeu : mélange puis attache les listeners
  function mount() {
    shuffleCards(cards);
    cards.forEach((card) => card.addEventListener("click", flipCard));
  }

  function playWinLottie() {
    const overlay = document.querySelector(".win-overlay");
    const el = document.querySelector("#win-lottie");
    if (!overlay || !el) return;
  
    overlay.hidden = false;
  
    const start = () => el.dotLottie?.play?.();
    if (el.dotLottie) start();
    else el.addEventListener("ready", start, { once: true });
  }  

  function allFlippedCard() {
    // Déjà gagné → on ne refait rien
    if (gameContainer.classList.contains("win")) return;
  
    const total = cards.length;
    const matched = document.querySelectorAll(".memory-card.memory-card-shadow").length;
  
    // Sécurité: si total = 0, on ne déclenche jamais la victoire
    if (total > 0 && matched === total) {
      gameContainer.classList.add("win");
      playWinLottie();
    }
  }

  // API publique du module : on expose juste mount()
  return { mount };
}
