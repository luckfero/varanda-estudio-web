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
        <p className="extras-note">
          {t.extras.notaSobOrcamento} {t.extras.sobOrcamento.join(" · ")}. {t.extras.nota}
        </p>
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
      </section>
    </>
  );
}
