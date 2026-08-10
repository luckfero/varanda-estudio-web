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
        <p>Sites brasileiros, próximos e bem pensados.</p>
        <a className="back-top" href="#inicio" onClick={(event) => handleNavClick(event, "#inicio")}>Voltar ao topo ↑</a>
      </div>
      <div className="footer-bottom">
        <span className="footer-location">São Paulo · Atendimento em todo o Brasil</span>
        <a href="/privacidade">Privacidade</a>
        <span className="footer-copyright">© 2026 Varanda Estúdio Web · Lucca Oliveira</span>
      </div>
    </footer>
  );
}
