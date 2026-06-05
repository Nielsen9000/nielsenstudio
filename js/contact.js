/* ==========================================================================
   contact.js — Contact form: validation, submit, and copy-to-clipboard
   Client-side validation + the loading / success / error states for the
   contact form, posting to the /api/contact serverless function (Resend).
   Also wires the "copy email" button in the details column.
   ========================================================================== */

export function initContact() {
  initEmail(); // reconstruct the obfuscated address — independent of the form

  const form = document.querySelector("[data-contact-form]");
  if (!form) return; // contact section not on this page

  const status = form.querySelector("[data-form-status]");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Native constraint validation first — surfaces required/format errors.
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // Honeypot: a bot filled the hidden "company" field. Fake success, send
    // nothing — the server checks this too, but this avoids the request.
    const honeypot = form.elements.company;
    if (honeypot && honeypot.value.trim() !== "") {
      setState(form, status, "success");
      form.reset();
      return;
    }

    setState(form, status, "loading");

    const payload = {
      name: form.elements.name?.value.trim() ?? "",
      email: form.elements.email?.value.trim() ?? "",
      project: form.elements.project?.value ?? "",
      message: form.elements.message?.value.trim() ?? "",
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setState(form, status, "success");
        form.reset();
      } else {
        setState(form, status, "error");
      }
    } catch {
      setState(form, status, "error");
    }
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
    error: "Something went wrong. Please email hello@nielsen.studio.",
  };
  status.textContent = messages[state] ?? "";
}

/**
 * Reconstruct the obfuscated email address at runtime. The HTML source carries
 * only the split parts (data-user / data-domain) plus a human-readable
 * "hello [at] nielsen [dot] studio" fallback — the full address and "@" never
 * appear in the markup. On load we assemble it and apply it to all three
 * touchpoints: visible text, the mailto href, and the copy button's clipboard.
 * No-JS visitors keep the readable fallback (and can still reach me).
 */
function initEmail() {
  // "@" from a char code so the joined address isn't a literal anywhere.
  const join = (el) => el.dataset.user + String.fromCharCode(64) + el.dataset.domain;

  // Reconstruct every obfuscated link (Contact + footer): set the real text and
  // a working mailto. Links missing parts keep their readable [at]/[dot] fallback.
  document.querySelectorAll("[data-user][data-domain]").forEach((link) => {
    const address = join(link);
    link.textContent = address;
    link.setAttribute("href", "mailto:" + address);
  });

  // Copy button (Contact only) → copies the reconstructed Contact address,
  // rebuilt from its parts rather than read from any attribute holding it whole.
  const copyBtn = document.querySelector("[data-copy-email]");
  const emailLink = document.querySelector(".contact__email");
  if (!copyBtn || !emailLink || !emailLink.dataset.user || !emailLink.dataset.domain) return;
  const address = join(emailLink);

  copyBtn.addEventListener("click", async () => {
    if (!navigator.clipboard) return;
    try {
      // Copy the reconstructed address — not any attribute holding it.
      await navigator.clipboard.writeText(address);
      const original = copyBtn.dataset.label ?? copyBtn.textContent.trim();
      copyBtn.dataset.label = original;
      copyBtn.textContent = "Copied";
      copyBtn.classList.add("is-copied");
      window.setTimeout(() => {
        copyBtn.textContent = copyBtn.dataset.label;
        copyBtn.classList.remove("is-copied");
      }, 1600);
    } catch {
      /* clipboard unavailable (e.g. insecure context) — no-op */
    }
  });
}
