import { shuffleCards } from "./shuffle.js";

export function createGame() {
  // Récupère toutes les cartes du DOM et les met dans un tableau
  const cards = Array.from(document.querySelectorAll(".memory-card"));

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
    // On retire les listeners pour empêcher de re-cliquer sur des cartes déjà trouvées
    firstCard?.removeEventListener("click", flipCard);
    secondCard?.removeEventListener("click", flipCard);

    setTimeout(() => {
      // Ajoute une classe pour styliser les cartes matchées (ex: ombre spéciale, grisage, etc.)
      firstCard?.classList.add("memory-card-shadow");
      secondCard?.classList.add("memory-card-shadow");
      resetBoard(); // on prépare le tour suivant
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

  // (TODO) Exemple d’idée : détecter la fin de partie quand toutes les cartes sont matchées
  function allFlippedCard() {
    // Ici tu pourrais vérifier que toutes les cartes sont "désactivées" (ex: plus de listener)
    // ou qu'elles ont une classe "memory-card-shadow", puis déclencher un "win state".
  }

  // API publique du module : on expose juste mount()
  return { mount };
}
