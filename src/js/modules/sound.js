export function initSoundToggle() {
    const button = document.querySelector(".sound-toggle");
    if (!button) return;
  
    let isOn = false; // état initial : son coupé
  
    function render() {
      if (isOn) {
        button.classList.add("sound-toggle--on");
        button.setAttribute("aria-pressed", "true");
        button.setAttribute("aria-label", "Désactiver le son");
      } else {
        button.classList.remove("sound-toggle--on");
        button.setAttribute("aria-pressed", "false");
        button.setAttribute("aria-label", "Activer le son");
      }
  
      // TODO plus tard : brancher ici la logique globale de son (muted / unmuted)
    }
  
    button.addEventListener("click", () => {
      isOn = !isOn;
      render();
    });
  
    render();
  }
  