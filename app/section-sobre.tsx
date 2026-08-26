import { ArrowIcon } from "./icons";
import type { Dicionario } from "./i18n";

/**
 * Quem está na Varanda, serviços sob medida e dúvidas frequentes.
 *
 * Sem `"use client"`: não há estado, evento nem gancho aqui. O acordeão das
 * dúvidas é `<details>`, que o próprio navegador abre e fecha sem uma linha
 * de JavaScript. São 85 elementos, 18% da página, que deixam de hidratar.
 */
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
      <section className="about section" id="sobre" aria-labelledby="about-title">
        {/* A planta do arco.
         *
         * Substitui, em 26/08/2026, a arte que estava aqui desde o começo: um
         * arco verde com a letra "V" gigante dentro, um círculo ocre encostado
         * na quina e um ramo de folhas desenhado com `<i>` vazios posicionados
         * por `left`/`top`. Ela foi rejeitada pelo dono, e as duas primeiras
         * substitutas também; esta é a terceira e foi escolhida entre oito
         * renderizadas, comparadas em captura e não em descrição.
         *
         * A ideia: o arco DESENHADO antes de existir. Fica à vista o que
         * normalmente se apaga na hora de construir — o círculo que gera a
         * abóbada, o eixo, a linha de nascença, o raio, os nós e as cotas — e
         * a única peça cheia da folha é o sol.
         *
         * Ela diz a mesma coisa que a seção ao lado diz em texto, que é um
         * estúdio que projeta antes de executar, e diz sem repetir a arte da
         * abertura, que é a mesma gramática vista pelo lado de fora.
         *
         * O `data-reveal` é o GATILHO do movimento, não um concorrente dele:
         * as regras de animação vivem sob `.about-art.is-visible`, em
         * about.css. É a regra 9.26 do protocolo, que nasceu quando a luz da
         * hero disparava no carregamento e, no celular, terminava antes de o
         * visitante rolar até ela.
         *
         * Os raios de sol que a versão original tinha saíram a pedido.
         */}
        <div className="about-art" aria-hidden="true" data-reveal>
          <svg className="planta" viewBox="0 0 560 590" focusable="false">
            <defs>
              {/* Os identificadores levam prefixo porque a página tem outro
                  SVG com `defs` (a luz da hero) e `id` é global no documento.
                  Colisão aqui não dá erro: dá o gradiente errado, em silêncio. */}
              <pattern id="planta-grade" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M40 0V40M0 40H40" fill="none" stroke="#214d3b" strokeOpacity="0.11" strokeWidth="1" />
              </pattern>
              <pattern id="planta-hachura" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <path d="M0 0V9" stroke="#214d3b" strokeOpacity="0.4" strokeWidth="1" />
              </pattern>
              <clipPath id="planta-abertura">
                <path d="M136 470V300a144 144 0 0 1 288 0v170Z" />
              </clipPath>
              <radialGradient id="planta-luz" cx="280" cy="470" r="205" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#dcb668" stopOpacity="0.45" />
                <stop offset="0.55" stopColor="#c79a43" stopOpacity="0.14" />
                <stop offset="1" stopColor="#c79a43" stopOpacity="0" />
              </radialGradient>
            </defs>

            <rect className="planta-grade" width="560" height="590" fill="url(#planta-grade)" />

            {/* A linha do chão, que passa além do arco: é a primeira coisa que
                se traça numa prancha e a primeira que aparece aqui. */}
            <path className="planta-traco planta-chao" pathLength="100" d="M30 470h500" stroke="#b86749" strokeWidth="2.2" fill="none" />

            {/* A geometria que gera o arco, deixada à vista. */}
            <g className="planta-constru" fill="none" strokeWidth="1.1">
              <circle cx="280" cy="300" r="170" stroke="#b86749" strokeOpacity="0.4" strokeDasharray="7 7" />
              <path d="M280 76V546" stroke="#214d3b" strokeOpacity="0.34" strokeDasharray="7 7" />
              <path d="M56 300H504" stroke="#214d3b" strokeOpacity="0.34" strokeDasharray="7 7" />
              <path d="M280 300L159.79 179.79" stroke="#214d3b" strokeOpacity="0.45" strokeDasharray="5 5" />
            </g>

            {/* Os dois contornos da alvenaria, e são eles que se PINTAM: o
                traço corre de uma ponta à outra em vez de aparecer pronto. */}
            <path className="planta-traco planta-traco--fora" pathLength="100" d="M110 470V300a170 170 0 0 1 340 0v170" fill="none" stroke="#214d3b" strokeWidth="1.7" />
            <path className="planta-traco planta-traco--dentro" pathLength="100" d="M136 470V300a144 144 0 0 1 288 0v170" fill="none" stroke="#214d3b" strokeWidth="1.7" />

            {/* O corte: preenchimento leve e hachura, entre os dois contornos.
                `fill-rule="evenodd"` é o que abre o vão no meio. */}
            <path className="planta-poche planta-poche--chapa" fillRule="evenodd" fill="#214d3b" fillOpacity="0.09"
                  d="M110 470V300a170 170 0 0 1 340 0v170ZM136 470V300a144 144 0 0 1 288 0v170Z" />
            <path className="planta-poche planta-poche--hachura" fillRule="evenodd" fill="url(#planta-hachura)"
                  d="M110 470V300a170 170 0 0 1 340 0v170ZM136 470V300a144 144 0 0 1 288 0v170Z" />

            {/* A luz dentro da abertura, recortada pela forma do vão. */}
            <g clipPath="url(#planta-abertura)">
              <rect className="planta-brilho" x="110" y="180" width="340" height="292" fill="url(#planta-luz)" />
            </g>

            <path className="planta-constru planta-constru--sol" d="M216 470a64 64 0 0 0 128 0" fill="none" stroke="#b86749" strokeOpacity="0.5" strokeWidth="1.1" strokeDasharray="6 6" />
            <path className="planta-sol" d="M216 470a64 64 0 0 1 128 0Z" fill="#c79a43" />

            {/* Nós e cotas: as marcas de quem desenha antes de construir. */}
            <g className="planta-cota">
              <rect x="277" y="297" width="6" height="6" fill="#b86749" />
              <rect x="107" y="297" width="6" height="6" fill="#b86749" />
              <rect x="447" y="297" width="6" height="6" fill="#b86749" />
              <rect x="107" y="467" width="6" height="6" fill="#b86749" />
              <rect x="447" y="467" width="6" height="6" fill="#b86749" />
              <rect x="156.79" y="176.79" width="6" height="6" fill="#b86749" />
              <g fill="none" stroke="#974d35" strokeOpacity="0.6" strokeWidth="1.1">
                <path d="M110 524h340M104 530l12-12M444 530l12-12" />
                <path d="M508 130v340M502 136l12-12M502 476l12-12" />
                <path d="M34 26v16M26 34h16M526 548v16M518 556h16" stroke="#214d3b" strokeOpacity="0.3" />
              </g>
            </g>
          </svg>
        </div>
        <div className="about-copy" data-reveal>
          <div className="section-index">{t.sobre.indice}</div>
          <p className="eyebrow">{t.sobre.eyebrow}</p>
          <h2 id="about-title">{t.sobre.titulo}</h2>
          <p>{t.sobre.paragrafo1}</p>
          <p>{t.sobre.paragrafo2}</p>
          <div className="signature">{t.sobre.assinatura} <span>{t.sobre.assinaturaLocal}</span></div>
        </div>
      </section>

      <section className="extras section" aria-labelledby="extras-title">
        <div className="extras-heading" data-reveal>
          <div className="extras-heading-main">
            <div className="section-index">{t.extras.indice}</div>
            <h2 id="extras-title">{t.extras.titulo}</h2>
          </div>
          <p>{t.extras.resumo}</p>
        </div>
        <div className="extras-list" data-reveal>
          {t.extras.lista.map((item) => (
            <div key={item.name}><span>{item.name}</span><strong>{item.price}</strong></div>
          ))}
        </div>
        {/* A lista do que é orçado à parte saiu daqui em 2026-08-10: passou
            a viver em destaque na seção de investimento, em duas colunas ao
            lado do que está incluso. Repetir nos dois lugares enfraquecia os
            dois, e aqui ela ficava em letra miúda. */}
        <p className="extras-note">{t.extras.nota}</p>
      </section>

      <section className="faq section" aria-labelledby="faq-title">
        <div className="faq-heading" data-reveal>
          <div className="section-index">{t.faq.indice}</div>
          <h2 id="faq-title" dangerouslySetInnerHTML={{ __html: t.faq.titulo }} />
        </div>
        <div className="faq-list">
          {t.faq.perguntas.map((item, index) => (
            <details key={item.question} data-reveal>
              <summary><span>{String(index + 1).padStart(2, "0")}</span>{item.question}<i aria-hidden="true" /></summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>

        {/* As oito dúvidas terminavam sem nada para clicar, que é exatamente
            onde a última objeção acabou de ser respondida. */}
        <div className="faq-fechamento" data-reveal>
          <div>
            <h3>{t.faq.fechamentoTitulo}</h3>
            <p>{t.faq.fechamentoTexto}</p>
          </div>
          {/* Âncora simples, sem o gancho de rolagem suave: esta seção é
              componente de servidor, e trazer `use-ancora-suave` para cá
              mandaria o JavaScript dela inteiro para o navegador por causa de
              um botão. A folha já declara `scroll-behavior: smooth`, então o
              navegador faz o mesmo movimento sozinho. */}
          <a className="button button--primary" href="#contato">
            {t.faq.fechamentoBotao} <ArrowIcon />
          </a>
        </div>
      </section>
    </>
  );
}
