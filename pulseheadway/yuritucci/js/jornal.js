document.addEventListener("DOMContentLoaded", () => {
  const filtroButtons = document.querySelectorAll(".filtro-btn");
  const cards = document.querySelectorAll(".card-jornal");
  const searchInput = document.getElementById("pesquisa");
  const contador = document.getElementById("contador-artigos");

  let categoriaAtual = "todas";
  let termoAtual = "";

  function normalizar(texto) {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");
  }

  function atualizarLista() {
    let visiveis = 0;

    cards.forEach((card) => {
      const categoria = card.dataset.category || "";
      const titulo = normalizar(card.querySelector("h2")?.textContent || "");
      const resumo = normalizar(card.querySelector(".resumo")?.textContent || "");
      const tags = normalizar(card.dataset.tags || "");
      const termo = normalizar(termoAtual);

      const passaCategoria = categoriaAtual === "todas" || categoria === categoriaAtual;
      const passaBusca =
        !termo ||
        titulo.includes(termo) ||
        resumo.includes(termo) ||
        tags.includes(termo);

      if (passaCategoria && passaBusca) {
        card.style.display = "";
        requestAnimationFrame(() => card.classList.add("is-visible"));
        visiveis++;
      } else {
        card.classList.remove("is-visible");
        card.style.display = "none";
      }
    });

    if (contador) {
      contador.textContent =
        visiveis === 1 ? "1 artigo encontrado" : `${visiveis} artigos encontrados`;
    }
  }

  filtroButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filtroButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      categoriaAtual = btn.dataset.category;
      atualizarLista();
    });
  });

  if (searchInput) {
    let debounce;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        termoAtual = e.target.value.trim();
        atualizarLista();
      }, 180);
    });
  }

  const lazyImages = document.querySelectorAll("img[data-src]");
  if ("IntersectionObserver" in window && lazyImages.length) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute("data-src");
        img.classList.add("loaded");
        observer.unobserve(img);
      });
    }, { rootMargin: "80px 0px" });

    lazyImages.forEach((img) => imageObserver.observe(img));
  }

  atualizarLista();
});
