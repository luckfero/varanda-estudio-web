import type { Dicionario } from "./index";

/**
 * Diccionario español.
 *
 * Español peninsular, tratamiento de tú — es lo habitual en la web comercial
 * española y encaja con el tono cercano del original.
 *
 * Los precios **no son una conversión** de la tabla en reales: están anclados
 * en el mercado catalán (landing 500–1.500 €, corporativa freelance
 * 600–2.500 €, microagencia 1.800–5.000 €, mantenimiento 30–80 € y 100–300 €).
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
    privacyDescription: "Cómo trata Varanda Estúdio Web los datos enviados desde el formulario de contacto.",
  },

  nav: {
    pular: "Saltar al contenido",
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
    ctaSecundario: "Ver proyecto",
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
    eyebrow: "Una web no tiene por qué parecer complicada",
    titulo: "Tiene que tener sentido para quien llega y para quien lleva el negocio.",
    coluna1: "Varanda acerca los negocios a lo digital con comunicación clara, un proceso transparente y decisiones pensadas para la realidad de cada cliente.",
    coluna2: "Cada proyecto reúne estrategia, contenido y desarrollo para entregar una web bonita, útil y fácil de navegar.",
  },

  servicos: {
    indice: "Qué hacemos",
    titulo: "El formato adecuado<br />para tu momento.",
    resumo: "Tres formatos, del más directo al más completo. Son los mismos nombres que aparecen en la inversión, más abajo.",
    nota: "¿Necesitas tienda online, reservas, área privada o automatizaciones?",
    notaLink: "Lo valoramos juntos.",
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
    noArTitulo: "Negocios en pie, con dirección propia.",
    visitar: "Visitar la web de ",
    visitarDepois: " en una pestaña nueva",
    verSite: "Ver la web",

    conceituaisIndice: "Proyectos del estudio",
    conceituaisTitulo: "Tres sectores, tres problemas distintos.",
    aviso: "Proyectos conceptuales, creados por el estudio para mostrar dirección visual y desarrollo. Las empresas, los textos y los datos son ficticios.",

    /* Emparejado por índice con `featuredAssets` en `app/data.ts`. */
    destaques: [
      {
        name: "Casa Conexão",
        label: "Salas de consulta · São Bernardo do Campo",
        description:
          "Una casa que alquila salas para profesionales autónomos: psicólogos, abogados, doulas, contables. La web presenta el espacio, muestra quién trabaja allí y lleva la conversación directa a WhatsApp.",
        features: ["Dirección visual", "Ilustración propia", "Galería interactiva", "Página por profesional"],
        imageAlt: "Página de inicio de Casa Conexão, con dos butacas frente a una ventana de arco",
      },
      {
        name: "Milênio",
        label: "Grupo de rap · Álbum YinYang",
        description:
          "Tres voces, casi diez años de camino y el primer álbum en marcha. La web presenta al grupo, el disco y el cortometraje, con la alternancia entre negro y blanco como columna de la narración.",
        features: ["Dirección visual", "Tratamiento de imagen", "Tipografía", "Desarrollo sin dependencias"],
        imageAlt: "Página de inicio de Milênio, con el título O rap de outro milênio sobre fondo negro",
      },
    ],
    carrossel: "carrusel",
    carrosselLabel: "Trabajos realizados por Varanda",
    abrirAntes: "Abrir la demo del proyecto ",
    abrirDepois: " en una pestaña nueva",
    escolher: "Elegir proyecto",
    mostrar: "Mostrar ",
    projetoAntes: "Proyecto ",
    projetoDe: " de ",
    entregas: "Entregas del proyecto",
    previstas: "Características previstas",
    reservado: "Espacio reservado para un próximo proyecto",
    novoProjeto: "nuevo proyecto",
    emBreve: "próximamente",
    novosTrabalhos: "Aquí se irán añadiendo nuevos trabajos.",
    anterior: "Proyecto anterior",
    proximo: "Proyecto siguiente",
    /* La orden está emparejada por índice con `projectAssets` en
       `app/data.ts`, donde está explicada. Cambiarla aquí sin cambiarla allí,
       o sin cambiar los otros dos idiomas, intercambia imagen y enlace. */
    projetos: [
      {
        name: "Nívora Construções",
        label: "Proyecto conceptual · Construcción",
        description:
          "Una web institucional trilingüe para una constructora contemporánea, con portfolio de obras, servicios, proceso constructivo y prediagnóstico de presupuesto en una experiencia visual técnica e inmersiva.",
        features: ["Estrategia trilingüe", "Arquitectura de la información", "Dirección visual", "Desarrollo responsive"],
        imageAlt: "Casa contemporánea presentada en la página de inicio del proyecto Nívora Construções",
      },
      {
        name: "Nascente",
        label: "Proyecto conceptual · Perfumería",
        description:
          "Una perfumería de autor con catálogo filtrable por colección e intensidad, guía olfativa por pasos y flujo de compra completo, del descubrimiento de la fragancia a la confirmación del pedido.",
        features: ["Identidad visual", "Catálogo y filtros", "Guía olfativa", "Flujo de compra"],
        imageAlt: "Frasco de perfume en vidrio ámbar entre hojas oscuras, en la página de inicio del proyecto Nascente",
      },
      {
        name: "Brasa do Vale",
        label: "Proyecto conceptual · Restauración",
        description:
          "Una web acogedora y directa para un asador, centrada en la carta, en lo que distingue a la casa y en el contacto rápido por WhatsApp.",
        features: ["Estrategia de contenido", "Dirección visual", "Diseño responsive", "Desarrollo"],
        imageAlt: "Imagen de carne a la brasa usada en la página de inicio del proyecto Brasa do Vale",
      },
      {
        /* Cuarta tarjeta sin par en `projectAssets`, a propósito: así el
           carrusel arma el espacio reservado. */
        name: "Tu proyecto",
        label: "Espacio reservado · Próximo trabajo",
        description:
          "El próximo trabajo del estudio ocupa este espacio. Puede ser el tuyo: la conversación empieza con un hola.",
        features: ["Conversación y briefing", "Dirección y contenido", "Creación y ajustes", "Publicación y cuidado"],
        imageAlt: "",
      },
    ],
  },

  processo: {
    indice: "Cómo funciona",
    titulo: "Un camino claro,<br />del primer “hola”<br />a la publicación.",
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
        title: "Publicación y cuidado",
        text: "Con la aprobación final publicamos y entregamos los accesos. Con plan de mantenimiento, seguimos acompañando.",
      },
    ],
  },

  investimento: {
    indice: "Inversión",
    titulo: "Empieza por lo que<br />tu negocio necesita hoy.",
    prazo: "Condición de lanzamiento válida para contratos cerrados hasta el 30 de septiembre de 2026.",
    porProjeto: "por proyecto",
    valorRegular: "precio habitual:",
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
    pacotes: [
      {
        name: "Esencial",
        eyebrow: "Para empezar",
        launch: "790",
        future: "990",
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
        future: "1.990",
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
        future: "3.600",
        featured: false,
        description: "Todo lo de Negocio, más una capacidad que tu proyecto necesite, elegida contigo.",
        items: [
          "Todo el paquete Negocio",
          "Una capacidad a elegir: otro idioma, catálogo con filtros, contenido gestionable o integración con sistema",
          "SEO técnico y datos estructurados",
          "2 rondas de ajustes",
          "Primer mes del plan Presencia incluido",
        ],
      },
    ],
    incluido: [
      { title: "Dirección visual propia", text: "Cada proyecto se diseña desde cero. Ningún paquete usa plantilla." },
      { title: "Accesible de verdad", text: "Contraste, navegación por teclado y lector de pantalla verificados con herramienta, no a ojo." },
      { title: "Rápida en cualquier móvil", text: "Publicada en red distribuida, con imágenes y tipografías optimizadas." },
      { title: "Publicación y dominio configurados", text: "Dejamos la web publicada, con dirección y certificado funcionando." },
      { title: "Garantía de 30 días", text: "Cualquier fallo de funcionamiento tras la publicación se corrige sin coste." },
      { title: "La web es tuya", text: "Dominio, cuentas y código quedan a nombre de tu empresa desde el primer día." },
    ],
  },

  manutencao: {
    indice: "Después de publicar",
    tituloAntes: "Tu web puede seguir",
    tituloDestaque: "bien cuidada.",
    resumo: "Planes opcionales para mantener la web publicada, actualizada y segura, y para cambiar el contenido siempre que el negocio cambie.",
    porMes: "/mes",
    nota1: "El tiempo mensual no se acumula. El pago es por adelantado y la baja requiere un aviso previo de 30 días.",
    nota2: "Para necesidades puntuales sin plan, el mantenimiento suelto cuesta 59 € por hora, facturado en bloques de 30 minutos. Dentro de los planes, la hora sale siempre más barata.",
    planos: [
      {
        name: "Cuidado",
        price: "39",
        featured: false,
        summary: "La web siempre publicada y al día.",
        items: [
          "Monitorización, con corrección si la web se cae",
          "Copias de seguridad y certificado siempre válidos",
          "Actualizaciones técnicas y de seguridad",
          "Respuesta en hasta 3 días laborables",
        ],
      },
      {
        name: "Presencia",
        price: "79",
        featured: true,
        summary: "El contenido siguiendo al negocio.",
        items: ["Todo el plan Cuidado", "Hasta 1 hora al mes de cambios de contenido", "Respuesta en hasta 2 días laborables"],
      },
      {
        name: "Prioridad",
        price: "149",
        featured: false,
        summary: "Para quien toca la web a menudo.",
        items: ["Todo el plan Presencia", "Hasta 3 horas al mes de cambios", "Respuesta el mismo día laborable"],
      },
    ],
  },

  sobre: {
    indice: "Quién está en Varanda",
    eyebrow: "Un estudio pequeño, a propósito.",
    titulo: "La buena tecnología es la que acerca, no la que complica.",
    paragrafo1: "Varanda Estúdio Web existe para ayudar a comercios, profesionales y empresas a construir una presencia digital clara, profesional y fiable.",
    paragrafo2: "Cada proyecto se acompaña de cerca, desde la organización de las ideas hasta el desarrollo, con conversación franca, proceso documentado y atención al detalle. Pocos proyectos a la vez, y ninguno tratado como encargo en serie.",
    assinatura: "Varanda Estúdio Web",
    assinaturaLocal: "— São Paulo, Brasil",
  },

  extras: {
    indice: "A medida",
    titulo: "¿Qué más puede necesitar tu proyecto?",
    resumo: "Estos servicios se pueden añadir cuando no estén incluidos en el paquete elegido.",
    nota: "Los precios de arriba no incluyen los costes que cobran el dominio, el alojamiento o las herramientas externas. Una entrega en menos plazo del acordado, o trabajo en fin de semana y festivo, tiene un recargo del 30% y depende de disponibilidad.",
    lista: [
      { name: "Página adicional", price: "250 €" },
      { name: "Redacción completa", price: "150 €/página" },
      { name: "Integración fuera de las estándar", price: "desde 250 €" },
      { name: "Ronda adicional de ajustes", price: "199 €" },
      { name: "Mantenimiento suelto", price: "59 €/hora" },
    ],
  },

  faq: {
    indice: "Preguntas frecuentes",
    titulo: "Antes de empezar,<br />conviene saber.",
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
          "Todo proyecto tiene 30 días de garantía: cualquier fallo de funcionamiento se corrige sin coste. Pasado ese plazo, las correcciones entran por mantenimiento suelto o por plan mensual, que además monitoriza la web y avisa antes de que tú lo notes.",
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
          "Sí. Los cambios puntuales entran por mantenimiento suelto o por el plan mensual. Páginas nuevas, funcionalidades y cambios de alcance reciben presupuesto propio antes de ejecutarse, nunca durante.",
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
    tituloAntes: "Tu negocio merece<br />un lugar donde ",
    tituloDestaque: "crecer.",
    resumo: "Cuéntanos qué necesita tu negocio y en qué momento está. Analizamos la información y respondemos con la orientación para el siguiente paso.",
    whatsappLabel: "WhatsApp",
    whatsappAria: "Hablar con Varanda por WhatsApp en una pestaña nueva",
    whatsappMensagem: "¡Hola! Vengo desde la web de Varanda Estúdio Web y me gustaría hablar sobre un proyecto.",
    formSaudacao: "¡Hola! Vengo desde la web de Varanda Estúdio Web.",
    campoNome: "Tu nombre *",
    campoNomePlaceholder: "¿Cómo prefieres que te llamemos?",
    campoNegocio: "Nombre del negocio *",
    campoNegocioPlaceholder: "Nombre de la empresa o del proyecto",
    campoEmail: "Correo electrónico *",
    campoWhatsapp: "WhatsApp *",
    campoTipo: "¿Qué tipo de web buscas? *",
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

  privacidade: {
    kicker: "Información y transparencia",
    titulo: "Política de Privacidad",
    atualizacao: "Última actualización: 10 de agosto de 2026.",
    voltar: "← Volver a la web",
    voltarAria: "Volver a la página de inicio de Varanda Estúdio Web",
    secoes: [
      {
        titulo: "1. Quién trata los datos",
        texto:
          "Varanda Estúdio Web es el nombre comercial bajo el que Lucca Oliveira, persona física, presta servicios, y es el responsable del tratamiento de los datos recibidos por esta página. Para asuntos de privacidad, escribe a",
      },
      {
        titulo: "2. Datos utilizados",
        texto:
          "El formulario solicita nombre, nombre del negocio, correo electrónico, WhatsApp, tipo de web buscada y una descripción del proyecto. Estos datos se usan únicamente para analizar la solicitud, iniciar la atención y responder al contacto.",
      },
      {
        titulo: "3. Cómo funciona el formulario",
        texto:
          "Al pulsar “Continuar en WhatsApp”, la web prepara un mensaje con la información rellenada y abre la aplicación. Los datos no se guardan en ninguna base de datos de esta web. El tratamiento que realiza WhatsApp sigue las reglas y políticas de la propia plataforma.",
      },
      {
        titulo: "4. Comunicación y conservación",
        texto:
          "Varanda no vende datos personales. La información recibida puede permanecer en el historial de WhatsApp o del correo durante el tiempo necesario para la atención, el cumplimiento de obligaciones o el ejercicio regular de derechos.",
      },
      {
        titulo: "5. Tus derechos",
        texto:
          "Puedes solicitar confirmación, acceso, rectificación, supresión, limitación, portabilidad u oposición respecto a los datos tratados, con las excepciones legales de conservación, y presentar una reclamación ante la autoridad de control de tu país. Para ejercerlos, escribe al correo indicado arriba.",
      },
      {
        titulo: "6. Actualizaciones",
        texto:
          "Esta política puede actualizarse para reflejar cambios en la web o en el proceso de atención. La fecha de la versión vigente se indicará siempre al principio de la página.",
      },
    ],
  },
};

export default es;
