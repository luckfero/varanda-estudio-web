"use client";

import type { CSSProperties } from "react";

import { featuredAssets } from "./data";
import type { Dicionario } from "./i18n";
import { useAncoraSuave } from "./use-ancora-suave";

/**
 * Abertura, apresentação e formatos: as três seções acima do portfólio.
 *
 * Recebe as fatias que usa, e não o dicionário inteiro. A diferença não é de
 * estilo: **tudo que é passado como propriedade para um componente cliente
 * vai serializado no payload enviado ao navegador**, usado ou não. Com o
 * dicionário inteiro, o texto da política de privacidade, que é o único lugar
 * onde o nome da pessoa aparece, viajava no fonte de todas as páginas,
 * invisível na tela e presente no HTML. Há teste para isso.
 *
 * A marcação segue o `corpo.html` da identidade nova, classe por classe. Os
 * nomes antigos (`.hero`, `.hero-copy`, `.kicker`, `.intro`, `.services`,
 * `.service-card`) saíram inteiros: meio-termo deixaria a página com duas
 * gramáticas, e o CSS deles já não existe.
 *
 * O `data-reveal` continua sendo o do site (`app/use-reveal.ts`), e não o
 * `data-revelar` do protótipo, que é o nome do script avulso dele. O atraso
 * vai por `--atraso` em `style=`, que é como o protótipo escreve e o que
 * `base.css` lê.
 */

/* Os dois ícones vêm escritos aqui, e não de `app/icons.tsx`, por um motivo
   concreto: os SVGs de lá não declaram `fill` nem `stroke`, e quem os pintava
   era a regra `.button svg, .text-link svg { fill: none; stroke: currentColor }`
   do `hero.css` antigo. Essa regra não existe mais, e a de `base.css`
   (`.botao svg`) só define tamanho. Sem os atributos, uma seta de contorno
   renderiza como mancha preta preenchida. A marcação de referência escreve os
   atributos no próprio SVG, e é o que fica. */
function Seta() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}

function SetaDiagonal() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M7 7h10v10M7 17 17 7" />
    </svg>
  );
}

/* O atraso da revelação, escrito por elemento. `CSSProperties` não aceita
   propriedade customizada sem a asserção, e a asserção fica num lugar só em
   vez de repetida em cada `style=`. */
const atraso = (ms: number) => ({ "--atraso": `${ms}ms` }) as CSSProperties;

export default function SectionAbertura({
  hero,
  intro,
  servicos,
  noArRotulo,
  noAr,
}: {
  hero: Dicionario["hero"];
  intro: Dicionario["intro"];
  servicos: Dicionario["servicos"];
  /* A PROVA da abertura, e as duas propriedades são OPCIONAIS de propósito.
     O bloco mostra os sites que já estão no ar, e esse texto mora em
     `portfolio` (`noArIndice` e `destaques`), que não é fatia desta seção.
     Quem monta a página (`app/pagina.tsx`) precisa passar
     `noArRotulo={t.portfolio.noArIndice}` e `noAr={t.portfolio.destaques}`.
     Enquanto não passar, o bloco simplesmente não aparece, que é o pior caso
     aceitável: melhor um lugar vazio do que texto comercial escrito dentro do
     componente.
     O tipo pede só `name` porque só o nome é usado aqui. O endereço vem de
     `featuredAssets`, pareado por índice, exatamente como no portfólio. */
  noArRotulo?: string;
  noAr?: ReadonlyArray<{ name: string }>;
}) {
  const handleNavClick = useAncoraSuave();

  /* Pareamento por índice, e o `slice` é a trava: se um dia a lista de texto
     e a de endereços divergirem em tamanho, o excedente fica de fora em vez
     de gerar um cartão com nome e sem link, ou com link e sem nome. */
  const provas = (noAr ?? [])
    .slice(0, featuredAssets.length)
    .map((projeto, indice) => ({ nome: projeto.name, url: featuredAssets[indice].url }));

  return (
    <>
      {/* ===================================================================
          01. ABERTURA
          =================================================================== */}
      <section className="secao abertura" id="inicio" aria-labelledby="titulo-abertura">
        <div className="luz" aria-hidden="true" />
        <div className="grade-fina" aria-hidden="true" />
        <div className="trama" aria-hidden="true" />

        <div className="caixa acima">
          <div className="abertura-grade">
            <div data-reveal>
              <p className="rotulo">
                <b>01</b>
                <i aria-hidden="true" />
                {hero.kicker}
              </p>
              <h1 id="titulo-abertura">
                {hero.tituloAntes}
                <em>{hero.tituloDestaque}</em>
                {hero.tituloDepois}
              </h1>
              <p className="lead">{hero.lead}</p>

              <div className="abertura-acoes">
                <a className="botao botao--acento" href="#contato" onClick={(event) => handleNavClick(event, "#contato")}>
                  {hero.ctaPrimario}
                  <Seta />
                </a>
                <a className="link-texto" href="#portfolio" onClick={(event) => handleNavClick(event, "#portfolio")}>
                  {hero.ctaSecundario}
                  <SetaDiagonal />
                </a>
              </div>

              <p className="abertura-pe mono">
                <span><i className="ponto" aria-hidden="true" /> {hero.local}</span>
                <span><i className="ponto" aria-hidden="true" /> {hero.atendimento}</span>
              </p>
            </div>

            {/* A arte. Papel de imagem, com nome acessível, e todo o conteúdo
                interno marcado como decorativo: o que está ali dentro é
                cenário, e leitor de tela que lesse "seunegocio.com.br" leria
                um endereço que não existe.

                Ela não tem animação própria. A composição anterior tinha uma
                sequência de luz inteira, e o `data-reveal` era o gatilho dela
                (regra 9.26). Aqui a entrada é a revelação de sempre, com
                atraso, e por isso não há duas animações disputando o mesmo
                elemento. */}
            <div className="maquete" role="img" aria-label={hero.arteAlt} data-reveal style={atraso(120)}>
              <div className="maquete-arco" aria-hidden="true" />
              <div className="maquete-sol" aria-hidden="true" />
              <div className="janela" aria-hidden="true">
                <div className="janela-barra">
                  <i /><i /><i />
                  <span>{hero.navegadorEndereco}</span>
                </div>
                <div className="janela-corpo">
                  <p className="janela-marca">{hero.navegadorMarca}</p>
                  {/* O título do navegador de mentira quebra em duas linhas, e
                      o ponto da quebra muda com a língua. Por isso ele vem do
                      dicionário com a marcação junto, e não como texto puro. */}
                  <p className="janela-titulo" dangerouslySetInnerHTML={{ __html: hero.navegadorTitulo }} />
                  <div className="janela-linhas"><i /><i /></div>
                  <span className="janela-botao">{hero.navegadorBotao}</span>
                </div>
                <div className="janela-leituras">
                  <div className="janela-leitura">
                    <span className="mono">{hero.notaTopo}</span>
                    <strong>{hero.notaTopoForte}</strong>
                  </div>
                  <div className="janela-leitura">
                    <span className="mono">{hero.notaBaixo}</span>
                    <strong>{hero.notaBaixoForte}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* A PROVA. Os dois endereços estão de fato no ar e qualquer um
              confere em um clique, o que é prova mais forte que um logotipo
              cinza. Sai inteira quando o texto não é passado: ver o comentário
              das propriedades. */}
          {noArRotulo && provas.length > 0 ? (
            <div className="prova" data-reveal style={atraso(200)}>
              <div className="prova-linha">
                <p className="mono prova-rotulo">{noArRotulo}</p>
                <div className="prova-marcas">
                  {provas.map((prova) => (
                    <a key={prova.url} href={prova.url} target="_blank" rel="noreferrer">
                      <strong>{prova.nome}</strong>
                      <span>{new URL(prova.url).host}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* ===================================================================
          02. APRESENTAÇÃO
          =================================================================== */}
      <section className="secao" aria-labelledby="titulo-apresentacao">
        <div className="caixa">
          <div className="apresentacao-grade">
            <div data-reveal>
              <p className="rotulo">
                <b>02</b>
                <i aria-hidden="true" />
                {intro.indice}
              </p>
              <p className="sobrancelha">{intro.eyebrow}</p>
              {/* PENDÊNCIA: o protótipo destaca "sentido" em itálico no
                  acento, e o dicionário guarda o título como frase inteira.
                  Fazer o destaque exige três chaves novas nos três idiomas
                  (o padrão de `hero` e de `portfolio`, com antes, destaque e
                  depois). Até existirem, o título sai inteiro, que é o texto
                  certo sem o realce. */}
              <h2 className="titulo-secao" id="titulo-apresentacao">{intro.titulo}</h2>
            </div>
            <div className="colunas" data-reveal style={atraso(100)}>
              <div className="coluna">
                <p className="corpo">{intro.coluna1}</p>
              </div>
              <div className="coluna">
                <p className="corpo">{intro.coluna2}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          03. FORMATOS
          =================================================================== */}
      <section className="secao" id="servicos" aria-labelledby="titulo-formatos">
        <div className="caixa">
          <div className="cabeca-secao" data-reveal>
            <div>
              <p className="rotulo">
                <b>03</b>
                <i aria-hidden="true" />
                {servicos.indice}
              </p>
              {/* Mesma pendência da apresentação: o protótipo destaca
                  "momento". O `dangerouslySetInnerHTML` que estava aqui saiu
                  porque nenhum dos três dicionários traz marcação nesta
                  chave, e injetar HTML que ninguém escreve é risco sem uso. */}
              <h2 className="titulo-secao" id="titulo-formatos">{servicos.titulo}</h2>
            </div>
            <p className="lead">{servicos.resumo}</p>
          </div>

          <div className="formatos-grade">
            {servicos.lista.map((formato, indice) => (
              <article className="cartao cartao--interativo formato" key={formato.number} data-reveal style={atraso(indice * 90)}>
                {/* O número é decorativo para quem ouve: ele repete a posição
                    do cartão, que a lista já dá. */}
                <p className="formato-numero numeral" aria-hidden="true">{formato.number}</p>
                <h3 className="titulo-bloco">{formato.title}</h3>
                <p>{formato.text}</p>
                <a className="link-texto" href="#investimento" onClick={(event) => handleNavClick(event, "#investimento")}>
                  {servicos.verPlano}
                  <Seta />
                </a>
              </article>
            ))}
          </div>

          {/* O fecho é a saída para quem não cabe em nenhum dos três, e a
              pergunta ao lado é o que dá sentido ao botão.
              O PAR DE BOTÕES DE HOJE CONTINUA INTEIRO, só que redistribuído
              como a marcação de referência faz: `servicos.verPlano` com a
              âncora `#investimento` vive agora dentro de cada cartão, onde
              ele é a saída natural de quem acabou de ler o formato, e
              `servicos.notaLink` com a âncora `#contato` fecha a seção. As
              duas chaves e as duas âncoras seguem na página; o que mudou foi
              o lugar. Repetir `verPlano` aqui embaixo o poria quatro vezes na
              mesma tela. */}
          <div className="fecho" data-reveal>
            <p>{servicos.nota}</p>
            <div className="fecho-acoes">
              <a className="botao botao--contorno botao--compacto" href="#contato" onClick={(event) => handleNavClick(event, "#contato")}>
                {servicos.notaLink}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
