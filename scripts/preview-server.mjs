import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.argv[2] || 4192);
const routes = new Map([
  ["/", "index.html"],
  ["/servicos", "services.html"],
  ["/projetos", "cases.html"],
  ["/cultura", "culture.html"],
  ["/sobre", "about.html"],
  ["/aplicar", "contact.html"],
  ["/journal", "journal.html"],
  ["/daniela-escatalini", "daniela-escatalini.html"],
  ["/projetos/c-arq", "case-carq.html"],
  ["/projetos/beleza-wellness", "case-beleza-wellness.html"],
  ["/projetos/cavali-carvalho", "case-cavalicarvalho.html"],
]);
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".otf": "font/otf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".webp": "image/webp",
  ".xml": "application/xml; charset=utf-8",
};

const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname).replace(/\/$/, "") || "/";
  let relativePath = routes.get(pathname);
  if (!relativePath && pathname.startsWith("/journal/")) relativePath = `journal-${pathname.slice("/journal/".length)}.html`;
  if (!relativePath) relativePath = pathname.replace(/^\//, "");

  const filePath = path.resolve(root, relativePath);
  if (!filePath.startsWith(`${root}${path.sep}`) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Página não encontrada.");
    return;
  }

  response.writeHead(200, { "Content-Type": mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(response);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Prévia Revee disponível em http://127.0.0.1:${port}`);
});
