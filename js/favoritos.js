// Lista de favoritos compartilhada entre as páginas por meio do localStorage.
const FAVORITOS_KEY = "mastercine_favoritos";
const PLACEHOLDER_FAVORITO =
  "https://placehold.co/300x450/202020/ffc107?text=Sem+poster";

function lerFavoritos() {
  try {
    const dados = JSON.parse(localStorage.getItem(FAVORITOS_KEY) || "[]");
    return Array.isArray(dados)
      ? dados.filter(
          (item) => item && item.id && ["movie", "tv"].includes(item.type),
        )
      : [];
  } catch {
    return [];
  }
}

function escaparFavorito(value) {
  return String(value ?? "").replace(
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

function salvarFavoritos(items) {
  localStorage.setItem(FAVORITOS_KEY, JSON.stringify(items));
}

function renderizarFavoritos() {
  const lista = document.getElementById("favoritos-lista");
  const favoritos = lerFavoritos();

  // Quando não há títulos salvos, a mensagem fica centralizada na área da grade.
  if (!favoritos.length) {
    lista.className = "favoritos-grid favoritos-grid--vazio";
    lista.innerHTML =
      '<div class="favoritos-vazio"><i class="fa-regular fa-heart"></i><strong>Sua lista ainda está vazia</strong><p>Abra um filme ou série e toque em “Adicionar aos favoritos”.</p><a href="index.html">Explorar catálogo</a></div>';
    return;
  }

  lista.className = "favoritos-grid";
  lista.innerHTML = favoritos
    .map((item) => {
      const id = encodeURIComponent(item.id);
      const type = encodeURIComponent(item.type);
      const poster = escaparFavorito(item.poster || PLACEHOLDER_FAVORITO);
      const title = escaparFavorito(item.title || "Sem título");
      const year = escaparFavorito(item.year || "—");
      const rating = Number(item.vote_average || 0).toFixed(1);

      // Cada card apresenta o pôster, título e a linha inferior com ano e avaliação.
      return (
        '<article class="favorito-card">' +
        '<a class="favorito-card__link" href="detalhes.html?id=' +
        id +
        "&type=" +
        type +
        '">' +
        '<img class="favorito-card__poster" src="' +
        poster +
        '" alt="Pôster de ' +
        title +
        '" loading="lazy">' +
        '<h2 class="favorito-card__titulo">' +
        title +
        "</h2>" +
        '<div class="favorito-card__dados"><span class="favorito-card__ano">' +
        year +
        "</span>" +
        '<span class="favorito-card__avaliacao"><i class="fa-solid fa-star"></i> ' +
        rating +
        "</span></div></a>" +
        '<button class="favorito-card__remover" type="button" data-id="' +
        escaparFavorito(item.id) +
        '" data-type="' +
        item.type +
        '">' +
        '<i class="fa-solid fa-trash"></i> Remover</button></article>'
      );
    })
    .join("");

  lista.querySelectorAll(".favorito-card__remover").forEach((button) => {
    button.addEventListener("click", () => {
      const atualizados = lerFavoritos().filter(
        (item) =>
          !(
            String(item.id) === button.dataset.id &&
            item.type === button.dataset.type
          ),
      );
      salvarFavoritos(atualizados);
      renderizarFavoritos();
    });
  });
}

document.addEventListener("DOMContentLoaded", renderizarFavoritos);
