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
    privacyDescription:
      "Como a Varanda Estúdio Web trata os dados do formulário de contato e do questionário de quem contrata um site.",
    /* Só o dado estruturado (JSON-LD) usa as duas chaves abaixo. Elas vivem
       aqui, e não em `structured-data.tsx`, porque a página declara
       `inLanguage` do próprio idioma: texto em português numa página em
       inglês é dado misto para o buscador. */
    areaAtendida: "Brasil, Europa e América do Norte",
    servicos: ["Criação de sites", "Site institucional", "Desenvolvimento web"],
  },

  nav: {
    pular: "Pular para o conteúdo",
    flutuante: "Falar no WhatsApp",
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
    titulo: "Ele precisa fazer sentido para quem chega e para quem cuida do negócio.",
    coluna1: "A Varanda aproxima negócios do digital com comunicação clara, processo transparente e decisões pensadas para a realidade de cada cliente.",
    coluna2: "Cada projeto reúne estratégia, conteúdo e desenvolvimento para entregar um site bonito, útil e fácil de navegar.",
  },

  servicos: {
    indice: "O que fazemos",
    titulo: "O formato certo para o seu momento.",
    resumo: "Três formatos, do mais direto ao mais completo. O botão de cada um leva ao que entra e ao investimento.",
    verPlano: "Ver o que entra em cada um",
    nota: "Precisa de loja virtual, agendamento, área de acesso ou automação?",
    notaLink: "Vamos avaliar juntos",
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
    conceitualSelo: "Conceitual",
    depoimentoIndice: "Quem já recebeu o site",
    ctaTexto: "Conte o que seu negócio precisa e respondemos com o próximo passo.",
    ctaBotao: "Quero um site assim",
    estudosNota: "Sem cliente, sem endereço no ar.",
    estudosIndice: "Estudos conceituais",
    noArNota: "Sites publicados, com endereço aberto para qualquer pessoa visitar.",
    visitar: "Visitar o site de ",
    visitarDepois: " em uma nova aba",

    /* --- Projetos do estúdio ------------------------------------------ */
    /* O título diz por que estes três existem, que é a pergunta que o
       visitante faz depois de ver que dois já estão no ar. */
    /* O rótulo de cada cartão já diz "Projeto conceitual", mas é fácil de
       passar batido, e visitante estrangeiro não tem como saber que a
       empresa não existe. O protocolo é taxativo sobre trabalho conceitual
       nunca parecer trabalho de cliente. */
    aviso: "Três setores, três problemas diferentes, escolhidos para demonstrar direção visual e desenvolvimento. Empresas, textos e dados são fictícios.",

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
        imageAlt: "Marca da Casa Conexão, dois círculos que se cruzam, sobre o verde da identidade dela",
      },
      {
        name: "Milênio",
        label: "Grupo de rap · Álbum YinYang",
        description:
          "Três vozes, quase dez anos de estrada e o primeiro álbum a caminho. O site apresenta o grupo, o disco e o curta, com a alternância entre preto e branco como espinha da narrativa.",
        features: ["Direção visual", "Tratamento de imagem", "Tipografia", "Desenvolvimento sem dependência"],
        imageAlt: "Marca da Milênio, um olho desenhado em traço, sobre o verde da identidade dela",
      },
    ],
    abrirAntes: "Abrir demonstração do projeto ",
    abrirDepois: " em uma nova aba",
    /* A ordem é pareada por índice com `projectAssets` em `app/data.ts`, que
       explica por que ela é esta. Mudar aqui sem mudar lá, ou sem mudar os
       outros dois idiomas, troca a imagem e o link de lugar. */
    projetos: [
      {
        name: "Nívora Construções",
        label: "Construção civil",
        description:
          "Um site institucional trilíngue para uma construtora contemporânea, com portfólio de obras, serviços, processo construtivo e pré-diagnóstico de orçamento em uma experiência visual técnica e imersiva.",
        features: ["Estratégia trilíngue", "Arquitetura da informação", "Direção visual", "Desenvolvimento responsivo"],
        imageAlt: "Marca da Nívora Construções, um N em linha contínua, sobre o cobre da identidade dela",
      },
      {
        name: "Nascente",
        label: "Perfumaria",
        description:
          "Uma loja de perfumaria autoral com catálogo filtrável por coleção e intensidade, guia olfativo em etapas e fluxo de compra completo, da descoberta da fragrância à confirmação do pedido.",
        features: ["Identidade visual", "Catálogo e filtros", "Guia olfativo", "Fluxo de compra"],
        imageAlt: "Marca da Nascente, meia rodela de cítrico, sobre o marrom escuro da identidade dela",
      },
      {
        name: "Brasa do Vale",
        label: "Gastronomia",
        description:
          "Um site acolhedor e direto para uma churrascaria, com foco no cardápio, nos diferenciais da casa e no contato rápido pelo WhatsApp.",
        features: ["Estratégia de conteúdo", "Direção visual", "Design responsivo", "Desenvolvimento"],
        imageAlt: "Marca da Brasa do Vale, um espeto com três cortes, sobre o vinho da identidade dela",
      },
    ],
  },

  processo: {
    indice: "Como acontece",
    titulo: "Um caminho claro, do primeiro “oi” até a publicação.",
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
        title: "Publicação e entrega",
        text: "Com a aprovação final, publicamos e entregamos os acessos.",
      },
    ],
  },

  investimento: {
    indice: "Investimento",
    titulo: "Comece com o que seu negócio precisa hoje.",
    /* Era a condição de lançamento com data de validade ("até 30 de setembro
       de 2026"). Ela venceria em 36 dias em três idiomas, e site que anuncia
       condição vencida é pior que site sem condição nenhuma. A comparação com
       o "valor regular" saiu junto, por decisão do dono em 25/08/2026: o preço
       publicado passa a ser o preço que se cobra, sem segunda coluna. */
    resumo: "O preço fecha antes de começar, junto com o escopo por escrito. Nada é cobrado durante o projeto sem ter sido combinado antes.",
    porProjeto: "por projeto",
    /* O RÓTULO DO PRAZO, e ele agora é lido de verdade.
       Até 08/09/2026 esta chave existia nos três dicionários e nenhum
       componente a usava: o cartão pegava o rótulo emprestado de
       `comparacao.linhas[1]`, que é a linha da tabela. As duas continuam
       dizendo a mesma coisa e precisam continuar dizendo: o cartão é a
       apresentação do celular e a tabela é a do desktop, e o mesmo dado com
       dois nomes leria como duas informações diferentes.
       "Típico" saiu porque o prazo deixou de ser média e passou a ser teto:
       "até 7 dias úteis" é promessa, e "prazo típico de até 7 dias" é uma
       frase que se contradiz. */
    entregaRotulo: "Prazo de entrega",
    /* A CONTAGEM DO PRAZO, uma vez só para a seção inteira.
       Ela vale para os três pacotes, e repetida em cada cartão leria como se
       variasse de um para o outro. A regra é a de
       `comercial/oferta/politicas.md`, que é a fonte: conta do material
       recebido, nunca da assinatura. Sem ela, "até 7 dias úteis" vira promessa
       aberta e o cliente que some com as fotos leva o prazo junto. */
    prazoNota: "Todo prazo conta a partir do recebimento de todos os materiais e acessos, e da aprovação deles.",
    /* Prazo e pagamento não existiam na página: nenhuma das duas perguntas
       que todo cliente faz tinha resposta antes de ele precisar perguntar.
       O 50/50 vem de `comercial/oferta/politicas.md`, que é a fonte.
       O cartão entrou em 08/09/2026, e entrou com o acréscimo DITO. A frase
       nunca pode virar "12 vezes sem juros": existe acréscimo, e ele é dito.
       Parcelamento com acréscimo escondido é o mesmo desconto que o cliente
       descobre na fatura. */
    pagamento: "Pagamento em duas partes: 50% para iniciar e 50% na aprovação final, antes da publicação. Pix, transferência ou boleto. Para quem precisa diluir, o cartão de crédito vai em até 12 vezes, com acréscimo de 15% sobre o valor à vista.",
    incluiNoPlano: "O que está incluído",
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
    /* A TABELA COMPARÁVEL, que substituiu os três cartões lado a lado.
       Nada aqui é dado comercial: o valor de cada célula continua saindo de
       `pacotes[].items`, `launch` e `entrega`, palavra por palavra. O que
       mora nesta chave é só o andaime da tabela, que antes não existia
       porque a comparação não existia.

       `linhas` é POSICIONAL, na mesma ordem em que a tabela desenha as dez
       linhas, e a ordem está escrita na constante `COMPARACAO` de
       `app/section-oferta.tsx`. Tirar, acrescentar ou trocar de lugar um
       item aqui desloca todos os rótulos abaixo dele e cola o nome de uma
       dimensão nos valores de outra, em silêncio e em um idioma só. Mexer
       nos três dicionários e na constante junto, sempre.

       `incluido` e `naoIncluido` são as duas palavras que a marca gráfica
       carrega em `.so-leitor`. Elas existem porque o sinal de presente e o de ausente, sozinhos, não
       dizem nada a quem ouve a página: o leitor de tela anunciaria o nome
       do glifo, ou silêncio. */
    comparacao: {
      legenda: "Comparação dos três pacotes, linha a linha: investimento, prazo e o que muda no escopo de um para o outro.",
      linhas: [
        "Investimento",
        /* Mesmo texto de `entregaRotulo` acima, e por quê está escrito lá. */
        "Prazo de entrega",
        "Páginas ou seções",
        "Tratamento de texto",
        "Galeria e conteúdo",
        "Integrações",
        "Capacidade à escolha",
        "SEO e dados estruturados",
        "Rodadas de ajuste",
      ],
      incluido: "Incluído",
      naoIncluido: "Não incluído",
    },
    pacotes: [
      {
        name: "Essencial",
        eyebrow: "Para começar",
        launch: "1.000",
        /* Presente nos três, mesmo falso. Sem a chave em todos, o TypeScript
           infere um tipo diferente por elemento e `typeof pt` deixa de servir
           como contrato para `es.ts` e `en.ts`. */
        /* O PRAZO PUBLICADO, aprovado em 08/09/2026. Saiu "alguns dias", que
           não é prazo, é impressão. O número vem de
           `comercial/oferta/catalogo.md`, seção "Prazo publicado", e a
           contagem está em `prazoNota` acima. */
        entrega: "Até 7 dias úteis",
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
        launch: "2.100",
        entrega: "Até 15 dias úteis",
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
        launch: "3.800",
        entrega: "Definido na proposta, conforme a capacidade escolhida",
        featured: false,
        description: "Tudo do Negócio, mais uma capacidade que o seu projeto exige, escolhida junto com você.",
        items: [
          "Tudo do pacote Negócio",
          "Uma capacidade à escolha: outro idioma, catálogo com filtros, um painel para você mesmo trocar textos e fotos, ou ligação com um sistema que você já usa",
          "O site preparado para busca: ajustes técnicos e os dados do negócio no formato que o Google lê",
          "2 rodadas de ajustes",
        ],
      },
    ],
    incluido: [
      { icone: "direcao", title: "Direção visual autoral", text: "Cada projeto é desenhado do zero. Nenhum pacote usa modelo pronto." },
      { icone: "acessivel", title: "Acessível de verdade", text: "Contraste, navegação por teclado e leitor de tela verificados com ferramenta, não no olho." },
      { icone: "rapido", title: "Rápido em qualquer celular", text: "Publicado em rede distribuída, com imagens e fontes otimizadas." },
      { icone: "publicacao", title: "Publicação e domínio configurados", text: "Deixamos o site no ar, com endereço e certificado funcionando." },
      { icone: "garantia", title: "Garantia de 30 dias", text: "Defeito de funcionamento depois da publicação é corrigido sem custo." },
      { icone: "dono", title: "O site é seu", text: "Domínio, contas e código ficam no nome da sua empresa desde o primeiro dia." },
    ],
  },

  sobre: {
    indice: "Quem está na Varanda",
    eyebrow: "Um estúdio pequeno, de propósito.",
    titulo: "Tecnologia boa é a que aproxima, não a que complica.",
    paragrafo1: "A Varanda Estúdio Web existe para ajudar comércios, profissionais e empresas a construírem uma presença digital clara, profissional e confiável.",
    paragrafo2: "Cada projeto é acompanhado de perto, da organização das ideias ao desenvolvimento, com conversa franca, processo documentado e atenção aos detalhes. Poucos projetos por vez, e nenhum tratado como encomenda de esteira.",
    assinatura: "Varanda Estúdio Web",
    assinaturaLocal: "São Paulo, Brasil",
  },

  extras: {
    indice: "Sob medida",
    titulo: "O que mais o seu projeto pode precisar?",
    resumo: "Estes serviços podem ser adicionados quando não estiverem incluídos no pacote escolhido.",
    nota: "Os valores acima não incluem custos cobrados por domínio, hospedagem ou ferramentas externas. Entrega em prazo menor que o combinado, ou trabalho em fim de semana e feriado, tem adicional de 30% e depende de disponibilidade.",
    /**
     * O REPARO, E ELE TAMBÉM É SÓ EM REAL.
     *
     * Aprovado em 08/09/2026, copiado de `comercial/oferta/catalogo.md`,
     * seção "Reparo · o produto de entrada". Mesmo interruptor da condição de
     * abertura, pelo mesmo motivo: `ativo` é falso em `es.ts` e `en.ts`, e as
     * chaves de lá ficam vazias. Ele vale só no Brasil, e conserto de site
     * alheio depende de acesso, de hospedagem e de conversa por telefone, que
     * é justamente o que não se faz de longe e em outro fuso.
     *
     * A NOTA DE QUE ELE NÃO É PARA CLIENTE fica colada ao preço, e não é
     * detalhe: Reparo e hora avulsa são produtos diferentes, e essa
     * distinção só se sustenta se estiver escrita ao lado do número.
     */
    reparo: {
      ativo: true,
      rotulo: "Para quem já tem site",
      titulo: "Reparo",
      preco: "R$ 390",
      prazo: "até 3 dias úteis",
      texto: "Diagnóstico e conserto de um defeito no site que a sua empresa já tem, com o escopo fechado por escrito antes de começar.",
      /* "Corridos" está no catálogo e vem junto: 30 dias corridos e 30 dias
         úteis são quase duas semanas de diferença, e quem conta o prazo é o
         cliente. */
      abatimento: "Fechando qualquer pacote em até 30 dias corridos, os R$ 390 são descontados do valor do pacote.",
      nota: "Vale para quem ainda não é cliente. Para quem já é, o mesmo trabalho entra como alteração avulsa.",
    },
    /* OS CARDS DOS EXTRAS, desde 13/09/2026. `arte` é o identificador da
       ilustração em `app/extras-arte.tsx`, igual nos três idiomas, e é por ele
       (não pela posição) que o card acha o desenho. `prefixo` e `unidade` ficam
       vazios quando não se aplicam, e existem nos três por causa do contrato de
       tipo. O antigo "Manutenção avulsa" virou "Alterações avulsas" quando a
       manutenção mensal saiu do site: depois da publicação, o que se vende é
       alteração paga pelo tempo. */
    pedir: "Falar sobre ",
    lista: [
      { arte: "pagina", name: "Página adicional", prefixo: "", valor: "R$ 390", unidade: "", descricao: "Uma página a mais além das que o pacote inclui, desenhada no mesmo padrão do resto do site." },
      { arte: "redacao", name: "Redação completa", prefixo: "", valor: "R$ 220", unidade: "por página", descricao: "Os textos da página escritos do zero, e não só ajustados a partir do material que você já tem." },
      { arte: "integracao", name: "Integração além das padrão", prefixo: "a partir de", valor: "R$ 390", unidade: "", descricao: "Ligação do site com um sistema que não está entre as integrações padrão, como o CRM que a sua empresa já usa. O valor final fecha depois de avaliar o sistema." },
      { arte: "rodada", name: "Rodada adicional de ajustes", prefixo: "", valor: "R$ 320", unidade: "", descricao: "Mais uma volta de ajustes além das que o pacote inclui, com os pedidos reunidos numa lista só." },
      { arte: "avulsa", name: "Alterações avulsas", prefixo: "", valor: "R$ 190", unidade: "por hora", descricao: "Mudança pontual no site já publicado, cobrada pelo tempo usado, em blocos de 30 minutos." },
    ],
  },

  faq: {
    fechamentoTitulo: "Ficou alguma dúvida de fora?",
    fechamentoTexto: "Pergunte direto. Respondemos com a orientação para o seu caso, sem compromisso de contratar.",
    fechamentoBotao: "Fazer uma pergunta",
    indice: "Dúvidas frequentes",
    titulo: "Antes de começar, vale saber.",
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
          "Todo projeto tem 30 dias de garantia: defeito de funcionamento é corrigido sem custo. Depois desse prazo, correções entram como alteração avulsa, cobrada pelo tempo usado.",
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
          "Sim. Alterações pontuais entram como alteração avulsa, cobrada por hora. Páginas novas, funcionalidades e mudanças de escopo recebem orçamento próprio antes da execução, nunca durante.",
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
    tituloAntes: "Seu negócio merece um lugar para ",
    tituloDestaque: "crescer.",
    resumo: "Conte o que seu negócio precisa e em que momento ele está. Analisamos as informações e respondemos com a orientação para o próximo passo.",
    emailLabel: "E-mail",
    whatsappLabel: "WhatsApp",
    whatsappAria: "Falar com a Varanda pelo WhatsApp em uma nova aba",
    whatsappMensagem: "Olá! Vim pelo site da Varanda Estúdio Web e gostaria de conversar sobre um projeto.",
    formSaudacao: "Olá! Vim pelo site da Varanda Estúdio Web.",
    opcional: "opcional",
    campoNome: "Seu nome *",
    campoNomePlaceholder: "Como você prefere ser chamado?",
    campoNegocio: "Nome do negócio",
    campoNegocioPlaceholder: "Nome da empresa ou do projeto",
    campoEmail: "E-mail",
    campoWhatsapp: "WhatsApp *",
    campoTipo: "Que tipo de site você procura?",
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

  /* A PÁGINA DE ENDEREÇO QUE NÃO EXISTE, escrita em 09/09/2026.
     Até aqui quem errava o endereço, ou clicava num link antigo que a gente
     mandou meses atrás, recebia nove bytes de texto puro: "Not Found", sem
     marca, sem idioma e sem caminho de volta. Quem vê essa tela é justamente
     quem já tinha interesse suficiente para clicar.
     O texto é curto de propósito: ninguém lê parágrafo em página de erro. */
  erro: {
    metaTitulo: "Página não encontrada",
    metaDescricao: "O endereço não existe neste site. Volte para a página inicial da Varanda Estúdio Web.",
    rotulo: "Endereço não encontrado",
    titulo: "Esta página não existe.",
    texto:
      "O endereço que você abriu não está aqui. Pode ser um link antigo, ou um endereço com um caractere a mais. Volte para o começo e siga daí.",
    voltar: "Voltar para o início",
  },

  privacidade: {
    kicker: "Informação e transparência",
    titulo: "Política de Privacidade",
    /* A data da versão, escrita à mão nos três idiomas. Tem que ser a data em
       que o texto vai ao ar, não a data em que foi escrito: se a publicação
       escorregar, as três mudam juntas. */
    atualizacao: "Última atualização: 25 de setembro de 2026.",
    voltar: "← Voltar ao site",
    voltarAria: "Voltar para a página inicial da Varanda Estúdio Web",
    /* Nove seções, na mesma ordem nos três idiomas. Cada uma é um parágrafo só,
       porque `politica.tsx` desenha `texto` num `<p>` e cola o e-mail no fim da
       PRIMEIRA: por isso a seção 1 termina em "escreva para", e a 8 manda os
       pedidos para "o e-mail da seção 1" em vez de repetir o endereço.

       O texto nasceu da revisão de LGPD do questionário de projeto, com duas
       correções: o banco foi medido nos Estados Unidos (região ENAM),
       e a frase sobre treino de inteligência artificial entrou no fim da seção
       5, nos três idiomas, depois de conferido em 25/09/2026 que o uso
       das conversas para treino está desligado na conta (ESPEC 3.5); se isso
       mudar, a frase sai no mesmo dia, nos três idiomas. Cada afirmação aqui
       tem que continuar verdadeira sobre o sistema. Antes do primeiro envio o
       estúdio vê a abertura do link, o último salvamento e a etapa em que o
       rascunho parou (o painel e o /briefing usam isso para a cobrança), e as
       respostas só depois do envio: se o painel passar a mostrar o conteúdo
       do rascunho, a seção 3 muda. "Fica só enquanto a aba estiver aberta" só
       vale enquanto a cópia do rascunho for `sessionStorage`. E a seção 5
       conta o Web Analytics da Cloudflare, que o Worker deixa passar de
       propósito também na página do questionário. Mudou o sistema, muda
       aqui. */
    secoes: [
      {
        titulo: "1. Quem trata os dados",
        texto:
          "Varanda Estúdio Web é o nome comercial sob o qual Lucca Oliveira, pessoa física, presta serviços. Ele é o responsável pelos dados recebidos por este site: os do formulário de contato e os do questionário de projeto, que quem contrata um site recebe por um link próprio. Para qualquer assunto de privacidade, escreva para",
      },
      {
        titulo: "2. O formulário de contato",
        texto:
          "O formulário de contato pede nome, nome do negócio, e-mail, WhatsApp, tipo de site e uma descrição do projeto. Ao selecionar “Continuar no WhatsApp”, o site monta uma mensagem com essas informações e abre o aplicativo. Este formulário não grava nada em banco de dados: a mensagem só chega à Varanda se você enviar pelo WhatsApp, que a trata pelas regras dele. Os dados servem para responder ao contato e preparar uma proposta.",
      },
      {
        titulo: "3. O questionário de projeto",
        /* Vira `id` da `<section>`. O formulário do questionário aponta para
           `/privacidade#questionario`, `/es/privacidad#questionario` e
           `/en/privacy#questionario`: o id é o mesmo nos três idiomas para o
           link ser montado do mesmo jeito. Não traduzir. */
        ancora: "questionario",
        texto:
          "Depois de pagar a entrada, quem contratou um site recebe um link só seu para responder o questionário de projeto, que é o ponto de partida do site. Ele pede dados da empresa, os contatos que vão aparecer no site, o nome de quem aprova o projeto e informações sobre fotos, textos, domínio e prazo. Às vezes uma resposta traz dado de outra pessoa, como o nome de quem deu um depoimento. Ao contrário do formulário de contato, o questionário grava: o que você escreve é salvo sozinho enquanto você preenche, mesmo antes de enviar. Antes do primeiro envio, a Varanda vê quando o link foi aberto, quando algo foi salvo pela última vez e em que etapa o preenchimento parou, para saber a hora de oferecer ajuda. As respostas em si, ela só lê depois do envio. Quem tiver o link consegue ver e alterar as respostas, então mande só para quem for ajudar a preencher. Nunca escreva senha nele.",
      },
      {
        titulo: "4. Para que servem as respostas",
        texto:
          "As respostas servem para fazer o site contratado. Elas viram a ficha do projeto, que guia a estrutura, o desenho, os textos e a publicação. Não são usadas em propaganda e não entram em outro projeto. Para quem contratou em nome próprio, a base legal é a execução do contrato (Lei 13.709/2018, art. 7º, inciso V). Para quem responde em nome de uma empresa, e para toda pessoa citada nas respostas, a base é o legítimo interesse de fazer o site que a empresa pediu (art. 7º, inciso IX), e só entra o necessário para isso.",
      },
      {
        titulo: "5. Onde os dados ficam",
        texto:
          "As respostas ficam no sistema interno da Varanda, um banco de dados na Cloudflare. Para ler as respostas e montar a ficha do projeto, a Varanda usa o Claude, um assistente de inteligência artificial da Anthropic. A ficha e os arquivos de trabalho ficam no OneDrive, da Microsoft. As três empresas guardam ou processam os dados fora do Brasil, nos Estados Unidos. Essa transferência é necessária para cumprir o contrato (art. 33, inciso IX). A conta da Varanda na Anthropic está configurada para que as conversas não sejam usadas para treinar inteligência artificial. O site conta visitas com o Web Analytics da Cloudflare, sem cookie: ele registra a página aberta, sem a chave do link, de onde a pessoa veio, o país e o tipo de aparelho.",
      },
      {
        titulo: "6. Por quanto tempo",
        texto:
          "A Varanda não vende dados pessoais. As mensagens do formulário de contato ficam no histórico do WhatsApp ou do e-mail pelo tempo do atendimento, e depois só pelo necessário para cumprir obrigações ou defender direitos. As respostas do questionário ficam guardadas enquanto o site é feito e durante os 30 dias de garantia depois da publicação. Em até 60 dias depois do fim da garantia, elas são apagadas do sistema e dos arquivos de trabalho. Se o contrato terminar antes da publicação, os 60 dias contam do fim do contrato. As cópias de segurança guardam o que foi apagado por até 90 dias, e depois são descartadas. O que vira conteúdo do site, como textos e fotos aprovados, passa a fazer parte do site, que é da empresa. Nome, e-mail e telefone de quem contratou ficam com o contrato e os recibos por cinco anos, contados do fim do ano do último pagamento, que é o prazo das obrigações fiscais.",
      },
      {
        titulo: "7. O rascunho no seu aparelho",
        texto:
          "Se uma gravação falhar enquanto você preenche o questionário, por exemplo porque a conexão caiu, o navegador guarda no próprio aparelho uma cópia do que ainda não chegou à Varanda, para nada se perder. Essa cópia fica só enquanto a aba estiver aberta e é apagada assim que a Varanda confirma o recebimento. Ela não é cookie e não é usada para acompanhar a sua navegação.",
      },
      {
        titulo: "8. Seus direitos",
        texto:
          "Você pode pedir para saber quais dados seus a Varanda tem, receber uma cópia, corrigir o que estiver errado, se opor a um uso e pedir que seja apagado o que não for mais necessário. Enquanto o link do questionário estiver aberto, dá para ver e corrigir as respostas nele mesmo. Os pedidos vão para o e-mail da seção 1 e recebem resposta em até 15 dias. Se um dado ainda for necessário para terminar o site ou cumprir o contrato, a resposta diz qual e até quando ele fica. Quem foi citado nas respostas, como o autor de um depoimento, tem os mesmos direitos e pode escrever para o mesmo e-mail. Você também pode reclamar à Autoridade Nacional de Proteção de Dados (ANPD).",
      },
      {
        titulo: "9. Atualizações",
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
