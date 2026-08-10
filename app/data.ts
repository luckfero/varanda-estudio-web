/**
 * Conteudo da pagina unica.
 *
 * Ficava no topo de `page.tsx` — 199 linhas de texto antes da primeira
 * linha de codigo. Sai daqui sem passar por nenhum componente: quem edita
 * preco, servico ou pergunta mexe so neste arquivo.
 */

export const whatsappUrl = "https://wa.me/5511942263007";

export const services = [
  {
    number: "01",
    title: "Site institucional",
    text: "Apresenta sua empresa, seus serviços e os principais canais de contato em uma presença digital clara e confiável.",
  },
  {
    number: "02",
    title: "Landing page",
    text: "Uma página objetiva para campanhas, lançamentos ou captação de contatos e pedidos, com conteúdo direcionado a uma ação.",
  },
  {
    number: "03",
    title: "Página profissional",
    text: "Portfólio, currículo ou apresentação de serviços com identidade própria, leitura confortável e boa experiência em qualquer tela.",
  },
];

export const process = [
  {
    step: "01",
    title: "Conversa e briefing",
    text: "Entendo o negócio, o público e o que o site precisa resolver. A partir disso, organizo as informações essenciais.",
  },
  {
    step: "02",
    title: "Direção e conteúdo",
    text: "Defino a estrutura das páginas, a linguagem e a direção visual antes de iniciar o desenvolvimento.",
  },
  {
    step: "03",
    title: "Criação e ajustes",
    text: "Desenvolvo a versão demonstrativa, apresento o resultado e aplico as rodadas de ajustes incluídas na proposta.",
  },
  {
    step: "04",
    title: "Publicação e cuidado",
    text: "Com a aprovação final, preparo o site para publicação. Se você contratar manutenção, continuo acompanhando as atualizações.",
  },
];

export const packages = [
  {
    name: "Essencial",
    eyebrow: "Para começar",
    launch: "590",
    future: "790",
    description: "Uma página direta para apresentar o essencial do seu negócio e facilitar o contato.",
    items: [
      "1 página com até 5 seções",
      "Adaptação para celular, tablet e computador",
      "Botão de WhatsApp",
      "Configurações básicas de SEO e acessibilidade",
      "1 rodada de ajustes",
    ],
  },
  {
    name: "Negócio",
    eyebrow: "Recomendado",
    launch: "990",
    future: "1.290",
    featured: true,
    description: "Mais espaço para explicar seus serviços, responder dúvidas e construir confiança.",
    items: [
      "Até 3 páginas",
      "Organização do conteúdo",
      "Formulário de contato ou botão de WhatsApp",
      "Configurações básicas de SEO e acessibilidade",
      "2 rodadas de ajustes",
    ],
  },
  {
    name: "Profissional",
    eyebrow: "Para crescer",
    launch: "1.490",
    future: "1.890",
    description: "Uma estrutura completa para organizar diferentes serviços, conteúdos e formas de contato.",
    items: [
      "Até 5 páginas",
      "Direção visual personalizada",
      "Formulários e integrações padrão",
      "Configurações essenciais de SEO técnico",
      "2 rodadas de ajustes",
    ],
  },
];

export const maintenance = [
  {
    name: "Cuidado",
    price: "89",
    time: "30 min/mês",
    response: "Retorno em até 5 dias úteis",
  },
  {
    name: "Presença",
    price: "139",
    time: "1 hora/mês",
    response: "Retorno em até 3 dias úteis",
  },
  {
    name: "Prioridade",
    price: "239",
    time: "2 horas/mês",
    response: "Retorno em até 2 dias úteis",
  },
];

export const projects = [
  {
    name: "Brasa do Vale",
    label: "Projeto conceitual · Gastronomia",
    description:
      "Um site acolhedor e direto para uma churrascaria brasileira, com foco no cardápio, nos diferenciais da casa e no contato rápido pelo WhatsApp.",
    features: [
      "Estratégia de conteúdo",
      "Direção visual",
      "Design responsivo",
      "Desenvolvimento",
    ],
    image: "brasa-do-vale-hero",
    imageAlt: "Imagem de churrasco usada na página inicial do projeto Brasa do Vale",
    url: "https://brasa-do-vale.luccaoliveira123.workers.dev/",
    placeholder: false,
  },
  {
    name: "Nívora Construções",
    label: "Projeto conceitual · Construção civil",
    description:
      "Um site institucional trilíngue para uma construtora contemporânea, com portfólio de obras, serviços, processo construtivo e pré-diagnóstico de orçamento em uma experiência visual técnica e imersiva.",
    features: [
      "Estratégia trilíngue",
      "Arquitetura da informação",
      "Direção visual",
      "Desenvolvimento responsivo",
    ],
    image: "nivora-casa-patio-alto",
    imageAlt: "Casa contemporânea apresentada na página inicial do projeto Nívora Construções",
    url: "https://nivora-construcoes.luccaoliveira123.workers.dev/",
    placeholder: false,
  },
  {
    name: "Nascente",
    label: "Projeto conceitual · Perfumaria",
    description:
      "Uma loja de perfumaria autoral com catálogo filtrável por coleção e intensidade, guia olfativo em etapas e fluxo de compra completo, da descoberta da fragrância à confirmação do pedido.",
    features: [
      "Identidade visual",
      "Catálogo e filtros",
      "Guia olfativo",
      "Fluxo de compra",
    ],
    image: "nascente-hero-central",
    imageAlt: "Frasco de perfume em vidro âmbar entre folhas escuras, na página inicial do projeto Nascente",
    url: "https://nascente-casa-olfativa.luccaoliveira123.workers.dev/",
    placeholder: false,
  },
];

export const faqs = [
  {
    question: "Em quanto tempo meu site fica pronto?",
    answer:
      "O prazo varia conforme o tamanho do projeto e a disponibilidade dos materiais. Depois que o escopo e o conteúdo são confirmados, o cronograma completo é registrado na proposta antes do início.",
  },
  {
    question: "Preciso ter textos e fotos prontos?",
    answer:
      "Não. Posso ajudar a organizar o conteúdo e indicar o que ainda precisa ser produzido. Redação completa, tratamento de grandes volumes de conteúdo e produção de imagens podem ser contratados à parte.",
  },
  {
    question: "Domínio e hospedagem estão inclusos?",
    answer:
      "Não. Domínio, hospedagem e ferramentas externas são contratados e pagos pelo cliente. Posso orientar a escolha e cuidar da configuração, com o valor informado antes do início.",
  },
  {
    question: "O site funciona bem no celular?",
    answer:
      "Sim. Todos os projetos são pensados para celular, tablet e computador, com foco em leitura confortável, navegação simples e carregamento eficiente.",
  },
  {
    question: "Posso pedir mudanças depois de publicado?",
    answer:
      "Sim. Pequenas alterações podem ser feitas por manutenção avulsa ou por um plano mensal. Mudanças maiores, novas páginas e funcionalidades recebem orçamento próprio antes da execução.",
  },
  {
    question: "Vocês fazem loja virtual ou sistemas?",
    answer:
      "Sim, mediante análise técnica. Projetos com pagamentos, agendamentos em tempo real, áreas de acesso, bancos de dados ou automações são planejados e orçados separadamente.",
  },
];
