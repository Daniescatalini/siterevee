const requiredFields = [
  "name",
  "email",
  "whatsapp",
  "city",
  "company_name",
  "instagram",
  "website",
  "segment",
  "business_stage",
  "main_challenge",
  "desired_transformation",
  "project_need",
  "investment_range",
  "start_timeline",
  "message",
  "source"
];

const json = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body)
});

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return json(500, { error: "Supabase environment variables are missing" });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (error) {
    return json(400, { error: "Invalid JSON" });
  }

  const application = requiredFields.reduce((acc, field) => {
    acc[field] = String(payload[field] || "").trim();
    return acc;
  }, {});

  const missingField = requiredFields.find((field) => !application[field]);
  if (missingField) {
    return json(422, { error: `Missing required field: ${missingField}` });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(application.email)) {
    return json(422, { error: "Invalid email" });
  }

  const oversizedField = requiredFields.find((field) => application[field].length > (field === "message" || field === "desired_transformation" ? 5000 : 500));
  if (oversizedField) {
    return json(422, { error: `Field is too long: ${oversizedField}` });
  }

  const insertResponse = await fetch(`${supabaseUrl}/rest/v1/project_applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseServiceRoleKey,
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
      Prefer: "return=representation"
    },
    body: JSON.stringify(application)
  });

  if (!insertResponse.ok) {
    const errorText = await insertResponse.text();
    return json(500, { error: "Could not save application", detail: errorText });
  }

  const [savedApplication] = await insertResponse.json();

  const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-application-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${supabaseServiceRoleKey}`
    },
    body: JSON.stringify(savedApplication)
  });

  if (!emailResponse.ok) {
    const errorText = await emailResponse.text();
    return json(500, { error: "Could not send application email", detail: errorText });
  }

  return json(200, { ok: true, id: savedApplication.id });
};
