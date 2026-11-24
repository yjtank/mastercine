(function () {
  // Página inicial MasterCine
  const TMDB_API = "https://api.themoviedb.org/3";
  const TMDB_IMG = "https://image.tmdb.org/t/p/";
  const PLACEHOLDER =
    "https://placehold.co/300x450/202020/ffc107?text=Sem+poster";
  const API_KEY_STORAGE = "mastercine_tmdb_api_key";
  let apiKey = localStorage.getItem(API_KEY_STORAGE) || "";
  let slidesAtuais = [];
  let slideAtual = 0;
  let timerSlider;
  let buscaTimer;

  const secoes = [
    {
      id: "filmes-populares",
      titulo: "Filmes populares",
      tipo: "movie",
      endpoint: "/movie/popular",
    },
    {
      id: "series-populares",
      titulo: "Séries populares",
      tipo: "tv",
      endpoint: "/tv/popular",
    },
    {
      id: "terror",
      titulo: "Terror",
      tipo: "movie",
      endpoint: "/discover/movie",
      params: { with_genres: 27, sort_by: "popularity.desc" },
    },
    {
      id: "acao",
      titulo: "Ação e aventura",
      tipo: "movie",
      endpoint: "/discover/movie",
      params: { with_genres: "28,12", sort_by: "popularity.desc" },
    },
    {
      id: "animacao",
      titulo: "Animação",
      tipo: "movie",
      endpoint: "/discover/movie",
      params: { with_genres: 16, sort_by: "popularity.desc" },
    },
    {
      id: "ficcao",
      titulo: "Ficção científica",
      tipo: "movie",
      endpoint: "/discover/movie",
      params: { with_genres: 878, sort_by: "popularity.desc" },
    },
    {
      id: "lancamentos",
      titulo: "Lançamentos",
      tipo: "movie",
      endpoint: "/movie/now_playing",
    },
  ];

  function escapeHTML(valor = "") {
    return String(valor).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;",
        })[c],
    );
  }

  // Consulta a API do TMDB usando a chave armazenada no navegador e idioma português.
  async function tmdb(path, params = {}) {
    if (!apiKey) throw new Error("Configure sua chave da API do TMDB.");
    const url = new URL(TMDB_API + path);
    Object.entries({ api_key: apiKey, language: "pt-BR", ...params }).forEach(
      ([k, v]) => url.searchParams.set(k, v),
    );
    const response = await fetch(url);
    if (!response.ok) {
      let msg = "Erro ao consultar TMDB (" + response.status + ").";
      try {
        msg = (await response.json()).status_message || msg;
      } catch {}
      throw new Error(msg);
    }
    return response.json();
  }

  // BEM: catalogo-card é o bloco; poster, dados, textos, título, ano e avaliação são seus elementos.
  function criarCard(item, tipo) {
    const titulo = item.title || item.name || "Sem título";
    const ano =
      (item.release_date || item.first_air_date || "").slice(0, 4) || "—";
    const poster = item.poster_path
      ? TMDB_IMG + "w342" + item.poster_path
      : PLACEHOLDER;
    const classe = tipo === "tv" ? "serie" : "filme";
    return `<article class="${classe} card catalogo-card catalogo-card--${tipo}" tabindex="0" role="button" data-titulo="${escapeHTML(titulo)}" data-tipo="${tipo}" data-id="${item.id}">
    <div class="poster-wrap card__imagem catalogo-card__poster"><img src="${poster}" alt="Pôster de ${escapeHTML(titulo)}" loading="lazy" onerror="this.src='${PLACEHOLDER}'"></div>
    <div class="card-textos card__conteudo catalogo-card__textos"><div class="titulo-filme card__titulo catalogo-card__titulo" title="${escapeHTML(titulo)}">${escapeHTML(titulo)}</div></div>
    <div class="card-dados card__dados catalogo-card__dados"><span class="ano-lancamento card__ano catalogo-card__ano">${ano}</span>
      <span class="avaliacao card__avaliacao catalogo-card__avaliacao"><i class="fa-solid fa-star"></i> ${Number(item.vote_average || 0).toFixed(1)}</span>
    </div>
  </article>`;
  }

  function ativarCards(raiz = document) {
    raiz.querySelectorAll(".filme,.serie").forEach((card) => {
      if (card.dataset.evento) return;
      card.dataset.evento = "1";
      const abrir = () => {
        if (!card.dataset.id) return;
        window.location.href = `detalhes.html?id=${encodeURIComponent(card.dataset.id)}&type=${encodeURIComponent(card.dataset.tipo || "movie")}`;
      };
      card.addEventListener("click", abrir);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          abrir();
        }
      });
    });
  }

  function renderizarSecao(secao, resultados) {
    const container = document.getElementById(secao.id);
    const tipo = secao.tipo;
    const itens = (resultados || []).filter((item) => item.poster_path);
    container.innerHTML = itens.length
      ? itens.map((item) => criarCard(item, tipo)).join("")
      : '<p class="estado">Nenhum título encontrado.</p>';
    ativarCards(container);
  }

  function criarSecoes() {
    const main = document.querySelector(".main");
    const secaoSlider = document.querySelector(".sessao-slides");
    document
      .querySelectorAll(".sessao-filmes,.sessao-series")
      .forEach((el) => el.remove());
    let ancora = secaoSlider;
    secoes.forEach((secao) => {
      const section = document.createElement("section");
      section.className =
        secao.tipo === "tv" ? "sessao-series" : "sessao-filmes";
      section.innerHTML = `<h2 class="titulo-sessao">${secao.titulo}</h2><div class="${secao.tipo === "tv" ? "series-container" : "filmes-container"}" id="${secao.id}"><p class="estado">Carregando catálogo...</p></div>`;
      ancora.insertAdjacentElement("afterend", section);
      ancora = section;
    });
  }

  function montarSlider(items) {
    slidesAtuais = items.filter((item) => item.backdrop_path).slice(0, 5);
    const container = document.querySelector(".slides-container");
    container.querySelectorAll(".slide-controles").forEach((el) => el.remove());
    const barra = document.querySelector(".barra-progresso");
    container.querySelectorAll(".slide").forEach((el) => el.remove());
    slidesAtuais.forEach((item, index) => {
      const slide = document.createElement("article");
      slide.className = "slide";
      slide.style.backgroundImage = `url('${TMDB_IMG}original${item.backdrop_path}')`;
      const titulo = item.title || item.name || "Em destaque";
      const ano = (item.release_date || item.first_air_date || "").slice(0, 4);
      const tipo = item.media_type === "tv" ? "Série" : "Filme";
      slide.innerHTML = `<div class="slide-conteudo">
      <span class="slide-selo"><i class="fa-solid fa-play"></i> Em destaque</span>
      <h1 class="slide-titulo">${escapeHTML(titulo)}</h1>
      <div class="slide-info"><span class="slide-nota"><i class="fa-solid fa-star"></i> ${Number(item.vote_average || 0).toFixed(1)}/10</span><span>${ano}</span><span>${tipo}</span></div>
      <p class="slide-descricao">${escapeHTML(item.overview || "Descubra mais sobre este título no catálogo MasterCine.")}</p>
      <div class="slide-acoes"><button class="slide-botao" type="button" data-id="${item.id}" data-tipo="${item.media_type === "tv" ? "tv" : "movie"}"><i class="fa-solid fa-eye"></i> Visualizar</button></div>
    </div>`;
      container.insertBefore(
        slide,
        container.querySelector(".barra-progresso"),
      );
      slide.querySelector("[data-id]").addEventListener("click", () => {
        window.location.href = `detalhes.html?id=${encodeURIComponent(item.id)}&type=${encodeURIComponent(item.media_type === "tv" ? "tv" : "movie")}`;
      });
    });
    const controles = document.createElement("div");
    controles.className = "slide-controles";
    controles.innerHTML =
      '<button class="slide-seta" id="slide-anterior" aria-label="Slide anterior"><i class="fa-solid fa-chevron-left"></i></button><div class="indicadores"></div><button class="slide-seta" id="slide-proximo" aria-label="Próximo slide"><i class="fa-solid fa-chevron-right"></i></button>';
    container.appendChild(controles);
    let progress = container.querySelector(".barra-progresso");
    if (!progress) {
      progress = document.createElement("div");
      progress.className = "barra-progresso";
      container.appendChild(progress);
    }
    const dots = controles.querySelector(".indicadores");
    dots.innerHTML = slidesAtuais
      .map(
        (_, i) =>
          `<button class="indicador ${i === 0 ? "ativo" : ""}" data-slide="${i}" aria-label="Ir para destaque ${i + 1}"></button>`,
      )
      .join("");
    dots.querySelectorAll("button").forEach((btn) =>
      btn.addEventListener("click", () => {
        mostrarSlide(Number(btn.dataset.slide));
        iniciarSlider();
      }),
    );
    document.getElementById("slide-anterior").addEventListener("click", () => {
      mostrarSlide(slideAtual - 1);
      iniciarSlider();
    });
    document.getElementById("slide-proximo").addEventListener("click", () => {
      mostrarSlide(slideAtual + 1);
      iniciarSlider();
    });
    mostrarSlide(0);
    iniciarSlider();
  }

  function mostrarSlide(index) {
    if (!slidesAtuais.length) return;
    slideAtual = (index + slidesAtuais.length) % slidesAtuais.length;
    document
      .querySelectorAll(".slides-container .slide")
      .forEach((slide, i) => slide.classList.toggle("ativo", i === slideAtual));
    document
      .querySelectorAll(".slide-controles .indicador")
      .forEach((dot, i) => dot.classList.toggle("ativo", i === slideAtual));
    const barra = document.querySelector(".barra-progresso");
    barra.classList.remove("animando");
    void barra.offsetWidth;
    barra.classList.add("animando");
  }

  function iniciarSlider() {
    clearInterval(timerSlider);
    timerSlider = setInterval(() => mostrarSlide(slideAtual + 1), 6000);
  }

  async function carregarCatalogo() {
    if (!apiKey) {
      document
        .querySelectorAll(".estado")
        .forEach(
          (el) =>
            (el.textContent =
              "Configure sua chave do TMDB para carregar os títulos."),
        );
      return;
    }
    try {
      const [destaques, ...listas] = await Promise.all([
        tmdb("/trending/all/week"),
        ...secoes.map((secao) => tmdb(secao.endpoint, secao.params || {})),
      ]);
      montarSlider(destaques.results || []);
      secoes.forEach((secao, i) => renderizarSecao(secao, listas[i].results));
    } catch (error) {
      document
        .querySelectorAll(".estado")
        .forEach((el) => (el.textContent = error.message));
      console.error(error);
    }
  }

  async function pesquisar() {
    const query = document.getElementById("search-input").value.trim();
    const results = document.getElementById("search-results");
    if (query.length < 2) {
      results.classList.remove("ativo");
      results.innerHTML = "";
      return;
    }
    results.classList.add("ativo");
    results.innerHTML = '<p class="estado">Buscando filmes e séries...</p>';
    try {
      const data = await tmdb("/search/multi", { query, include_adult: false });
      const itens = (data.results || []).filter(
        (item) =>
          item.media_type !== "person" &&
          (item.poster_path || item.backdrop_path),
      );
      results.innerHTML = itens.length
        ? '<h2 class="titulo-sessao">Resultados da pesquisa</h2><div class="resultados-lista">' +
          itens
            .map((item) => {
              const titulo = item.title || item.name || "Sem título";
              const ano =
                (item.release_date || item.first_air_date || "").slice(0, 4) ||
                "—";
              const poster = item.poster_path
                ? TMDB_IMG + "w185" + item.poster_path
                : PLACEHOLDER;
              const tipo = item.media_type === "tv" ? "tv" : "movie";
              return `<button class="resultado-item" type="button" data-id="${item.id}" data-tipo="${tipo}">
        <img src="${poster}" alt="" loading="lazy">
        <span class="resultado-texto"><strong>${escapeHTML(titulo)}</strong><small>${tipo === "tv" ? "Série" : "Filme"} · ${ano}</small></span>
        <span class="resultado-nota"><i class="fa-solid fa-star"></i> ${Number(item.vote_average || 0).toFixed(1)}</span>
      </button>`;
            })
            .join("") +
          "</div>"
        : '<p class="estado">Nenhum resultado encontrado.</p>';
      results.querySelectorAll(".resultado-item").forEach((item) =>
        item.addEventListener("click", () => {
          window.location.href = `detalhes.html?id=${encodeURIComponent(item.dataset.id)}&type=${encodeURIComponent(item.dataset.tipo)}`;
        }),
      );
    } catch (error) {
      results.innerHTML =
        '<p class="estado">' + escapeHTML(error.message) + "</p>";
    }
  }

  function configurarBusca() {
    const icon = document.getElementById("search-icon"),
      bar = document.getElementById("search-bar");
    const results = document.getElementById("search-results"),
      input = document.getElementById("search-input");
    const backdrop = document.getElementById("search-backdrop");
    const fechar = () => {
      bar.classList.remove("aberto");
      results.classList.remove("ativo");
      backdrop.classList.remove("ativo");
      document.body.classList.remove("search-aberto");
      icon.setAttribute("aria-expanded", "false");
    };
    icon.addEventListener("click", (event) => {
      event.preventDefault();
      if (bar.classList.contains("aberto")) {
        fechar();
        return;
      }
      bar.classList.add("aberto");
      backdrop.classList.add("ativo");
      document.body.classList.add("search-aberto");
      icon.setAttribute("aria-expanded", "true");
      setTimeout(() => input.focus(), 180);
    });
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        const query = input.value.trim();
        if (query.length >= 2)
          window.location.href = `pesquisa.html?q=${encodeURIComponent(query)}`;
      }
    });
    backdrop.addEventListener("click", fechar);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") fechar();
    });
  }

  function configurarApi() {
    if (!apiKey) {
      const chave = prompt(
        "Insira sua API Key v3 do TMDB para carregar o catálogo:",
      );
      if (chave && chave.trim()) {
        apiKey = chave.trim();
        localStorage.setItem(API_KEY_STORAGE, apiKey);
      }
    }
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    if (document.querySelector(".sessao-slides")) {
      criarSecoes();
      configurarApi();
      carregarCatalogo();
    }
    if (document.getElementById("search-icon")) configurarBusca();
  });
})();
