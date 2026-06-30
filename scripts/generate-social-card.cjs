const path = require("node:path");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..");
const output = path.join(root, "assets/seo/revee-brand-compartilhamento-1200x630.png");
const logo = path.join(root, "assets/optimized/revee-brand-logo-oficial.png");

const artwork = Buffer.from(`
  <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <style>
      .headline { fill: #f4f3ef; font-family: Helvetica, Arial, sans-serif; font-size: 68px; font-weight: 300; }
      .strong { font-weight: 700; }
      .meta { fill: #999997; font-family: Helvetica, Arial, sans-serif; font-size: 18px; letter-spacing: 1.4px; }
    </style>
    <text x="72" y="275" class="headline">Marcas com <tspan class="strong">significado</tspan>.</text>
    <text x="72" y="351" class="headline">Estruturadas para <tspan class="strong">crescer</tspan>.</text>
    <line x1="72" y1="524" x2="1128" y2="524" stroke="#2a2a2a" stroke-width="1"/>
    <text x="72" y="568" class="meta">BRAND SYSTEMS AGENCY</text>
    <text x="1128" y="568" class="meta" text-anchor="end">BRAZIL · GLOBAL PROJECTS</text>
  </svg>
`);

async function generate() {
  const resizedLogo = await sharp(logo).resize({ width: 278 }).negate({ alpha: false }).png().toBuffer();
  await sharp({
    create: { width: 1200, height: 630, channels: 4, background: "#000000" },
  })
    .composite([
      { input: resizedLogo, left: 72, top: 58 },
      { input: artwork, left: 0, top: 0 },
    ])
    .png({ compressionLevel: 9 })
    .toFile(output);
}

generate().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
