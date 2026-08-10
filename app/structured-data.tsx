import { siteDescription, siteName, siteUrl } from "./site-config";

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
 * área de atendimento, e-mail e WhatsApp. Nada de avaliação, número de
 * clientes, endereço físico, CNPJ ou ano de fundação: o que não está no
 * site não entra aqui.
 */

/* O mesmo contato que a página de contato usa. Mantido aqui como constante
   para não divergirem em silêncio.

   Sem `email`: o endereço saiu da seção de contato junto com o nome da
   pessoa, e este arquivo só afirma o que a página afirma. Volta quando
   existir `contato@` no domínio próprio. */
const WHATSAPP = "+5511942263007";

const dados = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${siteUrl}/#negocio`,
  name: siteName,
  url: siteUrl,
  description: siteDescription,
  inLanguage: "pt-BR",
  telephone: WHATSAPP,
  /* Sem `founder`: o site não identifica pessoa em nenhum lugar público, e
     dado estruturado não pode afirmar o que a página não afirma. A
     identificação legal do responsável vive só na política de privacidade,
     onde a LGPD exige que exista.

     Atende remoto no país — é o que o rodapé diz. Sem `address`: não há
     endereço comercial publicado, e inventar um seria pior que omitir. */
  areaServed: { "@type": "Country", name: "Brasil" },
  knowsLanguage: "pt-BR",
  serviceType: [
    "Criação de sites",
    "Site institucional",
    "Desenvolvimento web",
    "Manutenção de sites",
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Criação de sites",
    itemListElement: [
      /* Os mesmos três nomes dos pacotes na página. Antes eram outros três
         ("Página profissional", "Landing page", "Site institucional"), o
         que dava ao buscador um catálogo que não existia em lugar nenhum
         do site. */
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Essencial",
          description: "Uma página para apresentar o negócio e receber contato.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Negócio",
          description: "Site completo com serviços, trabalhos, dúvidas e contato.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Profissional",
          description:
            "Site completo mais uma capacidade: outro idioma, catálogo com filtros, conteúdo gerenciável ou integração com sistema.",
        },
      },
    ],
  },
} as const;

export default function StructuredData() {
  return (
    <script
      type="application/ld+json"
      /* O conteúdo é um objeto nosso, definido acima — não vem de entrada
         de usuário nem de rede. O `JSON.stringify` já escapa o que
         precisa para viver dentro de uma tag script. */
      dangerouslySetInnerHTML={{ __html: JSON.stringify(dados) }}
    />
  );
}
