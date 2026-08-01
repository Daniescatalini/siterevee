const json = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  },
  body: JSON.stringify(body),
});

const allowedSlugs = new Set([
  "ainda-vale-a-pena-ser-designer-em-2026",
  "fotografia-crescimento-profissional",
]);

const getSupabaseConfig = () => {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    || process.env.SUPABASE_SECRET_KEY
    || process.env.SUPABASE_SERVICE_KEY;
  return { url: url?.replace(/\/$/, ""), key };
};

const supabaseHeaders = (key) => {
  const headers = {
    apikey: key,
    "Content-Type": "application/json",
  };
  if (!key.startsWith("sb_secret_")) headers.Authorization = `Bearer ${key}`;
  return headers;
};

exports.handler = async (event) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return json(500, { error: "Storage is not configured." });

  const requestUrl = new URL(event.rawUrl || `https://reveebrand.com${event.path || ""}`);
  const slug = String(requestUrl.searchParams.get("slug") || "").trim();
  if (!allowedSlugs.has(slug)) return json(400, { error: "Invalid article." });

  if (event.httpMethod === "GET") {
    const response = await fetch(`${url}/rest/v1/journal_likes?slug=eq.${encodeURIComponent(slug)}&select=likes_count`, {
      headers: supabaseHeaders(key),
    });
    if (!response.ok) return json(500, { error: "Could not load likes." });
    const [row] = await response.json();
    return json(200, { slug, count: row?.likes_count || 0 });
  }

  if (event.httpMethod === "POST") {
    const response = await fetch(`${url}/rest/v1/rpc/increment_journal_like`, {
      method: "POST",
      headers: supabaseHeaders(key),
      body: JSON.stringify({ article_slug: slug }),
    });
    if (!response.ok) return json(500, { error: "Could not save like." });
    const count = await response.json();
    return json(200, { slug, count: Number(count) || 0 });
  }

  return json(405, { error: "Method not allowed." });
};
