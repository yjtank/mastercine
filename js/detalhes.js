const API = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/";
const PLACEHOLDER = "https://placehold.co/300x450/202020/ffc107?text=Sem+foto";
const STORAGE_KEY = "mastercine_tmdb_api_key";
const FAVORITOS_KEY = "mastercine_favoritos";

// Configuração centralizada da API de Streaming / Player Embed
const PLAYER_API = {
  filme: (tmdbId) => `https://myembed.biz/filme/${tmdbId}`,
  serie: (tmdbId, season, episode) => `https://myembed.biz/serie/${tmdbId}/${season}/${episode}`,
};

let mediaAtual = {
  id: null,
  type: "movie",
  title: "",
  temporadaAtual: 1,
  primeiroEpisodio: 1,
};

function abrirPlayer(url, titulo, subtitulo = "Reproduzindo") {
  const modal = document.getElementById("player-modal");
  const iframe = document.getElementById("player-iframe");
  const modalTitulo = document.getElementById("player-modal-titulo");
  const modalSubtitulo = document.getElementById("player-modal-subtitulo");
  if (!modal || !iframe) return;

  if (modalTitulo) modalTitulo.textContent = titulo;
  if (modalSubtitulo) modalSubtitulo.textContent = subtitulo;
  iframe.src = url;
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function fecharPlayer() {
  const modal = document.getElementById("player-modal");
  const iframe = document.getElementById("player-iframe");
  if (iframe) iframe.src = "";
  if (modal) modal.classList.add("hidden");
  document.body.style.overflow = "";
}

function configurarModalPlayer() {
  const fecharBtn = document.getElementById("player-modal-fechar");
  const backdrop = document.getElementById("player-modal-backdrop");
  if (fecharBtn) fecharBtn.addEventListener("click", fecharPlayer);
  if (backdrop) backdrop.addEventListener("click", fecharPlayer);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const modal = document.getElementById("player-modal");
      if (modal && !modal.classList.contains("hidden")) fecharPlayer();
    }
  });
}

function configurarBotaoAssistir() {
  const btn = document.getElementById("detalhe-assistir-btn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    if (mediaAtual.type === "movie") {
      const url = PLAYER_API.filme(mediaAtual.id);
      abrirPlayer(url, mediaAtual.title, "Filme Completo");
    } else {
      const season = mediaAtual.temporadaAtual || 1;
      const episode = mediaAtual.primeiroEpisodio || 1;
      const url = PLAYER_API.serie(mediaAtual.id, season, episode);
      abrirPlayer(
        url,
        `${mediaAtual.title} — T${season}:E${episode}`,
        `Temporada ${season} · Episódio ${episode}`,
      );
    }
  });
}

function obterFavoritos() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITOS_KEY) || "[]");
  } catch {
    return [];
  }
}

function atualizarBotaoFavorito(item, type) {
  const button = document.getElementById("detalhe-favorito");
  if (!button) return;
  const favorito = {
    id: String(item.id),
    type,
    title: item.title || item.name || "Sem título",
    poster: item.poster_path ? IMG + "w500" + item.poster_path : PLACEHOLDER,
    year: (item.release_date || item.first_air_date || "").slice(0, 4),
    vote_average: item.vote_average || 0,
  };
  const atualizar = () => {
    const ativo = obterFavoritos().some(
      (entry) => String(entry.id) === favorito.id && entry.type === type,
    );
    button.setAttribute("aria-pressed", String(ativo));
    button.classList.toggle("detalhe-btn--favorito-ativo", ativo);
    button.innerHTML = ativo
      ? '<i class="fa-solid fa-heart"></i> Remover dos favoritos'
      : '<i class="fa-regular fa-heart"></i> Adicionar aos favoritos';
  };
  button.addEventListener("click", () => {
    let items = obterFavoritos();
    const existe = items.some(
      (entry) => String(entry.id) === favorito.id && entry.type === type,
    );
    items = existe
      ? items.filter(
          (entry) => !(String(entry.id) === favorito.id && entry.type === type),
        )
      : [favorito, ...items];
    localStorage.setItem(FAVORITOS_KEY, JSON.stringify(items));
    atualizar();
  });
  atualizar();
}

let apiKey = localStorage.getItem(STORAGE_KEY) || "";

function escapeHTML(value = "") {
  return String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[char],
  );
}

// Integração com a API do TMDB
async function requisicaoTMDB(path, params = {}) {
  if (!apiKey) {
    apiKey = (prompt("Insira sua API Key v3 do TMDB:") || "").trim();
    if (apiKey) localStorage.setItem(STORAGE_KEY, apiKey);
  }
  if (!apiKey)
    throw new Error(
      "É necessário configurar a chave da API do TMDB na página inicial.",
    );
  const url = new URL(API + path);
  Object.entries({ api_key: apiKey, language: "pt-BR", ...params }).forEach(
    ([key, value]) => url.searchParams.set(key, value),
  );
  const response = await fetch(url);
  if (!response.ok) {
    let message = "Não foi possível carregar os detalhes.";
    try {
      message = (await response.json()).status_message || message;
    } catch {}
    throw new Error(message);
  }
  return response.json();
}
function dataBR(value) {
  if (!value) return "Não informado";
  const date = new Date(value + "T12:00:00");
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("pt-BR");
}

function criarCardRecomendacao(item, type) {
  const title = item.title || item.name || "Sem título";
  const year =
    (item.release_date || item.first_air_date || "").slice(0, 4) || "—";
  const poster = item.poster_path
    ? IMG + "w342" + item.poster_path
    : PLACEHOLDER;
  return `<article class="${type === "tv" ? "serie" : "filme"} catalogo-card catalogo-card--recomendacao" role="button" tabindex="0" data-id="${item.id}" data-type="${type}">
    <div class="poster-wrap catalogo-card__poster"><img src="${poster}" alt="Pôster de ${escapeHTML(title)}" loading="lazy"></div>
    <div class="card-dados catalogo-card__dados">
      <div class="card-textos catalogo-card__textos"><div class="titulo-filme catalogo-card__titulo" title="${escapeHTML(title)}">${escapeHTML(title)}</div><div class="ano-lancamento catalogo-card__ano">${year}</div></div>
      <span class="avaliacao catalogo-card__avaliacao"><i class="fa-solid fa-star"></i> ${Number(item.vote_average || 0).toFixed(1)}</span>
    </div>
  </article>`;
}

async function carregarTemporada(tvId, temporada) {
  const select = document.getElementById("temporada-seletor");
  const lista = document.getElementById("lista-episodios");
  const resumo = document.getElementById("temporada-resumo");
  lista.innerHTML =
    '<p class="detalhes-status"><i class="fa-solid fa-circle-notch fa-spin"></i> Carregando episódios...</p>';
  try {
    const data = await requisicaoTMDB(`/tv/${tvId}/season/${temporada}`);
    resumo.textContent =
      data.overview ||
      `${data.episodes?.length || 0} episódios nesta temporada.`;
    const episodes = data.episodes || [];

    // Atualiza a temporada selecionada e o primeiro episódio para o botão principal Assistir
    mediaAtual.temporadaAtual = Number(temporada);
    mediaAtual.primeiroEpisodio = episodes[0]?.episode_number || 1;

    lista.innerHTML = episodes.length
      ? episodes
          .map((ep) => {
            const still = ep.still_path
              ? IMG + "w500" + ep.still_path
              : PLACEHOLDER;
            const dataEp = ep.air_date
              ? dataBR(ep.air_date)
              : "Data não informada";
            const duracao = ep.runtime
              ? ep.runtime + " min"
              : "Duração não informada";
            return `<article class="episodio-card" role="button" tabindex="0" data-episodio="${ep.episode_number}" data-nome="${escapeHTML(ep.name || "Episódio " + ep.episode_number)}">
        <div class="episodio-imagem">
          <img src="${still}" alt="Imagem do episódio ${ep.episode_number}" loading="lazy">
          <div class="episodio-play-overlay"><span class="episodio-play-icon"><i class="fa-solid fa-play"></i></span></div>
        </div>
        <div class="episodio-card-info">
          <div class="episodio-titulo-linha">
            <span class="episodio-numero">E${String(ep.episode_number).padStart(2, "0")}</span>
            <h3>${escapeHTML(ep.name || "Episódio sem título")}</h3>
          </div>
          <p class="episodio-sinopse">${escapeHTML(ep.overview || "Sinopse deste episódio não disponível.")}</p>
          <div class="episodio-rodape"><span>${dataEp}</span><span>${duracao}</span></div>
        </div>
      </article>`;
          })
          .join("")
      : '<p class="detalhes-status">Nenhum episódio disponível para esta temporada.</p>';

    // Ao clicar em qualquer episódio da série, abre o modal de acordo com a API:
    // https://myembed.biz/serie/{tmdb_id}/{season}/{episode}
    lista.querySelectorAll(".episodio-card").forEach((card) => {
      const abrirEp = () => {
        const epNum = Number(card.dataset.episodio) || 1;
        const epNome = card.dataset.nome || `Episódio ${epNum}`;
        const url = PLAYER_API.serie(tvId, temporada, epNum);
        abrirPlayer(
          url,
          `${mediaAtual.title} — T${temporada}:E${epNum} · ${epNome}`,
          `Temporada ${temporada} · Episódio ${epNum}`,
        );
      };
      card.addEventListener("click", abrirEp);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          abrirEp();
        }
      });
    });
  } catch (error) {
    lista.innerHTML = `<p class="detalhes-status">${escapeHTML(error.message)}</p>`;
  }
}

function configurarTemporadas(item) {
  const section = document.getElementById("temporadas");
  const select = document.getElementById("temporada-seletor");
  const seasons = (item.seasons || []).filter(
    (season) => season.season_number >= 0,
  );
  if (!seasons.length) return;
  section.classList.remove("hidden");
  select.innerHTML = seasons
    .map(
      (season) =>
        `<option value="${season.season_number}">${escapeHTML(season.name || "Temporada " + season.season_number)}</option>`,
    )
    .join("");
  const primeira =
    seasons.find((season) => season.season_number > 0) || seasons[0];
  select.value = String(primeira.season_number);
  carregarTemporada(item.id, primeira.season_number);
  select.addEventListener("change", () =>
    carregarTemporada(item.id, Number(select.value)),
  );
}

async function carregarDetalhes() {
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const type = params.get("type") === "tv" ? "tv" : "movie";
  if (!id || !/^\d+$/.test(id))
    throw new Error(
      "Título não identificado. Volte à página inicial e selecione um filme ou série.",
    );
  const [item, credits, videos, recommendations] = await Promise.all([
    requisicaoTMDB(`/${type}/${id}`),
    requisicaoTMDB(`/${type}/${id}/credits`),
    requisicaoTMDB(`/${type}/${id}/videos`),
    requisicaoTMDB(`/${type}/${id}/recommendations`),
  ]);
  const title = item.title || item.name || "Sem título";
  mediaAtual.id = id;
  mediaAtual.type = type;
  mediaAtual.title = title;
  mediaAtual.temporadaAtual = 1;
  mediaAtual.primeiroEpisodio = 1;

  configurarModalPlayer();
  configurarBotaoAssistir();

  atualizarBotaoFavorito(item, type);
  document.title = title + " | MasterCine";
  document.getElementById("detalhe-hero").style.backgroundImage =
    item.backdrop_path ? `url("${IMG}original${item.backdrop_path}")` : "none";
  const poster = document.getElementById("detalhe-poster");
  poster.src = item.poster_path ? IMG + "w500" + item.poster_path : PLACEHOLDER;
  poster.alt = "Pôster de " + title;
  document.getElementById("detalhe-tipo").textContent =
    type === "tv" ? "SÉRIE" : "FILME";
  if (type === "tv") configurarTemporadas(item);
  document.getElementById("detalhe-titulo").textContent = title;
  document.getElementById("detalhe-tagline").textContent = item.tagline || "";
  const year =
    (item.release_date || item.first_air_date || "").slice(0, 4) || "—";
  const runtime =
    type === "tv"
      ? item.episode_run_time?.[0]
        ? item.episode_run_time[0] + " min por episódio"
        : "Não informado"
      : item.runtime
        ? item.runtime + " min"
        : "Não informado";
  const status = item.status || "Não informado";
  document.getElementById("detalhe-meta").innerHTML =
    `<span><strong><i class="fa-solid fa-star"></i> ${Number(item.vote_average || 0).toFixed(1)}</strong> / 10</span><span>${year}</span><span>${runtime}</span><span>${escapeHTML(status)}</span>`;
  document.getElementById("detalhe-generos").innerHTML = (item.genres || [])
    .map((g) => `<span>${escapeHTML(g.name)}</span>`)
    .join("");
  document.getElementById("detalhe-sinopse").textContent =
    item.overview || "Sinopse não disponível.";
  const trailer =
    (videos.results || []).find(
      (v) => v.site === "YouTube" && v.type === "Trailer" && v.official,
    ) ||
    (videos.results || []).find(
      (v) => v.site === "YouTube" && v.type === "Trailer",
    ) ||
    (videos.results || []).find((v) => v.site === "YouTube");
  if (trailer) {
    document.getElementById("detalhe-trailer").src =
      "https://www.youtube-nocookie.com/embed/" +
      encodeURIComponent(trailer.key);
    document.getElementById("trailer").classList.remove("hidden");
  }
  const cast = (credits.cast || []).slice(0, 18);
  document.getElementById("detalhe-elenco").innerHTML = cast.length
    ? cast
        .map(
          (person) => `<article class="ator-card">
    <img src="${person.profile_path ? IMG + "w185" + person.profile_path : PLACEHOLDER}" alt="Foto de ${escapeHTML(person.name)}" loading="lazy">
    <div class="ator-info"><div class="ator-nome">${escapeHTML(person.name)}</div><div class="ator-personagem">${escapeHTML(person.character || "")}</div></div>
  </article>`,
        )
        .join("")
    : '<p class="detalhes-status">Elenco não disponível.</p>';

  const dinheiro = (valor) =>
    valor
      ? new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(valor)
      : "Não informado";
  document.getElementById("detalhe-orcamento").textContent = dinheiro(
    item.budget,
  );
  document.getElementById("detalhe-bilheteria").textContent = dinheiro(
    item.revenue,
  );

  const elenco = document.getElementById("detalhe-elenco");
  const setaAnterior = document.getElementById("elenco-anterior");
  const setaProxima = document.getElementById("elenco-proximo");
  const atualizarSetas = () => {
    setaAnterior.disabled = elenco.scrollLeft <= 2;
    setaProxima.disabled =
      elenco.scrollLeft + elenco.clientWidth >= elenco.scrollWidth - 2;
  };
  setaAnterior.addEventListener("click", () =>
    elenco.scrollBy({ left: -elenco.clientWidth * 0.8, behavior: "smooth" }),
  );
  setaProxima.addEventListener("click", () =>
    elenco.scrollBy({ left: elenco.clientWidth * 0.8, behavior: "smooth" }),
  );
  elenco.addEventListener("scroll", atualizarSetas, { passive: true });
  window.addEventListener("resize", atualizarSetas);
  requestAnimationFrame(atualizarSetas);
  const recs = (recommendations.results || [])
    .filter((x) => x.poster_path)
    .slice(0, 15);
  const recType = type;
  const recContainer = document.getElementById("detalhe-recomendacoes");
  recContainer.innerHTML = recs.length
    ? recs.map((x) => criarCardRecomendacao(x, recType)).join("")
    : '<p class="detalhes-status">Não há recomendações disponíveis.</p>';
  recContainer.querySelectorAll("[data-id]").forEach((card) => {
    const open = () =>
      (location.href = `detalhes.html?id=${card.dataset.id}&type=${card.dataset.type}`);
    card.addEventListener("click", open);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });
  });
  document.getElementById("detalhes-loading").classList.add("hidden");
  document.getElementById("detalhes-conteudo").classList.remove("hidden");
}
document.addEventListener("DOMContentLoaded", () => {
  carregarDetalhes().catch((error) => {
    document.getElementById("detalhes-loading").classList.add("hidden");
    const box = document.getElementById("detalhes-erro");
    box.textContent = error.message;
    box.classList.remove("hidden");
    console.error(error);
  });
});
