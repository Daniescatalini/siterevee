import fs from "node:fs";

const domain = "https://reveebrand.com";
const socialImage = `${domain}/assets/seo/revee-brand-compartilhamento-1200x630.png`;
const sharedOgTitle = "Revee Brand | Marcas com significado. Estruturadas para crescer.";
const sharedOgDescription = "Branding estratégico, arquitetura de marca e posicionamento para empresas que desejam crescer de forma consistente.";

const pages = {
  "index.html": {
    path: "/",
    title: "Revee Brand | Branding Estratégico e Arquitetura de Marca",
    description: "Construímos marcas com significado por meio de branding estratégico, arquitetura de marca e posicionamento. Estruturamos empresas preparadas para crescer.",
    keywords: "branding estratégico, arquitetura de marca, branding, posicionamento de marca, estratégia de marca, consultoria de branding, construção de marca, branding para empresas",
  },
  "services.html": {
    path: "/servicos",
    title: "Serviços de Branding Estratégico | Revee Brand",
    description: "Conheça os serviços da Revee Brand em branding estratégico, posicionamento, identidade visual, arquitetura de marca e sistemas de marca.",
    keywords: "serviços de branding, branding estratégico, identidade visual, posicionamento, arquitetura de marca",
  },
  "cases.html": {
    path: "/projetos",
    title: "Projetos de Branding e Posicionamento | Revee Brand",
    description: "Conheça projetos desenvolvidos pela Revee Brand e descubra como transformamos estratégia em marcas sólidas, memoráveis e preparadas para crescer.",
    keywords: "projetos de branding, cases de branding, branding estratégico, identidade visual",
  },
  "about.html": {
    path: "/sobre",
    title: "Sobre a Revee Brand | Estratégia para Marcas que Crescem",
    description: "Conheça a Revee Brand, uma consultoria especializada em branding estratégico, arquitetura de marca e posicionamento para empresas em crescimento.",
    keywords: "sobre Revee, agência de branding, branding estratégico, arquitetura de marca",
  },
  "culture.html": {
    path: "/cultura",
    title: "Nossa Cultura | Revee Brand",
    description: "Entenda os princípios, visão e filosofia que orientam a construção de marcas com significado na Revee Brand.",
    keywords: "cultura de marca, branding estratégico, arquitetura de marca, construção de marca",
  },
  "contact.html": {
    path: "/aplicar",
    title: "Iniciar um Projeto de Branding | Revee Brand",
    description: "Solicite uma análise estratégica da sua marca. Conte-nos sobre seu negócio e descubra como a Revee pode estruturar seu crescimento.",
    keywords: "iniciar projeto de branding, análise estratégica de marca, consultoria de branding, arquitetura de marca, posicionamento de marca",
  },
};

const replaceMeta = (html, selector, content) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const expression = new RegExp(`<meta ${escaped} content="[^"]*" \\/>`);
  const tag = `<meta ${selector} content="${content}" />`;
  return expression.test(html) ? html.replace(expression, tag) : html.replace("    <meta name=\"theme-color\"", `    ${tag}\n    <meta name=\"theme-color\"`);
};

for (const [file, data] of Object.entries(pages)) {
  let html = fs.readFileSync(file, "utf8");
  html = html.replace(/\s*<meta\s+name="description"\s+content="[^"]*"\s*\/>/g, "");
  html = html.replace(/\s*<meta property="og:image:width" content="[^"]*" \/>/g, "");
  html = html.replace(/\s*<meta property="og:image:height" content="[^"]*" \/>/g, "");
  html = html.replace('    <meta name="theme-color"', `    <meta name="description" content="${data.description}" />\n    <meta name="theme-color"`);
  html = replaceMeta(html, 'name="description"', data.description);
  html = replaceMeta(html, 'name="robots"', "index,follow,max-image-preview:large");
  html = replaceMeta(html, 'name="keywords"', data.keywords);
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${data.title}</title>`);
  html = html.replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${domain}${data.path}" />`);
  html = replaceMeta(html, 'property="og:title"', sharedOgTitle);
  html = replaceMeta(html, 'property="og:description"', sharedOgDescription);
  html = replaceMeta(html, 'property="og:url"', `${domain}${data.path}`);
  html = replaceMeta(html, 'property="og:image"', socialImage);
  html = html.replace('    <meta property="og:image:alt"', '    <meta property="og:image:width" content="1200" />\n    <meta property="og:image:height" content="630" />\n    <meta property="og:image:alt"');
  html = replaceMeta(html, 'property="og:image:alt"', "Revee Brand — marcas com significado, estruturadas para crescer");
  html = replaceMeta(html, 'name="twitter:card"', "summary_large_image");
  html = replaceMeta(html, 'name="twitter:title"', sharedOgTitle);
  html = replaceMeta(html, 'name="twitter:description"', sharedOgDescription);
  html = replaceMeta(html, 'name="twitter:image"', socialImage);
  html = html.replaceAll("https://reveebrand.com/portfolio", "https://reveebrand.com/projetos");
  html = html.replaceAll('href="/portfolio"', 'href="/projetos"');
  fs.writeFileSync(file, html);
}

for (const file of fs.readdirSync(".").filter((name) => name.endsWith(".html"))) {
  let html = fs.readFileSync(file, "utf8");
  html = html.replaceAll('href="/portfolio"', 'href="/projetos"');
  html = html.replaceAll("https://reveebrand.com/portfolio", "https://reveebrand.com/projetos");
  fs.writeFileSync(file, html);
}
