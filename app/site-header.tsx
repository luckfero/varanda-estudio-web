"use client";

import { useEffect, useState } from "react";
import { LeafMark } from "./icons";
import { useAncoraSuave } from "./use-ancora-suave";

/**
 * Barra fixa do topo.
 *
 * O estado do menu mora aqui, e não na página: ninguém mais precisa saber se
 * ele está aberto. O `Escape` fecha, e a rolagem para uma âncora também —
 * daí o gancho receber `setMenuOpen(false)` como aviso de navegação.
 */
export default function SiteHeader() {
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
      <a className="brand" href="#inicio" aria-label="Varanda Estúdio Web — início" onClick={(event) => handleNavClick(event, "#inicio")}>
        <LeafMark small />
        <span>
          <strong>Varanda</strong>
          <small>Estúdio Web</small>
        </span>
      </a>

      <button
        className="menu-toggle"
        type="button"
        aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
        aria-expanded={menuOpen}
        aria-controls="menu-principal"
        onClick={() => setMenuOpen((value) => !value)}
      >
        <span />
        <span />
      </button>

      <nav id="menu-principal" className={menuOpen ? "nav is-open" : "nav"} aria-label="Navegação principal">
        <a href="#servicos" onClick={(event) => handleNavClick(event, "#servicos")}>Serviços</a>
        <a href="#portfolio" onClick={(event) => handleNavClick(event, "#portfolio")}>Portfólio</a>
        <a href="#processo" onClick={(event) => handleNavClick(event, "#processo")}>Processo</a>
        <a href="#investimento" onClick={(event) => handleNavClick(event, "#investimento")}>Investimento</a>
        <a href="#sobre" onClick={(event) => handleNavClick(event, "#sobre")}>Sobre</a>
        <a className="nav-cta" href="#contato" onClick={(event) => handleNavClick(event, "#contato")}>
          Vamos conversar
        </a>
      </nav>
    </header>
  );
}
