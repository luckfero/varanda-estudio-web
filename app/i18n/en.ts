import type { Dicionario } from "./index";

/**
 * English dictionary.
 *
 * The dollar figures were derived from the euro anchor (1 EUR = 1.1555 USD on
 * 2026-08-10), **not** from market research — the US market was never
 * surveyed and typically pays more than Spain, so these sit on the
 * conservative side on purpose. Worth revisiting with real numbers before
 * pitching anyone in the United States.
 */

const en: Dicionario = {
  code: "en",
  htmlLang: "en",
  ogLocale: "en_US",
  path: "/en",
  privacyPath: "/en/privacy",
  nome: "English",

  moeda: "US$",
  moedaAposValor: false,

  meta: {
    title: "Varanda Estúdio Web | Professional website design and development",
    description:
      "A web design and development studio. Strategy, original visual direction and development for businesses that want a clear, trustworthy presence online.",
    ogDescription: "Websites that make room for your business to grow.",
    privacyTitle: "Privacy Policy",
    privacyDescription: "How Varanda Estúdio Web handles the data sent through the contact form.",
  },

  nav: {
    pular: "Skip to content",
    flutuante: "Chat on WhatsApp",
    inicio: "home",
    servicos: "Services",
    portfolio: "Work",
    processo: "Process",
    investimento: "Pricing",
    sobre: "Studio",
    contato: "Let's talk",
    abrirMenu: "Open menu",
    fecharMenu: "Close menu",
    navegacao: "Main navigation",
    idioma: "Language",
  },

  hero: {
    kicker: "Web design and development studio",
    tituloAntes: "Websites that make ",
    tituloDestaque: "room",
    tituloDepois: " for your business to grow.",
    lead: "Clear content, a professional look and technology without the headache, turning good ideas into a presence people trust.",
    ctaPrimario: "Tell us about your project",
    ctaSecundario: "See a project",
    local: "São Paulo, Brazil",
    atendimento: "Working remotely",
    arteAlt: "Visual composition of a website being built",
    navegadorEndereco: "yourbusiness.com",
    navegadorMarca: "your business",
    navegadorTitulo: "A presence worth<br />remembering.",
    navegadorBotao: "learn more",
    notaTopo: "clarity",
    notaTopoForte: "before anything",
    notaBaixo: "made with",
    notaBaixoForte: "intent.",
  },

  intro: {
    indice: "How we see it",
    eyebrow: "A website doesn't have to look complicated",
    titulo: "It has to make sense to the person arriving and to the person running the business.",
    coluna1: "Varanda brings businesses closer to the web with clear communication, a transparent process and decisions made for the reality of each client.",
    coluna2: "Every project brings together strategy, content and development to deliver a site that is good-looking, useful and easy to navigate.",
  },

  servicos: {
    indice: "What we do",
    titulo: "The right format for where you are.",
    resumo: "Three formats, from the most direct to the most complete. Each button leads to what's included and the price.",
    verPlano: "See what each one includes",
    nota: "Need an online store, bookings, a members area or automation?",
    notaLink: "Let's look at it together",
    lista: [
      {
        number: "01",
        title: "Essential",
        text: "One page that introduces the business, explains what you do and opens a conversation with whoever arrives.",
      },
      {
        number: "02",
        title: "Business",
        text: "The full site: services, work, questions and contact, with the content organised the way clients actually look for it.",
      },
      {
        number: "03",
        title: "Professional",
        text: "For when the site has to do more than introduce you: another language, a filterable catalogue, content you update yourself, or an integration with the system you already use.",
      },
    ],
  },

  portfolio: {
    indice: "Work we've built",
    tituloAntes: "Ideas taking on",
    tituloDestaque: "shape and presence.",

    /* Called "Live" and not "Clients" on purpose: one of the two is the
       studio's own property, and calling it a client would imply a
       relationship that does not exist. */
    noArIndice: "Live",
    conceitualSelo: "Concept",
    depoimentoIndice: "From a client",
    ctaTexto: "Tell us what your business needs and we'll reply with the next step.",
    ctaBotao: "I want a site like this",
    estudosNota: "No client, no address online.",
    estudosIndice: "Concept studies",
    noArNota: "Published sites, at an address anyone can visit.",
    visitar: "Visit the ",
    visitarDepois: " website in a new tab",

    aviso: "Three sectors, three different problems, chosen to demonstrate visual direction and development. The companies, copy and data are fictional.",

    /* Paired by index with `featuredAssets` in `app/data.ts`. */
    destaques: [
      {
        name: "Casa Conexão",
        label: "Consulting rooms · São Bernardo do Campo, Brazil",
        description:
          "A house that rents rooms to independent professionals: psychologists, lawyers, doulas, accountants. The site introduces the space, shows who already works there and moves the conversation straight to WhatsApp.",
        features: ["Visual direction", "Original illustration", "Interactive gallery", "A page per professional"],
        imageAlt: "Casa Conexão home page, with two armchairs facing an arched window",
      },
      {
        name: "Milênio",
        label: "Rap group · YinYang album",
        description:
          "Three voices, nearly ten years on the road and a first album on the way. The site introduces the group, the record and the short film, with the alternation between black and white as the backbone of the story.",
        features: ["Visual direction", "Image treatment", "Typography", "Dependency-free development"],
        imageAlt: "Milênio home page, with the title O rap de outro milênio on a black background",
      },
    ],
    abrirAntes: "Open the ",
    abrirDepois: " project demo in a new tab",
    /* Order is paired by index with `projectAssets` in `app/data.ts`, where
       the reasoning lives. Changing it here without changing it there, or
       without changing the other two languages, swaps image and link. */
    projetos: [
      {
        name: "Nívora Construções",
        label: "Construction",
        description:
          "A trilingual company site for a contemporary builder, with a portfolio of works, services, construction process and a budget pre-assessment, in a technical and immersive visual experience.",
        features: ["Trilingual strategy", "Information architecture", "Visual direction", "Responsive development"],
        imageAlt: "Contemporary house shown on the home page of the Nívora Construções project",
      },
      {
        name: "Nascente",
        label: "Perfumery",
        description:
          "An independent perfumery with a catalogue filterable by collection and intensity, a step-by-step scent guide and a complete purchase flow, from discovering the fragrance to confirming the order.",
        features: ["Visual identity", "Catalogue and filters", "Scent guide", "Purchase flow"],
        imageAlt: "Amber glass perfume bottle among dark leaves, on the home page of the Nascente project",
      },
      {
        name: "Brasa do Vale",
        label: "Restaurant",
        description:
          "A warm, direct site for a steakhouse, built around the menu, what sets the place apart and quick contact over WhatsApp.",
        features: ["Content strategy", "Visual direction", "Responsive design", "Development"],
        imageAlt: "Grilled meat image used on the home page of the Brasa do Vale project",
      },
    ],
  },

  processo: {
    indice: "How it works",
    titulo: "A clear path, from the first hello to going live.",
    resumo: "You follow the decisions, approve each stage and know what to expect all the way to launch.",
    etapas: [
      {
        step: "01",
        title: "Conversation and brief",
        text: "We get to know the business, the audience and what the site needs to solve. From there we organise the essential information.",
      },
      {
        step: "02",
        title: "Direction and content",
        text: "We settle the page structure, the language and the visual direction before writing the first line of code.",
      },
      {
        step: "03",
        title: "Building and revisions",
        text: "We build the site, show you the result already live, and apply the revision rounds included in your package.",
      },
      {
        step: "04",
        title: "Launch and care",
        text: "Once you approve, we publish and hand over the accounts. With a maintenance plan, we keep looking after it.",
      },
    ],
  },

  investimento: {
    indice: "Pricing",
    titulo: "Start with what your business needs today.",
    /* Era a condição de lançamento com data de validade ("até 30 de setembro
       de 2026"). Ela venceria em 36 dias em três idiomas, e site que anuncia
       condição vencida é pior que site sem condição nenhuma. A comparação com
       o "valor regular" saiu junto, por decisão do dono em 25/08/2026: o preço
       publicado passa a ser o preço que se cobra, sem segunda coluna. */
    resumo: "The price is settled before we start, together with the scope in writing. Nothing is charged mid-project that wasn't agreed beforehand.",
    porProjeto: "per project",
    entregaRotulo: "Typical timeline",
    /* Prazo e pagamento não existiam na página: nenhuma das duas perguntas
       que todo cliente faz tinha resposta antes de ele precisar perguntar.
       O 50/50 vem de `comercial/oferta/politicas.md`, que é a fonte. */
    pagamento: "Payment in two parts: 50% to start and 50% on final approval, before publishing. Bank transfer.",
    cta: "I want this plan",
    incluidoTitulo: "In every package, at no extra charge",
    escopoIncluidoTitulo: "Integrations included in every package",
    escopoIncluido: [
      "A contact form that reaches your email and your WhatsApp",
      "Visit tracking and traffic sources",
      "Map and location",
      "Links to your social profiles",
      "A WhatsApp button on every page",
    ],
    escopoOrcamentoTitulo: "We also build these, quoted separately",
    escopoOrcamento: [
      "Online payments and recurring subscriptions",
      "A full online store",
      "Booking and appointment scheduling",
      "A client login area",
      "Custom automations",
      "A second capability, when the project calls for more than one",
    ],
    nota: "Each revision round should arrive as one consolidated list. Anything outside the package is flagged and quoted before we start, never during.",
    pacotes: [
      {
        name: "Essential",
        eyebrow: "To get started",
        launch: "900",
        entrega: "A few days after the material is approved",
        featured: false,
        description: "One page to introduce the essentials of the business and open a conversation with whoever arrives.",
        items: [
          "One page, with the sections your business calls for",
          "Copy shaped from the material you already have",
          "Contact form and WhatsApp button",
          "1 revision round",
        ],
      },
      {
        name: "Business",
        eyebrow: "Recommended",
        launch: "1,850",
        entrega: "1 to 2 weeks after the material is approved",
        featured: true,
        description: "The full site for your business, with room to explain, show your work and answer questions.",
        items: [
          "Full site, up to 6 pages or sections",
          "Structuring and writing of the main copy",
          "Work gallery, services and frequently asked questions",
          "Standard integrations configured",
          "2 revision rounds",
        ],
      },
      {
        name: "Professional",
        eyebrow: "To grow",
        launch: "3,350",
        entrega: "Set in the quote, depending on the capability chosen",
        featured: false,
        description: "Everything in Business, plus one capability your project calls for, chosen together with you.",
        items: [
          "Everything in the Business package",
          "One capability of your choice: another language, a filterable catalogue, manageable content, or a system integration",
          "Technical SEO and structured data",
          "2 revision rounds",
          "First month of the Presence plan included",
        ],
      },
    ],
    incluido: [
      { title: "Original visual direction", text: "Every project is designed from scratch. No package uses a template." },
      { title: "Genuinely accessible", text: "Contrast, keyboard navigation and screen readers verified with tooling, not by eye." },
      { title: "Fast on any phone", text: "Published on a distributed network, with images and fonts optimised." },
      { title: "Launch and domain set up", text: "We leave the site live, with the address and certificate working." },
      { title: "30-day warranty", text: "Any fault after launch is fixed at no cost." },
      { title: "The site is yours", text: "Domain, accounts and code stay in your company's name from day one." },
    ],
  },

  manutencao: {
    indice: "After launch",
    tituloAntes: "Your site can stay",
    tituloDestaque: "well looked after.",
    resumo: "Optional plans to keep the site live, updated and secure, and to change the content whenever the business changes.",
    porMes: "/month",
    cta: "I want a maintenance plan",
    nota1: "Monthly time does not roll over. Payment is in advance and cancellation requires 30 days' notice.",
    nota2: "For one-off needs without a plan, ad-hoc maintenance costs US$ 69 per hour, billed in 30-minute blocks. Inside the plans, the hour always works out cheaper.",
    planos: [
      {
        name: "Care",
        price: "45",
        featured: false,
        summary: "The site always live and up to date.",
        items: [
          "Monitoring, with a fix if the site goes down",
          "Backups and certificate always valid",
          "Technical and security updates",
          "Reply within 3 business days",
        ],
      },
      {
        name: "Presence",
        price: "89",
        featured: true,
        summary: "Content keeping up with the business.",
        items: ["Everything in the Care plan", "Up to 1 hour a month of content changes", "Reply within 2 business days"],
      },
      {
        name: "Priority",
        price: "169",
        featured: false,
        summary: "For those who change the site often.",
        items: ["Everything in the Presence plan", "Up to 3 hours a month of changes", "Reply the same business day"],
      },
    ],
  },

  sobre: {
    indice: "Who's at Varanda",
    eyebrow: "A small studio, on purpose.",
    titulo: "Good technology is the kind that brings people closer, not the kind that complicates.",
    paragrafo1: "Varanda Estúdio Web exists to help shops, professionals and companies build a presence online that is clear, professional and trustworthy.",
    paragrafo2: "Every project is followed closely, from organising the ideas through to development, with straight talk, a documented process and attention to detail. Few projects at a time, and none treated as an item on a conveyor belt.",
    assinatura: "Varanda Estúdio Web",
    assinaturaLocal: "— São Paulo, Brazil",
  },

  extras: {
    indice: "Made to measure",
    titulo: "What else might your project need?",
    resumo: "These can be added when they aren't included in the package you choose.",
    nota: "The prices above don't include what the domain, hosting or third-party tools charge. Delivery faster than agreed, or work over a weekend or public holiday, carries a 30% surcharge and depends on availability.",
    lista: [
      { name: "Extra page", price: "US$ 290" },
      { name: "Full copywriting", price: "US$ 170/page" },
      { name: "Integration beyond the standard set", price: "from US$ 290" },
      { name: "Extra revision round", price: "US$ 230" },
      { name: "Ad-hoc maintenance", price: "US$ 69/hour" },
    ],
  },

  faq: {
    fechamentoTitulo: "Still have a question?",
    fechamentoTexto: "Just ask. We'll reply with guidance for your case, with no obligation to hire.",
    fechamentoBotao: "Ask a question",
    indice: "Frequently asked",
    titulo: "Worth knowing before we start.",
    perguntas: [
      {
        question: "How long until my site is ready?",
        answer:
          "It depends on the package and, above all, on when the content arrives. A single page is ready within days of the material being approved; a full site takes longer. Your project's timeline goes in the proposal before we start, and it counts from the moment the materials are received.",
      },
      {
        question: "Do I need to have copy and photos ready?",
        answer:
          "No. We organise and shape the content from what you already have, and tell you what still needs producing. Full copywriting from scratch and image production are contracted separately, with the price agreed beforehand.",
      },
      {
        question: "What if something breaks after launch?",
        answer:
          "Every project comes with a 30-day warranty: any fault is fixed at no cost. After that, fixes go through ad-hoc maintenance or a monthly plan, which also monitors the site and tells you before you notice.",
      },
      {
        question: "Who owns the site once it's done?",
        answer:
          "You do. Domain, hosting, accounts and code are registered in your company's name, and the credentials are handed over at launch. No project depends on us to keep existing.",
      },
      {
        question: "Are domain and hosting included?",
        answer:
          "Setting them up is included in every package. What the registrar, the host and any third-party tools charge is paid directly by you, always on accounts in your name.",
      },
      {
        question: "Can I ask for changes after launch?",
        answer:
          "Yes. One-off changes go through ad-hoc maintenance or the monthly plan. New pages, new features and changes of scope get their own quote before any work happens, never during.",
      },
      {
        question: "You're in Brazil. Do you work with clients abroad?",
        answer:
          "Yes. The work is remote and already done that way. We work in English, Portuguese and Spanish, and figures can be agreed in dollars, euros or reais depending on the country. São Paulo sits within a few hours of both North America and Europe, so there's a wide overlap in the working day.",
      },
      {
        question: "Do you build online stores or custom systems?",
        answer:
          "Yes, subject to a technical review. Payments, real-time booking, members areas, databases and automation are planned and quoted separately, because the effort varies far too much to fit a list price.",
      },
    ],
  },

  contato: {
    indice: "Let's talk",
    tituloAntes: "Your business deserves a place to ",
    tituloDestaque: "grow.",
    resumo: "Tell us what your business needs and where it stands. We'll go through it and reply with a clear next step.",
    emailLabel: "Email",
    whatsappLabel: "WhatsApp",
    whatsappAria: "Message Varanda on WhatsApp in a new tab",
    whatsappMensagem: "Hello! I came from the Varanda Estúdio Web site and I'd like to talk about a project.",
    formSaudacao: "Hello! I came from the Varanda Estúdio Web site.",
    opcional: "optional",
    campoNome: "Your name *",
    campoNomePlaceholder: "What should we call you?",
    campoNegocio: "Business name",
    campoNegocioPlaceholder: "Company or project name",
    campoEmail: "Email",
    campoWhatsapp: "WhatsApp *",
    campoTipo: "What kind of site are you after?",
    campoTipoPlaceholder: "Choose an option",
    campoResumo: "Tell us about the project *",
    campoResumoPlaceholder: "Tell us what your business does, what the site needs to show and what result you're hoping for.",
    consentimento: "I agree to my data being used to receive a reply about my project, as described in the",
    consentimentoLink: "Privacy Policy",
    botao: "Continue on WhatsApp",
    dica: "When you continue, WhatsApp will open a message with the details filled in. Nothing is stored in any database on this site.",
    sucesso: "Message prepared and opened in WhatsApp. Check it and hit send so it reaches us.",
    bloqueadoAntes: "Your browser blocked the new tab.",
    bloqueadoLink: "Open the message in WhatsApp",
    bloqueadoDepois: "(the details you filled in come along).",
    rotuloNome: "My name",
    rotuloNegocio: "Business",
    rotuloEmail: "Email",
    rotuloWhatsapp: "WhatsApp",
    rotuloTipo: "Type of site",
    rotuloProjeto: "About the project:",
    tipos: [
      "Essential (one page)",
      "Business (full site)",
      "Professional (full site plus one capability)",
      "Online store or special project",
      "Not sure yet",
    ],
  },

  rodape: {
    frase: "Close-up, carefully considered websites, built from scratch.",
    voltarTopo: "Back to top ↑",
    local: "São Paulo, Brazil · Working remotely",
    privacidade: "Privacy",
    direitos: "© 2026 Varanda Estúdio Web",
    voltarInicio: "Varanda Estúdio Web, back to the top",
  },

  privacidade: {
    kicker: "Information and transparency",
    titulo: "Privacy Policy",
    atualizacao: "Last updated: 10 August 2026.",
    voltar: "← Back to the site",
    voltarAria: "Back to the Varanda Estúdio Web home page",
    secoes: [
      {
        titulo: "1. Who handles the data",
        texto:
          "Varanda Estúdio Web is the trading name under which Lucca Oliveira, an individual, provides services, and is the controller of the data received through this page. For privacy matters, write to",
      },
      {
        titulo: "2. Data used",
        texto:
          "The form asks for your name, business name, email, WhatsApp, the type of site you're looking for and a description of the project. This data is used only to review the request, begin the conversation and reply to you.",
      },
      {
        titulo: "3. How the form works",
        texto:
          "When you select “Continue on WhatsApp”, the site prepares a message with the details you filled in and opens the app. The data is not written to any database on this site. WhatsApp's own handling follows that platform's rules and policies.",
      },
      {
        titulo: "4. Sharing and retention",
        texto:
          "Varanda does not sell personal data. Information received may remain in the WhatsApp or email history for as long as needed to reply, to meet legal obligations or to exercise rights.",
      },
      {
        titulo: "5. Your rights",
        texto:
          "You may request confirmation, access, correction, deletion, restriction, portability or object to the processing of your data, subject to legal retention rules, and lodge a complaint with the supervisory authority in your country. To do so, write to the address above.",
      },
      {
        titulo: "6. Updates",
        texto:
          "This policy may be updated to reflect changes to the site or to how enquiries are handled. The date of the current version is always shown at the top of the page.",
      },
    ],
  },
};

export default en;
