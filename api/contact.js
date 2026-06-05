/* ==========================================================================
   /api/contact.js — Vercel serverless function: contact form → Resend

   POST { name, email, project, message }  (plus a "company" honeypot).
   Sends the enquiry as an email via the Resend REST API. No npm deps — uses
   the global fetch available on Vercel's Node runtime. CommonJS so it loads
   without a package.json ("type":"module").

   Set RESEND_API_KEY in the Vercel project env vars before launch. It is never
   committed; if it's missing the function fails loudly (500) rather than
   silently dropping messages.
   ========================================================================== */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = async function handler(req, res) {
  // POST only.
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  // Body may arrive parsed (Vercel) or as a raw string — handle both.
  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  body = body || {};

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const project = String(body.project || "").trim();
  const message = String(body.message || "").trim();
  const company = String(body.company || "").trim(); // honeypot

  // Honeypot: a bot filled the hidden field — pretend success, send nothing.
  if (company) {
    return res.status(200).json({ ok: true });
  }

  // Validate.
  if (!name || !message || !EMAIL_RE.test(email)) {
    return res
      .status(400)
      .json({ ok: false, error: "Please provide a name, a valid email, and a message." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("Contact form: RESEND_API_KEY is not set.");
    return res
      .status(500)
      .json({ ok: false, error: "Email service is not configured." });
  }

  const subject = `New enquiry — ${project || "general"} — ${name}`;
  const text = [
    "New enquiry from the Nielsen Studio site",
    "",
    `Name:    ${name}`,
    `Email:   ${email}`,
    `Project: ${project || "—"}`,
    "",
    "Message:",
    message,
  ].join("\n");

  try {
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Nielsen Studio <noreply@nielsen.studio>",
        to: ["hello@nielsen.studio"],
        reply_to: email,
        subject,
        text,
      }),
    });

    if (!resendRes.ok) {
      const detail = await resendRes.text().catch(() => "");
      console.error("Resend error:", resendRes.status, detail);
      return res.status(500).json({ ok: false, error: "Failed to send message." });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Contact form send failed:", err);
    return res.status(500).json({ ok: false, error: "Failed to send message." });
  }
};
