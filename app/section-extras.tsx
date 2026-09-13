import type { CSSProperties } from "react";
import ArteExtra from "./extras-arte";
import type { Dicionario } from "./i18n";

/**
 * Sob medida: os serviços extras, em cards com preço e ilustração.
 *
 * NASCEU EM 13/09/2026, e junta duas decisões do mesmo dia. A manutenção
 * mensal saiu do site (depois da publicação o estúdio vende só alteração
 * paga pelo tempo), e esta seção, que era uma lista de nome e preço no fim
 * da página, virou cards e subiu para logo depois do investimento. O lugar é
 * o argumento: quem acabou de ler o preço dos pacotes pergunta em seguida o
 * que custa o que não está neles, e é exatamente o que vem aqui.
 *
 * Componente de SERVIDOR. Os cards são links e as ilustrações animam só com
 * CSS, disparadas pela classe `is-visible` que a revelação por rolagem do
 * site já põe (a regra 9.26). Nada aqui precisa de JavaScript próprio.
 *
 * O CARD INTEIRO É O LINK, como nos três formatos: ele leva ao contato. O
 * verbo ("Falar sobre ...") vai em `.so-leitor`, porque sem ele o nome
 * acessível seria o card inteiro sem dizer o que o link faz.
 *
 * AS ILUSTRAÇÕES SÃO ACHADAS PELO NOME (`item.arte`), e não pela posição.
 * O mestre de cada uma é um SVG em `assets/extras-arte/`, e
 * `scripts/gerar-extras-arte.mjs` gera `extras-arte.tsx` e `extras-arte.css`
 * a partir deles.
 */

/* O card de destaque, no âmbar da marca. Um só por idioma, e é o que ficou
   no lugar da manutenção: a alteração avulsa é o que o cliente compra depois
   que o site está no ar. */
const DESTAQUE = new Set(["avulsa"]);

/* Os cards largos têm texto de um lado e desenho do outro. */
const LARGOS = new Set(["pagina"]);

const atraso = (ms: number) => ({ "--atraso": `${ms}ms` }) as CSSProperties;
/* A ilustração começa depois de o card aparecer, e não junto: com os dois
   ao mesmo tempo o traço corre dentro de uma caixa que ainda está surgindo. */
const depoisDoCard = (ms: number) => ({ "--atraso": `${ms}ms`, "--offset": `${ms + 180}ms` }) as CSSProperties;

function Seta() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M8 16 16 8M9 8h7v7" />
    </svg>
  );
}

export default function SectionExtras({ extras }: { extras: Dicionario["extras"] }) {
  const reparo = extras.reparo;
  return (
    <section className="secao" id="extras" aria-labelledby="titulo-extras">
      <div className="caixa">
        <div className="cabeca-secao" data-reveal>
          <div>
            <p className="rotulo"><b>07</b><i aria-hidden="true" />{extras.indice}</p>
            <h2 className="titulo-secao" id="titulo-extras">{extras.titulo}</h2>
          </div>
          <p className="lead">{extras.resumo}</p>
        </div>

        {/* `role="list"` porque o `list-style: none` do reset faz o Safari
            tirar a semântica de lista do `<ul>`. */}
        <ul className="extras-grade" role="list">
          {extras.lista.map((item, indice) => {
            const classes = [
              "cartao cartao--interativo extra",
              `extra--${item.arte}`,
              DESTAQUE.has(item.arte) ? "extra--destaque" : "",
              LARGOS.has(item.arte) ? "extra--largo" : "",
            ].filter(Boolean).join(" ");
            const ms = indice * 80;
            return (
              <li className={`extra-celula extra-celula--${item.arte}`} key={item.arte} data-reveal style={atraso(ms)}>
                <a className={classes} href="#contato">
                  <h3 className="extra-nome">{item.name}</h3>
                  <div className="extra-arte" aria-hidden="true" data-reveal style={depoisDoCard(ms)}>
                    <ArteExtra arte={item.arte} />
                  </div>
                  <div className="extra-pe">
                    <p className="extra-preco">
                      {item.prefixo && <span className="extra-prefixo">{item.prefixo}</span>}
                      <strong className="numeral">{item.valor}</strong>
                      {item.unidade && <span className="extra-unidade">{item.unidade}</span>}
                    </p>
                    <p className="extra-texto">{item.descricao}</p>
                  </div>
                  <span className="extra-seta" aria-hidden="true"><Seta /></span>
                  <span className="so-leitor">{`${extras.pedir}${item.name}`}</span>
                </a>
              </li>
            );
          })}

          {/* O REPARO, que só existe em português (`reparo.ativo`).
              Ele é o contrário dos outros cards: não se acrescenta a um
              projeto contratado, é um conserto fechado no site que a empresa
              JÁ TEM, para quem ainda não é cliente. Por isso ocupa a linha
              inteira e carrega o próprio rótulo, e a nota de que não é para
              cliente fica colada ao preço. */}
          {reparo.ativo && (
            <li className="extra-celula extra-celula--reparo" data-reveal style={atraso(extras.lista.length * 80)}>
              <a className="cartao cartao--interativo extra extra--reparo extra--largo" href="#contato">
                <p className="extra-rotulo">{reparo.rotulo}</p>
                <h3 className="extra-nome">{reparo.titulo}</h3>
                <div className="extra-arte" aria-hidden="true" data-reveal style={depoisDoCard(extras.lista.length * 80)}>
                  <ArteExtra arte="reparo" />
                </div>
                <div className="extra-pe">
                  <p className="extra-preco">
                    <strong className="numeral">{reparo.preco}</strong>
                    <span className="extra-unidade">{reparo.prazo}</span>
                  </p>
                  <p className="extra-texto">{reparo.texto}</p>
                  <p className="extra-texto">{reparo.abatimento}</p>
                  <p className="extra-texto extra-texto--nota">{reparo.nota}</p>
                </div>
                <span className="extra-seta" aria-hidden="true"><Seta /></span>
                <span className="so-leitor">{`${extras.pedir}${reparo.titulo}`}</span>
              </a>
            </li>
          )}
        </ul>

        <p className="apoio nota-secao" data-reveal>{extras.nota}</p>
      </div>
    </section>
  );
}
