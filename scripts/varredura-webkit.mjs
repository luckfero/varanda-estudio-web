/**
 * Varredura dos quatro sites no WebKit — o motor do Safari.
 *
 *   node scripts/varredura-webkit.mjs
 *
 * Por que isto roda no GitHub Actions e não na máquina do Lucca: o WebKit do
 * Playwright não sobe no Windows dele. O Smart App Control recusa carregar os
 * DLLs do pacote por não terem assinatura de nível corporativo — o mesmo
 * motivo que bloqueia o FFmpeg ali. Desligar essa política é irreversível no
 * Windows 11 (só volta reinstalando), então a saída é rodar em Linux, onde
 * não existe essa restrição.
 *
 * Bate nos endereços **de produção**, não em build local: o objetivo é saber
 * o que o visitante de iPhone vê, e é lá que ele está.
 *
 * As checagens foram escolhidas onde Safari e Chrome divergem de verdade, e
 * cada uma já custou um defeito real nestes sites:
 *
 *   transbordo      medido contra `documentElement.clientWidth`, nunca
 *                   `innerWidth` — este último infla junto com o transbordo
 *                   e mascara o problema (foi assim que uma navbar quebrada
 *                   passou por várias verificações).
 *   cabeçalho fixo  `backdrop-filter` cria bloco de contenção para
 *                   `position: fixed` nos descendentes. Já causou dois bugs
 *                   distintos aqui, e o suporte difere entre os motores.
 *   imagens         `image-set()` e AVIF entraram no Safari bem depois. Uma
 *                   imagem que não decodifica aparece como `naturalWidth` 0,
 *                   não como erro de console.
 *   menu            o único controle com estado presente em todos os sites.
 */
import { chromium, webkit } from "playwright";
import { mkdir } from "node:fs/promises";

const SITES = [
  ["Varanda", "https://varandaestudioweb.com", ["/", "/privacidade"]],
  ["Brasa", "https://brasa.varandaestudioweb.com", ["/", "/cardapio", "/galeria", "/contato"]],
  ["Nivora", "https://nivora.varandaestudioweb.com", ["/pt", "/pt/projetos", "/pt/contato"]],
  ["Nascente", "https://nascente.varandaestudioweb.com", ["/", "/produtos", "/guia-olfativo"]],
];

/** iPhone 15 e um desktop. O celular é o caso que importa: lá o Safari é
 *  obrigatório, porque todo navegador no iOS usa WebKit por baixo. */
const TELAS = [
  ["celular", { width: 393, height: 852 }, 3, true],
  ["desktop", { width: 1440, height: 900 }, 2, false],
];

/* Um segundo motor serve de controle. Sem ele, um achado no WebKit pode ser
   defeito do site em qualquer navegador — e aí não é assunto desta varredura. */
const COMPARAR_COM_CHROMIUM = process.env.COMPARAR !== "0" && process.env.MOTOR !== "chromium";

const PASTA = "capturas";

function inspecionar() {
  const tela = document.documentElement.clientWidth;

  const cabecalho = document.querySelector(
    ".site-header, .header, header[class*=header], header",
  );
  const posicaoCabecalho = cabecalho ? getComputedStyle(cabecalho).position : "ausente";

  const imagens = [...document.images].filter((i) => {
    const r = i.getBoundingClientRect();
    return r.width > 4 && r.height > 4;
  });

  return {
    tela,
    doc: document.documentElement.scrollWidth,
    transborda: document.documentElement.scrollWidth > tela + 1,
    forasteiros: [...document.querySelectorAll("body *")]
      .filter((e) => {
        const r = e.getBoundingClientRect();
        return r.right > tela + 1 && r.width > 8;
      })
      .slice(0, 3)
      .map((e) => `${e.tagName.toLowerCase()}.${(e.className || "").toString().split(" ")[0].slice(0, 18)}`),
    posicaoCabecalho,
    topoCabecalho: cabecalho ? Math.round(cabecalho.getBoundingClientRect().top) : null,
    imagensVisiveis: imagens.length,
    imagensQuebradas: imagens.filter((i) => !i.complete || i.naturalWidth === 0)
      .map((i) => (i.currentSrc || i.src).split("/").pop())
      .slice(0, 3),
    temH1: !!document.querySelector("h1"),
  };
}

async function varrer(motor, nome) {
  const navegador = await motor.launch();
  const achados = [];

  for (const [site, base, rotas] of SITES) {
    for (const [nomeTela, viewport, dpr, movel] of TELAS) {
      for (const rota of rotas) {
        const ctx = await navegador.newContext({
          viewport, deviceScaleFactor: dpr, isMobile: movel, hasTouch: movel,
        });
        const page = await ctx.newPage();
        const problemas = [];
        page.on("console", (m) => { if (m.type() === "error") problemas.push(`console: ${m.text().slice(0, 70)}`); });
        page.on("pageerror", (e) => problemas.push(`exceção: ${String(e).slice(0, 70)}`));
        page.on("response", (r) => {
          if (r.status() >= 400 && !r.url().includes("favicon")) {
            problemas.push(`${r.status()} ${r.url().split("/").pop().slice(0, 40)}`);
          }
        });

        try {
          await page.goto(base + rota, { waitUntil: "networkidle", timeout: 60000 });
          /* Rolar tudo: revelação por scroll e imagem preguiçosa só aparecem
             depois de passar por elas. */
          await page.evaluate(async () => {
            for (let y = 0; y < document.body.scrollHeight; y += 500) {
              window.scrollTo(0, y);
              await new Promise((r) => setTimeout(r, 80));
            }
          });
          await page.waitForTimeout(700);

          /* O cabeçalho tem de continuar no topo depois da rolagem. Se um
             ancestral com `backdrop-filter` virou bloco de contenção, ele
             sobe junto com a página em vez de ficar preso. */
          const r = await page.evaluate(inspecionar);
          if (r.transborda) problemas.push(`transborda ${r.doc}>${r.tela} (${r.forasteiros.join(", ")})`);
          if (r.imagensQuebradas.length) problemas.push(`imagem sem decodificar: ${r.imagensQuebradas.join(", ")}`);
          if (!r.temH1) problemas.push("sem h1");
          if (r.posicaoCabecalho === "fixed" && r.topoCabecalho > 4) {
            problemas.push(`cabeçalho fixo escapou do topo (${r.topoCabecalho}px)`);
          }

          await page.evaluate(() => window.scrollTo(0, 0));
          await page.waitForTimeout(300);

          /* Menu do celular, onde existir. */
          if (movel) {
            const botao = page.locator(".menu-toggle, .header__menu, [class*=menu-toggle], button[aria-expanded]").first();
            if (await botao.count() && await botao.isVisible()) {
              await botao.click().catch(() => problemas.push("menu não aceitou clique"));
              await page.waitForTimeout(500);
              const abriu = await page.evaluate(() =>
                !!document.querySelector("[class*='is-open'], [aria-expanded='true'], nav[data-open='true']"));
              if (!abriu) problemas.push("menu não abriu");
            }
          }

          if (problemas.length) {
            await mkdir(PASTA, { recursive: true });
            const arquivo = `${PASTA}/${nome}-${site}-${nomeTela}${rota.replace(/\//g, "_")}.png`;
            await page.screenshot({ path: arquivo, fullPage: false });
          }
        } catch (e) {
          problemas.push(`navegação falhou: ${String(e).split("\n")[0].slice(0, 80)}`);
        }

        await ctx.close();
        const unicos = [...new Set(problemas)];
        const chave = `${site}${rota} · ${nomeTela}`;
        if (unicos.length) achados.push({ chave, problemas: unicos });
        console.log(`  ${unicos.length ? "✗" : "✓"} ${nome.padEnd(8)} ${chave.padEnd(46)} ${unicos.join(" | ")}`);
      }
    }
  }

  await navegador.close();
  return achados;
}

/* `MOTOR=chromium` existe para poder exercitar este arquivo na máquina do
   Lucca, onde o WebKit não sobe. Serve para conferir que o script funciona —
   não substitui a varredura de verdade, que é o WebKit no Actions. */
const motorPrincipal = process.env.MOTOR === "chromium" ? chromium : webkit;
const rotulo = process.env.MOTOR === "chromium" ? "chromium" : "webkit";

console.log(`═══ ${rotulo === "webkit" ? "WebKit (motor do Safari)" : "Chromium (ensaio local)"} ═══`);
const noWebkit = await varrer(motorPrincipal, rotulo);

let soNoSafari = noWebkit;
if (COMPARAR_COM_CHROMIUM && noWebkit.length) {
  console.log("\n═══ Chromium, como controle: separa 'bug do Safari' de 'bug do site' ═══");
  const noChromium = await varrer(chromium, "chromium");
  const mapaChromium = new Map(noChromium.map((a) => [a.chave, a.problemas]));
  soNoSafari = noWebkit
    .map((a) => ({
      chave: a.chave,
      problemas: a.problemas.filter((p) => !(mapaChromium.get(a.chave) ?? []).includes(p)),
    }))
    .filter((a) => a.problemas.length);
}

console.log("\n═══ resumo ═══");
if (!noWebkit.length) {
  console.log(`  ✓ nada a relatar no ${rotulo}`);
} else {
  console.log(`  ${noWebkit.length} rota(s) com achado no ${rotulo}; ${soNoSafari.length} exclusiva(s) dele:`);
  for (const a of soNoSafari) console.log(`    · ${a.chave} — ${a.problemas.join(" | ")}`);
  if (!soNoSafari.length) {
    console.log("    (todos aparecem também no Chromium — é defeito do site, não do Safari)");
  }
}

/* Falha o job só quando o problema é exclusivo do Safari. O que quebra nos
   dois motores é assunto das outras verificações, e falhar aqui por isso só
   ensinaria a ignorar este alarme. */
process.exit(soNoSafari.length ? 1 : 0);
