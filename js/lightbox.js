/* ==========================================================================
   lightbox.js — Document cover preview

   The document cards in the case studies are cover images (there are no separate
   PDF files yet), so a click ENLARGES the cover in a simple overlay rather than
   opening a file. One overlay is built once and reused for every card.

   Accessible: each card becomes a button (focusable + Enter/Space), the dialog
   takes focus on open, Escape / backdrop / close-button all dismiss, focus
   returns to the card that opened it, and page scroll is locked while open.

   No GSAP/Three dependency — runs even if those CDNs fail.
   ========================================================================== */

export function initLightbox() {
  const cards = document.querySelectorAll(".case__doc-card");
  if (!cards.length) return;

  // One reusable overlay for the whole page.
  const overlay = document.createElement("div");
  overlay.className = "lightbox";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Document preview");
  overlay.innerHTML =
    '<button class="lightbox__close" type="button" aria-label="Close preview">&times;</button>' +
    '<img class="lightbox__img" alt="" />';
  document.body.appendChild(overlay);

  const img = overlay.querySelector(".lightbox__img");
  const closeBtn = overlay.querySelector(".lightbox__close");
  let lastFocused = null;

  function open(card) {
    const cardImg = card.querySelector("img");
    if (!cardImg) return;
    img.src = cardImg.currentSrc || cardImg.src;
    const cap = card.querySelector(".case__doc-label");
    img.alt = cardImg.alt || (cap ? cap.textContent.trim() : "");

    lastFocused = document.activeElement;
    overlay.classList.add("is-open"); // CSS handles the fade + visibility
    document.documentElement.style.overflow = "hidden"; // lock scroll
    closeBtn.focus();
    document.addEventListener("keydown", onKey);
  }

  function close() {
    overlay.classList.remove("is-open");
    document.documentElement.style.overflow = "";
    document.removeEventListener("keydown", onKey);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function onKey(e) {
    if (e.key === "Escape") {
      close();
    } else if (e.key === "Tab") {
      // Minimal focus trap: the close button is the only stop.
      e.preventDefault();
      closeBtn.focus();
    }
  }

  // Backdrop click closes; clicking the image itself does not.
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  closeBtn.addEventListener("click", close);

  // Turn each cover card into a button that opens the preview.
  cards.forEach((card) => {
    card.classList.add("is-zoomable");
    card.setAttribute("role", "button");
    card.tabIndex = 0;
    const cap = card.querySelector(".case__doc-label");
    card.setAttribute(
      "aria-label",
      "Enlarge" + (cap ? ": " + cap.textContent.trim() : " document cover")
    );
    card.addEventListener("click", () => open(card));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open(card);
      }
    });
  });
}
