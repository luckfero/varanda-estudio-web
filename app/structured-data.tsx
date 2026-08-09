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

/* Os mesmos contatos que a página de contato usa. Mantidos aqui como
   constantes para não divergirem em silêncio. */
const EMAIL = "luccaassoc@gmail.com";
const WHATSAPP = "+5511942263007";

const dados = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${siteUrl}/#negocio`,
  name: siteName,
  url: siteUrl,
  description: siteDescription,
  inLanguage: "pt-BR",
  email: EMAIL,
  telephone: WHATSAPP,
  founder: { "@type": "Person", name: "Lucca Oliveira" },
  /* Atende remoto no país inteiro — é o que o site diz. Sem `address`:
     não há endereço comercial publicado, e inventar um seria pior que
     omitir. */
  areaServed: { "@type": "Country", name: "Brasil" },
  knowsLanguage: "pt-BR",
  serviceType: [
    "Criação de sites",
    "Site institucional",
    "Landing page",
    "Desenvolvimento web",
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Criação de sites",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Página profissional",
          description: "Página única para apresentar o negócio e receber contato.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Site institucional",
          description: "Site de múltiplas páginas com conteúdo, serviços e contato.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Landing page",
          description: "Página focada em uma ação, para campanha ou lançamento.",
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
