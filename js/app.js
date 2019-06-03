const cards = document.querySelectorAll(".memory-card");

let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;

function flipCard() {
  if (lockBoard) return;
  if (this === firstCard) return;

  this.classList.add("flip");

  if (!hasFlippedCard) {
    // First Click on a card
    hasFlippedCard = true;
    firstCard = this;
    return;
  }

  // Second Click
  hasFlippedCard = false;
  secondCard = this;

  checkForMatch();
}

function checkForMatch() {
  let isMatch = firstCard.dataset.product === secondCard.dataset.product;
  // Do card match ?
  isMatch ? disableCards() : unflipCard();
}

function disableCards() {
  firstCard.removeEventListener("click", flipCard);
  secondCard.removeEventListener("click", flipCard);

  setTimeout(() => {
    firstCard.classList.add('memory-card-shadow');
    secondCard.classList.add('memory-card-shadow');
    resetBoard();
  }, 900);

}

function unflipCard() {
  lockBoard = true;
  setTimeout(() => {
    firstCard.classList.remove("flip");
    secondCard.classList.remove("flip");

    lockBoard = false;
  }, 900);
}

function resetBoard() {
  [hasFlippedCard, lockBoard] = [false, false];
  [firstCard, secondCard] = [null, null];
}

(function shuffle() {
  cards.forEach(card => {
    let randomPos = Math.floor(Math.random() * 12);
    card.style.order = randomPos; // Flexbos order
  });
})(); // IIFE

cards.forEach(card => card.addEventListener("click", flipCard));