import { getDicionario, type Locale } from "./i18n";
import { siteName, siteUrl } from "./site-config";

/**
 * Dados estruturados (JSON-LD) — só a Varanda.
 *
 * É o que faz o Google entender o site como um negócio e não como uma
 * página solta: nome, o que faz, onde atende, como falar com ele. Aparece
 * no painel de conhecimento e melhora como o resultado é exibido.
 *
 * Não existe equivalente no Nascente, no Brasa do Vale nem na Nívora, e
 * é deliberado: aqueles três são projetos conceituais com empresa,
 * endereço e telefone fictícios. Publicar `LocalBusiness` de uma empresa
 * inventada seria alimentar o buscador com dado falso.
 *
 * Tudo abaixo é fato que o site já afirma em outro lugar — nome, serviços,
 * área de atendimento e WhatsApp. Nada de avaliação, número de clientes,
 * endereço físico, CNPJ ou ano de fundação: o que não está no site não
 * entra aqui.
 */

/* O mesmo contato que a página de contato usa. Mantido aqui como constante
   para não divergirem em silêncio.

   Sem `email`: o endereço saiu da seção de contato junto com o nome da
   pessoa, e este arquivo só afirma o que a página afirma. Volta quando
   existir `contato@` no domínio próprio. */
const WHATSAPP = "+5511942263007";

export default function StructuredData({ locale }: { locale: Locale }) {
  const t = getDicionario(locale);

  const dados = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${siteUrl}/#negocio`,
    name: siteName,
    url: siteUrl,
    description: t.meta.description,
    inLanguage: t.code,
    telephone: WHATSAPP,
    /* Sem `founder`: o site não identifica pessoa em nenhum lugar público, e
       dado estruturado não pode afirmar o que a página não afirma. A
       identificação legal do responsável vive só na política de privacidade,
       onde a LGPD exige que exista.

       `areaServed` deixou de ser só o Brasil quando o site passou a existir
       em três idiomas e a dizer, no próprio FAQ, que atende fora do país.
       Sem `address`: não há endereço comercial publicado, e inventar um
       seria pior que omitir. */
    areaServed: { "@type": "Place", name: "Brasil, Europa e América do Norte" },
    knowsLanguage: ["pt-BR", "es-ES", "en"],
    serviceType: [
      "Criação de sites",
      "Site institucional",
      "Desenvolvimento web",
      "Manutenção de sites",
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: t.investimento.indice.replace(/^\d+\s*—\s*/, ""),
      /* Os mesmos três nomes dos pacotes na página, no idioma da página.
         Antes eram outros três ("Página profissional", "Landing page",
         "Site institucional"), o que dava ao buscador um catálogo que não
         existia em lugar nenhum do site. */
      itemListElement: t.investimento.pacotes.map((pacote) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: pacote.name,
          description: pacote.description,
        },
      })),
    },
  };

  return (
    <script
      type="application/ld+json"
      /* O conteúdo é um objeto nosso, montado acima a partir do dicionário —
         não vem de entrada de usuário nem de rede. O `JSON.stringify` já
         escapa o que precisa para viver dentro de uma tag script. */
      dangerouslySetInnerHTML={{ __html: JSON.stringify(dados) }}
    />
  );
}
