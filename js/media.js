/* ==========================================================================
   media.js — Graceful placeholders for not-yet-delivered assets

   Images that haven't been produced are referenced at their stable paths
   (per assets/ASSETS.md) but won't exist on disk yet. Rather than show a
   broken-image icon, mark the wrapping figure [data-missing] so CSS renders a
   labelled placeholder at the correct aspect ratio — no layout shift when the
   real file is later dropped in (the load simply succeeds and the label hides).

   Opt in: <figure data-media data-label="filename — note"><img data-fallback-img …></figure>
   ========================================================================== */

export function initMediaFallback() {
  const images = document.querySelectorAll("img[data-fallback-img]");
  images.forEach((img) => {
    // Already failed before this script ran (cached 404 / instant error).
    if (img.complete && img.naturalWidth === 0) {
      markMissing(img);
      return;
    }
    img.addEventListener("error", () => markMissing(img), { once: true });
    img.addEventListener(
      "load",
      () => {
        // A 0×0 "successful" load also means no real image.
        if (img.naturalWidth === 0) markMissing(img);
      },
      { once: true }
    );
  });
}

function markMissing(img) {
  const figure = img.closest("[data-media]");
  if (figure) figure.setAttribute("data-missing", "");
}
