import fs from "node:fs";
import { journalArticles } from "../src/content/journal.mjs";

const pages = [
  ["/", "1.0"],
  ["/servicos", "0.9"],
  ["/projetos", "0.9"],
  ["/cultura", "0.7"],
  ["/sobre", "0.8"],
  ["/revee-brand", "0.9"],
  ["/aplicar", "0.8"],
  ["/projetos/c-arq", "0.7"],
  ["/projetos/beleza-wellness", "0.7"],
  ["/projetos/cavali-carvalho", "0.7"],
  ["/projetos/studio-natalia-deitos", "0.7"],
  ["/projetos/gourmet-house", "0.7"],
  ["/projetos/vontri", "0.7"],
  ["/thejournal", "0.8"],
  ["/daniela-escatalini", "0.7"],
  ...journalArticles.map((article) => [`/thejournal/${article.slug}`, "0.7"]),
];

const imageEntries = {
  "/": [
    ["assets/seo/official/revee-brand-consultoria-de-marca.jpg", "Revee Brand, consultoria de marca especializada em branding, identidade visual e sites.", "Revee Brand consultoria de marca"],
  ],
  "/servicos": [
    ["assets/seo/official/revee-brand-site-oficial.jpg", "Revee Brand, consultoria de marca especializada em branding, identidade visual e sites.", "Revee Brand site oficial"],
  ],
  "/projetos": [
    ["assets/seo/official/revee-brand-projetos-de-branding.jpg", "Projetos de branding e identidade visual desenvolvidos pela Revee Brand.", "Revee Brand projetos de branding"],
  ],
  "/sobre": [
    ["assets/seo/official/revee-brand-logo-oficial.jpg", "Identidade oficial da Revee Brand, consultoria de branding e posicionamento de marca.", "Revee Brand logo oficial"],
    ["assets/seo/official/revee-brand-identidade-visual.jpg", "Projeto de identidade visual desenvolvido pela Revee Brand.", "Revee Brand identidade visual"],
  ],
  "/revee-brand": [
    ["assets/seo/official/revee-brand-logo-oficial.jpg", "Logo oficial da Revee Brand, consultoria de branding e posicionamento de marca.", "Logo oficial da Revee Brand"],
    ["assets/seo/official/revee-brand-consultoria-de-marca.jpg", "Revee Brand, consultoria de marca especializada em branding, identidade visual e sites.", "Revee Brand consultoria de marca"],
    ["assets/seo/official/revee-brand-branding-estrategico.jpg", "Projeto de branding estratégico criado pela Revee Brand.", "Revee Brand branding estrategico"],
    ["assets/seo/official/revee-brand-identidade-visual.jpg", "Projeto de identidade visual desenvolvido pela Revee Brand.", "Revee Brand identidade visual"],
    ["assets/seo/official/revee-brand-site-oficial.jpg", "Sites e landing pages com estratégia de marca da Revee Brand.", "Revee Brand site oficial"],
    ["assets/seo/official/revee-brand-projetos-de-branding.jpg", "Projetos de branding e identidade visual desenvolvidos pela Revee Brand.", "Revee Brand projetos de branding"],
  ],
};

const imageXml = (path) => (imageEntries[path] || []).map(([src, caption, title]) => `    <image:image>
      <image:loc>https://reveebrand.com/${src}</image:loc>
      <image:caption>${caption}</image:caption>
      <image:title>${title}</image:title>
    </image:image>`).join("\n");

const today = new Date().toISOString().slice(0, 10);
const urls = pages.map(([path, priority]) => {
  const images = imageXml(path);
  return `  <url>
    <loc>https://reveebrand.com${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>${images ? `\n${images}` : ""}
  </url>`;
}).join("\n");

fs.writeFileSync("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls}\n</urlset>\n`);
