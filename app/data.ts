/**
 * Conteudo da pagina unica.
 *
 * Ficava no topo de `page.tsx` — 199 linhas de texto antes da primeira
 * linha de codigo. Sai daqui sem passar por nenhum componente: quem edita
 * preco, servico ou pergunta mexe so neste arquivo.
 *
 * Reestruturado em 2026-08-10. O que mudou e por que, em `CLAUDE.md`.
 */

export const whatsappUrl = "https://wa.me/5511942263007";

/* Uma data, um lugar. Enquanto era "os cinco primeiros projetos" sem prazo
   nem contador, a condicao nao criava urgencia (ninguem consegue verificar)
   e nunca terminava — o "valor regular" jamais entrava em vigor. */
export const launchDeadline = "30 de setembro de 2026";

/* O termo aparecia nos pacotes sem definicao. Sem uma lista fechada, cada
   cliente supoe uma coisa diferente e a entrega vira o que ele supos. */
export const standardIntegrations =
  "formulário de contato que chega no seu e-mail e no seu WhatsApp, medição de visitas, mapa e links das suas redes";

/* Os mesmos tres nomes dos pacotes. Antes esta secao vendia "Site
   institucional / Landing page / Pagina profissional" e a secao de preco
   vendia "Essencial / Negocio / Profissional": dois vocabularios para os
   mesmos produtos, sem traducao entre eles. Quem procurava landing page nao
   sabia qual coluna olhar. */
export const services = [
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
    text: "Quando o site precisa fazer mais do que apresentar — outro idioma, catálogo com filtros, conteúdo que você mesmo atualiza ou integração com o sistema que já usa.",
  },
];

export const process = [
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
];

/* Garantias da casa, declaradas uma vez.
 *
 * Antes viviam dentro da lista de cada pacote e por isso pareciam variar de
 * um para o outro: "direcao visual personalizada" so aparecia no mais caro
 * (dizendo, na pratica, que os outros dois eram modelo pronto) e
 * acessibilidade sumia justamente no Profissional. Sao coisas que valem
 * para os tres — entao ficam fora dos tres.
 *
 * Toda afirmacao aqui e verificavel: a acessibilidade foi medida com
 * axe-core em 56 paginas, a publicacao e em rede distribuida, e a
 * propriedade das contas ja e como os projetos sao entregues. */
export const included = [
  {
    title: "Direção visual autoral",
    text: "Cada projeto é desenhado do zero. Nenhum pacote usa modelo pronto.",
  },
  {
    title: "Acessível de verdade",
    text: "Contraste, navegação por teclado e leitor de tela verificados com ferramenta, não no olho.",
  },
  {
    title: "Rápido em qualquer celular",
    text: "Publicado em rede distribuída, com imagens e fontes otimizadas.",
  },
  {
    title: "Publicação e domínio configurados",
    text: "Deixamos o site no ar, com endereço e certificado funcionando.",
  },
  {
    title: "Garantia de 30 dias",
    text: "Defeito de funcionamento depois da publicação é corrigido sem custo.",
  },
  {
    title: "O site é seu",
    text: "Domínio, contas e código ficam no nome da sua empresa desde o primeiro dia.",
  },
];

/* A escada deixou de ser contada em paginas.
 *
 * Antes era 1 -> 3 -> 5 paginas, e ainda trocava de unidade no meio ("1
 * pagina com ate 5 secoes" contra "ate 3 paginas"), o que impedia comparar
 * as colunas. Pagina tambem nao e o que custa: um one-pager autoral da mais
 * trabalho que cinco paginas mornas. O Profissional passou a ser diferente
 * em natureza — e o unico que ganha uma capacidade nova — e nao em
 * quantidade. O limite de escopo continua existindo, mas como limite, nao
 * como beneficio de vitrine. */
export const packages = [
  {
    name: "Essencial",
    eyebrow: "Para começar",
    launch: "1.500",
    future: "1.900",
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
    launch: "3.200",
    future: "3.900",
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
    launch: "5.900",
    future: "7.400",
    description: "Tudo do Negócio, mais uma capacidade que o seu projeto exige — escolhida junto com você.",
    items: [
      "Tudo do pacote Negócio",
      "Uma capacidade à escolha: outro idioma, catálogo com filtros, conteúdo gerenciável ou integração com sistema",
      "SEO técnico e dados estruturados",
      "2 rodadas de ajustes",
      "Primeiro mês do plano Presença incluído",
    ],
  },
];

/* Manutencao reconstruida: o produto e "estar cuidado", nao um saldo de
 * minutos.
 *
 * A tabela anterior tinha uma inversao que qualquer cliente encontraria com
 * uma divisao: o plano mais barato saia a R$ 178/hora (R$ 89 por 30 min)
 * contra R$ 160/hora da manutencao avulsa. Assinar era pior que nao
 * assinar, e o unico "beneficio" era o pior prazo de resposta da tabela.
 * Alem disso, vender minutos que nao acumulam faz o cliente pagar todo mes
 * para ver saldo evaporar — o que gera cancelamento, nao recorrencia.
 *
 * Agora a base e tecnica (nao usar e bom sinal) e a hora dentro do plano e
 * sempre mais barata que a avulsa: R$ 200 no Presenca e R$ 167 no
 * Prioridade, contra R$ 220 avulsos. */
export const maintenance = [
  {
    name: "Cuidado",
    price: "149",
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
    price: "349",
    featured: true,
    summary: "O conteúdo acompanhando o negócio.",
    items: [
      "Tudo do plano Cuidado",
      "Até 1 hora por mês de alterações de conteúdo",
      "Retorno em até 2 dias úteis",
    ],
  },
  {
    name: "Prioridade",
    price: "649",
    summary: "Para quem mexe no site com frequência.",
    items: [
      "Tudo do plano Presença",
      "Até 3 horas por mês de alterações",
      "Retorno no mesmo dia útil",
    ],
  },
];

export const extras = [
  { name: "Página adicional", price: "R$ 480" },
  { name: "Redação completa", price: "R$ 280/página" },
  { name: "Integração além das padrão", price: "a partir de R$ 480" },
  { name: "Rodada adicional de ajustes", price: "R$ 390" },
  { name: "Manutenção avulsa", price: "R$ 220/hora" },
];

/* Sairam da lista de preco fixo.
 *
 * "Blog ou CMS a partir de R$ 490" e "idioma adicional a partir de R$ 350"
 * eram convite a prejuizo: o cliente ancora no numero de baixo e o trabalho
 * real (modelagem de conteudo, autenticacao, treinamento, suporte eterno;
 * ou traducao, rotas, hreflang e teste em tres idiomas) nao cabe nele. O
 * proprio FAQ ja mandava loja e sistema para orcamento separado — estes
 * pertencem a mesma categoria. */
export const byQuote = [
  "Loja virtual e pagamentos",
  "Área de acesso, agendamento ou sistema",
  "Blog ou painel de conteúdo",
  "Idiomas adicionais",
];

export const projects = [
  {
    name: "Brasa do Vale",
    label: "Projeto conceitual · Gastronomia",
    description:
      "Um site acolhedor e direto para uma churrascaria, com foco no cardápio, nos diferenciais da casa e no contato rápido pelo WhatsApp.",
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
      "Todo projeto tem 30 dias de garantia: defeito de funcionamento é corrigido sem custo. Depois desse prazo, correções entram por manutenção avulsa ou por plano mensal — que também monitora o site e avisa antes de você perceber.",
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
      "Sim. Alterações pontuais entram por manutenção avulsa ou pelo plano mensal. Páginas novas, funcionalidades e mudanças de escopo recebem orçamento próprio antes da execução — nunca durante.",
  },
  {
    question: "Vocês fazem loja virtual ou sistemas?",
    answer:
      "Sim, mediante análise técnica. Pagamentos, agendamento em tempo real, área de acesso, banco de dados e automações são planejados e orçados separadamente, porque o esforço varia demais para caber em um preço de tabela.",
  },
];
