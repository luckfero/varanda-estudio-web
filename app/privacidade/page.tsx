import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Como a Varanda Estúdio Web trata os dados enviados pelo formulário de contato.",
};

export default function PrivacyPage() {
  return (
    <>
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <main className="legal-page" id="conteudo" tabIndex={-1}>
      <Link className="brand" href="/" aria-label="Voltar para a página inicial da Varanda Estúdio Web">
        <span className="leaf-mark leaf-mark--small" aria-hidden="true"><i /><i /><i /></span>
        <span><strong>Varanda</strong><small>Estúdio Web</small></span>
      </Link>
      <article>
        <p className="kicker"><span /> Informação e transparência</p>
        <h1>Política de Privacidade</h1>
        <p className="legal-updated">Última atualização: 20 de julho de 2026.</p>

        <h2>1. Quem trata os dados</h2>
        <p>Esta página é mantida por Lucca Oliveira, pessoa física que atua comercialmente sob o nome provisório Varanda Estúdio Web. Para assuntos de privacidade, escreva para <a href="mailto:luccaassoc@gmail.com">luccaassoc@gmail.com</a>.</p>

        <h2>2. Dados utilizados</h2>
        <p>O formulário solicita nome, nome do negócio, e-mail, WhatsApp, tipo de site procurado e uma descrição do projeto. Esses dados são usados somente para analisar a solicitação, iniciar o atendimento e responder ao contato.</p>

        <h2>3. Como o formulário funciona</h2>
        <p>Ao selecionar “Continuar no WhatsApp”, o site prepara uma mensagem com as informações preenchidas e abre o aplicativo. Os dados não são gravados em um banco de dados deste site. O tratamento realizado pelo WhatsApp segue as regras e políticas da própria plataforma.</p>

        <h2>4. Compartilhamento e retenção</h2>
        <p>A Varanda não vende dados pessoais. As informações recebidas podem permanecer no histórico do WhatsApp ou do e-mail pelo tempo necessário ao atendimento, ao cumprimento de obrigações ou ao exercício regular de direitos.</p>

        <h2>5. Seus direitos</h2>
        <p>Você pode solicitar confirmação, acesso, correção ou eliminação dos dados tratados, observadas as hipóteses legais de conservação. Para isso, entre em contato pelo e-mail informado acima.</p>

        <h2>6. Atualizações</h2>
        <p>Esta política pode ser atualizada para refletir mudanças no site ou no processo de atendimento. A data da versão vigente será sempre indicada no início da página.</p>
      </article>
      <Link className="button button--primary legal-back" href="/">← Voltar ao site</Link>
      </main>
    </>
  );
}
