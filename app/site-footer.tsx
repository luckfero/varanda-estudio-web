"use client";

import { emailContato } from "./data";
import CursorGrid from "./cursor-grid";
import type { Dicionario } from "./i18n";
import { ArcoMark } from "./icons";
import { useAncoraSuave } from "./use-ancora-suave";

/**
 * Rodapé (bloco 21 da identidade nova).
 *
 * Duas linhas: em cima a marca, a frase de fecho e o volta ao topo; embaixo o
 * local, os dois links e o copyright. Os nomes de classe saem de `corpo.html`;
 * os antigos (`.footer`, `.footer-top`, `.footer-bottom`, `.brand--footer`,
 * `.back-top`, `.footer-location`, `.footer-privacidade`, `.footer-copyright`)
 * saíram inteiros.
 *
 * A MARCA continua vindo de `ArcoMark`, em `app/icons.tsx`, e não colada à mão
 * a partir do protótipo: a geometria já vive em `icons.tsx`,
 * `public/favicon.svg` e `public/marca/simbolo.svg`, e uma quarta cópia seria
 * mais um lugar para as quatro divergirem. Quem a pinta é `header.css`.
 *
 * O `.marca-nome` é o do topo, e o responsivo o esconde abaixo de 400px SÓ lá
 * (`.topo .marca-nome`): aqui não existe disputa de largura, e o nome escrito
 * é o fecho da página.
 */
export default function SiteFooter({
  rodape,
  privacyPath,
}: {
  rodape: Dicionario["rodape"];
  privacyPath: string;
}) {
  /* Fatia, não o dicionário: propriedade de componente cliente viaja
     serializada até o navegador, e o dicionário inteiro levava junto o texto
     da política, que é o único lugar do site com o nome da pessoa. */
  const t = { rodape, privacyPath };
  const handleNavClick = useAncoraSuave();

  return (
    <footer className="rodape">
      {/* A GRADE PARADA, a mesma da abertura e do formulario. Ela entrou aqui
          em 01/09/2026, a pedido: sem ela as celulas acesas do CursorGrid
          apareciam soltas, sem linha nenhuma para sustentar.

          A ORDEM IMPORTA: as duas camadas vivem em `z-index: 0`, e entre
          iguais quem pinta por cima e quem vem depois no documento. A parada
          primeiro, a que acende depois. */}
      <div className="grade-fina" aria-hidden="true" />

      {/* A grade que responde ao cursor. Ver `app/cursor-grid.jsx`.

          `cellSize` 96 e `origemNoCanto` sao o que faz a celula acesa cair EM
          CIMA do quadrado da grade parada acima: ela e um `background-image`
          de 96 por 96 que comeca no canto do elemento, e o componente, por
          padrao, usa 100 e centraliza a malha. */}
      <CursorGrid
        className="cursor-grid--camada"
        escutaNoPai
        origemNoCanto
        cellSize={96}
        color="#e8a33c"
        radius={120}
        falloff="smooth"
        holdTime={100}
        fadeDuration={800}
        lineWidth={1.2}
        maxOpacity={0.3}
        fillOpacity={0}
        gridOpacity={0}
        cellRadius={0}
        clickPulse
        pulseSpeed={600}
      />
      <div className="caixa rodape-alto">
        <a
          className="marca"
          href="#inicio"
          aria-label={t.rodape.voltarInicio}
          onClick={(event) => handleNavClick(event, "#inicio")}
        >
          <ArcoMark />
          <span className="marca-nome"><strong>Varanda</strong><small>Estúdio Web</small></span>
        </a>
        <p>{t.rodape.frase}</p>
        <a
          className="botao botao--fantasma botao--compacto"
          href="#inicio"
          onClick={(event) => handleNavClick(event, "#inicio")}
        >
          {t.rodape.voltarTopo}
        </a>
      </div>

      {/* A ORDEM DESTES QUATRO É A ORDEM DE LEITURA, e o arranjo de tela vem
          da grade em `contact.css`: local à esquerda, e-mail no centro da
          página, privacidade à direita, copyright centrado embaixo do e-mail.
          Trocar a ordem aqui muda o arranjo, porque a primeira coluna é presa
          ao `span:first-child`. */}
      <div className="caixa rodape-baixo">
        <span>{t.rodape.local}</span>
        {/* O canal também aqui, e não só na seção de contato: quem chega ao
            rodapé passou por tudo e não clicou em nada, e mandá-lo rolar de
            volta é perder a única pessoa que leu a página inteira. */}
        <a className="rodape-email" href={`mailto:${emailContato}`}>{emailContato}</a>
        {/* O caminho da política muda com o idioma (`/privacidade`,
            `/es/privacidad`, `/en/privacy`), então vem do dicionário — link
            fixo mandaria o visitante espanhol para a versão portuguesa. */}
        <a href={t.privacyPath}>{t.rodape.privacidade}</a>
        <span className="direitos">{t.rodape.direitos}</span>
      </div>
    </footer>
  );
}
