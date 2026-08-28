"use client";

import { useEffect, useRef, useState } from "react";
import { ArcoMark } from "./icons";
import type { Dicionario, Locale } from "./i18n";
import { useAncoraSuave } from "./use-ancora-suave";

type Idioma = { locale: Locale; nome: string; hreflang: string; href: string };

/**
 * A barra do topo.
 *
 * O estado do menu mora aqui, e não na página: ninguém mais precisa saber se
 * ele está aberto. A classe `aberto` no `<header>` é DERIVADA do
 * `aria-expanded` do botão, e não uma segunda fonte de verdade, para não
 * existir estado em que o olho e o leitor de tela discordem.
 *
 * A INVERSÃO POR SUPERFÍCIE SAIU. Havia aqui um observador de rolagem que
 * media qual seção estava embaixo da barra e ligava `cabecalho-escuro` no
 * `<html>`, porque metade da página era clara e metade escura. A identidade
 * nova tem um chão só, então não há mais o que inverter: saíram o efeito e as
 * nove regras de CSS que ele acendia.
 */
export default function SiteHeader({
  nav,
  locale,
  idiomas,
}: {
  nav: Dicionario["nav"];
  locale: Locale;
  idiomas: Idioma[];
}) {
  /* A lista de idiomas é montada no servidor e chega pronta: assim este
     componente não precisa importar o módulo de i18n, que arrastaria os três
     dicionários inteiros para o pacote do navegador. */
  const [menuAberto, setMenuAberto] = useState(false);
  const menuRef = useRef<HTMLElement>(null);
  const botaoMenuRef = useRef<HTMLButtonElement>(null);

  /* Clicar num link do menu fecha o painel, e NÃO devolve o foco ao botão: o
     foco já foi para o destino da âncora, e trazê-lo de volta seria roubá-lo
     de quem acabou de navegar. Com Escape é o contrário, logo abaixo. */
  const handleNavClick = useAncoraSuave(() => setMenuAberto(false));

  /* O FOCO, e é o que o cabeçalho antigo não tinha.
     O painel que o botão abre vem ANTES dele no DOM, então apertar Tab logo
     depois de abrir levava para o conteúdo da página em vez do primeiro item
     do menu: era preciso Shift+Tab de volta para achar o que se acabou de
     abrir. Mover o botão para antes do `<nav>` resolveria isso e criaria
     outro problema: no desktop o menu é visualmente o primeiro dos dois, e a
     ordem de foco passaria a discordar da ordem visual, que é justamente o
     que o critério 2.4.3 existe para impedir. Então a marcação fica como o
     protótipo escreveu e quem manda no foco é este efeito.
     A guarda de primeira execução existe porque o efeito também roda na
     montagem: sem ela, o cabeçalho roubaria o foco de quem acabou de abrir a
     página. */
  const jaMontou = useRef(false);
  useEffect(() => {
    if (!jaMontou.current) {
      jaMontou.current = true;
      return;
    }
    if (menuAberto) menuRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
  }, [menuAberto]);

  /* Escape fecha e devolve o foco ao botão, senão quem navega por teclado
     fica largado no começo da página. */
  useEffect(() => {
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key !== "Escape" || !menuAberto) return;
      setMenuAberto(false);
      botaoMenuRef.current?.focus();
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [menuAberto]);

  return (
    /* `site-header` é PONTE, não estilo: `app/use-ancora-suave.ts` mede a
       altura da barra por esse seletor para descontá-la do destino da âncora,
       e sem ele a seção clicada para 76px embaixo do cabeçalho. Sai no dia em
       que aquele gancho passar a procurar `.topo`. Nenhuma regra desta folha
       mira esse nome. */
    <header className={menuAberto ? "topo site-header aberto" : "topo site-header"} id="topo">
      <div className="caixa topo-interno">
        <a
          className="marca"
          href="#inicio"
          aria-label={`Varanda Estúdio Web, ${nav.inicio}`}
          onClick={(evento) => handleNavClick(evento, "#inicio")}
        >
          <ArcoMark small />
          <span className="marca-nome">
            <strong>Varanda</strong>
            <small>Estúdio Web</small>
          </span>
        </a>

        {/* Os números são a numeração das seções chegando na barra: dado de
            navegação visual, não conteúdo, e por isso ficam na marcação e não
            no dicionário. `aria-hidden` para o leitor de tela ouvir só o nome
            do destino. */}
        <nav className="menu" id="menu-principal" aria-label={nav.navegacao} ref={menuRef}>
          <a href="#servicos" onClick={(evento) => handleNavClick(evento, "#servicos")}>
            <span className="menu-num" aria-hidden="true">03</span>{" "}
            {nav.servicos}
          </a>
          <a href="#portfolio" onClick={(evento) => handleNavClick(evento, "#portfolio")}>
            <span className="menu-num" aria-hidden="true">04</span>{" "}
            {nav.portfolio}
          </a>
          <a href="#processo" onClick={(evento) => handleNavClick(evento, "#processo")}>
            <span className="menu-num" aria-hidden="true">05</span>{" "}
            {nav.processo}
          </a>
          <a href="#investimento" onClick={(evento) => handleNavClick(evento, "#investimento")}>
            <span className="menu-num" aria-hidden="true">06</span>{" "}
            {nav.investimento}
          </a>
          <a href="#sobre" onClick={(evento) => handleNavClick(evento, "#sobre")}>
            <span className="menu-num" aria-hidden="true">08</span>{" "}
            {nav.sobre}
          </a>

          {/* A mesma chamada duas vezes, e só uma existe por vez: esta vive no
              painel do celular e a de `.topo-acoes` vive no desktop, cada uma
              escondida por `display: none` na largura da outra. Sem a
              duplicata, abrir o menu no celular esconderia o único botão de
              ação da barra. */}
          <a
            className="botao botao--acento botao--compacto"
            href="#contato"
            onClick={(evento) => handleNavClick(evento, "#contato")}
          >
            {nav.contato}
          </a>
        </nav>

        <div className="topo-acoes">
          {/* Navegação de verdade, não troca de estado: cada idioma é um
              endereço próprio, então são âncoras comuns. Funcionam com o
              JavaScript desligado, abrem em nova aba com o meio clique e o
              buscador as segue. O idioma atual aponta para o topo desta
              mesma página, que é para onde ele levaria de qualquer forma, e
              carrega `aria-current="page"`, que é o que o dá ao leitor de
              tela e ao CSS. */}
          <div className="idiomas" role="group" aria-label={nav.idioma}>
            <a
              href="#inicio"
              aria-current="page"
              onClick={(evento) => handleNavClick(evento, "#inicio")}
            >
              {locale.toUpperCase()}
            </a>
            {idiomas.map((idioma) => (
              <a key={idioma.locale} href={idioma.href} hrefLang={idioma.hreflang} lang={idioma.hreflang}>
                <span aria-hidden="true">{idioma.locale.toUpperCase()}</span>
                <span className="so-leitor">{idioma.nome}</span>
              </a>
            ))}
          </div>

          <a
            className="botao botao--acento botao--compacto"
            href="#contato"
            onClick={(evento) => handleNavClick(evento, "#contato")}
          >
            {nav.contato}
          </a>

          {/* O nome do botão é o texto do `span`, e não um `aria-label`: assim
              ele muda junto com o desenho do X e não há como um dizer "abrir"
              enquanto o outro já virou "fechar". */}
          <button
            className="abrir-menu"
            type="button"
            aria-expanded={menuAberto}
            aria-controls="menu-principal"
            onClick={() => setMenuAberto((aberto) => !aberto)}
            ref={botaoMenuRef}
          >
            <i aria-hidden="true" />
            <span className="so-leitor">{menuAberto ? nav.fecharMenu : nav.abrirMenu}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
