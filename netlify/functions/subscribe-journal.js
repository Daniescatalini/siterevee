const crypto = require("node:crypto");

const json = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(body),
});

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
  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!name || !emailIsValid) return json(400, { error: "Preencha seu nome e um e-mail válido." });

  const apiKey = process.env.MAILCHIMP_API_KEY;
  const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX;
  const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;

  if (!apiKey || !serverPrefix || !audienceId) {
    console.error("Mailchimp environment variables are missing.");
    return json(500, { error: "A inscrição não pôde ser concluída agora. Tente novamente em alguns instantes." });
  }

  const subscriberHash = crypto.createHash("md5").update(email).digest("hex");
  const endpoint = `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${audienceId}/members/${subscriberHash}`;

  try {
    const response = await fetch(endpoint, {
      method: "PUT",
      headers: {
        Authorization: `Basic ${Buffer.from(`revee:${apiKey}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: email,
        status_if_new: "subscribed",
        status: "subscribed",
        merge_fields: { FNAME: name },
        tags: ["Revee Journal"],
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      console.error("Mailchimp subscription failed", { status: response.status, title: result.title, detail: result.detail });
      return json(502, { error: "A inscrição não pôde ser concluída agora. Tente novamente em alguns instantes." });
    }

    return json(200, { message: "Inscrição confirmada. Em breve você receberá novas perspectivas da Revee." });
  } catch (error) {
    console.error("Mailchimp request error", error);
    return json(502, { error: "A inscrição não pôde ser concluída agora. Tente novamente em alguns instantes." });
  }
};
