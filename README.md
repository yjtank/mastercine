# 🎬 MasterCine — Catálogo & Streaming de Filmes e Séries

Plataforma web moderna, dinâmica e totalmente responsiva para catálogo e reprodução de filmes e séries, desenvolvida com **HTML5 Semântico**, **CSS3 Moderno (BEM, Flexbox e Grid)** e **JavaScript Vanilla**.

---

## 📌 Sumário
- [1. Visão Geral do Projeto](#1-visão-geral-do-projeto)
- [2. Estrutura de Diretórios](#2-estrutura-de-diretórios)
- [3. Páginas do Projeto](#3-páginas-do-projeto)
- [4. HTML5 Semântico](#4-html5-semântico)
- [5. Metodologia BEM (Block, Element, Modifier)](#5-metodologia-bem-block-element-modifier)
- [6. Aplicação de Flexbox](#6-aplicação-de-flexbox)
- [7. Aplicação de CSS Grid Layout](#7-aplicação-de-css-grid-layout)
- [8. Responsividade e Media Queries](#8-responsividade-e-media-queries)
- [9. Capturas de Tela](#9-capturas-de-tela)
- [10. Diferenciais Técnicos (APIs e Persistência)](#10-diferenciais-técnicos-apis-e-persistência)
- [11. Como Executar o Projeto](#11-como-executar-o-projeto)

---

## 1. Visão Geral do Projeto
O **MasterCine** é uma aplicação web completa desenvolvida com foco em performance, acessibilidade e experiência do usuário. A plataforma permite explorar o catálogo cinematográfico global, realizar buscas em tempo real por palavras-chave, filtrar por categorias, gerenciar uma lista pessoal de favoritos com persistência local, consultar fichas técnicas detalhadas (elenco, orçamentos, bilheterias, trailers oficiais, temporadas e episódios) e reproduzir conteúdos por meio de um player modal integrado.

A arquitetura do projeto demonstra domínio prático da estruturação semântica, organização de layouts bidimensionais e unidimensionais com CSS Grid e Flexbox, padronização de código com a metodologia BEM e adaptação fluida para diferentes resoluções de tela.

---

## 2. Estrutura de Diretórios
A organização dos arquivos segue uma estrutura modular e separada por responsabilidades:

```text
projhtml/
├── css/
│   ├── style.css           # Estilos globais, reset, cabeçalho, catálogo, rodapé e media queries
│   ├── detalhes.css        # Estilos da página de detalhes, episódios, elenco e modal do player
│   ├── favoritos.css       # Estilos da página de favoritos e modal de confirmação
│   └── sobre.css           # Estilos da página institucional, grids de recursos e equipe
├── js/
│   ├── app.js              # Lógica da home: listagem TMDB, abas, paginação e modal de chave
│   ├── detalhes.js         # Lógica da página de detalhes: API TMDB, player embed e temporadas
│   ├── favoritos.js        # Gerenciamento de favoritos no LocalStorage e renderização
│   └── pesquisa.js         # Busca dinâmica, filtros por tipo (filmes/séries) e ordenação
├── img/
│   └── screenshots/        # Capturas de tela da aplicação em diferentes resoluções
│       ├── desktop-1366.png
│       ├── tablet-768.png
│       └── mobile-375.png
├── index.html              # Página inicial (Catálogo em alta, populares e bem avaliados)
├── detalhes.html           # Página de detalhes do filme/série com guia de episódios e player
├── favoritos.html          # Página de favoritos salvos pelo usuário
├── pesquisa.html           # Página de busca e filtragem avançada
├── sobre.html              # Página institucional e apresentação técnica do projeto
└── README.md               # Documentação técnica completa
```

---

## 3. Páginas do Projeto
O projeto é composto por **5 páginas HTML distintas e totalmente interligadas**, mantendo consistência visual, hierarquia de navegação e compartilhamento de componentes estruturais:

1. **`index.html` (Início / Catálogo)**: Apresenta o banner de destaque principal (*Hero Banner*), navegação por abas dinâmicas ("Em Alta", "Populares", "Mais Votados") e grade de catálogo com paginação.
2. **`detalhes.html` (Detalhes & Reprodução)**: Exibe informações detalhadas de cada título (sinopse, avaliação, gêneros, duração, orçamento, bilheteria, elenco em carrossel e recomendações). Para séries, inclui seletor de temporadas e lista de episódios. Possui botão **"Assistir"** e cards de episódios vinculados ao player embed modal.
3. **`pesquisa.html` (Busca & Filtros)**: Interface de pesquisa por texto com filtros dinâmicos por formato (Todos, Filmes, Séries), ordenação (Popularidade, Avaliação, Lançamento) e paginação.
4. **`favoritos.html` (Meus Favoritos)**: Área dedicada onde o usuário pode consultar todos os filmes e séries salvos, com filtros rápidos, contadores e opção de exclusão.
5. **`sobre.html` (Sobre o Projeto)**: Apresentação da proposta, tecnologias empregadas, arquitetura do sistema e equipe desenvolvedora.

---

## 4. HTML5 Semântico
Toda a estruturação das páginas segue as diretrizes do HTML5 semântico, promovendo acessibilidade, SEO e clareza estrutural:

- **`<header>`**: Delimita o cabeçalho superior unificado em todas as páginas.
- **`<nav>`**: Agrupa o menu de navegação principal e controles de páginas.
- **`<main>`**: Encapsula o conteúdo principal e relevante de cada documento.
- **`<section>`**: Setoriza blocos temáticos como Hero, Categorias, Temporadas, Elenco, Recomendações e Informações Técnicas.
- **`<article>`**: Utilizado para unidades independentes de conteúdo, tais como cards de filmes/séries (`.catalogo-card`), cards de episódios (`.episodio-card`) e cards de atores (`.ator-card`).
- **`<footer>`**: Delimita o rodapé padrão com créditos e avisos de direitos.

---

## 5. Metodologia BEM (Block, Element, Modifier)
A nomenclatura das classes CSS segue rigorosamente a metodologia **BEM**:
- **Bloco (`block`)**: Componente independente e reutilizável.
- **Elemento (`__element`)**: Parte integrante de um bloco, ligada por dois sublinhados (`__`).
- **Modificador (`--modifier`)**: Variação visual ou comportamental de um bloco/elemento, ligada por dois hífens (`--`).

### Exemplos Reais do Projeto:
```html
<!-- Bloco: catalogo-card | Modificador: catalogo-card--destaque -->
<article class="catalogo-card catalogo-card--destaque">
  <!-- Elemento: catalogo-card__poster -->
  <div class="catalogo-card__poster">
    <img src="poster.jpg" alt="Pôster" class="catalogo-card__imagem">
  </div>
  <!-- Elemento: catalogo-card__dados -->
  <div class="catalogo-card__dados">
    <div class="catalogo-card__titulo">Interestelar</div>
    <div class="catalogo-card__ano">2014</div>
    <span class="catalogo-card__avaliacao">★ 8.7</span>
  </div>
</article>

<!-- Bloco: detalhe | Elemento: detalhe__btn | Modificador: detalhe__btn--principal -->
<button class="detalhe__btn detalhe__btn--principal" id="detalhe-assistir-btn">
  <i class="fa-solid fa-play"></i> Assistir
</button>
```

---

## 6. Aplicação de Flexbox
O Flexbox foi implementado em diversas seções do projeto para alinhamento, distribuição e controle de fluxo unidimensional.

### Áreas de Destaque:
1. **Cabeçalho e Menu de Navegação (`css/style.css`)**:
   Distribui logotipo, links institucionais e ações em linha com alinhamento vertical centralizado.
   ```css
   .cabecalho-container,
   .cabecalho__container {
     display: flex;
     justify-content: space-between;
     align-items: center;
     gap: 20px;
   }
   .menu,
   .cabecalho__menu {
     display: flex;
     align-items: center;
     gap: 25px;
     list-style: none;
   }
   ```
2. **Dados e Textos dos Cards de Conteúdo (`css/style.css`)**:
   Organiza título, ano e classificação com `flex-direction: column` e distribuição espaçada.
   ```css
   .card-dados,
   .catalogo-card__dados {
     display: flex;
     flex-direction: column;
     justify-content: space-between;
     gap: 8px;
     flex-grow: 1;
   }
   ```
3. **Barra de Ações e Cabeçalho do Player Modal (`css/detalhes.css`)**:
   Agrupa botões de reprodução/favoritos e título/botão de fechar do modal.
   ```css
   .detalhe-acoes,
   .detalhe__acoes {
     display: flex;
     gap: 15px;
     flex-wrap: wrap;
     align-items: center;
   }
   .player-modal__cabecalho {
     display: flex;
     align-items: center;
     justify-content: space-between;
     gap: 15px;
   }
   ```

*Propriedades aplicadas:* `display: flex`, `flex-direction`, `justify-content`, `align-items`, `flex-wrap` e `gap`.

---

## 7. Aplicação de CSS Grid Layout
O CSS Grid Layout foi utilizado para estruturar grades bidimensionais complexas e dinâmicas.

### Áreas de Destaque:
1. **Grade Principal de Filmes e Séries (`css/style.css`)**:
   Renderiza a lista de cartões utilizando dimensionamento inteligente e adaptável sem necessidade de quebras manuais:
   ```css
   .filmes-grade,
   .filmes-container {
     display: grid;
     grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
     gap: 25px;
     width: 100%;
   }
   ```
2. **Grade de Episódios da Série (`css/detalhes.css`)**:
   Distribui os episódios da temporada selecionada com preenchimento responsivo:
   ```css
   .lista-episodios {
     display: grid;
     grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
     gap: 16px;
   }
   ```
3. **Seção de Recursos e Estatísticas (`css/sobre.css` e `css/detalhes.css`)**:
   Organiza cards de métricas e tecnologias com colunas bem definidas:
   ```css
   .detalhe-desempenho {
     display: grid;
     grid-template-columns: repeat(2, 1fr);
     gap: 20px;
   }
   ```

*Propriedades aplicadas:* `display: grid`, `grid-template-columns`, `gap`, `repeat()`, `minmax()`, `auto-fill`/`auto-fit` e posicionamento por colunas.

---

## 8. Responsividade e Media Queries
O site se adapta com precisão a smartphones, tablets e computadores desktop. Foram implementados blocos `@media screen` abrangendo os seguintes cenários de uso:

- **Mobile (375 px)**: Ajuste do menu para formato empilhado/compacto, cards com dimensionamento proporcional, reorganização vertical do hero e modal de reprodução com layout adaptado sem rolagem horizontal indevida.
- **Tablet (768 px)**: Transição dinâmica de colunas do grid (2 a 3 colunas), ajuste do formulário de filtros e redimensionamento balanceado do banner principal.
- **Desktop (1366 px e superior)**: Aproveitamento total da largura com contêineres limitados (`max-width: 1280px`), grid com 5 a 6 colunas e banners panorâmicos.

### Principais Breakpoints:
- `@media screen and (max-width: 1024px)`: Ajustes para laptops e tablets na horizontal.
- `@media screen and (max-width: 768px)`: Reorganização da navegação, abas e grades.
- `@media screen and (max-width: 480px)` e `375px`: Adequação rigorosa para celulares (sem overflow horizontal, tipografia ajustada e áreas de toque confortáveis).

---

## 9. Capturas de Tela

Abaixo estão as capturas de tela reais da tela de detalhes da aplicação nos três tamanhos de tela avaliados:

| Desktop (1366 px) | Tablet (768 px) | Smartphone (375 px) |
| :---: | :---: | :---: |
| ![Desktop 1366px](img/screenshots/desktop-1366.png) | ![Tablet 768px](img/screenshots/tablet-768.png) | ![Smartphone 375px](img/screenshots/mobile-375.png) |

---

## 10. Diferenciais Técnicos (APIs e Persistência)
O projeto conta com integração real e funcional a APIs externas e sistema de persistência local:

1. **The Movie Database (TMDB API v3)**:
   - Consumo de endpoints para títulos em alta (`/trending/all/week`), filmes populares (`/movie/popular`), mais votados (`/movie/top_rated`), busca (`/search/multi`), créditos/elenco (`/credits`), trailers (`/videos`) e recomendações (`/recommendations`).
   - Guia completo de temporadas e episódios de séries (`/tv/{id}/season/{season_number}`).
2. **API de Streaming & Embed Player (`myembed.biz`)**:
   - Centralizada em `js/detalhes.js`:
     - Filmes: `https://myembed.biz/filme/{tmdb_id}`
     - Séries: `https://myembed.biz/serie/{tmdb_id}/{season}/{episode}`
   - O botão principal "Assistir" inicia o primeiro episódio da temporada selecionada e atualiza dinamicamente conforme a temporada é alterada.
   - Cada card de episódio pode ser clicado individualmente para reprodução imediata.
3. **Web Storage API (LocalStorage)**:
   - Armazenamento local da Chave da API TMDB.
   - Gerenciamento completo de favoritos (adicionar, remover, consultar e limpar lista).

---

## 11. Como Executar o Projeto

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/yjtank/mastercine.git
   ```
2. **Acesse a pasta do projeto:**
   ```bash
   cd mastercine
   ```
3. **Abra o projeto:**
   - Abra a pasta raiz no **VS Code**.
   - Utilize a extensão **Live Server** (clique com o botão direito em `index.html` e selecione *Open with Live Server*) ou abra diretamente o arquivo `index.html` em qualquer navegador web.
4. **Configuração da Chave da API TMDB:**
   - Ao acessar a página pela primeira vez, caso não haja chave salva, clique no botão **"Chave TMDB"** no cabeçalho ou insira sua chave da API v3 do TMDB para carregar os dados em tempo real.
   - A chave fica salva no `localStorage` do seu navegador para acessos futuros.
