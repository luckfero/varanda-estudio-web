"use client";

import { LeafMark } from "./icons";
import { useAncoraSuave } from "./use-ancora-suave";

export default function SiteFooter() {
  const handleNavClick = useAncoraSuave();

  return (
    <footer className="footer">
      <div className="footer-top">
        <a className="brand brand--footer" href="#inicio" aria-label="Varanda Estúdio Web — voltar ao início" onClick={(event) => handleNavClick(event, "#inicio")}>
          <LeafMark small />
          <span><strong>Varanda</strong><small>Estúdio Web</small></span>
        </a>
        <p>Sites próximos, bem pensados e feitos do zero.</p>
        <a className="back-top" href="#inicio" onClick={(event) => handleNavClick(event, "#inicio")}>Voltar ao topo ↑</a>
      </div>
      <div className="footer-bottom">
        <span className="footer-location">São Paulo, Brasil · Atendimento remoto</span>
        <a href="/privacidade">Privacidade</a>
        <span className="footer-copyright">© 2026 Varanda Estúdio Web</span>
      </div>
    </footer>
  );
}
