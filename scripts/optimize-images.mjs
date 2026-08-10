/**
 * Gera variantes responsivas (WebP + AVIF) a partir dos originais em
 * public/images/.
 *
 *   node scripts/optimize-images.mjs
 *
 * Saída: public/images/r/<nome>-<largura>.<webp|avif>
 * Os originais ficam intactos e continuam servindo de último recurso para
 * navegador que não aceite nenhum dos dois formatos.
 *
 * Usa `sharp`, que é um módulo nativo carregado no próprio processo. A
 * alternativa natural seria ffmpeg, mas nesta máquina ele está bloqueado
 * por política de Controle de Aplicativo do Windows.
 *
 * Por que a saída é versionada: o build da Cloudflare não roda este script,
 * então as variantes precisam chegar prontas no repositório. Depois de
 * trocar qualquer foto em public/images/, rode de novo e commite.
 */
import sharp from "sharp";
import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import { dirname, join, parse } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
/* A origem fica fora de `public/`: sao os arquivos cheios, que nao devem
   ser servidos. Um deles e remontado por scripts/restore-assets.sh. */
const SOURCE_DIR = join(root, "assets", "originais");
const OUT_DIR = join(root, "public", "images", "r");

/** Larguras alvo. Imagem menor que a largura nunca é ampliada.
 *
 * O 2200 existe por causa de um salto medido em produção. A foto do
 * Nascente tem 3344px de origem e, sem nada entre 1600 e 3344, o celular era
 * obrigado a baixar os 3344 — 317 KB para exibir algo que precisa de ~2050.
 * Um celular de 360px com DPR 3 exige 2052px de origem para não perder
 * nitidez (altura da caixa × proporção × DPR); 2200 cobre isso com folga e
 * é o teto real da faixa móvel. As outras duas fotos têm origem menor que
 * 2200 e simplesmente não ganham esta variante. */
const WIDTHS = [480, 800, 1200, 1600, 2200];

/* Qualidade de codificação.
 *
 * O AVIF começou em 50 e ficou baixo demais: a foto do hero da Nívora saía
 * com 43 KB em 1200px e a folhagem virava borrão. 62 custa ~28 KB a mais e
 * segura a textura fina, que é onde a diferença aparece numa foto de
 * arquitetura. Ainda é metade do WebP equivalente.
 */
const Q_AVIF = 62;
const Q_WEBP = 86;

const kb = (n) => Math.round(n / 1024);

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const files = (await readdir(SOURCE_DIR, { withFileTypes: true }))
    .filter((e) => e.isFile() && /\.(png|jpe?g|webp)$/i.test(e.name))
    .map((e) => e.name)
    .sort();

  let escritas = 0;
  let origemTotal = 0;
  let menorTotal = 0;

  /* Quais larguras existem de fato para cada imagem. Sem isto o `srcset`
     acabaria citando arquivos que nunca foram gerados — imagem menor que
     uma largura alvo não é ampliada, então nem toda foto tem as quatro. */
  const manifesto = {};

  for (const file of files) {
    const source = join(SOURCE_DIR, file);
    const { name } = parse(file);
    const entrada = sharp(source);
    const { width: larguraOrigem } = await entrada.metadata();
    const tamanhoOrigem = (await stat(source)).size;
    origemTotal += tamanhoOrigem;

    let menorAvif = null;
    const disponiveis = [];
    /* Gera também na largura nativa sempre que ela não coincidir com uma das
       padrão. A condição antes era "maior que a maior largura", e deixava
       de fora justamente o caso comum: uma foto de 1.584px ficava com 1.200
       como teto, porque 1.600 é maior que ela e era descartado. Aí qualquer
       caixa que precisasse de mais de 1.200 — por recorte ou por tela densa
       — ampliava sem ter necessidade. */
    const larguras = WIDTHS.includes(larguraOrigem)
      ? WIDTHS
      : [...WIDTHS, larguraOrigem].sort((a, b) => a - b);
    for (const width of larguras) {
      if (width > larguraOrigem) continue;
      disponiveis.push(width);
      /* Um pipeline novo por saída: reutilizar a mesma instância entre
         codificações faz o sharp reprocessar a origem já consumida. */
      const redimensionada = () => sharp(source).resize({ width, kernel: "lanczos3" });

      const webp = await redimensionada().webp({ quality: Q_WEBP }).toBuffer();
      await writeFile(join(OUT_DIR, `${name}-${width}.webp`), webp);

      const avif = await redimensionada().avif({ quality: Q_AVIF, effort: 5 }).toBuffer();
      await writeFile(join(OUT_DIR, `${name}-${width}.avif`), avif);

      escritas += 2;
      if (menorAvif === null) menorAvif = avif.length;
    }

    manifesto[name] = disponiveis;
    if (menorAvif !== null) menorTotal += menorAvif;
    console.log(
      `· ${name.padEnd(28)} ${String(larguraOrigem).padStart(4)}px  ` +
        `origem ${String(kb(tamanhoOrigem)).padStart(5)} KB  →  ` +
        `menor AVIF ${menorAvif === null ? "—" : kb(menorAvif)} KB`,
    );
  }

  /* Módulo TypeScript em vez de JSON: o import de `.json` não resolve
     no ambiente RSC do vinext. Gerado — não editar à mão. */
  const linhas = Object.entries(manifesto)
    .map(([nome, larguras]) => `  ${JSON.stringify(nome)}: [${larguras.join(", ")}],`)
    .join("\n");
  await writeFile(
    join(root, "app", "image-manifest.ts"),
    `/* Gerado por scripts/optimize-images.mjs. Não editar à mão.\n` +
      ` * Larguras que existem de fato para cada imagem em public/images/r/. */\n` +
      `export const imageWidths: Record<string, number[]> = {\n${linhas}\n};\n`,
  );

  console.log(
    `\nManifesto em app/image-manifest.ts (${Object.keys(manifesto).length} imagens).\n` +
      `${escritas} variantes em public/images/r/.\n` +
      `Menor AVIF de cada imagem somado: ${kb(menorTotal)} KB contra ${kb(origemTotal)} KB dos originais ` +
      `— ${Math.round((1 - menorTotal / origemTotal) * 100)}% menor.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
