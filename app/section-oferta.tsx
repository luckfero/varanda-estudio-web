"use client";

import { ArrowIcon } from "./icons";
import type { Dicionario } from "./i18n";
import { partesDoPreco } from "./i18n";
import { useAncoraSuave } from "./use-ancora-suave";

/**
 * Processo, investimento e planos de manutenção.
 *
 * Fatias, não o dicionário inteiro: propriedade de componente cliente viaja
 * serializada até o navegador, e o dicionário completo levaria junto o texto
 * da política — o único lugar com o nome da pessoa.
 */
export default function SectionOferta({
  processo,
  investimento,
  manutencao,
  moeda,
  moedaAposValor,
}: {
  processo: Dicionario["processo"];
  investimento: Dicionario["investimento"];
  manutencao: Dicionario["manutencao"];
  moeda: string;
  moedaAposValor: boolean;
}) {
  const t = { processo, investimento, manutencao, moeda, moedaAposValor };
  const handleNavClick = useAncoraSuave();

  /* Em linha corrida o símbolo e o número vêm juntos; nos cartões eles vão
     em elementos separados, com tamanhos diferentes. Daí as duas formas. */
  const precoEmLinha = (valor: string) =>
    t.moedaAposValor ? `${valor} ${t.moeda}` : `${t.moeda} ${valor}`;

  return (
    <>
      <section className="process section" id="processo" aria-labelledby="process-title">
        <div className="process-heading" data-reveal>
          <div className="section-index">{t.processo.indice}</div>
          <h2 id="process-title" dangerouslySetInnerHTML={{ __html: t.processo.titulo }} />
          <p>{t.processo.resumo}</p>
        </div>
        <div className="process-list">
          {t.processo.etapas.map((item) => (
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
            <div className="section-index">{t.investimento.indice}</div>
            <h2 id="pricing-title" dangerouslySetInnerHTML={{ __html: t.investimento.titulo }} />
          </div>
          <p>{t.investimento.prazo}</p>
        </div>

        <div className="pricing-grid">
          {t.investimento.pacotes.map((item) => {
            const partes = partesDoPreco(t, item.launch);
            return (
            <article className={`price-card${item.featured ? " is-featured" : ""}`} key={item.name} data-reveal>
              <p className="price-eyebrow">{item.eyebrow}</p>
              <h3>{item.name}</h3>
              <p className="price-description">{item.description}</p>
              <div className="price">
                {partes.antes && <small>{partes.antes}</small>}
                <strong>{partes.numero}</strong>
                {partes.depois && <small className="price-moeda-depois">{partes.depois}</small>}
                <span>{t.investimento.porProjeto}</span>
              </div>
              <p className="future-price">{t.investimento.valorRegular} {precoEmLinha(item.future)}</p>
              <a className={`button ${item.featured ? "button--cream" : "button--outline"}`} href="#contato" onClick={(event) => handleNavClick(event, "#contato")}>
                {t.investimento.cta} <ArrowIcon />
              </a>
              <ul>
                {item.items.map((feature) => <li key={feature}>{feature}</li>)}
              </ul>
            </article>
          );
          })}
        </div>

        {/* Garantias da casa fora dos cartoes, de proposito. Enquanto viviam
            dentro da lista de cada pacote, pareciam variar entre eles — e
            "direcao visual personalizada" so no mais caro dizia, na pratica,
            que os outros dois eram modelo pronto. */}
        <div className="pricing-included" data-reveal>
          <h3>{t.investimento.incluidoTitulo}</h3>
          <ul>
            {t.investimento.incluido.map((item) => (
              <li key={item.title}>
                <strong>{item.title}</strong>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Duas colunas, e a separação é comercial antes de ser visual: a
            esquerda está no preço do pacote, a direita não. O marcador
            diferente (✓ contra +) existe para a distinção sobreviver a uma
            leitura rápida, que é como esta seção costuma ser lida. */}
        <div className="pricing-escopo" data-reveal>
          <div className="pricing-escopo-col">
            <h3>{t.investimento.escopoIncluidoTitulo}</h3>
            <ul className="pricing-escopo-incluso">
              {t.investimento.escopoIncluido.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
          <div className="pricing-escopo-col">
            <h3>{t.investimento.escopoOrcamentoTitulo}</h3>
            <ul className="pricing-escopo-extra">
              {t.investimento.escopoOrcamento.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </div>

        <p className="launch-note">{t.investimento.nota}</p>
      </section>

      <section className="care section" aria-labelledby="care-title">
        <div className="care-heading" data-reveal>
          <div className="section-index section-index--light">{t.manutencao.indice}</div>
          <h2 id="care-title">{t.manutencao.tituloAntes}<br /><em>{t.manutencao.tituloDestaque}</em></h2>
          <p>{t.manutencao.resumo}</p>
        </div>

        <div className="care-grid">
          {t.manutencao.planos.map((item) => {
            const partes = partesDoPreco(t, item.price);
            return (
            <article className={item.featured ? "is-featured" : undefined} key={item.name} data-reveal>
              <h3>{item.name}</h3>
              <div className="care-price">
                {partes.antes && <small>{partes.antes}</small>}
                <strong>{partes.numero}</strong>
                {partes.depois && <small>{partes.depois}</small>}
                <span>{t.manutencao.porMes}</span>
              </div>
              <p className="care-summary">{item.summary}</p>
              <ul>
                {item.items.map((linha) => <li key={linha}>{linha}</li>)}
              </ul>
            </article>
          );
          })}
        </div>
        <div className="care-notes" data-reveal>
          <p>{t.manutencao.nota1}</p>
          <p>{t.manutencao.nota2}</p>
        </div>
      </section>
    </>
  );
}
