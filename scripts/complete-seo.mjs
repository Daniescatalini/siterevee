import fs from "node:fs";

const domain = "https://reveebrand.com";
const shared = (data) => `
    <meta name="description" content="${data.description}" />
    <meta name="theme-color" content="#000000" />
    <title>${data.title}</title>
    <link rel="canonical" href="${domain}${data.path}" />
    <meta property="og:locale" content="pt_BR" />
    <meta property="og:type" content="${data.type || "website"}" />
    <meta property="og:title" content="${data.title}" />
    <meta property="og:description" content="${data.ogDescription || data.description}" />
    <meta property="og:url" content="${domain}${data.path}" />
    <meta property="og:site_name" content="Revee Brand" />
    <meta property="og:image" content="${domain}/${data.image}" />
    <meta property="og:image:alt" content="${data.imageAlt}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${data.title}" />
    <meta name="twitter:description" content="${data.ogDescription || data.description}" />
    <meta name="twitter:image" content="${domain}/${data.image}" />
    <link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png" />
    <link rel="apple-touch-icon" href="apple-touch-icon.png" />
    <link rel="manifest" href="manifest.json" />
    <link rel="preload" href="assets/fonts/NeueMontreal-Regular.otf" as="font" type="font/otf" crossorigin />
    <link rel="preload" href="assets/fonts/Montserrat-Regular.ttf" as="font" type="font/ttf" crossorigin />
    <link rel="stylesheet" href="styles.css" />`;

const breadcrumb = (name, path) => ({
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Início", item: `${domain}/` },
    { "@type": "ListItem", position: 2, name, item: `${domain}${path}` },
  ],
});

const pages = {
  "about.html": {
    title: "Sobre a Revee Brand | Consultoria de Branding em Piracicaba",
    description: "Conheça a Revee Brand, consultoria de branding em Piracicaba com atuação global, direção criativa, estratégia de marca, tecnologia e crescimento.",
    path: "/sobre",
    image: "assets/seo/revee-brand-agencia-branding-piracicaba.webp",
    imageAlt: "Daniela Escatalini e a estrutura estratégica da Revee Brand, consultoria de branding em Piracicaba",
    schema: {
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "AboutPage", "@id": `${domain}/sobre#webpage`, url: `${domain}/sobre`, name: "Sobre a Revee Brand", isPartOf: { "@id": `${domain}/#website` }, about: { "@id": `${domain}/#organization` }, inLanguage: "pt-BR" },
        breadcrumb("Sobre", "/sobre"),
      ],
    },
  },
  "contact.html": {
    title: "Aplicar Consultoria de Branding | Revee Brand",
    description: "Envie uma aplicação estratégica para projetos de branding, naming, identidade visual, rebranding e estratégia de marca com a Revee Brand.",
    path: "/aplicar",
    image: "assets/seo/revee-brand-agencia-branding-piracicaba.webp",
    imageAlt: "Aplicação para consultoria estratégica de branding com a Revee Brand",
    schema: {
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "ContactPage", "@id": `${domain}/aplicar#webpage`, url: `${domain}/aplicar`, name: "Aplicar consultoria de branding", isPartOf: { "@id": `${domain}/#website` }, about: { "@id": `${domain}/#organization` }, inLanguage: "pt-BR" },
        breadcrumb("Aplicar consultoria", "/aplicar"),
      ],
    },
  },
  "case-carq.html": {
    title: "C.ARQ: Branding para Arquitetura | Case Revee Brand",
    description: "Case C.ARQ: estratégia de marca e identidade visual para um estúdio de arquitetura, desenvolvido pela Revee Brand com sofisticação e conexão humana.",
    path: "/projetos/c-arq",
    image: "assets/seo/revee-brand-c-arq-case.webp",
    imageAlt: "Projeto de branding C.ARQ para arquitetura desenvolvido pela Revee Brand",
    type: "article",
    project: "C.ARQ",
  },
  "case-beleza-wellness.html": {
    title: "Beleza Wellness: Rebranding e Packaging | Revee Brand",
    description: "Case Beleza Wellness: rebranding, packaging e sistema de marca para transformar cuidado capilar em valor, ciência e crescimento.",
    path: "/projetos/beleza-wellness",
    image: "assets/seo/revee-brand-beleza-wellness-case.webp",
    imageAlt: "Projeto de rebranding e packaging Beleza Wellness desenvolvido pela Revee Brand",
    type: "article",
    project: "Beleza Wellness",
  },
  "case-cavalicarvalho.html": {
    title: "Cavali Carvalho: Branding e Website | Revee Brand",
    description: "Case Cavali Carvalho: branding, identidade visual e website para arquitetura e engenharia, desenvolvido pela Revee Brand.",
    path: "/projetos/cavali-carvalho",
    image: "assets/seo/revee-brand-cavali-carvalho-case.webp",
    imageAlt: "Projeto de branding e website Cavali Carvalho desenvolvido pela Revee Brand",
    type: "article",
    project: "Cavali Carvalho",
  },
};

for (const [file, data] of Object.entries(pages)) {
  if (data.project) {
    data.schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CreativeWork",
          "@id": `${domain}${data.path}#project`,
          url: `${domain}${data.path}`,
          name: data.project,
          headline: data.title,
          description: data.description,
          creator: { "@id": `${domain}/#organization` },
          image: { "@id": `${domain}${data.path}#image` },
          inLanguage: "pt-BR",
        },
        { "@type": "ImageObject", "@id": `${domain}${data.path}#image`, url: `${domain}/${data.image}`, caption: data.imageAlt },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Início", item: `${domain}/` },
            { "@type": "ListItem", position: 2, name: "Portfólio", item: `${domain}/portfolio` },
            { "@type": "ListItem", position: 3, name: data.project, item: `${domain}${data.path}` },
          ],
        },
      ],
    };
  }
  let html = fs.readFileSync(file, "utf8");
  const head = `  <head>\n    <meta charset="utf-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1" />${shared(data)}\n    <script type="application/ld+json">\n${JSON.stringify(data.schema, null, 6)}\n    </script>\n  </head>`;
  html = html.replace(/  <head>[\s\S]*?  <\/head>/, head);
  fs.writeFileSync(file, html);
}

for (const file of fs.readdirSync(".").filter((name) => name.endsWith(".html"))) {
  let html = fs.readFileSync(file, "utf8");
  html = html.replaceAll('alt="Revee Brand"', 'alt="Logo da Revee Brand, consultoria de branding e estratégia de marca em Piracicaba com atuação global"');
  html = html.replaceAll('alt="Beleza Wellness"', 'alt="Projeto de rebranding e packaging Beleza Wellness desenvolvido pela Revee Brand"');
  html = html.replaceAll('alt="CavaliCarvalho"', 'alt="Projeto de branding e website Cavali Carvalho desenvolvido pela Revee Brand"');
  html = html.replaceAll('alt="Revee AI"', 'alt="Revee AI, inteligência artificial para estratégia de marcas da Revee Brand"');
  html = html.replaceAll('alt="Daniela Escatalini"', 'alt="Daniela Escatalini, fundadora, estrategista de marca e diretora criativa da Revee Brand"');
  html = html.replaceAll('alt="Gustavo Motta"', 'alt="Gustavo Motta, diretor de tecnologia e crescimento da Revee Brand"');
  const assets = new Map([
    ["assets/logo-horizontal-black.png", "assets/optimized/revee-brand-logo-oficial.png"],
    ["assets/revee-ai-orb.png", "assets/optimized/revee-brand-inteligencia-artificial.webp"],
    ["assets/daniela-escatalini.jpg", "assets/optimized/revee-brand-daniela-escatalini-direcao-criativa.webp"],
    ["assets/gustavo-motta.jpg", "assets/optimized/revee-brand-gustavo-motta-tecnologia-crescimento.webp"],
    ["assets/Cases/C.Arq/c-arq-motion.mp4", "assets/optimized/revee-brand-c-arq-identidade-visual-motion.mp4"],
    ["assets/Cases/C.Arq/capa priemeira foto.png", "assets/optimized/revee-brand-c-arq-identidade-visual.webp"],
    ["assets/Cases/C.Arq/mockup-billboard-station.png", "assets/optimized/revee-brand-c-arq-campanha-urbana.webp"],
    ["assets/Cases/C.Arq/mockup-billboard-exterior.png", "assets/optimized/revee-brand-c-arq-branding-exterior.webp"],
    ["assets/Cases/BelezaWellness/box-web.webp", "assets/optimized/revee-brand-beleza-wellness-packaging.webp"],
    ["assets/Cases/BelezaWellness/packaging-line.jpg", "assets/optimized/revee-brand-beleza-wellness-linha-embalagens.webp"],
    ["assets/Cases/BelezaWellness/grid-products.jpg", "assets/optimized/revee-brand-beleza-wellness-sistema-visual.webp"],
    ["assets/Cases/BelezaWellness/brand-system-3.jpg", "assets/optimized/revee-brand-beleza-wellness-aplicacoes-marca.webp"],
    ["assets/Cases/BelezaWellness/product-hair.jpg", "assets/optimized/revee-brand-beleza-wellness-produto-cabelo.webp"],
    ["assets/Cases/BelezaWellness/product-wood.jpg", "assets/optimized/revee-brand-beleza-wellness-produto-madeira.webp"],
    ["assets/Cases/BelezaWellness/brand-system-1.jpg", "assets/optimized/revee-brand-beleza-wellness-brand-system.webp"],
    ["assets/Cases/CavaliCarvalho/cover-web.webp", "assets/optimized/revee-brand-cavali-carvalho-branding.webp"],
    ["assets/Cases/CavaliCarvalho/logo-grid.jpg", "assets/optimized/revee-brand-cavali-carvalho-construcao-logotipo.webp"],
    ["assets/Cases/CavaliCarvalho/business-cards-fabric.jpg", "assets/optimized/revee-brand-cavali-carvalho-cartoes-visita.webp"],
    ["assets/Cases/CavaliCarvalho/presentation.jpg", "assets/optimized/revee-brand-cavali-carvalho-apresentacao-institucional.webp"],
    ["assets/Cases/CavaliCarvalho/helmet.jpg", "assets/optimized/revee-brand-cavali-carvalho-identidade-capacete.webp"],
    ["assets/Cases/CavaliCarvalho/stone-card.jpg", "assets/optimized/revee-brand-cavali-carvalho-aplicacao-marca.webp"],
    ["assets/Cases/CavaliCarvalho/phone-website.jpg", "assets/optimized/revee-brand-cavali-carvalho-website-mobile.webp"],
  ]);
  for (const [from, to] of assets) html = html.replaceAll(from, to);
  html = html.replace(/<img(?![^>]*\bdecoding=)/g, '<img decoding="async"');
  html = html.replace(/<img(?![^>]*\bloading=)(?![^>]*revee-brand-logo-oficial)/g, '<img loading="lazy"');
  html = html.replace(/(<section class="project-hero">[\s\S]*?<img[^>]*?)loading="lazy"/, '$1loading="eager" fetchpriority="high"');
  fs.writeFileSync(file, html);
}
