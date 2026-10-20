/* Hall of Fame filter. Without JS, every card simply stays visible. */
(function () {
  const grid = document.getElementById("hof-grid");
  const buttons = document.querySelectorAll(".hof-filter");
  if (!grid || !buttons.length) return;
  const cards = grid.querySelectorAll(".hof-card");
  const FADE_MS = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 200;
  let timer;

  function apply(filter) {
    cards.forEach((card) => {
      card.hidden = !(filter === "all" || card.dataset.category === filter);
    });
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => {
        const on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", String(on));
      });
      clearTimeout(timer);
      grid.classList.add("is-fading");
      timer = setTimeout(() => {
        apply(btn.dataset.filter);
        grid.classList.remove("is-fading");
      }, FADE_MS);
    });
  });
})();
