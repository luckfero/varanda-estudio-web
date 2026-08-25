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
        <div className="about-art" aria-hidden="true" data-reveal>
          <div className="about-sun" />
          <div className="about-arch"><span>V</span></div>
          <div className="about-leaves"><i /><i /><i /><i /><i /><i /></div>
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
