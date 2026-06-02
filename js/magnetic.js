/* ==========================================================================
   magnetic.js — Magnetic buttons (GSAP quickTo on pointermove)
   Taste-skill's "magnetic button" translated from Framer to GSAP: the element
   eases toward the cursor while hovered, then springs back on leave.
   Opt in with [data-magnetic]. Pointer-only; skipped under reduced motion.
   ========================================================================== */

/**
 * @param {{ reducedMotion: boolean }} opts
 */
export function initMagnetic({ reducedMotion }) {
  const gsap = window.gsap;
  if (reducedMotion || !gsap) return;

  // Skip on touch / coarse pointers — no cursor to track.
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const targets = document.querySelectorAll("[data-magnetic]");
  targets.forEach((el) => attachMagnet(gsap, el));
}

function attachMagnet(gsap, el) {
  const strength = parseFloat(el.dataset.magnetic) || 0.35;
  const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" });
  const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });

  function onMove(e) {
    const r = el.getBoundingClientRect();
    const relX = e.clientX - (r.left + r.width / 2);
    const relY = e.clientY - (r.top + r.height / 2);
    xTo(relX * strength);
    yTo(relY * strength);
  }

  function onLeave() {
    xTo(0);
    yTo(0);
  }

  el.addEventListener("pointermove", onMove);
  el.addEventListener("pointerleave", onLeave);
}
