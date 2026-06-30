import fs from "node:fs";

const files = fs.readdirSync(".").filter((name) => name.endsWith(".html") && !name.startsWith("journal-") && name !== "journal.html" && name !== "social-card.html");

for (const file of files) {
  let html = fs.readFileSync(file, "utf8");
  if (!html.includes("<header class=\"site-header\">")) continue;

  html = html.replace(/(\s*)(<a class="contact-pill"[^>]*>[\s\S]*?<\/a>)(\s*<\/header>)/, (match, spacing, contact, closing) => {
    if (match.includes("header-actions")) return match;
    return `${spacing}<div class="header-actions">\n${spacing}  <a class="journal-pill" href="/journal">Journal</a>\n${spacing}  ${contact}\n${spacing}</div>${closing}`;
  });

  html = html.replaceAll("<a href=\"/projetos\"><span>Portfólio</span></a>", "<a href=\"/projetos\"><span>Projetos</span></a>");
  html = html.replaceAll('<a href="/projetos">Portfólio</a>', '<a href="/projetos">Projetos</a>');
  if (!html.includes('<a href="/journal"><span>Journal</span></a>')) {
    html = html.replace('<a href="/projetos"><span>Projetos</span></a>', '<a href="/projetos"><span>Projetos</span></a>\n      <a href="/journal"><span>Journal</span></a>');
  }
  if (html.includes('class="footer-links"') && !html.match(/class="footer-links"[\s\S]*?href="\/journal"/)) {
    html = html.replace(/(<div class="footer-links">[\s\S]*?<a href="\/projetos">Projetos<\/a>)/, '$1<a href="/journal">Journal</a>');
  }

  fs.writeFileSync(file, html);
}
