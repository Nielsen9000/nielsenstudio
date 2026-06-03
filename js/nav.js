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

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(linkFor.get(entry.target.id));
      });
    },
    // Active = the section occupying the central ~10% band of the viewport.
    { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
  );

  linkFor.forEach((_link, id) => {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  });
}
