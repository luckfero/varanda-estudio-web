"use client";

import type { CSSProperties } from "react";
import type { Dicionario } from "./i18n";
import { partesDoPreco } from "./i18n";
import { useAncoraSuave } from "./use-ancora-suave";

/**
 * Processo, investimento e manutenção, na identidade nova.
 *
 * Fatias, não o dicionário inteiro: propriedade de componente cliente viaja
 * serializada até o navegador, e o dicionário completo levaria junto o texto
 * da política, que é o único lugar com o nome da pessoa.
 *
 * A mudança grande desta rodada é o meio: os três cartões de pacote lado a
 * lado viraram UMA tabela comparável. Três cartões obrigam o visitante a
 * comparar de memória, porque o segundo item do Essencial não fica na altura
 * do segundo item do Negócio; a tabela põe preço embaixo de preço e prazo
 * embaixo de prazo, e é a única razão de ela existir.
 */

/* O ATRASO DA REVELAÇÃO, escrito por elemento.
   A folha lê `--atraso` em `.reveal-ready [data-reveal]` (ver `base.css`), e
   a escada por `nth-child` saiu junto com as classes antigas que ela mirava.
   O `as CSSProperties` existe porque o tipo de `style` do React não conhece
   propriedade customizada, e sem ele o TypeScript recusa a chave. */
const atraso = (ms: number) => ({ "--atraso": `${ms}ms` }) as CSSProperties;

/**
 * DE ONDE SAI CADA CÉLULA DA TABELA.
 *
 * A matriz é o mapa entre as dez linhas de comparação e o conteúdo que já
 * existe no dicionário. Ela é estrutura, e não texto: nenhuma palavra
 * comercial mora aqui. Cada célula aponta para `launch`, para `entrega` ou
 * para um índice de `pacotes[].items`, e os 14 itens dos três pacotes foram
 * distribuídos um a um, sem inventar nem descartar nenhum.
 *
 * A ORDEM DAS LINHAS É COMPARTILHADA com `investimento.comparacao.linhas`
 * nos três dicionários. Elas são casadas por POSIÇÃO e nada no build reclama
 * se uma divergir: acrescentar uma linha aqui e esquecer o rótulo lá cola o
 * nome de uma dimensão nos valores de outra. Mexer nas duas juntas, sempre.
 *
 * O "herdado" é o item "Tudo do pacote Negócio" do Profissional. Ele aparece
 * por extenso na PRIMEIRA das quatro linhas que o Profissional herda, e nas
 * outras três fica só a marca: é a primeira que ensina o que a marca quer
 * dizer, e repetir a mesma frase quatro vezes na mesma coluna leria como
 * defeito, não como informação.
 *
 * O "nao" não afirma nada além do que a lista do pacote já diz. As listas de
 * `items` são o escopo por escrito de cada plano, então dimensão que não
 * aparece na lista de um plano não está nele.
 */
type Celula =
  | { tipo: "preco" }
  | { tipo: "prazo" }
  | { tipo: "item"; item: number }
  | { tipo: "herdado"; item: number }
  | { tipo: "sim" }
  | { tipo: "nao" };

const COMPARACAO: Celula[][] = [
  /* Investimento             */ [{ tipo: "preco" }, { tipo: "preco" }, { tipo: "preco" }],
  /* Prazo típico             */ [{ tipo: "prazo" }, { tipo: "prazo" }, { tipo: "prazo" }],
  /* Páginas ou seções        */ [{ tipo: "item", item: 0 }, { tipo: "item", item: 0 }, { tipo: "herdado", item: 0 }],
  /* Tratamento de texto      */ [{ tipo: "item", item: 1 }, { tipo: "item", item: 1 }, { tipo: "sim" }],
  /* Galeria e conteúdo       */ [{ tipo: "nao" }, { tipo: "item", item: 2 }, { tipo: "sim" }],
  /* Integrações              */ [{ tipo: "item", item: 2 }, { tipo: "item", item: 3 }, { tipo: "sim" }],
  /* Capacidade à escolha     */ [{ tipo: "nao" }, { tipo: "nao" }, { tipo: "item", item: 1 }],
  /* SEO e dados estruturados */ [{ tipo: "nao" }, { tipo: "nao" }, { tipo: "item", item: 2 }],
  /* Rodadas de ajuste        */ [{ tipo: "item", item: 3 }, { tipo: "item", item: 4 }, { tipo: "item", item: 3 }],
  /* Primeiro mês de plano    */ [{ tipo: "nao" }, { tipo: "nao" }, { tipo: "item", item: 4 }],
];

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
  const moedas = { moeda, moedaAposValor };
  const handleNavClick = useAncoraSuave();
  const comparacao = investimento.comparacao;

  /* A marca de presente e de ausente nunca vai sozinha. O `+` e o `–` são
     desenho e saem da árvore de acessibilidade; quem ouve a página recebe a
     palavra, porque leitor de tela sem ela anunciaria o nome do glifo, ou o
     silêncio de um traço. */
  const marcaSim = (
    <span className="marca-escopo marca-escopo--sim">
      <span aria-hidden="true">+</span>
      <span className="so-leitor">{comparacao.incluido}</span>
    </span>
  );
  const marcaNao = (
    <span className="marca-escopo marca-escopo--nao">
      <span aria-hidden="true">–</span>
      <span className="so-leitor">{comparacao.naoIncluido}</span>
    </span>
  );

  function conteudoDaCelula(celula: Celula, pacote: Dicionario["investimento"]["pacotes"][number]) {
    switch (celula.tipo) {
      case "preco": {
        /* Em linha corrida o símbolo e o número vêm juntos; aqui eles vão em
           elementos separados, com tamanhos diferentes. E em espanhol o
           símbolo cai DEPOIS do número, que é o que `partesDoPreco` resolve. */
        const partes = partesDoPreco(moedas, pacote.launch);
        return (
          <>
            <span className="preco">
              {partes.antes && <span className="preco-moeda">{partes.antes}</span>}
              <span className="preco-valor numeral">{partes.numero}</span>
              {partes.depois && <span className="preco-moeda">{partes.depois}</span>}
            </span>
            <span className="preco-unidade">{investimento.porProjeto}</span>
          </>
        );
      }
      case "prazo":
        return <span className="tabela-valor">{pacote.entrega}</span>;
      case "item":
        return <span className="tabela-valor">{pacote.items[celula.item]}</span>;
      case "herdado":
        return (
          <span className="tabela-valor">
            {marcaSim} {pacote.items[celula.item]}
          </span>
        );
      case "sim":
        return <span className="tabela-valor">{marcaSim}</span>;
      case "nao":
        return <span className="tabela-valor">{marcaNao}</span>;
    }
  }

  return (
    <>
      {/* =================================================================
          05. PROCESSO
          ================================================================= */}
      <section className="secao" id="processo" aria-labelledby="titulo-processo">
        <div className="caixa">
          <div className="cabeca-secao" data-reveal>
            <div>
              {/* O número é a posição da seção na página, e não texto
                  traduzível: ele é o mesmo nos três idiomas. Só o nome ao
                  lado sai do dicionário. */}
              <p className="rotulo">
                <b>05</b>
                <i aria-hidden="true" /> {processo.indice}
              </p>
              <h2
                className="titulo-secao"
                id="titulo-processo"
                dangerouslySetInnerHTML={{ __html: processo.titulo }}
              />
            </div>
            <p className="lead">{processo.resumo}</p>
          </div>

          {/* `role="list"` porque o alicerce tira o marcador com
              `list-style: none`, e o Safari tira a semântica de lista junto
              quando isso acontece. */}
          <ol className="linha-tempo" role="list">
            {processo.etapas.map((item, indice) => (
              <li className="etapa" key={item.step} data-reveal style={atraso(indice * 80)}>
                {/* O numeral é decoração de apoio ao título que vem logo
                    abaixo: quem ouve a página recebe "Conversa e briefing",
                    não "zero um". */}
                <span className="etapa-num numeral" aria-hidden="true">
                  {item.step}
                </span>
                <h3 className="titulo-item">{item.title}</h3>
                <p>{item.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* =================================================================
          06. INVESTIMENTO, COMO TABELA
          ================================================================= */}
      <section className="secao" id="investimento" aria-labelledby="titulo-investimento">
        <div className="caixa">
          <div className="cabeca-secao" data-reveal>
            <div>
              <p className="rotulo">
                <b>06</b>
                <i aria-hidden="true" /> {investimento.indice}
              </p>
              <h2
                className="titulo-secao"
                id="titulo-investimento"
                dangerouslySetInnerHTML={{ __html: investimento.titulo }}
              />
            </div>
            <p className="lead">{investimento.resumo}</p>
          </div>

          {/* A legenda é um parágrafo VISÍVEL antes da tabela, e não um
              `caption`. Duas razões: ela descreve o que se compara, que é
              informação para todo mundo e não só para quem ouve; e abaixo de
              900px a tabela vira cartão empilhado, o pai deixa de ser tabela
              e um `caption` viraria um parágrafo solto sem vínculo com
              nada. */}
          <p className="apoio tabela-legenda" data-reveal>
            {comparacao.legenda}
          </p>

          <div className="rolagem-tabela" data-reveal>
            <table className="tabela">
              <thead>
                <tr>
                  {/* Canto vazio: é a célula de cruzamento da tabela, e não
                      um rótulo que faltou. */}
                  <td className="tabela-canto" />
                  {investimento.pacotes.map((pacote) => (
                    <th
                      scope="col"
                      key={pacote.name}
                      className={pacote.featured ? "tabela-destaque" : undefined}
                    >
                      <span className={`tabela-perfil${pacote.featured ? " tabela-perfil--recomendado" : ""}`}>
                        {pacote.eyebrow}
                      </span>
                      <span className="tabela-nome">{pacote.name}</span>
                      <span className="tabela-resumo">{pacote.description}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARACAO.map((linha, indice) => (
                  <tr key={comparacao.linhas[indice]}>
                    <th scope="row">{comparacao.linhas[indice]}</th>
                    {investimento.pacotes.map((pacote, coluna) => (
                      <td key={pacote.name} className={pacote.featured ? "tabela-destaque" : undefined}>
                        {/* O nome do plano em cada célula, texto de verdade.
                            Acima de 900px ele fica escondido, porque o
                            `scope="col"` do cabeçalho já diz de qual coluna a
                            célula é; empilhado no celular ele é o que impede
                            três valores de virarem três números sem dono. */}
                        <span className="celula-plano">{pacote.name}</span>
                        {conteudoDaCelula(linha[coluna], pacote)}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="tabela-acoes">
                  <td className="tabela-canto" />
                  {investimento.pacotes.map((pacote) => (
                    <td key={pacote.name} className={pacote.featured ? "tabela-destaque" : undefined}>
                      <span className="celula-plano">{pacote.name}</span>
                      {/* Os três botões dizem a mesma frase. Sem o nome do
                          plano no fim, quem navega por lista de links ouve
                          "Quero este plano" três vezes e não tem como saber
                          qual é qual. */}
                      <a
                        className={`botao ${pacote.featured ? "botao--acento" : "botao--contorno"} botao--bloco`}
                        href="#contato"
                        onClick={(event) => handleNavClick(event, "#contato")}
                      >
                        {investimento.cta}
                        <span className="so-leitor">{" "}{pacote.name}</span>
                      </a>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Garantias da casa fora dos cartões, de propósito. Enquanto
              viviam dentro da lista de cada pacote, pareciam variar entre
              eles, e "direção visual autoral" só no mais caro dizia, na
              prática, que os outros dois eram modelo pronto. */}
          <div className="incluido" data-reveal>
            <h3>{investimento.incluidoTitulo}</h3>
            <div className="incluido-grade">
              {investimento.incluido.map((item) => (
                <div className="incluido-item" key={item.title}>
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Duas colunas, e a separação é comercial antes de ser visual: a
              esquerda está no preço do pacote, a direita não. O marcador
              difere de propósito, porque numa leitura rápida é ele que
              carrega a informação, e não a coluna. O `[$]` diz "tem orçamento
              próprio"; uma caixa de seleção vazia, que já esteve aqui, leria
              como "não oferecemos", que é o contrário do título. */}
          <div className="escopo" data-reveal>
            <div className="escopo-coluna escopo-coluna--incluso">
              <h3>{investimento.escopoIncluidoTitulo}</h3>
              <ul role="list">
                {investimento.escopoIncluido.map((item) => (
                  <li key={item}>
                    <b aria-hidden="true">[+]</b> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="escopo-coluna escopo-coluna--orcado">
              <h3>{investimento.escopoOrcamentoTitulo}</h3>
              <ul role="list">
                {investimento.escopoOrcamento.map((item) => (
                  <li key={item}>
                    <b aria-hidden="true">[$]</b> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Condição de pagamento uma vez só, abaixo dos três: ela é igual
              para todos, e repetida em cada coluna leria como se variasse. */}
          <p className="pagamento" data-reveal>
            {investimento.pagamento}
          </p>
          <p className="apoio nota-secao" data-reveal>
            {investimento.nota}
          </p>
        </div>
      </section>

      {/* =================================================================
          07. MANUTENÇÃO
          ================================================================= */}
      <section className="secao" aria-labelledby="titulo-manutencao">
        <div className="caixa">
          <div className="cabeca-secao" data-reveal>
            <div>
              <p className="rotulo">
                <b>07</b>
                <i aria-hidden="true" /> {manutencao.indice}
              </p>
              {/* Sem `<br />` entre as duas metades. A quebra à mão é uma
                  decisão tomada numa largura só, e aqui há três idiomas, um
                  `clamp` de tamanho e telas de 320 a 2560px: quem quebra é o
                  `text-wrap: balance` do alicerce. */}
              <h2 className="titulo-secao" id="titulo-manutencao">
                {manutencao.tituloAntes} <em>{manutencao.tituloDestaque}</em>
              </h2>
            </div>
            <p className="lead">{manutencao.resumo}</p>
          </div>

          {/* Aqui os três planos continuam sendo cartões, e não tabela: eles
              são uma ESCADA ("Tudo do plano Cuidado", "Tudo do plano
              Presença"), e escada se lê em coluna. Tabela serve onde as
              linhas são comparáveis item a item, que é o caso do
              investimento. */}
          <div className="planos">
            {manutencao.planos.map((item, indice) => {
              const partes = partesDoPreco(moedas, item.price);
              return (
                <article
                  className={`cartao${item.featured ? " cartao--destaque" : ""} plano`}
                  key={item.name}
                  data-reveal
                  style={atraso(indice * 90)}
                >
                  <h3>{item.name}</h3>
                  <p className="preco">
                    {partes.antes && <span className="preco-moeda">{partes.antes}</span>}
                    <span className="preco-valor numeral">{partes.numero}</span>
                    {partes.depois && <span className="preco-moeda">{partes.depois}</span>}
                    <span className="preco-moeda">{manutencao.porMes}</span>
                  </p>
                  <p className="plano-resumo">{item.summary}</p>
                  <ul className="plano-lista" role="list">
                    {item.items.map((linha) => (
                      <li key={linha}>{linha}</li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>

          <div className="manutencao-notas" data-reveal>
            <p className="apoio">{manutencao.nota1}</p>
            <p className="apoio">{manutencao.nota2}</p>
          </div>

          {/* Três planos com preço e nenhuma forma de contratar era o buraco
              mais estranho da página: a seção anterior tem botão em cada
              coluna, e esta, que vende assinatura, terminava em nota de
              rodapé. */}
          <div className="manutencao-acao" data-reveal>
            <a
              className="botao botao--acento"
              href="#contato"
              onClick={(event) => handleNavClick(event, "#contato")}
            >
              {manutencao.cta}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
