const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..");
const outputDir = path.join(root, "assets", "optimized");
const seoDir = path.join(root, "assets", "seo");
fs.mkdirSync(outputDir, { recursive: true });
fs.mkdirSync(seoDir, { recursive: true });

const images = [
  ["assets/daniela-escatalini.jpg", "revee-brand-daniela-escatalini-direcao-criativa", 1400],
  ["assets/gustavo-motta.jpg", "revee-brand-gustavo-motta-tecnologia-crescimento", 1400],
  ["assets/revee-ai-orb.png", "revee-brand-inteligencia-artificial", 640],
  ["assets/Cases/BelezaWellness/box.jpg", "revee-brand-beleza-wellness-packaging", 1920],
  ["assets/Cases/BelezaWellness/packaging-line.jpg", "revee-brand-beleza-wellness-linha-embalagens", 1920],
  ["assets/Cases/BelezaWellness/grid-products.jpg", "revee-brand-beleza-wellness-sistema-visual", 1920],
  ["assets/Cases/BelezaWellness/brand-system-3.jpg", "revee-brand-beleza-wellness-aplicacoes-marca", 1920],
  ["assets/Cases/BelezaWellness/product-hair.jpg", "revee-brand-beleza-wellness-produto-cabelo", 1200],
  ["assets/Cases/BelezaWellness/product-wood.jpg", "revee-brand-beleza-wellness-produto-madeira", 1200],
  ["assets/Cases/BelezaWellness/brand-system-1.jpg", "revee-brand-beleza-wellness-brand-system", 1920],
  ["assets/Cases/C.Arq/capa priemeira foto.png", "revee-brand-c-arq-identidade-visual", 1920],
  ["assets/Cases/C.Arq/mockup-billboard-station.png", "revee-brand-c-arq-campanha-urbana", 1920],
  ["assets/Cases/C.Arq/mockup-billboard-exterior.png", "revee-brand-c-arq-branding-exterior", 1920],
  ["assets/Cases/CavaliCarvalho/cover.jpg", "revee-brand-cavali-carvalho-branding", 1920],
  ["assets/Cases/CavaliCarvalho/logo-grid.jpg", "revee-brand-cavali-carvalho-construcao-logotipo", 1920],
  ["assets/Cases/CavaliCarvalho/business-cards-fabric.jpg", "revee-brand-cavali-carvalho-cartoes-visita", 1920],
  ["assets/Cases/CavaliCarvalho/presentation.jpg", "revee-brand-cavali-carvalho-apresentacao-institucional", 1920],
  ["assets/Cases/CavaliCarvalho/helmet.jpg", "revee-brand-cavali-carvalho-identidade-capacete", 1600],
  ["assets/Cases/CavaliCarvalho/stone-card.jpg", "revee-brand-cavali-carvalho-aplicacao-marca", 1920],
  ["assets/Cases/CavaliCarvalho/phone-website.jpg", "revee-brand-cavali-carvalho-website-mobile", 1400]
];

async function optimize(source, name, width) {
  const input = path.join(root, source);
  const pipeline = sharp(input).rotate().resize({ width, withoutEnlargement: true });
  await pipeline.clone().webp({ quality: 82, effort: 5 }).toFile(path.join(outputDir, `${name}.webp`));
  await pipeline.clone().avif({ quality: 52, effort: 5 }).toFile(path.join(outputDir, `${name}.avif`));
}

async function createBrandAssets() {
  const logo = await sharp(path.join(root, "assets/logo-horizontal-black.png"))
    .resize({ width: 560, withoutEnlargement: true })
    .negate({ alpha: false })
    .png()
    .toBuffer();

  await sharp({ create: { width: 1200, height: 630, channels: 4, background: "#000000" } })
    .composite([{ input: logo, gravity: "center" }])
    .webp({ quality: 88 })
    .toFile(path.join(seoDir, "revee-brand-agencia-branding-piracicaba.webp"));

  const symbol = sharp(path.join(root, "assets/logo-symbol-black.png")).negate({ alpha: false });
  await symbol.clone().resize(32, 32, { fit: "contain", background: "#000000" }).png().toFile(path.join(root, "favicon-32x32.png"));
  await symbol.clone().resize(180, 180, { fit: "contain", background: "#000000" }).png().toFile(path.join(root, "apple-touch-icon.png"));
  await symbol.clone().resize(192, 192, { fit: "contain", background: "#000000" }).png().toFile(path.join(root, "icon-192.png"));
  await symbol.clone().resize(512, 512, { fit: "contain", background: "#000000" }).png().toFile(path.join(root, "icon-512.png"));

  await sharp(path.join(root, "assets/logo-horizontal-black.png"))
    .png({ compressionLevel: 9 })
    .toFile(path.join(outputDir, "revee-brand-logo-oficial.png"));
}

async function createCaseOg(source, name) {
  await sharp(path.join(root, source))
    .rotate()
    .resize(1200, 630, { fit: "cover", position: "attention" })
    .webp({ quality: 86 })
    .toFile(path.join(seoDir, name));
}

async function main() {
  for (const image of images) await optimize(...image);
  await createBrandAssets();
  await createCaseOg("assets/Cases/C.Arq/capa priemeira foto.png", "revee-brand-c-arq-case.webp");
  await createCaseOg("assets/Cases/BelezaWellness/box.jpg", "revee-brand-beleza-wellness-case.webp");
  await createCaseOg("assets/Cases/CavaliCarvalho/cover.jpg", "revee-brand-cavali-carvalho-case.webp");
  fs.copyFileSync(
    path.join(root, "assets/Cases/C.Arq/c-arq-motion.mp4"),
    path.join(outputDir, "revee-brand-c-arq-identidade-visual-motion.mp4")
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
