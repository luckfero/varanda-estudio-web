"use client";

import { useEffect, useState } from "react";
import { LeafMark } from "./icons";
import type { Dicionario, Locale } from "./i18n";
import { useAncoraSuave } from "./use-ancora-suave";

type Idioma = { locale: Locale; nome: string; hreflang: string; href: string };

/**
 * Barra fixa do topo.
 *
 * O estado do menu mora aqui, e não na página: ninguém mais precisa saber se
 * ele está aberto. O `Escape` fecha, e a rolagem para uma âncora também —
 * daí o gancho receber `setMenuOpen(false)` como aviso de navegação.
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
  const t = { nav };
  const [menuOpen, setMenuOpen] = useState(false);
  const handleNavClick = useAncoraSuave(() => setMenuOpen(false));

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="site-header">
      <a className="brand" href="#inicio" aria-label={`Varanda Estúdio Web — ${t.nav.inicio}`} onClick={(event) => handleNavClick(event, "#inicio")}>
        <LeafMark small />
        <span>
          <strong>Varanda</strong>
          <small>Estúdio Web</small>
        </span>
      </a>

      <button
        className="menu-toggle"
        type="button"
        aria-label={menuOpen ? t.nav.fecharMenu : t.nav.abrirMenu}
        aria-expanded={menuOpen}
        aria-controls="menu-principal"
        onClick={() => setMenuOpen((value) => !value)}
      >
        <span />
        <span />
      </button>

      <nav id="menu-principal" className={menuOpen ? "nav is-open" : "nav"} aria-label={t.nav.navegacao}>
        <a href="#servicos" onClick={(event) => handleNavClick(event, "#servicos")}>{t.nav.servicos}</a>
        <a href="#portfolio" onClick={(event) => handleNavClick(event, "#portfolio")}>{t.nav.portfolio}</a>
        <a href="#processo" onClick={(event) => handleNavClick(event, "#processo")}>{t.nav.processo}</a>
        <a href="#investimento" onClick={(event) => handleNavClick(event, "#investimento")}>{t.nav.investimento}</a>
        <a href="#sobre" onClick={(event) => handleNavClick(event, "#sobre")}>{t.nav.sobre}</a>
        <a className="nav-cta" href="#contato" onClick={(event) => handleNavClick(event, "#contato")}>
          {t.nav.contato}
        </a>

        {/* Navegação de verdade, não troca de estado: cada idioma é um
            endereço próprio, então são âncoras comuns — funcionam com o
            JavaScript desligado, abrem em nova aba com o meio clique e o
            buscador as segue. `hrefLang` deixa explícito para onde cada uma
            vai, casando com o que os metadados anunciam. */}
        <div className="nav-idiomas" role="group" aria-label={t.nav.idioma}>
          <span aria-current="true">{locale.toUpperCase()}</span>
          {idiomas.map((idioma) => (
            <a key={idioma.locale} href={idioma.href} hrefLang={idioma.hreflang} lang={idioma.hreflang}>
              <span aria-hidden="true">{idioma.locale.toUpperCase()}</span>
              <span className="sr-only">{idioma.nome}</span>
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}
