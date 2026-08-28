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
            {/* A planta do arco.
             *
             * Ela FICA. Foi desenhada em 26/08/2026, escolhida entre oito
             * renderizadas e comparadas em captura, e aprovada. O que mudou
             * nesta rodada foi só o chão embaixo dela: a seção passou de
             * creme a escura, então cada cor foi reconferida contra o
             * `--nivel-1` do painel novo.
             *
             * A ideia continua a mesma: o arco DESENHADO antes de existir.
             * Fica à vista o que normalmente se apaga na hora de construir,
             * que é o círculo que gera a abóbada, o eixo, a linha de nascença,
             * o raio, os nós e as cotas, e a única peça cheia da folha é o
             * sol. Ela diz em desenho o que a coluna ao lado diz em texto,
             * que é um estúdio que projeta antes de executar.
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
                  <clipPath id="planta-abertura">
                    <path d="M136 470V300a144 144 0 0 1 288 0v170Z" />
                  </clipPath>
                  {/* Literais, e de propósito: estes três são o clarão de uma
                      ilustração. `--acento-hover` tem o mesmo valor do
                      primeiro, mas ele é token de ESTADO de botão, e pendurar
                      a luz do desenho nele faria uma mudança de hover repintar
                      a planta. */}
                  <radialGradient id="planta-luz" cx="280" cy="470" r="205" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#f4b862" stopOpacity="0.5" />
                    <stop offset="0.55" stopColor="#e8a33c" stopOpacity="0.16" />
                    <stop offset="1" stopColor="#e8a33c" stopOpacity="0" />
                  </radialGradient>
                </defs>

                <rect className="planta-grade" width="560" height="590" fill="url(#planta-grade)" />

                {/* A linha do chão, que passa além do arco: é a primeira coisa
                    que se traça numa prancha e a primeira que aparece aqui. */}
                <path className="planta-traco planta-chao" pathLength="100" d="M30 470h500" stroke="var(--terracota)" strokeWidth="2.2" fill="none" />

                {/* A CONTA.
                    A geometria que gera o arco, mais os nós e as cotas lá
                    embaixo, formam um grupo só: `.planta-calculo`. Eles entram
                    primeiro, ficam enquanto o arco é traçado e construído, e
                    **somem no fim**, que é o que acontece com a linha de
                    construção de qualquer desenho técnico quando ele vira
                    obra. */}
                <g className="planta-calculo planta-constru" fill="none" strokeWidth="1.1">
                  <circle cx="280" cy="300" r="170" stroke="var(--terracota)" strokeOpacity="0.45" strokeDasharray="7 7" />
                  <path d="M280 76V546" stroke="var(--tinta)" strokeOpacity="0.22" strokeDasharray="7 7" />
                  <path d="M56 300H504" stroke="var(--tinta)" strokeOpacity="0.22" strokeDasharray="7 7" />
                  <path d="M280 300L159.79 179.79" stroke="var(--tinta)" strokeOpacity="0.3" strokeDasharray="5 5" />
                </g>

                {/* Os dois contornos da alvenaria, e são eles que se PINTAM: o
                    traço corre de uma ponta à outra em vez de aparecer pronto.
                    No chão claro eles eram o verde da marca; no escuro o verde
                    encosta na massa que ele mesmo contorna e o contorno some,
                    então quem desenha a linha passou a ser a tinta. */}
                <path className="planta-traco planta-traco--fora" pathLength="100" d="M110 470V300a170 170 0 0 1 340 0v170" fill="none" stroke="var(--tinta)" strokeOpacity="0.5" strokeWidth="1.7" />
                <path className="planta-traco planta-traco--dentro" pathLength="100" d="M136 470V300a144 144 0 0 1 288 0v170" fill="none" stroke="var(--tinta)" strokeOpacity="0.5" strokeWidth="1.7" />

                {/* A alvenaria, em massa cheia, no verde da marca.
                    `fill-rule="evenodd"` é o que abre o vão no meio: o caminho
                    traz o contorno de fora e o de dentro, e a regra vaza o
                    miolo. Trocar por `nonzero` fecha o arco e some com a
                    abertura. */}
                {/* A alvenaria era o VERDE DA MARCA, escolhido em 26/08 justamente para
                    casar com o logotipo. Com o verde saindo da identidade, ela vira
                    massa de tinta a 9%: sobre o chão escuro isso compõe em rgb(40,37,33)
                    e mede 1,25:1 contra ele, que é o mesmo degrau de separação que a
                    areia dava no site claro. Poché em prancha escura é mancha clara, e
                    não cor: o único warm que sobra na peça é o sol, que é como a
                    identidade nova funciona. */}
                <path className="planta-poche" fillRule="evenodd" fill="var(--tinta)" fillOpacity="0.09"
                      d="M110 470V300a170 170 0 0 1 340 0v170ZM136 470V300a144 144 0 0 1 288 0v170Z" />

                {/* A luz dentro da abertura, recortada pela forma do vão. */}
                <g clipPath="url(#planta-abertura)">
                  <rect className="planta-brilho" x="110" y="180" width="340" height="292" fill="url(#planta-luz)" />
                </g>

                <path className="planta-calculo planta-constru--sol" d="M216 470a64 64 0 0 0 128 0" fill="none" stroke="var(--terracota)" strokeOpacity="0.55" strokeWidth="1.1" strokeDasharray="6 6" />
                <path className="planta-sol" d="M216 470a64 64 0 0 1 128 0Z" fill="var(--acento)" />

                {/* Nós e cotas: as marcas de quem desenha antes de construir.
                    As duas cotas escritas não levam `font-family`, `font-size`
                    nem `fill` na marcação: quem manda é `.planta text`, em
                    about.css, que consome os tokens do mono. Escritas à mão,
                    elas ficariam para trás no dia em que a IBM Plex Mono
                    entrar de verdade no projeto e todas as etiquetas da página
                    trocarem de fonte. */}
                <g className="planta-calculo planta-cota">
                  <rect x="277" y="297" width="6" height="6" fill="var(--terracota)" />
                  <rect x="107" y="297" width="6" height="6" fill="var(--terracota)" />
                  <rect x="447" y="297" width="6" height="6" fill="var(--terracota)" />
                  <rect x="107" y="467" width="6" height="6" fill="var(--terracota)" />
                  <rect x="447" y="467" width="6" height="6" fill="var(--terracota)" />
                  <rect x="156.79" y="176.79" width="6" height="6" fill="var(--terracota)" />
                  <g fill="none" stroke="var(--acento)" strokeOpacity="0.6" strokeWidth="1.1">
                    <path d="M110 524h340M104 530l12-12M444 530l12-12" />
                    <path d="M508 130v340M502 136l12-12M502 476l12-12" />
                    <path d="M34 26v16M26 34h16M526 548v16M518 556h16" stroke="var(--tinta)" strokeOpacity="0.25" />
                  </g>
                  <text x="272" y="546">340</text>
                  <text x="452" y="296">R 170</text>
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
