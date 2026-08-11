"use client";

import { FormEvent, useState } from "react";
import { whatsappUrl } from "./data";
import type { Dicionario } from "./i18n";
import { ArrowIcon } from "./icons";

/**
 * Formulário de contato.
 *
 * Não há banco de dados: o envio monta a mensagem e abre o WhatsApp. O
 * estado do envio e o link de reserva nascem e morrem dentro desta seção.
 *
 * A mensagem sai no idioma em que o visitante navegou — inclusive os rótulos
 * de cada campo. É o que faz a conversa começar já na língua certa, sem
 * ninguém ter que perguntar.
 */
export default function SectionContato({
  contato,
  privacyPath,
}: {
  contato: Dicionario["contato"];
  privacyPath: string;
}) {
  /* Fatia, não o dicionário: propriedade de componente cliente viaja
     serializada até o navegador. */
  const t = { contato, privacyPath };
  const [formStatus, setFormStatus] = useState<"idle" | "success" | "blocked">("idle");
  /* Guardado para o caso de a aba ser bloqueada: aí o link vira algo
     clicável na própria página, em vez de um beco sem saída. */
  const [whatsappLink, setWhatsappLink] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const texto = (campo: string) => String(data.get(campo) ?? "").trim();
    const message = [
      t.contato.formSaudacao,
      "",
      `${t.contato.rotuloNome}: ${texto("name")}`,
      `${t.contato.rotuloNegocio}: ${texto("business")}`,
      `${t.contato.rotuloEmail}: ${texto("email")}`,
      `${t.contato.rotuloWhatsapp}: ${texto("phone")}`,
      `${t.contato.rotuloTipo}: ${texto("siteType")}`,
      "",
      t.contato.rotuloProjeto,
      texto("summary"),
    ].join("\n");

    const link = `${whatsappUrl}?text=${encodeURIComponent(message)}`;
    setWhatsappLink(link);

    /* `window.open` devolve `null` quando o navegador bloqueia a aba — é
       assim que se detecta o bloqueio. Antes o estado ia para "success" de
       qualquer jeito: quem tinha bloqueador via "mensagem preparada" e nada
       acontecia, sem nada para clicar.

       O `noopener` **não** pode ir na string de opções: com ele a chamada
       devolve `null` mesmo quando a aba abre, por especificação, e todo
       envio bem-sucedido seria reportado como bloqueado. Cortar o `opener`
       na mão dá o mesmo isolamento e ainda deixa a referência para testar. */
    const aba = window.open(link, "_blank");
    if (aba) aba.opener = null;
    setFormStatus(aba ? "success" : "blocked");
  }

  return (
      <section className="contact section" id="contato" aria-labelledby="contact-title">
        <div className="contact-copy" data-reveal>
          <div className="section-index section-index--light">{t.contato.indice}</div>
          <h2 id="contact-title">
            <span dangerouslySetInnerHTML={{ __html: t.contato.tituloAntes }} />
            <em>{t.contato.tituloDestaque}</em>
          </h2>
          <p>{t.contato.resumo}</p>
          <div className="contact-direct">
            <a
              href={`${whatsappUrl}?text=${encodeURIComponent(t.contato.whatsappMensagem)}`}
              target="_blank"
              rel="noreferrer"
              aria-label={t.contato.whatsappAria}
            >
              <span>{t.contato.whatsappLabel}</span>
              <strong>+55 11 94226-3007</strong>
            </a>
            {/* O e-mail saiu daqui em 2026-08-10.
                O endereço era `luccaassoc@gmail.com`: o nome da pessoa em
                texto grande, na seção de contato — exatamente o que a
                decisão de falar só como estúdio pedia para tirar, e ainda
                um Gmail, que contradiz a apresentação de estúdio mais do
                que qualquer assinatura.
                Volta como canal assim que existir `contato@` no domínio
                próprio. Até lá o contato é WhatsApp, que é para onde o
                formulário desta seção já leva. O endereço continua na
                política de privacidade, que precisa de um canal para
                pedido de titular. */}
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit} data-reveal>
          <div className="field-row">
            <label>
              {t.contato.campoNome}
              <input name="name" type="text" autoComplete="name" required placeholder={t.contato.campoNomePlaceholder} />
            </label>
            <label>
              {t.contato.campoNegocio}
              <input name="business" type="text" autoComplete="organization" required placeholder={t.contato.campoNegocioPlaceholder} />
            </label>
          </div>
          <div className="field-row">
            <label>
              {t.contato.campoEmail}
              <input name="email" type="email" autoComplete="email" required placeholder="voce@exemplo.com" />
            </label>
            <label>
              {t.contato.campoWhatsapp}
              <input name="phone" type="tel" autoComplete="tel" required placeholder="+55 11 99999-9999" />
            </label>
          </div>
          <label>
            {t.contato.campoTipo}
            <select name="siteType" required defaultValue="">
              <option value="" disabled>{t.contato.campoTipoPlaceholder}</option>
              {t.contato.tipos.map((tipo) => <option key={tipo}>{tipo}</option>)}
            </select>
          </label>
          <label>
            {t.contato.campoResumo}
            <textarea name="summary" required rows={5} placeholder={t.contato.campoResumoPlaceholder} />
          </label>
          <label className="consent">
            <input name="consent" type="checkbox" required />
            <span>{t.contato.consentimento} <a href={t.privacyPath}>{t.contato.consentimentoLink}</a>.</span>
          </label>
          <button className="button button--terracotta" type="submit">
            {t.contato.botao} <ArrowIcon />
          </button>
          <p className="form-hint">{t.contato.dica}</p>
          {formStatus === "success" && (
            <p className="form-success" role="status">{t.contato.sucesso}</p>
          )}
          {formStatus === "blocked" && (
            <p className="form-success" role="status">
              {t.contato.bloqueadoAntes}{" "}
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                {t.contato.bloqueadoLink}
              </a>{" "}
              {t.contato.bloqueadoDepois}
            </p>
          )}
        </form>
      </section>
  );
}
