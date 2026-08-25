"use client";

import { emailContato } from "./data";
import type { Dicionario } from "./i18n";
import { ArcoMark } from "./icons";
import { useAncoraSuave } from "./use-ancora-suave";

export default function SiteFooter({
  rodape,
  privacyPath,
}: {
  rodape: Dicionario["rodape"];
  privacyPath: string;
}) {
  /* Fatia, não o dicionário: propriedade de componente cliente viaja
     serializada até o navegador. */
  const t = { rodape, privacyPath };
  const handleNavClick = useAncoraSuave();

  return (
    <footer className="footer">
      <div className="footer-top">
        <a className="brand brand--footer" href="#inicio" aria-label={t.rodape.voltarInicio} onClick={(event) => handleNavClick(event, "#inicio")}>
          <ArcoMark small />
          <span><strong>Varanda</strong><small>Estúdio Web</small></span>
        </a>
        <p>{t.rodape.frase}</p>
        <a className="back-top" href="#inicio" onClick={(event) => handleNavClick(event, "#inicio")}>{t.rodape.voltarTopo}</a>
      </div>
      <div className="footer-bottom">
        <span className="footer-location">{t.rodape.local}</span>
        {/* O canal também aqui, e não só na seção de contato: quem chega ao
            rodapé passou por tudo e não clicou em nada, e mandá-lo rolar de
            volta é perder a única pessoa que leu a página inteira. */}
        <a href={`mailto:${emailContato}`}>{emailContato}</a>
        {/* O caminho da política muda com o idioma (`/privacidade`,
            `/es/privacidad`, `/en/privacy`), então vem do dicionário — link
            fixo mandaria o visitante espanhol para a versão portuguesa. */}
        <a href={t.privacyPath}>{t.rodape.privacidade}</a>
        <span className="footer-copyright">{t.rodape.direitos}</span>
      </div>
    </footer>
  );
}
