import type { CSSProperties } from "react";
import { depoimentos, featuredAssets, projectAssets } from "./data";
import type { Dicionario } from "./i18n";

/**
 * Portfólio, na identidade nova (bloco 13 do protótipo aprovado em
 * 27/08/2026). Os nomes de classe saem verbatim da marcação de referência.
 *
 * Componente de SERVIDOR, e continua sendo: nada aqui tem estado. Recebe a
 * fatia `portfolio` do dicionário, nunca o dicionário inteiro, porque
 * propriedade de componente cliente viaja serializada até o navegador e o
 * dicionário completo levava junto o texto da política, que é o único lugar
 * do site com o nome de uma pessoa física.
 *
 * TRÊS COISAS QUE SUSTENTAM O DESENHO E SE QUEBRAM SEM QUERER:
 *
 * 1. **A hierarquia é de tamanho, não de rótulo.** Publicado ocupa uma placa
 *    de largura inteira; conceitual ocupa um terço de uma grade. O selo
 *    confirma o que o tamanho já disse, e é isso que impede trabalho
 *    fictício de parecer trabalho de cliente para quem não lê o aviso.
 * 2. **A placa inteira NÃO é um link.** Só o endereço é. Foi assim que a
 *    marcação de referência resolveu, e é o certo: dentro da placa há um
 *    título, uma lista e um endereço, e embrulhar tudo num `<a>` entrega ao
 *    leitor de tela um único link com o parágrafo inteiro por nome.
 * 3. **Os estudos continuam clicáveis**, e isso é decisão comercial e não
 *    estética: os três existem em subdomínio próprio justamente para o
 *    prospect abrir, e para prospect de um setor com peça própria o link vai
 *    direto para ela. A honestidade fica por conta do selo e do aviso, que o
 *    visitante lê antes de chegar no cartão.
 *
 * O QUE MUDOU DO PROTÓTIPO PARA CÁ, e é o ponto delicado desta seção: lá a
 * capa era uma AMOSTRA de cor média com o hexadecimal impresso, porque um
 * HTML solto não carrega imagem, e a etiqueta acessível descrevia essa
 * amostra. Aqui as capas existem, e voltam. Com a foto de volta, a descrição
 * volta a ser de fotografia e sai de `projeto.imageAlt`, que é onde ela
 * sempre morou; o `role="img"` com `aria-label` sai junto, porque agora há um
 * `<img>` de verdade com `alt` e dois nomes para a mesma coisa seria pior que
 * nenhum. A cor média continua servindo, como chão da caixa enquanto o
 * arquivo não chegou (ver `portfolio.css`).
 */

/**
 * O nome do arquivo da capa → o token de cor média que `base.css` declara
 * para ela.
 *
 * Casado por NOME e não por posição, de propósito. `app/data.ts` não é
 * arquivo desta rodada, então o token não pôde ir morar lá junto do resto do
 * ativo; e casar por índice acrescentaria uma **quinta** lista pareada por
 * posição às quatro que já existem (`featuredAssets`, `projectAssets` e os
 * três dicionários), que é o tipo de desalinhamento que nenhuma revisão
 * visual em português pega. Nome que não estiver aqui só fica sem chão de
 * carregamento, que é o pior caso aceitável.
 */
const amostraDaCapa: Record<string, string> = {
  "casa-conexao": "casa",
  "milenio": "milenio",
  "nivora": "nivora",
  "nascente": "nascente",
  "brasa-do-vale": "brasa",
};

function classeDaAmostra(imagem: string): string {
  const chave = amostraDaCapa[imagem];
  return chave ? `amostra amostra--${chave}` : "amostra";
}

/** "https://casaconexao.varandaestudioweb.com/" → "casaconexao.varandaestudioweb.com" */
function semEsquema(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

/**
 * A seta diagonal de "isto abre em outra aba".
 *
 * Mora aqui e não em `app/icons.tsx` porque aquele arquivo não é desta
 * rodada. Quando a peça inteira estiver portada, ela sobe para lá junto com
 * as outras, no padrão que o `ArcoMark` já fixou.
 */
function SetaExterna() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 7h10v10M7 17 17 7" />
    </svg>
  );
}

export default function SectionPortfolio({ portfolio }: { portfolio: Dicionario["portfolio"] }) {
  return (
    <section className="secao" id="portfolio" aria-labelledby="titulo-portfolio">
      <div className="caixa">
        {/* O numeral do rótulo é a POSIÇÃO da seção na página, não texto
            comercial: ele não se traduz e por isso não vem do dicionário,
            exatamente como na marcação de referência. Mudar a ordem das
            seções obriga a mudar o número aqui. */}
        <div className="cabeca-secao" data-reveal>
          <div>
            <p className="rotulo">
              <b>04</b>
              <i aria-hidden="true" />
              {portfolio.indice}
            </p>
            <h2 className="titulo-secao titulo-secao--largo" id="titulo-portfolio">
              {portfolio.tituloAntes} <em>{portfolio.tituloDestaque}</em>
            </h2>
          </div>
        </div>

        {/* --- No ar ---------------------------------------------------- */}
        <div className="trilho" data-reveal>
          <span className="selo">{portfolio.noArIndice}</span>
          <span className="trilho-nota">{portfolio.noArNota}</span>
        </div>

        <ol className="placas" role="list">
          {portfolio.destaques.map((projeto, index) => {
            const asset = featuredAssets[index];
            if (!asset) return null;
            /* A segunda placa inverte os lados. Com as duas iguais, a segunda
               lê como repetição da primeira em vez de segundo trabalho. */
            const invertida = index % 2 === 1;
            return (
              <li key={projeto.name} data-reveal>
                <article className={`placa${invertida ? " placa--invertida" : ""}`}>
                  {/* A CAPA E O LINK DO SITE, e desde 02/09/2026 ela e o UNICO.

                      O endereco amarelo saiu do corpo do cartao e subiu para a
                      plaquinha da capa, a pedido. O nome do projeto, que estava
                      ali, saiu: ele nao se perde, porque continua sendo o `h3`
                      do corpo, tres linhas abaixo.

                      ISSO MUDA A ACESSIBILIDADE, e a mudanca e obrigatoria.
                      Enquanto o endereco era um link no corpo, esta capa era
                      `aria-hidden` com `tabIndex={-1}`, para nao anunciar duas
                      vezes o mesmo destino. Sem aquele link, esconder esta capa
                      deixaria o site sem NENHUMA forma de chegar no projeto por
                      teclado ou por leitor de tela. Entao ela e um link de
                      verdade agora, com nome acessivel completo pelo `.so-leitor`.

                      Pela mesma razao o desenho da capa virou decorativo: dentro
                      de um link, o `aria-label` dele entraria no nome acessivel
                      e o leitor anunciaria a marca, o endereco e o convite, tudo
                      emendado.

                      Por que o desenho e FUNDO e nao `<img>`: `<img>` tem tamanho
                      intrinseco, e ele vazava para a grade — com `aspect-ratio`
                      para conter a altura, a largura minima vinha junto e a
                      coluna da capa saia com 698px onde a grade pede 591. */}
                  <a
                    className={classeDaAmostra(asset.image)}
                    href={asset.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span
                      className="amostra-arte"
                      aria-hidden="true"
                      style={{ backgroundImage: `url(/marcas/${asset.image}.svg)` }}
                    />
                    <span className="amostra-veu" aria-hidden="true" />
                    <span className="amostra-placa">
                      <span className="amostra-endereco">
                        {semEsquema(asset.url)}
                        <SetaExterna />
                      </span>
                    </span>
                    <span className="so-leitor">
                      {`${portfolio.visitar}${projeto.name}${portfolio.visitarDepois}`}
                    </span>
                  </a>

                  <div className="placa-corpo">
                    <p className="mono mono--acento">{projeto.label}</p>
                    <h3>{projeto.name}</h3>
                    <p>{projeto.description}</p>
                    <ul className="entregas" role="list">
                      {projeto.features.map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>

        {/* --- Estudos conceituais -------------------------------------- */}
        <div className="estudos">
          <div className="trilho" data-reveal>
            <span className="selo selo--neutro">{portfolio.estudosIndice}</span>
            <span className="trilho-nota">{portfolio.estudosNota}</span>
          </div>

          <p className="aviso" data-reveal>
            {portfolio.aviso}
          </p>

          <ul className="estudos-lista" role="list">
            {portfolio.projetos.map((projeto, index) => {
              const asset = projectAssets[index];
              if (!asset) return null;
              /* A escada de atraso vem escrita por elemento, que é como a
                 marcação de referência faz. A revelação lê `--atraso` com 0ms
                 de padrão, então o primeiro cartão não precisa de nada. */
              const atraso = index > 0 ? ({ "--atraso": `${index * 90}ms` } as CSSProperties) : undefined;
              return (
                <li className="cartao cartao--interativo estudo" key={projeto.name} data-reveal style={atraso}>
                  {/* A CAPA E O LINK DO SITE, e desde 02/09/2026 ela e o UNICO.

                      O endereco amarelo saiu do corpo do cartao e subiu para a
                      plaquinha da capa, a pedido. O nome do projeto, que estava
                      ali, saiu: ele nao se perde, porque continua sendo o `h3`
                      do corpo, tres linhas abaixo.

                      ISSO MUDA A ACESSIBILIDADE, e a mudanca e obrigatoria.
                      Enquanto o endereco era um link no corpo, esta capa era
                      `aria-hidden` com `tabIndex={-1}`, para nao anunciar duas
                      vezes o mesmo destino. Sem aquele link, esconder esta capa
                      deixaria o site sem NENHUMA forma de chegar no projeto por
                      teclado ou por leitor de tela. Entao ela e um link de
                      verdade agora, com nome acessivel completo pelo `.so-leitor`.

                      Pela mesma razao o desenho da capa virou decorativo: dentro
                      de um link, o `aria-label` dele entraria no nome acessivel
                      e o leitor anunciaria a marca, o endereco e o convite, tudo
                      emendado.

                      Por que o desenho e FUNDO e nao `<img>`: `<img>` tem tamanho
                      intrinseco, e ele vazava para a grade — com `aspect-ratio`
                      para conter a altura, a largura minima vinha junto e a
                      coluna da capa saia com 698px onde a grade pede 591. */}
                  <a
                    className={classeDaAmostra(asset.image)}
                    href={asset.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span
                      className="amostra-arte"
                      aria-hidden="true"
                      style={{ backgroundImage: `url(/marcas/${asset.image}.svg)` }}
                    />
                    <span className="amostra-veu" aria-hidden="true" />
                    <span className="amostra-placa">
                      <span className="amostra-endereco">
                        {semEsquema(asset.url)}
                        <SetaExterna />
                      </span>
                    </span>
                    <span className="so-leitor">
                      {`${portfolio.abrirAntes}${projeto.name}${portfolio.abrirDepois}`}
                    </span>
                  </a>

                  <div className="estudo-corpo">
                    <div className="estudo-alto">
                      <h3>{projeto.name}</h3>
                      {/* `selo--conceitual`, e não o `.selo` genérico.
                          O selo virou classe compartilhada no porte, a mesma
                          do rótulo de subseção, e com isso o aviso de que a
                          empresa NÃO EXISTE deixou de ser distinguível de um
                          título qualquer. Ele é a rede de segurança de quem
                          chega direto pelo link de um estudo, e por isso tem
                          gancho próprio: para o CSS, para o teste que o conta,
                          e para quem for ler o código depois. */}
                      <span className="selo selo--conceitual">{portfolio.conceitualSelo}</span>
                    </div>
                    <p className="mono">{projeto.label}</p>
                    <p>{projeto.description}</p>
                    <ul className="entregas" role="list">
                      {projeto.features.map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Depoimento, quando existir um de verdade.
            O `depoimentos.length > 0` não é defesa contra erro: é o que
            garante que o bloco **não apareça vazio nem com frase de mentira**
            enquanto ninguém tiver dito nada. Ver o comentário em `data.ts`.
            Não há marcação de referência para ele no protótipo, justamente
            porque lá também não havia o que desenhar. */}
        {depoimentos.length > 0 && (
          <div className="depoimentos" data-reveal>
            <div className="trilho">
              <span className="selo selo--neutro">{portfolio.depoimentoIndice}</span>
            </div>
            {depoimentos.map((d) => (
              <figure className="depoimento" key={d.autor}>
                <blockquote>{d.frase}</blockquote>
                <figcaption>
                  <strong>{d.autor}</strong>
                  <span>{d.papel}</span>
                  <a className="link-texto" href={d.url} target="_blank" rel="noreferrer">
                    {d.projeto}
                    <SetaExterna />
                  </a>
                </figcaption>
              </figure>
            ))}
          </div>
        )}

        {/* A chamada fecha a seção, e o lugar não é decorativo: aqui é onde a
            objeção "será que eles conseguem fazer isso?" acabou de morrer,
            olhando cinco projetos. */}
        <div className="chamada" data-reveal>
          <p>{portfolio.ctaTexto}</p>
          <a className="botao botao--acento" href="#contato">
            {portfolio.ctaBotao}
          </a>
        </div>
      </div>
    </section>
  );
}
