/**
 * Os textos da TELA do questionário de projeto, nos três idiomas.
 *
 * Moram aqui, e não em `app/i18n/`, por dois motivos. O primeiro é tamanho:
 * o dicionário do site viaja para as seis páginas públicas e este texto só
 * interessa a quem recebeu um link. O segundo é o que já custou caro neste
 * site: o dicionário traz a política de privacidade, que é o único lugar com
 * o nome da pessoa física, e componente cliente que importa o dicionário leva
 * a política inteira para o JavaScript da página. `formulario.tsx` importa
 * ESTE arquivo, que não tem nada disso.
 *
 * O que a pessoa lê em português vem da ESPEC (3.4 e 3.6) palavra por
 * palavra: abertura, aviso sem JavaScript, indicador de gravação, conflito,
 * aviso do Revisar, confirmação, 413 e as telas de estado. A revisão de
 * 25/09/2026 mudou quatro coisas que a ESPEC ainda precisa acompanhar: a
 * abertura e o aviso do Revisar têm uma versão para a página SEM JavaScript
 * (ali nada sobe antes do Enviar, e a página prometia o contrário), o aviso
 * sem JavaScript diz isso, "Como cuidamos disso" virou "Como a Varanda cuida
 * disso" (a primeira pessoa aqui é do singular), e "Me chama" virou "Me
 * chame", como o resto da página. Espanhol e inglês
 * são LOCALIZADOS e não traduzidos ao pé da letra: primeira pessoa do
 * singular nos três (quem manda o link e lê as respostas é uma pessoa só),
 * "tú" para quem responde e "vosotros" para a empresa em espanhol, nunca
 * "ustedes", e grafia britânica em inglês.
 *
 * Três regras para quem editar:
 *
 * 1. Sem travessão, nem o longo nem o médio. Há teste varrendo este arquivo e
 *    o HTML da página.
 * 2. Nada de prazo, preço ou promessa que não esteja na ESPEC ou nos
 *    documentos do estúdio. A contagem do prazo é a do contrato: dia útil
 *    seguinte à confirmação escrita de material e acessos completos.
 * 3. As funções devolvem frase pronta, e não pedaços para colar, porque a
 *    ordem das palavras muda de um idioma para o outro.
 *
 * Puro e sem React: a página do servidor lê o título para os metadados, e o
 * componente cliente lê o resto.
 */
import type { Locale, Pais } from "./perguntas.ts";

/* O rótulo do número por extenso, só até onde o esquema usa `max` (hoje, 3).
   Acima disso sai o algarismo, que continua certo, só menos conversado. */
const EXTENSO: Record<Locale, Record<number, string>> = {
  pt: { 2: "duas", 3: "três", 4: "quatro", 5: "cinco" },
  es: { 2: "dos", 3: "tres", 4: "cuatro", 5: "cinco" },
  en: { 2: "two", 3: "three", 4: "four", 5: "five" },
};

const extenso = (locale: Locale, n: number) => EXTENSO[locale][n] ?? String(n);

export interface TextosDoBriefing {
  /** A etiqueta de idioma para `Intl` (hora do "Salvo às", data do último envio). */
  intl: string;
  titulo: string;
  semJs: string;

  /* Abertura (ESPEC 3.6). Três parágrafos, na ordem da ESPEC. */
  oi: (nome: string | null) => string;
  /** Com JavaScript: grava sozinho, e dá para parar e voltar. */
  abertura1: (empresa: string | null, minutos: number) => string;
  /** Sem JavaScript nada sobe antes do Enviar, e a página não pode prometer o contrário. */
  abertura1SemJs: (empresa: string | null, minutos: number) => string;
  abertura2: string;
  /** Só na Espanha (ESPEC 3.6): vazio nos outros idiomas. */
  aberturaCatalao: string;
  /** `comJs` e `semJs` terminam onde entra o link da política. */
  abertura3: { comJs: string; semJs: string; link: string; depois: string };

  contratouTitulo: string;
  pacote: (nome: string) => string;
  capacidade: string;
  paginas: string;

  /* Topo */
  etapaDe: (n: number, m: number) => string;
  etapaSo: (n: number) => string;
  revisar: string;
  progresso: string;
  duvidaInicio: string;
  duvidaResto: string;
  abreWhatsapp: string;
  msgDuvida: (empresa: string | null, passo: string) => string;
  passoEtapa: (n: number) => string;
  passoRevisao: string;

  /* Indicador de gravação */
  carregando: string;
  aindaNada: string;
  salvando: string;
  salvo: (hora: string) => string;
  local: string;
  semCarregar: string;
  conflito: string;
  tamanho: string;
  ajuste: string;

  /* Campos */
  erros: {
    longo: (limite: string) => string;
    telefone: (pais: Pais) => string;
    url: string;
    data: string;
    email: string;
    /** A obrigatória em branco, ao lado dela, quando o Continuar trava. */
    obrigatoria: string;
    /** O caso dela em que a opção que abre campo ("Outro") está marcada e o campo ("Qual?") vazio: aponta para o campo, que vem logo abaixo. */
    aberta: string;
  };
  contador: (n: string, limite: string) => string;
  obrigatoria: string;
  travada: string;
  sugestao: (numero: string) => string;
  usarNumero: string;
  seMarcar: (opcao: string) => string;
  /** A mesma condição no meio da frase, entre parênteses: minúscula e sem dois-pontos. */
  seMarcarMeio: (opcao: string) => string;
  /** Nas listas do que falta (Revisar e página sem JavaScript), entre parênteses depois da pergunta: a opção marcada sem o texto do campo que ela abre. */
  faltaQual: (opcao: string) => string;
  exemplo: string;
  maxAviso: (n: number) => string;

  /* Navegação e reabertura */
  voltar: string;
  continuar: string;
  /** A região viva ao lado do Continuar travado: quantas obrigatórias faltam NESTA etapa. */
  faltamNaEtapa: (n: number) => string;
  retomar: string;
  continuarDaqui: string;
  verDoComeco: string;

  /* Revisar e enviar */
  revisarIntro: string;
  respondidas: (n: number, m: number) => string;
  editar: string;
  verRespostas: string;
  emBranco: string;
  faltamTitulo: string;
  motivoFaltam: string;
  /** O servidor recusou o envio por obrigatória em branco (com JavaScript o Revisar já trava; é a rede). */
  erroFaltam: string;
  /** A página que volta do envio sem JavaScript recusado: o que houve e o que fazer. */
  faltamSemJs: string;
  /** O mesmo aviso, para quem já tinha enviado antes: o envio anterior chegou e continua valendo. */
  faltamSemJsReenvio: string;
  ajustesTitulo: string;
  motivoAjuste: string;
  motivoCarregando: string;
  noSiteTitulo: string;
  noSiteSemJs: string;
  noSite: { whatsapp: string; telefone: string; email: string; endereco: string };
  conferido: string;
  /** As duas primeiras frases mudam com e sem JavaScript; `antes` é o resto, até o link. */
  privacidade: { comJs: string; semJs: string; antes: string; link: string; depois: string };
  enviar: string;
  enviando: string;
  erroEnvio: string;
  ultimoEnvio: (quando: string) => string;

  /* Confirmação e telas de estado */
  recebidoTitulo: string;
  recebidoTexto: string;
  arquivosTitulo: string;
  porEmail: string;
  porWhatsapp: string;
  documento: string;
  msgArquivos: (empresa: string | null) => string;
  voltarAoFormulario: string;
  encerradoTitulo: string;
  encerradoTexto: string;
  copiaTitulo: string;
  copiaRotulo: string;
  copiar: string;
  copiado: string;
  fechadoTexto: string;
  foraTitulo: string;
  foraTexto: string;
  whatsappBotao: string;
  msgEncerrado: string;
  msgFechado: (empresa: string | null) => string;
  msgFora: string;
}

const pt: TextosDoBriefing = {
  intl: "pt-BR",
  titulo: "Questionário de projeto",
  semJs:
    "Sem JavaScript, esta página não salva sozinha e não mostra o que você já salvou: o que você escrever só chega à Varanda quando você apertar Enviar, no fim. Pode enviar assim mesmo: o que ficar em branco não apaga o que você já tinha mandado.",

  /* "Sem primeiro_nome: 'Oi.' e o nome da empresa na frase seguinte." */
  oi: (nome) => (nome ? `Oi, ${nome}.` : "Oi."),
  abertura1: (empresa, minutos) =>
    `Estas perguntas são o ponto de partida do ${empresa ? `site da ${empresa}` : "site de vocês"}. Leva uns ${minutos} minutos, salva sozinho, e dá para parar e voltar pelo mesmo link, no celular ou no computador. Se alguém da equipe for ajudar, pode usar o mesmo link.`,
  abertura1SemJs: (empresa, minutos) =>
    `Estas perguntas são o ponto de partida do ${empresa ? `site da ${empresa}` : "site de vocês"}. Leva uns ${minutos} minutos. Nesta página nada fica salvo antes do envio, então responda de uma vez e envie no fim.`,
  abertura2: "Eu organizo e escrevo o texto do site: aqui eu preciso da informação, não da redação. Se não souber alguma coisa, deixe em branco. Só as perguntas marcadas como obrigatórias precisam de resposta para seguir.",
  aberturaCatalao: "",
  abertura3: {
    comJs: "O que você escreve fica salvo com a Varanda desde a primeira resposta, e só quem tem este link consegue abrir. Como a Varanda cuida disso está na ",
    semJs: "O que você enviar fica salvo com a Varanda, e só quem tem este link consegue abrir. Como a Varanda cuida disso está na ",
    link: "política de privacidade",
    depois: ". Nunca escreva senha aqui.",
  },

  contratouTitulo: "O que vocês contrataram",
  pacote: (nome) => `Pacote ${nome}`,
  capacidade: "Capacidade combinada",
  paginas: "Páginas ou seções combinadas",

  etapaDe: (n, m) => `Etapa ${n} de ${m}`,
  etapaSo: (n) => `Etapa ${n}`,
  revisar: "Revisar e enviar",
  progresso: "Progresso do questionário",
  duvidaInicio: "Dúvida?",
  duvidaResto: "Me chame no WhatsApp",
  abreWhatsapp: "(abre o WhatsApp)",
  msgDuvida: (empresa, passo) => (empresa ? `Dúvida nas perguntas do site da ${empresa}, ${passo}:` : `Dúvida nas perguntas do site, ${passo}:`),
  passoEtapa: (n) => `etapa ${n}`,
  passoRevisao: "revisão final",

  carregando: "Carregando o que você já salvou.",
  aindaNada: "Salva sozinho enquanto você responde.",
  salvando: "Salvando",
  salvo: (hora) => `Salvo às ${hora}. Quando terminar, é só enviar no fim.`,
  local: "Guardado neste aparelho, sobe quando a conexão voltar",
  semCarregar: "Não consegui carregar o que você já salvou. Tento de novo em um minuto.",
  conflito: "Estas respostas mudaram em outro aparelho. Juntei as duas versões; confira esta etapa.",
  tamanho: "Tem texto demais para um envio só. Mande o restante por e-mail que eu junto aqui.",
  ajuste: "Uma resposta precisa de ajuste:",

  erros: {
    longo: (limite) => `Passou do limite de ${limite} caracteres.`,
    telefone: (pais) =>
      pais === "BR"
        ? "Confira o número, com o DDD."
        : pais === "ES"
          ? "Confira o número. Se não for da Espanha, comece com + e o código do país."
          : "Confira o número, começando com + e o código do país.",
    url: "Confira o endereço.",
    data: "Confira a data.",
    email: "Confira o e-mail.",
    obrigatoria: "Responda esta pergunta para continuar.",
    aberta: "Escreva qual é, no campo logo abaixo.",
  },
  contador: (n, limite) => `${n} de ${limite} caracteres`,
  obrigatoria: "obrigatória",
  travada: "incluída no pacote",
  sugestao: (numero) => `É este? ${numero}`,
  usarNumero: "Usar este número",
  seMarcar: (opcao) => `Se marcar “${opcao}”:`,
  seMarcarMeio: (opcao) => `se marcar “${opcao}”`,
  faltaQual: (opcao) => `você marcou “${opcao}”: falta escrever qual`,
  exemplo: "Exemplo:",
  /* ESPEC 3.4: "Até três. Desmarque uma para trocar." */
  maxAviso: (n) => `Até ${extenso("pt", n)}. Desmarque uma para trocar.`,

  voltar: "Voltar",
  continuar: "Continuar",
  faltamNaEtapa: (n) => (n === 1 ? "Falta uma pergunta obrigatória nesta etapa." : `Faltam ${extenso("pt", n)} perguntas obrigatórias nesta etapa.`),
  retomar: "Você parou em",
  continuarDaqui: "Continuar daqui",
  verDoComeco: "Ver do começo",

  revisarIntro: "Confira o resumo antes de enviar. Dá para voltar a qualquer etapa.",
  respondidas: (n, m) => `${n} de ${m} respondidas`,
  editar: "Editar",
  verRespostas: "Ver respostas",
  emBranco: "Em branco",
  faltamTitulo: "Faltam respostas obrigatórias",
  motivoFaltam: "Para enviar, responda as obrigatórias da lista acima.",
  erroFaltam: "Ainda faltam respostas obrigatórias. Elas estão na lista acima.",
  faltamSemJs:
    "Ainda não recebi o questionário, porque faltam as respostas obrigatórias abaixo. O resto do que você escreveu ficou guardado com a Varanda. Responda estas perguntas e aperte Enviar de novo, no fim da página.",
  faltamSemJsReenvio:
    "O envio anterior continua comigo, mas esta versão nova ainda não chegou, porque faltam as respostas obrigatórias abaixo. O que você mudou ficou guardado com a Varanda. Responda estas perguntas e aperte Enviar de novo, no fim da página.",
  ajustesTitulo: "Estas respostas precisam de ajuste antes de enviar",
  motivoAjuste: "Para enviar, ajuste as respostas da lista acima.",
  motivoCarregando: "Para enviar, espere carregar o que você já salvou.",
  noSiteTitulo: "Isto vai aparecer no site, confira",
  noSiteSemJs: "O WhatsApp, o telefone, o e-mail e o endereço que você escreveu vão aparecer no site. Confira antes de enviar.",
  noSite: { whatsapp: "WhatsApp", telefone: "Telefone fixo", email: "E-mail do formulário", endereco: "Endereço" },
  conferido: "Conferi: estes dados estão certos para aparecer no site.",
  /* ESPEC 3.6, "Aviso no Revisar", com o link no fim como está lá. */
  privacidade: {
    comJs: "As respostas já estão salvas com a Varanda. Enviar avisa que estão prontas para eu ler.",
    semJs: "Enviar grava as respostas com a Varanda e avisa que estão prontas para eu ler.",
    antes: "Elas servem só para fazer o site de vocês e são apagadas depois que a garantia acaba, como explica a ",
    link: "política de privacidade",
    depois: ".",
  },
  enviar: "Enviar para a Varanda",
  enviando: "Enviando",
  erroEnvio: "Não consegui enviar agora. O que você já salvou continua guardado; tente de novo em alguns minutos ou me chame no WhatsApp.",
  ultimoEnvio: (quando) => `Último envio: ${quando}.`,

  /* ESPEC 3.6, "Confirmação". A primeira palavra vira o título da tela. */
  recebidoTitulo: "Recebido.",
  recebidoTexto:
    "Eu leio tudo e te respondo com o que ficou claro e o que ainda falta. O prazo do site começa no dia útil seguinte ao que eu confirmar, por escrito, que as respostas, os arquivos e os acessos chegaram completos. Até lá, dá para voltar a este link, mudar e enviar de novo.",
  arquivosTitulo: "Para mandar logotipo, fotos e arquivos",
  porEmail: "Por e-mail",
  porWhatsapp: "Pelo WhatsApp",
  documento: "No WhatsApp, mande como Documento e não pela Galeria, senão a foto chega comprimida.",
  msgArquivos: (empresa) => (empresa ? `Oi, vou mandar os arquivos do site da ${empresa}.` : "Oi, vou mandar os arquivos do site."),
  voltarAoFormulario: "Voltar ao formulário",
  encerradoTitulo: "Este link foi encerrado.",
  encerradoTexto: "Se precisar de alguma coisa, me chame no WhatsApp.",
  copiaTitulo: "O que ficou neste aparelho está abaixo, para copiar",
  copiaRotulo: "Respostas guardadas neste aparelho",
  copiar: "Copiar",
  copiado: "Copiado.",
  fechadoTexto: "Suas respostas estão guardadas. A partir daqui, qualquer mudança vem pelo WhatsApp, e eu digo antes se ela muda prazo ou preço.",
  /* ESPEC 3.4, tela de 503, partida em título e texto. */
  foraTitulo: "O formulário está fora do ar agora.",
  foraTexto: "O que você já salvou continua guardado. Tente de novo em alguns minutos ou me chame no WhatsApp.",
  whatsappBotao: "Me chame no WhatsApp",
  msgEncerrado: "Oi, o link do questionário do site foi encerrado.",
  msgFechado: (empresa) => (empresa ? `Oi, quero mudar uma coisa nas respostas do site da ${empresa}:` : "Oi, quero mudar uma coisa nas respostas do site:"),
  msgFora: "Oi, o questionário do site está fora do ar:",
};

const es: TextosDoBriefing = {
  intl: "es-ES",
  titulo: "Cuestionario de proyecto",
  semJs:
    "Sin JavaScript, esta página no se guarda sola ni muestra lo que ya has guardado: lo que escribas solo le llega a Varanda cuando pulses Enviar, al final. Puedes enviarlo igualmente: lo que dejes en blanco no borra lo que ya habías mandado.",

  oi: (nome) => (nome ? `Hola, ${nome}.` : "Hola."),
  abertura1: (empresa, minutos) =>
    `Estas preguntas son el punto de partida de ${empresa ? `la web de ${empresa}` : "vuestra web"}. Se tarda unos ${minutos} minutos, se guarda solo y puedes parar y volver con el mismo enlace, desde el móvil o desde el ordenador. Si alguien del equipo os va a ayudar, puede usar el mismo enlace.`,
  abertura1SemJs: (empresa, minutos) =>
    `Estas preguntas son el punto de partida de ${empresa ? `la web de ${empresa}` : "vuestra web"}. Se tarda unos ${minutos} minutos. En esta página no se guarda nada hasta que la envías, así que respóndela de una vez y envíala al final.`,
  abertura2: "Yo organizo y escribo los textos de la web: aquí necesito la información, no la redacción. Si no sabes algo, déjalo en blanco. Solo las preguntas marcadas como obligatorias necesitan respuesta para seguir.",
  /* ESPEC 3.6: acrescentado quando o país do link é ES. */
  aberturaCatalao: "Puedes responder en castellano o en catalán.",
  abertura3: {
    comJs: "Varanda guarda lo que escribes desde la primera respuesta, y solo quien tiene este enlace puede abrirlo. Cómo lo cuida Varanda está en la ",
    semJs: "Varanda guarda lo que envíes, y solo quien tiene este enlace puede abrirlo. Cómo lo cuida Varanda está en la ",
    link: "política de privacidad",
    depois: ". No escribas nunca contraseñas aquí.",
  },

  contratouTitulo: "Lo que habéis contratado",
  pacote: (nome) => `Paquete ${nome}`,
  capacidade: "Capacidad acordada",
  paginas: "Páginas o secciones acordadas",

  etapaDe: (n, m) => `Paso ${n} de ${m}`,
  etapaSo: (n) => `Paso ${n}`,
  revisar: "Revisar y enviar",
  progresso: "Progreso del cuestionario",
  duvidaInicio: "¿Dudas?",
  duvidaResto: "Escríbeme por WhatsApp",
  abreWhatsapp: "(abre WhatsApp)",
  msgDuvida: (empresa, passo) =>
    empresa ? `Tengo una duda en las preguntas de la web de ${empresa}, ${passo}:` : `Tengo una duda en las preguntas de la web, ${passo}:`,
  passoEtapa: (n) => `paso ${n}`,
  passoRevisao: "revisión final",

  carregando: "Cargando lo que ya has guardado.",
  aindaNada: "Se guarda solo mientras respondes.",
  salvando: "Guardando",
  salvo: (hora) => `Guardado a las ${hora}. Cuando termines, solo tienes que enviarlo al final.`,
  local: "Guardado en este dispositivo; se subirá cuando vuelva la conexión",
  semCarregar: "No he podido cargar lo que ya has guardado. Lo vuelvo a intentar en un minuto.",
  conflito: "Estas respuestas han cambiado en otro dispositivo. He juntado las dos versiones; revisa este paso.",
  tamanho: "Hay demasiado texto para un solo envío. Mándame el resto por correo y lo junto aquí.",
  ajuste: "Hay una respuesta que ajustar:",

  erros: {
    longo: (limite) => `Supera el límite de ${limite} caracteres.`,
    telefone: (pais) =>
      pais === "BR"
        ? "Revisa el número, con el prefijo de la zona (DDD)."
        : pais === "ES"
          ? "Revisa el número. Si no es de España, empieza por + y el prefijo del país."
          : "Revisa el número, empezando por + y el prefijo del país.",
    url: "Revisa la dirección.",
    data: "Revisa la fecha.",
    email: "Revisa el correo.",
    obrigatoria: "Responde a esta pregunta para continuar.",
    aberta: "Escribe cuál es, en el campo de abajo.",
  },
  contador: (n, limite) => `${n} de ${limite} caracteres`,
  obrigatoria: "obligatoria",
  travada: "incluida en el paquete",
  sugestao: (numero) => `¿Es este? ${numero}`,
  usarNumero: "Usar este número",
  seMarcar: (opcao) => `Si eliges «${opcao}»:`,
  seMarcarMeio: (opcao) => `si eliges «${opcao}»`,
  faltaQual: (opcao) => `has marcado «${opcao}»: falta escribir cuál`,
  exemplo: "Por ejemplo:",
  maxAviso: (n) => `Hasta ${extenso("es", n)}. Desmarca una para cambiarla.`,

  voltar: "Atrás",
  continuar: "Continuar",
  faltamNaEtapa: (n) => (n === 1 ? "Falta una pregunta obligatoria en este paso." : `Faltan ${extenso("es", n)} preguntas obligatorias en este paso.`),
  retomar: "Lo dejaste en",
  continuarDaqui: "Seguir desde aquí",
  verDoComeco: "Ver desde el principio",

  revisarIntro: "Revisa el resumen antes de enviarlo. Puedes volver a cualquier paso.",
  respondidas: (n, m) => `${n} de ${m} respondidas`,
  editar: "Editar",
  verRespostas: "Ver respuestas",
  emBranco: "En blanco",
  faltamTitulo: "Faltan respuestas obligatorias",
  motivoFaltam: "Para enviarlo, responde las obligatorias de la lista de arriba.",
  erroFaltam: "Aún faltan respuestas obligatorias. Están en la lista de arriba.",
  faltamSemJs:
    "Todavía no me ha llegado el cuestionario, porque faltan las respuestas obligatorias de abajo. Lo demás que has escrito ha quedado guardado en Varanda. Responde a estas preguntas y vuelve a pulsar Enviar, al final de la página.",
  faltamSemJsReenvio:
    "El envío anterior sigue conmigo, pero esta versión nueva todavía no me ha llegado, porque faltan las respuestas obligatorias de abajo. Lo que has cambiado ha quedado guardado en Varanda. Responde a estas preguntas y vuelve a pulsar Enviar, al final de la página.",
  ajustesTitulo: "Estas respuestas necesitan un ajuste antes de enviarlas",
  motivoAjuste: "Para enviarlo, ajusta las respuestas de la lista de arriba.",
  motivoCarregando: "Para enviarlo, espera a que cargue lo que ya has guardado.",
  noSiteTitulo: "Esto va a aparecer en la web, revísalo",
  noSiteSemJs: "El WhatsApp, el teléfono, el correo y la dirección que has escrito van a aparecer en la web. Revísalos antes de enviar.",
  noSite: { whatsapp: "WhatsApp", telefone: "Teléfono fijo", email: "Correo del formulario", endereco: "Dirección" },
  conferido: "Lo he revisado: estos datos están bien para salir en la web.",
  privacidade: {
    comJs: "Varanda ya tiene tus respuestas guardadas. Enviarlas me avisa de que están listas para que las lea.",
    semJs: "Al enviarlas, Varanda las guarda y me avisa de que están listas para que las lea.",
    antes: "Solo sirven para hacer vuestra web y se borran cuando termina la garantía, como explica la ",
    link: "política de privacidad",
    depois: ".",
  },
  enviar: "Enviar a Varanda",
  enviando: "Enviando",
  erroEnvio: "No he podido enviarlo ahora. Lo que ya has guardado sigue guardado; vuelve a intentarlo en unos minutos o escríbeme por WhatsApp.",
  ultimoEnvio: (quando) => `Último envío: ${quando}.`,

  recebidoTitulo: "Recibido.",
  recebidoTexto:
    "Lo leo todo y te respondo con lo que ha quedado claro y lo que todavía falta. El plazo de la web empieza el día laborable siguiente a que yo confirme, por escrito, que las respuestas, los archivos y los accesos han llegado completos. Hasta entonces, puedes volver a este enlace, cambiar lo que quieras y enviarlo de nuevo.",
  arquivosTitulo: "Para mandarme el logotipo, las fotos y los archivos",
  porEmail: "Por correo",
  porWhatsapp: "Por WhatsApp",
  documento: "Por WhatsApp, adjúntalas como «Documento» y no desde «Galería» o «Fotos y vídeos», que las comprime.",
  msgArquivos: (empresa) => (empresa ? `Hola, te mando los archivos de la web de ${empresa}.` : "Hola, te mando los archivos de la web."),
  voltarAoFormulario: "Volver al formulario",
  encerradoTitulo: "Este enlace se ha cerrado.",
  encerradoTexto: "Si necesitas algo, escríbeme por WhatsApp.",
  copiaTitulo: "Lo que se quedó en este dispositivo está aquí abajo, para copiarlo",
  copiaRotulo: "Respuestas guardadas en este dispositivo",
  copiar: "Copiar",
  copiado: "Copiado.",
  fechadoTexto: "Tus respuestas están guardadas. A partir de aquí, cualquier cambio va por WhatsApp, y te digo antes si cambia el plazo o el precio.",
  foraTitulo: "El formulario no está disponible ahora mismo.",
  foraTexto: "Lo que ya has guardado sigue guardado. Vuelve a intentarlo en unos minutos o escríbeme por WhatsApp.",
  whatsappBotao: "Escríbeme por WhatsApp",
  msgEncerrado: "Hola, el enlace del cuestionario de la web se ha cerrado.",
  msgFechado: (empresa) => (empresa ? `Hola, quiero cambiar algo en las respuestas de la web de ${empresa}:` : "Hola, quiero cambiar algo en las respuestas de la web:"),
  msgFora: "Hola, el cuestionario de la web no funciona ahora mismo:",
};

const en: TextosDoBriefing = {
  /* en-GB, e não en-US: a hora sai em 24 horas e a data em dia, mês, como a
     grafia britânica do resto do texto. */
  intl: "en-GB",
  titulo: "Project questionnaire",
  semJs:
    "Without JavaScript, this page doesn't save as you go or show what you've already saved: what you write only reaches Varanda when you press Send at the end. You can still send it: anything you leave blank won't erase what you'd already sent.",

  oi: (nome) => (nome ? `Hi, ${nome}.` : "Hi."),
  abertura1: (empresa, minutos) =>
    `These questions are the starting point for ${empresa ? `${empresa}'s website` : "your website"}. It takes about ${minutos} minutes, saves as you go, and you can stop and come back with the same link, on your phone or your computer. If someone on your team is going to help, they can use the same link.`,
  abertura1SemJs: (empresa, minutos) =>
    `These questions are the starting point for ${empresa ? `${empresa}'s website` : "your website"}. It takes about ${minutos} minutes. Nothing on this page is saved until you send it, so answer it in one go and send it at the end.`,
  abertura2: "I organise and write the website copy: here I need the facts, not the wording. If you don't know something, leave it blank. Only the questions marked as required need an answer before you move on.",
  aberturaCatalao: "",
  abertura3: {
    comJs: "What you write is saved with Varanda from the first answer, and only someone with this link can open it. How Varanda looks after it is set out in the ",
    semJs: "What you send is saved with Varanda, and only someone with this link can open it. How Varanda looks after it is set out in the ",
    link: "privacy policy",
    depois: ". Never type a password here.",
  },

  contratouTitulo: "What you've signed up for",
  pacote: (nome) => `${nome} package`,
  capacidade: "Agreed capability",
  paginas: "Agreed pages or sections",

  etapaDe: (n, m) => `Step ${n} of ${m}`,
  etapaSo: (n) => `Step ${n}`,
  revisar: "Review and send",
  progresso: "Questionnaire progress",
  duvidaInicio: "Questions?",
  duvidaResto: "Message me on WhatsApp",
  abreWhatsapp: "(opens WhatsApp)",
  msgDuvida: (empresa, passo) =>
    empresa ? `A question about the website questionnaire for ${empresa}, ${passo}:` : `A question about the website questionnaire, ${passo}:`,
  passoEtapa: (n) => `step ${n}`,
  passoRevisao: "final review",

  carregando: "Loading what you've already saved.",
  aindaNada: "Saves as you go.",
  salvando: "Saving",
  salvo: (hora) => `Saved at ${hora}. When you've finished, just send it at the end.`,
  local: "Kept on this device; it'll upload when the connection is back",
  semCarregar: "I couldn't load what you've already saved. I'll try again in a minute.",
  conflito: "These answers changed on another device. I've merged the two versions; please check this step.",
  tamanho: "There's too much text for a single submission. Email me the rest and I'll add it here.",
  ajuste: "One answer needs a fix:",

  erros: {
    longo: (limite) => `This is over the ${limite}-character limit.`,
    telefone: (pais) =>
      pais === "BR"
        ? "Please check the number, including the area code."
        : pais === "ES"
          ? "Please check the number. If it isn't Spanish, start with + and the country code."
          : "Please check the number, starting with + and the country code.",
    url: "Please check the address.",
    data: "Please check the date.",
    email: "Please check the email address.",
    obrigatoria: "Please answer this question to continue.",
    aberta: "Tell me which one, in the box just below.",
  },
  contador: (n, limite) => `${n} of ${limite} characters`,
  obrigatoria: "required",
  travada: "included in your package",
  sugestao: (numero) => `Is it this one? ${numero}`,
  usarNumero: "Use this number",
  seMarcar: (opcao) => `If you choose ‘${opcao}’:`,
  seMarcarMeio: (opcao) => `if you choose ‘${opcao}’`,
  faltaQual: (opcao) => `you ticked ‘${opcao}’: tell me which one`,
  exemplo: "For example:",
  maxAviso: (n) => `Up to ${extenso("en", n)}. Untick one to swap.`,

  voltar: "Back",
  continuar: "Continue",
  faltamNaEtapa: (n) => (n === 1 ? "One required question left on this step." : `${extenso("en", n).replace(/^./, (c) => c.toUpperCase())} required questions left on this step.`),
  retomar: "You stopped at",
  continuarDaqui: "Carry on from here",
  verDoComeco: "Start from the beginning",

  revisarIntro: "Check the summary before sending. You can go back to any step.",
  respondidas: (n, m) => `${n} of ${m} answered`,
  editar: "Edit",
  verRespostas: "See answers",
  emBranco: "Blank",
  faltamTitulo: "Some required answers are missing",
  motivoFaltam: "To send it, answer the required questions listed above.",
  erroFaltam: "Some required answers are still missing. They're listed above.",
  faltamSemJs:
    "I haven't received the questionnaire yet, because the required answers below are missing. Everything else you wrote has been saved with Varanda. Answer these questions and press Send again at the bottom of the page.",
  faltamSemJsReenvio:
    "I still have your earlier submission, but this new version hasn't reached me yet, because the required answers below are missing. What you changed has been saved with Varanda. Answer these questions and press Send again at the bottom of the page.",
  ajustesTitulo: "These answers need fixing before you send",
  motivoAjuste: "To send it, fix the answers listed above.",
  motivoCarregando: "To send it, wait for your saved answers to load.",
  noSiteTitulo: "This will appear on the website, please check it",
  noSiteSemJs: "The WhatsApp number, phone, email and address you've entered will appear on the website. Please check them before sending.",
  noSite: { whatsapp: "WhatsApp", telefone: "Landline", email: "Contact form email", endereco: "Address" },
  conferido: "I've checked: these details are right for the website.",
  privacidade: {
    comJs: "Your answers are already saved with Varanda. Sending them tells me they're ready for me to read.",
    semJs: "Sending saves your answers with Varanda and tells me they're ready for me to read.",
    antes: "They're only used to build your website and are deleted after the warranty ends, as the ",
    link: "privacy policy",
    depois: " explains.",
  },
  enviar: "Send to Varanda",
  enviando: "Sending",
  erroEnvio: "I couldn't send it just now. Anything you've already saved is still safe; try again in a few minutes or message me on WhatsApp.",
  ultimoEnvio: (quando) => `Last sent: ${quando}.`,

  recebidoTitulo: "Received.",
  recebidoTexto:
    "I'll read everything and get back to you with what's clear and what's still missing. The website timeline starts on the working day after I confirm in writing that the answers, files and access details have all arrived. Until then, you can come back to this link, make changes and send it again.",
  arquivosTitulo: "To send your logo, photos and files",
  porEmail: "By email",
  porWhatsapp: "On WhatsApp",
  documento: "On WhatsApp, attach them as a Document, not from Gallery or Photos, which compresses them.",
  msgArquivos: (empresa) => (empresa ? `Hi, I'm sending the files for ${empresa}'s website.` : "Hi, I'm sending the files for the website."),
  voltarAoFormulario: "Back to the form",
  encerradoTitulo: "This link has been closed.",
  encerradoTexto: "If you need anything, message me on WhatsApp.",
  copiaTitulo: "What was left on this device is below, so you can copy it",
  copiaRotulo: "Answers kept on this device",
  copiar: "Copy",
  copiado: "Copied.",
  fechadoTexto: "Your answers are saved. From here on, any change comes through WhatsApp, and I'll tell you first if it affects the timeline or the price.",
  foraTitulo: "The form is offline right now.",
  foraTexto: "Anything you've already saved is still safe. Try again in a few minutes or message me on WhatsApp.",
  whatsappBotao: "Message me on WhatsApp",
  msgEncerrado: "Hi, the website questionnaire link has been closed.",
  msgFechado: (empresa) => (empresa ? `Hi, I'd like to change something in the answers for ${empresa}'s website:` : "Hi, I'd like to change something in the questionnaire answers:"),
  msgFora: "Hi, the website questionnaire seems to be offline:",
};

export const TEXTOS: Record<Locale, TextosDoBriefing> = { pt, es, en };

/** O título da página, que também vira o `<title>` (ver `pagina.tsx`). */
export function tituloDoBriefing(locale: Locale): string {
  return TEXTOS[locale].titulo;
}
