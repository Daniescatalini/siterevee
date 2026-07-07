import fs from "node:fs";
import { journalArticles as journalArticleDefinitions, journalCategories } from "../src/content/journal.mjs";

const domain = "https://reveebrand.com";
const journalPath = "/thejournal";
const socialFallback = `${domain}/assets/seo/revee-brand-compartilhamento-1200x630.png`;
const journalSocialImage = `${domain}/assets/journal/the-revee-journal-compartilhamento-1200x630.png`;
const danielaAuthorImage = "/assets/journal/daniela-escatalini-colunista-the-revee-journal.jpg";
const journalSuggestions = [
  "Branding",
  "Posicionamento",
  "Imagem",
  "Marketing",
  "Vendas",
  "Negócios",
  "Tecnologia",
  "Inteligência Artificial",
  "Naming",
  "Estratégia",
  "Crescimento",
  "Luxo",
  "Experiência",
  "Design",
  "Tendências",
];

const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const cleanGeneratedHtml = (value = "") => String(value).replace(/[ \t]+$/gm, "");

const cleanMarkdown = (value = "") => String(value)
  .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
  .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
  .replace(/\*\*([^*]+)\*\*/g, "$1")
  .replace(/\*([^*]+)\*/g, "$1")
  .replace(/^"|"$/g, "")
  .trim();

const parseMarkdownContent = (source = "") => {
  const blocks = [];
  let buffer = [];
  let bufferType = "paragraph";
  let bodyStarted = false;

  const flush = () => {
    const text = cleanMarkdown(buffer.join(" "));
    if (text) blocks.push({ type: bufferType, text });
    buffer = [];
    bufferType = "paragraph";
  };

  source.replaceAll("\r\n", "\n").split("\n").forEach((rawLine) => {
    const line = rawLine.trim();

    if (!line) {
      flush();
      return;
    }

    if (/^---+$/.test(line)) {
      flush();
      return;
    }

    if (/^#\s+/.test(line) || (!bodyStarted && /^##\s+/.test(line))) return;

    if (/^#{2,3}\s+/.test(line)) {
      flush();
      bodyStarted = true;
      blocks.push({ type: "heading", text: cleanMarkdown(line.replace(/^#{2,3}\s+/, "")) });
      return;
    }

    if (/^>/.test(line)) {
      if (buffer.length && bufferType !== "quote") flush();
      bufferType = "quote";
      buffer.push(line.replace(/^>\s?/, ""));
      bodyStarted = true;
      return;
    }

    if (bufferType === "quote") {
      buffer.push(line);
      bodyStarted = true;
      return;
    }

    buffer.push(line);
    bodyStarted = true;
  });

  flush();
  return blocks;
};

const journalArticles = journalArticleDefinitions.map((article) => ({
  ...article,
  content: article.content || parseMarkdownContent(fs.readFileSync(article.contentFile, "utf8")),
}));

const searchText = (article) => [
  article.title,
  article.subtitle,
  article.category,
  ...(article.tags || []),
  article.author,
  ...article.content.map((block) => block.text || ""),
].join(" ").toLocaleLowerCase("pt-BR");

const authorName = (article) => article.author === "Daniela Escatalini"
  ? `<a href="/daniela-escatalini">Daniela Escatalini</a>`
  : escapeHtml(article.author);

const tagLinks = (article, className = "journal-tags") => `<div class="${className}" aria-label="Temas da matéria">${(article.tags || []).map((tag) => `<a href="${journalPath}?tag=${encodeURIComponent(tag)}" data-journal-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</a>`).join("")}</div>`;

for (const file of fs.readdirSync(".")) {
  if (/^journal-.+\.html$/.test(file)) fs.unlinkSync(file);
}

const header = () => `
    <a class="journal-release-ticker" href="${journalPath}#newsletter" aria-label="Novas matérias às quintas e aos domingos. Assine o Journal.">
      <span class="journal-release-ticker-track" aria-hidden="true">
        ${Array.from({ length: 6 }, () => `<span>Novas matérias às quintas e aos domingos</span><i>•</i>`).join("")}
      </span>
    </a>
    <header class="journal-masthead">
      <a class="journal-wordmark" href="${journalPath}" aria-label="The Revee Journal — página inicial">
        <span>The Revee</span><em>Journal</em>
      </a>
      <nav class="journal-primary-nav" aria-label="Navegação do Journal">
        <a href="${journalPath}#materias">Matérias</a>
        <a href="${journalPath}#colunistas">Colunistas</a>
        <a class="journal-subscribe-link" href="${journalPath}#newsletter">Assine</a>
      </nav>
    </header>
    <nav class="journal-topic-nav" aria-label="Temas do Journal">
      ${journalCategories.filter((category) => category !== "Conversas").map((category) => `<a href="${journalPath}?tag=${encodeURIComponent(category)}">${category}</a>`).join("")}
    </nav>`;

const footer = `
    <footer class="journal-publication-footer">
      <a class="journal-wordmark" href="${journalPath}"><span>The Revee</span><em>Journal</em></a>
      <div><a href="${journalPath}#materias">Matérias</a><a href="${journalPath}#colunistas">Colunistas</a><a href="${journalPath}#newsletter">Newsletter</a></div>
      <p>Perspectivas editoriais da <a href="/">Revee Brand</a>.<br />© 2026 The Revee Journal.</p>
    </footer>`;

const head = ({ title, description, path, image = socialFallback, type = "website", schema }) => `
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <base href="/" />
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="index,follow,max-image-preview:large" />
    <meta name="theme-color" content="#000000" />
    <title>${escapeHtml(title)}</title>
    <link rel="canonical" href="${domain}${path}" />
    <meta property="og:locale" content="pt_BR" />
    <meta property="og:type" content="${type}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${domain}${path}" />
    <meta property="og:site_name" content="The Revee Journal" />
    <meta property="og:image" content="${image.startsWith("http") ? image : `${domain}${image}`}" />
    <meta property="og:image:secure_url" content="${image.startsWith("http") ? image : `${domain}${image}`}" />
    <meta property="og:image:alt" content="${escapeHtml(title)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${image.startsWith("http") ? image : `${domain}${image}`}" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico?v=6" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/manifest.json" />
    <link rel="preload" href="/assets/fonts/NeueMontreal-Regular.otf" as="font" type="font/otf" crossorigin />
    <link rel="preload" href="/assets/fonts/Montserrat-Regular.ttf" as="font" type="font/ttf" crossorigin />
    <link rel="stylesheet" href="/styles.css" />
    <link rel="stylesheet" href="/journal.css" />
    <script type="application/ld+json">${JSON.stringify(schema)}</script>
  </head>`;

const card = (article, className = "journal-card") => `
  <article class="${className} reveal" data-journal-card data-category="${escapeHtml(article.category)}" data-search="${escapeHtml(searchText(article))}">
    <a class="journal-card-media" href="${journalPath}/${article.slug}" aria-label="Ler ${escapeHtml(article.title)}">
      <img loading="lazy" decoding="async" src="${article.coverImage}" alt="${escapeHtml(article.coverAlt)}" />
    </a>
    <div class="journal-card-copy">
      <div class="journal-card-meta"><span>${article.demo ? "Matéria demonstrativa · " : ""}${article.category}</span><span>${article.readingTime}</span></div>
      <h2><a href="${journalPath}/${article.slug}">${escapeHtml(article.title)}</a></h2>
      <p>${escapeHtml(article.subtitle)}</p>
      ${tagLinks(article)}
      <div class="journal-card-byline"><span>Por ${authorName(article)}</span><span>${article.displayDate}</span></div>
      <a class="journal-read-link" href="${journalPath}/${article.slug}">Ler matéria <span aria-hidden="true">↗</span></a>
    </div>
  </article>`;

const featured = journalArticles.find((article) => article.featured) || journalArticles[0];
const recent = journalArticles.filter((article) => article.id !== featured.id);
const trending = journalArticles.filter((article) => article.trending);
const conversations = journalArticles.filter((article) => article.category === "Conversas");
const columnists = [...new Map(journalArticles
  .filter((article) => article.author && article.author !== "The Revee Journal")
  .map((article) => [article.author, {
    name: article.author,
    role: article.authorRole || "Colunista",
    image: article.authorImage,
    href: article.author === "Daniela Escatalini" ? "/daniela-escatalini" : "",
    count: journalArticles.filter((item) => item.author === article.author).length,
  }])).values()];

const journalSchema = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "CollectionPage", "@id": `${domain}${journalPath}#webpage`, url: `${domain}${journalPath}`, name: "The Revee Journal", description: "Perspectivas da Revee Brand sobre branding, posicionamento, imagem, marketing, vendas, negócios e tendências para marcas em crescimento.", isPartOf: { "@id": `${domain}/#website` }, about: { "@id": `${domain}/#organization` }, inLanguage: "pt-BR" },
    { "@type": "ItemList", itemListElement: journalArticles.map((article, index) => ({ "@type": "ListItem", position: index + 1, url: `${domain}${journalPath}/${article.slug}`, name: article.title })) },
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Início", item: `${domain}/` }, { "@type": "ListItem", position: 2, name: "The Revee Journal", item: `${domain}${journalPath}` }] },
  ],
};

const journalHtml = `<!doctype html>
<html lang="pt-BR">
${head({ title: "The Revee Journal | Branding, Posicionamento e Tendências", description: "Perspectivas da Revee Brand sobre branding, posicionamento, imagem, marketing, vendas, negócios e tendências para marcas em crescimento.", path: journalPath, image: journalSocialImage, schema: journalSchema })}
  <body class="journal-body journal-home">
${header()}
    <main>
      <section class="journal-hero journal-edition-intro">
        <div class="journal-kicker">Perspectivas sobre estratégia, imagem e cultura de marca</div>
        <h1><span>Ideias que atravessam</span><em>marcas, negócios e cultura.</em></h1>
        <p>Perspectivas para compreender o presente, questionar o óbvio e construir marcas mais relevantes.</p>
      </section>

      <section class="journal-explore journal-explore-top" aria-labelledby="explore-title">
        <div class="journal-explore-heading"><span>Arquivo editorial</span><h2 id="explore-title">Explore o Journal</h2></div>
        <label class="journal-search"><span class="sr-only">Buscar no Journal</span><input type="search" data-journal-search placeholder="O que você deseja explorar?" autocomplete="off" /><span aria-hidden="true">↗</span></label>
        <div class="journal-quick-filters" aria-label="Sugestões de temas">
          ${journalSuggestions.map((suggestion) => `<button type="button" data-journal-suggestion="${escapeHtml(suggestion)}">${escapeHtml(suggestion)}</button>`).join("")}
        </div>
      </section>

      <section class="journal-search-results" data-journal-results-section hidden aria-labelledby="resultados-title">
        <div class="journal-section-heading"><h2 id="resultados-title">Resultados</h2><p data-journal-result-count></p></div>
        <div class="journal-grid" data-journal-search-grid>${journalArticles.map((article) => card(article)).join("")}</div>
        <div class="journal-empty" data-journal-search-empty hidden><strong>Nenhuma matéria encontrada.</strong><span>Experimente outro tema ou explore uma das perspectivas sugeridas.</span></div>
      </section>

      <section class="journal-featured" data-journal-standard id="materias" aria-labelledby="destaque-title">
        <div class="journal-section-heading journal-rule-heading"><span>Em destaque</span><p>Edição atual · Junho de 2026</p></div>
        <article>
          <a class="journal-featured-media" href="${journalPath}/${featured.slug}"><img decoding="async" fetchpriority="high" src="${featured.coverImage}" alt="${escapeHtml(featured.coverAlt)}" /></a>
          <div class="journal-featured-copy">
            <div class="journal-card-meta"><span>${featured.demo ? "Matéria demonstrativa · " : ""}${featured.category}</span><span>${featured.readingTime}</span></div>
            <h2 id="destaque-title"><a href="${journalPath}/${featured.slug}">${escapeHtml(featured.title)}</a></h2>
            <p>${escapeHtml(featured.subtitle)}</p>
            ${tagLinks(featured)}
            <div class="journal-card-byline"><span>Por ${authorName(featured)}</span><span>${featured.displayDate}</span></div>
            <a class="journal-read-link" href="${journalPath}/${featured.slug}">Ler matéria <span aria-hidden="true">↗</span></a>
          </div>
        </article>
      </section>

      ${journalArticles.length > 1 ? `<section class="journal-latest" data-journal-standard aria-labelledby="recentes-title">
        <div class="journal-section-heading journal-rule-heading"><h2 id="recentes-title">Últimas matérias</h2><p>Estratégia, cultura e negócios observados com profundidade.</p></div>
        <div class="journal-latest-grid" data-journal-grid>${journalArticles.filter((article) => article.id !== featured.id).map((article) => card(article, "journal-latest-card")).join("")}</div>
      </section>` : ""}

      <section class="journal-columnists" id="colunistas" aria-labelledby="colunistas-title">
        <div class="journal-section-heading journal-rule-heading"><h2 id="colunistas-title">Colunistas</h2><p>Vozes que ampliam a conversa sobre marcas, cultura e negócios.</p></div>
        <div class="journal-columnist-grid">${columnists.map((columnist) => `<article class="journal-columnist-card reveal">
          ${columnist.href ? `<a href="${columnist.href}" class="journal-columnist-photo">` : `<div class="journal-columnist-photo">`}<img loading="lazy" decoding="async" src="${columnist.image}" alt="${escapeHtml(columnist.name)}, colunista do The Revee Journal" />${columnist.href ? `</a>` : `</div>`}
          <span>Colunista</span>
          <h3>${columnist.href ? `<a href="${columnist.href}">${escapeHtml(columnist.name)}</a>` : escapeHtml(columnist.name)}</h3>
          <p>${escapeHtml(columnist.role)}</p>
          <small>${columnist.count} ${columnist.count === 1 ? "matéria publicada" : "matérias publicadas"}</small>
        </article>`).join("")}</div>
      </section>

      <section class="journal-newsletter" id="newsletter" aria-labelledby="newsletter-title">
        <div><span>Newsletter</span><h2 id="newsletter-title">Leituras para quem constrói marcas com intenção.</h2><p>Uma seleção editorial sobre estratégia, imagem, negócios e cultura, enviada quando houver algo relevante a dizer.</p></div>
        <form class="journal-newsletter-form" data-journal-newsletter novalidate>
          <label><span>Nome</span><input type="text" name="name" autocomplete="name" required /></label>
          <label><span>E-mail</span><input type="email" name="email" autocomplete="email" required /></label>
          <button type="submit">Assine o Journal</button>
          <p class="journal-form-status" data-journal-status aria-live="polite"></p>
        </form>
      </section>
    </main>
${footer}
    <script src="/script.js"></script>
    <script src="/journal.js"></script>
  </body>
</html>`;

fs.writeFileSync("journal.html", cleanGeneratedHtml(journalHtml));

const renderBlock = (block) => {
  if (block.type === "lead") return `<p class="article-lead">${escapeHtml(block.text)}</p>`;
  if (block.type === "heading") return `<h2>${escapeHtml(block.text)}</h2>`;
  if (block.type === "quote") return `<blockquote>${escapeHtml(block.text)}</blockquote>`;
  if (block.type === "link") return `<p class="article-inline-link"><a href="${block.href}">${escapeHtml(block.text)} <span aria-hidden="true">↗</span></a></p>`;
  return `<p>${escapeHtml(block.text)}</p>`;
};

for (const article of journalArticles) {
  const path = `/journal/${article.slug}`;
  const relatedArticles = journalArticles
    .filter((item) => item.id !== article.id)
    .sort((a, b) => Number(b.category === article.category) - Number(a.category === article.category))
    .slice(0, 3);
  const articleSchema = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Article", "@id": `${domain}${path}#article`, mainEntityOfPage: `${domain}${path}`, headline: article.title, description: article.description, datePublished: article.date, dateModified: article.date, image: `${domain}${article.socialImage || article.coverImage}`, articleSection: article.category, keywords: article.tags, wordCount: article.content.map((item) => item.text || "").join(" ").split(/\s+/).length, author: article.author === "The Revee Journal" ? { "@type": "Organization", name: "Revee Brand", url: domain } : { "@type": "Person", name: article.author, jobTitle: article.authorRole, url: `${domain}/daniela-escatalini`, sameAs: [article.authorInstagram, article.authorLinkedin].filter(Boolean) }, publisher: { "@type": "Organization", name: "Revee Brand", url: domain, logo: { "@type": "ImageObject", url: `${domain}/assets/brand/revee-brand-logo-oficial.svg` } }, inLanguage: "pt-BR" },
      { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Início", item: `${domain}/` }, { "@type": "ListItem", position: 2, name: "Journal", item: `${domain}/journal` }, { "@type": "ListItem", position: 3, name: article.title, item: `${domain}${path}` }] },
    ],
  };

  const profile = article.type === "interview" && article.guest ? article.guest : {
    name: "Daniela Escatalini",
    role: "Founder & Brand Strategist",
    company: "Revee Brand",
    image: danielaAuthorImage,
    instagram: "https://www.instagram.com/daniescatalini",
    linkedin: "https://www.linkedin.com/in/danielaescatalini/",
    bio: "Estrategista de marca e diretora criativa. À frente da Revee Brand, estrutura significado, posicionamento e expressão para marcas em crescimento.",
  };

  const articleHtml = `<!doctype html>
<html lang="pt-BR">
${head({ title: `${article.title} | The Revee Journal`, description: article.description, path, image: article.socialImage || article.coverImage, type: "article", schema: articleSchema })}
  <body class="journal-body article-body" data-article-title="${escapeHtml(article.title)}" data-article-category="${article.category}" data-article-author="${escapeHtml(article.author)}" data-article-summary="${escapeHtml(article.description || article.subtitle)}" data-article-url="${domain}${path}">
${header()}
    <main>
      <article class="journal-article">
        <header class="article-header">
          <a href="/journal" class="article-back">The Revee Journal</a>
          <span class="article-category">${article.demo ? "Matéria demonstrativa · " : ""}${article.category}</span>
          <h1>${escapeHtml(article.title)}</h1>
          <p>${escapeHtml(article.subtitle)}</p>
          <div class="article-meta"><span>Por ${authorName(article)}</span><time datetime="${article.date}">${article.displayDate}</time><span>${article.readingTime}</span></div>
        </header>
        <figure class="article-cover"><img decoding="async" fetchpriority="high" src="${article.coverImage}" alt="${escapeHtml(article.coverAlt)}" /></figure>
        <div class="article-layout">
          <div class="article-content">${article.content.map(renderBlock).join("")}</div>
          ${relatedArticles.length ? `<aside class="article-related" aria-label="Matérias relacionadas"><span>Leia também</span>${relatedArticles.map((related) => `<article><a href="/journal/${related.slug}"><img loading="lazy" decoding="async" src="${related.coverImage}" alt="${escapeHtml(related.coverAlt)}" /><small>${escapeHtml(related.category)}</small><h2>${escapeHtml(related.title)}</h2></a></article>`).join("")}</aside>` : ""}
        </div>
        <div class="article-end-meta"><span>Temas desta matéria</span>${tagLinks(article, "article-tags")}</div>
        <section class="article-share" aria-label="Compartilhar matéria">
          <span>Compartilhe esta leitura</span>
          <div><button type="button" data-share="copy">Copiar chamada</button><a data-share="whatsapp" href="#">WhatsApp</a><a data-share="linkedin" href="#">LinkedIn</a><a data-share="twitter" href="#">X / Twitter</a><button type="button" class="article-story-button" data-share-story>Stories</button></div>
        </section>
        <section class="article-author" aria-labelledby="author-title">
          <img loading="lazy" decoding="async" src="${profile.image}" alt="${escapeHtml(profile.name)}, ${escapeHtml(profile.role)}" />
          <div><span>${article.type === "interview" ? "Sobre a entrevistada" : "Sobre a autora"}</span><h2 id="author-title">${article.type === "article" ? `<a href="/daniela-escatalini">${escapeHtml(profile.name)}</a>` : escapeHtml(profile.name)}</h2><p class="article-author-role">${escapeHtml(profile.role)} — ${escapeHtml(profile.company)}</p><p>${escapeHtml(profile.bio)}</p><div class="article-author-links">${profile.instagram ? `<a href="${profile.instagram}" target="_blank" rel="noreferrer">Instagram</a>` : ""}${profile.linkedin ? `<a href="${profile.linkedin}" target="_blank" rel="noreferrer">LinkedIn</a>` : ""}</div></div>
        </section>
        <nav class="article-next"><span>Continue no Journal</span><a href="/journal">Explorar todas as matérias <span aria-hidden="true">↗</span></a></nav>
        <section class="article-newsletter" id="newsletter"><span>The Revee Journal</span><h2>Continue pensando conosco.</h2><p>Receba novas perspectivas sobre marcas, negócios, imagem e cultura.</p><a href="/journal#newsletter">Assine o Journal</a></section>
      </article>
    </main>
${footer}
    <div class="story-modal" data-story-modal hidden><div class="story-modal-dialog"><button type="button" class="story-modal-close" data-story-close aria-label="Fechar">×</button><h2>Compartilhar nos Stories</h2><p>O card leva a chamada completa. No Instagram, adicione o endereço copiado ao adesivo de link.</p><canvas width="1080" height="1920" data-story-canvas></canvas><div class="story-modal-actions"><button type="button" data-story-native>Compartilhar no celular</button><a data-story-download download="the-revee-journal-story.png">Baixar imagem</a></div><p class="story-modal-status" data-story-status aria-live="polite"></p></div></div>
    <script src="/script.js"></script>
    <script src="/journal.js"></script>
  </body>
</html>`;

  fs.writeFileSync(`journal-${article.slug}.html`, cleanGeneratedHtml(articleHtml));
}

const danielaArticles = journalArticles.filter((article) => article.author === "Daniela Escatalini");
const danielaPath = "/daniela-escatalini";
const danielaDescription = "Conheça a trajetória, o método e os artigos de Daniela Escatalini, fundadora da Revee Brand e estrategista especializada em branding, posicionamento e construção de marcas.";
const danielaSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${domain}${danielaPath}#person`,
      name: "Daniela Escatalini",
      url: `${domain}${danielaPath}`,
      image: `${domain}${danielaAuthorImage}`,
      jobTitle: "Founder & Brand Strategist",
      description: danielaDescription,
      worksFor: { "@id": `${domain}/#organization` },
      sameAs: [
        "https://www.instagram.com/daniescatalini",
        "https://www.linkedin.com/in/danielaescatalini/",
        "https://www.tiktok.com/@daniescatalini",
      ],
    },
    {
      "@type": "Organization",
      "@id": `${domain}/#organization`,
      name: "Revee Brand",
      url: domain,
      founder: { "@id": `${domain}${danielaPath}#person` },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Início", item: `${domain}/` },
        { "@type": "ListItem", position: 2, name: "Daniela Escatalini", item: `${domain}${danielaPath}` },
      ],
    },
  ],
};

const danielaHtml = `<!doctype html>
<html lang="pt-BR">
${head({ title: "Daniela Escatalini | Founder & Brand Strategist — Revee Brand", description: danielaDescription, path: danielaPath, image: danielaAuthorImage, type: "profile", schema: danielaSchema })}
  <body class="journal-body author-page">
${header()}
    <main>
      <section class="author-hero">
        <figure><img decoding="async" fetchpriority="high" src="${danielaAuthorImage}" alt="Daniela Escatalini, fundadora, estrategista de marca e colunista do The Revee Journal" /></figure>
        <div><span>Colunista · Editora fundadora</span><h1>Daniela<br />Escatalini</h1><p class="author-role">Founder & Brand Strategist — Revee Brand</p><p>Daniela atua na construção estratégica de marcas, conectando significado, posicionamento e expressão para transformar percepção em valor e preparar empresas para crescer com mais clareza.</p><div class="author-topics"><span>Branding</span><span>Posicionamento</span><span>Negócios</span><span>Cultura</span></div></div>
      </section>

      <section class="author-trajectory reveal" aria-labelledby="trajetoria-title">
        <div><span>Trajetória</span><h2 id="trajetoria-title">Estratégia para tornar marcas mais nítidas, relevantes e consistentes.</h2></div>
        <div><p>A trajetória de Daniela é guiada por uma pergunta central: o que uma empresa precisa organizar para que sua marca acompanhe a ambição do negócio?</p><p>À frente da Revee Brand, ela conduz projetos que começam antes da estética. Investiga contexto, percepção, portfólio e cultura para construir sistemas de marca capazes de orientar decisões, experiências e crescimento.</p><p>Sua abordagem une direção estratégica e sensibilidade criativa, sempre com o objetivo de transformar complexidade em uma estrutura clara, reconhecível e valiosa.</p></div>
      </section>

      <section class="author-articles reveal" aria-labelledby="artigos-daniela-title">
        <div class="journal-section-heading"><h2 id="artigos-daniela-title">Artigos publicados</h2><p>Perspectivas sobre marca, percepção e crescimento.</p></div>
        <div class="author-article-grid">${danielaArticles.map((article) => `<article><a class="author-article-media" href="/journal/${article.slug}"><img loading="lazy" decoding="async" src="${article.coverImage}" alt="${escapeHtml(article.coverAlt)}" /></a><span>${escapeHtml(article.category)}</span><h3><a href="/journal/${article.slug}">${escapeHtml(article.title)}</a></h3><p>${escapeHtml(article.subtitle)}</p><div><time datetime="${article.date}">${article.displayDate}</time><span>${article.readingTime}</span></div><a class="journal-read-link" href="/journal/${article.slug}">Ler matéria <span aria-hidden="true">↗</span></a></article>`).join("")}</div>
      </section>

      <section class="author-social reveal" aria-labelledby="redes-title">
        <div><span>Conexões</span><h2 id="redes-title">Ideias, processos e bastidores.</h2><p>Outras perspectivas e frentes de trabalho de Daniela e da Revee Brand.</p></div>
        <nav aria-label="Links de Daniela Escatalini e Revee Brand"><a href="https://www.instagram.com/daniescatalini" target="_blank" rel="noreferrer"><span><small>Conteúdo diário</small>Instagram</span><span aria-hidden="true">↗</span></a><a href="https://www.linkedin.com/in/danielaescatalini/" target="_blank" rel="noreferrer"><span><small>Visão profissional</small>LinkedIn</span><span aria-hidden="true">↗</span></a><a href="https://www.tiktok.com/@daniescatalini" target="_blank" rel="noreferrer"><span><small>Vídeos e ideias</small>TikTok</span><span aria-hidden="true">↗</span></a><a href="https://reveebrand.com" target="_blank" rel="noreferrer"><span><small>Agência</small>Revee Brand</span><span aria-hidden="true">↗</span></a></nav>
      </section>

      <section class="journal-newsletter author-newsletter" id="newsletter" aria-labelledby="author-newsletter-title"><div><span>Newsletter</span><h2 id="author-newsletter-title">Perspectivas de diferentes vozes.</h2><p>Receba novas matérias e conversas do The Revee Journal sobre marcas, negócios, imagem e cultura.</p></div><form class="journal-newsletter-form" data-journal-newsletter novalidate><label><span>Nome</span><input type="text" name="name" autocomplete="name" required /></label><label><span>E-mail</span><input type="email" name="email" autocomplete="email" required /></label><button type="submit">Assine o Journal</button><p class="journal-form-status" data-journal-status aria-live="polite"></p></form></section>
    </main>
${footer}
    <script src="/script.js"></script>
    <script src="/journal.js"></script>
  </body>
</html>`;

fs.writeFileSync("daniela-escatalini.html", cleanGeneratedHtml(danielaHtml));
