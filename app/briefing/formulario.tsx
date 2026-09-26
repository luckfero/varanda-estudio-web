"use client";

import { Fragment, memo, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { FormEvent, MouseEvent, ReactNode } from "react";
import { emailContato, whatsappUrl } from "../data";
import { ArcoMark } from "../icons";
import { enderecoDaApi } from "./contexto.ts";
import {
  PERGUNTAS,
  avisosDaEtapa,
  chaveAberta,
  chavesAceitas,
  condicaoParaQuemResponde,
  contextoPadrao,
  estadoDaResposta,
  estimarMinutos,
  etapaDaPergunta,
  etapasVisiveis,
  normalizarContexto,
  normalizarInicial,
  obrigatoriasEmBranco,
  opcoesDisponiveis,
  opcoesTravadas,
  paisDe,
  perguntaPorId,
  respostasComErro,
  rotuloDaCapacidade,
  sanear,
  sanearCampo,
  sugestaoDeTelefone,
  textoDaOpcao,
  textoDaPergunta,
  valorInicial,
  visivel,
} from "./nucleo.ts";
import type { Contexto, ErroCampo, Inicial, Respostas, ValorResposta } from "./nucleo.ts";
import { ETAPAS, LIMITES } from "./perguntas.ts";
import type { Etapa, Locale, Opcao, Pergunta } from "./perguntas.ts";
import { TEXTOS } from "./textos.ts";
import type { TextosDoBriefing } from "./textos.ts";

/**
 * O QUESTIONÁRIO DE PROJETO, do lado do navegador (ESPEC 3.4).
 *
 * **Melhoria progressiva, e ela é a espinha deste arquivo.** O servidor
 * desenha o formulário INTEIRO: as nove etapas em sequência, num
 * `<form method="post">` nativo cujo `action` é a API e cujos `name` são os
 * ids das perguntas. Sem JavaScript isso já envia, e o Worker junta o envio
 * com o rascunho salvo (campo em branco não apaga nada). Com JavaScript, a
 * classe `tem-js`, posta no `<head>` antes da primeira pintura, esconde as
 * etapas que não são a atual, e este componente assume: grava sozinho, mostra
 * uma etapa por vez e envia por `fetch`.
 *
 * **O que o SSR mostra, e por quê.** Só as perguntas que EXISTEM para este
 * link: pacote e país são decididos pelo painel ao gerar o link, e pergunta
 * de outro pacote ou país não é desenhada nem sem JavaScript (é o que impede
 * o formulário de oferecer como incluído o que o pacote não tem). As
 * condicionais aparecem TODAS, com "(se respondeu X)", porque sem JavaScript
 * não há como esconder uma pergunta conforme a resposta de outra. E o SSR
 * nasce VAZIO: sem o que já estava salvo e sem pré-preenchimento. As duas
 * coisas chegam depois, pelo `GET` da API. Se o servidor pré-preenchesse, o
 * envio sem JavaScript mandaria o valor do cadastro por cima do que o cliente
 * já tinha corrigido, e "o que ficar em branco não apaga" deixaria de ser
 * verdade. De quebra, e-mail, telefone e CNPJ do cadastro não ficam no HTML
 * que a prévia de link do WhatsApp busca.
 *
 * **Quem guarda o estado não é o React, é a `Loja`** logo abaixo, lida por
 * `useSyncExternalStore`. A gravação tem relógios, fila, trava otimista e
 * ouvintes de `visibilitychange` e `pagehide`, e tudo isso precisa ler o
 * valor MAIS RECENTE a qualquer momento, inclusive fora de um render. Num
 * `useState` isso exigiria ler `ref` durante o render, que as regras do
 * compilador do React recusam, e com razão: foi assim que o ponteiro da casa
 * ficou parado no meio da tela em 01/09/2026.
 *
 * **Os nomes de classe levam `bf-`** porque `.etapa`, `.topo`, `.abertura` e
 * `.aviso` já existem no site (processo, cabeçalho, hero e portfólio), e a
 * cascata juntaria os dois sem erro em lugar nenhum. O que é reaproveitado de
 * propósito mantém o nome do site: `.formulario`, `.campo`, `.botao`,
 * `.rotulo`, `.consentimento`, `.so-leitor`, `.marca`.
 */

/* ======================================================================
   A LOJA: valores, gravação e o que a tela precisa saber dela
   ====================================================================== */

type Indicador =
  | { tipo: "carregando" }
  | { tipo: "semCarregar" }
  | { tipo: "nada" }
  | { tipo: "salvo"; em: string | null }
  | { tipo: "local" }
  | { tipo: "tamanho" }
  | { tipo: "ajuste"; campo: string };

interface Retrato {
  valores: Respostas;
  indicador: Indicador;
  salvando: boolean;
  carregado: boolean;
  inicial: Inicial | null;
  envios: number;
  enviadoEm: string | null;
  /** Erro que o SERVIDOR devolveu (422), por chave. */
  errosDoServidor: Record<string, ErroCampo>;
  /** Sobe a cada junção que mudou alguma resposta: é o aviso de conflito. */
  conflito: number;
  /** O que a região viva anuncia: o indicador do momento em que o TIPO mudou. */
  anunciado: Indicador | null;
}

type ResultadoDoEnvio =
  | { ok: true }
  | { ok: false; motivo: "campo" | "tamanho" | "fim" | "rede" | "conflito" };

interface Ganchos {
  aoCarregar: (etapaSalva: number | null) => void;
  aoFim: (tipo: "fechado" | "encerrado") => void;
}

/* A cópia de segurança do rascunho (ESPEC 3.4 e política, seção 7).
   Chave FIXA e sem a chave do link, porque a chave do link é a credencial.
   Para a cópia de um link não cair no formulário de outro (dois links na
   mesma aba, que só o estúdio faria), ela carrega uma MARCA: os 4 primeiros
   bytes do SHA-256 da chave, que não servem para abrir nada. */
const CHAVE_DA_COPIA = "varanda-briefing-rascunho";

async function marcaDaChave(chave: string): Promise<string | null> {
  try {
    const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(chave));
    return [...new Uint8Array(bytes).slice(0, 4)].map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    return null;
  }
}

/* Tudo com storage vai dentro de try/catch: aba anônima, cota cheia e dado
   bloqueado pelo navegador lançam exceção, e a cópia é rede de segurança,
   nunca motivo para a página quebrar.
   A cópia leva o CONTEXTO do link (pacote, país, capacidade) junto das
   respostas: a tela de encerrado, que é onde ela é mostrada para copiar, não
   recebe contexto do painel, e sem ele as perguntas do Negócio e do
   Profissional sairiam com o texto do Essencial. Contexto não é segredo:
   pacote e país já estão escritos na página. */
function lerCopia(marca: string | null): { dados: Respostas; contexto: Contexto | null } | null {
  if (!marca) return null;
  try {
    const bruto = window.sessionStorage.getItem(CHAVE_DA_COPIA);
    if (!bruto) return null;
    const copia: unknown = JSON.parse(bruto);
    if (!ehObjeto(copia) || copia.v !== 1 || copia.marca !== marca || !ehObjeto(copia.dados)) return null;
    const dados: Respostas = {};
    for (const [chave, valor] of Object.entries(copia.dados)) {
      const limpo = formaDoValor(chave, valor);
      if (limpo !== undefined) dados[chave] = limpo;
    }
    if (!Object.keys(dados).length) return null;
    return { dados, contexto: ehObjeto(copia.contexto) ? normalizarContexto(copia.contexto) : null };
  } catch {
    return null;
  }
}

function gravarCopia(marca: string | null, dados: Respostas, contexto: Contexto) {
  if (!marca || Object.keys(dados).length === 0) return;
  try {
    window.sessionStorage.setItem(CHAVE_DA_COPIA, JSON.stringify({ v: 1, marca, em: Date.now(), contexto, dados }));
  } catch {
    /* sem storage, sem cópia: o indicador continua dizendo a verdade sobre o servidor */
  }
}

function apagarCopia() {
  try {
    window.sessionStorage.removeItem(CHAVE_DA_COPIA);
  } catch {
    /* idem */
  }
}

function ehObjeto(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/* Só o formato do valor, não o conteúdo: o conteúdo quem confere é o
   `sanear` do servidor. Aqui a pergunta é se o React consegue desenhar. */
function formaDoValor(chave: string, valor: unknown): Respostas[string] | undefined {
  if (chave === "_etapa") return typeof valor === "number" && Number.isInteger(valor) ? valor : undefined;
  if (chave === "_conferido") return typeof valor === "boolean" ? valor : undefined;
  if (typeof valor === "string") return valor;
  if (Array.isArray(valor) && valor.every((x) => typeof x === "string")) return [...valor];
  return undefined;
}

function vazio(valor: Respostas[string] | undefined): boolean {
  if (valor === undefined) return true;
  if (typeof valor === "string") return valor.trim() === "";
  if (Array.isArray(valor)) return valor.length === 0;
  return false;
}

function mesmo(a: unknown, b: unknown): boolean {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

function bytesDe(texto: string): number {
  return new TextEncoder().encode(texto).length;
}

/* Segundos do Retry-After, entre 1 e 1 hora; fora disso, um minuto. */
function esperaDe(resposta: Response): number {
  const n = Number(resposta.headers.get("retry-after"));
  return Number.isInteger(n) && n > 0 && n <= 3600 ? n : 60;
}

async function jsonDe(resposta: Response): Promise<Record<string, unknown>> {
  try {
    const corpo: unknown = await resposta.json();
    return ehObjeto(corpo) ? corpo : {};
  } catch {
    return {};
  }
}

const DIGITAR_MS = 1500;
const ENTRE_AUTOMATICAS_MS = 10000;
const VOLTA_DA_ABA_MS = 5 * 60 * 1000;
const TETO_DO_KEEPALIVE = 60 * 1024;

/**
 * O estado dos dados e a máquina de gravação (ESPEC 3.4, "Gravação").
 *
 * - Uma gravação por vez: o que chega no meio vira PENDENTE e sai logo depois.
 * - Rascunho 1,5 s depois de parar de digitar, com no mínimo 10 s entre as
 *   gravações automáticas. Troca de etapa e aba oculta gravam na hora.
 * - Chaves SUJAS: o que mudou aqui desde a última confirmação. É o que vence
 *   numa junção (409) e o que vai para a cópia no aparelho numa falha.
 * - Campo com erro não vai com o valor novo: vai o último que o servidor
 *   confirmou. Mandar o inválido faria o PUT inteiro voltar 422 e nada seria
 *   salvo; tirar a chave apagaria o valor antigo do rascunho.
 */
class Loja {
  private retrato: Retrato;
  private readonly ouvintes = new Set<() => void>();
  private readonly sujas = new Set<string>();
  /** O valor do cadastro de cada condicional que ainda não apareceu, na ordem do formulário. */
  private readonly prefillPendente = new Map<string, ValorResposta>();
  private confirmado: Respostas = {};
  private revisao: number | null = null;
  private emVoo: Promise<void> | null = null;
  /** O corpo do PUT que está saindo agora (gravação comum ou a do `pagehide`): o mesmo corpo não sai duas vezes. */
  private corpoSaindo: string | null = null;
  private pendente: "auto" | "agora" | null = null;
  private ultima = 0;
  private conflitosSeguidos = 0;
  private parado = false;
  private navegou = false;
  private marca: string | null = null;
  private ocultoDesde: number | null = null;
  private relogioDigitar: ReturnType<typeof setTimeout> | null = null;
  private relogioRetentar: ReturnType<typeof setTimeout> | null = null;
  private relogioCarregar: ReturnType<typeof setTimeout> | null = null;
  private ganchos: Ganchos | null = null;
  private readonly api: string;
  private readonly chave: string;
  private readonly ctx: Contexto;
  private readonly aceitas: string[];

  constructor(chave: string, locale: Locale, ctx: Contexto) {
    this.api = enderecoDaApi(chave, locale);
    this.chave = chave;
    this.ctx = ctx;
    this.aceitas = chavesAceitas(ctx);
    this.retrato = {
      valores: {},
      indicador: { tipo: "carregando" },
      salvando: false,
      carregado: false,
      inicial: null,
      envios: 0,
      enviadoEm: null,
      errosDoServidor: {},
      conflito: 0,
      anunciado: null,
    };
  }

  /* ---- o contrato do useSyncExternalStore ---- */

  assinar = (ouvinte: () => void) => {
    this.ouvintes.add(ouvinte);
    return () => {
      this.ouvintes.delete(ouvinte);
    };
  };

  retratar = () => this.retrato;

  private publicar(parte: Partial<Retrato>) {
    this.retrato = { ...this.retrato, ...parte };
    for (const ouvinte of this.ouvintes) ouvinte();
  }

  private indicar(indicador: Indicador) {
    /* O anúncio só troca quando o TIPO troca: "Salvo às 14:32" virando
       "Salvo às 14:33" a cada gravação faria o leitor de tela falar o tempo
       todo enquanto a pessoa digita. O texto visível continua mudando. */
    const antes = this.retrato.anunciado;
    const mesmoTipo = antes !== null && antes.tipo === indicador.tipo && (antes.tipo !== "ajuste" || (indicador.tipo === "ajuste" && antes.campo === indicador.campo));
    this.publicar({ indicador, anunciado: mesmoTipo ? antes : indicador });
  }

  /* ---- ciclo de vida ---- */

  iniciar(ganchos: Ganchos): () => void {
    this.ganchos = ganchos;
    this.parado = false;
    const aoVisibilidade = () => {
      if (document.visibilityState === "hidden") {
        this.ocultoDesde = Date.now();
        void this.gravar("oculta");
      } else if (this.ocultoDesde !== null) {
        const passou = Date.now() - this.ocultoDesde;
        this.ocultoDesde = null;
        /* Voltou depois de mais de 5 minutos: outro aparelho pode ter
           gravado. Busca e atualiza o que não foi mexido aqui. */
        if (passou > VOLTA_DA_ABA_MS) void this.carregar(false);
      }
    };
    const aoSair = () => this.sair();
    document.addEventListener("visibilitychange", aoVisibilidade);
    window.addEventListener("pagehide", aoSair);
    void (async () => {
      this.marca = await marcaDaChave(this.chave);
      await this.carregar(true);
    })();
    return () => {
      this.parado = true;
      document.removeEventListener("visibilitychange", aoVisibilidade);
      window.removeEventListener("pagehide", aoSair);
      for (const r of [this.relogioDigitar, this.relogioRetentar, this.relogioCarregar]) if (r) clearTimeout(r);
    };
  }

  private encerrar(tipo: "fechado" | "encerrado") {
    /* O que ainda não chegou ao servidor vai para a cópia ANTES da tela
       trocar: é ela que a tela de encerrado mostra para copiar. */
    this.guardarNoAparelho();
    this.parado = true;
    this.ganchos?.aoFim(tipo);
  }

  /** GET: o rascunho, o que o painel sabe do cliente e a revisão. */
  async carregar(primeira: boolean): Promise<void> {
    if (this.relogioCarregar) clearTimeout(this.relogioCarregar);
    let resposta: Response;
    try {
      resposta = await fetch(this.api, { cache: "no-store", headers: { accept: "application/json" } });
    } catch {
      this.falhouAoCarregar(primeira, 60);
      return;
    }
    if (this.parado) return;
    if (resposta.status === 410) {
      const corpo = await jsonDe(resposta);
      this.encerrar(corpo.erro === "fechado" ? "fechado" : "encerrado");
      return;
    }
    if (resposta.status === 404) {
      this.encerrar("encerrado");
      return;
    }
    if (!resposta.ok) {
      this.falhouAoCarregar(primeira, esperaDe(resposta));
      return;
    }
    const dados = await jsonDe(resposta);
    const servidor = ehObjeto(dados.respostas) ? dados.respostas : {};
    const inicial = normalizarInicial(dados.inicial);
    const confirmadoAntes = this.confirmado;
    this.confirmado = this.limpar(servidor);
    if (this.emVoo === null && typeof dados.revisao === "number") this.revisao = dados.revisao;

    if (primeira) {
      const valores = this.juntarValores(servidor, {});
      /* A cópia deste aparelho, de uma gravação que falhou: volta como SUJA,
         por cima do servidor, e sobe logo em seguida. Vem antes do
         pré-preenchimento para a condição dele já enxergar o que ela traz. */
      const copia = lerCopia(this.marca)?.dados;
      if (copia) {
        for (const [k, v] of Object.entries(copia)) {
          if (!this.aceitas.includes(k) || k === "_etapa") continue;
          valores[k] = v;
          this.sujas.add(k);
        }
      }
      /* Pré-preenchimento: só quando o rascunho não tem a chave e ninguém
         mexeu nela aqui. `aprovacao.responsavel` não tem `prefill` no esquema
         e `valorInicial` devolve null para ela: quem recebeu o link não é,
         só por isso, quem decide.
         E só na pergunta que APARECE. A condicional escondida fica esperando
         (`prefillPendente`) e recebe o valor quando a resposta que a abre for
         dada. Antes de 25/09/2026 o laço não olhava a condição: o e-mail e a
         cidade do cadastro subiam para perguntas que o cliente nunca viu, e a
         leitura acusava "respondida fora da condição" em quase todo briefing. */
      for (const p of PERGUNTAS) {
        if (p.obsoleta || Object.hasOwn(servidor, p.id) || this.sujas.has(p.id)) continue;
        const v = valorInicial(p, this.ctx, inicial);
        if (v === null || travadaSo(p, this.ctx, v)) continue;
        if (visivel(p, valores, this.ctx)) valores[p.id] = v;
        else this.prefillPendente.set(p.id, v);
      }
      const etapaSalva = typeof servidor._etapa === "number" ? servidor._etapa : null;
      this.publicar({
        valores,
        carregado: true,
        inicial,
        envios: typeof dados.envios === "number" ? dados.envios : 0,
        enviadoEm: typeof dados.enviado_em === "string" ? dados.enviado_em : null,
      });
      this.indicar(copia ? { tipo: "local" } : typeof dados.salvo_em === "string" ? { tipo: "salvo", em: dados.salvo_em } : { tipo: "nada" });
      this.ganchos?.aoCarregar(this.navegou ? null : etapaSalva);
      if (this.sujas.size > 0) void this.gravar("agora");
    } else {
      const mudou = this.juntar(servidor, confirmadoAntes);
      this.publicar({
        inicial,
        envios: typeof dados.envios === "number" ? dados.envios : this.retrato.envios,
        enviadoEm: typeof dados.enviado_em === "string" ? dados.enviado_em : this.retrato.enviadoEm,
      });
      if (mudou) this.publicar({ conflito: this.retrato.conflito + 1 });
    }
  }

  private falhouAoCarregar(primeira: boolean, segundos: number) {
    if (this.parado) return;
    if (primeira) this.indicar({ tipo: "semCarregar" });
    this.relogioCarregar = setTimeout(() => void this.carregar(primeira && !this.retrato.carregado), segundos * 1000);
  }

  /* Formato limpo do que veio do servidor, só com as chaves deste link. */
  private limpar(bruto: Record<string, unknown>): Respostas {
    const saida: Respostas = {};
    for (const k of this.aceitas) {
      if (!Object.hasOwn(bruto, k)) continue;
      const v = formaDoValor(k, bruto[k]);
      if (v !== undefined) saida[k] = v;
    }
    return saida;
  }

  /* Servidor por baixo, o que está sujo aqui por cima. `_etapa` é sempre a
     deste aparelho: a etapa em que o OUTRO parou não move esta tela. */
  private juntarValores(servidor: Record<string, unknown>, confirmadoAntes: Respostas): Respostas {
    const atual = this.retrato.valores;
    const novo: Respostas = {};
    for (const k of this.aceitas) {
      if (k === "_etapa" || this.sujas.has(k)) {
        if (atual[k] !== undefined) novo[k] = atual[k];
        continue;
      }
      const s = Object.hasOwn(servidor, k) ? formaDoValor(k, servidor[k]) : undefined;
      if (s !== undefined) novo[k] = s;
      /* Estava confirmado antes e sumiu do servidor: o outro aparelho apagou.
         Nunca esteve no servidor (o pré-preenchimento): fica o daqui. */
      else if (!Object.hasOwn(confirmadoAntes, k) && atual[k] !== undefined) novo[k] = atual[k];
    }
    return novo;
  }

  /** Junta e publica. Devolve se alguma resposta VISÍVEL mudou. */
  private juntar(servidor: Record<string, unknown>, confirmadoAntes: Respostas): boolean {
    const antes = this.retrato.valores;
    const novo = this.juntarValores(servidor, confirmadoAntes);
    const mudou = this.aceitas.some((k) => k !== "_etapa" && !mesmo(antes[k], novo[k]));
    this.publicar({ valores: novo });
    return mudou;
  }

  /* ---- mudanças da tela ---- */

  definir = (chave: string, valor: Respostas[string] | null) => {
    const valores = { ...this.retrato.valores };
    if (valor === null || vazio(valor)) delete valores[chave];
    else valores[chave] = valor;
    const errosDoServidor = { ...this.retrato.errosDoServidor };
    delete errosDoServidor[chave];
    this.sujas.add(chave);
    this.aplicarPrefill(valores);
    this.publicar({ valores, errosDoServidor });
    if (this.relogioDigitar) clearTimeout(this.relogioDigitar);
    this.relogioDigitar = setTimeout(() => void this.gravar("auto"), DIGITAR_MS);
  };

  /* A condicional que acabou de aparecer recebe o valor do cadastro, uma vez
     só: o que a pessoa apagou (chave suja) ou o que já tem valor não é
     tocado. Na ordem do formulário, porque uma pergunta pode abrir a
     seguinte. Não marca como suja: como no pré-preenchimento da carga, o
     valor sobe junto na próxima gravação. */
  private aplicarPrefill(valores: Respostas) {
    for (const [chave, valor] of this.prefillPendente) {
      if (Object.hasOwn(valores, chave) || this.sujas.has(chave)) {
        this.prefillPendente.delete(chave);
        continue;
      }
      const p = perguntaPorId(chave);
      if (!p || !visivel(p, valores, this.ctx)) continue;
      valores[chave] = valor;
      this.prefillPendente.delete(chave);
    }
  }

  /** Troca de etapa: grava o `_etapa` ("parou na etapa X") e o resto, na hora. */
  definirEtapa = (numero: number) => {
    this.navegou = true;
    if (this.retrato.valores._etapa !== numero) {
      this.publicar({ valores: { ...this.retrato.valores, _etapa: numero } });
      this.sujas.add("_etapa");
    }
    void this.gravar("agora");
  };

  /* ---- a gravação ---- */

  private payload(): Respostas {
    const v = this.retrato.valores;
    const saida: Respostas = {};
    for (const k of this.aceitas) {
      if (k === "_etapa" || k === "_conferido") continue;
      const local = v[k];
      if (vazio(local)) continue;
      const conferencia = sanearCampo(k, local, this.ctx);
      if ("erro" in conferencia) {
        if (this.confirmado[k] !== undefined) saida[k] = this.confirmado[k];
        continue;
      }
      saida[k] = local as Respostas[string];
    }
    if (typeof v._etapa === "number") saida._etapa = v._etapa;
    if (typeof v._conferido === "boolean") saida._conferido = v._conferido;
    return saida;
  }

  private sujasAgora(): Respostas {
    const dados: Respostas = {};
    for (const k of this.sujas) {
      if (k === "_etapa") continue;
      const v = this.retrato.valores[k];
      if (v !== undefined) dados[k] = v;
    }
    return dados;
  }

  private guardarNoAparelho() {
    gravarCopia(this.marca, this.sujasAgora(), this.ctx);
  }

  private agendarRetentar(segundos: number) {
    if (this.relogioRetentar) clearTimeout(this.relogioRetentar);
    this.relogioRetentar = setTimeout(() => void this.gravar("agora"), segundos * 1000);
  }

  private falhou(segundos: number) {
    /* Falha de rede, 429 e 503 NÃO são erro vermelho: é "guardado neste
       aparelho", com nova tentativa sozinha (ESPEC 3.4). */
    this.guardarNoAparelho();
    this.indicar({ tipo: "local" });
    this.agendarRetentar(segundos);
  }

  async gravar(modo: "auto" | "agora" | "oculta"): Promise<void> {
    if (this.parado || !this.retrato.carregado || this.revisao === null) return;
    if (this.sujas.size === 0) return;
    if (this.emVoo) {
      this.pendente = this.pendente === "agora" || modo !== "auto" ? "agora" : "auto";
      return;
    }
    if (modo === "auto") {
      const falta = this.ultima + ENTRE_AUTOMATICAS_MS - Date.now();
      if (falta > 0) {
        if (this.relogioDigitar) clearTimeout(this.relogioDigitar);
        this.relogioDigitar = setTimeout(() => void this.gravar("auto"), falta);
        return;
      }
    }
    const respostas = this.payload();
    const corpo = JSON.stringify({ respostas, revisao_base: this.revisao });
    /* O mesmo corpo já está saindo, pelo `pagehide` (ver `sair`): mandar de
       novo, com a mesma revisão de base, seria um 409 certo no painel. */
    if (corpo === this.corpoSaindo) return;
    if (this.relogioRetentar) clearTimeout(this.relogioRetentar);
    const retrato = new Map([...this.sujas].map((k) => [k, JSON.stringify(this.retrato.valores[k] ?? null)]));
    /* keepalive só abaixo de 60 KB: o navegador soma os corpos em voo com
       keepalive e recusa acima de 64 KB. Acima disso vai sem, e quem protege
       é a cópia no aparelho se a aba morrer no meio. */
    const keepalive = modo === "oculta" && bytesDe(corpo) < TETO_DO_KEEPALIVE;
    this.ultima = Date.now();
    this.corpoSaindo = corpo;
    this.publicar({ salvando: true });

    let refazer = false;
    const voo = (async () => {
      let resposta: Response;
      try {
        resposta = await fetch(this.api, {
          method: "PUT",
          headers: { "content-type": "application/json", accept: "application/json" },
          body: corpo,
          keepalive,
          cache: "no-store",
        });
      } catch {
        this.falhou(60);
        return;
      }
      refazer = await this.tratar(resposta, respostas, retrato);
    })();
    this.emVoo = voo;
    try {
      await voo;
    } finally {
      this.emVoo = null;
      if (this.corpoSaindo === corpo) this.corpoSaindo = null;
      this.publicar({ salvando: false });
    }
    const pendente = this.pendente;
    this.pendente = null;
    if (this.parado) return;
    if (refazer || pendente === "agora") void this.gravar("agora");
    else if (pendente === "auto" || this.sujas.size > 0) {
      if (this.relogioDigitar) clearTimeout(this.relogioDigitar);
      this.relogioDigitar = setTimeout(() => void this.gravar("auto"), DIGITAR_MS);
    }
  }

  /** Trata a resposta de um PUT. Devolve se é para gravar de novo já. */
  private async tratar(resposta: Response, enviadas: Respostas, retrato: Map<string, string>): Promise<boolean> {
    if (resposta.ok) {
      const corpo = await jsonDe(resposta);
      if (typeof corpo.revisao === "number") this.revisao = corpo.revisao;
      const saneado = sanear(enviadas, this.ctx);
      this.confirmado = "respostas" in saneado ? { ...saneado.respostas } : { ...enviadas };
      /* Limpa só o que não mudou de novo enquanto a gravação voava. */
      for (const [k, antes] of retrato) if (JSON.stringify(this.retrato.valores[k] ?? null) === antes) this.sujas.delete(k);
      this.conflitosSeguidos = 0;
      apagarCopia();
      this.indicar({ tipo: "salvo", em: typeof corpo.salvo_em === "string" ? corpo.salvo_em : null });
      return false;
    }
    const corpo = await jsonDe(resposta);
    switch (resposta.status) {
      case 409: {
        const servidor = ehObjeto(corpo.respostas) ? corpo.respostas : {};
        const confirmadoAntes = this.confirmado;
        this.confirmado = this.limpar(servidor);
        if (typeof corpo.revisao === "number") this.revisao = corpo.revisao;
        const mudou = this.juntar(servidor, confirmadoAntes);
        if (mudou) this.publicar({ conflito: this.retrato.conflito + 1 });
        /* Dois aparelhos gravando sem parar podem se atropelar sempre. Na
           terceira seguida, espera um minuto antes de tentar de novo. */
        this.conflitosSeguidos += 1;
        if (this.conflitosSeguidos >= 3) {
          this.conflitosSeguidos = 0;
          this.agendarRetentar(60);
          return false;
        }
        return true;
      }
      case 422: {
        const campo = typeof corpo.campo === "string" ? corpo.campo : "";
        const erro = corpo.erro as ErroCampo;
        this.publicar({ errosDoServidor: { ...this.retrato.errosDoServidor, [campo]: erro } });
        this.indicar({ tipo: "ajuste", campo });
        /* O `payload` passa a mandar o valor confirmado dessa chave, então
           a gravação seguinte sai com o resto. Só se ele for mesmo inválido
           pela régua daqui: senão o laço seria infinito. */
        return "erro" in sanearCampo(campo, this.retrato.valores[campo], this.ctx);
      }
      case 413:
        this.guardarNoAparelho();
        this.indicar({ tipo: "tamanho" });
        return false;
      case 410:
        this.encerrar(corpo.erro === "fechado" ? "fechado" : "encerrado");
        return false;
      case 404:
        this.encerrar("encerrado");
        return false;
      case 429:
      case 503:
        this.falhou(esperaDe(resposta));
        return false;
      default:
        this.falhou(60);
        return false;
    }
  }

  /**
   * `pagehide`: um PUT com keepalive, sem esperar, e só abaixo de 60 KB. NUNCA
   * sendBeacon, que só faz POST, e POST aqui é envio.
   *
   * Duas coisas que a medição mostrou. Ao sair da página, o `pagehide` vem
   * ANTES do `visibilitychange` oculto (é a ordem do descarregamento no
   * HTML), e os dois gravam: com o mesmo corpo e a mesma revisão de base, o
   * segundo era um 409 certo no painel. Então o mesmo corpo não sai duas
   * vezes, em nenhuma das duas ordens (`corpoSaindo`). E a página nem sempre
   * morre: voltando pelo cache de voltar e avançar, ela segue viva, e a
   * resposta precisa atualizar a revisão e as chaves sujas, senão a próxima
   * gravação sai com a revisão velha.
   */
  private sair() {
    if (this.parado || !this.retrato.carregado || this.revisao === null || this.sujas.size === 0) return;
    const respostas = this.payload();
    const corpo = JSON.stringify({ respostas, revisao_base: this.revisao });
    if (bytesDe(corpo) >= TETO_DO_KEEPALIVE || corpo === this.corpoSaindo) return;
    const retrato = new Map([...this.sujas].map((k) => [k, JSON.stringify(this.retrato.valores[k] ?? null)]));
    this.corpoSaindo = corpo;
    try {
      void fetch(this.api, { method: "PUT", headers: { "content-type": "application/json" }, body: corpo, keepalive: true })
        .then((resposta) => this.tratar(resposta, respostas, retrato))
        .catch(() => {})
        .finally(() => {
          if (this.corpoSaindo === corpo) this.corpoSaindo = null;
        });
    } catch {
      /* a aba está indo embora; não há a quem avisar */
      this.corpoSaindo = null;
    }
  }

  /** O envio final: espera a gravação em voo, manda POST e junta de novo se houver conflito. */
  async enviar(): Promise<ResultadoDoEnvio> {
    if (this.relogioDigitar) clearTimeout(this.relogioDigitar);
    if (this.relogioRetentar) clearTimeout(this.relogioRetentar);
    while (this.emVoo) await this.emVoo;
    for (let tentativa = 0; tentativa < 3; tentativa++) {
      if (this.parado || this.revisao === null) return { ok: false, motivo: "fim" };
      const respostas = this.payload();
      let resposta: Response;
      try {
        resposta = await fetch(this.api, {
          method: "POST",
          headers: { "content-type": "application/json", accept: "application/json" },
          body: JSON.stringify({ respostas, revisao_base: this.revisao, final: true }),
          cache: "no-store",
        });
      } catch {
        this.guardarNoAparelho();
        return { ok: false, motivo: "rede" };
      }
      const corpo = await jsonDe(resposta);
      if (resposta.ok) {
        if (typeof corpo.revisao === "number") this.revisao = corpo.revisao;
        this.sujas.clear();
        apagarCopia();
        this.publicar({
          envios: typeof corpo.envios === "number" ? corpo.envios : this.retrato.envios + 1,
          enviadoEm: typeof corpo.enviado_em === "string" ? corpo.enviado_em : this.retrato.enviadoEm,
        });
        this.indicar({ tipo: "salvo", em: typeof corpo.salvo_em === "string" ? corpo.salvo_em : null });
        return { ok: true };
      }
      if (resposta.status === 409) {
        const servidor = ehObjeto(corpo.respostas) ? corpo.respostas : {};
        const confirmadoAntes = this.confirmado;
        this.confirmado = this.limpar(servidor);
        if (typeof corpo.revisao === "number") this.revisao = corpo.revisao;
        if (this.juntar(servidor, confirmadoAntes)) this.publicar({ conflito: this.retrato.conflito + 1 });
        continue;
      }
      if (resposta.status === 422) {
        const campo = typeof corpo.campo === "string" ? corpo.campo : "";
        this.publicar({ errosDoServidor: { ...this.retrato.errosDoServidor, [campo]: corpo.erro as ErroCampo } });
        return { ok: false, motivo: "campo" };
      }
      if (resposta.status === 413) {
        this.guardarNoAparelho();
        return { ok: false, motivo: "tamanho" };
      }
      if (resposta.status === 410 || resposta.status === 404) {
        this.encerrar(corpo.erro === "fechado" ? "fechado" : "encerrado");
        return { ok: false, motivo: "fim" };
      }
      this.guardarNoAparelho();
      return { ok: false, motivo: "rede" };
    }
    return { ok: false, motivo: "conflito" };
  }
}

/* A travada entra sozinha pelo núcleo; pré-preencher só com ela seria
   marcar a pergunta como mexida sem ninguém ter mexido. */
function travadaSo(p: Pergunta, ctx: Contexto, v: ValorResposta): boolean {
  const travadas = opcoesTravadas(p, ctx);
  return travadas.length > 0 && Array.isArray(v) && v.every((id) => travadas.includes(id));
}

/* O React só pode tratar o documento como hidratado depois da hidratação:
   no servidor e no primeiro render do navegador isto é falso, e aí o HTML dos
   dois bate. É o jeito sem `setState` dentro de efeito. */
const semAssinatura = () => () => {};
function useHidratado(): boolean {
  return useSyncExternalStore(
    semAssinatura,
    () => true,
    () => false,
  );
}

/* ======================================================================
   Ajudantes de texto e de marcação
   ====================================================================== */

const idDoCampo = (chave: string) => `c-${chave.replace(/[^a-z0-9_]/gi, "-")}`;
const idDaOpcao = (pergunta: string, opcao: string) => `${idDoCampo(pergunta)}--${opcao}`;
const idDaEtapa = (id: string) => `etapa-${id}`;
const idDoTitulo = (id: string) => `titulo-${id}`;

function lista(valor: Respostas[string] | undefined): string[] {
  return Array.isArray(valor) ? valor : typeof valor === "string" && valor ? [valor] : [];
}

function textoDe(valor: Respostas[string] | undefined): string {
  return typeof valor === "string" ? valor : "";
}

/** "AAAA-MM-DD HH:MM:SS" do SQLite é UTC sem fuso escrito; ISO também serve. */
function instante(texto: string | null): Date | null {
  if (!texto) return null;
  const sqlite = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(texto);
  const d = new Date(sqlite ? `${texto.replace(" ", "T")}Z` : texto);
  return Number.isNaN(d.getTime()) ? null : d;
}

/* Hora e data no fuso do NAVEGADOR (ESPEC 3.4). Sem `timeZone`, o Intl usa o
   fuso da máquina de quem lê: 14:32 em São Paulo é 19:32 em Madri. */
function horaLocal(texto: string | null, intl: string): string | null {
  const d = instante(texto);
  return d ? new Intl.DateTimeFormat(intl, { hour: "2-digit", minute: "2-digit" }).format(d) : null;
}

function dataHoraLocal(texto: string | null, intl: string): string | null {
  const d = instante(texto);
  return d ? new Intl.DateTimeFormat(intl, { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }).format(d) : null;
}

/** A data de um campo `data` (AAAA-MM-DD), escrita por extenso no idioma, sem trocar o dia pelo fuso. */
function dataLegivel(aaaaMmDd: string, intl: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(aaaaMmDd);
  if (!m) return aaaaMmDd;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return new Intl.DateTimeFormat(intl, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(d);
}

/** O número da sugestão, escrito como a pessoa reconhece. */
function telefoneLegivel(e164: string, pais: string): string {
  const d = e164.replace(/^\+/, "");
  if (d.startsWith("55") && (d.length === 12 || d.length === 13)) {
    const ddd = d.slice(2, 4);
    const n = d.slice(4);
    const local = `${n.slice(0, n.length - 4)}-${n.slice(-4)}`;
    /* Sem o +55 só quando o link é do Brasil: fora dele, o número sem código
       seria recusado pelo próprio campo. */
    return paisDe(pais) === "BR" ? `(${ddd}) ${local}` : `+55 ${ddd} ${local}`;
  }
  if (d.startsWith("34") && d.length === 11) return `+34 ${d.slice(2, 5)} ${d.slice(5, 8)} ${d.slice(8)}`;
  return e164;
}

/* Um formatador de número por idioma, e não um por campo: construir
   `Intl.NumberFormat` custa, e a página tem mais de cem campos de texto no
   render do servidor, que tem teto de CPU por pedido. */
const NUMEROS = new Map<string, Intl.NumberFormat>();
function formatarNumero(intl: string, n: number): string {
  let formato = NUMEROS.get(intl);
  if (!formato) {
    formato = new Intl.NumberFormat(intl);
    NUMEROS.set(intl, formato);
  }
  return formato.format(n);
}

function linkDoWhatsapp(mensagem: string): string {
  return `${whatsappUrl}?text=${encodeURIComponent(mensagem)}`;
}

/* O WhatsApp de verdade, desenhado aqui pelo mesmo motivo da seta de
   `section-contato.tsx`: os ícones de `app/icons.tsx` não declaram cor. */
function IconeWhatsapp() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M4.5 19.5l1.2-3.6A8 8 0 1 1 8.4 18.6L4.5 19.5z" />
      <path d="M9.2 9.3c.2 1.9 1.6 3.7 3.6 4.5l1-1 1.6.7-.3 1.4c-2.9.1-6.1-2.6-6.3-5.6l1.4-.4.7 1.6-.9.8" />
    </svg>
  );
}

function Seta({ volta = false }: { volta?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {volta ? <path d="M19 12H6M11 6l-6 6 6 6" /> : <path d="M5 12h13M13 6l6 6-6 6" />}
    </svg>
  );
}

/* O valor de uma resposta como a pessoa escreveria, no idioma da página: é o
   que o resumo do Revisar e a cópia de segurança mostram. */
function valorLegivel(p: Pergunta, valores: Respostas, ctx: Contexto, locale: Locale, t: TextosDoBriefing): string | null {
  const valor = valores[p.id];
  if (p.tipo === "unica" || p.tipo === "multipla") {
    const marcadas = new Set([...lista(valor), ...opcoesTravadas(p, ctx)]);
    const partes = opcoesDisponiveis(p, ctx)
      .filter((o) => marcadas.has(o.id))
      .map((o) => {
        const aberto = textoDe(valores[chaveAberta(p.id, o.id)]).trim();
        const rotulo = textoDaOpcao(o, ctx, locale).rotulo;
        return aberto ? `${rotulo} (${aberto})` : rotulo;
      });
    return partes.length ? partes.join(", ") : null;
  }
  const texto = textoDe(valor).trim();
  if (!texto) return null;
  if (p.tipo === "data") return dataLegivel(texto, t.intl);
  return texto;
}

/* E-mail e endereço de site são uma palavra só, sem espaço onde quebrar, e
   com o overflow-wrap: anywhere o navegador cortava em qualquer letra: no
   Revisar em 390px o e-mail saía "comercial@exemplovaranda.com.b" com o "r"
   sozinho na linha de baixo. Aqui a quebra ganha lugares que leem certo,
   depois do "@" e antes de cada "." e "/". O anywhere da folha fica de
   reserva para o caso raro de um trecho sozinho não caber. */
function comQuebras(valor: string, tipo: Pergunta["tipo"]): ReactNode {
  if (tipo !== "email" && tipo !== "url") return valor;
  /* Sem lookbehind na expressão regular, de propósito: o Safari antes do
     16.4 recusa a sintaxe já na leitura do arquivo, e aí o bundle inteiro da
     página deixa de rodar, não só esta função. */
  const partes: string[] = [];
  let atual = "";
  for (const letra of valor) {
    if ((letra === "." || letra === "/") && atual) { partes.push(atual); atual = ""; }
    atual += letra;
    if (letra === "@") { partes.push(atual); atual = ""; }
  }
  if (atual) partes.push(atual);
  return partes.map((parte, i) => (
    <Fragment key={i}>
      {i > 0 ? <wbr /> : null}
      {parte}
    </Fragment>
  ));
}

/** O texto da cópia de segurança, pergunta por pergunta, pronto para colar num e-mail ou no WhatsApp. */
function textoDaCopia(dados: Respostas, ctx: Contexto, locale: Locale): string {
  const t = TEXTOS[locale];
  const blocos: string[] = [];
  for (const p of PERGUNTAS) {
    const abertas = (p.opcoes ?? []).filter((o) => o.abre && Object.hasOwn(dados, chaveAberta(p.id, o.id)));
    if (!Object.hasOwn(dados, p.id) && abertas.length === 0) continue;
    const rotulo = textoDaPergunta(p, ctx, locale).rotulo;
    const legivel = valorLegivel(p, dados, ctx, locale, t);
    if (legivel) blocos.push(`${rotulo}\n${legivel}`);
    else for (const o of abertas) blocos.push(`${rotulo} (${textoDaOpcao(o, ctx, locale).rotulo})\n${textoDe(dados[chaveAberta(p.id, o.id)])}`);
  }
  return blocos.join("\n\n");
}

/* ======================================================================
   Os campos
   ====================================================================== */

type ErroMostrado = ErroCampo | "email";

interface PropsDaPergunta {
  p: Pergunta;
  ctx: Contexto;
  locale: Locale;
  valores: Respostas;
  visivelAgora: boolean;
  erro: ErroMostrado | null;
  maxAviso: boolean;
  sugestao: string | null;
  /** Falso no servidor e na hidratação: é quando valem as travas nativas do navegador (ver `formatoNativo`). */
  hidratado: boolean;
  definir: (chave: string, valor: Respostas[string] | null) => void;
  tocar: (chave: string) => void;
  avisarMax: (id: string | null) => void;
}

/* Um campo só redesenha quando muda o que é dele: com 123 perguntas no
   documento, redesenhar todas a cada tecla pesa no celular. */
function mesmaPergunta(a: PropsDaPergunta, b: PropsDaPergunta): boolean {
  if (a.p !== b.p || a.visivelAgora !== b.visivelAgora || a.erro !== b.erro || a.maxAviso !== b.maxAviso || a.sugestao !== b.sugestao || a.hidratado !== b.hidratado) return false;
  if (a.valores[a.p.id] !== b.valores[b.p.id]) return false;
  for (const o of a.p.opcoes ?? []) {
    if (o.abre && a.valores[chaveAberta(a.p.id, o.id)] !== b.valores[chaveAberta(b.p.id, o.id)]) return false;
  }
  return true;
}

function Rotulo({ p, ctx, locale, t }: { p: Pergunta; ctx: Contexto; locale: Locale; t: TextosDoBriefing }) {
  const condicao = condicaoParaQuemResponde(p, ctx, locale);
  return (
    <>
      {textoDaPergunta(p, ctx, locale).rotulo}
      {p.obrigatoria ? <span className="bf-obrigatoria"> {t.obrigatoria}</span> : null}
      {/* A condição por escrito só existe para quem está sem JavaScript, que
          vê todas as condicionais de uma vez. Com JavaScript a pergunta só
          aparece quando vale, e a frase sairia repetindo o óbvio. */}
      {condicao ? <span className="bf-condicao bf-sem-js"> ({condicao})</span> : null}
    </>
  );
}

const PerguntaDeTexto = memo(function PerguntaDeTexto({ p, ctx, locale, valores, visivelAgora, erro, sugestao, hidratado, definir, tocar }: PropsDaPergunta) {
  const t = TEXTOS[locale];
  const nativo = hidratado ? null : formatoNativo(p, ctx.pais, t);
  const textos = textoDaPergunta(p, ctx, locale);
  const id = idDoCampo(p.id);
  const valor = textoDe(valores[p.id]);
  const limite = LIMITES[p.tipo as keyof typeof LIMITES] ?? LIMITES.curto;
  /* O contador aparece a partir de 80% do limite: antes disso ele é ruído, e
     depois é o que impede a surpresa de o texto parar de entrar. */
  const perto = p.tipo !== "data" && valor.length >= limite * 0.8;
  const ids = {
    dica: textos.dica ? `${id}-dica` : null,
    exemplo: textos.exemplo ? `${id}-exemplo` : null,
    contador: perto ? `${id}-contador` : null,
    erro: erro ? `${id}-erro` : null,
  };
  const descrito = [ids.dica, ids.exemplo, ids.contador, ids.erro].filter(Boolean).join(" ") || undefined;
  const comum = {
    id,
    name: p.id,
    value: valor,
    "aria-describedby": descrito,
    "aria-invalid": erro ? (true as const) : undefined,
    "aria-required": p.obrigatoria ? (true as const) : undefined,
    onBlur: () => tocar(p.id),
  };
  const tipoDoInput = p.tipo === "email" ? "email" : p.tipo === "telefone" ? "tel" : p.tipo === "data" ? "date" : "text";

  return (
    <div className={`bf-pergunta campo${visivelAgora ? "" : " oculta"}`} data-pergunta={p.id}>
      <label className="bf-rotulo" htmlFor={id}>
        <Rotulo p={p} ctx={ctx} locale={locale} t={t} />
      </label>
      {textos.dica ? (
        <p className="bf-dica" id={ids.dica ?? undefined}>
          {textos.dica}
        </p>
      ) : null}
      {p.tipo === "paragrafo" ? (
        <textarea {...comum} rows={4} maxLength={limite} onChange={(e) => definir(p.id, e.target.value)} />
      ) : (
        <input
          {...comum}
          type={tipoDoInput}
          inputMode={p.tipo === "url" ? "url" : undefined}
          maxLength={p.tipo === "data" ? undefined : limite}
          pattern={nativo?.pattern}
          title={nativo?.title}
          min={p.tipo === "data" ? "2000-01-01" : undefined}
          max={p.tipo === "data" ? "2100-12-31" : undefined}
          autoComplete="off"
          spellCheck={p.tipo === "curto" ? undefined : false}
          onChange={(e) => definir(p.id, e.target.value)}
        />
      )}
      {textos.exemplo ? (
        <p className="bf-exemplo" id={ids.exemplo ?? undefined}>
          {t.exemplo} {textos.exemplo}
        </p>
      ) : null}
      {/* "É este? [número] [Usar este número]": sugere, não preenche. O número
          do cadastro pode ser o pessoal, e o do site recebe os clientes. */}
      {sugestao && valor.trim() === "" ? (
        <p className="bf-sugestao bf-so-js">
          <span>{t.sugestao(telefoneLegivel(sugestao, ctx.pais))}</span>
          <button type="button" className="botao botao--contorno botao--compacto" onClick={() => definir(p.id, telefoneLegivel(sugestao, ctx.pais))}>
            {t.usarNumero}
          </button>
        </p>
      ) : null}
      {perto ? (
        <p className="bf-contador" id={ids.contador ?? undefined}>
          {t.contador(formatarNumero(t.intl, valor.length), formatarNumero(t.intl, limite))}
        </p>
      ) : null}
      {erro ? (
        <p className="bf-erro" id={ids.erro ?? undefined}>
          {mensagemDeErro(erro, t, ctx, limite)}
        </p>
      ) : null}
    </div>
  );
}, mesmaPergunta);

/* O que o navegador confere SOZINHO no envio sem JavaScript.
 *
 * Sem JavaScript, um telefone ou endereço que o `sanear` do Worker recusa
 * volta como 422 em JSON cru, numa página em branco com chaves e aspas. Então
 * o próprio navegador barra antes, com o `pattern` e o `title` (o `title` é a
 * frase que aparece no balão de aviso). É uma PENEIRA, mais frouxa que o
 * núcleo de propósito: ela pega o erro comum (número sem DDD, endereço com
 * espaço ou com outro esquema) e nunca recusa o que o servidor aceitaria. A
 * palavra final continua sendo do servidor.
 *
 * Com JavaScript o formulário tem `noValidate` e estas travas saem na
 * hidratação: quem confere é o `sanearCampo`, com a mensagem ao lado do
 * campo. Balão nativo num campo de etapa escondida seria um envio que falha
 * calado.
 *
 * A sintaxe é a do atributo `pattern`, que o navegador compila com a flag
 * `v`: dentro de colchete, parêntese, ponto, hífen e barra vão escapados. */
const SEPARADOR = String.raw`[\s\(\)\.\-]*`;
function formatoNativo(p: Pergunta, pais: string, t: TextosDoBriefing): { pattern: string; title: string } | null {
  if (p.tipo === "telefone") {
    const grupo = paisDe(pais);
    /* Contagem de dígitos com separador livre entre eles: 10 a 15 no Brasil
       (DDD e número, com ou sem o 55), 9 a 15 na Espanha, e fora dos dois o
       "+" ou "00" é obrigatório, porque não há como adivinhar o país. */
    const pattern =
      grupo === "BR"
        ? String.raw`\s*(?:\+|00)?(?:${SEPARADOR}\d){10,15}${SEPARADOR}`
        : grupo === "ES"
          ? String.raw`\s*(?:\+|00)?(?:${SEPARADOR}\d){9,15}${SEPARADOR}`
          : String.raw`\s*(?:\+|00)(?:${SEPARADOR}\d){8,15}${SEPARADOR}`;
    return { pattern, title: t.erros.telefone(grupo) };
  }
  if (p.tipo === "url") {
    /* Com ou sem http(s)://, sem espaço, sem outro esquema (javascript:,
       mailto:) e sem usuário no endereço. */
    return { pattern: String.raw`\s*(?:[hH][tT][tT][pP][sS]?://)?[^\s\/?#:@]+(?::\d+)?(?:[\/?#]\S*)?\s*`, title: t.erros.url };
  }
  return null;
}

function mensagemDeErro(erro: ErroMostrado, t: TextosDoBriefing, ctx: Contexto, limite: number): string {
  if (erro === "longo") return t.erros.longo(formatarNumero(t.intl, limite));
  if (erro === "telefone") return t.erros.telefone(paisDe(ctx.pais));
  if (erro === "url") return t.erros.url;
  if (erro === "data") return t.erros.data;
  return t.erros.email;
}

const PerguntaDeEscolha = memo(function PerguntaDeEscolha({ p, ctx, locale, valores, visivelAgora, maxAviso, definir, avisarMax }: PropsDaPergunta) {
  const t = TEXTOS[locale];
  const textos = textoDaPergunta(p, ctx, locale);
  const id = idDoCampo(p.id);
  const opcoes = opcoesDisponiveis(p, ctx);
  const textosDasOpcoes = new Map(opcoes.map((o) => [o.id, textoDaOpcao(o, ctx, locale)]));
  const travadas = opcoesTravadas(p, ctx);
  const multipla = p.tipo === "multipla";
  const marcadas = lista(valores[p.id]).filter((x) => !travadas.includes(x));
  const exclusivas = opcoes.filter((o) => o.exclusiva).map((o) => o.id);
  const ids = { dica: textos.dica ? `${id}-dica` : null, exemplo: textos.exemplo ? `${id}-exemplo` : null };

  function alternar(o: Opcao, marcar: boolean) {
    if (!multipla) {
      if (marcar) definir(p.id, o.id);
      return;
    }
    if (travadas.includes(o.id)) return;
    let novas: string[];
    if (!marcar) novas = marcadas.filter((x) => x !== o.id);
    /* Exclusiva ("Nada disso") desmarca as outras, e marcar outra desmarca a
       exclusiva. A travada não conta: ela está no pacote de qualquer jeito. */
    else if (o.exclusiva) novas = [o.id];
    else novas = [...marcadas.filter((x) => !exclusivas.includes(x)), o.id];
    if (marcar && p.max && novas.length + travadas.length > p.max) {
      /* Além do limite a caixa não marca, e a linha diz por quê. Bloquear em
         silêncio faria a pessoa achar que o toque falhou. */
      avisarMax(p.id);
      return;
    }
    avisarMax(null);
    const ordem = opcoes.map((x) => x.id);
    definir(p.id, novas.sort((a, b) => ordem.indexOf(a) - ordem.indexOf(b)));
  }

  const dicasVistas = new Set<string>();
  return (
    <fieldset
      className={`bf-pergunta bf-escolha${visivelAgora ? "" : " oculta"}`}
      data-pergunta={p.id}
      id={id}
      aria-describedby={[ids.dica, ids.exemplo].filter(Boolean).join(" ") || undefined}
    >
      <legend className="bf-rotulo">
        <Rotulo p={p} ctx={ctx} locale={locale} t={t} />
      </legend>
      {textos.dica ? (
        <p className="bf-dica" id={ids.dica ?? undefined}>
          {textos.dica}
        </p>
      ) : null}
      <div className="bf-fichas">
        {opcoes.map((o) => {
          const travada = travadas.includes(o.id);
          const marcada = travada || marcadas.includes(o.id);
          return (
            <label key={o.id} className={`bf-ficha${marcada ? " marcada" : ""}${travada ? " travada" : ""}`} htmlFor={idDaOpcao(p.id, o.id)}>
              <input
                id={idDaOpcao(p.id, o.id)}
                type={multipla ? "checkbox" : "radio"}
                name={p.id}
                value={o.id}
                checked={marcada}
                disabled={travada}
                /* A dica da opção ("Criar logotipo não entra...") é a descrição
                   do próprio controle. Texto apontado por aria-describedby
                   entra na descrição mesmo com display: none, então quem
                   navega por Tab ouve o aviso ao chegar na opção, antes de
                   marcar. Sem isto a dica aparecia calada (revisão de
                   25/09/2026: 11 por página, nenhuma ligada). */
                aria-describedby={textosDasOpcoes.get(o.id)?.dica ? `${idDaOpcao(p.id, o.id)}-dica` : undefined}
                onChange={(e) => alternar(o, e.target.checked)}
              />
              <span>
                {textosDasOpcoes.get(o.id)?.rotulo}
                {travada ? <span className="bf-travada"> ({t.travada})</span> : null}
              </span>
            </label>
          );
        })}
      </div>
      {textos.exemplo ? (
        <p className="bf-exemplo" id={ids.exemplo ?? undefined}>
          {t.exemplo} {textos.exemplo}
        </p>
      ) : null}
      {p.max ? (
        /* Região viva própria, que nasce vazia e no fluxo (o mesmo motivo do
           `.estado-formulario` do contato): a linha aparece como resposta ao
           toque, e quem ouve precisa ouvir por que a caixa não marcou. */
        <p className="bf-max" role="status">
          {maxAviso ? t.maxAviso(p.max) : ""}
        </p>
      ) : null}
      {opcoes.map((o) => {
        if (!o.abre) return null;
        const chave = chaveAberta(p.id, o.id);
        const marcada = marcadas.includes(o.id) || travadas.includes(o.id);
        const campo = idDoCampo(chave);
        return (
          <div key={chave} className={`bf-abre campo${marcada ? " visivel" : ""}`}>
            <label className="bf-rotulo-abre" htmlFor={campo}>
              {textosDasOpcoes.get(o.id)?.abre}
              {/* Sem JavaScript todos os campos abertos aparecem; a frase diz de
                  qual opção é cada um. Com JavaScript ele só aparece com a
                  opção marcada, e a frase vira texto de leitor de tela. */}
              <span className="bf-condicao-abre"> ({t.seMarcarMeio(textosDasOpcoes.get(o.id)?.rotulo ?? "")})</span>
            </label>
            <input
              id={campo}
              name={chave}
              type="text"
              maxLength={LIMITES.curto}
              autoComplete="off"
              value={textoDe(valores[chave])}
              onChange={(e) => definir(chave, e.target.value)}
            />
          </div>
        );
      })}
      {opcoes.map((o) => {
        const dica = textosDasOpcoes.get(o.id)?.dica;
        if (!dica) return null;
        const marcada = marcadas.includes(o.id) || travadas.includes(o.id);
        /* Duas opções com a mesma dica ("Quase nenhuma" e "Nenhuma") mostram
           a frase uma vez só. */
        const repetida = marcada && dicasVistas.has(dica);
        if (marcada) dicasVistas.add(dica);
        return (
          <p key={`dica-${o.id}`} id={`${idDaOpcao(p.id, o.id)}-dica`} className={`bf-dica-opcao${marcada && !repetida ? " visivel" : ""}`}>
            <span className="bf-sem-js">{t.seMarcar(textosDasOpcoes.get(o.id)?.rotulo ?? "")} </span>
            {dica}
          </p>
        );
      })}
    </fieldset>
  );
}, mesmaPergunta);

/* O texto do indicador em duas metades: no celular a segunda vira texto de
   leitor de tela (ver a folha), porque a barra presa no topo não comporta a
   frase inteira ao lado da etapa e do botão de dúvida. O `resto` carrega o
   próprio separador (" Quando terminar...", ", sobe quando..."), e a frase
   inteira é sempre `principal + resto`.
   "Guardado neste aparelho" e "Não consegui carregar" também partem, desde
   a revisão de 25/09/2026: inteiras, no celular, elas faziam a barra presa
   crescer para 153 e até 229px, e o campo que recebia o foco ficava embaixo
   dela. */
function partir(frase: string, separador: RegExp, fica: number): { principal: string; resto: string } {
  const m = separador.exec(frase);
  if (!m) return { principal: frase, resto: "" };
  const corte = m.index + fica;
  return { principal: frase.slice(0, corte), resto: frase.slice(corte) };
}

function textoDoIndicador(indicador: Indicador, t: TextosDoBriefing, ctx: Contexto, locale: Locale): { principal: string; resto: string } {
  switch (indicador.tipo) {
    case "carregando":
      return { principal: t.carregando, resto: "" };
    case "semCarregar":
      return partir(t.semCarregar, /\. /, 1);
    case "nada":
      return { principal: t.aindaNada, resto: "" };
    case "salvo": {
      const hora = horaLocal(indicador.em, t.intl);
      if (!hora) return { principal: t.aindaNada, resto: "" };
      return partir(t.salvo(hora), /\. /, 1);
    }
    case "local":
      return partir(t.local, /[,;] /, 0);
    case "tamanho":
      return { principal: t.tamanho, resto: "" };
    case "ajuste": {
      /* O campo pode ser o aberto de uma opção ("objetivo.servir.outro"): a
         pergunta dona são as duas primeiras partes. */
      const p = perguntaPorId(indicador.campo.split(".").slice(0, 2).join("."));
      return { principal: t.ajuste, resto: p ? ` ${textoDaPergunta(p, ctx, locale).rotulo}` : "" };
    }
  }
}

/* Continuar e Voltar.
   No HTML do servidor, e no primeiro render do navegador, são âncoras de
   verdade (`#etapa-x`): se o JavaScript da página não carregar, o `:target`
   do CSS ainda troca de etapa com elas. Depois da hidratação viram
   `<button type="button">`. Com o React vivo elas são AÇÃO, e não
   navegação (o clique não muda o endereço), e o papel "link" enganava o
   leitor de tela; e o Tab do Safari, que por padrão não para em link, não
   chegava nelas: no WebKit quem usa só teclado não passava da etapa 1
   (revisão de 25/09/2026). O primeiro render do navegador ainda desenha a
   âncora, então a hidratação não diverge. */
function AcaoDeEtapa({ hidratado, className, destino, ir, children }: { hidratado: boolean; className: string; destino: string; ir: () => void; children: ReactNode }) {
  if (hidratado) {
    return (
      <button type="button" className={className} onClick={ir}>
        {children}
      </button>
    );
  }
  return (
    <a
      className={className}
      href={`#${idDaEtapa(destino)}`}
      onClick={(evento: MouseEvent<HTMLAnchorElement>) => {
        evento.preventDefault();
        ir();
      }}
    >
      {children}
    </a>
  );
}

/* ======================================================================
   O formulário
   ====================================================================== */

export interface PropsDoFormulario {
  locale: Locale;
  chave: string;
  contexto: Contexto;
  /** Nome e itens do pacote, lidos pelo servidor de `investimento.pacotes`. */
  pacote: { nome: string; itens: string[] };
  /** `/privacidade#questionario` no idioma da página. */
  privacidade: string;
  /** O endereço da página, para o "Voltar ao formulário" da confirmação. */
  enderecoDoFormulario: string;
}

type TelaDoCliente = "formulario" | "recebido" | "fechado" | "encerrado";

const REVISAR = "revisar";

export default function Formulario({ locale, chave, contexto: ctx, pacote, privacidade, enderecoDoFormulario }: PropsDoFormulario) {
  const t = TEXTOS[locale];
  const [loja] = useState(() => new Loja(chave, locale, ctx));
  const retrato = useSyncExternalStore(loja.assinar, loja.retratar, loja.retratar);
  const hidratado = useHidratado();
  const { valores } = retrato;

  const [passo, setPasso] = useState<string>(ETAPAS[0].id);
  const [comecou, setComecou] = useState(false);
  const [retomar, setRetomar] = useState<string | null>(null);
  const [trocou, setTrocou] = useState(false);
  const [tela, setTela] = useState<TelaDoCliente>("formulario");
  const [tocados, setTocados] = useState<ReadonlySet<string>>(() => new Set());
  const [maxAviso, setMaxAviso] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [conflitoVisto, setConflitoVisto] = useState(0);
  /* Para onde levar o foco depois do próximo render: o título da etapa ou um
     campo. Escrito em manipulador de evento e lido em efeito, que é onde ref
     pode ser mexida. O contador é o que dispara o efeito: o "Continuar daqui"
     pede foco no título SEM trocar de etapa, e um efeito preso só a `passo`
     nunca rodaria para ele. */
  const focoRef = useRef<string | null>(null);
  const [pedidoDeFoco, setPedidoDeFoco] = useState(0);
  const barraRef = useRef<HTMLDivElement>(null);

  /* As perguntas que EXISTEM para este link (pacote e país). É a mesma régua
     do servidor: `chavesAceitas` do núcleo. */
  const existentes = useMemo(() => new Set(chavesAceitas(ctx)), [ctx]);
  const etapasDoLink = useMemo(() => ETAPAS.filter((e) => e.perguntas.some((p) => !p.obsoleta && existentes.has(p.id))), [existentes]);
  const visiveis = useMemo(() => etapasVisiveis(valores, ctx), [valores, ctx]);
  const faltam = useMemo(() => obrigatoriasEmBranco(valores, ctx), [valores, ctx]);
  /* As respostas visíveis com formato que o servidor recusaria. Sem esta
     lista o Revisar dava um WhatsApp "123" como certo, o Enviar passava e o
     painel recebia o campo em branco (o `payload` manda o último valor
     confirmado no lugar do inválido). */
  const invalidas = useMemo(() => respostasComErro(valores, ctx), [valores, ctx]);
  const minutos = useMemo(() => estimarMinutos(ctx), [ctx]);
  const sugestao = useMemo(() => (retrato.inicial ? sugestaoDeTelefone(retrato.inicial, ctx) : null), [retrato.inicial, ctx]);

  /* A etapa atual pode ter ficado sem nenhuma pergunta visível (a resposta
     que a abria mudou em outro aparelho): cai para a próxima que existe. */
  const passoValido = passo === REVISAR || visiveis.some((e) => e.id === passo) ? passo : (visiveis.find((e) => ETAPAS.indexOf(e) > ETAPAS.findIndex((x) => x.id === passo))?.id ?? REVISAR);
  const indiceVisivel = visiveis.findIndex((e) => e.id === passoValido);
  const total = visiveis.length;

  const definir = loja.definir;
  const tocar = useCallback((chaveDoCampo: string) => {
    setTocados((antes) => (antes.has(chaveDoCampo) ? antes : new Set(antes).add(chaveDoCampo)));
  }, []);
  const avisarMax = useCallback((id: string | null) => setMaxAviso(id), []);

  /* ---- montagem: GET, cópia do aparelho, ouvintes ---- */
  useEffect(() => {
    /* Um endereço com #etapa-x veio do caminho sem hidratação (os links de
       navegação são âncoras de verdade). Com o React vivo, quem manda na
       etapa é o estado, e o `:target` do CSS brigaria com ele. */
    if (/^#etapa-/.test(window.location.hash)) history.replaceState(null, "", window.location.pathname + window.location.search);
    return loja.iniciar({
      aoCarregar: (etapaSalva) => {
        if (etapaSalva === null || etapaSalva <= 1) return;
        const etapa = ETAPAS[etapaSalva - 1];
        if (!etapa || !etapasVisiveis(loja.retratar().valores, ctx).some((e) => e.id === etapa.id)) return;
        setPasso(etapa.id);
        setRetomar(etapa.id);
        setComecou(true);
      },
      aoFim: (tipo) => setTela(tipo),
    });
  }, [loja, ctx]);

  /* ---- a barra presa não cobre o campo com foco (WCAG 2.4.11) ----
     O `scroll-padding-top` do site é o do cabeçalho dele (84px no celular), e
     esta página não tem aquele cabeçalho preso: tem esta barra, que cresce
     com o texto do indicador e com a largura. Medido na revisão de
     25/09/2026: 115 a 153px em 320px, e com Shift+Tab o campo que recebia o
     foco ficava inteiro embaixo dela. O recuo passa a acompanhar a altura
     real da barra, mais um respiro. Quando a tela troca (recebido, fechado),
     a barra sai e o recuo volta ao da folha. */
  useEffect(() => {
    const barra = barraRef.current;
    if (!barra) return;
    const raiz = document.documentElement;
    const aplicar = () => raiz.style.setProperty("scroll-padding-top", `${Math.ceil(barra.getBoundingClientRect().height) + 16}px`);
    aplicar();
    if (typeof ResizeObserver === "undefined") return () => raiz.style.removeProperty("scroll-padding-top");
    const observador = new ResizeObserver(aplicar);
    observador.observe(barra);
    return () => {
      observador.disconnect();
      raiz.style.removeProperty("scroll-padding-top");
    };
  }, [tela]);

  /* ---- foco depois da troca de etapa ---- */
  useEffect(() => {
    const alvo = focoRef.current;
    if (!alvo) return;
    focoRef.current = null;
    const elemento = document.getElementById(alvo);
    if (!elemento) return;
    const campo = elemento.matches("fieldset") ? elemento.querySelector<HTMLElement>("input:not([disabled])") : elemento;
    const secao = elemento.closest(".bf-etapa");
    /* A seção sobe até o topo, logo abaixo da barra presa (quem desconta a
       barra é o `scroll-padding-top`, medido da barra no efeito acima), e o foco vai para o título dela
       sem rolar de novo. A rolagem é INSTANTÂNEA de propósito, contra o
       `scroll-behavior: smooth` da folha: medido, a etapa nova nasce de 1.000
       a 1.800px acima de onde a pessoa estava, e a rolagem suave levava um
       segundo inteiro atravessando a página, bem acima dos 300ms da regra
       9.20. O movimento que ajuda a entender é a entrada da etapa, e ela
       acontece onde o olho já está. Um campo (o link de uma obrigatória
       que falta) vai para o meio da tela, pelo mesmo motivo. */
    if (secao && elemento.id.startsWith("titulo-")) secao.scrollIntoView({ block: "start", behavior: "instant" });
    else elemento.scrollIntoView({ block: "center", behavior: "instant" });
    (campo ?? elemento).focus({ preventScroll: true });
  }, [pedidoDeFoco]);

  /* ---- navegação ---- */
  function numeroDaEtapa(id: string): number {
    const i = ETAPAS.findIndex((e) => e.id === id);
    return i >= 0 ? i + 1 : ETAPAS.length;
  }

  function irPara(id: string, foco?: string) {
    setPasso(id);
    setComecou(true);
    setTrocou(true);
    setRetomar(null);
    setMaxAviso(null);
    setConflitoVisto(retrato.conflito);
    focoRef.current = foco ?? (id === REVISAR ? idDoTitulo(REVISAR) : idDoTitulo(id));
    setPedidoDeFoco((n) => n + 1);
    loja.definirEtapa(numeroDaEtapa(id === REVISAR ? ETAPAS[ETAPAS.length - 1].id : id));
  }

  function proximaDe(id: string): string {
    const i = visiveis.findIndex((e) => e.id === id);
    return i >= 0 && i + 1 < visiveis.length ? visiveis[i + 1].id : REVISAR;
  }

  function anteriorDe(id: string): string | null {
    if (id === REVISAR) return visiveis.length ? visiveis[visiveis.length - 1].id : null;
    const i = visiveis.findIndex((e) => e.id === id);
    return i > 0 ? visiveis[i - 1].id : null;
  }

  /* ---- envio ---- */
  async function aoEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (passoValido !== REVISAR || !retrato.carregado || faltam.length > 0 || invalidas.length > 0 || enviando) return;
    setEnviando(true);
    setErroEnvio(null);
    const resultado = await loja.enviar();
    setEnviando(false);
    if (resultado.ok) {
      setTela("recebido");
      return;
    }
    if (resultado.motivo === "fim") return;
    setErroEnvio(resultado.motivo === "tamanho" ? t.tamanho : resultado.motivo === "campo" ? t.ajuste : t.erroEnvio);
  }

  /* ---- erros por campo ---- */
  const erros = useMemo(() => {
    const saida: Record<string, ErroMostrado> = {};
    for (const k of existentes) {
      if (k.startsWith("_")) continue;
      const servidor = retrato.errosDoServidor[k];
      if (servidor) {
        saida[k] = servidor;
        continue;
      }
      if (!tocados.has(k)) continue;
      const v = valores[k];
      if (vazio(v)) continue;
      const r = sanearCampo(k, v, ctx);
      if ("erro" in r) saida[k] = r.erro;
      else if (perguntaPorId(k)?.tipo === "email" && typeof v === "string" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) saida[k] = "email";
    }
    return saida;
  }, [existentes, retrato.errosDoServidor, tocados, valores, ctx]);

  if (tela !== "formulario") {
    return (
      <TelaDeEstado
        tipo={tela}
        locale={locale}
        empresa={ctx.empresa}
        chave={chave}
        contexto={ctx}
        enderecoDoFormulario={enderecoDoFormulario}
        aoVoltar={
          tela === "recebido"
            ? () => {
                setTela("formulario");
                irPara(visiveis[0]?.id ?? ETAPAS[0].id);
              }
            : undefined
        }
        focar
      />
    );
  }

  const etapaAtual = ETAPAS.find((e) => e.id === passoValido) ?? null;
  const tituloAtual = passoValido === REVISAR ? t.revisar : (etapaAtual?.titulo[locale] ?? "");
  const numeroVisivel = passoValido === REVISAR ? total : indiceVisivel + 1;
  const passoDoWhatsapp = passoValido === REVISAR ? t.passoRevisao : t.passoEtapa(Math.max(1, numeroVisivel));
  const mostrarConflito = retrato.conflito > conflitoVisto;

  const visivelAgora = textoDoIndicador(retrato.indicador, t, ctx, locale);
  const anunciado = retrato.anunciado ? textoDoIndicador(retrato.anunciado, t, ctx, locale) : null;

  const mensagemDuvida = t.msgDuvida(ctx.empresa, passoDoWhatsapp);
  const capacidade = ctx.capacidade ? rotuloDaCapacidade(ctx.capacidade, locale) : null;

  return (
    <>
      {/* A marca, que rola com a página. O que fica preso no topo é a barra
          logo abaixo: a marca não ajuda a responder, a etapa e a gravação
          sim, e no celular cada linha presa custa altura de tela. */}
      <div className="caixa bf-cabeca">
        <span className="marca bf-marca">
          <ArcoMark />
          <span className="marca-nome">
            <strong>Varanda</strong>
            <small>Estúdio Web</small>
          </span>
        </span>
      </div>

      <div className="bf-barra" ref={barraRef}>
        <div className="caixa bf-barra-linha">
          {/* "Etapa 3 de 9 · Quem compra de vocês" (ESPEC 3.4), contando só as
              etapas com alguma pergunta visível. O título some no celular
              porque o h2 da etapa, logo abaixo, já diz. */}
          <p className="bf-passo bf-so-js">
            {passoValido === REVISAR ? (
              <span>{t.revisar}</span>
            ) : (
              <>
                <span>{t.etapaDe(numeroVisivel, total)}</span>
                <span className="bf-passo-titulo"> · {tituloAtual}</span>
              </>
            )}
          </p>
          <p className="bf-gravacao bf-so-js">
            <i className={`bf-ponto${retrato.salvando ? " vivo" : ""}${retrato.indicador.tipo === "local" || retrato.indicador.tipo === "semCarregar" ? " parado" : ""}`} aria-hidden="true" />
            {hidratado ? (
              <span>
                {visivelAgora.principal}
                {visivelAgora.resto ? <span className="bf-gravacao-resto">{visivelAgora.resto}</span> : null}
              </span>
            ) : null}
          </p>
          <a className="botao botao--contorno botao--compacto bf-duvida" href={linkDoWhatsapp(mensagemDuvida)} target="_blank" rel="noreferrer">
            <IconeWhatsapp />
            <span>{t.duvidaInicio}</span>
            <span className="bf-duvida-resto"> {t.duvidaResto}</span>
            <span className="so-leitor"> {t.abreWhatsapp}</span>
          </a>
        </div>
        <div
          className="bf-progresso bf-so-js"
          role="progressbar"
          aria-label={t.progresso}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={passoValido === REVISAR ? total : numeroVisivel}
          aria-valuetext={passoValido === REVISAR ? t.revisar : t.etapaDe(numeroVisivel, total)}
        >
          <span style={{ transform: `scaleX(${total ? (passoValido === REVISAR ? 1 : numeroVisivel / total) : 0})` }} />
        </div>
        {/* As regiões vivas do indicador e do conflito, separadas para uma
            não repetir a outra. Nascem vazias e no fluxo, e a do indicador só
            muda quando o TIPO do estado muda (ver `Loja.indicar`): "Salvo às
            14:32" virando "14:33" a cada gravação faria o leitor de tela
            falar o tempo todo enquanto a pessoa digita. */}
        <p className="so-leitor" role="status">
          {hidratado && anunciado ? `${anunciado.principal}${anunciado.resto}` : ""}
        </p>
        <p className="so-leitor" role="status">
          {mostrarConflito ? t.conflito : ""}
        </p>
      </div>

      <div className="caixa bf-caixa">
        <div className="bf-coluna">
          <p className="bf-sem-js-aviso bf-sem-js">{t.semJs}</p>

          <header className={`bf-apresentacao${comecou ? " encerrada" : ""}`}>
            {ctx.empresa ? (
              <p className="rotulo">
                <i aria-hidden="true" /> {ctx.empresa}
              </p>
            ) : null}
            <h1>{t.titulo}</h1>
            {/* A abertura da ESPEC 3.6, em três parágrafos na ordem de lá. Some
                depois de começar, com JavaScript; sem ele fica no topo. */}
            {/* O que promete gravação ("salva sozinho", "fica salvo desde a
                primeira resposta") só vale com JavaScript: sem ele nada sobe
                antes do Enviar, e quem acreditasse e saísse perderia tudo
                (revisão de 25/09/2026). Cada promessa tem a versão sem
                JavaScript ao lado, e a folha mostra uma das duas. */}
            <div className="bf-abertura">
              <p className="lead">
                {t.oi(ctx.primeiro_nome)} <span className="bf-so-js">{t.abertura1(ctx.empresa, minutos)}</span>
                <span className="bf-sem-js">{t.abertura1SemJs(ctx.empresa, minutos)}</span>
              </p>
              <p>
                {t.abertura2}
                {paisDe(ctx.pais) === "ES" && t.aberturaCatalao ? ` ${t.aberturaCatalao}` : ""}
              </p>
              <p>
                <span className="bf-so-js">{t.abertura3.comJs}</span>
                <span className="bf-sem-js">{t.abertura3.semJs}</span>
                <a href={privacidade}>{t.abertura3.link}</a>
                {t.abertura3.depois}
              </p>
            </div>
            {/* "O que vocês contrataram": os itens do pacote como o site os
                publica, lidos do dicionário pelo servidor e nunca reescritos
                aqui. Sem preço. */}
            <section className="bf-contratado" aria-labelledby="bf-contratado-titulo">
              <h2 className="mono" id="bf-contratado-titulo">
                {t.contratouTitulo}
              </h2>
              <p className="bf-contratado-pacote">{t.pacote(pacote.nome)}</p>
              <ul className="bf-contratado-itens">
                {pacote.itens.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {capacidade || ctx.paginas ? (
                <dl className="bf-contratado-extra">
                  {capacidade ? (
                    <div>
                      <dt>{t.capacidade}</dt>
                      <dd>{capacidade}</dd>
                    </div>
                  ) : null}
                  {ctx.paginas ? (
                    <div>
                      <dt>{t.paginas}</dt>
                      <dd>{ctx.paginas}</dd>
                    </div>
                  ) : null}
                </dl>
              ) : null}
            </section>
          </header>

          {retomar && passoValido === retomar ? (
            <div className="bf-retomar">
              <p>
                {t.retomar} <strong>{ETAPAS.find((e) => e.id === retomar)?.titulo[locale]}</strong>.
              </p>
              <div className="bf-retomar-acoes">
                <button
                  type="button"
                  className="botao botao--acento botao--compacto"
                  onClick={() => {
                    setRetomar(null);
                    focoRef.current = idDoTitulo(retomar);
                    setPedidoDeFoco((n) => n + 1);
                    setTrocou(true);
                  }}
                >
                  {t.continuarDaqui}
                </button>
                <button type="button" className="botao botao--fantasma botao--compacto" onClick={() => irPara(visiveis[0]?.id ?? ETAPAS[0].id)}>
                  {t.verDoComeco}
                </button>
              </div>
            </div>
          ) : null}

          {/* SEM `required` nos campos: sem JavaScript o envio junta com o
              rascunho, e um obrigatório já salvo não pode barrar quem só quer
              mudar outra coisa. As obrigatórias são conferidas no Revisar, com
              o motivo escrito.
              `noValidate` só depois da hidratação. Sem JavaScript o navegador
              confere tipo, tamanho e formato antes de mandar (ver
              `formatoNativo`), porque o erro do Worker ali seria JSON cru. Com
              JavaScript quem confere é o formulário, campo a campo: o balão
              nativo apontando para um campo de etapa escondida seria um envio
              que não acontece e não diz por quê. */}
          <form
            className={`bf-form${trocou ? " trocou" : ""}`}
            method="post"
            action={enderecoDaApi(chave, locale)}
            noValidate={hidratado}
            autoComplete="off"
            onSubmit={aoEnviar}
          >
            {/* O PRIMEIRO botão de envio do formulário é este, desligado. Pela
                especificação do HTML, Enter num campo de texto aciona o
                primeiro botão de envio, e botão desligado não envia: assim
                Enter na etapa 1 não manda o questionário pela metade, com ou
                sem JavaScript. */}
            <button type="submit" disabled hidden aria-hidden="true" tabIndex={-1} />

            {etapasDoLink.map((etapa) => {
              const atual = etapa.id === passoValido;
              const perguntas = etapa.perguntas.filter((p) => !p.obsoleta && existentes.has(p.id));
              const numero = visiveis.findIndex((e) => e.id === etapa.id) + 1 || etapasDoLink.indexOf(etapa) + 1;
              const proxima = proximaDe(etapa.id);
              const anterior = anteriorDe(etapa.id);
              const avisos = avisosDaEtapa(etapa, ctx, locale);
              return (
                <section key={etapa.id} id={idDaEtapa(etapa.id)} className={`bf-etapa formulario${atual ? " atual" : ""}`} aria-labelledby={idDoTitulo(etapa.id)}>
                  {/* Só sem JavaScript: com ele a etapa já está na barra presa,
                      e o topo do cartão repetia "Etapa 2 de 9" a 60px dela. Sem
                      JavaScript a barra não mostra a etapa, e este é o único
                      marcador. */}
                  <div className="formulario-topo bf-sem-js">
                    <span className="formulario-saudacao">{hidratado ? t.etapaDe(numero, total) : t.etapaSo(etapasDoLink.indexOf(etapa) + 1)}</span>
                    <span className="ponto" aria-hidden="true" />
                  </div>
                  <div className="formulario-corpo">
                    <h2 className="bf-titulo-etapa" id={idDoTitulo(etapa.id)} tabIndex={-1}>
                      {etapa.titulo[locale]}
                    </h2>
                    {atual && mostrarConflito ? <p className="bf-nota bf-conflito">{t.conflito}</p> : null}
                    {avisos.map((aviso) => (
                      <p key={aviso} className="bf-nota">
                        {aviso}
                      </p>
                    ))}
                    {perguntas.map((p) => {
                      const props: PropsDaPergunta = {
                        p,
                        ctx,
                        locale,
                        valores,
                        visivelAgora: visivel(p, valores, ctx),
                        erro: erros[p.id] ?? null,
                        maxAviso: maxAviso === p.id,
                        sugestao: p.sugerir === "telefone" ? sugestao : null,
                        hidratado,
                        definir,
                        tocar,
                        avisarMax,
                      };
                      return p.tipo === "unica" || p.tipo === "multipla" ? <PerguntaDeEscolha key={p.id} {...props} /> : <PerguntaDeTexto key={p.id} {...props} />;
                    })}
                    <div className="bf-navegacao bf-so-js">
                      {anterior ? (
                        <AcaoDeEtapa hidratado={hidratado} className="botao botao--fantasma" destino={anterior} ir={() => irPara(anterior)}>
                          <Seta volta />
                          {t.voltar}
                        </AcaoDeEtapa>
                      ) : (
                        <span />
                      )}
                      <AcaoDeEtapa hidratado={hidratado} className="botao botao--acento" destino={proxima} ir={() => irPara(proxima)}>
                        {proxima === REVISAR ? t.revisar : t.continuar}
                        <Seta />
                      </AcaoDeEtapa>
                    </div>
                  </div>
                </section>
              );
            })}

            <Revisar
              atual={passoValido === REVISAR}
              t={t}
              locale={locale}
              ctx={ctx}
              valores={valores}
              visiveis={visiveis}
              faltam={faltam}
              invalidas={invalidas}
              hidratado={hidratado}
              carregado={retrato.carregado}
              enviando={enviando}
              erroEnvio={erroEnvio}
              envios={retrato.envios}
              enviadoEm={retrato.enviadoEm}
              privacidade={privacidade}
              anterior={anteriorDe(REVISAR)}
              definir={definir}
              tocar={tocar}
              irPara={irPara}
            />
          </form>
        </div>
      </div>
    </>
  );
}

/* ======================================================================
   Revisar e enviar
   ====================================================================== */

interface PropsDoRevisar {
  atual: boolean;
  t: TextosDoBriefing;
  locale: Locale;
  ctx: Contexto;
  valores: Respostas;
  visiveis: Etapa[];
  faltam: string[];
  invalidas: { chave: string; erro: ErroCampo }[];
  hidratado: boolean;
  carregado: boolean;
  enviando: boolean;
  erroEnvio: string | null;
  envios: number;
  enviadoEm: string | null;
  privacidade: string;
  anterior: string | null;
  definir: (chave: string, valor: Respostas[string] | null) => void;
  tocar: (chave: string) => void;
  irPara: (id: string, foco?: string) => void;
}

/* O que vai aparecer no site, na ordem em que o visitante procura. */
const NO_SITE: { id: string; rotulo: keyof TextosDoBriefing["noSite"] }[] = [
  { id: "contato.whatsapp", rotulo: "whatsapp" },
  { id: "contato.telefone", rotulo: "telefone" },
  { id: "contato.email", rotulo: "email" },
  { id: "empresa.endereco", rotulo: "endereco" },
];

/* A pergunta dona de uma chave: ela mesma, ou a de um campo aberto
   ("aprovacao.opinam.sim" é de "aprovacao.opinam"). */
function perguntaDaChave(chave: string): Pergunta | undefined {
  return perguntaPorId(chave) ?? perguntaPorId(chave.split(".").slice(0, 2).join("."));
}

/* Os links do Revisar (obrigatórias que faltam, respostas para ajustar,
   Editar) só existem com o rascunho carregado, e portanto só depois da
   hidratação: nascem `<button type="button">`, que o Tab do Safari alcança
   (revisão de 25/09/2026). Não mudam o endereço: são ação. */
function Revisar({ atual, t, locale, ctx, valores, visiveis, faltam, invalidas, hidratado, carregado, enviando, erroEnvio, envios, enviadoEm, privacidade, anterior, definir, tocar, irPara }: PropsDoRevisar) {
  /* Aria-disabled, e não `disabled`: botão desligado sai da ordem do Tab, e
     aí o motivo escrito ao lado nunca é lido por quem navega por teclado. O
     envio confere de novo no manipulador. Sem JavaScript nada disto se
     aplica: o botão envia sempre, e quem confere é o servidor. */
  const motivo = !hidratado ? null : enviando ? null : !carregado ? t.motivoCarregando : invalidas.length ? t.motivoAjuste : faltam.length ? t.motivoFaltam : null;
  const bloqueado = hidratado && (motivo !== null || enviando);
  const ultimo = envios > 0 ? dataHoraLocal(enviadoEm, t.intl) : null;
  const linhasNoSite = NO_SITE.map((linha) => ({ ...linha, p: perguntaPorId(linha.id) })).filter(
    (linha): linha is typeof linha & { p: Pergunta } => !!linha.p && visivel(linha.p, valores, ctx),
  );
  const erroDe = new Map(invalidas.map((x) => [x.chave, x.erro]));
  /* Leva ao campo e marca como tocado, para o erro dele aparecer ao lado. */
  const irAoCampo = (chave: string) => {
    const etapa = etapaDaPergunta(perguntaDaChave(chave)?.id ?? chave);
    if (!etapa) return;
    tocar(chave);
    irPara(ETAPAS[etapa - 1].id, idDoCampo(chave));
  };

  return (
    <section id={idDaEtapa(REVISAR)} className={`bf-etapa bf-revisar formulario${atual ? " atual" : ""}`} aria-labelledby={idDoTitulo(REVISAR)}>
      <div className="formulario-topo bf-sem-js">
        <span className="formulario-saudacao">{t.revisar}</span>
        <span className="ponto" aria-hidden="true" />
      </div>
      <div className="formulario-corpo">
        <h2 className="bf-titulo-etapa" id={idDoTitulo(REVISAR)} tabIndex={-1}>
          {t.revisar}
        </h2>

        {/* O resumo e as obrigatórias dependem do que está salvo, e sem
            JavaScript a página não sabe o que está salvo: aparecem só com o
            rascunho carregado. */}
        {hidratado && carregado ? (
          <>
            <p className="bf-dica">{t.revisarIntro}</p>

            {/* Formato que o servidor recusaria (WhatsApp "123", endereço
                com espaço). Antes de 25/09/2026 o Revisar dava o valor como
                certo, o Enviar passava e o painel recebia o campo em branco. */}
            {invalidas.length ? (
              <div className="bf-faltam bf-ajustar">
                <h3 className="titulo-item">{t.ajustesTitulo}</h3>
                <ul>
                  {invalidas.map(({ chave }) => {
                    const p = perguntaDaChave(chave);
                    if (!p) return null;
                    return (
                      <li key={chave}>
                        <button type="button" onClick={() => irAoCampo(chave)}>
                          {textoDaPergunta(p, ctx, locale).rotulo}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}

            {faltam.length ? (
              <div className="bf-faltam">
                <h3 className="titulo-item">{t.faltamTitulo}</h3>
                <ul>
                  {faltam.map((id) => {
                    const p = perguntaPorId(id);
                    if (!p || !etapaDaPergunta(id)) return null;
                    return (
                      <li key={id}>
                        <button type="button" onClick={() => irAoCampo(id)}>
                          {textoDaPergunta(p, ctx, locale).rotulo}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}

            <div className="bf-resumo">
              {visiveis.map((etapa) => {
                const perguntas = etapa.perguntas.filter((p) => visivel(p, valores, ctx));
                const respondidas = perguntas.filter((p) => {
                  const estado = estadoDaResposta(p, valores, ctx);
                  return estado === "respondida" || estado === "nao_sei";
                });
                return (
                  <div key={etapa.id} className="bf-resumo-etapa">
                    <div className="bf-resumo-cabeca">
                      <h3 className="titulo-item">{etapa.titulo[locale]}</h3>
                      <button type="button" className="bf-editar" onClick={() => irPara(etapa.id)}>
                        {t.editar}
                        <span className="so-leitor"> {etapa.titulo[locale]}</span>
                      </button>
                    </div>
                    <p className="bf-resumo-conta">{t.respondidas(respondidas.length, perguntas.length)}</p>
                    {respondidas.length ? (
                      <details className="bf-resumo-detalhe">
                        {/* O nome da etapa vai junto para o leitor de tela,
                            como no Editar ao lado: nove "Ver respostas"
                            iguais não diziam de qual etapa era cada um. */}
                        <summary>
                          {t.verRespostas}
                          <span className="so-leitor"> {etapa.titulo[locale]}</span>
                        </summary>
                        <dl>
                          {respondidas.map((p) => {
                            const legivel = valorLegivel(p, valores, ctx, locale, t) ?? t.emBranco;
                            return (
                              <div key={p.id}>
                                <dt>{textoDaPergunta(p, ctx, locale).rotulo}</dt>
                                <dd>{comQuebras(legivel.length > 280 ? `${legivel.slice(0, 280)}…` : legivel, p.tipo)}</dd>
                              </div>
                            );
                          })}
                        </dl>
                      </details>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </>
        ) : null}

        <div className="bf-no-site">
          <h3 className="titulo-item">{t.noSiteTitulo}</h3>
          {hidratado && carregado ? (
            <dl>
              {linhasNoSite.map((linha) => {
                const valor = textoDe(valores[linha.id]).trim();
                const erro = erroDe.get(linha.id);
                const limite = LIMITES[linha.p.tipo as keyof typeof LIMITES] ?? LIMITES.curto;
                return (
                  <div key={linha.id}>
                    <dt>{t.noSite[linha.rotulo]}</dt>
                    <dd>
                      {/* Valor que não passaria no servidor não é mostrado
                          como se fosse ao site: aparece o erro no lugar. */}
                      {erro ? (
                        <span className="bf-erro">{mensagemDeErro(erro, t, ctx, limite)}</span>
                      ) : (
                        <span className={valor ? "" : "bf-em-branco"}>{valor ? comQuebras(valor, linha.p.tipo) : t.emBranco}</span>
                      )}
                      {etapaDaPergunta(linha.id) ? (
                        <button type="button" className="bf-editar" onClick={() => irAoCampo(linha.id)}>
                          {t.editar}
                          <span className="so-leitor"> {t.noSite[linha.rotulo]}</span>
                        </button>
                      ) : null}
                    </dd>
                  </div>
                );
              })}
            </dl>
          ) : (
            <p className="bf-dica">{t.noSiteSemJs}</p>
          )}
          <label className="consentimento">
            <input type="checkbox" name="_conferido" value="1" checked={valores._conferido === true} onChange={(e) => definir("_conferido", e.target.checked)} />
            <span>{t.conferido}</span>
          </label>
        </div>

        {/* "Já estão salvas" só é verdade com JavaScript: sem ele é o Enviar
            que grava (revisão de 25/09/2026). */}
        <p className="bf-privacidade">
          <span className="bf-so-js">{t.privacidade.comJs} </span>
          <span className="bf-sem-js">{t.privacidade.semJs} </span>
          {t.privacidade.antes}
          <a href={privacidade}>{t.privacidade.link}</a>
          {t.privacidade.depois}
        </p>

        {ultimo ? <p className="bf-dica">{t.ultimoEnvio(ultimo)}</p> : null}

        <div className="bf-enviar">
          <button className="botao botao--acento botao--bloco" type="submit" aria-disabled={bloqueado ? true : undefined} aria-describedby={motivo ? "bf-motivo" : undefined}>
            {enviando ? t.enviando : t.enviar}
            <Seta />
          </button>
          {motivo ? (
            <p className="bf-motivo" id="bf-motivo">
              {motivo}
            </p>
          ) : null}
          {/* Nasce vazia e no fluxo, como a do contato. */}
          <p className="estado-formulario" role="status">
            {erroEnvio ?? ""}
          </p>
        </div>

        {anterior ? (
          <div className="bf-navegacao bf-so-js">
            <AcaoDeEtapa hidratado={hidratado} className="botao botao--fantasma" destino={anterior} ir={() => irPara(anterior)}>
              <Seta volta />
              {t.voltar}
            </AcaoDeEtapa>
          </div>
        ) : null}
      </div>
    </section>
  );
}

/* ======================================================================
   As telas de estado (ESPEC 3.4): recebido, fechado, encerrado, fora do ar
   ====================================================================== */

export interface PropsDaTelaDeEstado {
  tipo: "recebido" | "fechado" | "encerrado" | "fora_do_ar";
  locale: Locale;
  empresa: string | null;
  chave: string | null;
  contexto: Contexto | null;
  enderecoDoFormulario: string | null;
  /** Só quando a tela nasce no navegador, depois de um envio: volta sem recarregar. */
  aoVoltar?: () => void;
  /** Foco no título ao montar, quando a tela troca no navegador. */
  focar?: boolean;
}

export function TelaDeEstado({ tipo, locale, empresa, chave, contexto, enderecoDoFormulario, aoVoltar, focar }: PropsDaTelaDeEstado) {
  const t = TEXTOS[locale];
  const [copia, setCopia] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const tituloRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (focar) tituloRef.current?.focus();
  }, [focar]);

  useEffect(() => {
    /* Depois do envio a cópia do aparelho não serve mais (ESPEC 3.4). */
    if (tipo === "recebido") {
      apagarCopia();
      return;
    }
    if (tipo !== "encerrado" && tipo !== "fechado") return;
    if (!chave) return;
    let vivo = true;
    void marcaDaChave(chave).then((marca) => {
      const lida = lerCopia(marca);
      if (vivo && lida) setCopia(textoDaCopia(lida.dados, contexto ?? lida.contexto ?? contextoPadrao(), locale));
    });
    return () => {
      vivo = false;
    };
  }, [tipo, chave, contexto, locale]);

  const titulo =
    tipo === "recebido" ? t.recebidoTitulo : tipo === "encerrado" ? t.encerradoTitulo : tipo === "fora_do_ar" ? t.foraTitulo : t.titulo;
  const texto = tipo === "recebido" ? t.recebidoTexto : tipo === "encerrado" ? t.encerradoTexto : tipo === "fora_do_ar" ? t.foraTexto : t.fechadoTexto;
  const mensagem = tipo === "recebido" ? t.msgArquivos(empresa) : tipo === "encerrado" ? t.msgEncerrado : tipo === "fora_do_ar" ? t.msgFora : t.msgFechado(empresa);

  async function copiar() {
    if (!copia) return;
    try {
      await navigator.clipboard.writeText(copia);
      setCopiado(true);
    } catch {
      /* Sem permissão de área de transferência: seleciona o texto, e o
         Ctrl+C da pessoa faz o resto. */
      const area = document.getElementById("bf-copia") as HTMLTextAreaElement | null;
      area?.select();
    }
  }

  let acoes: ReactNode;
  if (tipo === "recebido") {
    acoes = (
      <>
        <section className="bf-arquivos" aria-labelledby="bf-arquivos-titulo">
          <h2 className="titulo-item" id="bf-arquivos-titulo">
            {t.arquivosTitulo}
          </h2>
          <div className="canais">
            <div className="canal">
              <span className="mono">{t.porEmail}</span>
              <a className="canal-texto" href={`mailto:${emailContato}`}>
                {emailContato}
              </a>
            </div>
            <div className="canal">
              <span className="mono">{t.porWhatsapp}</span>
              <a className="canal-texto" href={linkDoWhatsapp(mensagem)} target="_blank" rel="noreferrer">
                {whatsappUrl.replace(/^https?:\/\//, "")}
                <span className="so-leitor"> {t.abreWhatsapp}</span>
              </a>
            </div>
          </div>
          <p className="bf-dica">{t.documento}</p>
        </section>
        <div className="bf-tela-acoes">
          {aoVoltar ? (
            <button type="button" className="botao botao--fantasma" onClick={aoVoltar}>
              {t.voltarAoFormulario}
            </button>
          ) : enderecoDoFormulario ? (
            <a className="botao botao--fantasma" href={enderecoDoFormulario}>
              {t.voltarAoFormulario}
            </a>
          ) : null}
        </div>
      </>
    );
  } else {
    acoes = (
      <div className="bf-tela-acoes">
        <a className="botao botao--acento" href={linkDoWhatsapp(mensagem)} target="_blank" rel="noreferrer">
          <IconeWhatsapp />
          {t.whatsappBotao}
          <span className="so-leitor"> {t.abreWhatsapp}</span>
        </a>
      </div>
    );
  }

  return (
    <>
      <div className="caixa bf-cabeca">
        <span className="marca bf-marca">
          <ArcoMark />
          <span className="marca-nome">
            <strong>Varanda</strong>
            <small>Estúdio Web</small>
          </span>
        </span>
      </div>
      <div className="caixa bf-caixa">
        <div className="bf-coluna bf-tela">
          {empresa && tipo !== "encerrado" && tipo !== "fora_do_ar" ? (
            <p className="rotulo">
              <i aria-hidden="true" /> {empresa}
            </p>
          ) : null}
          <h1 id="bf-tela-titulo" ref={tituloRef} tabIndex={-1}>
            {titulo}
          </h1>
          <p className="lead">{texto}</p>
          {acoes}
          {copia ? (
            <div className="bf-copia">
              <h2 className="titulo-item">{t.copiaTitulo}</h2>
              <label className="so-leitor" htmlFor="bf-copia">
                {t.copiaRotulo}
              </label>
              <div className="campo">
                <textarea id="bf-copia" readOnly rows={8} value={copia} />
              </div>
              <button type="button" className="botao botao--contorno botao--compacto" onClick={copiar}>
                {t.copiar}
              </button>
              <p className="bf-dica" role="status">
                {copiado ? t.copiado : ""}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
