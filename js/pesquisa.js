const TMDB_API = "https://api.themoviedb.org/3";
const TMDB_IMG = "https://image.tmdb.org/t/p/";
const STORAGE_KEY = "mastercine_tmdb_api_key";
const PLACEHOLDER =
  "https://placehold.co/300x450/202020/ffc107?text=Sem+poster";
let apiKey = localStorage.getItem(STORAGE_KEY) || "";
const input = document.getElementById("pesquisa-input");
const form = document.getElementById("form-pesquisa");
const grid = document.getElementById("pesquisa-resultados");
const legenda = document.getElementById("pesquisa-legenda");
function escapeHTML(value = "") {
  return String(value).replace(
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
// Pesquisa títulos na API do TMDB e renderiza os resultados com a estrutura BEM catalogo-card.
async function buscar(query) {
  if (!apiKey) {
    apiKey = (prompt("Insira sua API Key v3 do TMDB:") || "").trim();
    if (apiKey) localStorage.setItem(STORAGE_KEY, apiKey);
  }
  if (!apiKey) {
    grid.innerHTML =
      '<p class="estado">Configure sua chave da API do TMDB para pesquisar.</p>';
    return;
  }
  grid.innerHTML =
    '<p class="estado"><i class="fa-solid fa-circle-notch fa-spin"></i> Buscando...</p>';
  legenda.textContent = 'Pesquisando por "' + query + '"';
  try {
    const url = new URL(TMDB_API + "/search/multi");
    Object.entries({
      api_key: apiKey,
      language: "pt-BR",
      query,
      include_adult: false,
    }).forEach(([k, v]) => url.searchParams.set(k, v));
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(
        "Não foi possível realizar a pesquisa (" + response.status + ").",
      );
    const data = await response.json();
    const items = (data.results || []).filter(
      (item) => item.media_type !== "person" && item.poster_path,
    );
    if (!items.length) {
      grid.innerHTML =
        '<p class="estado">Nenhum filme ou série encontrado.</p>';
      return;
    }
    grid.innerHTML = items
      .map((item) => {
        const title = item.title || item.name || "Sem título";
        const year =
          (item.release_date || item.first_air_date || "").slice(0, 4) || "—";
        const type = item.media_type === "tv" ? "tv" : "movie";
        const poster = TMDB_IMG + "w342" + item.poster_path;
        return `<article class="${type === "tv" ? "serie" : "filme"} catalogo-card catalogo-card--resultado" role="link" tabindex="0" data-id="${item.id}" data-type="${type}">
        <div class="poster-wrap catalogo-card__poster"><img src="${poster}" alt="Pôster de ${escapeHTML(title)}" loading="lazy" onerror="this.src='${PLACEHOLDER}'"></div>
        <div class="card-textos catalogo-card__textos"><div class="titulo-filme catalogo-card__titulo" title="${escapeHTML(title)}">${escapeHTML(title)}</div></div>
        <div class="card-dados catalogo-card__dados"><span class="ano-lancamento catalogo-card__ano">${year}</span>
        <span class="avaliacao catalogo-card__avaliacao"><i class="fa-solid fa-star"></i> ${Number(item.vote_average || 0).toFixed(1)}</span></div>
      </article>`;
      })
      .join("");
    grid.querySelectorAll("[data-id]").forEach((card) => {
      const open = () =>
        (location.href = `detalhes.html?id=${encodeURIComponent(card.dataset.id)}&type=${encodeURIComponent(card.dataset.type)}`);
      card.addEventListener("click", open);
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open();
        }
      });
    });
  } catch (error) {
    grid.innerHTML = '<p class="estado">' + escapeHTML(error.message) + "</p>";
  }
}
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = input.value.trim();
  if (query.length < 2) return;
  const url = new URL(location.href);
  url.searchParams.set("q", query);
  history.replaceState(null, "", url);
  buscar(query);
});
const initial = new URLSearchParams(location.search).get("q") || "";
input.value = initial;
if (initial.trim().length >= 2) buscar(initial.trim());
else {
  grid.innerHTML =
    '<p class="estado">Digite um título para começar sua pesquisa.</p>';
  legenda.textContent = "Encontre filmes e séries no catálogo.";
}
