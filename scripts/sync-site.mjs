import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const html = await readFile(resolve(projectRoot, "index.html"), "utf8");
const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<script src="script-v2\.js"><\/script>\s*<\/body>/i);

if (!bodyMatch) {
  throw new Error("No se pudo extraer el contenido principal de index.html.");
}

const bodyHtml = bodyMatch[1].trim();
await mkdir(resolve(projectRoot, "app"), { recursive: true });
await mkdir(resolve(projectRoot, "public"), { recursive: true });

await writeFile(
  resolve(projectRoot, "app", "site-body.generated.ts"),
  "export const bodyHtml = " + JSON.stringify(bodyHtml) + ";\n",
  "utf8"
);

await cp(
  resolve(projectRoot, "styles-v2.css"),
  resolve(projectRoot, "public", "styles-v2.css")
);
await cp(
  resolve(projectRoot, "script-v2.js"),
  resolve(projectRoot, "public", "script-v2.js")
);
await cp(resolve(projectRoot, "assets"), resolve(projectRoot, "public", "assets"), {
  recursive: true,
  force: true,
});
await cp(
  resolve(projectRoot, "assets", "og-doctor-pep-v2.png"),
  resolve(projectRoot, "public", "og.png")
);
