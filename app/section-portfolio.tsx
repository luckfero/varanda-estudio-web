import { featuredAssets, projectAssets } from "./data";
import { ArrowIcon } from "./icons";
import type { Dicionario } from "./i18n";
import Picture from "./picture";

/**
 * Portfólio.
 *
 * **Redesenhado em 25/08/2026, e a versão anterior foi rejeitada inteira.**
 * O que saiu: fundo ocre, cartões claros com barra de navegador falsa em cima
 * da imagem, e o carrossel com setas. O que entrou é uma faixa escura em que
 * as telas dos próprios sites são a única fonte de luz.
 *
 * Três decisões que sustentam o desenho e que se quebram sem querer:
 *
 * 1. **A seção se separa só pela troca de cor**, como todas as outras da
 *    página. Houve aqui uma rampa que esfriava o verde de cima até o preto,
 *    mais dois fios de ocre nas bordas; saíram a pedido em 25/08/2026, porque
 *    faziam esta seção ser a única com tratamento de borda.
 * 2. **Não há mais carrossel.** Os cinco projetos existem ao mesmo tempo no
 *    documento, o que também tira do caminho o gesto de arrasto, os pontos e
 *    as setas. Nada aqui depende de estado, então o componente não precisa
 *    mais de `useState`.
 * 3. **A hierarquia é de tamanho, não de rótulo.** Publicado ocupa uma placa
 *    de largura quase inteira; conceitual ocupa um terço de uma grade recuada.
 *    O rótulo confirma o que o tamanho já disse, e é isso que impede trabalho
 *    fictício de parecer trabalho de cliente mesmo para quem não lê o aviso.
 */
export default function SectionPortfolio({ portfolio }: { portfolio: Dicionario["portfolio"] }) {
  const t = { portfolio };

  return (
    <section className="portfolio section" id="portfolio" aria-labelledby="portfolio-title">
      <div className="portfolio-wrap">
        <header className="portfolio-cabeca" data-reveal>
          <div>
            <p className="section-index">{t.portfolio.indice}</p>
            <h2 id="portfolio-title">
              {t.portfolio.tituloAntes} <em>{t.portfolio.tituloDestaque}</em>
            </h2>
          </div>
          <p className="portfolio-resumo">{t.portfolio.resumo}</p>
        </header>

        {/* --- No ar ---------------------------------------------------- */}
        <div className="portfolio-trilho" data-reveal>
          <span className="portfolio-marca portfolio-marca--no-ar">{t.portfolio.noArIndice}</span>
          <span className="portfolio-trilho-nota">{t.portfolio.noArNota}</span>
        </div>

        <ol className="portfolio-placas">
          {t.portfolio.destaques.map((projeto, index) => {
            const asset = featuredAssets[index];
            if (!asset) return null;
            /* A segunda placa inverte os lados. É o que dá ritmo a uma lista
               de dois; com as duas iguais, a segunda lê como repetição. */
            const invertida = index % 2 === 1;
            return (
              <li key={projeto.name} data-reveal>
                <a
                  className={`portfolio-placa${invertida ? " portfolio-placa--invertida" : ""}`}
                  href={asset.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${t.portfolio.visitar}${projeto.name}${t.portfolio.visitarDepois}`}
                >
                  <figure className="portfolio-figura">
                    {/* Duas colunas acima de 880px, uma abaixo. A caixa tem
                        proporção livre aqui: a imagem entra inteira, sem
                        `cover`, então quem manda no `sizes` é a largura. */}
                    <Picture
                      name={asset.image}
                      alt={projeto.imageAlt}
                      sizes="(max-width: 880px) 92vw, (max-width: 1280px) 56vw, 660px"
                    />
                  </figure>

                  <div className="portfolio-corpo">
                    <p className="portfolio-meta">{projeto.label}</p>
                    <h3>{projeto.name}</h3>
                    <p className="portfolio-descricao">{projeto.description}</p>
                    <ul className="portfolio-entregas">
                      {projeto.features.map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                    <p className="portfolio-endereco">
                      {asset.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                      <span aria-hidden="true">↗</span>
                    </p>
                  </div>
                </a>
              </li>
            );
          })}
        </ol>

        {/* --- Estudos conceituais -------------------------------------- */}
        <div className="portfolio-estudos" data-reveal>
          <div className="portfolio-trilho">
            <span className="portfolio-marca portfolio-marca--estudo">{t.portfolio.estudosIndice}</span>
            <span className="portfolio-trilho-nota">{t.portfolio.estudosNota}</span>
          </div>

          <p className="portfolio-aviso">{t.portfolio.aviso}</p>

          <ul className="portfolio-estudos-lista">
            {t.portfolio.projetos.map((projeto, index) => {
              const asset = projectAssets[index];
              if (!asset) return null;
              return (
                <li className="portfolio-estudo" key={projeto.name}>
                  {/* Continua clicável, e isso é decisão comercial, não
                      estética: os três existem em subdomínio próprio
                      justamente para o prospect abrir, e para prospect de um
                      setor com peça própria o link vai direto para ela. A
                      honestidade fica por conta do selo e do aviso acima, que
                      o visitante lê antes de chegar aqui. */}
                  <a
                    href={asset.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${t.portfolio.abrirAntes}${projeto.name}${t.portfolio.abrirDepois}`}
                  >
                    <figure>
                      <Picture
                        name={asset.image}
                        alt={projeto.imageAlt}
                        sizes="(max-width: 880px) 92vw, 360px"
                      />
                    </figure>
                    <h3>{projeto.name}</h3>
                    <span className="portfolio-meta">{projeto.label}</span>
                    <span className="portfolio-selo">{t.portfolio.conceitualSelo}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        {/* A chamada fecha a seção, e o lugar não é decorativo: aqui é onde a
            objeção "será que eles conseguem fazer isso?" acabou de morrer,
            olhando cinco projetos. Sem ela, a próxima coisa clicável no
            celular estava a 7.839px — 9,3 telas de rolagem sem uma ação. */}
        <div className="portfolio-chamada" data-reveal>
          <p>{t.portfolio.ctaTexto}</p>
          <a className="button button--cream" href="#contato">
            {t.portfolio.ctaBotao} <ArrowIcon />
          </a>
        </div>
      </div>
    </section>
  );
}
