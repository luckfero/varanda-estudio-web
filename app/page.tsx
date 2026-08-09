"use client";

import { FormEvent, MouseEvent, TouchEvent, useEffect, useRef, useState } from "react";

const whatsappUrl = "https://wa.me/5511942263007";

const services = [
  {
    number: "01",
    title: "Site institucional",
    text: "Apresenta sua empresa, seus serviços e os principais canais de contato em uma presença digital clara e confiável.",
  },
  {
    number: "02",
    title: "Landing page",
    text: "Uma página objetiva para campanhas, lançamentos ou captação de contatos e pedidos, com conteúdo direcionado a uma ação.",
  },
  {
    number: "03",
    title: "Página profissional",
    text: "Portfólio, currículo ou apresentação de serviços com identidade própria, leitura confortável e boa experiência em qualquer tela.",
  },
];

const process = [
  {
    step: "01",
    title: "Conversa e briefing",
    text: "Entendo o negócio, o público e o que o site precisa resolver. A partir disso, organizo as informações essenciais.",
  },
  {
    step: "02",
    title: "Direção e conteúdo",
    text: "Defino a estrutura das páginas, a linguagem e a direção visual antes de iniciar o desenvolvimento.",
  },
  {
    step: "03",
    title: "Criação e ajustes",
    text: "Desenvolvo a versão demonstrativa, apresento o resultado e aplico as rodadas de ajustes incluídas na proposta.",
  },
  {
    step: "04",
    title: "Publicação e cuidado",
    text: "Com a aprovação final, preparo o site para publicação. Se você contratar manutenção, continuo acompanhando as atualizações.",
  },
];

const packages = [
  {
    name: "Essencial",
    eyebrow: "Para começar",
    launch: "590",
    future: "790",
    description: "Uma página direta para apresentar o essencial do seu negócio e facilitar o contato.",
    items: [
      "1 página com até 5 seções",
      "Adaptação para celular, tablet e computador",
      "Botão de WhatsApp",
      "Configurações básicas de SEO e acessibilidade",
      "1 rodada de ajustes",
    ],
  },
  {
    name: "Negócio",
    eyebrow: "Recomendado",
    launch: "990",
    future: "1.290",
    featured: true,
    description: "Mais espaço para explicar seus serviços, responder dúvidas e construir confiança.",
    items: [
      "Até 3 páginas",
      "Organização do conteúdo",
      "Formulário de contato ou botão de WhatsApp",
      "Configurações básicas de SEO e acessibilidade",
      "2 rodadas de ajustes",
    ],
  },
  {
    name: "Profissional",
    eyebrow: "Para crescer",
    launch: "1.490",
    future: "1.890",
    description: "Uma estrutura completa para organizar diferentes serviços, conteúdos e formas de contato.",
    items: [
      "Até 5 páginas",
      "Direção visual personalizada",
      "Formulários e integrações padrão",
      "Configurações essenciais de SEO técnico",
      "2 rodadas de ajustes",
    ],
  },
];

const maintenance = [
  {
    name: "Cuidado",
    price: "89",
    time: "30 min/mês",
    response: "Retorno em até 5 dias úteis",
  },
  {
    name: "Presença",
    price: "139",
    time: "1 hora/mês",
    response: "Retorno em até 3 dias úteis",
  },
  {
    name: "Prioridade",
    price: "239",
    time: "2 horas/mês",
    response: "Retorno em até 2 dias úteis",
  },
];

const projects = [
  {
    name: "Brasa do Vale",
    label: "Projeto conceitual · Gastronomia",
    description:
      "Um site acolhedor e direto para uma churrascaria brasileira, com foco no cardápio, nos diferenciais da casa e no contato rápido pelo WhatsApp.",
    features: [
      "Estratégia de conteúdo",
      "Direção visual",
      "Design responsivo",
      "Desenvolvimento",
    ],
    image: "/images/brasa-do-vale-hero.png",
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
    image: "https://nivora-construcoes.luccaoliveira123.workers.dev/images/casa-patio-alto.webp",
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
    image: "https://nascente-casa-olfativa.luccaoliveira123.workers.dev/images/hq/hero-central-nascente.webp",
    imageAlt: "Frasco de perfume em vidro âmbar entre folhas escuras, na página inicial do projeto Nascente",
    url: "https://nascente-casa-olfativa.luccaoliveira123.workers.dev/",
    placeholder: false,
  },
];

const faqs = [
  {
    question: "Em quanto tempo meu site fica pronto?",
    answer:
      "O prazo varia conforme o tamanho do projeto e a disponibilidade dos materiais. Depois que o escopo e o conteúdo são confirmados, o cronograma completo é registrado na proposta antes do início.",
  },
  {
    question: "Preciso ter textos e fotos prontos?",
    answer:
      "Não. Posso ajudar a organizar o conteúdo e indicar o que ainda precisa ser produzido. Redação completa, tratamento de grandes volumes de conteúdo e produção de imagens podem ser contratados à parte.",
  },
  {
    question: "Domínio e hospedagem estão inclusos?",
    answer:
      "Não. Domínio, hospedagem e ferramentas externas são contratados e pagos pelo cliente. Posso orientar a escolha e cuidar da configuração, com o valor informado antes do início.",
  },
  {
    question: "O site funciona bem no celular?",
    answer:
      "Sim. Todos os projetos são pensados para celular, tablet e computador, com foco em leitura confortável, navegação simples e carregamento eficiente.",
  },
  {
    question: "Posso pedir mudanças depois de publicado?",
    answer:
      "Sim. Pequenas alterações podem ser feitas por manutenção avulsa ou por um plano mensal. Mudanças maiores, novas páginas e funcionalidades recebem orçamento próprio antes da execução.",
  },
  {
    question: "Vocês fazem loja virtual ou sistemas?",
    answer:
      "Sim, mediante análise técnica. Projetos com pagamentos, agendamentos em tempo real, áreas de acesso, bancos de dados ou automações são planejados e orçados separadamente.",
  },
];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}

function ArrowDownRightIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 7h10v10M7 17 17 7" />
    </svg>
  );
}

function CarouselArrow({ direction }: { direction: "previous" | "next" }) {
  return (
    <svg className={direction === "previous" ? "is-previous" : ""} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}

function LeafMark({ small = false }: { small?: boolean }) {
  return (
    <span className={`leaf-mark${small ? " leaf-mark--small" : ""}`} aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [formStatus, setFormStatus] = useState<"idle" | "success" | "blocked">("idle");
  /* Guardado para o caso de a aba ser bloqueada: aí o link vira algo
     clicável na própria página, em vez de um beco sem saída. */
  const [whatsappLink, setWhatsappLink] = useState("");
  const [currentProject, setCurrentProject] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const scrollAnimationFrame = useRef<number | null>(null);

  useEffect(() => {
    const revealItems = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (!("IntersectionObserver" in window)) return;

    /* Só agora o CSS passa a esconder: até aqui a página está inteira na
       tela. Se este efeito nunca rodar, nada some. */
    document.body.classList.add("reveal-ready");

    let heardFromObserver = false;
    const observer = new IntersectionObserver(
      (entries) => {
        heardFromObserver = true;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.06, rootMargin: "0px 0px -16% 0px" },
    );

    revealItems.forEach((item) => observer.observe(item));

    /* Rede de segurança. Um observer saudável responde quase de imediato;
       silêncio significa que este ambiente não entrega esses eventos (aba
       que nunca pintou, motor sem suporte real). Nesse caso mostra tudo e
       desiste da animação. */
    const failsafe = window.setTimeout(() => {
      if (heardFromObserver) return;
      revealItems.forEach((item) => item.classList.add("is-visible"));
      observer.disconnect();
    }, 1000);

    return () => {
      window.clearTimeout(failsafe);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    return () => {
      if (scrollAnimationFrame.current !== null) {
        window.cancelAnimationFrame(scrollAnimationFrame.current);
      }
    };
  }, []);

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleNavClick(event: MouseEvent<HTMLAnchorElement>, targetId: string) {
    const target = document.querySelector<HTMLElement>(targetId);
    if (!target) return;

    event.preventDefault();
    closeMenu();

    const header = document.querySelector<HTMLElement>(".site-header");
    const headerOffset = header?.offsetHeight ?? 0;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - headerOffset;
    const startTop = window.scrollY;
    const distance = targetTop - startTop;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = prefersReducedMotion
      ? 300
      : Math.min(1000, Math.max(620, Math.abs(distance) * 0.17));
    const startTime = window.performance.now();

    if (scrollAnimationFrame.current !== null) {
      window.cancelAnimationFrame(scrollAnimationFrame.current);
    }

    window.history.pushState(null, "", targetId);

    const animateScroll = (currentTime: number) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easedProgress = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      window.scrollTo(0, startTop + distance * easedProgress);

      if (progress < 1) {
        scrollAnimationFrame.current = window.requestAnimationFrame(animateScroll);
      } else {
        scrollAnimationFrame.current = null;
      }
    };

    scrollAnimationFrame.current = window.requestAnimationFrame(animateScroll);
  }

  function showProject(index: number) {
    setCurrentProject((index + projects.length) % projects.length);
  }

  function handleProjectTouchStart(event: TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  }

  function handleProjectTouchEnd(event: TouchEvent<HTMLDivElement>) {
    if (touchStartX.current === null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const distance = endX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(distance) < 45) return;
    showProject(currentProject + (distance < 0 ? 1 : -1));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const texto = (campo: string) => String(data.get(campo) ?? "").trim();
    const message = [
      "Olá, Lucca! Vim pelo site da Varanda Estúdio Web.",
      "",
      `Meu nome: ${texto("name")}`,
      `Negócio: ${texto("business")}`,
      `E-mail: ${texto("email")}`,
      `WhatsApp: ${texto("phone")}`,
      `Tipo de site: ${texto("siteType")}`,
      "",
      "Sobre o projeto:",
      texto("summary"),
    ].join("\n");

    const link = `${whatsappUrl}?text=${encodeURIComponent(message)}`;
    setWhatsappLink(link);

    /* `window.open` devolve `null` quando o navegador bloqueia a aba — é
       assim que se detecta o bloqueio. Antes o estado ia para "success" de
       qualquer jeito: quem tinha bloqueador via "mensagem preparada" e nada
       acontecia, sem nada para clicar.

       O `noopener` **não** pode ir na string de opções: com ele a chamada
       devolve `null` mesmo quando a aba abre, por especificação, e todo
       envio bem-sucedido seria reportado como bloqueado. Cortar o `opener`
       na mão dá o mesmo isolamento e ainda deixa a referência para testar. */
    const aba = window.open(link, "_blank");
    if (aba) aba.opener = null;
    setFormStatus(aba ? "success" : "blocked");
  }

  return (
    <>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>

      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="Varanda Estúdio Web — início" onClick={(event) => handleNavClick(event, "#inicio")}>
          <LeafMark small />
          <span>
            <strong>Varanda</strong>
            <small>Estúdio Web</small>
          </span>
        </a>

        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
          aria-controls="menu-principal"
          onClick={() => setMenuOpen((value) => !value)}
        >
          <span />
          <span />
        </button>

        <nav id="menu-principal" className={menuOpen ? "nav is-open" : "nav"} aria-label="Navegação principal">
          <a href="#servicos" onClick={(event) => handleNavClick(event, "#servicos")}>Serviços</a>
          <a href="#portfolio" onClick={(event) => handleNavClick(event, "#portfolio")}>Portfólio</a>
          <a href="#processo" onClick={(event) => handleNavClick(event, "#processo")}>Processo</a>
          <a href="#investimento" onClick={(event) => handleNavClick(event, "#investimento")}>Investimento</a>
          <a href="#sobre" onClick={(event) => handleNavClick(event, "#sobre")}>Sobre</a>
          <a className="nav-cta" href="#contato" onClick={(event) => handleNavClick(event, "#contato")}>
            Vamos conversar
          </a>
        </nav>
      </header>

      <main id="conteudo" tabIndex={-1}>
        <section className="hero" id="inicio">
          <div className="hero-copy" data-reveal>
            <p className="kicker"><span /> Sites para negócios brasileiros</p>
            <h1>Sites que dão <em>espaço</em> para o seu negócio crescer.</h1>
            <p className="hero-lead">
              Conteúdo claro, visual profissional e tecnologia sem complicação para transformar boas ideias em uma presença digital confiável.
            </p>
            <div className="hero-actions">
              <a className="button button--primary" href="#contato" onClick={(event) => handleNavClick(event, "#contato")}>
                Conte sobre seu projeto <ArrowIcon />
              </a>
              <a className="text-link" href="#portfolio" onClick={(event) => handleNavClick(event, "#portfolio")}>Ver projeto <ArrowDownRightIcon /></a>
            </div>
            <div className="hero-footnote">
              <span>São Paulo</span>
              <span>Atendimento remoto em todo o Brasil</span>
            </div>
          </div>

          <div className="hero-art" role="img" aria-label="Composição visual de um site sendo desenvolvido" data-reveal>
            <div className="hero-sun" />
            <div className="hero-arch">
              <div className="browser-card">
                <div className="browser-top"><i /><i /><i /><span>seunegocio.com.br</span></div>
                <div className="browser-body">
                  <div className="browser-brand">seu negócio</div>
                  <div className="browser-title">Presença para ser<br />lembrado.</div>
                  <div className="browser-lines"><i /><i /></div>
                  <div className="browser-button">conheça mais</div>
                </div>
              </div>
            </div>
            <div className="floating-note floating-note--top">clareza<br /><strong>antes de tudo</strong></div>
            <div className="floating-note floating-note--bottom"><small>feito com</small><strong>intenção.</strong></div>
            <div className="botanical botanical--one"><i /><i /><i /><i /><i /></div>
            <div className="botanical botanical--two"><i /><i /><i /><i /></div>
          </div>
        </section>

        <section className="intro section" aria-labelledby="intro-title">
          <div className="section-index">01 — Nosso olhar</div>
          <div className="intro-content" data-reveal>
            <p className="eyebrow">Um site não precisa parecer complicado</p>
            <h2 id="intro-title">Ele precisa fazer sentido para quem chega e para quem cuida do negócio.</h2>
            <div className="intro-columns">
              <p>
                A Varanda aproxima negócios do digital com comunicação clara, processo transparente e decisões pensadas para a realidade de cada cliente.
              </p>
              <p>
                Cada projeto reúne estratégia, conteúdo e desenvolvimento para entregar um site bonito, útil e fácil de navegar.
              </p>
            </div>
          </div>
          <LeafMark />
        </section>

        <section className="services section" id="servicos" aria-labelledby="services-title">
          <div className="section-heading" data-reveal>
            <div>
              <div className="section-index section-index--light">02 — O que fazemos</div>
              <h2 id="services-title">O formato certo<br />para o seu momento.</h2>
            </div>
            <p>Projetos objetivos para apresentar seu trabalho, explicar seus diferenciais e facilitar o contato com novos clientes.</p>
          </div>
          <div className="service-grid">
            {services.map((service) => (
              <article className="service-card" key={service.number} data-reveal>
                <span>{service.number}</span>
                <div className="service-icon" aria-hidden="true"><i /><i /></div>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
              </article>
            ))}
          </div>
          <p className="service-note">
            Precisa de loja virtual, agendamento, área de acesso ou automação? <a href="#contato" onClick={(event) => handleNavClick(event, "#contato")}>Vamos avaliar juntos.</a>
          </p>
        </section>

        <section className="portfolio section" id="portfolio" aria-labelledby="portfolio-title">
          <div className="portfolio-intro" data-reveal>
            <div className="section-index">03 — Trabalhos desenvolvidos</div>
            <h2 id="portfolio-title">Ideias ganhando<br /><em>forma e presença.</em></h2>
          </div>

          <div
            className="project-carousel"
            role="region"
            aria-roledescription="carrossel"
            aria-label="Trabalhos desenvolvidos pela Varanda"
            data-reveal
          >
            <div
              className="project-track"
              style={{ transform: `translateX(-${currentProject * 100}%)` }}
              onTouchStart={handleProjectTouchStart}
              onTouchEnd={handleProjectTouchEnd}
            >
              {projects.map((project, index) => (
                <div
                  className="project-slide"
                  key={project.name}
                  aria-hidden={currentProject !== index}
                >
                  <article className="project">
                    {project.url ? (
                      <a
                        className="project-visual"
                        href={project.url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Abrir demonstração do projeto ${project.name} em uma nova aba`}
                        tabIndex={currentProject === index ? 0 : -1}
                      >
                        {/* This portfolio image is below the fold and intentionally uses native lazy loading. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={project.image}
                          alt={project.imageAlt}
                          width={1584}
                          height={990}
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="project-browser" aria-hidden="true">
                          <span /><span /><span />
                        </div>
                      </a>
                    ) : (
                      <div className={`project-visual project-visual--placeholder project-visual--placeholder-${index + 1}`} role="img" aria-label="Espaço reservado para um próximo projeto">
                        <div className="project-browser" aria-hidden="true">
                          <span /><span /><span />
                        </div>
                        <div className="project-placeholder-content" aria-hidden="true">
                          <span>{String(index + 1).padStart(2, "0")}</span>
                          <strong>novo projeto</strong>
                          <i />
                        </div>
                        <div className="project-stamp project-stamp--soon">em breve</div>
                      </div>
                    )}
                    <div className="project-info">
                      <p className="project-label">{project.label}</p>
                      <h3>{project.name}</h3>
                      <p>{project.description}</p>
                      <ul aria-label={project.placeholder ? "Características previstas" : "Entregas do projeto"}>
                        {project.features.map((feature) => <li key={feature}>{feature}</li>)}
                      </ul>
                      {!project.url && (
                        <span className="project-soon">Novos trabalhos serão adicionados aqui.</span>
                      )}
                    </div>
                  </article>
                </div>
              ))}
            </div>

            <div className="carousel-footer">
              <p className="carousel-status" aria-live="polite">
                <strong>{String(currentProject + 1).padStart(2, "0")}</strong>
                <span>/ {String(projects.length).padStart(2, "0")}</span>
                <span className="sr-only">Projeto {currentProject + 1} de {projects.length}: {projects[currentProject].name}</span>
              </p>
              <div className="carousel-dots" aria-label="Escolher projeto">
                {projects.map((project, index) => (
                  <button
                    type="button"
                    key={project.name}
                    className={currentProject === index ? "is-active" : ""}
                    aria-label={`Mostrar ${project.name}`}
                    aria-current={currentProject === index ? "true" : undefined}
                    onClick={() => showProject(index)}
                  />
                ))}
              </div>
              <div className="carousel-buttons">
                <button type="button" aria-label="Projeto anterior" onClick={() => showProject(currentProject - 1)}>
                  <CarouselArrow direction="previous" />
                </button>
                <button type="button" aria-label="Próximo projeto" onClick={() => showProject(currentProject + 1)}>
                  <CarouselArrow direction="next" />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="process section" id="processo" aria-labelledby="process-title">
          <div className="process-heading" data-reveal>
            <div className="section-index">04 — Como acontece</div>
            <h2 id="process-title">Um caminho claro,<br />do primeiro “oi”<br />até a publicação.</h2>
            <p>Você acompanha as decisões, aprova cada etapa e sabe o que esperar até a publicação.</p>
          </div>
          <div className="process-list">
            {process.map((item) => (
              <article key={item.step} data-reveal>
                <span>{item.step}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="pricing section" id="investimento" aria-labelledby="pricing-title">
          <div className="pricing-heading" data-reveal>
            <div>
              <div className="section-index">05 — Investimento</div>
              <h2 id="pricing-title">Comece com o que<br />seu negócio precisa hoje.</h2>
            </div>
            <p>
              Condições de lançamento para os primeiros cinco projetos contratados.
            </p>
          </div>

          <div className="pricing-grid">
            {packages.map((item) => (
              <article className={`price-card${item.featured ? " is-featured" : ""}`} key={item.name} data-reveal>
                <p className="price-eyebrow">{item.eyebrow}</p>
                <h3>{item.name}</h3>
                <p className="price-description">{item.description}</p>
                <div className="price">
                  <small>R$</small><strong>{item.launch}</strong><span>por projeto</span>
                </div>
                <p className="future-price">valor regular: R$ {item.future}</p>
                <a className={`button ${item.featured ? "button--cream" : "button--outline"}`} href="#contato" onClick={(event) => handleNavClick(event, "#contato")}>
                  Quero este plano <ArrowIcon />
                </a>
                <ul>
                  {item.items.map((feature) => <li key={feature}>{feature}</li>)}
                </ul>
              </article>
            ))}
          </div>
          <p className="launch-note">
            A condição de lançamento vale para os cinco primeiros contratos com proposta aceita, contrato assinado e entrada confirmada. Qualquer necessidade fora do pacote é informada e orçada antes do início.
          </p>
        </section>

        <section className="care section" aria-labelledby="care-title">
          <div className="care-heading" data-reveal>
            <div className="section-index section-index--light">06 — Depois da publicação</div>
            <h2 id="care-title">Seu site pode continuar<br /><em>bem cuidado.</em></h2>
            <p>Planos opcionais para atualizar textos e imagens, corrigir pequenos problemas e acompanhar o funcionamento do site.</p>
          </div>

          <div className="care-grid">
            {maintenance.map((item) => (
              <article key={item.name} data-reveal>
                <h3>{item.name}</h3>
                <div className="care-price"><small>R$</small><strong>{item.price}</strong><span>/mês</span></div>
                <p>{item.time}</p>
                <p>{item.response}</p>
              </article>
            ))}
          </div>
          <div className="care-notes" data-reveal>
            <p>O tempo mensal não é acumulativo. O pagamento é antecipado e o cancelamento requer aviso prévio de 30 dias.</p>
            <p>Para demandas pontuais, a manutenção avulsa custa R$ 80 por até 30 minutos. Acima desse período, o valor é de R$ 150 por hora, calculado em blocos de 30 minutos.</p>
          </div>
        </section>

        <section className="about section" id="sobre" aria-labelledby="about-title">
          <div className="about-art" aria-hidden="true" data-reveal>
            <div className="about-sun" />
            <div className="about-arch"><span>V</span></div>
            <div className="about-leaves"><i /><i /><i /><i /><i /><i /></div>
          </div>
          <div className="about-copy" data-reveal>
            <div className="section-index">07 — Quem está na Varanda</div>
            <p className="eyebrow">Olá, eu sou o Lucca.</p>
            <h2 id="about-title">Tecnologia boa é a que aproxima, não a que complica.</h2>
            <p>
              A Varanda Estúdio Web nasceu para ajudar comércios, profissionais e empresas a construírem uma presença digital clara, profissional e confiável.
            </p>
            <p>
              Eu acompanho cada projeto de perto, desde a organização das ideias até o desenvolvimento, com conversa franca, processo documentado e atenção aos detalhes.
            </p>
            <div className="signature">Lucca Oliveira <span>— São Paulo, SP</span></div>
          </div>
        </section>

        <section className="extras section" aria-labelledby="extras-title">
          <div className="extras-heading" data-reveal>
            <div className="extras-heading-main">
              <div className="section-index">08 — Sob medida</div>
              <h2 id="extras-title">O que mais o seu projeto pode precisar?</h2>
            </div>
            <p>Estes serviços podem ser adicionados quando não estiverem incluídos no pacote escolhido.</p>
          </div>
          <div className="extras-list" data-reveal>
            <div><span>Nova página</span><strong>R$ 220</strong></div>
            <div><span>Redação completa</span><strong>R$ 120/página</strong></div>
            <div><span>Configuração de domínio e hospedagem</span><strong>R$ 150</strong></div>
            <div><span>Integração padrão</span><strong>a partir de R$ 220</strong></div>
            <div><span>Blog ou CMS</span><strong>a partir de R$ 490</strong></div>
            <div><span>Idioma adicional</span><strong>a partir de R$ 350</strong></div>
            <div><span>Rodada adicional de ajustes</span><strong>R$ 150</strong></div>
          </div>
          <p className="extras-note">Os valores acima não incluem custos cobrados por domínio, hospedagem ou ferramentas externas. Demandas urgentes estão sujeitas à disponibilidade e podem ter adicional de 30%.</p>
        </section>

        <section className="faq section" aria-labelledby="faq-title">
          <div className="faq-heading" data-reveal>
            <div className="section-index">09 — Dúvidas frequentes</div>
            <h2 id="faq-title">Antes de começar,<br />vale saber.</h2>
          </div>
          <div className="faq-list">
            {faqs.map((item, index) => (
              <details key={item.question} data-reveal>
                <summary><span>{String(index + 1).padStart(2, "0")}</span>{item.question}<i aria-hidden="true" /></summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="contact section" id="contato" aria-labelledby="contact-title">
          <div className="contact-copy" data-reveal>
            <div className="section-index section-index--light">10 — Vamos conversar</div>
            <h2 id="contact-title">Seu negócio merece<br />um lugar para <em>crescer.</em></h2>
            <p>
              Conte o que seu negócio precisa e em que momento ele está. Vou analisar as informações e responder com a orientação para o próximo passo.
            </p>
            <div className="contact-direct">
              <a
                href={`${whatsappUrl}?text=${encodeURIComponent("Olá, Lucca! Vim pelo site da Varanda Estúdio Web e gostaria de conversar sobre um projeto.")}`}
                target="_blank"
                rel="noreferrer"
                aria-label="Falar com a Varanda pelo WhatsApp em uma nova aba"
              >
                <span>WhatsApp</span>
                <strong>+55 11 94226-3007</strong>
              </a>
              <a href="mailto:luccaassoc@gmail.com">
                <span>E-mail</span>
                <strong>luccaassoc@gmail.com</strong>
              </a>
            </div>
          </div>

          <form className="contact-form" onSubmit={handleSubmit} data-reveal>
            <div className="field-row">
              <label>
                Seu nome *
                <input name="name" type="text" autoComplete="name" required placeholder="Como você prefere ser chamado?" />
              </label>
              <label>
                Nome do negócio *
                <input name="business" type="text" autoComplete="organization" required placeholder="Nome da empresa ou do projeto" />
              </label>
            </div>
            <div className="field-row">
              <label>
                E-mail *
                <input name="email" type="email" autoComplete="email" required placeholder="voce@exemplo.com" />
              </label>
              <label>
                WhatsApp *
                <input name="phone" type="tel" autoComplete="tel" required placeholder="(11) 99999-9999" />
              </label>
            </div>
            <label>
              Que tipo de site você procura? *
              <select name="siteType" required defaultValue="">
                <option value="" disabled>Selecione uma opção</option>
                <option>Site institucional</option>
                <option>Landing page</option>
                <option>Página profissional ou portfólio</option>
                <option>Loja virtual ou projeto especial</option>
                <option>Ainda não sei</option>
              </select>
            </label>
            <label>
              Conte sobre o projeto *
              <textarea name="summary" required rows={5} placeholder="Conte o que seu negócio faz, o que o site precisa apresentar e qual resultado você espera." />
            </label>
            <label className="consent">
              <input name="consent" type="checkbox" required />
              <span>Concordo com o uso destes dados para receber retorno sobre meu projeto, conforme a <a href="/privacidade">Política de Privacidade</a>.</span>
            </label>
            <button className="button button--terracotta" type="submit">
              Continuar no WhatsApp <ArrowIcon />
            </button>
            <p className="form-hint">Ao continuar, o WhatsApp abrirá uma mensagem com as informações preenchidas. Nada é armazenado em um banco de dados deste site.</p>
            {formStatus === "success" && (
              <p className="form-success" role="status">
                Mensagem preparada e aberta no WhatsApp. Confira e toque em enviar
                para que ela chegue até mim.
              </p>
            )}
            {formStatus === "blocked" && (
              <p className="form-success" role="status">
                O navegador bloqueou a nova aba.{" "}
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  Abrir a mensagem no WhatsApp
                </a>{" "}
                — os dados já preenchidos vão junto.
              </p>
            )}
          </form>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-top">
          <a className="brand brand--footer" href="#inicio" aria-label="Varanda Estúdio Web — voltar ao início" onClick={(event) => handleNavClick(event, "#inicio")}>
            <LeafMark small />
            <span><strong>Varanda</strong><small>Estúdio Web</small></span>
          </a>
          <p>Sites brasileiros, próximos e bem pensados.</p>
          <a className="back-top" href="#inicio" onClick={(event) => handleNavClick(event, "#inicio")}>Voltar ao topo ↑</a>
        </div>
        <div className="footer-bottom">
          <span className="footer-location">São Paulo · Atendimento em todo o Brasil</span>
          <a href="/privacidade">Privacidade</a>
          <span className="footer-copyright">© 2026 Varanda Estúdio Web · Lucca Oliveira</span>
        </div>
      </footer>
    </>
  );
}
