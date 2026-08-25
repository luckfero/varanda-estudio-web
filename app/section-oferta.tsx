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
          <p>{t.investimento.resumo}</p>
        </div>

        <div className="pricing-grid">
          {t.investimento.pacotes.map((item, index) => {
            const partes = partesDoPreco(t, item.launch);
            return (
            /* O `id` é numérico, e não derivado do nome, porque o nome é
               traduzido: `#plano-essencial` viraria `#plano-esencial` em
               espanhol e a âncora do cartão de serviço quebraria em dois
               idiomas de três. */
            <article
              className={`price-card${item.featured ? " is-featured" : ""}`}
              id={`plano-${index + 1}`}
              key={item.name}
              data-reveal
            >
              <p className="price-eyebrow">{item.eyebrow}</p>
              <h3>{item.name}</h3>
              <p className="price-description">{item.description}</p>
              <div className="price">
                {partes.antes && <small>{partes.antes}</small>}
                <strong>{partes.numero}</strong>
                {partes.depois && <small className="price-moeda-depois">{partes.depois}</small>}
                <span>{t.investimento.porProjeto}</span>
              </div>
              {/* Prazo típico. Era a primeira pergunta das dúvidas frequentes
                  e a resposta ficava a 8.000px daqui, depois do preço, que é
                  exatamente onde a decisão é tomada. */}
              <p className="price-entrega">
                <span>{t.investimento.entregaRotulo}</span>
                {item.entrega}
              </p>
              <a className={`button button--bloco ${item.featured ? "button--cream" : "button--outline"}`} href="#contato" onClick={(event) => handleNavClick(event, "#contato")}>
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

        {/* Condição de pagamento uma vez só, abaixo dos três: ela é igual
            para todos, e repetida em cada cartão leria como se variasse. */}
        <p className="pricing-pagamento" data-reveal>{t.investimento.pagamento}</p>

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
          {/* Três planos com preço e nenhuma forma de contratar. Era o buraco
              mais estranho da página: a seção anterior tem botão em cada
              cartão, e esta, que vende assinatura, terminava em nota de
              rodapé. */}
          <a className="button button--cream" href="#contato" onClick={(event) => handleNavClick(event, "#contato")}>
            {t.manutencao.cta} <ArrowIcon />
          </a>
        </div>
      </section>
    </>
  );
}
