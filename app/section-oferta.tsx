"use client";

import { included, launchDeadline, maintenance, packages, process, standardIntegrations } from "./data";
import { ArrowIcon } from "./icons";
import { useAncoraSuave } from "./use-ancora-suave";

/** Processo, investimento e planos de manutenção. */
export default function SectionOferta() {
  const handleNavClick = useAncoraSuave();

  return (
    <>
      <section className="process section" id="processo" aria-labelledby="process-title">
        <div className="process-heading" data-reveal>
          <div className="section-index">04 — Como acontece</div>
          <h2 id="process-title">Um caminho claro,<br />do primeiro “oi”<br />até a publicação.</h2>
          <p>Você acompanha as decisões, aprova cada etapa e sabe o que esperar até a publicação.</p>
        </div>
        <div className="process-list">
          {process.map((item) => (
            <article key={item.step} data-reveal>
              <span>{item.step}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="pricing section" id="investimento" aria-labelledby="pricing-title">
        <div className="pricing-heading" data-reveal>
          <div>
            <div className="section-index">05 — Investimento</div>
            <h2 id="pricing-title">Comece com o que<br />seu negócio precisa hoje.</h2>
          </div>
          <p>
            Condição de lançamento válida para contratos fechados até {launchDeadline}.
          </p>
        </div>

        <div className="pricing-grid">
          {packages.map((item) => (
            <article className={`price-card${item.featured ? " is-featured" : ""}`} key={item.name} data-reveal>
              <p className="price-eyebrow">{item.eyebrow}</p>
              <h3>{item.name}</h3>
              <p className="price-description">{item.description}</p>
              <div className="price">
                <small>R$</small><strong>{item.launch}</strong><span>por projeto</span>
              </div>
              <p className="future-price">valor regular: R$ {item.future}</p>
              <a className={`button ${item.featured ? "button--cream" : "button--outline"}`} href="#contato" onClick={(event) => handleNavClick(event, "#contato")}>
                Quero este plano <ArrowIcon />
              </a>
              <ul>
                {item.items.map((feature) => <li key={feature}>{feature}</li>)}
              </ul>
            </article>
          ))}
        </div>

        {/* Garantias da casa fora dos cartoes, de proposito. Enquanto viviam
            dentro da lista de cada pacote, pareciam variar entre eles — e
            "direcao visual personalizada" so no mais caro dizia, na pratica,
            que os outros dois eram modelo pronto. */}
        <div className="pricing-included" data-reveal>
          <h3>Em todos os pacotes, sem cobrança à parte</h3>
          <ul>
            {included.map((item) => (
              <li key={item.title}>
                <strong>{item.title}</strong>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="launch-note">
          As integrações padrão incluem {standardIntegrations}. Cada rodada de ajustes deve chegar em uma lista consolidada.
          Qualquer necessidade fora do pacote é informada e orçada antes do início — nunca durante.
        </p>
      </section>

      <section className="care section" aria-labelledby="care-title">
        <div className="care-heading" data-reveal>
          <div className="section-index section-index--light">06 — Depois da publicação</div>
          <h2 id="care-title">Seu site pode continuar<br /><em>bem cuidado.</em></h2>
          <p>Planos opcionais para manter o site no ar, atualizado e seguro — e para mudar o conteúdo sempre que o negócio mudar.</p>
        </div>

        <div className="care-grid">
          {maintenance.map((item) => (
            <article className={item.featured ? "is-featured" : undefined} key={item.name} data-reveal>
              <h3>{item.name}</h3>
              <div className="care-price"><small>R$</small><strong>{item.price}</strong><span>/mês</span></div>
              <p className="care-summary">{item.summary}</p>
              <ul>
                {item.items.map((linha) => <li key={linha}>{linha}</li>)}
              </ul>
            </article>
          ))}
        </div>
        <div className="care-notes" data-reveal>
          <p>O tempo mensal não é acumulativo. O pagamento é antecipado e o cancelamento requer aviso prévio de 30 dias.</p>
          <p>Para demandas pontuais sem plano, a manutenção avulsa custa R$ 220 por hora, cobrada em blocos de 30 minutos. Dentro dos planos, a hora sai sempre mais barata.</p>
        </div>
      </section>
    </>
  );
}
