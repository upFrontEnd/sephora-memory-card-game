export function shuffleCards(cards) {
    const total = cards.length;
    cards.forEach((card) => {
      card.style.order = Math.floor(Math.random() * total);
    });
  }
  