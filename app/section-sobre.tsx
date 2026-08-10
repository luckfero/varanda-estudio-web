import { faqs } from "./data";

/**
 * Quem está na Varanda, serviços sob medida e dúvidas frequentes.
 *
 * Sem `"use client"`: não há estado, evento nem gancho aqui. O acordeão das
 * dúvidas é `<details>`, que o próprio navegador abre e fecha sem uma linha
 * de JavaScript. São 85 elementos, 18% da página, que deixam de hidratar.
 */
export default function SectionSobre() {
  return (
    <>
      <section className="about section" id="sobre" aria-labelledby="about-title">
        <div className="about-art" aria-hidden="true" data-reveal>
          <div className="about-sun" />
          <div className="about-arch"><span>V</span></div>
          <div className="about-leaves"><i /><i /><i /><i /><i /><i /></div>
        </div>
        <div className="about-copy" data-reveal>
          <div className="section-index">07 — Quem está na Varanda</div>
          <p className="eyebrow">Olá, eu sou o Lucca.</p>
          <h2 id="about-title">Tecnologia boa é a que aproxima, não a que complica.</h2>
          <p>
            A Varanda Estúdio Web nasceu para ajudar comércios, profissionais e empresas a construírem uma presença digital clara, profissional e confiável.
          </p>
          <p>
            Eu acompanho cada projeto de perto, desde a organização das ideias até o desenvolvimento, com conversa franca, processo documentado e atenção aos detalhes.
          </p>
          <div className="signature">Lucca Oliveira <span>— São Paulo, SP</span></div>
        </div>
      </section>

      <section className="extras section" aria-labelledby="extras-title">
        <div className="extras-heading" data-reveal>
          <div className="extras-heading-main">
            <div className="section-index">08 — Sob medida</div>
            <h2 id="extras-title">O que mais o seu projeto pode precisar?</h2>
          </div>
          <p>Estes serviços podem ser adicionados quando não estiverem incluídos no pacote escolhido.</p>
        </div>
        <div className="extras-list" data-reveal>
          <div><span>Nova página</span><strong>R$ 220</strong></div>
          <div><span>Redação completa</span><strong>R$ 120/página</strong></div>
          <div><span>Configuração de domínio e hospedagem</span><strong>R$ 150</strong></div>
          <div><span>Integração padrão</span><strong>a partir de R$ 220</strong></div>
          <div><span>Blog ou CMS</span><strong>a partir de R$ 490</strong></div>
          <div><span>Idioma adicional</span><strong>a partir de R$ 350</strong></div>
          <div><span>Rodada adicional de ajustes</span><strong>R$ 150</strong></div>
        </div>
        <p className="extras-note">Os valores acima não incluem custos cobrados por domínio, hospedagem ou ferramentas externas. Demandas urgentes estão sujeitas à disponibilidade e podem ter adicional de 30%.</p>
      </section>

      <section className="faq section" aria-labelledby="faq-title">
        <div className="faq-heading" data-reveal>
          <div className="section-index">09 — Dúvidas frequentes</div>
          <h2 id="faq-title">Antes de começar,<br />vale saber.</h2>
        </div>
        <div className="faq-list">
          {faqs.map((item, index) => (
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
