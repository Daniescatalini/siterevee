const requiredFields = [
  "name",
  "email",
  "whatsapp",
  "city",
  "company_name",
  "business_stage",
  "main_challenges",
  "services_needed",
  "desired_transformation",
  "investment_range",
  "start_timeline",
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

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

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
  application.instagram_website = String(payload.instagram_website || "").trim();

  const missingField = requiredFields.find((field) => !application[field]);
  if (missingField) {
    return json(422, { error: `Missing required field: ${missingField}` });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(application.email)) {
    return json(422, { error: "Invalid email" });
  }

  const fieldsToCheck = [...requiredFields, "instagram_website"];
  const oversizedField = fieldsToCheck.find((field) => application[field].length > (field === "desired_transformation" ? 5000 : 500));
  if (oversizedField) {
    return json(422, { error: `Field is too long: ${oversizedField}` });
  }

  let insertResponse;
  try {
    insertResponse = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/project_applications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseServiceRoleKey,
        Authorization: `Bearer ${supabaseServiceRoleKey}`,
        Prefer: "return=representation"
      },
      body: JSON.stringify(application)
    });
  } catch (error) {
    console.error("Supabase insert connection failed", error);
    return json(502, { error: "Could not connect to application storage" });
  }

  if (!insertResponse.ok) {
    const errorText = await insertResponse.text();
    return json(500, { error: "Could not save application", detail: errorText });
  }

  const [savedApplication] = await insertResponse.json();

  let emailSent = false;
  try {
    const emailResponse = await fetch(`${supabaseUrl.replace(/\/$/, "")}/functions/v1/send-application-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseServiceRoleKey,
        Authorization: `Bearer ${supabaseServiceRoleKey}`
      },
      body: JSON.stringify(savedApplication)
    });
    emailSent = emailResponse.ok;
    if (!emailSent) console.error("Application email failed", await emailResponse.text());
  } catch (error) {
    console.error("Application email connection failed", error);
  }

  // The application is safely stored even if the notification email is delayed.
  return json(200, { ok: true, id: savedApplication.id, emailSent });
};
