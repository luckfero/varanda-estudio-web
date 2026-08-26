"use client";

import { ArcoMark, ArrowDownRightIcon, ArrowIcon } from "./icons";
import type { Dicionario } from "./i18n";
import { useAncoraSuave } from "./use-ancora-suave";

/**
 * Hero, apresentação e serviços — as três seções acima do portfólio.
 *
 * Recebe as três fatias que usa, e não o dicionário inteiro. A diferença não
 * é de estilo: **tudo que é passado como propriedade para um componente
 * cliente vai serializado no payload enviado ao navegador**, usado ou não.
 * Com o dicionário inteiro, o texto da política de privacidade — que é o
 * único lugar onde o nome da pessoa aparece — viajava no fonte de todas as
 * páginas, invisível na tela e presente no HTML. Há teste para isso.
 */
export default function SectionAbertura({
  hero,
  intro,
  servicos,
}: {
  hero: Dicionario["hero"];
  intro: Dicionario["intro"];
  servicos: Dicionario["servicos"];
}) {
  const t = { hero, intro, servicos };
  const handleNavClick = useAncoraSuave();

  return (
    <>
      <section className="hero" id="inicio">
        <div className="hero-copy" data-reveal>
          <p className="kicker"><span /> {t.hero.kicker}</p>
          <h1>{t.hero.tituloAntes}<em>{t.hero.tituloDestaque}</em>{t.hero.tituloDepois}</h1>
          <p className="hero-lead">{t.hero.lead}</p>
          <div className="hero-actions">
            <a className="button button--primary" href="#contato" onClick={(event) => handleNavClick(event, "#contato")}>
              {t.hero.ctaPrimario} <ArrowIcon />
            </a>
            <a className="text-link" href="#portfolio" onClick={(event) => handleNavClick(event, "#portfolio")}>{t.hero.ctaSecundario} <ArrowDownRightIcon /></a>
          </div>
          <div className="hero-footnote">
            <span>{t.hero.local}</span>
            <span>{t.hero.atendimento}</span>
          </div>
        </div>

        {/* A composição da direita, estática.
         *
         * Levou animação de entrada por uma rodada e voltou a ser parada. O
         * que sobrou daquela versão é o desenho: o arco cheio, o sol nascendo
         * dentro dele e a janela sobreposta, em vez de contida.
         *
         * Sem animação, as caixas duplas que existiam para o `transform` da
         * rotação não brigar com o quadro final saíram junto: cada peça voltou
         * a ser um elemento só. O `svg` do contorno também saiu, porque ele
         * existia apenas para o traço se desenhar e terminava invisível.
         *
         * O `data-reveal` voltou: é o revelar por rolagem que todo bloco do
         * site tem, e sem as animações próprias não há mais com o que brigar. */}
        {/* O `data-reveal` é o GATILHO da luz, não um concorrente dela.
            Antes a sequência disparava no carregamento, e no celular a arte
            fica ABAIXO do texto: quando o visitante rolava até ela, a
            animação já tinha acabado e ele via só o quadro final. Agora as
            regras da luz vivem sob `.hero-art.is-visible`, a classe que o
            observador põe quando o bloco entra na tela.

            Consequência boa: sem `IntersectionObserver`, `is-visible` nunca
            chega, nenhuma animação existe e a composição nasce montada. */}
        <div className="hero-art" role="img" aria-label={t.hero.arteAlt} data-reveal>
          <div className="art-sol" />

          <div className="art-arco">
            {/* A luz entra por dentro do arco. Fica aqui, e não solta na
                composição, porque `.art-arco` já tem `overflow: hidden` e o
                raio da abóbada: os feixes se recortam na forma sem precisar
                de máscara própria. Decorativo, então `aria-hidden`. */}
            <svg className="art-luz" viewBox="0 0 600 620" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
              <defs>
                <radialGradient id="var-brilho" cx="50%" cy="88%" r="62%">
                  <stop offset="0" stopColor="#dcb668" stopOpacity=".55" />
                  <stop offset=".45" stopColor="#c79a43" stopOpacity=".22" />
                  <stop offset="1" stopColor="#214d3b" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="var-feixe-a" x1="120" y1="0" x2="470" y2="620" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#dcb668" stopOpacity=".34" />
                  <stop offset=".55" stopColor="#c79a43" stopOpacity=".12" />
                  <stop offset="1" stopColor="#214d3b" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="var-feixe-b" x1="220" y1="0" x2="560" y2="620" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#f0dcae" stopOpacity=".40" />
                  <stop offset=".5" stopColor="#c79a43" stopOpacity=".14" />
                  <stop offset="1" stopColor="#214d3b" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="var-feixe-c" x1="330" y1="0" x2="650" y2="620" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#b86749" stopOpacity=".30" />
                  <stop offset=".6" stopColor="#b86749" stopOpacity=".08" />
                  <stop offset="1" stopColor="#214d3b" stopOpacity="0" />
                </linearGradient>
              </defs>

              <rect className="art-luz__brilho" x="-60" y="-60" width="720" height="740" fill="url(#var-brilho)" />

              <g className="art-luz__feixes">
                <path className="art-luz__feixe art-luz__feixe--1" d="M40 -80 210 -80 470 700 300 700Z" fill="url(#var-feixe-a)" />
                <path className="art-luz__feixe art-luz__feixe--2" d="M215 -80 320 -80 600 700 495 700Z" fill="url(#var-feixe-b)" />
                <path className="art-luz__feixe art-luz__feixe--3" d="M330 -80 385 -80 660 700 605 700Z" fill="url(#var-feixe-c)" />
              </g>

</svg>

            <div className="art-arco-sol" />
          </div>

          <div className="art-janela">
            <div className="art-janela-topo"><i /><i /><i /><span>{t.hero.navegadorEndereco}</span></div>
            <div className="art-janela-conteudo">
              <div className="art-janela-marca">{t.hero.navegadorMarca}</div>
              {/* O título do navegador de mentira quebra em duas linhas, e o
                  ponto da quebra muda com a língua — por isso vem do
                  dicionário com a marcação junto, e não como texto puro. */}
              <div className="art-janela-titulo" dangerouslySetInnerHTML={{ __html: t.hero.navegadorTitulo }} />
              <div className="art-janela-linhas"><i /><i /></div>
              <div className="art-janela-botao">{t.hero.navegadorBotao}</div>
            </div>
          </div>

          <div className="art-recado art-recado--topo">{t.hero.notaTopo}<br /><strong>{t.hero.notaTopoForte}</strong></div>
          <div className="art-recado art-recado--base"><small>{t.hero.notaBaixo}</small><strong>{t.hero.notaBaixoForte}</strong></div>
        </div>
      </section>

      <section className="intro section" aria-labelledby="intro-title">
        <div className="section-index">{t.intro.indice}</div>
        <div className="intro-content" data-reveal>
          <p className="eyebrow">{t.intro.eyebrow}</p>
          <h2 id="intro-title">{t.intro.titulo}</h2>
          <div className="intro-columns">
            <p>{t.intro.coluna1}</p>
            <p>{t.intro.coluna2}</p>
          </div>
        </div>
        <ArcoMark />
      </section>

      <section className="services section" id="servicos" aria-labelledby="services-title">
        <div className="section-heading" data-reveal>
          <div>
            {/* Sem `--light`: aquela variante existe para chão ESCURO, e a seção era
                verde escuro até 25/08. Sobre a areia ela media 1,6:1 e a
                sobrancelha praticamente não aparecia na captura. */}
            <div className="section-index">{t.servicos.indice}</div>
            <h2 id="services-title" dangerouslySetInnerHTML={{ __html: t.servicos.titulo }} />
          </div>
          <p>{t.servicos.resumo}</p>
        </div>
        <div className="service-grid">
          {t.servicos.lista.map((service, index) => (
            <article className="service-card" key={service.number} data-reveal>
              <span>{service.number}</span>
              <div className="service-icon" aria-hidden="true"><i /><i /></div>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
            </article>
          ))}
        </div>
        {/* Um par de botões no pé da seção, no lugar dos três que viviam
            dentro dos cartões. O da esquerda leva ao investimento inteiro, e
            não a um plano só: sem o preço no cartão, apontar para o cartão
            certo deixou de ter sentido. O da direita é a saída para quem não
            cabe em nenhum dos três, e a pergunta acima é o que dá sentido a
            ele. */}
        <div className="service-fecho" data-reveal>
          <p>{t.servicos.nota}</p>
          <div className="service-botoes">
            <a className="service-acao" href="#investimento" onClick={(event) => handleNavClick(event, "#investimento")}>
              {t.servicos.verPlano}
            </a>
            <a className="service-acao" href="#contato" onClick={(event) => handleNavClick(event, "#contato")}>
              {t.servicos.notaLink}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
