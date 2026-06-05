/* ==========================================================================
   contact.js — Contact form: validation, submit, and copy-to-clipboard
   Client-side validation + the loading / success / error states for the
   contact form, posting to the /api/contact serverless function (Resend).
   Also wires the "copy email" button in the details column.
   ========================================================================== */

export function initContact() {
  wireCopyButtons(); // independent of the form — runs even if it's absent

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
 * Wire any [data-copy] button to copy its value to the clipboard and flash a
 * short "Copied" confirmation. Used by the contact details' email address.
 */
function wireCopyButtons() {
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const text = btn.getAttribute("data-copy");
      if (!text || !navigator.clipboard) return;

      try {
        await navigator.clipboard.writeText(text);
        const original = btn.dataset.label ?? btn.textContent.trim();
        btn.dataset.label = original;
        btn.textContent = "Copied";
        btn.classList.add("is-copied");
        window.setTimeout(() => {
          btn.textContent = btn.dataset.label;
          btn.classList.remove("is-copied");
        }, 1600);
      } catch {
        /* clipboard unavailable (e.g. insecure context) — no-op */
      }
    });
  });
}
