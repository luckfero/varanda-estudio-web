import type { CSSProperties } from "react";
import type { Dicionario } from "./i18n";

/**
 * Quem está na Varanda, serviços sob medida e dúvidas frequentes.
 *
 * Sem `"use client"`: não há estado, evento nem gancho aqui. O acordeão das
 * dúvidas é `<details>`, que o próprio navegador abre e fecha sem uma linha
 * de JavaScript, e que continua funcionando no teclado, no leitor de tela e
 * na impressão.
 *
 * Identidade nova em 27/08/2026. A marcação saiu inteira do `corpo.html` do
 * protótipo aprovado: `.secao > .caixa`, o rótulo numerado, a grade de duas
 * colunas e a lista de extras em `<ul>` de verdade. Os nomes antigos
 * (`.about`, `.about-copy`, `.extras-list`, `.faq-list`) não sobreviveram de
 * propósito: a folha inteira trocou de gramática de uma vez, e meio-termo
 * deixaria a página com duas.
 *
 * O RECUO VERTICAL MUDOU DE DONO e isso quebra em silêncio: ele morava em
 * `.section` e agora mora em `.secao > .caixa`. Uma seção sem o invólucro
 * `.caixa` nasce colada na vizinha, sem erro em lugar nenhum.
 */

/**
 * Os três dicionários trazem `assinaturaLocal` começando por travessão
 * ("— São Paulo, Brasil"). A regra de escrita da casa não usa travessão em
 * texto que o cliente lê, e aqui ele não faz falta: quem separa o nome do
 * estúdio do lugar passa a ser o desenho, com cor, corpo e espaço próprios
 * na `.assinatura`.
 *
 * A limpeza é feita aqui, e não no dicionário, porque o dicionário é de
 * outro dono nesta rodada. Quando o travessão sair de `pt.ts`, `es.ts` e
 * `en.ts`, esta função vira inofensiva e pode ser removida.
 */
const TRAVESSAO_INICIAL = /^[\s—–-]+/;

export default function SectionSobre({
  sobre,
  extras,
  faq,
}: {
  sobre: Dicionario["sobre"];
  extras: Dicionario["extras"];
  faq: Dicionario["faq"];
}) {
  const t = { sobre, extras, faq };
  return (
    <>
      <section className="secao" id="sobre" aria-labelledby="titulo-sobre">
        <div className="caixa">
          <div className="sobre-grade">
            {/* A planta da marca.
             *
             * A IDEIA E O MOVIMENTO FICAM; A GEOMETRIA FOI REDESENHADA em
             * 02/09/2026. A peça é de 26/08, escolhida entre oito renderizadas
             * e aprovada, e desenhava uma ABÓBADA SEMICIRCULAR — o logotipo
             * daquele momento. A marca de hoje não é abóbada: é uma cobertura
             * de pernas retas, ombros de raio 9 e coroa reta, suspensa sobre um
             * piso solto. A prancha estava desenhando um logotipo que não
             * existe mais.
             *
             * Toda a geometria sai de `public/marca/simbolo.svg`, levada para
             * a prancha por `x' = 280 + (x - 32) * 10` e `y' = y * 10 - 20`.
             * **Mudou a marca, muda aqui pela mesma conta** — não redesenhar
             * no olho.
             *
             * A ideia continua a mesma: a peça DESENHADA antes de existir.
             * Fica à vista o que normalmente se apaga na hora de construir,
             * que agora são os DOIS círculos de ombro (e não mais um só, porque
             * a coroa é reta entre eles), o eixo, a linha de nascença, a da
             * coroa, o raio, os nós e as cotas. A única peça cheia da folha
             * continua sendo o sol. Ela diz em desenho o que a coluna ao lado
             * diz em texto, que é um estúdio que projeta antes de executar.
             *
             * O VÃO entre o pé da perna e o piso é a ideia da marca, e não
             * sobra de desenho: cobertura suspensa sobre um piso é varanda, e
             * não porta nem sala. Por isso o pé da perna ganhou nó.
             *
             * AS CORES SAEM DOS TOKENS, e não de hex solto, porque foi
             * exatamente a troca de chão desta rodada que provou o ponto: com
             * hex escrito à mão, virar a página do claro para o escuro exige
             * caçar dezoito valores dentro de um SVG. As únicas exceções são
             * as três paradas do gradiente da luz, que são clarões de
             * ilustração e não papel de nenhum token de interface.
             *
             * O `data-reveal` é o GATILHO do movimento, não um concorrente
             * dele: as regras de animação vivem sob `.sobre-arte.is-visible`,
             * em about.css. É a regra 9.26 do protocolo, que nasceu quando a
             * luz da hero disparava no carregamento e, no celular, terminava
             * antes de o visitante rolar até ela. Aqui ela pesa mais ainda,
             * porque esta seção fica na metade de baixo da página e nunca é a
             * primeira coisa que se vê.
             */}
            <div className="sobre-arte" aria-hidden="true" data-reveal>
              <svg className="planta" viewBox="0 0 560 590" focusable="false">
                <defs>
                  {/* Os identificadores levam prefixo porque a página tem
                      outro SVG com `defs` (a luz da abertura) e `id` é global
                      no documento. Colisão aqui não dá erro: dá o gradiente
                      errado, em silêncio. */}
                  <pattern id="planta-grade" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M40 0V40M0 40H40" fill="none" stroke="var(--tinta)" strokeOpacity="0.07" strokeWidth="1" />
                  </pattern>
                  {/* O vão abrigado: por dentro da cobertura e até a face de
                      cima do piso. É ele que recorta a luz. */}
                  <clipPath id="planta-abertura">
                    <path d="M145 445V220a65 65 0 0 1 65-65h140a65 65 0 0 1 65 65v225Z" />
                  </clipPath>
                  {/* Literais, e de propósito: estes três são o clarão de uma
                      ilustração. `--acento-hover` tem o mesmo valor do
                      primeiro, mas ele é token de ESTADO de botão, e pendurar
                      a luz do desenho nele faria uma mudança de hover repintar
                      a planta. */}
                  <radialGradient id="planta-luz" cx="280" cy="445" r="215" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#f4b862" stopOpacity="0.5" />
                    <stop offset="0.55" stopColor="#e8a33c" stopOpacity="0.16" />
                    <stop offset="1" stopColor="#e8a33c" stopOpacity="0" />
                  </radialGradient>
                </defs>

                <rect className="planta-grade" width="560" height="590" fill="url(#planta-grade)" />

                {/* A CONTA.
                    A geometria que gera a peça, mais os nós e as cotas lá
                    embaixo, formam um grupo só: `.planta-calculo`. Eles entram
                    primeiro, ficam enquanto a peça é traçada e construída, e
                    **somem no fim**, que é o que acontece com a linha de
                    construção de qualquer desenho técnico quando ele vira
                    obra.

                    O que gera esta cobertura são DOIS ombros de raio 90, e não
                    um círculo só: a marca tem coroa reta entre eles. Por isso
                    são dois círculos tracejados, e não a abóbada semicircular
                    de antes — aquela desenhava um logotipo que não existe
                    mais. */}
                <g className="planta-calculo planta-constru" fill="none" strokeWidth="1.1">
                  <circle cx="210" cy="220" r="90" stroke="var(--terracota)" strokeOpacity="0.45" strokeDasharray="7 7" />
                  <circle cx="350" cy="220" r="90" stroke="var(--terracota)" strokeOpacity="0.45" strokeDasharray="7 7" />
                  <path d="M280 60V545" stroke="var(--tinta)" strokeOpacity="0.22" strokeDasharray="7 7" />
                  <path d="M56 220H504" stroke="var(--tinta)" strokeOpacity="0.22" strokeDasharray="7 7" />
                  <path d="M56 130H504" stroke="var(--tinta)" strokeOpacity="0.16" strokeDasharray="7 7" />
                  <path d="M210 220L146.36 156.36" stroke="var(--tinta)" strokeOpacity="0.3" strokeDasharray="5 5" />
                  {/* A linha do chão, que corre além do piso. Ela era o traço
                      cheio desta prancha; virou linha de construção quando o
                      piso passou a ser peça desenhada, com espessura própria,
                      como na marca. */}
                  <path d="M30 470h500" stroke="var(--terracota)" strokeOpacity="0.4" strokeDasharray="7 7" />
                </g>

                {/* O PISO, e ele é a primeira peça a se traçar, como numa
                    prancha de verdade. Barra de pontas redondas porque na marca
                    ele é um traço com `stroke-linecap: round`. */}
                <path className="planta-traco planta-chao" pathLength="100" d="M80 445h400a25 25 0 0 1 0 50H80a25 25 0 0 1 0-50Z" fill="none" stroke="var(--tinta)" strokeOpacity="0.5" strokeWidth="1.7" />

                {/* Os dois contornos da cobertura, e são eles que se PINTAM: o
                    traço corre de uma ponta à outra em vez de aparecer pronto.
                    Eles são as duas faces de uma peça de 50 de espessura, que é
                    o `stroke-width` 5 da marca levado para esta prancha. */}
                <path className="planta-traco planta-traco--fora" pathLength="100" d="M95 330V220a115 115 0 0 1 115-115h140a115 115 0 0 1 115 115v110" fill="none" stroke="var(--tinta)" strokeOpacity="0.5" strokeWidth="1.7" />
                <path className="planta-traco planta-traco--dentro" pathLength="100" d="M145 330V220a65 65 0 0 1 65-65h140a65 65 0 0 1 65 65v110" fill="none" stroke="var(--tinta)" strokeOpacity="0.5" strokeWidth="1.7" />

                {/* A massa das duas peças, em poché.
                    Na cobertura o `fill-rule="evenodd"` é o que abre o vão no
                    meio: o caminho traz o contorno de fora e o de dentro, e a
                    regra vaza o miolo. Trocar por `nonzero` fecha a peça e some
                    com o abrigo. O piso é barra maciça e não tem miolo.

                    Massa de tinta a 9%: sobre o chão escuro isso compõe em
                    rgb(40,37,33) e mede 1,25:1 contra ele. Poché em prancha
                    escura é mancha clara, e não cor: o único warm que sobra na
                    peça é o sol, que é como a identidade nova funciona. */}
                <path className="planta-poche" fillRule="evenodd" fill="var(--tinta)" fillOpacity="0.09"
                      d="M95 330V220a115 115 0 0 1 115-115h140a115 115 0 0 1 115 115v110ZM145 330V220a65 65 0 0 1 65-65h140a65 65 0 0 1 65 65v110Z" />
                <path className="planta-poche" fill="var(--tinta)" fillOpacity="0.09"
                      d="M80 445h400a25 25 0 0 1 0 50H80a25 25 0 0 1 0-50Z" />

                {/* A luz dentro do vão, recortada pela forma do abrigo. */}
                <g clipPath="url(#planta-abertura)">
                  <rect className="planta-brilho" x="145" y="155" width="270" height="290" fill="url(#planta-luz)" />
                </g>

                {/* O sol assenta na FACE DE CIMA do piso, em y=445, e não na
                    linha de eixo dele: é exatamente onde a luz encosta na
                    marca. */}
                <path className="planta-calculo planta-constru--sol" d="M200 445a80 80 0 0 0 160 0" fill="none" stroke="var(--terracota)" strokeOpacity="0.55" strokeWidth="1.1" strokeDasharray="6 6" />
                <path className="planta-sol" d="M200 445a80 80 0 0 1 160 0Z" fill="var(--acento)" />

                {/* Nós e cotas: as marcas de quem desenha antes de construir.
                    Sete nós: os dois centros de ombro, os dois pontos de
                    nascença, os dois pés de perna e a ponta do raio. O pé da
                    perna é nó porque é ali que a peça PARA — a folga entre ela
                    e o piso é a ideia da marca, e não sobra de desenho.

                    As duas cotas escritas não levam `font-family`, `font-size`
                    nem `fill` na marcação: quem manda é `.planta text`, em
                    about.css, que consome os tokens do mono. */}
                <g className="planta-calculo planta-cota">
                  <rect x="207" y="217" width="6" height="6" fill="var(--terracota)" />
                  <rect x="347" y="217" width="6" height="6" fill="var(--terracota)" />
                  <rect x="117" y="217" width="6" height="6" fill="var(--terracota)" />
                  <rect x="437" y="217" width="6" height="6" fill="var(--terracota)" />
                  <rect x="117" y="327" width="6" height="6" fill="var(--terracota)" />
                  <rect x="437" y="327" width="6" height="6" fill="var(--terracota)" />
                  <rect x="143.36" y="153.36" width="6" height="6" fill="var(--terracota)" />
                  <g fill="none" stroke="var(--acento)" strokeOpacity="0.6" strokeWidth="1.1">
                    {/* AS DUAS COTAS MEDEM O QUE SE VE, face a face, e nao
                        eixo a eixo. Foi conferido no `getBBox`: o piso desenhado
                        vai de x=55 a x=505 (450) porque as pontas sao redondas
                        e cada uma avanca meia espessura alem do fim do caminho;
                        a peca de cima vai de y=105 a y=495 (390), da coroa de
                        fora ate a base do piso.

                        A cota horizontal corre embaixo do PISO e por isso mede
                        o piso: cota que passa debaixo de uma peca medindo outra
                        le errado. */}
                    <path d="M55 524h450M49 530l12-12M499 530l12-12" />
                    <path d="M508 105v390M502 111l12-12M502 501l12-12" />
                    <path d="M34 26v16M26 34h16M526 548v16M518 556h16" stroke="var(--tinta)" strokeOpacity="0.25" />
                  </g>
                  <text x="272" y="546">450</text>
                  <text x="64" y="152">R 90</text>
                </g>
              </svg>
            </div>

            {/* O atraso vem escrito no elemento, que é como o protótipo faz.
                A escada por `nth-child` da folha anterior saiu junto com as
                classes que ela mirava. */}
            <div className="sobre-texto" data-reveal style={{ "--atraso": "100ms" } as CSSProperties}>
              <p className="rotulo"><b>08</b><i aria-hidden="true" />{t.sobre.indice}</p>
              <p className="sobrancelha">{t.sobre.eyebrow}</p>
              <h2 className="titulo-secao titulo-secao--largo" id="titulo-sobre">{t.sobre.titulo}</h2>
              <p>{t.sobre.paragrafo1}</p>
              <p>{t.sobre.paragrafo2}</p>
              <p className="assinatura">
                <strong>{t.sobre.assinatura}</strong>{" "}
                <span>{t.sobre.assinaturaLocal.replace(TRAVESSAO_INICIAL, "")}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="secao" aria-labelledby="titulo-extras">
        <div className="caixa">
          <div className="cabeca-secao" data-reveal>
            <div>
              <p className="rotulo"><b>09</b><i aria-hidden="true" />{t.extras.indice}</p>
              <h2 className="titulo-secao" id="titulo-extras">{t.extras.titulo}</h2>
            </div>
            <p className="lead">{t.extras.resumo}</p>
          </div>

          {/* Lista de verdade, e não uma pilha de `<div>`.
              `role="list"` não é redundante: o `list-style: none` do reset faz
              o Safari tirar a semântica de lista do `<ul>`, e quem ouve a
              página perde o "lista de 5 itens" que diz de saída o tamanho do
              que vem. */}
          <ul className="extras-lista" role="list" data-reveal>
            {t.extras.lista.map((item) => (
              <li key={item.name}>
                <span className="extra-nome">{item.name}</span>
                <strong className="extra-preco numeral">{item.price}</strong>
              </li>
            ))}
          </ul>

          {/* A lista do que é orçado à parte saiu daqui em 2026-08-10: passou
              a viver em destaque na seção de investimento, em duas colunas ao
              lado do que está incluso. Repetir nos dois lugares enfraquecia os
              dois, e aqui ela ficava em letra miúda. */}
          <p className="apoio nota-secao" data-reveal>{t.extras.nota}</p>
        </div>
      </section>

      <section className="secao" aria-labelledby="titulo-duvidas">
        <div className="caixa">
          <div className="duvidas-grade">
            <div data-reveal>
              <p className="rotulo"><b>10</b><i aria-hidden="true" />{t.faq.indice}</p>
              <h2 className="titulo-secao" id="titulo-duvidas">{t.faq.titulo}</h2>
            </div>

            <div>
              <div className="duvidas-lista">
                {t.faq.perguntas.map((item, index) => (
                  /* A primeira nasce aberta, como no protótipo. Ela é o que
                     mostra que a lista abre: oito linhas todas fechadas
                     parecem um índice, e o visitante que não reconhece o
                     acordeão não clica em nada. E a pergunta que abre é a de
                     prazo, que é a mais perguntada. */
                  <details key={item.question} data-reveal open={index === 0}>
                    <summary>
                      <b aria-hidden="true">{String(index + 1).padStart(2, "0")}</b>
                      {item.question}
                      <i aria-hidden="true" />
                    </summary>
                    <p>{item.answer}</p>
                  </details>
                ))}
              </div>

              {/* As oito dúvidas terminavam sem nada para clicar, que é
                  exatamente onde a última objeção acabou de ser respondida. */}
              <div className="duvidas-fecho" data-reveal>
                <div>
                  <h3>{t.faq.fechamentoTitulo}</h3>
                  <p>{t.faq.fechamentoTexto}</p>
                </div>
                {/* Âncora simples, sem o gancho de rolagem suave: esta seção é
                    componente de servidor, e trazer `use-ancora-suave` para cá
                    mandaria o JavaScript dela inteiro para o navegador por
                    causa de um botão. A folha já declara
                    `scroll-behavior: smooth`, então o navegador faz o mesmo
                    movimento sozinho.

                    A seta vai EMBUTIDA, como no `corpo.html`, e não pelo
                    `ArrowIcon` de `icons.tsx`. O componente não traz `fill`,
                    `stroke` nem espessura, e quem os dava era uma regra da
                    folha antiga que a identidade nova não tem: usado hoje, ele
                    sairia preenchido de preto no lugar de um traço. */}
                <a className="botao botao--acento" href="#contato">
                  {t.faq.fechamentoBotao}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h13M13 6l6 6-6 6" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
