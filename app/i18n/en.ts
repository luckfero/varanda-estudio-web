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
    privacyDescription:
      "How Varanda Estúdio Web handles data from the contact form and from the project questionnaire for clients who commission a website.",
    /* See the note in `pt.ts`: only the JSON-LD reads these. */
    areaAtendida: "Brazil, Europe and North America",
    servicos: ["Website design", "Business website", "Web development"],
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
        imageAlt: "Casa Conexão's mark, two overlapping circles, on the green of its identity",
      },
      {
        name: "Milênio",
        label: "Rap group · YinYang album",
        description:
          "Three voices, nearly ten years on the road and a first album on the way. The site introduces the group, the record and the short film, with the alternation between black and white as the backbone of the story.",
        features: ["Visual direction", "Image treatment", "Typography", "Dependency-free development"],
        imageAlt: "Milênio's mark, an eye drawn in outline, on the green of its identity",
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
        imageAlt: "Nívora Construções' mark, an N in one continuous line, on the copper of its identity",
      },
      {
        name: "Nascente",
        label: "Perfumery",
        description:
          "An independent perfumery with a catalogue filterable by collection and intensity, a step-by-step scent guide and a complete purchase flow, from discovering the fragrance to confirming the order.",
        features: ["Visual identity", "Catalogue and filters", "Scent guide", "Purchase flow"],
        imageAlt: "Nascente's mark, half a citrus slice, on the dark brown of its identity",
      },
      {
        name: "Brasa do Vale",
        label: "Restaurant",
        description:
          "A warm, direct site for a steakhouse, built around the menu, what sets the place apart and quick contact over WhatsApp.",
        features: ["Content strategy", "Visual direction", "Responsive design", "Development"],
        imageAlt: "Brasa do Vale's mark, a skewer with three cuts, on the wine red of its identity",
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
        title: "Launch and handover",
        text: "Once you approve, we publish and hand over the accounts.",
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
    /* O rótulo do prazo, que até 08/09/2026 nenhum componente lia. Agora ele
       é o rótulo do cartão, e `comparacao.linhas[1]` é o mesmo texto na
       tabela: o porquê está escrito em `pt.ts`, que é o contrato. */
    entregaRotulo: "Delivery time",
    /* A contagem do prazo, uma vez só para a seção inteira. A regra é a de
       `comercial/oferta/politicas.md` e vale igual nos três idiomas: prazo
       não é desconto, é informação, e quem compra de fora usa o mesmo
       critério de quem compra daqui. */
    prazoNota: "Every timeline starts from the moment all material and access have arrived and been approved.",
    /* Prazo e pagamento não existiam na página: nenhuma das duas perguntas
       que todo cliente faz tinha resposta antes de ele precisar perguntar.
       O 50/50 vem de `comercial/oferta/politicas.md`, que é a fonte.
       O CARTÃO ENTROU EM 08/09/2026 COM O ACRÉSCIMO DITO, e aqui ele vai sem
       porcentagem: os 15% aprovados valem para o cartão no Brasil, e a
       spec não definiu acréscimo para dólar. Prometer "interest free" está
       fora em qualquer idioma. */
    pagamento: "Payment in two parts: 50% to start and 50% on final approval, before publishing. Bank transfer. If you need to spread it out, credit card runs to 12 instalments, with a surcharge on the upfront price.",
    incluiNoPlano: "What is included",
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
    /* A TABELA COMPARÁVEL, espelho de `comparacao` no português. Nada aqui
       é dado comercial: o valor de cada célula continua saindo de
       `pacotes[].items`, `launch` e `entrega`. O que mora nesta chave é só o
       andaime da tabela.

       `linhas` é POSICIONAL, na mesma ordem da constante `COMPARACAO` de
       `app/section-oferta.tsx`. Aqui a posição É o significado: tirar,
       acrescentar ou trocar de lugar um item desloca todos os rótulos
       abaixo dele e cola o nome de uma dimensão nos valores de outra, em
       silêncio e em um idioma só.

       "Copy handling" e não "Text treatment": no vocabulário de quem compra
       site em inglês, copy é o texto que vende, e é disso que a linha trata.
       O mais longo dos dez é "Capability of your choice", e ele cabe em uma
       linha a 360px, que é onde cada rótulo vira cabeçalho de cartão.

       `incluido` e `naoIncluido` são as duas palavras que a marca gráfica
       carrega em `.so-leitor`, porque o sinal de presente e o de ausente, sozinhos, não dizem nada a
       quem ouve a página. Abaixo de 900px elas saem do `.so-leitor` e viram
       texto visível ao lado do sinal. */
    comparacao: {
      legenda: "The three packages compared row by row: investment, timeline and what changes in scope from one to the next.",
      linhas: [
        "Investment",
        /* Mesmo texto de `entregaRotulo` acima. */
        "Delivery time",
        "Pages or sections",
        "Copy handling",
        "Gallery and content",
        "Integrations",
        "Capability of your choice",
        "SEO and structured data",
        "Revision rounds",
      ],
      incluido: "Included",
      naoIncluido: "Not included",
    },
    pacotes: [
      {
        name: "Essential",
        eyebrow: "To get started",
        launch: "900",
        entrega: "Up to 7 business days",
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
        entrega: "Up to 15 business days",
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
        entrega: "Set in the proposal, depending on the capability chosen",
        featured: false,
        description: "Everything in Business, plus one capability your project calls for, chosen together with you.",
        items: [
          "Everything in the Business package",
          "One capability of your choice: another language, a filterable catalogue, a panel where you change text and photos yourself, or a link to a system you already use",
          "The site set up for search: technical work plus your business details in the format Google reads",
          "2 revision rounds",
        ],
      },
    ],
    incluido: [
      { icone: "direcao", title: "Original visual direction", text: "Every project is designed from scratch. No package uses a template." },
      { icone: "acessivel", title: "Genuinely accessible", text: "Contrast, keyboard navigation and screen readers verified with tooling, not by eye." },
      { icone: "rapido", title: "Fast on any phone", text: "Published on a distributed network, with images and fonts optimised." },
      { icone: "publicacao", title: "Launch and domain set up", text: "We leave the site live, with the address and certificate working." },
      { icone: "garantia", title: "30-day warranty", text: "Any fault after launch is fixed at no cost." },
      { icone: "dono", title: "The site is yours", text: "Domain, accounts and code stay in your company's name from day one." },
    ],
  },

  sobre: {
    indice: "Who's at Varanda",
    eyebrow: "A small studio, on purpose.",
    titulo: "Good technology is the kind that brings people closer, not the kind that complicates.",
    paragrafo1: "Varanda Estúdio Web exists to help shops, professionals and companies build a presence online that is clear, professional and trustworthy.",
    paragrafo2: "Every project is followed closely, from organising the ideas through to development, with straight talk, a documented process and attention to detail. Few projects at a time, and none treated as an item on a conveyor belt.",
    assinatura: "Varanda Estúdio Web",
    assinaturaLocal: "São Paulo, Brazil",
  },

  extras: {
    indice: "Made to measure",
    titulo: "What else might your project need?",
    resumo: "These can be added when they aren't included in the package you choose.",
    nota: "The prices above don't include what the domain, hosting or third-party tools charge. Delivery faster than agreed, or work over a weekend or public holiday, carries a 30% surcharge and depends on availability.",
    /**
     * O REPARO TAMBÉM NÃO EXISTE EM INGLÊS, e pelo mesmo mecanismo:
     * `ativo: false` e as chaves vazias, presentes só por causa do contrato
     * de tipo. Ele é R$ 390 e vale só no Brasil, porque conserto de site
     * alheio depende de acesso, de hospedagem e de telefone, que é
     * justamente o que não se resolve de longe e em outro fuso.
     */
    reparo: {
      ativo: false,
      rotulo: "",
      titulo: "",
      preco: "",
      prazo: "",
      texto: "",
      abatimento: "",
      nota: "",
    },
    /* OS CARDS DOS EXTRAS, desde 13/09/2026. `arte` é o identificador da
       ilustração em `app/extras-arte.tsx`, igual nos três idiomas, e é por ele
       (não pela posição) que o card acha o desenho. `prefixo` e `unidade` ficam
       vazios quando não se aplicam, e existem nos três por causa do contrato de
       tipo. O antigo "Manutenção avulsa" virou "Alterações avulsas" quando a
       manutenção mensal saiu do site: depois da publicação, o que se vende é
       alteração paga pelo tempo. */
    pedir: "Ask about ",
    lista: [
      { arte: "pagina", name: "Extra page", prefixo: "", valor: "US$ 290", unidade: "", descricao: "One more page on top of what the package includes, designed to the same standard as the rest of the site." },
      { arte: "redacao", name: "Full copywriting", prefixo: "", valor: "US$ 170", unidade: "per page", descricao: "The page copy written from scratch, not just adjusted from the material you already have." },
      { arte: "integracao", name: "Integration beyond the standard set", prefixo: "from", valor: "US$ 290", unidade: "", descricao: "Connecting the site to a system outside the standard integrations, such as the CRM your business already uses. The final price is set once we have assessed the system." },
      { arte: "rodada", name: "Extra revision round", prefixo: "", valor: "US$ 230", unidade: "", descricao: "One more round of adjustments beyond those in the package, with the requests gathered in a single list." },
      { arte: "avulsa", name: "One-off changes", prefixo: "", valor: "US$ 69", unidade: "per hour", descricao: "A specific change to the live site, billed by the time it takes, in 30-minute blocks." },
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
          "Every project comes with a 30-day warranty: any fault is fixed at no cost. After that, fixes are billed as one-off changes, by the time they take.",
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
          "Yes. One-off changes are billed by the hour. New pages, new features and changes of scope get their own quote before any work happens, never during.",
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

  /* The page for an address that does not exist. See the note in `pt.ts`. */
  erro: {
    metaTitulo: "Page not found",
    metaDescricao: "This address does not exist on this site. Head back to the Varanda Estúdio Web home page.",
    rotulo: "Address not found",
    titulo: "This page does not exist.",
    texto:
      "The address you opened is not here. It may be an old link, or an address with one character too many. Head back to the start and carry on from there.",
    voltar: "Back to the home page",
  },

  privacidade: {
    kicker: "Information and transparency",
    titulo: "Privacy Policy",
    /* Mesma data do `pt.ts`: a das três versões muda junto. */
    atualizacao: "Last updated: 25 September 2026.",
    voltar: "← Back to the site",
    voltarAria: "Back to the Varanda Estúdio Web home page",
    /* Segue a versão em espanhol, e não a portuguesa: quem lê em inglês pode
       estar na União Europeia, e o RGPD pede as mesmas informações (base por
       finalidade, transferências, prazo de resposta, armazenamento necessário
       no aparelho). A diferença é a reclamação: em vez da AEPD, "your data
       protection authority", porque não dá para saber de que país a pessoa
       escreve. Grafia britânica (fulfil, enquiry), a mesma decidida para o
       questionário em inglês. */
    secoes: [
      {
        titulo: "1. Who handles the data",
        texto:
          "Varanda Estúdio Web is the trading name under which Lucca Oliveira, an individual, provides services from Brazil. He is the controller of the data this site receives: from the contact form and from the project questionnaire, which clients who commission a website receive through a private link. For any privacy matter, write to",
      },
      {
        titulo: "2. The contact form",
        texto:
          "The contact form asks for your name, business name, email, WhatsApp, the type of site and a description of the project. When you select “Continue on WhatsApp”, the site puts together a message with these details and opens the app. This form does not save anything to a database: the message only reaches Varanda if you send it on WhatsApp, which handles it under its own rules. The data is used to reply to you and prepare a proposal. The legal basis is taking steps at your request before a possible contract (Article 6(1)(b) GDPR) or, if you write on behalf of a company, the legitimate interest in replying to it (Article 6(1)(f) GDPR).",
      },
      {
        titulo: "3. The project questionnaire",
        /* Mesmo id nos três idiomas: ver a nota no `pt.ts`. Não traduzir. */
        ancora: "questionario",
        texto:
          "After the first payment, clients who commission a website receive a private link to the project questionnaire, which is the starting point for the site. It asks for company details, the contact details that will appear on the site, the name of the person who approves the project and information about photos, text, domain and deadlines. Sometimes an answer includes someone else's data, such as the name of a person who gave a testimonial. Unlike the contact form, the questionnaire does store data: what you write is saved automatically as you go, even before you submit it. Before the first submission, Varanda sees when the link was opened, when something was last saved and which step the questionnaire stopped at, so it knows when to offer help. The answers themselves are only read after you submit. Anyone with the link can see and change the answers, so share it only with people who are helping you fill it in. Never write a password in it.",
      },
      {
        titulo: "4. What the answers are for",
        texto:
          "The answers are used to build the website you commissioned. They become the project brief, which guides the structure, design, text and launch. They are not used for advertising and do not go into any other project. If you signed the contract in your own name, as a sole trader or freelancer, the legal basis is performance of the contract (Article 6(1)(b) GDPR). If you are answering on behalf of a company, and for anyone mentioned in the answers, the basis is the legitimate interest in building the website the company ordered (Article 6(1)(f) GDPR), and only what is needed for that goes in.",
      },
      {
        titulo: "5. Where the data is kept",
        texto:
          "The answers are kept in Varanda's internal system, a database on Cloudflare. To read the answers and put together the project brief, Varanda uses Claude, an artificial intelligence assistant made by Anthropic. The brief and the working files are kept on OneDrive, from Microsoft. All three companies store or process the data in the United States. Data leaving the European Union for Brazil is covered by the adequacy decision between the European Union and Brazil of 27 January 2026. For Cloudflare, Microsoft and Anthropic, in the United States, the safeguard is the Data Privacy Framework or standard contractual clauses, depending on the provider. Varanda's Anthropic account is set so that conversations are not used to train artificial intelligence. The site counts visits with Cloudflare Web Analytics, without cookies: it records the page opened, without the link's key, where the visitor came from, the country and the type of device.",
      },
      {
        titulo: "6. How long it is kept",
        texto:
          "Varanda does not sell personal data. Messages from the contact form stay in the WhatsApp or email history while the enquiry is being handled, and after that only for as long as needed to meet legal obligations or defend legal claims. Questionnaire answers are kept while the site is being built and during the 30-day warranty after launch. Within 60 days of the end of the warranty, they are deleted from the system and from the working files. If the contract ends before launch, the 60 days run from the end of the contract. Backups keep what was deleted for up to 90 days and are then discarded. Anything that turns into site content, such as approved text and photos, becomes part of the site, which belongs to the company. The client's name, email and phone number are kept with the contract and receipts for five years, counted from the end of the year of the last payment, which is the period for tax obligations.",
      },
      {
        titulo: "7. The draft on your device",
        texto:
          "If something you write cannot be saved while you are filling in the questionnaire, for example because the connection dropped, your browser keeps a copy on your device of whatever has not yet reached Varanda, so nothing is lost. That copy only exists while the tab is open and is deleted as soon as Varanda confirms receipt. It is not a cookie and is not used to track your browsing. It is strictly necessary for the service you asked for, so under the EU ePrivacy rules it does not need your consent.",
      },
      {
        titulo: "8. Your rights",
        texto:
          "You can ask for access to your data and a copy in a commonly used format, correct anything that is wrong, restrict or object to a use, and ask for anything no longer needed to be deleted. While the questionnaire link is open, you can see and correct the answers there yourself. Requests go to the email address in section 1 and are answered within 15 days. If some data is still needed to finish the site or fulfil the contract, the reply says which data and until when it is kept. Anyone mentioned in the answers, such as the author of a testimonial, has the same rights and can write to the same address. You can also lodge a complaint with your data protection authority.",
      },
      {
        titulo: "9. Updates",
        texto:
          "This policy may be updated to reflect changes to the site or to how enquiries are handled. The date of the current version is always shown at the top of the page.",
      },
    ],
  },
};

export default en;
