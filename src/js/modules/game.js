import { shuffleCards } from "./shuffle.js";

export function createGame() {
  const cards = Array.from(document.querySelectorAll(".memory-card"));

  let hasFlippedCard = false;
  let lockBoard = false;
  let firstCard = null;
  let secondCard = null;

  function resetBoard() {
    hasFlippedCard = false;
    lockBoard = false;
    firstCard = null;
    secondCard = null;
  }

  function unflipCard() {
    lockBoard = true;

    setTimeout(() => {
      firstCard?.classList.remove("flip");
      secondCard?.classList.remove("flip");
      lockBoard = false;
    }, 900);
  }

  function disableCards() {
    firstCard?.removeEventListener("click", flipCard);
    secondCard?.removeEventListener("click", flipCard);

    setTimeout(() => {
      firstCard?.classList.add("memory-card-shadow");
      secondCard?.classList.add("memory-card-shadow");
      resetBoard();
    }, 900);
  }

  function checkForMatch() {
    const isMatch = firstCard?.dataset.product === secondCard?.dataset.product;
    isMatch ? disableCards() : unflipCard();
  }

  function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;

    this.classList.add("flip");

    if (!hasFlippedCard) {
      hasFlippedCard = true;
      firstCard = this;
      return;
    }

    hasFlippedCard = false;
    secondCard = this;
    checkForMatch();
  }

  function mount() {
    shuffleCards(cards);
    cards.forEach((card) => card.addEventListener("click", flipCard));
  }

  return { mount };
}
