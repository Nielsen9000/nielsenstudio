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

/* ==========================================================================
   Background loops (hero + intro)

   The loops carry [autoplay muted loop], but browsers handle off-screen
   autoplay inconsistently — below-the-fold videos (the intro) often never
   start, leaving only the poster image visible. We also don't want to decode
   video that isn't on screen. So: play each only while it's in view, pause it
   when it leaves. Videos hidden by CSS (mobile / reduced-motion) have zero box,
   so the observer never reports them visible and they neither load nor play.
   ========================================================================== */
export function initBackgroundVideos() {
  const videos = document.querySelectorAll("video[data-bg-video]");
  if (!videos.length) return;

  if (!("IntersectionObserver" in window)) {
    videos.forEach(safePlay); // best effort without an observer
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) safePlay(entry.target);
        else entry.target.pause();
      });
    },
    { threshold: 0.1 }
  );
  videos.forEach((v) => io.observe(v));
}

function safePlay(video) {
  video.muted = true; // required for programmatic play to be permitted
  const played = video.play();
  if (played && typeof played.catch === "function") played.catch(() => {});
}
