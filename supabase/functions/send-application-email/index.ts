const RESEND_API_URL = "https://api.resend.com/emails";

type Application = Record<string, string>;

const labels: Record<string, string> = {
  name: "Nome",
  email: "E-mail",
  whatsapp: "WhatsApp",
  city: "Cidade",
  company_name: "Empresa",
  instagram: "Instagram",
  website: "Site",
  segment: "Segmento",
  business_stage: "Momento do negócio",
  main_challenge: "Principal desafio",
  desired_transformation: "Transformação desejada",
  project_need: "Como a Revee pode ajudar",
  investment_range: "Faixa de investimento",
  start_timeline: "Prazo para iniciar",
  message: "Mensagem complementar",
  source: "Como conheceu a Revee",
  created_at: "Enviado em",
  id: "ID"
};

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderRows(application: Application) {
  return Object.keys(labels)
    .filter((key) => application[key])
    .map((key) => {
      return `
        <tr>
          <td style="padding:14px 16px;border-bottom:1px solid #242424;color:#8f8f8f;font-size:13px;text-transform:uppercase;letter-spacing:.08em;width:34%;">${labels[key]}</td>
          <td style="padding:14px 16px;border-bottom:1px solid #242424;color:#f5f5f0;font-size:15px;line-height:1.5;">${escapeHtml(application[key])}</td>
        </tr>
      `;
    })
    .join("");
}

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const toEmail = Deno.env.get("APPLICATION_TO_EMAIL") || "reveebrand@gmail.com";
  const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "Revee Brand <onboarding@resend.dev>";

  if (!resendApiKey) {
    return new Response(JSON.stringify({ error: "RESEND_API_KEY is missing" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  const application = await request.json();
  const subject = `Nova aplicação de projeto: ${application.company_name || application.name || "Revee Brand"}`;

  const html = `
    <div style="margin:0;padding:32px;background:#050505;font-family:Arial,Helvetica,sans-serif;color:#f5f5f0;">
      <div style="max-width:760px;margin:0 auto;">
        <p style="margin:0 0 10px;color:#8f8f8f;font-size:12px;text-transform:uppercase;letter-spacing:.18em;">Revee Brand</p>
        <h1 style="margin:0 0 24px;font-size:34px;line-height:1.05;font-weight:400;">Nova aplicação de projeto</h1>
        <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;background:#101010;border:1px solid #242424;">
          ${renderRows(application)}
        </table>
      </div>
    </div>
  `;

  const text = Object.keys(labels)
    .filter((key) => application[key])
    .map((key) => `${labels[key]}: ${application[key]}`)
    .join("\n");

  const resendResponse = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${resendApiKey}`
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      subject,
      html,
      text
    })
  });

  if (!resendResponse.ok) {
    const errorText = await resendResponse.text();
    return new Response(JSON.stringify({ error: "Resend request failed", detail: errorText }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  const data = await resendResponse.json();
  return new Response(JSON.stringify({ ok: true, data }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
});
