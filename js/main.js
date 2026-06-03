/* ==========================================================================
   main.js — Entry point
   Boots the site: detects motion preference, then wires up modules.
   Loaded as a module (see index.html). Each feature lives in its own file
   and exports an init() that is safe to call once on a ready DOM.
   ========================================================================== */

import { initAnimations } from "./animations.js";
import { initHero3D } from "./hero3d.js";
import { initMagnetic } from "./magnetic.js";
import { initContact } from "./contact.js";
import { initMediaFallback, initBackgroundVideos } from "./media.js";
import { initNav } from "./nav.js";

/* Single source of truth for "may we animate?".
   Read live so a user toggling the OS setting is respected on next load.     */
export const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

function boot() {
  const root = document.documentElement;

  /* Gate the signature reveal: only hide-then-animate when motion is allowed.
     Without this class, [data-reveal] content stays visible (see sections.css)
     so reduced-motion and no-JS users get a complete, static page.           */
  if (!prefersReducedMotion) {
    root.classList.add("is-ready");
  }

  /* Each init is defensive: it no-ops if its target isn't on the page or if
     its dependency (GSAP / Three.js) failed to load from the CDN.            */
  initMediaFallback(); // independent of motion — always run
  initBackgroundVideos(); // play hero/intro loops when they scroll into view
  initNav(); // scroll-spy: highlight the current section's nav link
  initAnimations({ reducedMotion: prefersReducedMotion });
  initHero3D({ reducedMotion: prefersReducedMotion });
  initMagnetic({ reducedMotion: prefersReducedMotion });
  initContact();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
