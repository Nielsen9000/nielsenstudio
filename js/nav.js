/* ==========================================================================
   nav.js — Scroll-spy: highlight the nav link of the section in view

   An IntersectionObserver watches each section that has a matching nav link and
   toggles .is-active on that link when the section crosses the centre of the
   viewport. The root is shrunk to a thin central band (rootMargin -45%/-45%),
   so "active" is whichever section the reader is actually looking at.

   The section id is read from each link's href (#work → work), so no extra
   markup is needed. Sections without a matching link (e.g. the hero, intro)
   are simply not observed — at the top of the page nothing is highlighted.
   ========================================================================== */

export function initNav() {
  const navLinks = document.querySelectorAll('.site-nav a[href^="#"]');
  if (!navLinks.length || !("IntersectionObserver" in window)) return;

  // Map a section id → its nav link (only ids that actually have a link).
  const linkFor = new Map();
  navLinks.forEach((link) => {
    const id = link.getAttribute("href").slice(1);
    if (id) linkFor.set(id, link);
  });

  function setActive(link) {
    navLinks.forEach((l) => l.classList.toggle("is-active", l === link));
  }

  // Track which linked sections are currently in the central band and recompute
  // on every change. Marking active only on isIntersecting left the last link
  // stuck lit after you scrolled back above it (up into the hero/Studio, which
  // have no link). Instead: highlight the first linked section in the band, or
  // clear everything when none is — so nothing is highlighted at the top.
  const inBand = new Set();
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) inBand.add(entry.target.id);
        else inBand.delete(entry.target.id);
      });
      let current = null;
      for (const [id, link] of linkFor) {
        if (inBand.has(id)) {
          current = link;
          break;
        }
      }
      setActive(current); // null clears all links
    },
    // Active = the section occupying the central ~10% band of the viewport.
    { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
  );

  linkFor.forEach((_link, id) => {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  });
}

/**
 * Header scroll state: toggle .is-scrolled so the bar goes from invisible
 * (clean over the hero) to a frosted-glass strip. We watch the hero itself with
 * an IntersectionObserver — the header stays fully transparent for the whole
 * hero, whatever its height, and only materializes once the hero has scrolled
 * out of view. No per-frame scroll work; the observer fires only on crossing.
 */
export function initHeader() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const hero = document.querySelector(".hero");

  if (hero && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        header.classList.toggle("is-scrolled", !entry.isIntersecting);
      },
      { threshold: 0 }
    );
    observer.observe(hero); // fires immediately, so the initial state is correct
    return;
  }

  // Fallback (no hero element or no IO support): a simple, rAF-coalesced
  // scroll threshold that only ever toggles the class.
  let ticking = false;
  const update = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 40);
    ticking = false;
  };
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true }
  );
  update();
}
