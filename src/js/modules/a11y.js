/**
 * Rend une carte de memory accessible :
 * - role="button" (si non déjà présent dans le HTML)
 * - focusable au clavier (Tab)
 * - activation clavier avec Entrée / Espace (simule un clic)
 */
export function enhanceMemoryCard(card) {
    if (!card) return;
  
    // Sémantique minimale (ne gêne pas si déjà défini dans le HTML)
    if (!card.hasAttribute("role")) {
      card.setAttribute("role", "button");
    }
    if (!card.hasAttribute("tabindex")) {
      card.setAttribute("tabindex", "0");
    }
  
    function handleKeyDown(event) {
      const { key } = event;
      if (key === "Enter" || key === " ") {
        event.preventDefault();
        card.click(); // déclenche la même logique que le clic souris
      }
    }
  
    card.addEventListener("keydown", handleKeyDown);
  }
  
  /**
   * Initialise l’accessibilité pour une liste de cartes.
   */
  export function initCardsA11y(cards) {
    cards.forEach((card) => enhanceMemoryCard(card));
  }
  