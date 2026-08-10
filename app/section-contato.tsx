"use client";

import { FormEvent, useState } from "react";
import { whatsappUrl } from "./data";
import { ArrowIcon } from "./icons";

/**
 * Formulário de contato.
 *
 * Não há banco de dados: o envio monta a mensagem e abre o WhatsApp. O
 * estado do envio e o link de reserva nascem e morrem dentro desta seção.
 */
export default function SectionContato() {
  const [formStatus, setFormStatus] = useState<"idle" | "success" | "blocked">("idle");
  /* Guardado para o caso de a aba ser bloqueada: aí o link vira algo
     clicável na própria página, em vez de um beco sem saída. */
  const [whatsappLink, setWhatsappLink] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const texto = (campo: string) => String(data.get(campo) ?? "").trim();
    const message = [
      "Olá! Vim pelo site da Varanda Estúdio Web.",
      "",
      `Meu nome: ${texto("name")}`,
      `Negócio: ${texto("business")}`,
      `E-mail: ${texto("email")}`,
      `WhatsApp: ${texto("phone")}`,
      `Tipo de site: ${texto("siteType")}`,
      "",
      "Sobre o projeto:",
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
          <div className="section-index section-index--light">10 — Vamos conversar</div>
          <h2 id="contact-title">Seu negócio merece<br />um lugar para <em>crescer.</em></h2>
          <p>
            Conte o que seu negócio precisa e em que momento ele está. Analisamos as informações e respondemos com a orientação para o próximo passo.
          </p>
          <div className="contact-direct">
            <a
              href={`${whatsappUrl}?text=${encodeURIComponent("Olá! Vim pelo site da Varanda Estúdio Web e gostaria de conversar sobre um projeto.")}`}
              target="_blank"
              rel="noreferrer"
              aria-label="Falar com a Varanda pelo WhatsApp em uma nova aba"
            >
              <span>WhatsApp</span>
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
              Seu nome *
              <input name="name" type="text" autoComplete="name" required placeholder="Como você prefere ser chamado?" />
            </label>
            <label>
              Nome do negócio *
              <input name="business" type="text" autoComplete="organization" required placeholder="Nome da empresa ou do projeto" />
            </label>
          </div>
          <div className="field-row">
            <label>
              E-mail *
              <input name="email" type="email" autoComplete="email" required placeholder="voce@exemplo.com" />
            </label>
            <label>
              WhatsApp *
              <input name="phone" type="tel" autoComplete="tel" required placeholder="(11) 99999-9999" />
            </label>
          </div>
          <label>
            Que tipo de site você procura? *
            <select name="siteType" required defaultValue="">
              <option value="" disabled>Selecione uma opção</option>
              <option>Essencial — uma página</option>
              <option>Negócio — site completo</option>
              <option>Profissional — site completo e mais uma capacidade</option>
              <option>Loja virtual ou projeto especial</option>
              <option>Ainda não sei</option>
            </select>
          </label>
          <label>
            Conte sobre o projeto *
            <textarea name="summary" required rows={5} placeholder="Conte o que seu negócio faz, o que o site precisa apresentar e qual resultado você espera." />
          </label>
          <label className="consent">
            <input name="consent" type="checkbox" required />
            <span>Concordo com o uso destes dados para receber retorno sobre meu projeto, conforme a <a href="/privacidade">Política de Privacidade</a>.</span>
          </label>
          <button className="button button--terracotta" type="submit">
            Continuar no WhatsApp <ArrowIcon />
          </button>
          <p className="form-hint">Ao continuar, o WhatsApp abrirá uma mensagem com as informações preenchidas. Nada é armazenado em um banco de dados deste site.</p>
          {formStatus === "success" && (
            <p className="form-success" role="status">
              Mensagem preparada e aberta no WhatsApp. Confira e toque em enviar
              para que ela chegue até nós.
            </p>
          )}
          {formStatus === "blocked" && (
            <p className="form-success" role="status">
              O navegador bloqueou a nova aba.{" "}
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                Abrir a mensagem no WhatsApp
              </a>{" "}
              — os dados já preenchidos vão junto.
            </p>
          )}
        </form>
      </section>
  );
}
