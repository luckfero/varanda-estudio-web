"use client";

import { CSSProperties, FormEvent, useState } from "react";
import { emailContato, whatsappUrl } from "./data";
import type { Dicionario } from "./i18n";

/**
 * Contato: o formulário como painel (bloco 20 da identidade nova).
 *
 * A MÁQUINA NÃO MUDOU. Não há banco de dados: o envio monta a mensagem, abre
 * o WhatsApp e detecta bloqueio de aba. O estado do envio e o link de reserva
 * nascem e morrem dentro desta seção. Só a aparência e a marcação são novas.
 *
 * A mensagem sai no idioma em que o visitante navegou, inclusive os rótulos
 * de cada campo. É o que faz a conversa começar já na língua certa, sem
 * ninguém ter que perguntar.
 *
 * Os nomes de classe saem de `corpo.html`, verbatim. Os antigos (`.contact`,
 * `.contact-copy`, `.contact-direct`, `.contact-form`, `.field-row`,
 * `.consent`, `.form-hint`, `.form-success`) saíram inteiros: o CSS deles já
 * não existe, e meio-termo deixaria a página com duas gramáticas.
 *
 * `data-reveal` continua sendo o do site (`app/use-reveal.ts`), e não o
 * `data-revelar` do protótipo, que é o nome do script avulso dele.
 */

/* Escrita aqui, e não trazida de `app/icons.tsx`, pelo motivo já registrado
   em `section-abertura.tsx`: os SVGs de lá não declaram `fill` nem `stroke`,
   quem os pintava era uma regra do `hero.css` antigo que não existe mais, e a
   de `base.css` (`.botao svg`) só define tamanho. Sem os atributos, uma seta
   de contorno renderiza como mancha preta preenchida. */
function Seta() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}

/* O atraso da revelação, escrito por elemento, como o protótipo faz.
   `CSSProperties` não aceita propriedade customizada sem a asserção. */
const atraso = (ms: number) => ({ "--atraso": `${ms}ms` }) as CSSProperties;

export default function SectionContato({
  contato,
  privacyPath,
}: {
  contato: Dicionario["contato"];
  privacyPath: string;
}) {
  /* Fatia, não o dicionário: propriedade de componente cliente viaja
     serializada até o navegador, e o dicionário inteiro levava junto o texto
     da política, que é o único lugar do site com o nome da pessoa. */
  const t = { contato, privacyPath };
  const [formStatus, setFormStatus] = useState<"idle" | "success" | "blocked">("idle");
  /* Guardado para o caso de a aba ser bloqueada: aí o link vira algo
     clicável na própria página, em vez de um beco sem saída. */
  const [whatsappLink, setWhatsappLink] = useState("");

  /* O endereço visível do canal sai do mesmo `whatsappUrl` que o link usa, e
     não de um literal ao lado dele: dois lugares divergem, e aqui divergir
     significa exibir um número e discar outro. */
  const whatsappVisivel = whatsappUrl.replace(/^https?:\/\//, "");

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
    <section className="secao" id="contato" aria-labelledby="titulo-contato">
      <div className="luz luz--baixa" aria-hidden="true" />
      <div className="grade-fina" aria-hidden="true" />

      <div className="caixa acima">
        <div className="contato-grade">
          <div data-reveal>
            {/* O número é POSIÇÃO, não conteúdo: é a décima primeira e última
                seção da peça, e por isso ele é escrito aqui e não no
                dicionário, que guarda texto traduzível. O texto ao lado
                continua vindo de `contato.indice`. */}
            <p className="rotulo"><b>11</b><i aria-hidden="true" /> {t.contato.indice}</p>
            <h2 className="titulo-secao" id="titulo-contato">
              {t.contato.tituloAntes}
              <em>{t.contato.tituloDestaque}</em>
            </h2>
            <p className="lead contato-lead">{t.contato.resumo}</p>

            {/* Os dois canais diretos, que na folha anterior eram os dois
                cartões de `.contact-direct`. O e-mail voltou ao site em
                25/08/2026 porque o WhatsApp sozinho nem sempre funciona: no
                desktop a aba cai no `web.whatsapp.com`, que pede QR code, e
                quem estava num computador sem o aparelho pareado não tinha
                como falar com a gente. */}
            <div className="canais">
              <div className="canal">
                <span className="mono">{t.contato.emailLabel}</span>
                <a className="canal-texto" href={`mailto:${emailContato}`}>{emailContato}</a>
              </div>
              <div className="canal">
                <span className="mono">{t.contato.whatsappLabel}</span>
                {/* O texto de apoio vai DENTRO do link, e não como
                    `aria-label`: o rótulo acessível passa a começar pelo
                    endereço que está na tela, que é o que o critério 2.5.3
                    pede de quem comanda por voz. Como `aria-label`, ele
                    apagava o endereço visível do nome do link. */}
                <a
                  className="canal-texto"
                  href={`${whatsappUrl}?text=${encodeURIComponent(t.contato.whatsappMensagem)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {whatsappVisivel}
                  <span className="so-leitor"> {t.contato.whatsappAria}</span>
                </a>
              </div>
            </div>
          </div>

          {/* SEM `novalidate`, ao contrário da marcação de referência. Lá o
              formulário não envia nada e o atributo existe para o protótipo
              não fingir validação; aqui os três campos obrigatórios e o
              consentimento são o que impede a mensagem de chegar vazia no
              WhatsApp. */}
          <form className="formulario" onSubmit={handleSubmit} data-reveal style={atraso(100)}>
            <div className="formulario-topo">
              {/* A saudação em caixa baixa, e não com a classe `.mono` do
                  protótipo: ver o porquê escrito em `contact.css`, na regra
                  `.formulario-saudacao`. É a mesma frase que abre a mensagem
                  montada no envio, e por isso ela sai da mesma chave. */}
              <span className="formulario-saudacao">{t.contato.formSaudacao}</span>
              <span className="ponto" aria-hidden="true" />
            </div>

            <div className="formulario-corpo">
              <div className="dupla">
                <label className="campo">
                  <span>{t.contato.campoNome}</span>
                  <input name="name" type="text" autoComplete="name" required placeholder={t.contato.campoNomePlaceholder} />
                </label>
                <label className="campo">
                  <span>{t.contato.campoNegocio} <em>{t.contato.opcional}</em></span>
                  <input name="business" type="text" autoComplete="organization" placeholder={t.contato.campoNegocioPlaceholder} />
                </label>
              </div>

              <div className="dupla">
                <label className="campo">
                  <span>{t.contato.campoEmail} <em>{t.contato.opcional}</em></span>
                  <input name="email" type="email" autoComplete="email" placeholder="voce@exemplo.com" />
                </label>
                <label className="campo">
                  <span>{t.contato.campoWhatsapp}</span>
                  <input name="phone" type="tel" autoComplete="tel" required placeholder="+55 11 99999-9999" />
                </label>
              </div>

              <label className="campo campo-seletor">
                <span>{t.contato.campoTipo} <em>{t.contato.opcional}</em></span>
                <select name="siteType" defaultValue="">
                  <option value="" disabled>{t.contato.campoTipoPlaceholder}</option>
                  {t.contato.tipos.map((tipo) => <option key={tipo}>{tipo}</option>)}
                </select>
              </label>

              <label className="campo">
                <span>{t.contato.campoResumo}</span>
                <textarea name="summary" required rows={5} placeholder={t.contato.campoResumoPlaceholder} />
              </label>

              <label className="consentimento">
                <input name="consent" type="checkbox" required />
                <span>{t.contato.consentimento} <a href={t.privacyPath}>{t.contato.consentimentoLink}</a>.</span>
              </label>

              <button className="botao botao--acento botao--bloco" type="submit">
                {t.contato.botao}
                <Seta />
              </button>

              <p className="dica-formulario">{t.contato.dica}</p>

              {/* A REGIÃO VIVA NASCE NO FLUXO E VAZIA, sempre renderizada.
                  Elemento em `display: none` — ou ausente do DOM, que é o que
                  a renderização condicional fazia aqui até agora — sai da
                  árvore de acessibilidade, e quando ele volta parte das
                  combinações de navegador e leitor de tela trata como
                  inserção de região nova em vez de mudança dentro de uma
                  região já observada: o anúncio deixa de ser confiável e a
                  pessoa aperta o botão e não recebe retorno nenhum.
                  Vazia ela não pinta nada (`.estado-formulario:empty`). */}
              <p className="estado-formulario" role="status">
                {formStatus === "success" && t.contato.sucesso}
                {formStatus === "blocked" && (
                  <>
                    {t.contato.bloqueadoAntes}{" "}
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                      {t.contato.bloqueadoLink}
                    </a>{" "}
                    {t.contato.bloqueadoDepois}
                  </>
                )}
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
