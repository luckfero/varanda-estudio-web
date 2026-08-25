/**
 * Dicionário português — a língua de referência.
 *
 * `Dicionario` é derivado deste arquivo (`typeof pt`), então ele define a
 * forma e o TypeScript cobra dos outros dois. Chave que nasce aqui e não
 * aparece em `es.ts` ou `en.ts` quebra o build, que é exatamente o que se
 * quer: tradução esquecida não pode chegar em produção como texto em
 * português no meio de uma página em inglês.
 */

const pt = {
  code: "pt-BR",
  htmlLang: "pt-BR",
  ogLocale: "pt_BR",
  /* O caminho da própria língua e o da política. O português mora na raiz
     porque é o endereço que o domínio já tem indexado — mover para /pt
     jogaria fora a autoridade acumulada e exigiria redirecionamento. */
  path: "",
  privacyPath: "/privacidade",
  nome: "Português",

  moeda: "R$",
  moedaAposValor: false,

  meta: {
    title: "Varanda Estúdio Web | Criação de sites profissionais",
    description:
      "Estúdio de criação de sites. Estratégia, direção visual autoral e desenvolvimento para negócios que querem uma presença digital clara e confiável.",
    ogDescription: "Sites que dão espaço para o seu negócio crescer.",
    privacyTitle: "Política de Privacidade",
    privacyDescription: "Como a Varanda Estúdio Web trata os dados enviados pelo formulário de contato.",
  },

  nav: {
    pular: "Pular para o conteúdo",
    inicio: "início",
    servicos: "Serviços",
    portfolio: "Portfólio",
    processo: "Processo",
    investimento: "Investimento",
    sobre: "Sobre",
    contato: "Vamos conversar",
    abrirMenu: "Abrir menu",
    fecharMenu: "Fechar menu",
    navegacao: "Navegação principal",
    idioma: "Idioma",
  },

  hero: {
    kicker: "Estúdio de criação de sites",
    tituloAntes: "Sites que dão ",
    tituloDestaque: "espaço",
    tituloDepois: " para o seu negócio crescer.",
    lead: "Conteúdo claro, visual profissional e tecnologia sem complicação para transformar boas ideias em uma presença digital confiável.",
    ctaPrimario: "Conte sobre seu projeto",
    ctaSecundario: "Ver projeto",
    local: "São Paulo, Brasil",
    atendimento: "Atendimento remoto",
    arteAlt: "Composição visual de um site sendo desenvolvido",
    navegadorEndereco: "seunegocio.com.br",
    navegadorMarca: "seu negócio",
    navegadorTitulo: "Presença para ser<br />lembrado.",
    navegadorBotao: "conheça mais",
    notaTopo: "clareza",
    notaTopoForte: "antes de tudo",
    notaBaixo: "feito com",
    notaBaixoForte: "intenção.",
  },

  intro: {
    indice: "Nosso olhar",
    eyebrow: "Um site não precisa parecer complicado",
    titulo: "Ele precisa fazer sentido para quem chega e para quem cuida do negócio.",
    coluna1: "A Varanda aproxima negócios do digital com comunicação clara, processo transparente e decisões pensadas para a realidade de cada cliente.",
    coluna2: "Cada projeto reúne estratégia, conteúdo e desenvolvimento para entregar um site bonito, útil e fácil de navegar.",
  },

  servicos: {
    indice: "O que fazemos",
    titulo: "O formato certo<br />para o seu momento.",
    resumo: "Três formatos, do mais direto ao mais completo. São os mesmos nomes que aparecem no investimento, mais abaixo.",
    nota: "Precisa de loja virtual, agendamento, área de acesso ou automação?",
    notaLink: "Vamos avaliar juntos.",
    lista: [
      {
        number: "01",
        title: "Essencial",
        text: "Uma página que apresenta o negócio, explica o que você faz e abre conversa com quem chega.",
      },
      {
        number: "02",
        title: "Negócio",
        text: "O site completo: serviços, trabalhos, dúvidas e contato, com o conteúdo organizado do jeito que o cliente procura.",
      },
      {
        number: "03",
        title: "Profissional",
        text: "Quando o site precisa fazer mais do que apresentar: outro idioma, catálogo com filtros, conteúdo que você mesmo atualiza ou integração com o sistema que já usa.",
      },
    ],
  },

  portfolio: {
    /* Texto igual ao que já está publicado — esta rodada traduz, não
       reescreve o português outra vez. */
    indice: "Trabalhos desenvolvidos",
    tituloAntes: "Ideias ganhando",
    tituloDestaque: "forma e presença.",

    /* --- No ar -------------------------------------------------------
       A seção se chama "No ar", e não "Clientes", de propósito. Uma das
       duas é a Casa Conexão, imóvel do próprio Lucca: chamar de cliente
       insinuaria uma relação que não existe. "No ar" é verdade sobre as
       duas, e é a informação que o visitante procura. */
    noArIndice: "No ar",
    noArTitulo: "Negócios de pé, com endereço próprio.",
    noArLinha: "Sites publicados e funcionando agora. Clique para abrir.",
    visitar: "Visitar o site de ",
    visitarDepois: " em uma nova aba",
    verSite: "Ver o site",

    /* --- Projetos do estúdio ------------------------------------------ */
    conceituaisIndice: "Projetos do estúdio",
    /* O título diz por que estes três existem, que é a pergunta que o
       visitante faz depois de ver que dois já estão no ar. */
    conceituaisTitulo: "Três setores, três problemas diferentes.",
    /* O rótulo de cada cartão já diz "Projeto conceitual", mas é fácil de
       passar batido, e visitante estrangeiro não tem como saber que a
       empresa não existe. O protocolo é taxativo sobre trabalho conceitual
       nunca parecer trabalho de cliente. */
    aviso: "Projetos conceituais, criados pelo estúdio para demonstrar direção visual e desenvolvimento. Empresas, textos e dados são fictícios.",

    /* A ordem é pareada por índice com `featuredAssets` em `app/data.ts`.
       Nada aqui pode ser escrito sem estar no site do próprio projeto: são
       negócios que existem, e quem lê pode conferir em um clique. */
    destaques: [
      {
        name: "Casa Conexão",
        label: "Salas de atendimento · São Bernardo do Campo",
        description:
          "Uma casa que aluga salas para profissionais autônomos atenderem: psicólogos, advogados, doulas, contadores. O site apresenta o espaço, mostra quem já atende ali e leva a conversa direto para o WhatsApp.",
        features: ["Direção visual", "Ilustração autoral", "Galeria interativa", "Página por profissional"],
        imageAlt: "Página inicial da Casa Conexão, com duas poltronas diante de uma janela em arco",
      },
      {
        name: "Milênio",
        label: "Grupo de rap · Álbum YinYang",
        description:
          "Três vozes, quase dez anos de estrada e o primeiro álbum a caminho. O site apresenta o grupo, o disco e o curta, com a alternância entre preto e branco como espinha da narrativa.",
        features: ["Direção visual", "Tratamento de imagem", "Tipografia", "Desenvolvimento sem dependência"],
        imageAlt: "Página inicial da Milênio, com o título O rap de outro milênio sobre fundo preto",
      },
    ],
    carrossel: "carrossel",
    carrosselLabel: "Trabalhos desenvolvidos pela Varanda",
    abrirAntes: "Abrir demonstração do projeto ",
    abrirDepois: " em uma nova aba",
    escolher: "Escolher projeto",
    mostrar: "Mostrar ",
    projetoAntes: "Projeto ",
    projetoDe: " de ",
    entregas: "Entregas do projeto",
    previstas: "Características previstas",
    reservado: "Espaço reservado para um próximo projeto",
    novoProjeto: "novo projeto",
    emBreve: "em breve",
    novosTrabalhos: "Novos trabalhos serão adicionados aqui.",
    anterior: "Projeto anterior",
    proximo: "Próximo projeto",
    /* A ordem é pareada por índice com `projectAssets` em `app/data.ts`, que
       explica por que ela é esta. Mudar aqui sem mudar lá, ou sem mudar os
       outros dois idiomas, troca a imagem e o link de lugar. */
    projetos: [
      {
        name: "Nívora Construções",
        label: "Projeto conceitual · Construção civil",
        description:
          "Um site institucional trilíngue para uma construtora contemporânea, com portfólio de obras, serviços, processo construtivo e pré-diagnóstico de orçamento em uma experiência visual técnica e imersiva.",
        features: ["Estratégia trilíngue", "Arquitetura da informação", "Direção visual", "Desenvolvimento responsivo"],
        imageAlt: "Casa contemporânea apresentada na página inicial do projeto Nívora Construções",
      },
      {
        name: "Nascente",
        label: "Projeto conceitual · Perfumaria",
        description:
          "Uma loja de perfumaria autoral com catálogo filtrável por coleção e intensidade, guia olfativo em etapas e fluxo de compra completo, da descoberta da fragrância à confirmação do pedido.",
        features: ["Identidade visual", "Catálogo e filtros", "Guia olfativo", "Fluxo de compra"],
        imageAlt: "Frasco de perfume em vidro âmbar entre folhas escuras, na página inicial do projeto Nascente",
      },
      {
        name: "Brasa do Vale",
        label: "Projeto conceitual · Gastronomia",
        description:
          "Um site acolhedor e direto para uma churrascaria, com foco no cardápio, nos diferenciais da casa e no contato rápido pelo WhatsApp.",
        features: ["Estratégia de conteúdo", "Direção visual", "Design responsivo", "Desenvolvimento"],
        imageAlt: "Imagem de churrasco usada na página inicial do projeto Brasa do Vale",
      },
      {
        /* Quarto cartão SEM par em `projectAssets`, de propósito: é assim que
           o carrossel monta o espaço reservado (ver `section-portfolio.tsx`).
           O CSS de `--placeholder-4` já existia, o desenho previa isto. */
        name: "Seu projeto",
        label: "Espaço reservado · Próximo trabalho",
        description:
          "O próximo trabalho do estúdio ocupa este espaço. Pode ser o seu: a conversa começa com um oi.",
        features: ["Conversa e briefing", "Direção e conteúdo", "Criação e ajustes", "Publicação e cuidado"],
        imageAlt: "",
      },
    ],
  },

  processo: {
    indice: "Como acontece",
    titulo: "Um caminho claro,<br />do primeiro “oi”<br />até a publicação.",
    resumo: "Você acompanha as decisões, aprova cada etapa e sabe o que esperar até a publicação.",
    etapas: [
      {
        step: "01",
        title: "Conversa e briefing",
        text: "Entendemos o negócio, o público e o que o site precisa resolver. A partir disso, organizamos as informações essenciais.",
      },
      {
        step: "02",
        title: "Direção e conteúdo",
        text: "Definimos a estrutura das páginas, a linguagem e a direção visual antes de escrever a primeira linha de código.",
      },
      {
        step: "03",
        title: "Criação e ajustes",
        text: "Desenvolvemos o site, apresentamos o resultado já no ar e aplicamos as rodadas de ajustes incluídas no pacote.",
      },
      {
        step: "04",
        title: "Publicação e cuidado",
        text: "Com a aprovação final, publicamos e entregamos os acessos. Com plano de manutenção, seguimos acompanhando.",
      },
    ],
  },

  investimento: {
    indice: "Investimento",
    titulo: "Comece com o que<br />seu negócio precisa hoje.",
    prazo: "Condição de lançamento válida para contratos fechados até 30 de setembro de 2026.",
    porProjeto: "por projeto",
    valorRegular: "valor regular:",
    cta: "Quero este plano",
    incluidoTitulo: "Em todos os pacotes, sem cobrança à parte",
    /* Duas colunas, e a separação é comercial antes de ser visual: a da
       esquerda está no preço do pacote, a da direita não. Enquanto era um
       parágrafo único, "pagamento online" ao lado de "mapa" faria o cliente
       ler as duas como inclusas. */
    escopoIncluidoTitulo: "Integrações inclusas em todos os pacotes",
    escopoIncluido: [
      "Formulário de contato que chega no seu e-mail e no seu WhatsApp",
      "Medição de visitas e origem do tráfego",
      "Mapa e localização",
      "Links das suas redes sociais",
      "Botão de WhatsApp em todas as páginas",
    ],
    escopoOrcamentoTitulo: "Também desenvolvemos, com orçamento próprio",
    /* Não repete as quatro capacidades do pacote Profissional, que estão
       nos cartões logo acima. Repetir fazia o visitante ler que catálogo
       com filtros estava incluso e cobrado à parte ao mesmo tempo.
       O critério do corte: o que envolve dinheiro, identidade de usuário ou
       estado em tempo real é sempre grande demais para caber como "uma
       capacidade". */
    escopoOrcamento: [
      "Pagamento online e assinatura recorrente",
      "Loja virtual completa",
      "Agendamento e reserva de horário",
      "Área de acesso para clientes",
      "Automações sob medida",
      "A segunda capacidade, quando o projeto pedir mais de uma",
    ],
    nota: "Cada rodada de ajustes deve chegar em uma lista consolidada. Qualquer necessidade fora do pacote é informada e orçada antes do início, nunca durante.",
    pacotes: [
      {
        name: "Essencial",
        eyebrow: "Para começar",
        launch: "1.200",
        future: "1.500",
        /* Presente nos três, mesmo falso. Sem a chave em todos, o TypeScript
           infere um tipo diferente por elemento e `typeof pt` deixa de servir
           como contrato para `es.ts` e `en.ts`. */
        featured: false,
        description: "Uma página para apresentar o essencial do negócio e abrir conversa com quem chega.",
        items: [
          "Uma página, com as seções que o seu negócio pedir",
          "Textos ajustados a partir do material que você já tem",
          "Formulário de contato e botão de WhatsApp",
          "1 rodada de ajustes",
        ],
      },
      {
        name: "Negócio",
        eyebrow: "Recomendado",
        launch: "2.500",
        future: "2.900",
        featured: true,
        description: "O site completo do seu negócio, com espaço para explicar, mostrar trabalhos e responder dúvidas.",
        items: [
          "Site completo, até 6 páginas ou seções",
          "Organização e redação dos textos principais",
          "Galeria de trabalhos, serviços e dúvidas frequentes",
          "Integrações padrão configuradas",
          "2 rodadas de ajustes",
        ],
      },
      {
        name: "Profissional",
        eyebrow: "Para crescer",
        launch: "4.500",
        future: "5.500",
        featured: false,
        description: "Tudo do Negócio, mais uma capacidade que o seu projeto exige, escolhida junto com você.",
        items: [
          "Tudo do pacote Negócio",
          "Uma capacidade à escolha: outro idioma, catálogo com filtros, conteúdo gerenciável ou integração com sistema",
          "SEO técnico e dados estruturados",
          "2 rodadas de ajustes",
          "Primeiro mês do plano Presença incluído",
        ],
      },
    ],
    incluido: [
      { title: "Direção visual autoral", text: "Cada projeto é desenhado do zero. Nenhum pacote usa modelo pronto." },
      { title: "Acessível de verdade", text: "Contraste, navegação por teclado e leitor de tela verificados com ferramenta, não no olho." },
      { title: "Rápido em qualquer celular", text: "Publicado em rede distribuída, com imagens e fontes otimizadas." },
      { title: "Publicação e domínio configurados", text: "Deixamos o site no ar, com endereço e certificado funcionando." },
      { title: "Garantia de 30 dias", text: "Defeito de funcionamento depois da publicação é corrigido sem custo." },
      { title: "O site é seu", text: "Domínio, contas e código ficam no nome da sua empresa desde o primeiro dia." },
    ],
  },

  manutencao: {
    indice: "Depois da publicação",
    tituloAntes: "Seu site pode continuar",
    tituloDestaque: "bem cuidado.",
    resumo: "Planos opcionais para manter o site no ar, atualizado e seguro, e para mudar o conteúdo sempre que o negócio mudar.",
    porMes: "/mês",
    nota1: "O tempo mensal não é acumulativo. O pagamento é antecipado e o cancelamento requer aviso prévio de 30 dias.",
    nota2: "Para demandas pontuais sem plano, a manutenção avulsa custa R$ 190 por hora, cobrada em blocos de 30 minutos. Dentro dos planos, a hora sai sempre mais barata.",
    planos: [
      {
        name: "Cuidado",
        price: "119",
        featured: false,
        summary: "O site sempre no ar e em dia.",
        items: [
          "Monitoramento, com correção se o site sair do ar",
          "Backup e certificado sempre válidos",
          "Atualizações técnicas e de segurança",
          "Retorno em até 3 dias úteis",
        ],
      },
      {
        name: "Presença",
        price: "279",
        featured: true,
        summary: "O conteúdo acompanhando o negócio.",
        items: ["Tudo do plano Cuidado", "Até 1 hora por mês de alterações de conteúdo", "Retorno em até 2 dias úteis"],
      },
      {
        name: "Prioridade",
        price: "519",
        featured: false,
        summary: "Para quem mexe no site com frequência.",
        items: ["Tudo do plano Presença", "Até 3 horas por mês de alterações", "Retorno no mesmo dia útil"],
      },
    ],
  },

  sobre: {
    indice: "Quem está na Varanda",
    eyebrow: "Um estúdio pequeno, de propósito.",
    titulo: "Tecnologia boa é a que aproxima, não a que complica.",
    paragrafo1: "A Varanda Estúdio Web existe para ajudar comércios, profissionais e empresas a construírem uma presença digital clara, profissional e confiável.",
    paragrafo2: "Cada projeto é acompanhado de perto, da organização das ideias ao desenvolvimento, com conversa franca, processo documentado e atenção aos detalhes. Poucos projetos por vez, e nenhum tratado como encomenda de esteira.",
    assinatura: "Varanda Estúdio Web",
    assinaturaLocal: "— São Paulo, Brasil",
  },

  extras: {
    indice: "Sob medida",
    titulo: "O que mais o seu projeto pode precisar?",
    resumo: "Estes serviços podem ser adicionados quando não estiverem incluídos no pacote escolhido.",
    nota: "Os valores acima não incluem custos cobrados por domínio, hospedagem ou ferramentas externas. Entrega em prazo menor que o combinado, ou trabalho em fim de semana e feriado, tem adicional de 30% e depende de disponibilidade.",
    lista: [
      { name: "Página adicional", price: "R$ 390" },
      { name: "Redação completa", price: "R$ 220/página" },
      { name: "Integração além das padrão", price: "a partir de R$ 390" },
      { name: "Rodada adicional de ajustes", price: "R$ 320" },
      { name: "Manutenção avulsa", price: "R$ 190/hora" },
    ],
  },

  faq: {
    indice: "Dúvidas frequentes",
    titulo: "Antes de começar,<br />vale saber.",
    perguntas: [
      {
        question: "Em quanto tempo meu site fica pronto?",
        answer:
          "Depende do pacote e, principalmente, de quando o conteúdo chega. Uma página fica pronta em poucos dias depois do material aprovado; um site completo leva mais. O prazo do seu projeto entra na proposta antes de começar e conta a partir do recebimento dos materiais.",
      },
      {
        question: "Preciso ter textos e fotos prontos?",
        answer:
          "Não. Organizamos e ajustamos o conteúdo a partir do que você já tem e indicamos o que ainda falta produzir. Redação completa do zero e produção de imagens são contratadas à parte, com valor informado antes.",
      },
      {
        question: "E se der problema depois que o site estiver no ar?",
        answer:
          "Todo projeto tem 30 dias de garantia: defeito de funcionamento é corrigido sem custo. Depois desse prazo, correções entram por manutenção avulsa ou por plano mensal, que também monitora o site e avisa antes de você perceber.",
      },
      {
        question: "De quem é o site depois de pronto?",
        answer:
          "Seu. Domínio, hospedagem, contas e código ficam registrados no nome da sua empresa, e os acessos são entregues na publicação. Nenhum projeto depende de nós para continuar existindo.",
      },
      {
        question: "Domínio e hospedagem estão inclusos?",
        answer:
          "A configuração está inclusa em todos os pacotes. O custo cobrado pelo registrador, pela hospedagem e por ferramentas externas é pago diretamente por você, sempre em contas no seu nome.",
      },
      {
        question: "Posso pedir mudanças depois de publicado?",
        answer:
          "Sim. Alterações pontuais entram por manutenção avulsa ou pelo plano mensal. Páginas novas, funcionalidades e mudanças de escopo recebem orçamento próprio antes da execução, nunca durante.",
      },
      {
        question: "Vocês atendem fora do Brasil?",
        answer:
          "Sim. O trabalho é remoto e já é feito assim; atendemos em português, espanhol e inglês, e os valores podem ser acertados em real, euro ou dólar conforme o país.",
      },
      {
        question: "Vocês fazem loja virtual ou sistemas?",
        answer:
          "Sim, mediante análise técnica. Pagamentos, agendamento em tempo real, área de acesso, banco de dados e automações são planejados e orçados separadamente, porque o esforço varia demais para caber em um preço de tabela.",
      },
    ],
  },

  contato: {
    indice: "Vamos conversar",
    tituloAntes: "Seu negócio merece<br />um lugar para ",
    tituloDestaque: "crescer.",
    resumo: "Conte o que seu negócio precisa e em que momento ele está. Analisamos as informações e respondemos com a orientação para o próximo passo.",
    whatsappLabel: "WhatsApp",
    whatsappAria: "Falar com a Varanda pelo WhatsApp em uma nova aba",
    whatsappMensagem: "Olá! Vim pelo site da Varanda Estúdio Web e gostaria de conversar sobre um projeto.",
    formSaudacao: "Olá! Vim pelo site da Varanda Estúdio Web.",
    campoNome: "Seu nome *",
    campoNomePlaceholder: "Como você prefere ser chamado?",
    campoNegocio: "Nome do negócio *",
    campoNegocioPlaceholder: "Nome da empresa ou do projeto",
    campoEmail: "E-mail *",
    campoWhatsapp: "WhatsApp *",
    campoTipo: "Que tipo de site você procura? *",
    campoTipoPlaceholder: "Selecione uma opção",
    campoResumo: "Conte sobre o projeto *",
    campoResumoPlaceholder: "Conte o que seu negócio faz, o que o site precisa apresentar e qual resultado você espera.",
    consentimento: "Concordo com o uso destes dados para receber retorno sobre meu projeto, conforme a",
    consentimentoLink: "Política de Privacidade",
    botao: "Continuar no WhatsApp",
    dica: "Ao continuar, o WhatsApp abrirá uma mensagem com as informações preenchidas. Nada é armazenado em um banco de dados deste site.",
    sucesso: "Mensagem preparada e aberta no WhatsApp. Confira e toque em enviar para que ela chegue até nós.",
    bloqueadoAntes: "O navegador bloqueou a nova aba.",
    bloqueadoLink: "Abrir a mensagem no WhatsApp",
    bloqueadoDepois: "(os dados preenchidos vão junto).",
    rotuloNome: "Meu nome",
    rotuloNegocio: "Negócio",
    rotuloEmail: "E-mail",
    rotuloWhatsapp: "WhatsApp",
    rotuloTipo: "Tipo de site",
    rotuloProjeto: "Sobre o projeto:",
    tipos: [
      "Essencial (uma página)",
      "Negócio (site completo)",
      "Profissional (site completo e mais uma capacidade)",
      "Loja virtual ou projeto especial",
      "Ainda não sei",
    ],
  },

  rodape: {
    frase: "Sites próximos, bem pensados e feitos do zero.",
    voltarTopo: "Voltar ao topo ↑",
    local: "São Paulo, Brasil · Atendimento remoto",
    privacidade: "Privacidade",
    direitos: "© 2026 Varanda Estúdio Web",
    voltarInicio: "Varanda Estúdio Web, voltar ao início",
  },

  privacidade: {
    kicker: "Informação e transparência",
    titulo: "Política de Privacidade",
    atualizacao: "Última atualização: 10 de agosto de 2026.",
    voltar: "← Voltar ao site",
    voltarAria: "Voltar para a página inicial da Varanda Estúdio Web",
    secoes: [
      {
        titulo: "1. Quem trata os dados",
        texto:
          "Varanda Estúdio Web é o nome comercial sob o qual Lucca Oliveira, pessoa física, presta serviços, e é o responsável pelo tratamento dos dados recebidos por esta página. Para assuntos de privacidade, escreva para",
      },
      {
        titulo: "2. Dados utilizados",
        texto:
          "O formulário solicita nome, nome do negócio, e-mail, WhatsApp, tipo de site procurado e uma descrição do projeto. Esses dados são usados somente para analisar a solicitação, iniciar o atendimento e responder ao contato.",
      },
      {
        titulo: "3. Como o formulário funciona",
        texto:
          "Ao selecionar “Continuar no WhatsApp”, o site prepara uma mensagem com as informações preenchidas e abre o aplicativo. Os dados não são gravados em um banco de dados deste site. O tratamento realizado pelo WhatsApp segue as regras e políticas da própria plataforma.",
      },
      {
        titulo: "4. Compartilhamento e retenção",
        texto:
          "A Varanda não vende dados pessoais. As informações recebidas podem permanecer no histórico do WhatsApp ou do e-mail pelo tempo necessário ao atendimento, ao cumprimento de obrigações ou ao exercício regular de direitos.",
      },
      {
        titulo: "5. Seus direitos",
        texto:
          "Você pode solicitar confirmação, acesso, correção ou eliminação dos dados tratados, observadas as hipóteses legais de conservação. Para isso, entre em contato pelo e-mail informado acima.",
      },
      {
        titulo: "6. Atualizações",
        texto:
          "Esta política pode ser atualizada para refletir mudanças no site ou no processo de atendimento. A data da versão vigente será sempre indicada no início da página.",
      },
    ],
  },
};

/* Sem `as const`: o objetivo deste arquivo é virar contrato para os outros
   dois (`export type Dicionario = typeof pt`), e `as const` estreitaria cada
   texto ao seu próprio literal — `code: "pt-BR"` viraria um tipo que só
   aceita a string "pt-BR", e nenhuma tradução seria atribuível. */
export default pt;
