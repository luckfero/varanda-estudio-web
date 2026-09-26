/**
 * As perguntas do questionário de projeto, nos três idiomas.
 *
 * Este arquivo é só dado. Quem decide o que aparece, o que se guarda e como a
 * resposta vira leitura é `nucleo.ts`; a tela e o Worker importam os dois.
 *
 * **Três regras que valem para sempre, e por quê:**
 *
 * 1. **Id publicado nunca é renomeado, reaproveitado nem apagado.** A resposta
 *    fica guardada pelo id, e a leitura de um envio antigo é montada com ele.
 *    Renomear uma chave faz a resposta do cliente sumir sem erro nenhum; e um
 *    id reaproveitado com outro sentido faz a ficha técnica ler a resposta de
 *    uma pergunta como se fosse de outra. Pergunta que sai ganha
 *    `obsoleta: true`: continua validada e guardada, só não é desenhada. O
 *    teste compara tudo com a lista congelada em `tests/briefing-ids.json`, e
 *    a única mudança aceitável naquele arquivo é acrescentar.
 * 2. **Mudar texto ou opção sobe `VERSAO`** (formato `AAAA-MM-DD.n`). A
 *    leitura grava a versão, e é por ela que se sabe qual texto o cliente viu.
 * 3. **Nenhum rótulo pt de opção cita país.** A leitura sai em português para
 *    todos os clientes, e um "No Brasil todo" gravado para uma empresa de
 *    Barcelona diria o contrário do que ela respondeu. O rótulo pt da opção é
 *    o que vai para a leitura; o que muda por país é o texto MOSTRADO, pelo
 *    campo `variante`.
 *
 * **Variantes.** `variante` troca rótulo, dica ou exemplo pelo país do link
 * (`BR`, `ES`, `OUTRO`) ou pelo pacote. Quando os dois existem para o mesmo
 * campo, vale o do pacote. O texto base continua sendo o da leitura
 * (`pergunta_pt`), e o mostrado vai em `pergunta_mostrada`. Opções também têm
 * `variante` (o esquema original não tinha): sem ela, "Pelos aplicativos
 * (iFood, Keeta, 99Food)" apareceria para uma empresa da Espanha.
 *
 * **Marcadores.** `[PAGINAS]` e `[CAPACIDADE]` são trocados pelo contexto do
 * link. Se o link não trouxer o dado, o núcleo cai para o texto base, que por
 * isso nunca tem marcador.
 *
 * **TypeScript só com sintaxe apagável** (nada de `enum`, `namespace` ou
 * parâmetro de construtor com modificador): o Node 24 roda os testes lendo
 * este arquivo direto, sem build.
 */
import { emailContato } from "../data.ts";

export type Locale = "pt" | "es" | "en";
export type Texto = { pt: string; es: string; en: string };
/* Qualquer código ISO que não seja BR ou ES cai em OUTRO (ver `paisDe`). */
export type Pais = "BR" | "ES" | "OUTRO";
export type Pacote = "essencial" | "negocio" | "profissional";
export type Capacidade = "outro_idioma" | "catalogo" | "conteudo" | "integracao";
export type Tipo = "curto" | "paragrafo" | "email" | "telefone" | "url" | "data" | "unica" | "multipla";

export interface Opcao {
  id: string; // [a-z0-9_]+
  rotulo: Texto; // o rótulo pt é o que vai para a leitura
  abre?: Texto; // abre campo de texto; a resposta mora em `${pergunta}.${opcao}`
  exclusiva?: boolean; // "Nenhuma", "Nada disso": desmarca as outras e vice-versa
  pacotes?: Pacote[];
  paises?: Pais[];
  dica?: Texto; // aparece quando esta opção está marcada
  variante?: Partial<Record<Pais | Pacote, Partial<Pick<Opcao, "rotulo" | "dica">>>>;
}

export type Condicao =
  | { pergunta: string; inclui: string[] } // unica igual a, ou multipla contendo, algum destes
  | { pergunta: string; naoInclui: string[] } // respondida e sem nenhum destes
  | { pergunta: string; minimo: number } // multipla com pelo menos N marcadas
  | { todas: Condicao[] }
  | { alguma: Condicao[] };

export interface Pergunta {
  id: string; // "grupo.nome", minúsculo, um ponto só
  tipo: Tipo;
  rotulo: Texto;
  dica?: Texto; // abaixo do rótulo
  exemplo?: Texto; // placeholder ou "Exemplo: ..." abaixo
  opcoes?: Opcao[];
  max?: number; // multipla: máximo de marcações
  obrigatoria?: boolean;
  mostrarSe?: Condicao;
  pacotes?: Pacote[];
  paises?: Pais[];
  /* Preenche só quando o rascunho não tem a chave. `idiomas_site` pré-marca a
     múltipla com os idiomas do contexto do link (o que entrou na proposta). */
  prefill?: "empresa" | "responsavel" | "email" | "instagram" | "site" | "cidade" | "cnpj" | "idiomas_site";
  sugerir?: "telefone"; // mostra "É este? [número] [Usar este número]", sem preencher
  ficha: string[]; // ["1"], ["3.direitos", "anexoA"]...
  obsoleta?: boolean;
  variante?: Partial<Record<Pais | Pacote, Partial<Pick<Pergunta, "rotulo" | "dica" | "exemplo">>>>;
}

export interface Aviso {
  id: string;
  texto: Texto;
  pacotes?: Pacote[];
  paises?: Pais[];
}

export interface Etapa {
  id: string;
  titulo: Texto;
  aviso?: Texto;
  avisos?: Aviso[];
  perguntas: Pergunta[];
}

export const VERSAO = "2026-09-25.2";

/* Limite por tipo, em unidades de `String.length` (a mesma conta do
   `maxlength` do navegador). Texto acima do limite NÃO é cortado: o Worker
   devolve erro de campo. O parágrafo é generoso e igual nos três idiomas,
   porque espanhol ocupa de 15% a 20% mais que português e o que se perderia
   num corte é justamente o texto literal do cliente. O campo que uma opção
   abre ("Outro", "Qual?") usa o limite de `curto`. */
export const LIMITES = { curto: 300, paragrafo: 5000, email: 254, telefone: 32, url: 500, data: 10 };

/* A opção de `funcoes.extras` que cada capacidade do Profissional marca e
   trava. É o que o pacote já inclui, então a caixa vem marcada e não desmarca. */
export const PERGUNTA_DA_CAPACIDADE = "funcoes.extras";
export const CAPACIDADE_OPCAO: Record<Capacidade, string> = {
  outro_idioma: "idioma",
  catalogo: "catalogo",
  conteudo: "conteudo",
  integracao: "integracao",
};

/* ---------- Ajudantes de escrita (só para este arquivo ficar legível) ---------- */

const t = (pt: string, es: string, en: string): Texto => ({ pt, es, en });

type ExtraOpcao = Omit<Opcao, "id" | "rotulo">;
const op = (id: string, rotulo: Texto, extra: ExtraOpcao = {}): Opcao => ({ id, rotulo, ...extra });
const sim = (extra: ExtraOpcao = {}) => op("sim", t("Sim", "Sí", "Yes"), extra);
const nao = (extra: ExtraOpcao = {}) => op("nao", t("Não", "No", "No"), extra);
/* A opção `nao_sei` vira estado próprio na leitura ("não sei" não é branco). */
const naoSei = () => op("nao_sei", t("Não sei", "No lo sé", "Not sure"));
const outro = () => op("outro", t("Outro", "Otro", "Other"), { abre: t("Qual?", "¿Cuál?", "Which one?") });

const inclui = (pergunta: string, ...ids: string[]): Condicao => ({ pergunta, inclui: ids });
const naoInclui = (pergunta: string, ...ids: string[]): Condicao => ({ pergunta, naoInclui: ids });
const minimo = (pergunta: string, n: number): Condicao => ({ pergunta, minimo: n });
const todas = (...c: Condicao[]): Condicao => ({ todas: c });
const alguma = (...c: Condicao[]): Condicao => ({ alguma: c });

/* Exemplos de número em cada país. Um teste confere que cada um passa por
   `telefoneE164`: exemplo que o próprio formulário recusaria é pior que nenhum. */
const EXEMPLO_CELULAR: Pergunta["variante"] = {
  BR: { exemplo: t("(11) 91234-5678", "(11) 91234-5678", "(11) 91234-5678") },
  ES: { exemplo: t("+34 612 345 678", "+34 612 345 678", "+34 612 345 678") },
  OUTRO: { exemplo: t("+44 7700 900123", "+44 7700 900123", "+44 7700 900123") },
};

/* ---------- As nove etapas ---------- */

const etapaEmpresa: Etapa = {
  id: "empresa",
  titulo: t("A empresa", "La empresa", "The business"),
  perguntas: [
    // 1
    {
      id: "empresa.nome",
      tipo: "curto",
      obrigatoria: true,
      prefill: "empresa",
      rotulo: t(
        "Nome da empresa como deve aparecer no site.",
        "Nombre de la empresa tal como debe aparecer en la web.",
        "Business name, exactly as it should appear on the website.",
      ),
      ficha: ["1"],
    },
    // 2
    {
      id: "empresa.material",
      tipo: "unica",
      rotulo: t(
        "Vocês já têm apresentação da empresa, folder ou ficha de cadastro de fornecedor?",
        "¿Tenéis ya una presentación de la empresa, folleto o ficha de alta de proveedor?",
        "Do you already have a company profile, brochure or supplier registration form?",
      ),
      opcoes: [
        op("sim", t("Sim, vou mandar junto com as fotos", "Sí, lo mando junto con las fotos", "Yes, I'll send it with the photos"), {
          dica: t(
            "Ótimo. Ela responde muita coisa daqui, então pode pular o que já estiver lá.",
            "Perfecto. Responde a buena parte de estas preguntas, así que puedes saltarte lo que ya esté ahí.",
            "Great. It answers a lot of what's here, so feel free to skip anything it already covers.",
          ),
        }),
        nao(),
      ],
      ficha: ["3"],
    },
    // 3
    {
      id: "empresa.o_que_faz",
      tipo: "paragrafo",
      obrigatoria: true,
      rotulo: t(
        "Em duas ou três frases, o que a empresa faz?",
        "En dos o tres frases, ¿a qué se dedica la empresa?",
        "In two or three sentences, what does the business do?",
      ),
      dica: t(
        "Do jeito que você explicaria para alguém que nunca comprou de vocês.",
        "Como se lo explicarías a alguien que nunca os ha comprado nada.",
        "The way you'd explain it to someone who has never bought from you.",
      ),
      ficha: ["1"],
    },
    // 4
    {
      id: "empresa.desde",
      tipo: "curto",
      rotulo: t("Desde que ano a empresa existe?", "¿Desde qué año existe la empresa?", "What year did the business start?"),
      ficha: ["3"],
    },
    // 5
    {
      id: "empresa.como_compra",
      tipo: "multipla",
      obrigatoria: true,
      rotulo: t(
        "Como o cliente compra de vocês? Marque todas que valem.",
        "¿Cómo os compran los clientes? Marca todas las que correspondan.",
        "How do customers buy from you? Tick all that apply.",
      ),
      opcoes: [
        op("vem", t("Vem até o nosso endereço", "Viene a nuestro local", "They come to our premises")),
        op("entrega", t("Pede para entregar", "Pide que se lo llevemos", "They order for delivery")),
        op("reserva", t("Reserva mesa ou marca horário", "Reserva mesa o pide cita", "They book a table or an appointment")),
        op("orcamento", t("Pede orçamento", "Pide presupuesto", "They ask for a quote")),
        op("internet", t("Compra pela internet", "Compra por internet", "They buy online")),
        op("vamos", t(
          "A gente vai até o cliente ou atende a distância",
          "Vamos nosotros al cliente o lo atendemos a distancia",
          "We go to them or serve them remotely",
        )),
      ],
      ficha: ["1", "5"],
    },
    // 6
    {
      id: "empresa.alcance",
      tipo: "unica",
      rotulo: t("Onde vocês atendem?", "¿A qué zona dais servicio?", "What area do you cover?"),
      opcoes: [
        op("cidade", t("Só na nossa cidade", "Solo en nuestra ciudad", "Only in our town or city")),
        op("regiao", t("Na região", "En la región", "In our region"), {
          variante: { ES: { rotulo: t("Na região", "En la comarca o el área metropolitana", "In our area or metropolitan region") } },
        }),
        /* O rótulo base é o da leitura, que precisa servir para os dois países;
           o brasileiro vê só "No estado". */
        op("estado", t("No estado ou comunidade autônoma", "En toda la comunidad autónoma", "Across our state or region"), {
          variante: {
            BR: { rotulo: t("No estado", "En todo el estado", "Across our state") },
            ES: { rotulo: t("Na comunidade autônoma toda", "En toda la comunidad autónoma", "Across our autonomous community") },
            OUTRO: { rotulo: t("No estado ou província", "En todo el estado o la provincia", "Across our state or region") },
          },
        }),
        op("pais", t("No país todo", "En todo el país", "Nationwide"), {
          variante: { ES: { rotulo: t("No país todo", "En toda España", "Across Spain") } },
        }),
        op("exterior", t("Também fora do país", "También fuera del país", "Internationally too"), {
          variante: { ES: { rotulo: t("Também fora do país", "También fuera de España", "Outside Spain too") } },
        }),
      ],
      ficha: ["1"],
    },
    // 7
    {
      id: "empresa.regioes",
      tipo: "curto",
      prefill: "cidade",
      mostrarSe: inclui("empresa.alcance", "cidade", "regiao", "estado"),
      rotulo: t("Quais cidades ou regiões?", "¿Qué ciudades o zonas?", "Which towns, cities or areas?"),
      exemplo: t(
        "a cidade e as vizinhas até 30 km",
        "la ciudad y los municipios a menos de 30 km",
        "the city and the towns within 30 km",
      ),
      variante: {
        BR: { exemplo: t("São Bernardo, Santo André e Diadema", "São Bernardo, Santo André y Diadema", "São Bernardo, Santo André and Diadema") },
        ES: { exemplo: t("Barcelona, L'Hospitalet e o Baix Llobregat", "Barcelona, L'Hospitalet y el Baix Llobregat", "Barcelona, L'Hospitalet and the Baix Llobregat") },
      },
      ficha: ["1"],
    },
    // 8
    {
      id: "empresa.endereco_publico",
      tipo: "unica",
      mostrarSe: inclui("empresa.como_compra", "vem"),
      rotulo: t(
        "O endereço pode aparecer no site, com mapa?",
        "¿Puede aparecer la dirección en la web, con mapa?",
        "Can your address appear on the website, with a map?",
      ),
      opcoes: [sim(), op("nao", t("Prefiro não mostrar", "Prefiero no mostrarla", "I'd rather not show it"))],
      ficha: ["4"],
    },
    // 9
    {
      id: "empresa.endereco",
      tipo: "curto",
      mostrarSe: inclui("empresa.endereco_publico", "sim"),
      rotulo: t("Endereço como deve aparecer.", "La dirección tal como debe aparecer.", "The address as it should appear."),
      ficha: ["4"],
    },
    // 10
    {
      id: "empresa.horario",
      tipo: "paragrafo",
      mostrarSe: inclui("empresa.como_compra", "vem", "entrega", "reserva"),
      rotulo: t(
        "Dias e horários de atendimento, um dia por linha.",
        "Días y horario de atención, un día por línea.",
        "Opening days and hours, one day per line.",
      ),
      exemplo: t(
        "segunda, fechado; terça a sexta, das 18h às 23h; sábado e domingo, das 12h às 23h",
        "de lunes a viernes, de 9 a 14 h y de 16 a 19 h; en agosto, de 8 a 15 h",
        "Monday, closed; Tuesday to Friday, 6pm to 11pm; Saturday and Sunday, 12pm to 11pm",
      ),
      dica: t(
        "Se a entrega ou os feriados tiverem outro horário, escreva também.",
        "Si el reparto o los festivos tienen otro horario, escríbelo también.",
        "If deliveries or public holidays have different hours, add those too.",
      ),
      ficha: ["4"],
    },
    // 11
    {
      id: "empresa.nome_fiscal",
      tipo: "curto",
      rotulo: t("Nome oficial", "Nombre fiscal", "Registered legal name"),
      variante: {
        BR: {
          rotulo: t(
            "Nome oficial (razão social), se for aparecer no rodapé do site.",
            "Nombre oficial de la empresa (razão social), si va a aparecer al pie de la web.",
            "Official company name (razão social), if it will appear in the website footer.",
          ),
          dica: t(
            "No MEI, o nome oficial costuma ser o nome completo do dono. Se não quiser que ele apareça, deixe em branco.",
            "En un MEI, el nombre oficial suele ser el nombre completo del dueño. Si no quieres que aparezca, déjalo en blanco.",
            "For an MEI, the official name is usually the owner's full name. If you'd rather it didn't appear, leave this blank.",
          ),
        },
        ES: {
          rotulo: t(
            "Nome fiscal: a razão social ou, se você é autônomo, seu nome e sobrenomes.",
            "Nombre fiscal: la razón social o, si eres autónomo, tu nombre y apellidos.",
            "Legal name: the company's registered name or, if you're self-employed, your full name.",
          ),
        },
        OUTRO: {
          rotulo: t("Nome oficial registrado da empresa.", "Nombre legal registrado de la empresa.", "Registered legal name."),
        },
      },
      ficha: ["11"],
    },
    // 12
    {
      id: "empresa.id_fiscal",
      tipo: "curto",
      prefill: "cnpj",
      rotulo: t(
        "Identificação fiscal (CNPJ, NIF ou VAT)",
        "Identificación fiscal (CNPJ, NIF o VAT)",
        "Tax or company number (CNPJ, NIF or VAT)",
      ),
      variante: {
        BR: { rotulo: t("CNPJ que vai no rodapé do site.", "CNPJ que irá al pie de la web.", "CNPJ to go in the website footer.") },
        ES: { rotulo: t("NIF.", "NIF.", "NIF.") },
        OUTRO: {
          rotulo: t(
            "Número de registro da empresa e número de VAT, se tiverem.",
            "Número de registro de la empresa y número de IVA (VAT), si los tenéis.",
            "Company registration number and VAT number, if you have them.",
          ),
        },
      },
      ficha: ["11"],
    },
    // 13
    {
      id: "empresa.domicilio",
      tipo: "curto",
      paises: ["ES", "OUTRO"],
      rotulo: t("Endereço fiscal ou sede registrada", "Domicilio social o fiscal", "Registered office address"),
      variante: {
        ES: {
          rotulo: t("Endereço fiscal ou da sede social.", "Domicilio social o fiscal.", "Registered or tax address."),
          dica: t(
            "Vai no aviso legal do site, que na Espanha é obrigatório.",
            "Va en el aviso legal de la web, que en España es obligatorio.",
            "It goes in the website's legal notice, which is compulsory in Spain.",
          ),
        },
        OUTRO: {
          rotulo: t("Endereço da sede registrada.", "Dirección del domicilio social.", "Registered office address."),
          dica: t(
            "Vai no aviso legal e na política de privacidade do site.",
            "Va en el aviso legal y en la política de privacidad de la web.",
            "It goes in the website's legal notice and privacy policy.",
          ),
        },
      },
      ficha: ["11"],
    },
    // 14
    {
      id: "empresa.registro",
      tipo: "curto",
      paises: ["ES"],
      rotulo: t("Registro Mercantil", "Registro Mercantil", "Companies register details"),
      variante: {
        ES: {
          rotulo: t(
            "Se forem sociedade, os dados do Registro Mercantil: tomo, fólio e folha. Estão na escritura ou numa nota simples.",
            "Si sois sociedad, los datos del Registro Mercantil: tomo, folio y hoja. Están en la escritura o en una nota simple.",
            "If you're a company, your Registro Mercantil details: volume (tomo), folio and sheet (hoja). They're on your deed of incorporation or a nota simple.",
          ),
        },
      },
      ficha: ["11"],
    },
  ],
};

const etapaContato: Etapa = {
  id: "contato",
  titulo: t("Contato e quem decide", "Contacto y quién decide", "Contact details and who decides"),
  perguntas: [
    // 15
    {
      id: "preenchimento.quem",
      tipo: "curto",
      prefill: "responsavel",
      rotulo: t(
        "Quem está respondendo? Nome e o que você faz na empresa.",
        "¿Quién está respondiendo? Tu nombre y qué haces en la empresa.",
        "Who is filling this in? Your name and what you do in the business.",
      ),
      ficha: ["14", "anexoA"],
    },
    // 16. NUNCA pré-preenchida: quem recebeu o link não é, por isso, quem decide.
    {
      id: "aprovacao.responsavel",
      tipo: "curto",
      obrigatoria: true,
      rotulo: t(
        "Quem tem a palavra final sobre o site? Nome e o que a pessoa é na empresa.",
        "¿Quién tiene la última palabra sobre la web? Nombre y cargo en la empresa.",
        "Who has the final say on the website? Name and role in the business.",
      ),
      exemplo: t("Ana, sócia", "Ana, socia", "Ana, co-owner"),
      dica: t(
        "A aprovação final é de uma pessoa só, como está no contrato.",
        "La aprobación final la da una sola persona, como pone en el contrato.",
        "Final approval comes from one person only, as the contract says.",
      ),
      ficha: ["1", "anexoA"],
    },
    // 17
    {
      id: "aprovacao.whatsapp",
      tipo: "telefone",
      rotulo: t(
        "WhatsApp de quem aprova, se não for o mesmo em que a gente já conversa.",
        "WhatsApp de quien aprueba, si no es el mismo por el que ya hablamos.",
        "WhatsApp number of the person who approves, if it isn't the one we already chat on.",
      ),
      variante: EXEMPLO_CELULAR,
      ficha: ["anexoA"],
    },
    // 18
    {
      id: "aprovacao.opinam",
      tipo: "unica",
      rotulo: t(
        "Mais alguém dá opinião antes de ir ao ar?",
        "¿Alguien más da su opinión antes de publicarla?",
        "Does anyone else give their opinion before it goes live?",
      ),
      opcoes: [
        op("nao", t("Não, só essa pessoa", "No, solo esa persona", "No, just that person")),
        sim({ abre: t("Quem? Basta o cargo.", "¿Quién? Basta con el cargo.", "Who? Their role is enough.") }),
      ],
      dica: t(
        "A opinião dos outros chega pela pessoa que aprova, numa lista só.",
        "Las opiniones de los demás llegan a través de quien aprueba, en una sola lista.",
        "Other people's opinions come through the person who approves, in a single list.",
      ),
      ficha: ["1", "anexoA"],
    },
    // 19
    {
      id: "aprovacao.acompanha",
      tipo: "unica",
      rotulo: t(
        "Quando quem aprova quer ver o site?",
        "¿Cuándo quiere ver la web quien aprueba?",
        "When does the person who approves want to see the site?",
      ),
      opcoes: [
        op("sempre", t(
          "Desde a primeira apresentação, e em cada entrega",
          "Desde la primera presentación, y en cada entrega",
          "From the first presentation, and at each delivery",
        )),
        op("final", t("Só no final", "Solo al final", "Only at the end"), {
          dica: t(
            "Ajuda muito ver antes, nem que seja por dez minutos. É quem decide, e assim nada muda no fim.",
            "Ayuda mucho que la vea antes, aunque sean diez minutos. Es quien decide, y así nada cambia al final.",
            "It really helps to see it earlier, even for ten minutes. They're the one deciding, and that way nothing changes at the end.",
          ),
        }),
        naoSei(),
      ],
      ficha: ["14"],
    },
    // 20
    {
      id: "projeto.canal",
      tipo: "unica",
      rotulo: t(
        "Por onde prefere falar comigo durante o projeto?",
        "¿Por dónde prefieres hablar conmigo durante el proyecto?",
        "How would you rather talk to me during the project?",
      ),
      opcoes: [
        op("whatsapp", t("WhatsApp", "WhatsApp", "WhatsApp")),
        op("email", t("E-mail", "Correo electrónico", "Email")),
        op("tanto_faz", t("Tanto faz", "Me da igual", "Either is fine")),
      ],
      ficha: ["anexoA"],
    },
    // 21
    {
      id: "contato.whatsapp",
      tipo: "telefone",
      sugerir: "telefone",
      rotulo: t(
        "WhatsApp que vai receber os clientes pelo site.",
        "WhatsApp donde queréis recibir a los clientes de la web.",
        "WhatsApp number for enquiries from the website.",
      ),
      variante: {
        BR: {
          rotulo: t(
            "WhatsApp que vai receber os clientes pelo site, com DDD.",
            "WhatsApp donde queréis recibir a los clientes de la web, con el prefijo de zona (DDD).",
            "WhatsApp number for enquiries from the website, with the area code (DDD).",
          ),
          exemplo: t("(11) 91234-5678", "(11) 91234-5678", "(11) 91234-5678"),
        },
        ES: {
          rotulo: t(
            "WhatsApp que vai receber os clientes pelo site, com o código do país. Por exemplo: +34 612 345 678.",
            "WhatsApp donde queréis recibir a los clientes de la web, con el prefijo del país. Por ejemplo: +34 612 345 678.",
            "WhatsApp number for enquiries from the website, with the country code. For example: +34 612 345 678.",
          ),
        },
        OUTRO: {
          rotulo: t(
            "WhatsApp que vai receber os clientes pelo site, com o código do país. Deixe em branco se vocês não usam WhatsApp com clientes.",
            "WhatsApp donde queréis recibir a los clientes de la web, con el prefijo del país. Déjalo en blanco si no usáis WhatsApp con los clientes.",
            "WhatsApp number for enquiries from the website, with the country code. Leave it blank if you don't use WhatsApp with customers.",
          ),
          exemplo: t("+44 7700 900123", "+44 7700 900123", "+44 7700 900123"),
        },
      },
      ficha: ["4", "5"],
    },
    // 22
    {
      id: "contato.recados",
      tipo: "unica",
      rotulo: t(
        "As mensagens do formulário do site chegam onde?",
        "¿Dónde queréis recibir los mensajes del formulario de la web?",
        "Where should messages from the website's contact form go?",
      ),
      opcoes: [
        op("whatsapp", t("No WhatsApp", "En WhatsApp", "To WhatsApp")),
        op("email", t("No e-mail", "En el correo", "To email")),
        op("os_dois", t("Nos dois", "En los dos", "Both")),
        op("tanto_faz", t("Tanto faz, o que for mais simples", "Me da igual, lo más sencillo", "Whichever is simplest")),
      ],
      ficha: ["5", "11"],
    },
    // 23
    {
      id: "contato.email",
      tipo: "email",
      prefill: "email",
      mostrarSe: inclui("contato.recados", "email", "os_dois"),
      rotulo: t("Qual e-mail recebe essas mensagens?", "¿Qué correo recibe esos mensajes?", "Which email address receives those messages?"),
      ficha: ["5"],
    },
    // 24
    {
      id: "contato.telefone",
      tipo: "telefone",
      rotulo: t("Telefone fixo, se for aparecer no site.", "Teléfono fijo, si va a aparecer en la web.", "Landline number, if it will appear on the site."),
      variante: {
        BR: { exemplo: t("(11) 4123-4567", "(11) 4123-4567", "(11) 4123-4567") },
        ES: { exemplo: t("+34 93 123 45 67", "+34 93 123 45 67", "+34 93 123 45 67") },
        OUTRO: { exemplo: t("+44 20 7946 0000", "+44 20 7946 0000", "+44 20 7946 0000") },
      },
      ficha: ["4"],
    },
    // 25
    {
      id: "contato.redes",
      tipo: "paragrafo",
      prefill: "instagram",
      rotulo: t(
        "Perfis que entram no site, um por linha, do jeito que aparecem.",
        "Perfiles que van en la web, uno por línea, tal como aparecen.",
        "Social profiles to show on the site, one per line, exactly as they appear.",
      ),
      exemplo: t(
        "@suaempresa no Instagram, e o endereço da página no Facebook, TikTok, YouTube ou LinkedIn",
        "@tuempresa en Instagram, y la dirección de la página en Facebook, TikTok, YouTube o LinkedIn",
        "@yourcompany on Instagram, and the page address on Facebook, TikTok, YouTube or LinkedIn",
      ),
      ficha: ["4"],
    },
  ],
};

/* A mesma condição vale para as duas perguntas de orçamento. */
const QUER_ORCAMENTO = alguma(
  inclui("objetivo.servir", "orcamento"),
  inclui("objetivo.acao", "orcamento"),
  inclui("empresa.como_compra", "orcamento"),
);

const etapaObjetivo: Etapa = {
  id: "objetivo",
  titulo: t("Para que o site serve", "Para qué sirve la web", "What the website is for"),
  perguntas: [
    // 26
    {
      id: "objetivo.servir",
      tipo: "multipla",
      max: 3,
      obrigatoria: true,
      rotulo: t(
        "Para que o site precisa servir? Marque até três.",
        "¿Para qué tiene que servir la web? Marca hasta tres.",
        "What does the website need to do? Tick up to three.",
      ),
      opcoes: [
        op("whatsapp", t("Trazer pedidos e conversas no WhatsApp", "Traer pedidos y conversaciones por WhatsApp", "Bring in orders and conversations on WhatsApp")),
        op("orcamento", t("Receber pedidos de orçamento", "Recibir peticiones de presupuesto", "Receive quote requests")),
        op("oferta", t("Mostrar o cardápio, os produtos ou os serviços", "Mostrar la carta, los productos o los servicios", "Show the menu, products or services")),
        op("trabalhos", t("Mostrar trabalhos já feitos", "Mostrar trabajos ya hechos", "Show past work")),
        op("onde", t("Mostrar onde fica e o horário", "Mostrar dónde estáis y el horario", "Show where you are and your hours")),
        op("app", t("Levar para o pedido no aplicativo de entrega", "Llevar al pedido en la app de reparto", "Send people to order on a delivery app")),
        op("reservas", t("Receber reservas e eventos", "Recibir reservas y eventos", "Take bookings and events")),
        op("confianca", t(
          "Passar confiança para quem já ouviu falar de vocês",
          "Dar confianza a quien ya ha oído hablar de vosotros",
          "Reassure people who have already heard of you",
        )),
        op("google", t(
          "Ser encontrado no Google por quem ainda não conhece",
          "Que os encuentre en Google quien aún no os conoce",
          "Be found on Google by people who don't know you yet",
        )),
        op("fornecedor", t(
          "Atender cadastro de fornecedor em empresa maior",
          "Cumplir con el alta de proveedor en empresas grandes",
          "Meet supplier registration requirements at larger companies",
        )),
        outro(),
      ],
      ficha: ["1"],
    },
    // 27
    {
      id: "objetivo.acao",
      tipo: "unica",
      obrigatoria: true,
      rotulo: t(
        "Quando alguém entra no site, o que você mais quer que a pessoa faça?",
        "Cuando alguien entra en la web, ¿qué es lo que más quieres que haga?",
        "When someone visits the site, what do you most want them to do?",
      ),
      opcoes: [
        op("whatsapp", t("Chamar no WhatsApp", "Escribir por WhatsApp", "Message on WhatsApp")),
        op("ligar", t("Ligar", "Llamar", "Call")),
        op("orcamento", t("Pedir orçamento pelo site", "Pedir presupuesto por la web", "Request a quote through the site")),
        op("email", t("Mandar e-mail", "Enviar un correo", "Send an email")),
        op("ir", t("Vir até o endereço", "Venir al local", "Visit in person")),
        op("app", t("Pedir pelo aplicativo de entrega", "Pedir por la app de reparto", "Order through a delivery app")),
        op("reservar", t("Reservar mesa ou evento", "Reservar mesa o evento", "Book a table or event")),
        op("comprar", t("Comprar pelo site", "Comprar en la web", "Buy on the site")),
        op("agendar", t("Agendar horário", "Pedir cita", "Book an appointment")),
        outro(),
      ],
      ficha: ["4"],
    },
    // 28
    {
      id: "objetivo.orcamento",
      tipo: "paragrafo",
      mostrarSe: QUER_ORCAMENTO,
      rotulo: t(
        "Para dar um orçamento, o que vocês precisam saber do cliente?",
        "Para dar un presupuesto, ¿qué necesitáis saber del cliente?",
        "To give a quote, what do you need to know from the customer?",
      ),
      exemplo: t(
        "quantidade, material, medida, prazo, endereço da obra",
        "cantidad, material, medidas, plazo, dirección de la obra",
        "quantity, material, dimensions, deadline, site address",
      ),
      ficha: ["5", "11"],
    },
    // 29
    {
      id: "objetivo.orcamento_arquivo",
      tipo: "unica",
      mostrarSe: QUER_ORCAMENTO,
      rotulo: t(
        "O pedido de orçamento costuma vir com arquivo?",
        "¿Las peticiones de presupuesto suelen llegar con algún archivo?",
        "Do quote requests usually come with a file?",
      ),
      opcoes: [
        nao(),
        op("desenho", t("Sim, com desenho ou projeto", "Sí, con plano o proyecto", "Yes, with a drawing or plans")),
        op("foto", t("Sim, com foto", "Sí, con foto", "Yes, with a photo")),
        op("planilha", t("Sim, com planilha ou lista", "Sí, con hoja de cálculo o lista", "Yes, with a spreadsheet or list")),
      ],
      ficha: ["5"],
    },
    // 30
    {
      id: "objetivo.canais_hoje",
      tipo: "multipla",
      rotulo: t("Como os clientes chegam até vocês hoje?", "¿Cómo os llegan los clientes hoy?", "How do customers find you today?"),
      opcoes: [
        op("indicacao", t("Indicação", "Recomendación", "Word of mouth")),
        op("perto", t("Moram perto ou passam na frente", "Viven cerca o pasan por delante", "They live nearby or walk past")),
        op("google", t("Google", "Google", "Google")),
        op("instagram", t("Instagram", "Instagram", "Instagram")),
        op("tiktok", t("TikTok", "TikTok", "TikTok")),
        op("whatsapp", t("WhatsApp", "WhatsApp", "WhatsApp")),
        op("app", t("Aplicativo de entrega", "App de reparto", "Delivery app")),
        op("portal", t("Portal ou marketplace do setor", "Portal o marketplace del sector", "Industry directory or marketplace")),
        op("visita", t("Visita comercial", "Visita comercial", "Sales visits")),
        op("feira", t("Feira ou evento", "Feria o evento", "Trade fair or event")),
        outro(),
      ],
      ficha: ["1"],
    },
    // 31
    {
      id: "objetivo.sucesso",
      tipo: "paragrafo",
      pacotes: ["negocio", "profissional"],
      rotulo: t(
        "Daqui a seis meses, o que precisa ter acontecido para você dizer que o site valeu? E o que ele precisa resolver que hoje o Instagram, o WhatsApp e a indicação não resolvem?",
        "Dentro de seis meses, ¿qué tiene que haber pasado para que digas que la web ha merecido la pena? ¿Y qué tiene que resolver que hoy no resuelven Instagram, WhatsApp y el boca a boca?",
        "Six months from now, what needs to have happened for you to say the website was worth it? And what does it need to solve that Instagram, WhatsApp and word of mouth don't solve today?",
      ),
      exemplo: t(
        "mais pedidos direto no WhatsApp; passar no cadastro de fornecedor de uma empresa",
        "más pedidos directos por WhatsApp; pasar la homologación de proveedor de una empresa",
        "more orders straight to WhatsApp; getting through a larger company's supplier approval",
      ),
      ficha: ["1"],
    },
    // 32
    {
      id: "presenca.busca",
      tipo: "paragrafo",
      rotulo: t(
        "Como alguém procuraria vocês no Google? Escreva do jeito que um cliente digitaria.",
        "¿Cómo os buscaría alguien en Google? Escríbelo como lo escribiría un cliente.",
        "How would someone search for you on Google? Write it the way a customer would type it.",
      ),
      exemplo: t(
        "usinagem CNC na sua cidade; restaurante aberto domingo perto de mim",
        "mecanizado CNC en tu ciudad; restaurante abierto el domingo cerca de mí",
        "CNC machining in your town; restaurant open on Sunday near me",
      ),
      variante: {
        BR: {
          exemplo: t(
            "restaurante aberto domingo em Santo André; usinagem CNC em São Bernardo",
            "restaurante abierto el domingo en Santo André; mecanizado CNC en São Bernardo",
            "restaurant open on Sunday in Santo André; CNC machining in São Bernardo",
          ),
        },
        ES: {
          rotulo: t(
            "Como alguém procuraria vocês no Google? Escreva do jeito que um cliente digitaria, em castelhano e, se também procuram vocês em catalão, em catalão.",
            "¿Cómo os buscaría alguien en Google? Escríbelo como lo escribiría un cliente, en castellano y, si también os buscan en catalán, en catalán.",
            "How would someone search for you on Google? Write it the way a customer would type it, in Spanish and, if people also search for you in Catalan, in Catalan.",
          ),
          exemplo: t(
            "mecanizado CNC en Sabadell / mecanitzat CNC a Sabadell",
            "mecanizado CNC en Sabadell / mecanitzat CNC a Sabadell",
            "mecanizado CNC en Sabadell / mecanitzat CNC a Sabadell",
          ),
        },
      },
      ficha: ["11"],
    },
  ],
};

const etapaPublico: Etapa = {
  id: "publico",
  titulo: t("Quem compra de vocês", "Quién os compra", "Who buys from you"),
  perguntas: [
    // 33
    {
      id: "publico.tipo",
      tipo: "unica",
      rotulo: t("Vocês vendem para:", "Vendéis a:", "You sell to:"),
      opcoes: [
        op("empresas", t("Empresas", "Empresas", "Businesses")),
        op("pessoas", t("Pessoas", "Particulares", "Individuals")),
        op("os_dois", t("Os dois", "Los dos", "Both")),
      ],
      ficha: ["1"],
    },
    // 34
    {
      id: "publico.quem",
      tipo: "paragrafo",
      rotulo: t("Quem é o cliente típico?", "¿Quién es el cliente típico?", "Who is your typical customer?"),
      exemplo: t(
        "comprador de indústria; famílias do bairro; administrador de condomínio",
        "el responsable de compras de una fábrica; familias del barrio; administradores de fincas",
        "purchasing managers at manufacturers; local families; property managers",
      ),
      variante: {
        BR: {
          exemplo: t(
            "comprador de indústria no ABC; famílias do bairro; síndico de condomínio",
            "comprador de industria en el ABC; familias del barrio; administrador de comunidad de vecinos",
            "factory buyers in the ABC region; local families; building managers",
          ),
        },
        ES: {
          exemplo: t(
            "o responsável de compras de uma fábrica de automóveis do Vallès; famílias do bairro; administradores de condomínio",
            "el responsable de compras de una fábrica de automoción del Vallès; familias del barrio; administradores de fincas",
            "the purchasing manager at a car-parts factory in the Vallès; local families; property managers",
          ),
        },
      },
      ficha: ["1"],
    },
    // 35
    {
      id: "publico.momento",
      tipo: "paragrafo",
      rotulo: t(
        "O que está acontecendo com o cliente no dia em que ele procura vocês?",
        "¿Qué le está pasando al cliente el día que os busca?",
        "What's going on for the customer on the day they look for you?",
      ),
      exemplo: t(
        "a máquina parou e ele precisa da peça na mesma semana; é aniversário e ele quer reservar para vinte pessoas",
        "se le ha parado la máquina y necesita la pieza esa misma semana; es su cumpleaños y quiere reservar para veinte personas",
        "a machine has broken down and they need the part that same week; it's a birthday and they want to book for twenty people",
      ),
      ficha: ["1", "4"],
    },
    // 36
    {
      id: "publico.particular",
      tipo: "multipla",
      rotulo: t(
        "O cliente de vocês tem alguma destas características?",
        "¿Vuestros clientes tienen alguna de estas características?",
        "Do your customers have any of these characteristics?",
      ),
      opcoes: [
        op("idosos", t("Muita gente com mais de 60 anos", "Mucha gente de más de 60 años", "Lots of people over 60")),
        op("deficiencia", t("Pessoas com deficiência visual ou auditiva", "Personas con discapacidad visual o auditiva", "People with sight or hearing impairments")),
        op("pressa", t("Gente com pressa, que lê pouco", "Gente con prisa, que lee poco", "People in a hurry who don't read much")),
        op("celular", t(
          "Entra quase só pelo celular, às vezes com internet fraca",
          "Entra casi solo desde el móvil, a veces con mala conexión",
          "They visit almost only on mobile, sometimes with a weak connection",
        )),
        op("nada", t("Nada em especial", "Nada en especial", "Nothing in particular"), { exclusiva: true }),
        outro(),
      ],
      ficha: ["9", "1"],
    },
    // 37
    {
      id: "publico.perguntas",
      tipo: "paragrafo",
      rotulo: t(
        "O que o cliente sempre pergunta antes de fechar, e o que faz ele desistir?",
        "¿Qué pregunta siempre el cliente antes de decidirse, y qué le hace echarse atrás?",
        "What do customers always ask before they commit, and what makes them change their mind?",
      ),
      exemplo: t(
        "tem estacionamento, aceita vale-refeição, qual o prazo, atende sábado",
        "si hay aparcamiento, si aceptáis tarjeta, qué plazo tenéis, si abrís el sábado",
        "is there parking, do you take cards, how long it takes, are you open on Saturdays",
      ),
      dica: t(
        "Costuma ser a resposta mais útil de todo o questionário.",
        "Suele ser la respuesta más útil de todo el cuestionario.",
        "This is often the most useful answer in the whole questionnaire.",
      ),
      variante: {
        negocio: {
          dica: t(
            "Costuma ser a resposta mais útil de todo o questionário. É daqui que sai a parte de dúvidas do site.",
            "Suele ser la respuesta más útil de todo el cuestionario. De aquí sale la sección de preguntas frecuentes de la web.",
            "This is often the most useful answer in the whole questionnaire. It's where the site's FAQ section comes from.",
          ),
        },
        profissional: {
          dica: t(
            "Costuma ser a resposta mais útil de todo o questionário. É daqui que sai a parte de dúvidas do site.",
            "Suele ser la respuesta más útil de todo el cuestionario. De aquí sale la sección de preguntas frecuentes de la web.",
            "This is often the most useful answer in the whole questionnaire. It's where the site's FAQ section comes from.",
          ),
        },
      },
      ficha: ["4"],
    },
    // 38
    {
      id: "publico.concorrentes",
      tipo: "paragrafo",
      pacotes: ["negocio", "profissional"],
      rotulo: t(
        "Com quem o cliente compara vocês? E qual concorrente vocês respeitam, e o que ele faz bem?",
        "¿Con quién os compara el cliente? ¿Y qué competidor respetáis, y qué hace bien?",
        "Who do customers compare you with? And which competitor do you respect, and what do they do well?",
      ),
      dica: t(
        "Nome, site ou @ do Instagram, um por linha.",
        "Nombre, web o @ de Instagram, uno por línea.",
        "Name, website or Instagram handle, one per line.",
      ),
      ficha: ["6", "1"],
    },
  ],
};

const COMPRA_NO_LUGAR = todas(inclui("empresa.como_compra", "vem"), inclui("publico.tipo", "pessoas", "os_dois"));

const etapaOferta: Etapa = {
  id: "oferta",
  titulo: t("O que vocês vendem", "Qué vendéis", "What you sell"),
  perguntas: [
    // 39
    {
      id: "oferta.itens",
      tipo: "paragrafo",
      obrigatoria: true,
      rotulo: t(
        "O que vocês vendem? Um por linha, começando pelo que mais importa agora.",
        "¿Qué vendéis? Uno por línea, empezando por lo que más importa ahora.",
        "What do you sell? One per line, starting with what matters most right now.",
      ),
      dica: t(
        "Se já existe cardápio ou catálogo, escreva só os principais e mande o arquivo.",
        "Si ya tenéis carta o catálogo, escribe solo lo principal y manda el archivo.",
        "If there's already a menu or catalogue, just write the main items and send the file.",
      ),
      ficha: ["4"],
    },
    // 40
    {
      id: "oferta.lista_pronta",
      tipo: "unica",
      rotulo: t(
        "Vocês têm cardápio, tabela de preços ou catálogo pronto?",
        "¿Tenéis carta, lista de precios o catálogo ya hecho?",
        "Do you have a ready-made menu, price list or catalogue?",
      ),
      opcoes: [
        op("pdf", t("Sim, em PDF ou foto do impresso", "Sí, en PDF o foto del impreso", "Yes, as a PDF or a photo of the printed one"), {
          dica: t(
            "Mande junto com as fotos. Não precisa digitar.",
            "Mándalo junto con las fotos. No hace falta escribirlo.",
            "Send it with the photos. No need to type it out.",
          ),
        }),
        op("digital", t("Sim, num aplicativo ou cardápio digital", "Sí, en una app o carta digital", "Yes, in an app or digital menu")),
        op("instagram", t("Sim, só no Instagram", "Sí, solo en Instagram", "Yes, only on Instagram")),
        op("nao", t("Não temos", "No tenemos", "No, we don't")),
      ],
      ficha: ["4", "3"],
    },
    // 41
    {
      id: "oferta.lista_link",
      tipo: "url",
      mostrarSe: inclui("oferta.lista_pronta", "digital"),
      rotulo: t("Link do cardápio ou do catálogo.", "Enlace de la carta o del catálogo.", "Link to the menu or catalogue."),
      ficha: ["4"],
    },
    // 42
    {
      id: "oferta.estrutura",
      tipo: "paragrafo",
      mostrarSe: inclui("publico.tipo", "empresas", "os_dois"),
      rotulo: t(
        "Que estrutura vocês têm para mostrar? Máquinas, equipamentos, frota, tamanho do espaço, quantas pessoas.",
        "¿Qué medios tenéis para mostrar? Maquinaria, equipos, flota, tamaño de las instalaciones, cuántas personas.",
        "What set-up do you have to show? Machinery, equipment, vehicles, size of the premises, how many staff.",
      ),
      dica: t(
        "Pode ser a lista que vocês já mandam em cadastro de fornecedor.",
        "Puede ser la lista que ya mandáis en las altas de proveedor.",
        "It can be the list you already send when registering as a supplier.",
      ),
      ficha: ["4"],
    },
    // 43
    {
      id: "oferta.precos",
      tipo: "unica",
      rotulo: t("Os preços aparecem no site?", "¿Los precios aparecen en la web?", "Will prices appear on the site?"),
      opcoes: [
        op("todos", t("Todos", "Todos", "All of them"), { dica: DICA_PRECO() }),
        op("alguns", t("Alguns", "Algunos", "Some"), { dica: DICA_PRECO() }),
        op("orcamento", t("Não, só sob orçamento", "No, solo bajo presupuesto", "No, quote only")),
        /* O rótulo aqui é "Ainda não sei", como está escrito para esta pergunta. */
        op("nao_sei", t("Ainda não sei", "Aún no lo sé", "Not sure yet")),
      ],
      ficha: ["4"],
    },
    // 44
    {
      id: "oferta.imposto",
      tipo: "unica",
      paises: ["ES", "OUTRO"],
      mostrarSe: inclui("oferta.precos", "todos", "alguns"),
      rotulo: t("Os preços incluem o imposto (IVA)?", "¿Los precios incluyen el impuesto (IVA)?", "Do the prices include tax (VAT)?"),
      variante: {
        ES: {
          rotulo: t(
            "Os preços que vocês vão me mandar já incluem o IVA?",
            "¿Los precios que me vais a pasar llevan el IVA incluido?",
            "Do the prices you'll send me include VAT?",
          ),
          dica: t(
            "Se vendem para pessoas, no site eles precisam aparecer com o IVA incluído.",
            "Si vendéis a particulares, en la web tienen que aparecer con el IVA incluido.",
            "If you sell to consumers, they must be shown on the site with VAT included.",
          ),
        },
        OUTRO: {
          rotulo: t(
            "Os preços que vocês vão me mandar já incluem o imposto sobre a venda (VAT ou equivalente)?",
            "¿Los precios que me vais a pasar incluyen el impuesto sobre la venta (IVA o equivalente)?",
            "Do the prices you'll send me include VAT or sales tax?",
          ),
        },
      },
      opcoes: [sim(), nao(), op("depende", t("Depende do produto", "Depende del producto", "It varies"))],
      ficha: ["4"],
    },
    // 45
    {
      id: "entrega.como",
      tipo: "unica",
      mostrarSe: inclui("empresa.como_compra", "entrega"),
      rotulo: t("Como a entrega funciona hoje?", "¿Cómo funciona hoy el reparto?", "How does delivery work today?"),
      opcoes: [
        op("proprio", t("Pelo nosso WhatsApp ou telefone", "Por nuestro WhatsApp o teléfono", "Through our own WhatsApp or phone")),
        /* Os aplicativos mudam de país para país; a leitura fica com o rótulo neutro. */
        op("apps", t("Pelos aplicativos de entrega", "Por las apps de reparto", "Through delivery apps"), {
          variante: {
            BR: { rotulo: t("Pelos aplicativos (iFood, Keeta, 99Food)", "Por las apps (iFood, Keeta, 99Food)", "Through the apps (iFood, Keeta, 99Food)") },
            ES: { rotulo: t("Pelos aplicativos (Glovo, Uber Eats, Just Eat)", "Por las apps (Glovo, Uber Eats, Just Eat)", "Through the apps (Glovo, Uber Eats, Just Eat)") },
          },
        }),
        op("os_dois", t("Pelos dois", "Por las dos vías", "Both")),
      ],
      ficha: ["5"],
    },
    // 46
    {
      id: "entrega.apps",
      tipo: "paragrafo",
      mostrarSe: inclui("entrega.como", "apps", "os_dois"),
      rotulo: t(
        "Link da loja de vocês em cada aplicativo, um por linha.",
        "Enlace de vuestra tienda en cada app, uno por línea.",
        "Link to your shop page on each app, one per line.",
      ),
      ficha: ["5"],
    },
    // 47
    {
      id: "entrega.destino",
      tipo: "unica",
      mostrarSe: inclui("entrega.como", "os_dois"),
      rotulo: t(
        "Quem quer pedir pelo site vai para onde?",
        "Quien quiera pedir desde la web, ¿adónde va?",
        "Where should people who want to order from the site go?",
      ),
      opcoes: [
        op("whatsapp", t("Para o nosso WhatsApp", "A nuestro WhatsApp", "To our WhatsApp")),
        op("app", t("Para o aplicativo", "A la app", "To the app")),
        op("escolhe", t("A pessoa escolhe", "Que elija la persona", "They choose")),
      ],
      ficha: ["4"],
    },
    // 48
    {
      id: "entrega.area",
      tipo: "curto",
      mostrarSe: inclui("empresa.como_compra", "entrega"),
      rotulo: t(
        "Até onde vocês entregam, e a taxa, se for aparecer.",
        "Hasta dónde repartís, y el coste de envío, si va a aparecer.",
        "How far you deliver, and the delivery charge, if it will be shown.",
      ),
      exemplo: t(
        "Centro e bairros vizinhos, com taxa fixa",
        "El centro y los barrios de al lado, con gastos de envío fijos",
        "The town centre and nearby areas, with a flat delivery charge",
      ),
      variante: {
        BR: {
          exemplo: t(
            "Centro e bairros vizinhos, taxa de R$ 6",
            "Centro y barrios cercanos, tasa de R$ 6",
            "The centre and nearby neighbourhoods, R$ 6 charge",
          ),
        },
      },
      ficha: ["4"],
    },
    // 49
    {
      id: "reserva.como",
      tipo: "unica",
      mostrarSe: inclui("empresa.como_compra", "reserva"),
      rotulo: t(
        "Como funciona a reserva ou o agendamento hoje?",
        "¿Cómo funcionan hoy las reservas o las citas?",
        "How do bookings or appointments work today?",
      ),
      opcoes: [
        op("whatsapp", t("Pelo WhatsApp ou telefone", "Por WhatsApp o teléfono", "By WhatsApp or phone")),
        op("sistema", t("Por um sistema de reserva ou agenda", "Con un sistema de reservas o agenda", "Through a booking or appointment system"), {
          abre: t("Qual?", "¿Cuál?", "Which one?"),
        }),
        op("grupos", t("Só para grupo ou evento", "Solo para grupos o eventos", "Only for groups or events")),
      ],
      dica: t(
        "O botão de reserva pelo WhatsApp entra no site. Sistema com horário marcado e confirmação automática é projeto à parte, com preço próprio.",
        "El botón para reservar por WhatsApp entra en la web. Un sistema con horas y confirmación automática es un proyecto aparte, con su propio precio.",
        "A WhatsApp booking button is included in the site. A system with time slots and automatic confirmation is a separate project, priced on its own.",
      ),
      ficha: ["5"],
    },
    // 50
    {
      id: "local.eventos",
      tipo: "unica",
      mostrarSe: COMPRA_NO_LUGAR,
      rotulo: t(
        "Vocês fazem evento ou fecham a casa (aniversário, confraternização de empresa)?",
        "¿Hacéis eventos o cerráis el local para grupos (cumpleaños, comidas de empresa)?",
        "Do you host events or private hire (birthdays, company parties)?",
      ),
      opcoes: [
        nao(),
        sim({ abre: t("Para quantas pessoas, e como pedem?", "¿Para cuántas personas, y cómo lo piden?", "For how many people, and how do they ask?") }),
      ],
      ficha: ["4"],
    },
    // 51
    {
      id: "local.pagamento",
      tipo: "multipla",
      mostrarSe: todas(inclui("empresa.como_compra", "vem", "entrega"), inclui("publico.tipo", "pessoas", "os_dois")),
      rotulo: t("Como o cliente pode pagar?", "¿Cómo puede pagar el cliente?", "How can customers pay?"),
      opcoes: [
        op("pix", t("Pix", "Pix", "Pix"), { paises: ["BR"] }),
        op("bizum", t("Bizum", "Bizum", "Bizum"), { paises: ["ES"] }),
        op("credito", t("Crédito", "Tarjeta de crédito", "Credit card")),
        op("debito", t("Débito", "Tarjeta de débito", "Debit card")),
        op("vale", t("Vale-refeição", "Vale de comida", "Meal voucher"), { paises: ["BR"] }),
        op("dinheiro", t("Dinheiro", "Efectivo", "Cash")),
      ],
      ficha: ["4"],
    },
    // 52
    {
      id: "local.comodidades",
      tipo: "multipla",
      mostrarSe: COMPRA_NO_LUGAR,
      rotulo: t("O que o lugar tem?", "¿Qué tiene el local?", "What does the place have?"),
      opcoes: [
        op("estacionamento", t("Estacionamento", "Aparcamiento", "Parking")),
        op("acessibilidade", t("Acesso para cadeira de rodas", "Acceso para silla de ruedas", "Wheelchair access")),
        op("criancas", t("Espaço para criança", "Zona para niños", "Children's area")),
        op("pet", t("Aceita pet", "Se admiten mascotas", "Pets welcome")),
        op("musica", t("Música ao vivo", "Música en directo", "Live music")),
        op("aberto", t("Área aberta", "Terraza o zona exterior", "Outdoor area")),
        op("nada", t("Nada disso", "Nada de esto", "None of these"), { exclusiva: true }),
      ],
      ficha: ["4"],
    },
  ],
};

/* Função e não constante: cada opção leva o próprio objeto, e o congelamento
   no fim do arquivo não esbarra em objeto compartilhado. */
function DICA_PRECO(): Texto {
  return t(
    "Preço publicado vale como oferta. Mande junto a tabela que vocês praticam hoje.",
    "Un precio publicado vale como oferta. Manda también la tabla que aplicáis hoy.",
    "A published price counts as an offer. Send the price list you use today as well.",
  );
}

const etapaProvas: Etapa = {
  id: "provas",
  titulo: t("O que prova o que vocês dizem", "Lo que demuestra lo que decís", "What backs up what you say"),
  aviso: t(
    "No site só entra prova que existe: depoimento de quem falou, selo que vocês têm, número com base. Por isso eu pergunto de onde vem cada uma. Quem responde por isso é a empresa, então é melhor acertar agora. E uma regra daqui: escreva só o que pode ir para o site. Nome de cliente que não vai aparecer, documento e o motivo de alguém ser atendido por vocês ficam de fora.",
    "Todo lo que la web muestre como prueba tiene que poder acreditarse: reseñas de clientes reales, sellos que la empresa tiene y cifras con fuente. Lo pide la normativa de publicidad y consumo, y quien responde de ello es la empresa. Por eso pregunto de dónde sale cada cosa. Y una regla de aquí: escribe solo lo que puede ir a la web. Los nombres de clientes que no van a aparecer, los documentos y el motivo por el que alguien acude a vosotros se quedan fuera.",
    "Everything the site shows as proof must be verifiable: reviews from real customers, certifications you actually hold, figures with a source. Consumer and advertising law require it, and the business is answerable for it. That's why I ask where each item comes from. And one rule here: only write what can go on the site. Leave out customer names that won't appear, any documents, and the reason someone came to you.",
  ),
  perguntas: [
    // 53
    {
      id: "regras.setor",
      tipo: "paragrafo",
      rotulo: t(
        "O ramo de vocês tem regra de conselho ou de lei sobre o que o site precisa mostrar, ou sobre o que não pode mostrar?",
        "¿Vuestro sector tiene normas de un colegio profesional o de la ley sobre lo que la web tiene que mostrar, o sobre lo que no puede mostrar?",
        "Does your industry have rules, from a professional body or the law, about what the website must show or must not show?",
      ),
      exemplo: t(
        "registro no conselho profissional, licenças ou números de registro",
        "colegio profesional y número de colegiado, número de registro o licencia",
        "professional body and membership number, licence or registration numbers",
      ),
      variante: {
        BR: {
          exemplo: t(
            "número no CRM, CRO, CREA ou OAB; responsável técnico; limite para depoimento, foto de antes e depois ou preço; aviso de venda de bebida só para maiores de 18",
            "número en el CRM, CRO, CREA u OAB; responsable técnico; límites para testimonios, fotos de antes y después o precios; aviso de venta de alcohol solo a mayores de 18",
            "CRM, CRO, CREA or OAB number; technical lead; limits on testimonials, before-and-after photos or prices; a notice that alcohol is sold to over-18s only",
          ),
        },
        ES: {
          exemplo: t(
            "colégio profissional e número de colegiado, número de registro turístico, autorização sanitária",
            "colegio profesional y número de colegiado, número de registro turístico, autorización sanitaria",
            "professional association and membership number, tourist registration number, health authorisation",
          ),
        },
      },
      ficha: ["3", "11"],
    },
    // 54
    {
      id: "provas.tem",
      tipo: "multipla",
      rotulo: t("O que vocês têm para mostrar?", "¿Qué tenéis para mostrar?", "What do you have to show?"),
      opcoes: [
        op("fotos_trabalhos", t("Fotos de trabalhos feitos", "Fotos de trabajos hechos", "Photos of past work")),
        op("clientes", t("Empresas clientes que podem ser citadas", "Empresas clientes que se pueden citar", "Client companies that can be named")),
        op("depoimentos", t("Depoimentos de clientes", "Testimonios de clientes", "Customer testimonials")),
        op("certificacoes", t("Certificações, selos ou associações", "Certificaciones, sellos o asociaciones", "Certifications, accreditations or memberships")),
        op("avaliacoes", t("Avaliações na internet (Google e outras)", "Reseñas en Google u otras plataformas", "Reviews on Google or other platforms (Trustpilot, Tripadvisor)"), {
          variante: {
            BR: {
              rotulo: t(
                "Avaliações na internet (Google, iFood, Reclame Aqui e outras)",
                "Reseñas en internet (Google, iFood, Reclame Aqui y otras)",
                "Online reviews (Google, iFood, Reclame Aqui and others)",
              ),
            },
            ES: {
              rotulo: t(
                "Avaliações na internet (Google, TripAdvisor, TheFork, Doctoralia)",
                "Reseñas en Google u otras plataformas (TripAdvisor, TheFork, Doctoralia)",
                "Reviews on Google or other platforms (TripAdvisor, TheFork, Doctoralia)",
              ),
            },
          },
        }),
        op("premios", t("Prêmios ou matérias na imprensa", "Premios o artículos en prensa", "Awards or press coverage")),
        op("numeros", t(
          "Números (anos de empresa, trabalhos entregues, clientes atendidos)",
          "Cifras (años de empresa, trabajos entregados, clientes atendidos)",
          "Figures (years in business, jobs delivered, customers served)",
        )),
        op("nada", t("Nada disso ainda", "Nada de esto todavía", "None of these yet"), { exclusiva: true }),
      ],
      ficha: ["3.direitos"],
    },
    // 55
    {
      id: "provas.clientes",
      tipo: "paragrafo",
      mostrarSe: inclui("provas.tem", "clientes"),
      rotulo: t(
        "Quais empresas clientes podem ser citadas pelo nome? Uma por linha.",
        "¿Qué empresas clientes se pueden citar por su nombre? Una por línea.",
        "Which client companies can be named? One per line.",
      ),
      dica: t(
        "Se o cliente for uma pessoa, não escreva o nome aqui: diga só quantos são.",
        "Si el cliente es una persona, no escribas su nombre aquí: di solo cuántos son.",
        "If a client is an individual, don't write their name here: just say how many there are.",
      ),
      ficha: ["3.direitos"],
    },
    // 56
    {
      id: "provas.clientes_autorizacao",
      tipo: "unica",
      mostrarSe: inclui("provas.tem", "clientes"),
      rotulo: t(
        "Elas sabem e deixam aparecer o nome e o logotipo delas?",
        "¿Lo saben y dejan que aparezcan su nombre y su logotipo?",
        "Do they know, and are they happy for their name and logo to appear?",
      ),
      opcoes: [
        op("escrito", t("Sim, por escrito", "Sí, por escrito", "Yes, in writing")),
        op("boca", t("Combinado de boca", "Acordado de palabra", "Agreed verbally")),
        op("nao_perguntei", t("Ainda não perguntei", "Aún no lo he preguntado", "I haven't asked yet")),
      ],
      ficha: ["3.direitos"],
    },
    // 57
    {
      id: "provas.depoimentos",
      tipo: "paragrafo",
      mostrarSe: inclui("provas.tem", "depoimentos"),
      rotulo: t(
        "Cole os depoimentos, com o nome como deve aparecer no site.",
        "Pega los testimonios, con el nombre tal como debe aparecer en la web.",
        "Paste the testimonials, with the name as it should appear on the site.",
      ),
      dica: t(
        "Avaliação do Google copiada com o nome de quem escreveu também conta como depoimento.",
        "Una reseña de Google copiada con el nombre de quien la escribió también cuenta como testimonio.",
        "A Google review copied with the reviewer's name also counts as a testimonial.",
      ),
      ficha: ["3.direitos"],
    },
    // 58
    {
      id: "provas.depoimentos_autorizacao",
      tipo: "unica",
      mostrarSe: inclui("provas.tem", "depoimentos"),
      rotulo: t(
        "Quem deu esses depoimentos autorizou por escrito?",
        "¿Quienes dieron esos testimonios lo autorizaron por escrito?",
        "Did the people who gave these testimonials agree in writing?",
      ),
      opcoes: [
        op("todos", t("Todos", "Todos", "All of them")),
        op("alguns", t("Alguns", "Algunos", "Some")),
        op("nenhum", t("Nenhum ainda", "Ninguno todavía", "None yet")),
        naoSei(),
      ],
      ficha: ["3.direitos"],
    },
    // 59
    {
      id: "provas.certificacoes",
      tipo: "paragrafo",
      mostrarSe: inclui("provas.tem", "certificacoes"),
      rotulo: t(
        "Quais? Se tiver o certificado em PDF, mande junto com as fotos, que eu tiro o número de lá.",
        "¿Cuáles? Si tienes el certificado en PDF, mándalo con las fotos y saco el número de ahí.",
        "Which ones? If you have the certificate as a PDF, send it with the photos and I'll take the number from there.",
      ),
      ficha: ["3.direitos"],
    },
    // 60
    {
      id: "provas.avaliacoes",
      tipo: "paragrafo",
      mostrarSe: inclui("provas.tem", "avaliacoes"),
      rotulo: t("Links das páginas de avaliação, um por linha.", "Enlaces de las páginas de reseñas, uno por línea.", "Links to the review pages, one per line."),
      dica: t(
        "A nota e o número de avaliações eu leio lá, com a data.",
        "La nota y el número de reseñas los leo allí, con la fecha.",
        "I'll read the rating and number of reviews there, with the date.",
      ),
      ficha: ["3.direitos", "11"],
    },
    // 61
    {
      id: "provas.premios",
      tipo: "paragrafo",
      mostrarSe: inclui("provas.tem", "premios"),
      rotulo: t("Quais, com o link ou a fonte?", "¿Cuáles, con el enlace o la fuente?", "Which ones, with the link or source?"),
      ficha: ["3.direitos"],
    },
    // 62
    {
      id: "provas.numeros",
      tipo: "paragrafo",
      mostrarSe: inclui("provas.tem", "numeros"),
      rotulo: t("Quais números podem aparecer?", "¿Qué cifras pueden aparecer?", "Which figures can appear?"),
      exemplo: t(
        "30 anos de empresa, 18 funcionários, 2 mil ferramentas entregues",
        "30 años de empresa, 18 empleados, 2.000 herramientas entregadas",
        "30 years in business, 18 staff, 2,000 tools delivered",
      ),
      dica: t("Se for conta de cabeça, avise.", "Si es un cálculo a ojo, avísame.", "If it's a rough estimate, say so."),
      ficha: ["3.direitos"],
    },
    // 63
    {
      id: "provas.por_que",
      tipo: "paragrafo",
      rotulo: t(
        "Por que o cliente fica com vocês? Se lembrar de um trabalho que outro não conseguiu fazer, ou de como a empresa começou, conte.",
        "¿Por qué se queda el cliente con vosotros? Si recuerdas un trabajo que otro no pudo hacer, o cómo empezó la empresa, cuéntalo.",
        "Why do customers stick with you? If you remember a job someone else couldn't do, or how the business started, tell me.",
      ),
      ficha: ["1", "3"],
    },
    // 64
    {
      id: "oferta.nao_publicar",
      tipo: "paragrafo",
      rotulo: t(
        "Tem alguma informação que NÃO pode aparecer no site?",
        "¿Hay alguna información que NO pueda aparecer en la web?",
        "Is there any information that must NOT appear on the site?",
      ),
      exemplo: t(
        "preço de evento fechado; peça feita para cliente com sigilo; que um certo cliente seja citado",
        "el precio de los eventos privados; una pieza hecha para un cliente con confidencialidad; que se cite a un cliente concreto",
        "prices for private events; a part made for a client under confidentiality; naming a particular client",
      ),
      dica: t(
        "Não precisa escrever o nome do cliente: basta dizer que existe.",
        "No hace falta escribir el nombre del cliente: basta con decir que existe.",
        "No need to write the client's name: just say there is one.",
      ),
      ficha: ["3"],
    },
  ],
};

const TEM_FOTO = naoInclui("fotos.tem", "nenhuma");

const etapaArquivos: Etapa = {
  id: "arquivos",
  titulo: t("Logotipo, fotos e arquivos", "Logotipo, fotos y archivos", "Logo, photos and files"),
  avisos: [
    {
      id: "fotos_direitos",
      paises: ["BR", "OUTRO"],
      texto: t(
        "Quase nenhuma empresa é dona das próprias fotos: o direito costuma continuar com quem fotografou, e a autorização que ele deu geralmente vale só para as redes sociais. Quem publica no site sou eu, então é melhor descobrir isso agora do que depois de publicado.",
        "Casi ninguna empresa es dueña de sus propias fotos: los derechos suelen seguir siendo de quien las hizo, y el permiso que dio muchas veces vale solo para las redes sociales. Quien publica en la web soy yo, así que es mejor averiguarlo ahora que después de publicar.",
        "Hardly any business owns its own photos: the rights usually stay with the photographer, and the permission they gave often covers social media only. I'm the one publishing on the website, so it's better to find out now than after it's live.",
      ),
    },
    /* Na Espanha a cessão de direito de foto só vale por escrito, e publicar
       uma pessoa reconhecível pede o consentimento dela; o aviso se apoia na
       lei, que é o argumento que funciona com quem responde de lá. */
    {
      id: "fotos_direitos_es",
      paises: ["ES"],
      texto: t(
        "Quase nenhuma empresa é dona das próprias fotos: o direito costuma continuar com quem fotografou. Na Espanha, a cessão de direitos de uma foto precisa ser por escrito, e para publicar uma pessoa reconhecível é preciso o consentimento dela. Quem publica no site sou eu, então é melhor saber isso agora do que depois de publicado.",
        "Casi ninguna empresa es dueña de sus propias fotos: los derechos suelen seguir siendo de quien las hizo. En España, la cesión de derechos de una foto tiene que constar por escrito, y para publicar a una persona reconocible hace falta su consentimiento. Quien publica en la web soy yo, así que es mejor saberlo ahora que después de publicar.",
        "Hardly any business owns its own photos: the rights usually stay with the photographer. In Spain, a transfer of rights to a photo has to be in writing, and publishing a recognisable person needs their consent. I'm the one publishing on the website, so it's better to know now than after it's live.",
      ),
    },
  ],
  perguntas: [
    // 65
    {
      id: "visual.logo",
      tipo: "unica",
      rotulo: t("Vocês têm logotipo?", "¿Tenéis logotipo?", "Do you have a logo?"),
      opcoes: [
        sim({
          dica: t(
            "Mande o maior arquivo que tiver, que eu vejo se serve.",
            "Manda el archivo más grande que tengas y miro si sirve.",
            "Send the largest file you have and I'll check whether it works.",
          ),
        }),
        nao({
          dica: t(
            "Eu não crio logotipo. Sem logotipo, o nome da empresa aparece escrito com a tipografia do site, e dá para trocar depois.",
            "No diseño logotipos. Sin logotipo, el nombre de la empresa aparece escrito con la tipografía de la web, y se puede cambiar más adelante.",
            "I don't design logos. Without one, the business name appears set in the site's typeface, and it can be swapped later.",
          ),
        }),
      ],
      ficha: ["3.direitos", "6"],
    },
    // 66
    {
      id: "visual.logo_autor",
      tipo: "unica",
      mostrarSe: inclui("visual.logo", "sim"),
      rotulo: t("Quem fez o logotipo?", "¿Quién hizo el logotipo?", "Who made the logo?"),
      opcoes: [
        op("empresa", t("Alguém da empresa", "Alguien de la empresa", "Someone in the business")),
        op("fora", t("Uma agência, gráfica ou designer", "Una agencia, imprenta o diseñador", "An agency, printer or designer")),
        naoSei(),
      ],
      ficha: ["3.direitos"],
    },
    // 67
    {
      id: "visual.logo_arquivos",
      tipo: "unica",
      mostrarSe: inclui("visual.logo", "sim"),
      rotulo: t(
        "A empresa tem os arquivos originais do logotipo?",
        "¿La empresa tiene los archivos originales del logotipo?",
        "Does the business have the original logo files?",
      ),
      opcoes: [sim(), nao(), naoSei()],
      ficha: ["3.direitos"],
    },
    // 68
    {
      id: "visual.fonte",
      tipo: "unica",
      pacotes: ["negocio", "profissional"],
      mostrarSe: inclui("visual.logo", "sim"),
      rotulo: t(
        "A marca tem uma fonte (tipo de letra) própria?",
        "¿La marca tiene una tipografía propia?",
        "Does the brand have its own font (typeface)?",
      ),
      opcoes: [
        nao(),
        op("licenca", t("Sim, e temos licença", "Sí, y tenemos licencia", "Yes, and we have a licence"), {
          abre: t("Qual?", "¿Cuál?", "Which one?"),
        }),
        op("sem_licenca", t("Sim, mas não sei da licença", "Sí, pero no sé si tenemos licencia", "Yes, but I'm not sure about the licence"), {
          abre: t("Qual?", "¿Cuál?", "Which one?"),
        }),
        naoSei(),
      ],
      ficha: ["3.direitos", "6"],
    },
    // 69
    {
      id: "visual.cores",
      tipo: "curto",
      rotulo: t("Cores da marca, se existirem.", "Colores de la marca, si los hay.", "Brand colours, if there are any."),
      exemplo: t(
        "o azul da fachada, ou os códigos (#1d4e89)",
        "el azul de la fachada, o los códigos (#1d4e89)",
        "the blue on the shopfront, or the codes (#1d4e89)",
      ),
      ficha: ["6"],
    },
    // 70
    {
      id: "fotos.tem",
      tipo: "unica",
      obrigatoria: true,
      rotulo: t("Vocês têm fotos para o site?", "¿Tenéis fotos para la web?", "Do you have photos for the site?"),
      opcoes: [
        op("muitas", t("Muitas", "Muchas", "Lots")),
        op("algumas", t("Algumas", "Algunas", "Some")),
        op("poucas", t("Quase nenhuma", "Casi ninguna", "Hardly any"), { dica: DICA_SEM_FOTO() }),
        op("nenhuma", t("Nenhuma", "Ninguna", "None"), { dica: DICA_SEM_FOTO() }),
      ],
      ficha: ["3"],
    },
    // 71
    {
      id: "fotos.falta",
      tipo: "unica",
      mostrarSe: inclui("fotos.tem", "poucas", "nenhuma"),
      rotulo: t(
        "Se faltar foto, qual caminho vocês preferem?",
        "Si faltan fotos, ¿qué camino preferís?",
        "If there aren't enough photos, which route do you prefer?",
      ),
      opcoes: [
        op("fotografo", t("Contratar um fotógrafo", "Contratar a un fotógrafo", "Hire a photographer")),
        op("celular", t("Fotografar com o celular, com orientação minha", "Hacerlas con el móvil, con indicaciones mías", "Take them on a phone, with my guidance")),
        op("banco", t("Usar imagem de banco, com licença paga por vocês", "Usar imágenes de banco, con licencia pagada por vosotros", "Use stock images, with a licence you pay for")),
        op("pouca", t("Um site com pouca foto", "Una web con pocas fotos", "A site with few photos")),
        op("conversar", t("Prefiro conversar sobre isso", "Prefiero hablarlo", "I'd rather talk it through")),
      ],
      ficha: ["3", "6"],
    },
    // 72
    {
      id: "fotos.do_que",
      tipo: "multipla",
      mostrarSe: TEM_FOTO,
      rotulo: t("Tem foto de quê?", "¿De qué tenéis fotos?", "What are the photos of?"),
      opcoes: [
        op("produtos", t("Produtos ou pratos", "Productos o platos", "Products or dishes")),
        op("lugar", t("O lugar por dentro", "El local por dentro", "The inside of the premises")),
        op("fachada", t("A fachada", "La fachada", "The shopfront or building")),
        op("equipe", t("A equipe", "El equipo", "The team")),
        op("trabalhos", t("Trabalhos feitos", "Trabajos hechos", "Past work")),
        op("estrutura", t("Máquinas e estrutura", "Maquinaria e instalaciones", "Machinery and facilities")),
        op("eventos", t("Clientes e eventos", "Clientes y eventos", "Customers and events")),
      ],
      ficha: ["3"],
    },
    // 73
    {
      id: "fotos.onde",
      tipo: "multipla",
      mostrarSe: TEM_FOTO,
      rotulo: t("Onde estão as fotos hoje?", "¿Dónde están hoy las fotos?", "Where are the photos now?"),
      opcoes: [
        op("instagram", t("No Instagram", "En Instagram", "On Instagram"), {
          dica: t(
            "Foto baixada do Instagram chega pequena e fica borrada em tela grande. O original costuma estar no celular de quem postou, e é dele que eu preciso.",
            "Una foto descargada de Instagram llega pequeña y se ve borrosa en pantalla grande. El original suele estar en el móvil de quien la publicó, y es ese el que necesito.",
            "A photo downloaded from Instagram arrives small and looks blurry on a big screen. The original is usually on the phone of whoever posted it, and that's the one I need.",
          ),
        }),
        op("celular", t("No celular de alguém da equipe", "En el móvil de alguien del equipo", "On someone's phone in the team")),
        op("fotografo", t("Com um fotógrafo", "Las tiene un fotógrafo", "With a photographer")),
        op("app", t("No aplicativo de entrega", "En la app de reparto", "On the delivery app")),
        op("pasta", t("Numa pasta no computador ou na nuvem", "En una carpeta del ordenador o en la nube", "In a folder on a computer or in the cloud")),
      ],
      ficha: ["3"],
    },
    // 74
    {
      id: "fotos.autor",
      tipo: "multipla",
      obrigatoria: true,
      mostrarSe: TEM_FOTO,
      rotulo: t("Quem fez as fotos?", "¿Quién hizo las fotos?", "Who took the photos?"),
      opcoes: [
        op("empresa", t("Alguém da empresa", "Alguien de la empresa", "Someone in the business")),
        op("fotografo", t("Um fotógrafo contratado", "Un fotógrafo contratado", "A photographer we hired")),
        op("repost", t("Clientes que marcaram vocês (repost)", "Clientes que os etiquetaron (repost)", "Customers who tagged you (reposts)"), {
          dica: t(
            "Foto de cliente repostada continua sendo de quem tirou. Para entrar no site, precisa da autorização dessa pessoa.",
            "Una foto de un cliente que habéis reposteado sigue siendo de quien la hizo. Para ponerla en la web hace falta su permiso.",
            "A customer's photo that you reposted still belongs to whoever took it. To go on the site, it needs that person's permission.",
          ),
        }),
        naoSei(),
      ],
      ficha: ["3.direitos"],
    },
    // 75
    {
      id: "fotos.fotografo_nome",
      tipo: "curto",
      mostrarSe: inclui("fotos.autor", "fotografo"),
      rotulo: t(
        "Nome do fotógrafo ou do estúdio que fez as fotos.",
        "Nombre del fotógrafo o del estudio que hizo las fotos.",
        "Name of the photographer or studio who took the photos.",
      ),
      /* A afirmação "a lei pede" só vale onde foi conferida (Brasil e
         Espanha); para os outros países o texto não afirma o que não sabe. */
      dica: t(
        "Em muitos países, a lei pede o nome de quem fotografou junto da foto publicada.",
        "En muchos países, la ley pide el nombre de quien hizo la foto junto a la foto publicada.",
        "In many countries the law requires the photographer to be credited next to the published photo.",
      ),
      variante: {
        BR: { dica: DICA_CREDITO_FOTO() },
        ES: { dica: DICA_CREDITO_FOTO() },
      },
      ficha: ["3.direitos"],
    },
    // 76
    {
      id: "fotos.fotografo_autorizacao",
      tipo: "unica",
      mostrarSe: inclui("fotos.autor", "fotografo"),
      rotulo: t(
        "Existe contrato ou autorização do fotógrafo para usar as fotos no site?",
        "¿Hay contrato o autorización del fotógrafo para usar las fotos en la web?",
        "Is there a contract or permission from the photographer to use the photos on the website?",
      ),
      opcoes: [
        op("documento", t("Sim, e tenho o documento", "Sí, y tengo el documento", "Yes, and I have the document")),
        op("combinado", t("Combinado, mas não por escrito", "Acordado, pero no por escrito", "Agreed, but not in writing")),
        op("nao", t("Não existe", "No hay", "There isn't one")),
        naoSei(),
      ],
      ficha: ["3.direitos"],
    },
    // 77
    {
      id: "fotos.pessoas",
      tipo: "unica",
      obrigatoria: true,
      mostrarSe: TEM_FOTO,
      rotulo: t(
        "Aparece alguém nas fotos, mesmo funcionário de vocês?",
        "¿Sale alguien en las fotos, aunque sea gente de vuestro equipo?",
        "Does anyone appear in the photos, even your own staff?",
      ),
      opcoes: [
        nao(),
        op("autorizado", t("Sim, e todos assinaram autorização", "Sí, y todos han firmado la autorización", "Yes, and everyone has signed a release")),
        op("sem_autorizacao", t("Sim, sem autorização assinada", "Sí, sin autorización firmada", "Yes, without a signed release")),
        naoSei(),
      ],
      ficha: ["3.direitos"],
    },
    // 78
    {
      id: "fotos.criancas",
      tipo: "unica",
      mostrarSe: inclui("fotos.pessoas", "autorizado", "sem_autorizacao", "nao_sei"),
      rotulo: t(
        "Alguma dessas pessoas é criança ou adolescente?",
        "¿Alguna de esas personas es menor de edad?",
        "Are any of those people children or teenagers?",
      ),
      opcoes: [nao(), sim(), naoSei()],
      dica: t(
        "Foto de criança ou adolescente só entra com autorização por escrito do pai, da mãe ou do responsável.",
        "Las fotos de menores solo entran con autorización por escrito del padre, la madre o el tutor.",
        "Photos of children or teenagers only go in with written permission from a parent or guardian.",
      ),
      ficha: ["3.direitos"],
    },
    // 79
    {
      id: "fotos.alheio",
      tipo: "unica",
      mostrarSe: TEM_FOTO,
      rotulo: t(
        "Alguma foto mostra peça, projeto, obra ou produto de um cliente, ou lugar que não é de vocês?",
        "¿Alguna foto muestra una pieza, proyecto, obra o producto de un cliente, o un lugar que no es vuestro?",
        "Do any photos show a client's part, project, building work or product, or a place that isn't yours?",
      ),
      opcoes: [
        nao(),
        op("pode", t("Sim, e o dono deixa mostrar", "Sí, y el dueño deja mostrarlo", "Yes, and the owner is happy for it to be shown")),
        op("nao_sei_pode", t("Sim, e não sei se pode", "Sí, y no sé si se puede", "Yes, and I don't know if that's allowed")),
        op("nao_pode", t("Sim, e não pode aparecer", "Sí, y no puede aparecer", "Yes, and it can't be shown")),
      ],
      ficha: ["3.direitos"],
    },
    // 80
    {
      id: "fotos.terceiros",
      tipo: "unica",
      rotulo: t(
        "Alguma imagem, vídeo ou música veio de banco de imagens, de fornecedor ou da internet?",
        "¿Alguna imagen, vídeo o música viene de un banco de imágenes, de un proveedor o de internet?",
        "Did any images, video or music come from a stock library, a supplier or the internet?",
      ),
      opcoes: [
        nao(),
        sim({ abre: t("Qual, e com que licença?", "¿Cuál, y con qué licencia?", "Which, and under what licence?") }),
        naoSei(),
      ],
      ficha: ["3.direitos"],
    },
    // 81
    {
      id: "fotos.video",
      tipo: "unica",
      rotulo: t("Tem vídeo que deveria entrar no site?", "¿Hay algún vídeo que debería ir en la web?", "Is there a video that should go on the site?"),
      opcoes: [
        nao(),
        op("publicado", t("Sim, publicado no YouTube ou no Instagram", "Sí, publicado en YouTube o Instagram", "Yes, published on YouTube or Instagram")),
        op("arquivo", t("Sim, em arquivo", "Sí, en archivo", "Yes, as a file")),
        naoSei(),
      ],
      ficha: ["3", "11"],
    },
    // 82
    {
      id: "arquivos.envio",
      tipo: "unica",
      rotulo: t(
        "Como você vai mandar o logotipo, as fotos e os textos?",
        "¿Cómo vas a mandar el logotipo, las fotos y los textos?",
        "How will you send the logo, photos and text?",
      ),
      opcoes: [
        op("pasta", t(
          "Por um link de pasta (Google Drive, Dropbox, OneDrive)",
          "Por un enlace a una carpeta (Google Drive, Dropbox, OneDrive)",
          "Via a folder link (Google Drive, Dropbox, OneDrive)",
        )),
        op("whatsapp", t("Pelo WhatsApp, como Documento", "Por WhatsApp, como «Documento»", "On WhatsApp, as a Document")),
        op("email", t("Por e-mail", "Por correo", "By email")),
        op("juntando", t("Ainda estou juntando", "Todavía lo estoy reuniendo", "I'm still gathering it")),
      ],
      dica: t(
        "Foto no tamanho original, como saiu do celular ou da câmera. No WhatsApp, mande como Documento e não pela Galeria, senão ela chega comprimida.",
        "Las fotos, en el tamaño original, tal como salieron del móvil o de la cámara. Por WhatsApp, adjúntalas como «Documento» y no desde «Galería» o «Fotos y vídeos», que las comprime.",
        "Photos at full size, straight from the phone or camera. On WhatsApp, attach them as a Document, not from Gallery or Photos, which compresses them.",
      ),
      ficha: ["3"],
    },
    // 83. O e-mail vem de `app/data.ts`, o mesmo do resto do site.
    {
      id: "arquivos.link",
      tipo: "url",
      mostrarSe: inclui("arquivos.envio", "pasta"),
      rotulo: t("Link da pasta.", "Enlace de la carpeta.", "Link to the folder."),
      dica: t(
        `Compartilhe com ${emailContato} em vez de abrir para qualquer pessoa com o link, principalmente se tiver foto de gente. Link do WeTransfer vence em poucos dias.`,
        `Compártela con ${emailContato} en lugar de abrirla a «Cualquier persona con el enlace», sobre todo si hay fotos de personas. Los enlaces de WeTransfer caducan en pocos días.`,
        `Share it with ${emailContato} rather than setting it to Anyone with the link, especially if it has photos of people. WeTransfer links expire after a few days.`,
      ),
      ficha: ["3"],
    },
    // 84
    {
      id: "arquivos.previsao",
      tipo: "unica",
      rotulo: t(
        "Quando você consegue mandar logotipo, fotos e o resto?",
        "¿Cuándo puedes mandar el logotipo, las fotos y lo demás?",
        "When can you send the logo, photos and everything else?",
      ),
      opcoes: [
        op("semana", t("Esta semana", "Esta semana", "This week")),
        op("proxima", t("Semana que vem", "La semana que viene", "Next week")),
        op("quinze", t("Em 15 dias", "En 15 días", "Within 15 days")),
        op("nao_sei", t("Ainda não sei", "Aún no lo sé", "Not sure yet")),
      ],
      dica: t(
        "O prazo do site começa no dia útil seguinte ao que eu confirmar, por escrito, que o material e os acessos chegaram completos.",
        "El plazo de la web empieza el día laborable siguiente a que yo confirme, por escrito, que el material y los accesos han llegado completos.",
        "The timeline for the site starts on the working day after I confirm, in writing, that all the material and access details have arrived.",
      ),
      ficha: ["anexoA"],
    },
  ],
};

function DICA_SEM_FOTO(): Texto {
  return t(
    "Fotografia eu não faço. Dá para começar com o que existir, ou com imagem de banco, que é paga por vocês e fica no nome de vocês.",
    "Fotografía no hago. Se puede empezar con lo que haya, o con imágenes de banco, que pagáis vosotros y quedan a vuestro nombre.",
    "I don't do photography. We can start with whatever exists, or with stock images, which you pay for and which stay in your name.",
  );
}

function DICA_CREDITO_FOTO(): Texto {
  return t(
    "A lei pede o nome de quem fotografou junto da foto publicada.",
    "La ley pide el nombre de quien hizo la foto junto a la foto publicada.",
    "The law requires the photographer to be credited next to the published photo.",
  );
}

/* A dica do Negócio e do Profissional: o Profissional inclui tudo do Negócio,
   páginas também. Sem `paginas` no link, o núcleo cai para a dica base. */
function DICA_PAGINAS(): Texto {
  return t(
    "Combinamos até [PAGINAS] páginas ou seções. Pode marcar mais; eu digo antes o que cabe e o que seria à parte.",
    "Acordamos hasta [PAGINAS] páginas o secciones. Puedes marcar más; te digo antes qué cabe y qué iría aparte.",
    "We agreed up to [PAGINAS] pages or sections. You can tick more; I'll tell you first what fits and what would be extra.",
  );
}

function DICA_TEXTOS_COMIGO(): Texto {
  return t(
    "O texto do site é comigo. O que existir serve de fonte, mesmo antigo ou solto.",
    "El texto de la web lo escribo yo. Lo que exista sirve de fuente, aunque sea antiguo o suelto.",
    "I write the site's copy. Whatever exists is useful as a source, even if it's old or scattered.",
  );
}

const etapaSite: Etapa = {
  id: "site",
  titulo: t("A cara e as partes do site", "El aspecto y las partes de la web", "The look and the parts of the site"),
  avisos: [
    {
      id: "essencial_escopo",
      pacotes: ["essencial"],
      texto: t(
        "O Essencial é uma página, com botão de WhatsApp e formulário de contato. Pedido e pagamento pelo site, reserva com horário marcado, área para vocês mesmos trocarem textos e fotos e site em outro idioma são projetos à parte. Se precisar de algum, escreva na última pergunta e eu passo o preço por escrito antes de começar.",
        "El Esencial es una página, con botón de WhatsApp y formulario de contacto. Los pedidos y pagos en la web, las reservas con hora, un panel para que cambiéis vosotros textos y fotos y la web en otro idioma son proyectos aparte. Si necesitas alguno, escríbelo en la última pregunta y te paso el precio por escrito antes de empezar.",
        "Essential is a single page, with a WhatsApp button and a contact form. Ordering and payment on the site, bookings with set times, an area where you change text and photos yourselves, and a site in another language are separate projects. If you need any of them, write it in the last question and I'll send you the price in writing before we start.",
      ),
    },
  ],
  perguntas: [
    // 85
    {
      id: "visual.sensacao",
      tipo: "multipla",
      max: 3,
      rotulo: t("Como o site deve parecer? Marque até três.", "¿Qué impresión tiene que dar la web? Marca hasta tres.", "How should the site come across? Tick up to three."),
      opcoes: [
        op("solido", t("Sólido", "Sólida", "Solid")),
        op("tecnico", t("Técnico", "Técnica", "Technical")),
        op("acolhedor", t("Acolhedor", "Acogedora", "Welcoming")),
        op("moderno", t("Moderno", "Moderna", "Modern")),
        op("tradicional", t("Tradicional", "Tradicional", "Traditional")),
        op("sofisticado", t("Sofisticado", "Sofisticada", "Sophisticated")),
        op("alegre", t("Alegre", "Alegre", "Cheerful")),
        op("simples", t("Simples e direto", "Sencilla y directa", "Simple and direct")),
        op("artesanal", t("Artesanal", "Artesanal", "Handcrafted")),
        op("jovem", t("Jovem", "Joven", "Youthful")),
        op("serio", t("Sério", "Seria", "Serious")),
        op("descontraido", t("Descontraído", "Desenfadada", "Relaxed")),
        op("familiar", t("Familiar", "Familiar", "Family-oriented")),
        outro(),
      ],
      ficha: ["6"],
    },
    // 86
    {
      id: "visual.referencias",
      tipo: "paragrafo",
      rotulo: t(
        "Sites ou perfis de Instagram de que você gosta, de qualquer ramo, e o que agrada em cada um. E algo que você não quer de jeito nenhum.",
        "Webs o perfiles de Instagram que te gusten, de cualquier sector, y qué te gusta de cada uno. Y algo que no quieras de ninguna manera.",
        "Websites or Instagram profiles you like, from any industry, and what you like about each one. And something you definitely don't want.",
      ),
      dica: t(
        "Um por linha. Diga a sensação, e não a técnica: passa confiança, acho o telefone rápido, as fotos são grandes.",
        "Uno por línea. Di la sensación, no la técnica: da confianza, encuentro el teléfono enseguida, las fotos son grandes.",
        "One per line. Describe the feeling, not the technique: it feels trustworthy, I find the phone number quickly, the photos are big.",
      ),
      ficha: ["6"],
    },
    // 87. Os rótulos com nome de país aqui são nomes de IDIOMA, não de lugar.
    {
      id: "conteudo.idiomas",
      tipo: "multipla",
      prefill: "idiomas_site",
      rotulo: t("Em que idioma o site vai ser escrito?", "¿En qué idiomas va a estar la web?", "Which languages will the website be in?"),
      opcoes: [
        op("pt_br", t("Português do Brasil", "Portugués de Brasil", "Brazilian Portuguese")),
        op("pt_pt", t("Português de Portugal", "Portugués de Portugal", "European Portuguese")),
        op("es", t("Espanhol", "Castellano", "Spanish")),
        op("ca", t("Catalão", "Catalán", "Catalan")),
        op("en", t("Inglês", "Inglés", "English")),
        outro(),
      ],
      dica: t(
        "Já vem marcado o que está na proposta. Se mudar, eu aviso antes, por escrito e com preço, e nada muda sem você decidir.",
        "Ya viene marcado lo que entró en la propuesta. Si cambias algo, te lo digo antes, por escrito y con el precio, y no se cambia nada sin que lo decidas.",
        "What's in the proposal is already ticked. If you change it, I'll tell you first, in writing and with the price, and nothing changes until you decide.",
      ),
      ficha: ["10"],
    },
    // 88
    {
      id: "conteudo.traducao",
      tipo: "unica",
      mostrarSe: minimo("conteudo.idiomas", 2),
      rotulo: t("Quem faz a tradução?", "¿Quién hace la traducción?", "Who will do the translation?"),
      opcoes: [
        op("nos", t("Nós mandamos traduzido", "La mandamos nosotros traducida", "We'll send it translated")),
        op("orcar", t("Queremos que a Varanda orce a tradução", "Queremos que Varanda presupueste la traducción", "We'd like Varanda to quote for the translation")),
        naoSei(),
      ],
      dica: t(
        "A tradução só está incluída se estiver escrita na proposta. Se não estiver e for comigo, eu mando o orçamento antes de começar.",
        "La traducción solo está incluida si está escrita en la propuesta. Si no lo está y me la encargas, te mando el presupuesto antes de empezar.",
        "Translation is only included if it's written in the proposal. If it isn't and you'd like me to handle it, I'll send a quote before starting.",
      ),
      ficha: ["10"],
    },
    // 89
    {
      id: "conteudo.secoes",
      tipo: "multipla",
      rotulo: t("O que precisa estar no site?", "¿Qué tiene que haber en la web?", "What needs to be on the site?"),
      opcoes: [
        op("quem_somos", t("Quem somos", "Quiénes somos", "About us")),
        op("oferta", t("Cardápio, produtos ou serviços", "Carta, productos o servicios", "Menu, products or services")),
        op("horario", t("Horário e como chegar", "Horario y cómo llegar", "Opening hours and directions")),
        op("como_pedir", t("Como pedir (entrega e aplicativos)", "Cómo pedir (reparto y apps)", "How to order (delivery and apps)")),
        op("reservas", t("Reservas e eventos", "Reservas y eventos", "Bookings and events")),
        op("fotos_lugar", t("Fotos do lugar", "Fotos del local", "Photos of the place")),
        op("trabalhos", t("Trabalhos feitos", "Trabajos hechos", "Past work")),
        op("estrutura", t("Máquinas e estrutura", "Maquinaria e instalaciones", "Machinery and facilities")),
        op("clientes", t("Clientes atendidos", "Clientes", "Clients")),
        op("equipe", t("Equipe", "Equipo", "Team")),
        op("depoimentos", t("Depoimentos e avaliações", "Testimonios y reseñas", "Testimonials and reviews")),
        op("duvidas", t("Perguntas frequentes", "Preguntas frecuentes", "FAQs")),
        op("mapa", t("Localização e mapa", "Ubicación y mapa", "Location and map")),
        op("contato", t("Contato", "Contacto", "Contact")),
        op("blog", t("Notícias ou blog", "Noticias o blog", "News or blog"), { pacotes: ["negocio", "profissional"] }),
        op("vagas", t("Trabalhe conosco", "Trabaja con nosotros", "Careers"), { pacotes: ["negocio", "profissional"] }),
        outro(),
      ],
      dica: t(
        "Pode marcar o que precisa; eu digo antes o que cabe no pacote e o que seria à parte.",
        "Puedes marcar lo que necesites; te digo antes qué cabe en el paquete y qué iría aparte.",
        "Tick whatever you need; I'll tell you first what fits in the package and what would be extra.",
      ),
      variante: {
        essencial: {
          dica: t(
            "No Essencial, tudo entra numa página só. Marque o que precisa, que eu digo o que cabe.",
            "En el Esencial, todo va en una sola página. Marca lo que necesites y te digo qué cabe.",
            "In Essential, everything goes on a single page. Tick what you need and I'll tell you what fits.",
          ),
        },
        negocio: { dica: DICA_PAGINAS() },
        profissional: { dica: DICA_PAGINAS() },
      },
      ficha: ["4"],
    },
    // 90
    {
      id: "conteudo.textos",
      tipo: "unica",
      rotulo: t(
        "Já existe algum texto sobre vocês? Vale a bio do Instagram, a descrição no aplicativo, um folheto, um site antigo.",
        "¿Hay ya algún texto sobre vosotros? Vale la bio de Instagram, la descripción en la app, un folleto, una web antigua.",
        "Is there any existing text about you? The Instagram bio, the description on an app, a leaflet or an old website all count.",
      ),
      opcoes: [sim(), op("alguns", t("Alguns", "Algunos", "Some")), nao()],
      variante: {
        essencial: {
          dica: t(
            "O texto do site sai do que vocês responderem aqui e do que já existir. Eu ajusto e organizo.",
            "El texto de la web sale de lo que respondáis aquí y de lo que ya exista. Yo lo ajusto y lo ordeno.",
            "The site's copy comes from what you answer here and from what already exists. I adjust and organise it.",
          ),
        },
        negocio: { dica: DICA_TEXTOS_COMIGO() },
        profissional: { dica: DICA_TEXTOS_COMIGO() },
      },
      ficha: ["3"],
    },
    // 91
    {
      id: "depois.frequencia",
      tipo: "unica",
      rotulo: t(
        "Depois que o site estiver no ar, com que frequência alguma coisa nele vai mudar?",
        "Cuando la web esté publicada, ¿cada cuánto va a cambiar algo en ella?",
        "Once the site is live, how often will something on it change?",
      ),
      opcoes: [
        op("quase_nunca", t("Quase nunca", "Casi nunca", "Hardly ever")),
        op("ano", t("Algumas vezes por ano", "Algunas veces al año", "A few times a year")),
        op("mes", t("Todo mês", "Cada mes", "Every month")),
        op("semana", t("Toda semana", "Cada semana", "Every week")),
      ],
      dica: t(
        "Depois que o site vai ao ar, cada mudança de conteúdo é uma alteração paga, com orçamento antes; os 30 dias de garantia cobrem só defeito, como link ou formulário que não funciona. Se muda muito, dá para o site apontar para o cardápio ou a tabela que vocês já atualizam.",
        "Cuando la web ya está publicada, cada cambio de contenido es un trabajo de pago, con presupuesto antes; los 30 días de garantía cubren solo fallos, como un enlace o un formulario que no funciona. Si cambia mucho, la web puede enlazar a la carta o la tabla que ya actualizáis vosotros.",
        "Once the site is live, each content change is paid work, quoted beforehand; the 30-day warranty only covers faults, such as a broken link or a form that doesn't send. If things change a lot, the site can link to the menu or price list you already keep up to date.",
      ),
      ficha: ["7", "5", "2"],
    },
    // 92
    {
      id: "depois.o_que",
      tipo: "curto",
      mostrarSe: naoInclui("depois.frequencia", "quase_nunca"),
      rotulo: t("O que muda?", "¿Qué cambia?", "What changes?"),
      exemplo: t(
        "preço, cardápio, fotos de trabalhos novos, vagas",
        "precios, carta, fotos de trabajos nuevos, ofertas de empleo",
        "prices, menu, photos of new work, job openings",
      ),
      ficha: ["7", "5"],
    },
    // 93. No Profissional, a opção da capacidade vem marcada e travada
    //     (`CAPACIDADE_OPCAO`); "Nenhuma" desmarca as outras, nunca a travada.
    {
      id: "funcoes.extras",
      tipo: "multipla",
      pacotes: ["negocio", "profissional"],
      rotulo: t(
        "Além de mostrar a empresa e receber contato, o site precisa fazer mais alguma coisa?",
        "Además de mostrar la empresa y recibir contactos, ¿la web tiene que hacer algo más?",
        "Apart from presenting the business and receiving enquiries, does the site need to do anything else?",
      ),
      opcoes: [
        op("idioma", t("Outro idioma", "Otro idioma", "Another language"), { pacotes: ["profissional"] }),
        op("catalogo", t("Catálogo com filtros", "Catálogo con filtros", "Filterable catalogue")),
        op("conteudo", t("Área para vocês mesmos trocarem textos e fotos", "Un panel para cambiar vosotros textos y fotos", "An area where you change text and photos yourselves")),
        op("integracao", t("Ligação com um sistema que vocês já usam", "Conexión con un sistema que ya usáis", "A link to a system you already use")),
        op("agendamento", t("Agendamento com horário marcado", "Reservas y cita previa", "Appointments with set times")),
        op("pagamento", t("Pagamento pela internet", "Pago online", "Online payment")),
        op("loja", t("Loja virtual", "Tienda online", "Online shop")),
        op("login", t("Área com login para clientes", "Área privada para clientes", "Customer login area")),
        op("nenhuma", t("Nenhuma", "Ninguna", "None"), {
          exclusiva: true,
          variante: { profissional: { rotulo: t("Nenhuma outra", "Ninguna más", "None besides that") } },
        }),
      ],
      /* A dica base só aparece no Profissional sem capacidade no link, que o
         painel não deveria deixar acontecer; ela não promete nada que o
         pacote talvez não tenha. */
      dica: t(
        "O que não estiver no pacote de vocês eu orço à parte, por escrito, antes de começar.",
        "Lo que no esté en vuestro paquete lo presupuesto aparte, por escrito, antes de empezar.",
        "Anything not in your package I'll quote separately, in writing, before we start.",
      ),
      variante: {
        negocio: {
          dica: t(
            "Nenhuma destas entra no pacote que vocês contrataram. Se marcar alguma, eu mando o orçamento por escrito antes de começar, e nada muda sem você decidir.",
            "Ninguna de estas entra en el paquete que habéis contratado. Si marcas alguna, te mando el presupuesto por escrito antes de empezar, y no cambia nada sin que lo decidas.",
            "None of these is included in the package you signed up for. If you tick any, I'll send you a written quote before starting, and nothing changes until you decide.",
          ),
        },
        profissional: {
          dica: t(
            "O pacote de vocês inclui uma destas, a que combinamos: [CAPACIDADE]. As outras são orçadas à parte, por escrito, antes de começar.",
            "Vuestro paquete incluye una de estas, la que acordamos: [CAPACIDADE]. Las demás se presupuestan aparte, por escrito, antes de empezar.",
            "Your package includes one of these, the one we agreed: [CAPACIDADE]. The others are quoted separately, in writing, before we start.",
          ),
        },
      },
      ficha: ["5", "2"],
    },
    // 94. Além de "respondeu e não marcou Nenhuma", aparece sempre que uma das
    //     quatro capacidades estiver marcada. No Profissional a capacidade vem
    //     travada, e sem esta segunda parte quem marca "Nenhuma outra" perderia
    //     justamente a pergunta sobre o que o pacote já inclui.
    {
      id: "funcoes.detalhes",
      tipo: "paragrafo",
      mostrarSe: alguma(naoInclui("funcoes.extras", "nenhuma"), inclui("funcoes.extras", "idioma", "catalogo", "conteudo", "integracao")),
      rotulo: t("Conte um pouco mais sobre o que marcou.", "Cuéntame un poco más sobre lo que has marcado.", "Tell me a bit more about what you ticked."),
      exemplo: t(
        "o nome do sistema (ou se foi feito sob medida), quantos produtos, que formas de pagamento, que agenda vocês já usam",
        "el nombre del sistema (o si está hecho a medida), cuántos productos, qué formas de pago, qué agenda usáis ya",
        "the name of the system (or whether it's bespoke), how many products, which payment methods, which calendar you already use",
      ),
      variante: {
        BR: {
          exemplo: t(
            "o nome do sistema (Bling, Omie, um feito sob medida), quantos produtos, que formas de pagamento, que agenda vocês já usam",
            "el nombre del sistema (Bling, Omie, uno hecho a medida), cuántos productos, qué formas de pago, qué agenda usáis ya",
            "the name of the system (Bling, Omie, a bespoke one), how many products, which payment methods, which calendar you already use",
          ),
        },
        ES: {
          exemplo: t(
            "o nome do sistema (Holded, A3, Sage, um feito sob medida), quantos produtos, que formas de pagamento, que agenda vocês já usam",
            "el nombre del sistema (Holded, A3, Sage, uno hecho a medida), cuántos productos, qué formas de pago, qué agenda usáis ya",
            "the name of the system (Holded, A3, Sage, a bespoke one), how many products, which payment methods, which calendar you already use",
          ),
        },
      },
      ficha: ["5"],
    },
    // 95
    {
      id: "funcoes.sentido",
      tipo: "unica",
      mostrarSe: inclui("funcoes.extras", "integracao"),
      rotulo: t(
        "O site só manda informação para esse sistema, ou precisa buscar de lá e mostrar na tela?",
        "¿La web solo envía información a ese sistema, o también tiene que traerla de allí y mostrarla?",
        "Does the site only send information to that system, or does it also need to pull information from it and display it?",
      ),
      opcoes: [
        op("manda", t("Só manda, como um pedido ou um cadastro", "Solo envía, como un pedido o un alta", "Only sends, like an order or a sign-up")),
        op("mostra", t("Busca e mostra, como estoque, preço ou horário", "Trae y muestra, como stock, precios u horarios", "Pulls and displays, like stock, prices or availability")),
        op("os_dois", t("Os dois", "Las dos cosas", "Both")),
        naoSei(),
      ],
      ficha: ["5"],
    },
    // 96
    {
      id: "funcoes.pagamento",
      tipo: "curto",
      mostrarSe: inclui("funcoes.extras", "pagamento", "loja"),
      rotulo: t(
        "Vocês já têm conta em algum meio de pagamento?",
        "¿Ya tenéis cuenta en algún medio de pago?",
        "Do you already have an account with a payment provider?",
      ),
      exemplo: t("Stripe, PayPal ou o do banco", "Stripe, PayPal o la pasarela del banco", "Stripe, PayPal or your bank's card gateway"),
      variante: {
        BR: { exemplo: t("Mercado Pago, PagSeguro, Stripe", "Mercado Pago, PagSeguro, Stripe", "Mercado Pago, PagSeguro, Stripe") },
        ES: {
          exemplo: t(
            "TPV virtual do banco (Redsys), Bizum para empresas, Stripe, PayPal",
            "TPV virtual del banco (Redsys), Bizum para empresas, Stripe, PayPal",
            "your bank's virtual POS (Redsys), Bizum for business, Stripe, PayPal",
          ),
        },
      },
      ficha: ["5"],
    },
    // 97
    {
      id: "dados.recebe",
      tipo: "multipla",
      rotulo: t(
        "Além de nome, contato e mensagem, o site precisa receber mais alguma coisa das pessoas?",
        "Además del nombre, el contacto y el mensaje, ¿la web tiene que recibir algo más de la gente?",
        "Apart from name, contact details and a message, does the site need to collect anything else from people?",
      ),
      opcoes: [
        op("curriculo", t("Currículo", "Currículum", "CV")),
        op("arquivo", t("Arquivo, desenho ou foto", "Archivo, plano o foto", "A file, drawing or photo")),
        op("documento", t("Documento pessoal (CPF, DNI ou outro)", "Documento de identidad (CPF, DNI u otro)", "An ID number or document"), {
          variante: {
            BR: { rotulo: t("CPF ou outro documento", "CPF u otro documento", "CPF or another ID document") },
            ES: { rotulo: t("DNI ou outro documento", "DNI u otro documento", "DNI or another ID document") },
          },
        }),
        op("saude", t("Informação de saúde", "Información de salud", "Health information")),
        op("endereco", t("Endereço", "Dirección", "Address")),
        op("nada", t("Não, só isso", "No, solo eso", "No, just that"), { exclusiva: true }),
        naoSei(),
      ],
      ficha: ["11", "5"],
    },
    // 98
    {
      id: "dados.politica",
      tipo: "unica",
      rotulo: t(
        "Vocês já têm política de privacidade, ou uma pessoa que responde pelos dados pessoais na empresa?",
        "¿Tenéis ya política de privacidad, o una persona que responde de los datos personales en la empresa?",
        "Do you already have a privacy policy, or someone responsible for personal data in the business?",
      ),
      opcoes: [
        nao(),
        sim({ abre: t("O link, ou o cargo e o e-mail", "El enlace, o el cargo y el correo", "The link, or their role and email") }),
        naoSei(),
      ],
      ficha: ["11"],
    },
    // 99
    {
      id: "dados.contato",
      tipo: "email",
      rotulo: t(
        "Qual e-mail recebe pedidos de visitantes sobre os dados deles?",
        "¿Qué correo recibe las peticiones de los visitantes sobre sus datos?",
        "Which email address receives requests from visitors about their data?",
      ),
      dica: t(
        "Vai na política de privacidade do site. Pode ser o mesmo do formulário.",
        "Va en la política de privacidad de la web. Puede ser el mismo del formulario.",
        "It goes in the site's privacy policy. It can be the same as the contact form's.",
      ),
      ficha: ["11"],
    },
    // 100
    {
      id: "dados.texto",
      tipo: "unica",
      rotulo: t(
        "A política de privacidade do site: eu monto a página e descrevo o que o site coleta, e o texto final é de vocês. Quem revisa?",
        "La política de privacidad de la web: yo monto la página y describo lo que recoge la web, y el texto final es vuestro. ¿Quién lo revisa?",
        "The site's privacy policy: I build the page and describe what the site collects, and the final text is yours. Who reviews it?",
      ),
      opcoes: [
        op("advogado", t("Nosso advogado, contador ou consultoria", "Nuestro abogado, gestoría o consultoría", "Our lawyer, accountant or consultant"), {
          variante: {
            ES: {
              rotulo: t(
                "Nossa consultoria de proteção de dados ou gestoria",
                "Nuestra consultoría de protección de datos o gestoría",
                "Our data protection consultancy or gestoría",
              ),
            },
          },
        }),
        op("eu", t("Eu reviso", "Lo reviso yo", "I'll review it myself")),
        naoSei(),
      ],
      ficha: ["11"],
    },
    // 101
    {
      id: "dados.medicao",
      tipo: "unica",
      rotulo: t(
        "Para medir as visitas, basta saber quantas pessoas entram e de onde vêm, sem cookies e sem aviso de cookies, ou vocês precisam do Google Analytics, que exige o aviso?",
        "Para medir las visitas, ¿os basta con saber cuántas personas entran y de dónde vienen, sin cookies y sin banner de cookies, o necesitáis Google Analytics, que obliga a poner el banner?",
        "To measure visits, is it enough to know how many people come and where from, with no cookies and no cookie banner, or do you need Google Analytics, which requires the banner?",
      ),
      opcoes: [
        op("simples", t("Basta o simples", "Nos basta lo sencillo", "The simple option is enough")),
        op("google", t("Precisamos do Google Analytics", "Necesitamos Google Analytics", "We need Google Analytics")),
        naoSei(),
      ],
      ficha: ["11"],
    },
  ],
};

const etapaAcessos: Etapa = {
  id: "acessos",
  titulo: t("Endereço na internet, acessos e prazo", "Dominio, accesos y plazos", "Web address, access and timing"),
  aviso: t(
    "Aqui eu só preciso saber onde as coisas estão e quem cuida. Tudo fica no nome da empresa desde o primeiro dia, e nenhuma conta fica no meu nome. Nunca escreva senha neste formulário.",
    "Aquí solo necesito saber dónde están las cosas y quién se encarga. Todo queda a nombre de la empresa desde el primer día, y ninguna cuenta queda a mi nombre. No escribas nunca contraseñas en este formulario.",
    "Here I only need to know where things are and who looks after them. Everything stays in the business's name from day one, and no account is ever in my name. Never type a password in this form.",
  ),
  perguntas: [
    // 102
    {
      id: "dominio.tem",
      tipo: "unica",
      rotulo: t(
        "Vocês já têm domínio, o endereço do site (como suaempresa.com)?",
        "¿Tenéis ya dominio, la dirección de la web (como tuempresa.com)?",
        "Do you already have a domain, the website address (like yourcompany.com)?",
      ),
      variante: {
        BR: {
          rotulo: t(
            "Vocês já têm domínio, o endereço do site (como suaempresa.com.br)?",
            "¿Tenéis ya dominio, la dirección de la web (como tuempresa.com.br)?",
            "Do you already have a domain, the website address (like yourcompany.com.br)?",
          ),
        },
        ES: {
          rotulo: t(
            "Vocês já têm domínio, o endereço do site (como suaempresa.es, suaempresa.com ou suaempresa.cat)?",
            "¿Tenéis ya dominio, la dirección de la web (como tuempresa.es, tuempresa.com o tuempresa.cat)?",
            "Do you already have a domain, the website address (like yourcompany.es, yourcompany.com or yourcompany.cat)?",
          ),
        },
      },
      opcoes: [sim(), nao(), naoSei()],
      ficha: ["anexoB"],
    },
    // 103
    {
      id: "dominio.qual",
      tipo: "curto",
      mostrarSe: inclui("dominio.tem", "sim"),
      rotulo: t("Qual?", "¿Cuál?", "Which one?"),
      ficha: ["anexoB"],
    },
    // 104
    {
      id: "dominio.titular",
      tipo: "unica",
      mostrarSe: inclui("dominio.tem", "sim"),
      rotulo: t("Em nome de quem o domínio está registrado?", "¿A nombre de quién está registrado el dominio?", "Whose name is the domain registered in?"),
      opcoes: [
        op("empresa", t("Da empresa", "De la empresa", "The business's")),
        op("socio", t("Do dono ou de um sócio", "Del dueño o de un socio", "The owner's or a partner's")),
        op("outro", t("De outra pessoa ou empresa", "De otra persona o empresa", "Someone else's, or another company's")),
        naoSei(),
      ],
      ficha: ["anexoB"],
    },
    // 105
    {
      id: "dominio.quem_renova",
      tipo: "unica",
      mostrarSe: inclui("dominio.tem", "sim"),
      rotulo: t("Quem renova o domínio todo ano?", "¿Quién renueva el dominio cada año?", "Who renews the domain each year?"),
      dica: t(
        "É quem recebe o aviso ou a cobrança do registrador.",
        "Es quien recibe el aviso o el cargo del registrador.",
        "It's whoever gets the reminder or the bill from the registrar.",
      ),
      variante: {
        BR: {
          dica: t(
            "É quem recebe o aviso ou a cobrança, quase sempre do Registro.br.",
            "Es quien recibe el aviso o el cobro, casi siempre de Registro.br.",
            "It's whoever gets the reminder or the bill, almost always from Registro.br.",
          ),
        },
        ES: {
          dica: t(
            "É quem recebe o aviso ou a cobrança do registrador (Arsys, IONOS, Dinahosting, DonDominio ou outro).",
            "Es quien recibe el aviso o el cargo del registrador (Arsys, IONOS, Dinahosting, DonDominio u otro).",
            "It's whoever gets the reminder or the bill from the registrar (Arsys, IONOS, Dinahosting, DonDominio or another).",
          ),
        },
      },
      opcoes: [
        op("eu", t("Eu", "Yo", "Me")),
        op("empresa", t("Outra pessoa da empresa", "Otra persona de la empresa", "Someone else in the business")),
        op("site_antigo", t("Quem fez o site antigo", "Quien hizo la web anterior", "Whoever built the old site")),
        op("saiu", t("Alguém que já não trabalha com a gente", "Alguien que ya no trabaja con nosotros", "Someone who no longer works with us")),
        naoSei(),
      ],
      ficha: ["anexoB"],
    },
    // 106
    {
      id: "dominio.contato",
      tipo: "unica",
      mostrarSe: inclui("dominio.quem_renova", "site_antigo", "saiu"),
      rotulo: t("Vocês conseguem falar com essa pessoa?", "¿Podéis contactar con esa persona?", "Can you get hold of that person?"),
      opcoes: [
        op("sim", t("Sim, sem problema", "Sí, sin problema", "Yes, no problem")),
        op("dificil", t("Com dificuldade", "Con dificultad", "With some difficulty")),
        nao(),
      ],
      ficha: ["anexoB"],
    },
    // 107
    {
      id: "dominio.novo",
      tipo: "curto",
      mostrarSe: inclui("dominio.tem", "nao"),
      rotulo: t("Que endereço vocês gostariam?", "¿Qué dirección os gustaría?", "What address would you like?"),
      dica: t(
        "O domínio fica no nome da empresa, e o pagamento é de vocês, direto ao registrador. Eu registro junto com você.",
        "El dominio queda a nombre de la empresa, y lo pagáis vosotros, directamente al registrador. Lo registro contigo.",
        "The domain is registered in the business's name, and you pay for it, directly to the registrar. I'll register it together with you.",
      ),
      ficha: ["anexoB"],
    },
    // 108
    {
      id: "site_atual.existe",
      tipo: "unica",
      rotulo: t("O que existe hoje no lugar de um site?", "¿Qué hay hoy en lugar de una web?", "What do you have today instead of a website?"),
      opcoes: [
        op("site", t("Um site", "Una web", "A website")),
        op("links", t("Só uma página de links (Linktree, bio.site)", "Solo una página de enlaces (Linktree, bio.site)", "Just a links page (Linktree, bio.site)")),
        op("cardapio", t("Um cardápio ou catálogo digital", "Una carta o catálogo digital", "A digital menu or catalogue")),
        op("nada", t("Nada", "Nada", "Nothing")),
      ],
      ficha: ["7", "3", "11"],
    },
    // 109
    {
      id: "site_atual.endereco",
      tipo: "url",
      prefill: "site",
      mostrarSe: naoInclui("site_atual.existe", "nada"),
      rotulo: t("Endereço dele.", "Su dirección.", "Its address."),
      dica: t(
        "É esse link que o site novo vai substituir na bio do Instagram e na ficha do Google.",
        "Es el enlace que la web nueva va a sustituir en la bio de Instagram y en la ficha de Google.",
        "That's the link the new site will replace in your Instagram bio and on your Google listing.",
      ),
      ficha: ["7", "11"],
    },
    // 110
    {
      id: "site_atual.quem",
      tipo: "curto",
      mostrarSe: inclui("site_atual.existe", "site"),
      rotulo: t(
        "Quem fez o site atual, e quem cuida dele hoje? Se souber, onde ele está hospedado.",
        "¿Quién hizo la web actual, y quién se encarga de ella hoy? Si lo sabes, dónde está alojada.",
        "Who built the current site, and who looks after it now? If you know, where it's hosted.",
      ),
      dica: t(
        "Não precisa do nome de ninguém: basta dizer se foi alguém da empresa, uma agência ou um profissional de fora.",
        "No hace falta el nombre de nadie: basta con decir si fue alguien de la empresa, una agencia o un profesional externo.",
        "No need for anyone's name: just say whether it was someone in the business, an agency or an outside professional.",
      ),
      exemplo: t("Wix, WordPress, uma agência", "Wix, WordPress, una agencia", "Wix, Squarespace, an agency"),
      variante: {
        BR: { exemplo: t("Wix, Locaweb, HostGator, uma agência", "Wix, Locaweb, HostGator, una agencia", "Wix, Locaweb, HostGator, an agency") },
        ES: { exemplo: t("Wix, Arsys, IONOS, uma agência", "Wix, Arsys, IONOS, una agencia", "Wix, Arsys, IONOS, an agency") },
      },
      ficha: ["7", "anexoB"],
    },
    // 111
    {
      id: "site_atual.manter",
      tipo: "paragrafo",
      mostrarSe: inclui("site_atual.existe", "site"),
      rotulo: t(
        "Tem algo do site atual que precisa continuar funcionando?",
        "¿Hay algo de la web actual que tenga que seguir funcionando?",
        "Is there anything on the current site that needs to keep working?",
      ),
      exemplo: t(
        "um endereço impresso em catálogo, cartão ou QR code; uma página que os clientes usam",
        "una dirección impresa en un catálogo, tarjeta o código QR; una página que usan los clientes",
        "an address printed on a catalogue, business card or QR code; a page customers use",
      ),
      ficha: ["7", "11"],
    },
    // 112
    {
      id: "email.usa",
      tipo: "unica",
      rotulo: t(
        "Vocês usam e-mail com o domínio (contato@suaempresa.com)?",
        "¿Usáis correo con el dominio (info@tuempresa.com)?",
        "Do you use email on your own domain (info@yourcompany.com)?",
      ),
      variante: {
        BR: {
          rotulo: t(
            "Vocês usam e-mail com o domínio (contato@suaempresa.com.br)?",
            "¿Usáis correo con el dominio (contacto@tuempresa.com.br)?",
            "Do you use email on your own domain (contact@yourcompany.com.br)?",
          ),
        },
        ES: {
          rotulo: t(
            "Vocês usam e-mail com o domínio (info@suaempresa.es)?",
            "¿Usáis correo con el dominio (info@tuempresa.es)?",
            "Do you use email on your own domain (info@yourcompany.es)?",
          ),
        },
      },
      opcoes: [
        sim(),
        op("nao", t("Não, usamos Gmail, Hotmail ou parecido", "No, usamos Gmail, Outlook o similar", "No, we use Gmail, Outlook or similar")),
        naoSei(),
      ],
      ficha: ["anexoB"],
    },
    // 113
    {
      id: "email.quem",
      tipo: "curto",
      mostrarSe: inclui("email.usa", "sim"),
      rotulo: t(
        "Quem resolve quando o e-mail de vocês dá problema? Pode ser alguém de fora.",
        "¿Quién lo resuelve cuando vuestro correo da problemas? Puede ser alguien de fuera.",
        "Who sorts it out when your email has problems? It can be someone outside the business.",
      ),
      dica: t(
        "Publicar o site novo mexe na configuração do domínio, e o e-mail de vocês não pode cair. Não precisa do nome: basta dizer se é alguém da empresa, uma empresa de fora ou um técnico que vocês chamam.",
        "Publicar la web nueva toca la configuración del dominio, y vuestro correo no puede caerse. No hace falta el nombre: basta con decir si es alguien de la empresa, una empresa externa o un técnico al que llamáis.",
        "Launching the new site touches the domain settings, and your email mustn't go down. No need for a name: just say whether it's someone in the business, an outside company or a technician you call in.",
      ),
      ficha: ["anexoB"],
    },
    // 114
    {
      id: "acessos.email_dono",
      tipo: "email",
      rotulo: t(
        "Qual e-mail da empresa fica como dono das contas do site (publicação, Google, domínio)?",
        "¿Qué correo de la empresa queda como titular de las cuentas de la web (publicación, Google, dominio)?",
        "Which business email address will own the site's accounts (hosting, Google, domain)?",
      ),
      dica: t(
        "De preferência um e-mail da empresa, e não o pessoal de alguém que pode sair.",
        "Mejor un correo de la empresa, y no el personal de alguien que se pueda ir.",
        "Ideally a business address, not the personal one of someone who might leave.",
      ),
      ficha: ["anexoB"],
    },
    // 115
    {
      id: "presenca.perfil",
      tipo: "unica",
      rotulo: t(
        "Quem mexe na ficha de vocês no Google Maps (o Perfil da Empresa no Google)?",
        "¿Quién gestiona vuestra ficha de Google Maps (el Perfil de Empresa en Google, antes Google My Business)?",
        "Who manages your Google Maps listing (your Google Business Profile, formerly Google My Business)?",
      ),
      opcoes: [
        op("eu", t("Eu", "Yo", "Me")),
        op("empresa", t("Outra pessoa da empresa", "Otra persona de la empresa", "Someone else in the business")),
        op("fora", t("Alguém de fora", "Alguien de fuera", "Someone outside the business")),
        op("ninguem", t("Ninguém, que eu saiba", "Nadie, que yo sepa", "No one, as far as I know")),
        op("nao_existe", t("Não temos ficha", "No tenemos ficha", "We don't have a listing")),
        naoSei(),
      ],
      ficha: ["anexoB"],
    },
    // 116
    {
      id: "presenca.perfil_link",
      tipo: "url",
      mostrarSe: naoInclui("presenca.perfil", "nao_existe"),
      rotulo: t("Link da ficha, se tiver à mão.", "Enlace de la ficha, si lo tienes a mano.", "Link to the listing, if you have it to hand."),
      dica: t(
        "No Google Maps, abra a ficha de vocês e toque em Compartilhar.",
        "En Google Maps, abre vuestra ficha y toca Compartir.",
        "In Google Maps, open your listing and tap Share.",
      ),
      ficha: ["11"],
    },
    // 117
    {
      id: "prazo.tem",
      tipo: "unica",
      rotulo: t(
        "Tem uma data em que o site precisa estar no ar?",
        "¿Hay una fecha en la que la web tenga que estar publicada?",
        "Is there a date by which the site needs to be live?",
      ),
      opcoes: [nao(), sim()],
      ficha: ["2", "14"],
    },
    // 118
    {
      id: "prazo.data",
      tipo: "data",
      mostrarSe: inclui("prazo.tem", "sim"),
      rotulo: t("Qual data?", "¿Qué fecha?", "What date?"),
      ficha: ["2", "14"],
    },
    // 119
    {
      id: "prazo.motivo",
      tipo: "curto",
      mostrarSe: inclui("prazo.tem", "sim"),
      rotulo: t("Por quê?", "¿Por qué?", "Why?"),
      exemplo: t(
        "aniversário da casa, feira, cadastro de fornecedor",
        "una feria en Fira de Barcelona, un lanzamiento, la homologación como proveedor",
        "an anniversary, a trade fair, a supplier registration",
      ),
      ficha: ["2", "14"],
    },
    // 120
    {
      id: "prazo.pausas",
      tipo: "curto",
      rotulo: t(
        "Tem semanas em que ninguém aí vai poder olhar ou aprovar (férias, feira, fim de ano)?",
        "¿Hay semanas en las que nadie podrá revisar ni aprobar (agosto, puentes, ferias)?",
        "Are there weeks when nobody will be able to review or approve (holidays, trade fairs, the end of the year)?",
      ),
      ficha: ["14"],
    },
    // 121
    {
      id: "prazo.essencial",
      tipo: "paragrafo",
      pacotes: ["negocio", "profissional"],
      rotulo: t(
        "Se tiver que escolher, o que não pode faltar no site de jeito nenhum?",
        "Si tuvieras que elegir, ¿qué no puede faltar en la web de ninguna manera?",
        "If you had to choose, what absolutely must be on the site?",
      ),
      ficha: ["2"],
    },
    // 122. Na Espanha a conversa cai na tarde de lá, que é a manhã daqui; as
    //      faixas vêm em hora de Madri e têm opções próprias.
    {
      id: "final.conversa",
      tipo: "unica",
      rotulo: t(
        "Depois que eu ler tudo, se ficar alguma dúvida, prefiro resolver numa ligação curta. Qual horário costuma ser melhor para você?",
        "Cuando lo haya leído todo, si me queda alguna duda, prefiero resolverla en una llamada corta. ¿Qué horario te suele ir mejor?",
        "Once I've read everything, if anything's unclear I'd rather sort it out on a short call. What time usually suits you best?",
      ),
      variante: {
        ES: {
          rotulo: t(
            "Depois que eu ler tudo, se ficar alguma dúvida, prefiro resolver numa ligação curta. Qual faixa costuma ser melhor para você? (hora da Espanha)",
            "Cuando lo haya leído todo, si me queda alguna duda, prefiero resolverla en una llamada corta. ¿Qué franja te suele ir mejor? (hora de España)",
            "Once I've read everything, if anything's unclear I'd rather sort it out on a short call. Which slot usually suits you best? (Spanish time)",
          ),
        },
        OUTRO: {
          rotulo: t(
            "Depois que eu ler tudo, se ficar alguma dúvida, prefiro resolver numa ligação curta. Qual horário costuma ser melhor para você, no seu fuso?",
            "Cuando lo haya leído todo, si me queda alguna duda, prefiero resolverla en una llamada corta. ¿Qué horario te suele ir mejor, en tu hora local?",
            "Once I've read everything, if anything's unclear I'd rather sort it out on a short call. What time usually suits you best, in your local time?",
          ),
        },
      },
      opcoes: [
        op("manha_cedo", t("Começo da manhã", "A primera hora de la mañana", "Early morning"), { paises: ["BR", "OUTRO"] }),
        op("manha", t("Fim da manhã", "A última hora de la mañana", "Late morning"), { paises: ["BR", "OUTRO"] }),
        op("tarde", t("Tarde", "Por la tarde", "Afternoon"), { paises: ["BR", "OUTRO"] }),
        op("es_12_14", t("De 12:00 a 14:00", "De 12:00 a 14:00", "12:00 to 14:00"), { paises: ["ES"] }),
        op("es_16_1830", t("De 16:00 a 18:30", "De 16:00 a 18:30", "16:00 to 18:30"), { paises: ["ES"] }),
        op("tanto_faz", t("Tanto faz", "Me adapto", "Any time works")),
      ],
      ficha: ["14"],
    },
    // 123
    {
      id: "final.observacoes",
      tipo: "paragrafo",
      rotulo: t(
        "Alguma coisa importante que eu não perguntei? Se precisa de algo que não está no pacote, escreva aqui também.",
        "¿Algo importante que no te haya preguntado? Si necesitas algo que no está en el paquete, escríbelo aquí también.",
        "Anything important I haven't asked? If you need something that isn't in the package, write it here too.",
      ),
      ficha: ["14"],
    },
  ],
};

/* Congelado de ponta a ponta: o Worker reaproveita este módulo entre
   pedidos, e uma mutação acidental num pedido vazaria para o seguinte. */
function congelar<T>(valor: T): T {
  if (valor && typeof valor === "object" && !Object.isFrozen(valor)) {
    Object.freeze(valor);
    for (const filho of Object.values(valor as Record<string, unknown>)) congelar(filho);
  }
  return valor;
}

export const ETAPAS: Etapa[] = congelar([
  etapaEmpresa,
  etapaContato,
  etapaObjetivo,
  etapaPublico,
  etapaOferta,
  etapaProvas,
  etapaArquivos,
  etapaSite,
  etapaAcessos,
]);
