/* ==========================================================================
   animations.js — GSAP / ScrollTrigger

   Home of the SIGNATURE motion: a weighty fade + short rise, ~0.9s, power3.out,
   line-by-line stagger. It is established here in the hero intro and then reused
   for every [data-reveal] on scroll, so the whole site moves as one.

   GSAP/ScrollTrigger load from CDN as globals (window.gsap / ScrollTrigger).
   ========================================================================== */

// Signature constants — change here and the whole site's motion follows.
const SIGNATURE = {
  duration: 0.9,
  ease: "power3.out",
  y: 24, // matches --reveal-y in tokens.css
  stagger: 0.09,
};

/**
 * @param {{ reducedMotion: boolean }} opts
 */
export function initAnimations({ reducedMotion }) {
  const gsap = window.gsap;

  // Reduced motion or missing CDN: leave the static, fully-visible page as-is.
  if (reducedMotion || !gsap) return;

  if (window.ScrollTrigger) {
    gsap.registerPlugin(window.ScrollTrigger);
  }

  initHeroIntro(gsap);
  revealOnScroll(gsap);
}

/* The intro background used to run a scrub-driven parallax, but the smoke video
   already supplies the motion. Transforming that filtered, always-playing video
   layer on every scroll frame just cost frames for no real gain, so it's gone. */

/**
 * The hero intro — plays on load, above the fold. This is where the signature
 * movement is defined; everything else echoes it. The 3D canvas fades in
 * underneath the text so the words land first, then the material resolves.
 */
function initHeroIntro(gsap) {
  const hero = document.querySelector("[data-hero-intro]");
  if (!hero) return;

  const lines = hero.querySelectorAll("[data-reveal]");
  const canvas = document.querySelector("[data-hero-canvas]");

  const tl = gsap.timeline({
    defaults: { ease: SIGNATURE.ease, duration: SIGNATURE.duration },
  });

  tl.to(lines, {
    opacity: 1,
    y: 0,
    stagger: SIGNATURE.stagger,
  });

  // Canvas (live render or static fallback) eases in slightly behind the text.
  if (canvas) {
    tl.fromTo(
      canvas,
      { opacity: 0 },
      { opacity: 1, duration: 1.2 },
      0.25 // overlap: starts a beat after the first line rises
    );
  }
}

/**
 * Every [data-reveal] outside the hero replays the signature movement as it
 * enters the viewport. A parent [data-reveal-stagger] staggers its children
 * (line-by-line text reveals); standalone elements reveal on their own.
 */
function revealOnScroll(gsap) {
  if (!window.ScrollTrigger) return;

  // Grouped (staggered) reveals — but never the hero, which plays on load.
  const groups = document.querySelectorAll(
    "[data-reveal-stagger]:not([data-hero-intro])"
  );
  groups.forEach((group) => {
    const items = group.querySelectorAll("[data-reveal]");
    gsap.to(items, {
      opacity: 1,
      y: 0,
      duration: SIGNATURE.duration,
      ease: SIGNATURE.ease,
      stagger: SIGNATURE.stagger,
      scrollTrigger: { trigger: group, start: "top 80%", once: true },
    });
  });

  // Standalone reveals: any [data-reveal] not inside a stagger group or hero.
  const singles = document.querySelectorAll(
    "[data-reveal]:not([data-reveal-stagger] [data-reveal]):not([data-hero-intro] [data-reveal])"
  );
  singles.forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: SIGNATURE.duration,
      ease: SIGNATURE.ease,
      scrollTrigger: { trigger: el, start: "top 85%", once: true },
    });
  });
}
