import fs from "node:fs";

const pages = [
  ["/", "1.0"],
  ["/servicos", "0.9"],
  ["/portfolio", "0.9"],
  ["/cultura", "0.7"],
  ["/sobre", "0.8"],
  ["/aplicar", "0.8"],
  ["/projetos/c-arq", "0.7"],
  ["/projetos/beleza-wellness", "0.7"],
  ["/projetos/cavali-carvalho", "0.7"],
];
const today = new Date().toISOString().slice(0, 10);
const urls = pages.map(([path, priority]) => `  <url>\n    <loc>https://reveebrand.com${path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>${priority}</priority>\n  </url>`).join("\n");
fs.writeFileSync("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
