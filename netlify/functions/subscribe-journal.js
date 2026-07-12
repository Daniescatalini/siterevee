const crypto = require("node:crypto");

const RESEND_API_URL = "https://api.resend.com/emails";

const json = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(body),
});

const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const sendNotificationEmail = async ({ name, email, source }) => {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) return { configured: false, ok: false };

  const toEmail = process.env.NEWSLETTER_TO_EMAIL || process.env.APPLICATION_TO_EMAIL || "reveebrand@gmail.com";
  const fromEmail = process.env.RESEND_FROM_EMAIL || "Revee Brand <onboarding@resend.dev>";
  const submittedAt = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
  const safeSource = source || "The Revee Journal";

  const html = `
    <div style="margin:0;padding:34px 20px;background:#f3f3f1;font-family:Arial,Helvetica,sans-serif;color:#111;">
      <div style="max-width:620px;margin:0 auto;padding:38px;background:#fff;border:1px solid #e4e4e1;">
        <p style="margin:0 0 12px;color:#777;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.16em;">The Revee Journal</p>
        <h1 style="margin:0 0 28px;font-size:32px;line-height:1.08;font-weight:400;">Nova inscrição na newsletter</h1>
        <div style="padding:20px 0;border-top:1px solid #e7e7e4;">
          <p style="margin:0 0 6px;color:#777;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;">Nome</p>
          <p style="margin:0;color:#111;font-size:18px;line-height:1.45;">${escapeHtml(name)}</p>
        </div>
        <div style="padding:20px 0;border-top:1px solid #e7e7e4;">
          <p style="margin:0 0 6px;color:#777;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;">E-mail</p>
          <p style="margin:0;color:#111;font-size:18px;line-height:1.45;"><a href="mailto:${escapeHtml(email)}" style="color:#111;">${escapeHtml(email)}</a></p>
        </div>
        <div style="padding:20px 0 0;border-top:1px solid #e7e7e4;">
          <p style="margin:0;color:#777;font-size:13px;line-height:1.6;">Origem: ${escapeHtml(safeSource)}<br />Recebido em: ${escapeHtml(submittedAt)}</p>
        </div>
      </div>
    </div>
  `;

  const text = [
    "NOVA INSCRIÇÃO — THE REVEE JOURNAL",
    "",
    `Nome: ${name}`,
    `E-mail: ${email}`,
    `Origem: ${safeSource}`,
    `Recebido em: ${submittedAt}`,
  ].join("\n");

  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendApiKey}` },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: email,
        subject: `Nova inscrição no Journal — ${name}`,
        html,
        text,
      }),
    });

    if (!response.ok) {
      console.error("Newsletter notification email failed", await response.text());
      return { configured: true, ok: false };
    }

    return { configured: true, ok: true };
  } catch (error) {
    console.error("Newsletter notification email connection failed", error);
    return { configured: true, ok: false };
  }
};

const subscribeToMailchimp = async ({ name, email }) => {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX;
  const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;

  if (!apiKey || !serverPrefix || !audienceId) return { configured: false, ok: false };

  const subscriberHash = crypto.createHash("md5").update(email).digest("hex");
  const endpoint = `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${audienceId}/members/${subscriberHash}`;
  const basePayload = {
    email_address: email,
    status_if_new: "subscribed",
    status: "subscribed",
  };
  const fullPayload = {
    ...basePayload,
    merge_fields: { FNAME: name },
    tags: ["Revee Journal"],
  };

  const sendToMailchimp = async (body) => {
    const response = await fetch(endpoint, {
      method: "PUT",
      headers: {
        Authorization: `Basic ${Buffer.from(`revee:${apiKey}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const result = await response.json();
    return { response, result };
  };

  try {
    const firstAttempt = await sendToMailchimp(fullPayload);
    if (!firstAttempt.response.ok) {
      console.error("Mailchimp subscription failed", { status: firstAttempt.response.status, title: firstAttempt.result.title, detail: firstAttempt.result.detail });
      const fallbackAttempt = await sendToMailchimp(basePayload);
      if (fallbackAttempt.response.ok) return { configured: true, ok: true, fallback: true };
      console.error("Mailchimp fallback subscription failed", { status: fallbackAttempt.response.status, title: fallbackAttempt.result.title, detail: fallbackAttempt.result.detail });
      return { configured: true, ok: false };
    }

    return { configured: true, ok: true };
  } catch (error) {
    console.error("Mailchimp request error", error);
    return { configured: true, ok: false };
  }
};

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Método não permitido." });

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { error: "Dados inválidos." });
  }

  const name = String(payload.name || "").trim();
  const email = String(payload.email || "").trim().toLowerCase();
  const source = String(payload.source || "").trim();
  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!name || !emailIsValid) return json(400, { error: "Preencha seu nome e um e-mail válido." });

  const [notification, mailchimp] = await Promise.all([
    sendNotificationEmail({ name, email, source }),
    subscribeToMailchimp({ name, email }),
  ]);

  if (!notification.configured && !mailchimp.configured) {
    console.error("Newsletter subscription is missing RESEND_API_KEY and Mailchimp environment variables.");
    return json(500, { error: "A inscrição não pôde ser concluída agora. Tente novamente em alguns instantes." });
  }

  if (!notification.ok && !mailchimp.ok) {
    return json(502, { error: "A inscrição não pôde ser concluída agora. Tente novamente em alguns instantes." });
  }

  return json(200, {
    message: "Inscrição confirmada. Em breve você receberá novas perspectivas da Revee.",
    notificationSent: notification.ok,
    mailchimpSubscribed: mailchimp.ok,
  });
};
