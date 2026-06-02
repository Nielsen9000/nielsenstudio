/* ==========================================================================
   contact.js — Contact form: validation + interaction states
   Handles client-side validation and the loading / success / error states
   for the low-friction contact CTA. Wired to a real endpoint in the contact
   build step; until then it validates and simulates a submit safely.
   ========================================================================== */

export function initContact() {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return; // contact section not on this page yet

  const status = form.querySelector("[data-form-status]");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Native constraint validation first — surfaces required/format errors.
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setState(form, status, "loading");

    // Placeholder submit. Replaced with a real fetch() to the form endpoint
    // (e.g. Vercel function / form service) in the contact build step.
    Promise.resolve().then(() => setState(form, status, "success"));
  });
}

/**
 * @param {HTMLFormElement} form
 * @param {HTMLElement|null} status
 * @param {"idle"|"loading"|"success"|"error"} state
 */
function setState(form, status, state) {
  form.dataset.state = state;
  if (!status) return;

  const messages = {
    idle: "",
    loading: "Sending…",
    success: "Thanks — I'll be in touch shortly.",
    error: "Something went wrong. Please email hello@nielsens.studio.",
  };
  status.textContent = messages[state] ?? "";
}
