const RESEND_API_URL = "https://api.resend.com/emails";

type Application = Record<string, string>;

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function detail(label: string, value: unknown) {
  return `<div style="padding:0 0 18px;"><div style="margin-bottom:5px;color:#777;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;">${escapeHtml(label)}</div><div style="color:#111;font-size:16px;line-height:1.45;">${escapeHtml(value || "Não informado")}</div></div>`;
}

function list(value: string) {
  const items = String(value || "").split("|").map((item) => item.trim()).filter(Boolean);
  return items.length
    ? `<ul style="margin:0;padding:0;list-style:none;">${items.map((item) => `<li style="margin:0 0 9px;padding-left:18px;position:relative;color:#111;font-size:16px;line-height:1.45;"><span style="position:absolute;left:0;">•</span>${escapeHtml(item)}</li>`).join("")}</ul>`
    : `<p style="margin:0;color:#777;">Não informado</p>`;
}

function section(title: string, content: string) {
  return `<section style="padding:26px 0;border-top:1px solid #e7e7e4;"><h2 style="margin:0 0 20px;color:#111;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.14em;">${escapeHtml(title)}</h2>${content}</section>`;
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
  const subject = "🚀 Nova aplicação — Revee Brand";

  const html = `
    <style>
      @media only screen and (max-width:600px) {
        .email-shell { padding: 0 !important; }
        .email-card { padding: 26px 22px !important; border-left: 0 !important; border-right: 0 !important; }
        .email-title { font-size: 30px !important; }
        .email-columns { display: block !important; }
      }
    </style>
    <div class="email-shell" style="margin:0;padding:40px 20px;background:#f3f3f1;font-family:Arial,Helvetica,sans-serif;color:#111;">
      <div class="email-card" style="max-width:720px;margin:0 auto;padding:44px;background:#fff;border:1px solid #e4e4e1;">
        <p style="margin:0 0 12px;color:#777;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.18em;">Revee Brand</p>
        <h1 class="email-title" style="margin:0 0 36px;font-size:36px;line-height:1.08;font-weight:400;">Nova aplicação</h1>
        ${section("Dados", `
          <div class="email-columns" style="display:grid;grid-template-columns:1fr 1fr;column-gap:32px;">
            <div>${detail("Nome", application.name)}${detail("Empresa", application.company_name)}${detail("Cidade", application.city)}</div>
            <div>${detail("WhatsApp", application.whatsapp)}${detail("E-mail", application.email)}${detail("Instagram/Site", application.instagram_website)}</div>
          </div>
        `)}
        ${section("Diagnóstico", detail("Estágio da empresa", application.business_stage))}
        ${section("Principais desafios", list(application.main_challenges))}
        ${section("Áreas de apoio", list(application.services_needed))}
        ${section("Transformação desejada", `<p style="margin:0;color:#111;font-size:17px;line-height:1.65;">${escapeHtml(application.desired_transformation)}</p>`)}
        ${section("Projeto", `${detail("Investimento", application.investment_range)}${detail("Prazo", application.start_timeline)}${detail("Origem", application.source)}`)}
        <p style="margin:28px 0 0;color:#999;font-size:11px;line-height:1.5;">Enviado pelo formulário de projetos da Revee Brand.</p>
      </div>
    </div>
  `;

  const text = [
    "NOVA APLICAÇÃO — REVEE BRAND",
    "",
    `Nome: ${application.name}`,
    `Empresa: ${application.company_name}`,
    `Cidade: ${application.city}`,
    `WhatsApp: ${application.whatsapp}`,
    `E-mail: ${application.email}`,
    `Instagram/Site: ${application.instagram_website || "Não informado"}`,
    "",
    `Estágio: ${application.business_stage}`,
    `Principais desafios: ${application.main_challenges}`,
    `Áreas de apoio: ${application.services_needed}`,
    `Transformação desejada: ${application.desired_transformation}`,
    `Investimento: ${application.investment_range}`,
    `Prazo: ${application.start_timeline}`,
    `Origem: ${application.source}`
  ].join("\n");

  const customerHtml = `
    <style>
      @media only screen and (max-width:600px) {
        .email-shell { padding: 0 !important; }
        .email-card { padding: 28px 22px !important; border-left: 0 !important; border-right: 0 !important; }
        .email-title { font-size: 29px !important; }
        .email-button { display: block !important; width: auto !important; margin: 0 0 10px !important; padding: 14px 16px !important; text-align: center !important; }
      }
    </style>
    <div class="email-shell" style="margin:0;padding:40px 20px;background:#f3f3f1;font-family:Arial,Helvetica,sans-serif;color:#111;">
      <div class="email-card" style="max-width:680px;margin:0 auto;padding:48px;background:#fff;border:1px solid #e4e4e1;">
        <p style="margin:0 0 12px;color:#777;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.18em;">Revee Brand</p>
        <h1 class="email-title" style="margin:0 0 32px;font-size:36px;line-height:1.1;font-weight:400;">Sua aplicação foi recebida.</h1>
        <p style="margin:0 0 18px;font-size:17px;line-height:1.7;">Olá, ${escapeHtml(application.name)}.</p>
        <p style="margin:0 0 18px;font-size:17px;line-height:1.7;">Obrigado por compartilhar um pouco sobre a sua marca.</p>
        <p style="margin:0 0 18px;font-size:17px;line-height:1.7;">A partir das informações enviadas, iniciaremos uma análise inicial para compreender seu momento, seus desafios e como podemos contribuir de forma estratégica.</p>
        <p style="margin:0 0 32px;font-size:17px;line-height:1.7;">Você receberá um retorno em até 1 dia útil com os próximos passos.</p>
        <p style="margin:0 0 24px;font-size:17px;line-height:1.7;">Enquanto isso, convidamos você a conhecer um pouco mais sobre o nosso trabalho.</p>
        <div style="margin:0 0 42px;">
          <a class="email-button" href="https://reveebrand.com/projetos" style="display:inline-block;margin:0 10px 10px 0;padding:14px 20px;border-radius:4px;background:#050505;color:#fff;text-decoration:none;font-size:14px;font-weight:700;">Conhecer nossos projetos</a>
          <a class="email-button" href="https://reveebrand.com/metodo" style="display:inline-block;margin:0 0 10px;padding:14px 20px;border-radius:4px;background:#050505;color:#fff;text-decoration:none;font-size:14px;font-weight:700;">Conhecer nosso método</a>
        </div>
        <div style="padding-top:28px;border-top:1px solid #e7e7e4;color:#666;font-size:13px;line-height:1.7;">
          <p style="margin:0 0 22px;">Cada projeto desenvolvido pela Revee é construído de forma personalizada. Por isso, analisamos cuidadosamente cada aplicação antes de iniciar uma nova parceria.</p>
          <p style="margin:0;color:#111;font-weight:700;">Revee Brand</p>
          <p style="margin:4px 0 0;">Marcas com significado. Estruturadas para crescer.</p>
        </div>
      </div>
    </div>
  `;

  const send = async (payload: Record<string, unknown>, label: string) => {
    try {
      const response = await fetch(RESEND_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendApiKey}` },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        console.error(`${label} email failed`, await response.text());
        return false;
      }
      return true;
    } catch (error) {
      console.error(`${label} email connection failed`, error);
      return false;
    }
  };

  const [adminSent, customerSent] = await Promise.all([
    send({ from: fromEmail, to: [toEmail], subject, html, text }, "Admin"),
    send({
      from: fromEmail,
      to: [application.email],
      subject: "Recebemos sua aplicação. Obrigado por escolher a Revee.",
      html: customerHtml,
      text: `Olá, ${application.name}.\n\nObrigado por compartilhar um pouco sobre a sua marca. A partir das informações enviadas, iniciaremos uma análise inicial para compreender seu momento, seus desafios e como podemos contribuir de forma estratégica.\n\nVocê receberá um retorno em até 1 dia útil com os próximos passos.\n\nProjetos: https://reveebrand.com/projetos\nMétodo: https://reveebrand.com/metodo\n\nRevee Brand\nMarcas com significado. Estruturadas para crescer.`
    }, "Customer")
  ]);

  return new Response(JSON.stringify({ ok: true, adminSent, customerSent }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
});
