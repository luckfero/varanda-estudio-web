import type { Dicionario } from "./index";

/**
 * Diccionario español.
 *
 * Español peninsular, tratamiento de tú — es lo habitual en la web comercial
 * española y encaja con el tono cercano del original.
 *
 * Los precios **no son una conversión** de la tabla en reales: están anclados
 * en el mercado catalán (landing 500–1.500 €, corporativa freelance
 * 600–2.500 €, microagencia 1.800–5.000 €).
 * Convertir la tabla brasileña daría unos 250 €, por debajo del suelo de
 * credibilidad de ese mercado, donde menos de 600–700 € no se lee como barato
 * sino como arriesgado.
 *
 * Ese suelo es el límite de la bajada de 2026-08-10: el paquete de entrada
 * quedó en 790 €, deliberadamente por encima de los 700 €. Bajarlo más no
 * haría la oferta más competitiva — la haría sospechosa, que es justo lo
 * contrario de lo que se buscaba.
 */

const es: Dicionario = {
  code: "es-ES",
  htmlLang: "es",
  ogLocale: "es_ES",
  path: "/es",
  privacyPath: "/es/privacidad",
  nome: "Español",

  moeda: "€",
  /* En español el símbolo va **después** del número (1.590 €). El marcado de
     `.price` asumía siempre delante; ahora lo decide el diccionario. */
  moedaAposValor: true,

  meta: {
    title: "Varanda Estúdio Web | Diseño y desarrollo de webs profesionales",
    description:
      "Estudio de diseño y desarrollo web. Estrategia, dirección visual propia y desarrollo para negocios que quieren una presencia digital clara y fiable.",
    ogDescription: "Webs que dan espacio para que tu negocio crezca.",
    privacyTitle: "Política de Privacidad",
    privacyDescription:
      "Cómo trata Varanda Estúdio Web los datos del formulario de contacto y del cuestionario de quien contrata una web.",
    /* Ver la nota en `pt.ts`: solo las usa el JSON-LD. */
    areaAtendida: "Brasil, Europa y América del Norte",
    servicos: ["Diseño de webs", "Web corporativa", "Desarrollo web"],
  },

  nav: {
    pular: "Saltar al contenido",
    flutuante: "Hablar por WhatsApp",
    inicio: "inicio",
    servicos: "Servicios",
    portfolio: "Proyectos",
    processo: "Proceso",
    investimento: "Inversión",
    sobre: "Estudio",
    contato: "Hablemos",
    abrirMenu: "Abrir menú",
    fecharMenu: "Cerrar menú",
    navegacao: "Navegación principal",
    idioma: "Idioma",
  },

  hero: {
    kicker: "Estudio de diseño y desarrollo web",
    tituloAntes: "Webs que dan ",
    tituloDestaque: "espacio",
    tituloDepois: " para que tu negocio crezca.",
    lead: "Contenido claro, imagen profesional y tecnología sin complicaciones para convertir buenas ideas en una presencia digital fiable.",
    ctaPrimario: "Cuéntanos tu proyecto",
    local: "São Paulo, Brasil",
    atendimento: "Trabajamos en remoto",
    arteAlt: "Composición visual de una web en desarrollo",
    navegadorEndereco: "tunegocio.com",
    navegadorMarca: "tu negocio",
    navegadorTitulo: "Presencia para que<br />te recuerden.",
    navegadorBotao: "saber más",
    notaTopo: "claridad",
    notaTopoForte: "antes que nada",
    notaBaixo: "hecho con",
    notaBaixoForte: "intención.",
  },

  intro: {
    indice: "Nuestra mirada",
    titulo: "Tiene que tener sentido para quien llega y para quien lleva el negocio.",
    coluna1: "Varanda acerca los negocios a lo digital con comunicación clara, un proceso transparente y decisiones pensadas para la realidad de cada cliente.",
    coluna2: "Cada proyecto reúne estrategia, contenido y desarrollo para entregar una web bonita, útil y fácil de navegar.",
  },

  servicos: {
    indice: "Qué hacemos",
    titulo: "El formato adecuado para tu momento.",
    resumo: "Tres formatos, del más directo al más completo. El botón de cada uno lleva a lo que incluye y a la inversión.",
    verPlano: "Ver qué incluye cada uno",
    nota: "¿Necesitas tienda online, reservas, área privada o automatizaciones?",
    notaLink: "Lo valoramos juntos",
    lista: [
      {
        number: "01",
        title: "Esencial",
        text: "Una página que presenta el negocio, explica lo que haces y abre conversación con quien llega.",
      },
      {
        number: "02",
        title: "Negocio",
        text: "La web completa: servicios, trabajos, dudas y contacto, con el contenido organizado tal como lo busca el cliente.",
      },
      {
        number: "03",
        title: "Profesional",
        text: "Cuando la web tiene que hacer más que presentar: otro idioma, catálogo con filtros, contenido que actualizas tú mismo o integración con el sistema que ya usas.",
      },
    ],
  },

  portfolio: {
    indice: "Trabajos realizados",
    tituloAntes: "Ideas tomando",
    tituloDestaque: "forma y presencia.",

    /* Se llama "En línea" y no "Clientes" a propósito: uno de los dos es un
       inmueble del propio estudio, y llamarlo cliente insinuaría una relación
       que no existe. */
    noArIndice: "En línea",
    conceitualSelo: "Conceptual",
    depoimentoIndice: "Quien ya recibió su sitio",
    ctaTexto: "Cuéntanos qué necesita tu negocio y respondemos con el siguiente paso.",
    ctaBotao: "Quiero un sitio así",
    estudosNota: "Sin cliente, sin dirección en línea.",
    estudosIndice: "Estudios conceptuales",
    noArNota: "Webs publicadas, con dirección abierta para que cualquiera las visite.",
    visitar: "Visitar la web de ",
    visitarDepois: " en una pestaña nueva",

    aviso: "Tres sectores, tres problemas distintos, elegidos para mostrar dirección visual y desarrollo. Las empresas, los textos y los datos son ficticios.",

    /* Emparejado por índice con `featuredAssets` en `app/data.ts`. */
    destaques: [
      {
        name: "Casa Conexão",
        label: "Salas de consulta · São Bernardo do Campo",
        description:
          "Una casa que alquila salas para profesionales autónomos: psicólogos, abogados, doulas, contables. La web presenta el espacio, muestra quién trabaja allí y lleva la conversación directa a WhatsApp.",
        features: ["Dirección visual", "Ilustración propia", "Galería interactiva", "Página por profesional"],
        imageAlt: "Marca de Casa Conexão, dos círculos que se cruzan, sobre el verde de su identidad",
      },
      {
        name: "Milênio",
        label: "Grupo de rap · Álbum YinYang",
        description:
          "Tres voces, casi diez años de camino y el primer álbum en marcha. La web presenta al grupo, el disco y el cortometraje, con la alternancia entre negro y blanco como columna de la narración.",
        features: ["Dirección visual", "Tratamiento de imagen", "Tipografía", "Desarrollo sin dependencias"],
        imageAlt: "Marca de Milênio, un ojo dibujado a trazo, sobre el verde de su identidad",
      },
    ],
    abrirAntes: "Abrir la demo del proyecto ",
    abrirDepois: " en una pestaña nueva",
    /* La orden está emparejada por índice con `projectAssets` en
       `app/data.ts`, donde está explicada. Cambiarla aquí sin cambiarla allí,
       o sin cambiar los otros dos idiomas, intercambia imagen y enlace. */
    projetos: [
      {
        name: "Nívora Construções",
        label: "Construcción",
        description:
          "Una web institucional trilingüe para una constructora contemporánea, con portfolio de obras, servicios, proceso constructivo y prediagnóstico de presupuesto en una experiencia visual técnica e inmersiva.",
        features: ["Estrategia trilingüe", "Arquitectura de la información", "Dirección visual", "Desarrollo responsive"],
        imageAlt: "Marca de Nívora Construções, una N de línea continua, sobre el cobre de su identidad",
      },
      {
        name: "Nascente",
        label: "Perfumería",
        description:
          "Una perfumería de autor con catálogo filtrable por colección e intensidad, guía olfativa por pasos y flujo de compra completo, del descubrimiento de la fragancia a la confirmación del pedido.",
        features: ["Identidad visual", "Catálogo y filtros", "Guía olfativa", "Flujo de compra"],
        imageAlt: "Marca de Nascente, media rodaja de cítrico, sobre el marrón oscuro de su identidad",
      },
      {
        name: "Brasa do Vale",
        label: "Restauración",
        description:
          "Una web acogedora y directa para un asador, centrada en la carta, en lo que distingue a la casa y en el contacto rápido por WhatsApp.",
        features: ["Estrategia de contenido", "Dirección visual", "Diseño responsive", "Desarrollo"],
        imageAlt: "Marca de Brasa do Vale, un pincho con tres cortes, sobre el vino de su identidad",
      },
    ],
  },

  processo: {
    indice: "Cómo funciona",
    titulo: "Un camino claro, del primer “hola” a la publicación.",
    resumo: "Sigues las decisiones, apruebas cada etapa y sabes qué esperar hasta la publicación.",
    etapas: [
      {
        step: "01",
        title: "Conversación y briefing",
        text: "Entendemos el negocio, el público y qué tiene que resolver la web. A partir de ahí organizamos la información esencial.",
      },
      {
        step: "02",
        title: "Dirección y contenido",
        text: "Definimos la estructura de las páginas, el lenguaje y la dirección visual antes de escribir la primera línea de código.",
      },
      {
        step: "03",
        title: "Creación y ajustes",
        text: "Desarrollamos la web, presentamos el resultado ya publicado y aplicamos las rondas de ajustes incluidas en el paquete.",
      },
      {
        step: "04",
        title: "Publicación y entrega",
        text: "Con la aprobación final publicamos y entregamos los accesos.",
      },
    ],
  },

  investimento: {
    indice: "Inversión",
    titulo: "Empieza por lo que tu negocio necesita hoy.",
    /* Era a condição de lançamento com data de validade ("até 30 de setembro
       de 2026"). Ela venceria em 36 dias em três idiomas, e site que anuncia
       condição vencida é pior que site sem condição nenhuma. A comparação com
       o "valor regular" saiu junto, por decisão do dono em 25/08/2026: o preço
       publicado passa a ser o preço que se cobra, sem segunda coluna. */
    resumo: "El precio se cierra antes de empezar, junto con el alcance por escrito. Nada se cobra durante el proyecto sin haberse acordado antes.",
    porProjeto: "por proyecto",
    /* O rótulo do prazo, que até 08/09/2026 nenhum componente lia. Agora ele
       é o rótulo do cartão, e `comparacao.linhas[1]` é o mesmo texto na
       tabela: o porquê está escrito em `pt.ts`, que é o contrato. */
    entregaRotulo: "Plazo de entrega",
    /* A contagem do prazo, uma vez só para a seção inteira. A regra é a de
       `comercial/oferta/politicas.md` e vale igual nos três idiomas: prazo
       não é desconto, é informação, e quem compra de fora usa o mesmo
       critério de quem compra daqui. */
    prazoNota: "Todo plazo cuenta desde la recepción de todos los materiales y accesos, y de su aprobación.",
    /* Prazo e pagamento não existiam na página: nenhuma das duas perguntas
       que todo cliente faz tinha resposta antes de ele precisar perguntar.
       O 50/50 vem de `comercial/oferta/politicas.md`, que é a fonte.
       O CARTÃO ENTROU EM 08/09/2026 COM O ACRÉSCIMO DITO, e aqui ele vai sem
       porcentagem: os 15% aprovados valem para o cartão no Brasil, e a
       spec não definiu acréscimo para euro. Prometer "sin intereses" está
       fora em qualquer idioma. */
    pagamento: "Pago en dos partes: 50% para empezar y 50% en la aprobación final, antes de publicar. Transferencia bancaria. Para quien necesite repartirlo, la tarjeta de crédito llega hasta 12 plazos, con un recargo sobre el importe al contado.",
    incluiNoPlano: "Qué incluye",
    cta: "Quiero este plan",
    incluidoTitulo: "En todos los paquetes, sin coste aparte",
    escopoIncluidoTitulo: "Integraciones incluidas en todos los paquetes",
    escopoIncluido: [
      "Formulario de contacto que llega a tu correo y a tu WhatsApp",
      "Medición de visitas y origen del tráfico",
      "Mapa y localización",
      "Enlaces a tus redes sociales",
      "Botón de WhatsApp en todas las páginas",
    ],
    escopoOrcamentoTitulo: "También desarrollamos, con presupuesto propio",
    escopoOrcamento: [
      "Pago online y suscripción recurrente",
      "Tienda online completa",
      "Reservas y cita previa",
      "Área privada para clientes",
      "Automatizaciones a medida",
      "La segunda capacidad, cuando el proyecto pida más de una",
    ],
    nota: "Cada ronda de ajustes debe llegar en una lista consolidada. Cualquier necesidad fuera del paquete se comunica y se presupuesta antes de empezar, nunca durante.",
    /* A TABELA COMPARÁVEL, espelho de `comparacao` no português. Nada aqui
       é dado comercial: o valor de cada célula continua saindo de
       `pacotes[].items`, `launch` e `entrega`. O que mora nesta chave é só o
       andaime da tabela.

       `linhas` é POSICIONAL, na mesma ordem da constante `COMPARACAO` de
       `app/section-oferta.tsx`. Aqui a posição É o significado: tirar,
       acrescentar ou trocar de lugar um item desloca todos os rótulos
       abaixo dele e cola o nome de uma dimensão nos valores de outra, em
       silêncio e em um idioma só.

       Os rótulos foram traduzidos curtos de propósito. Abaixo de 900px cada
       um vira o cabeçalho de um cartão, e o espanhol cresce de 15 a 20%
       sobre o português: "Tratamiento de los textos" já é o mais longo dos
       dez e cabe em uma linha a 360px.

       `incluido` e `naoIncluido` são as duas palavras que a marca gráfica
       carrega em `.so-leitor`, porque o sinal de presente e o de ausente, sozinhos, não dizem nada a
       quem ouve a página. Abaixo de 900px elas saem do `.so-leitor` e viram
       texto visível ao lado do sinal. */
    comparacao: {
      legenda: "Comparación de los tres paquetes, línea a línea: inversión, plazo y lo que cambia en el alcance de uno a otro.",
      linhas: [
        "Inversión",
        /* Mesmo texto de `entregaRotulo` acima. */
        "Plazo de entrega",
        "Páginas o secciones",
        "Tratamiento de los textos",
        "Galería y contenido",
        "Integraciones",
        "Capacidad a elegir",
        "SEO y datos estructurados",
        "Rondas de ajustes",
      ],
      incluido: "Incluido",
      naoIncluido: "No incluido",
    },
    pacotes: [
      {
        name: "Esencial",
        eyebrow: "Para empezar",
        launch: "790",
        entrega: "Hasta 7 días laborables",
        featured: false,
        description: "Una página para presentar lo esencial del negocio y abrir conversación con quien llega.",
        items: [
          "Una página, con las secciones que tu negocio pida",
          "Textos ajustados a partir del material que ya tienes",
          "Formulario de contacto y botón de WhatsApp",
          "1 ronda de ajustes",
        ],
      },
      {
        name: "Negocio",
        eyebrow: "Recomendado",
        launch: "1.590",
        entrega: "Hasta 15 días laborables",
        featured: true,
        description: "La web completa de tu negocio, con espacio para explicar, mostrar trabajos y resolver dudas.",
        items: [
          "Web completa, hasta 6 páginas o secciones",
          "Organización y redacción de los textos principales",
          "Galería de trabajos, servicios y preguntas frecuentes",
          "Integraciones estándar configuradas",
          "2 rondas de ajustes",
        ],
      },
      {
        name: "Profesional",
        eyebrow: "Para crecer",
        launch: "2.900",
        entrega: "Se define en la propuesta, según la capacidad elegida",
        featured: false,
        description: "Todo lo de Negocio, más una capacidad que tu proyecto necesite, elegida contigo.",
        items: [
          "Todo el paquete Negocio",
          "Una capacidad a elegir: otro idioma, catálogo con filtros, un panel para que tú mismo cambies textos y fotos, o conexión con un sistema que ya usas",
          "La web preparada para la búsqueda: ajustes técnicos y los datos del negocio en el formato que lee Google",
          "2 rondas de ajustes",
        ],
      },
    ],
    incluido: [
      { icone: "direcao", title: "Dirección visual propia", text: "Cada proyecto se diseña desde cero. Ningún paquete usa plantilla." },
      { icone: "acessivel", title: "Accesible de verdad", text: "Contraste, navegación por teclado y lector de pantalla verificados con herramienta, no a ojo." },
      { icone: "rapido", title: "Rápida en cualquier móvil", text: "Publicada en red distribuida, con imágenes y tipografías optimizadas." },
      { icone: "publicacao", title: "Publicación y dominio configurados", text: "Dejamos la web publicada, con dirección y certificado funcionando." },
      { icone: "garantia", title: "Garantía de 30 días", text: "Cualquier fallo de funcionamiento tras la publicación se corrige sin coste." },
      { icone: "dono", title: "La web es tuya", text: "Dominio, cuentas y código quedan a nombre de tu empresa desde el primer día." },
    ],
  },

  sobre: {
    indice: "Quién está en Varanda",
    titulo: "La buena tecnología es la que acerca, no la que complica.",
    paragrafo1: "Varanda Estúdio Web existe para ayudar a comercios, profesionales y empresas a construir una presencia digital clara, profesional y fiable.",
    paragrafo2: "Cada proyecto se acompaña de cerca, desde la organización de las ideas hasta el desarrollo, con conversación franca, proceso documentado y atención al detalle. Pocos proyectos a la vez, y ninguno tratado como encargo en serie.",
    assinatura: "Varanda Estúdio Web",
    assinaturaLocal: "São Paulo, Brasil",
  },

  extras: {
    indice: "A medida",
    titulo: "¿Qué más puede necesitar tu proyecto?",
    resumo: "Estos servicios se pueden añadir cuando no estén incluidos en el paquete elegido.",
    nota: "Los precios de arriba no incluyen los costes que cobran el dominio, el alojamiento o las herramientas externas. Una entrega en menos plazo del acordado, o trabajo en fin de semana y festivo, tiene un recargo del 30% y depende de disponibilidad.",
    /**
     * O REPARO TAMBÉM NÃO EXISTE EM ESPANHOL, e pelo mesmo mecanismo:
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
    pedir: "Hablar de ",
    lista: [
      { arte: "pagina", name: "Página adicional", prefixo: "", valor: "250 €", unidade: "", descricao: "Una página más de las que incluye el paquete, diseñada con el mismo criterio que el resto de la web." },
      { arte: "redacao", name: "Redacción completa", prefixo: "", valor: "150 €", unidade: "por página", descricao: "Los textos de la página escritos desde cero, no solo ajustados a partir del material que ya tienes." },
      { arte: "integracao", name: "Integración fuera de las estándar", prefixo: "desde", valor: "250 €", unidade: "", descricao: "Conexión de la web con un sistema que no está entre las integraciones estándar, como el CRM que ya usa tu empresa. El precio final se cierra después de valorar el sistema." },
      { arte: "rodada", name: "Ronda adicional de ajustes", prefixo: "", valor: "199 €", unidade: "", descricao: "Una vuelta más de ajustes además de las que incluye el paquete, con los cambios reunidos en una sola lista." },
      { arte: "avulsa", name: "Cambios sueltos", prefixo: "", valor: "59 €", unidade: "por hora", descricao: "Un cambio puntual en la web ya publicada, cobrado por el tiempo empleado, en bloques de 30 minutos." },
    ],
  },

  faq: {
    fechamentoTitulo: "¿Quedó alguna duda fuera?",
    fechamentoTexto: "Pregunta directamente. Respondemos con la orientación para tu caso, sin compromiso de contratar.",
    fechamentoBotao: "Hacer una pregunta",
    indice: "Preguntas frecuentes",
    titulo: "Antes de empezar, conviene saber.",
    perguntas: [
      {
        question: "¿En cuánto tiempo estará lista mi web?",
        answer:
          "Depende del paquete y, sobre todo, de cuándo llegue el contenido. Una página está lista en pocos días después de aprobar el material; una web completa lleva más. El plazo de tu proyecto entra en la propuesta antes de empezar y cuenta desde la recepción de los materiales.",
      },
      {
        question: "¿Necesito tener los textos y las fotos listos?",
        answer:
          "No. Organizamos y ajustamos el contenido a partir de lo que ya tienes e indicamos lo que aún falta producir. La redacción completa desde cero y la producción de imágenes se contratan aparte, con el precio comunicado antes.",
      },
      {
        question: "¿Y si algo falla después de publicar?",
        answer:
          "Todo proyecto tiene 30 días de garantía: cualquier fallo de funcionamiento se corrige sin coste. Pasado ese plazo, las correcciones entran como cambio suelto, cobrado por el tiempo empleado.",
      },
      {
        question: "¿De quién es la web una vez terminada?",
        answer:
          "Tuya. Dominio, alojamiento, cuentas y código quedan registrados a nombre de tu empresa, y los accesos se entregan al publicar. Ningún proyecto depende de nosotros para seguir existiendo.",
      },
      {
        question: "¿El dominio y el alojamiento están incluidos?",
        answer:
          "La configuración está incluida en todos los paquetes. El coste que cobran el registrador, el alojamiento y las herramientas externas lo pagas directamente tú, siempre en cuentas a tu nombre.",
      },
      {
        question: "¿Puedo pedir cambios después de publicar?",
        answer:
          "Sí. Los cambios puntuales entran como cambio suelto, cobrado por hora. Páginas nuevas, funcionalidades y cambios de alcance reciben presupuesto propio antes de ejecutarse, nunca durante.",
      },
      {
        question: "Estáis en Brasil. ¿Trabajáis con empresas en España?",
        answer:
          "Sí. El trabajo es remoto y ya se hace así; atendemos en español, portugués e inglés, y los importes se acuerdan en euros. La diferencia horaria con España es de cuatro a cinco horas, lo que deja toda la mañana europea en común.",
      },
      {
        question: "¿Hacéis tienda online o sistemas?",
        answer:
          "Sí, previo análisis técnico. Pagos, reservas en tiempo real, área privada, bases de datos y automatizaciones se planifican y presupuestan por separado, porque el esfuerzo varía demasiado para caber en un precio de tarifa.",
      },
    ],
  },

  contato: {
    indice: "Hablemos",
    tituloAntes: "Tu negocio merece un lugar donde ",
    tituloDestaque: "crecer.",
    resumo: "Cuéntanos qué necesita tu negocio y en qué momento está. Analizamos la información y respondemos con la orientación para el siguiente paso.",
    emailLabel: "Correo",
    whatsappLabel: "WhatsApp",
    whatsappAria: "Hablar con Varanda por WhatsApp en una pestaña nueva",
    whatsappMensagem: "¡Hola! Vengo desde la web de Varanda Estúdio Web y me gustaría hablar sobre un proyecto.",
    formSaudacao: "¡Hola! Vengo desde la web de Varanda Estúdio Web.",
    opcional: "opcional",
    campoNome: "Tu nombre *",
    campoNomePlaceholder: "¿Cómo prefieres que te llamemos?",
    campoNegocio: "Nombre del negocio",
    campoNegocioPlaceholder: "Nombre de la empresa o del proyecto",
    campoEmail: "Correo electrónico",
    campoWhatsapp: "WhatsApp *",
    campoTipo: "¿Qué tipo de web buscas?",
    campoTipoPlaceholder: "Selecciona una opción",
    campoResumo: "Cuéntanos el proyecto *",
    campoResumoPlaceholder: "Cuéntanos qué hace tu negocio, qué tiene que presentar la web y qué resultado esperas.",
    consentimento: "Acepto el uso de estos datos para recibir respuesta sobre mi proyecto, según la",
    consentimentoLink: "Política de Privacidad",
    botao: "Continuar en WhatsApp",
    dica: "Al continuar, WhatsApp abrirá un mensaje con la información rellenada. No se guarda nada en ninguna base de datos de esta web.",
    sucesso: "Mensaje preparado y abierto en WhatsApp. Revísalo y pulsa enviar para que nos llegue.",
    bloqueadoAntes: "El navegador ha bloqueado la pestaña nueva.",
    bloqueadoLink: "Abrir el mensaje en WhatsApp",
    bloqueadoDepois: "(los datos rellenados van incluidos).",
    rotuloNome: "Mi nombre",
    rotuloNegocio: "Negocio",
    rotuloEmail: "Correo",
    rotuloWhatsapp: "WhatsApp",
    rotuloTipo: "Tipo de web",
    rotuloProjeto: "Sobre el proyecto:",
    tipos: [
      "Esencial (una página)",
      "Negocio (web completa)",
      "Profesional (web completa y una capacidad más)",
      "Tienda online o proyecto especial",
      "Aún no lo sé",
    ],
  },

  rodape: {
    frase: "Webs cercanas, bien pensadas y hechas desde cero.",
    voltarTopo: "Volver arriba ↑",
    local: "São Paulo, Brasil · Trabajamos en remoto",
    privacidade: "Privacidad",
    direitos: "© 2026 Varanda Estúdio Web",
    voltarInicio: "Varanda Estúdio Web, volver al inicio",
  },

  /* La página para una dirección que no existe. Ver la nota en `pt.ts`. */
  erro: {
    metaTitulo: "Página no encontrada",
    metaDescricao: "Esta dirección no existe en la web. Vuelve al inicio de Varanda Estúdio Web.",
    rotulo: "Dirección no encontrada",
    titulo: "Esta página no existe.",
    texto:
      "La dirección que abriste no está aquí. Puede ser un enlace antiguo, o una dirección con un carácter de más. Vuelve al inicio y sigue desde ahí.",
    voltar: "Volver al inicio",
  },

  privacidade: {
    kicker: "Información y transparencia",
    titulo: "Política de Privacidad",
    /* Mesma data do `pt.ts`: a das três versões muda junto. */
    atualizacao: "Última actualización: 25 de septiembre de 2026.",
    voltar: "← Volver a la web",
    voltarAria: "Volver a la página de inicio de Varanda Estúdio Web",
    /* As mesmas nove seções do `pt.ts`, na mesma ordem (ver a nota de lá), e
       não uma tradução só. Quem responde daqui está sob o RGPD, que pede o que
       a LGPD não pede na mesma forma: base legal por finalidade (6.1.b para
       quem contratou em nome próprio, 6.1.f para quem responde por uma
       empresa e para quem é citado), a base de cada transferência, a
       reclamação à AEPD com o nome escrito e, no rascunho do aparelho, a
       exceção de armazenamento estritamente necessário da LSSI (art. 22.2),
       que é o que dispensa pedir consentimento para ele. */
    secoes: [
      {
        titulo: "1. Quién trata los datos",
        texto:
          "Varanda Estúdio Web es el nombre comercial bajo el que Lucca Oliveira, persona física, presta servicios desde Brasil. Él es el responsable del tratamiento de los datos que recibe esta web: los del formulario de contacto y los del cuestionario de proyecto, que quien contrata una web recibe por un enlace propio. Para cualquier asunto de privacidad, escribe a",
      },
      {
        titulo: "2. El formulario de contacto",
        texto:
          "El formulario de contacto pide nombre, nombre del negocio, correo electrónico, WhatsApp, tipo de web y una descripción del proyecto. Al pulsar “Continuar en WhatsApp”, la web prepara un mensaje con esa información y abre la aplicación. Este formulario no guarda nada en ninguna base de datos: el mensaje solo llega a Varanda si lo envías por WhatsApp, que lo trata según sus propias normas. Los datos sirven para responder al contacto y preparar una propuesta. La base legal es atender tu petición antes de un posible contrato (art. 6.1.b del RGPD) o, si escribes en nombre de una empresa, el interés legítimo en responderle (art. 6.1.f del RGPD).",
      },
      {
        titulo: "3. El cuestionario de proyecto",
        /* Mesmo id nos três idiomas: ver a nota no `pt.ts`. Não traduzir. */
        ancora: "questionario",
        texto:
          "Tras el pago inicial, quien ha contratado una web recibe un enlace propio para responder al cuestionario de proyecto, que es el punto de partida de la web. Pide datos de la empresa, los contactos que aparecerán en la web, el nombre de quien aprueba el proyecto e información sobre fotos, textos, dominio y plazos. A veces una respuesta incluye datos de otra persona, como el nombre de quien firma un testimonio. A diferencia del formulario de contacto, el cuestionario sí guarda datos: lo que escribes se graba automáticamente mientras lo rellenas, incluso antes de enviarlo. Antes del primer envío, Varanda ve cuándo se ha abierto el enlace, cuándo se ha guardado algo por última vez y en qué paso se ha quedado el cuestionario, para saber cuándo ofrecer ayuda. Las respuestas en sí solo las lee después del envío. Quien tenga el enlace puede ver y cambiar las respuestas, así que compártelo solo con quien vaya a ayudarte a rellenarlo. Nunca escribas contraseñas en él.",
      },
      {
        titulo: "4. Para qué sirven las respuestas",
        texto:
          "Las respuestas sirven para hacer la web contratada. Con ellas se prepara la ficha del proyecto, que guía la estructura, el diseño, los textos y la publicación. No se usan en publicidad ni entran en otro proyecto. Si has contratado en tu propio nombre, como autónomo o profesional, la base legal es la ejecución del contrato (art. 6.1.b del RGPD). Si respondes en nombre de una empresa, y para cualquier persona citada en las respuestas, la base es el interés legítimo en hacer la web que la empresa encargó (art. 6.1.f del RGPD), y solo entra lo necesario para eso.",
      },
      {
        titulo: "5. Dónde están los datos",
        texto:
          "Las respuestas se guardan en el sistema interno de Varanda, una base de datos en Cloudflare. Para leerlas y preparar la ficha del proyecto, Varanda usa Claude, un asistente de inteligencia artificial de Anthropic. La ficha y los archivos de trabajo están en OneDrive, de Microsoft. Las tres empresas guardan o tratan los datos en Estados Unidos. Los datos que salen de la Unión Europea hacia Brasil se amparan en la decisión de adecuación entre la Unión Europea y Brasil del 27 de enero de 2026. Hacia Cloudflare, Microsoft y Anthropic, en Estados Unidos, la garantía es el Data Privacy Framework o cláusulas contractuales tipo, según el proveedor. La cuenta de Varanda en Anthropic está configurada para que las conversaciones no se usen para entrenar inteligencia artificial. La web cuenta las visitas con Web Analytics de Cloudflare, sin cookies: registra la página abierta, sin la clave del enlace, de dónde viene la persona, el país y el tipo de dispositivo.",
      },
      {
        titulo: "6. Cuánto tiempo se conservan",
        texto:
          "Varanda no vende datos personales. Los mensajes del formulario de contacto quedan en el historial de WhatsApp o del correo mientras dura la atención, y después solo lo necesario para cumplir obligaciones o defender derechos. Las respuestas del cuestionario se conservan mientras se hace la web y durante los 30 días de garantía tras la publicación. En un plazo de 60 días desde el fin de la garantía, se borran del sistema y de los archivos de trabajo. Si el contrato termina antes de la publicación, los 60 días cuentan desde el fin del contrato. Las copias de seguridad conservan lo borrado hasta 90 días y después se eliminan. Lo que pasa a ser contenido de la web, como textos y fotos aprobados, queda como parte de la web, que es de la empresa. El nombre, el correo y el teléfono de quien ha contratado se conservan con el contrato y los recibos durante cinco años, contados desde el final del año del último pago, que es el plazo de las obligaciones fiscales.",
      },
      {
        titulo: "7. El borrador en tu dispositivo",
        texto:
          "Si no se puede guardar lo que escribes mientras rellenas el cuestionario, por ejemplo porque se ha caído la conexión, el navegador conserva en el propio dispositivo una copia de lo que aún no ha llegado a Varanda, para que no se pierda nada. Esa copia solo existe mientras la pestaña esté abierta y se borra en cuanto Varanda confirma la recepción. No es una cookie ni sirve para seguir tu navegación. Es un almacenamiento estrictamente necesario para el servicio que has pedido, así que no necesita tu consentimiento (art. 22.2 de la LSSI).",
      },
      {
        titulo: "8. Tus derechos",
        texto:
          "Puedes pedir acceso a tus datos y una copia en un formato de uso común, rectificar lo que esté mal, limitar su uso u oponerte a él, y pedir que se borre lo que ya no sea necesario. Mientras el enlace del cuestionario esté abierto, puedes ver y corregir las respuestas en el propio enlace. Las solicitudes van al correo del apartado 1 y reciben respuesta en un plazo máximo de 15 días. Si algún dato todavía hace falta para terminar la web o cumplir el contrato, la respuesta dice cuál y hasta cuándo se conserva. Quien aparezca citado en las respuestas, como el autor de un testimonio, tiene los mismos derechos y puede escribir al mismo correo. También puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es) o ante la autoridad de protección de datos de tu país.",
      },
      {
        titulo: "9. Actualizaciones",
        texto:
          "Esta política puede actualizarse para reflejar cambios en la web o en el proceso de atención. La fecha de la versión vigente se indicará siempre al principio de la página.",
      },
    ],
  },
};

export default es;
