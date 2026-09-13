// Gera app/extras-arte.tsx e app/extras-arte.css a partir dos mestres em
// assets/extras-arte/<chave>.svg (e <chave>.css, o gesto próprio, quando há).
//
// Por que um gerador e não o SVG colado à mão no componente: o mestre é o
// arquivo que se abre, se renderiza quadro a quadro e se corrige. Colar à mão
// em JSX exige trocar cada atributo para camelCase e cada `style` para objeto,
// e a primeira correção feita só num dos dois lados separa desenho de site.
//
// uso: node scripts/gerar-extras-arte.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pasta = path.join(raiz, "assets", "extras-arte");
const CHAVES = ["pagina", "redacao", "integracao", "rodada", "avulsa", "reparo"];

const camel = (nome) => nome.replace(/-([a-z])/g, (_, l) => l.toUpperCase());
const NAO_CONVERTER = new Set(["viewBox", "pathLength", "gradientUnits", "gradientTransform", "patternUnits", "preserveAspectRatio"]);

function atributos(texto) {
  const saida = [];
  for (const m of texto.matchAll(/([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*"([^"]*)"/g)) {
    let [, nome, valor] = m;
    if (nome === "xmlns" || nome.startsWith("xmlns:") || nome === "aria-hidden" || nome === "focusable") continue;
    if (nome === "class") { saida.push(`className=${JSON.stringify(valor)}`); continue; }
    if (nome === "style") {
      const obj = Object.fromEntries(valor.split(";").map((p) => p.trim()).filter(Boolean).map((p) => {
        const i = p.indexOf(":");
        const k = p.slice(0, i).trim();
        return [k.startsWith("--") ? k : camel(k), p.slice(i + 1).trim()];
      }));
      saida.push(`style={${JSON.stringify(obj)} as CSSProperties}`);
      continue;
    }
    if (!NAO_CONVERTER.has(nome) && !nome.startsWith("data-")) nome = camel(nome);
    saida.push(`${nome}=${JSON.stringify(valor)}`);
  }
  return saida.join(" ");
}

function paraJsx(svg) {
  const limpo = svg.replace(/<\?xml[^>]*>/g, "").replace(/<!--[\s\S]*?-->/g, "").trim();
  return limpo.replace(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)([^>]*?)(\/?)>/g, (_, fecha, tag, attrs, auto) => {
    if (fecha) return `</${tag}>`;
    const a = atributos(attrs);
    return `<${tag}${a ? " " + a : ""}${auto ? " /" : ""}>`;
  }).replace(/<svg /, `<svg aria-hidden="true" focusable="false" `);
}

const casos = [];
const folhas = [];
for (const chave of CHAVES) {
  const svgPath = path.join(pasta, `${chave}.svg`);
  if (!fs.existsSync(svgPath)) throw new Error(`falta o mestre ${svgPath}`);
  casos.push(`    case ${JSON.stringify(chave)}:\n      return (\n        ${paraJsx(fs.readFileSync(svgPath, "utf8")).split("\n").join("\n        ")}\n      );`);
  const cssPath = path.join(pasta, `${chave}.css`);
  if (fs.existsSync(cssPath)) folhas.push(`/* ${chave} */\n${fs.readFileSync(cssPath, "utf8").trim()}`);
}

const tsx = `/* GERADO por scripts/gerar-extras-arte.mjs a partir de assets/extras-arte/.
   Não editar à mão: corrigir o SVG mestre e rodar o gerador de novo. */
import type { CSSProperties } from "react";

export default function ArteExtra({ arte }: { arte: string }) {
  switch (arte) {
${casos.join("\n")}
    default:
      return null;
  }
}
`;
fs.writeFileSync(path.join(raiz, "app", "extras-arte.tsx"), tsx);
fs.writeFileSync(path.join(raiz, "app", "extras-arte.css"), `/* GERADO por scripts/gerar-extras-arte.mjs: o gesto próprio de cada ilustração. */\n${folhas.join("\n\n")}\n`);
console.log(`ok: ${CHAVES.length} ilustrações, ${folhas.length} com gesto próprio`);
