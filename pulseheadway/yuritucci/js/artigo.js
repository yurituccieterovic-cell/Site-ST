document.addEventListener("DOMContentLoaded", () => {
  const artigos = Array.isArray(window.ARTIGOS) ? window.ARTIGOS : [];
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  const refs = {
    title: document.getElementById("artigo-titulo"),
    description: document.getElementById("artigo-descricao"),
    date: document.getElementById("artigo-data"),
    reading: document.getElementById("artigo-leitura"),
    author: document.getElementById("artigo-autor"),
    image: document.getElementById("artigo-imagem"),
    body: document.getElementById("artigo-corpo"),
    category: document.getElementById("artigo-categoria"),
    eyebrow: document.getElementById("artigo-eyebrow"),
    related: document.getElementById("artigo-relacionados")
  };

  const fallbackArticle = {
    slug: "nao-encontrado",
    titulo: "Artigo não encontrado",
    descricao: "O conteúdo solicitado não foi encontrado ou ainda não foi publicado.",
    categoria: "Editorial",
    data: "",
    dataFormatada: "",
    leitura: "",
    autor: "Yuri Tucci",
    imagem: "./assets/images/jornais/organismo-vivo.jpg",
    imagemAlt: "Imagem editorial padrão do site Yuri Tucci",
    relacionados: [],
    conteudo: `
      <p>O artigo solicitado não está disponível neste momento.</p>
      <p>Volte para a seção de jornais para acessar os textos publicados.</p>
    `
  };

  const artigo = artigos.find((item) => item.slug === slug) || artigos[0] || fallbackArticle;

  updateDocumentMeta(artigo);
  renderArticle(artigo);
  renderRelated(artigo, artigos);
  initShare();
  initCopyLink();

  function renderArticle(item) {
    if (refs.title) refs.title.textContent = item.titulo || "Artigo";
    if (refs.description) refs.description.textContent = item.descricao || "";
    if (refs.category) refs.category.textContent = item.categoria || "Editorial";
    if (refs.eyebrow) refs.eyebrow.textContent = `Jornal • ${item.categoria || "Editorial"}`;

    if (refs.date) {
      refs.date.textContent = item.dataFormatada || "";
      if (item.data) {
        refs.date.setAttribute("datetime", item.data);
      } else {
        refs.date.removeAttribute("datetime");
      }
    }

    if (refs.reading) refs.reading.textContent = item.leitura || "";
    if (refs.author) refs.author.textContent = item.autor || "Yuri Tucci";

    if (refs.image) {
      refs.image.src = item.imagem || "./assets/images/jornais/organismo-vivo.jpg";
      refs.image.alt = item.imagemAlt || item.titulo || "Imagem do artigo";
      refs.image.loading = "lazy";
      refs.image.decoding = "async";
    }

    if (refs.body) {
      refs.body.innerHTML = item.conteudo || "<p>Conteúdo indisponível.</p>";
    }
  }

  function renderRelated(currentArticle, allArticles) {
    if (!refs.related) return;

    refs.related.innerHTML = "";

    const relatedItems = Array.isArray(currentArticle.relacionados) && currentArticle.relacionados.length
      ? currentArticle.relacionados
      : allArticles
          .filter((item) => item.slug !== currentArticle.slug)
          .slice(0, 3)
          .map((item) => ({ slug: item.slug, titulo: item.titulo }));

    if (!relatedItems.length) {
      refs.related.innerHTML = "<li><span>Nenhum artigo relacionado no momento.</span></li>";
      return;
    }

    relatedItems.forEach((item) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = `./artigo.html?slug=${encodeURIComponent(item.slug)}`;
      a.textContent = item.titulo;
      li.appendChild(a);
      refs.related.appendChild(li);
    });
  }

  function updateDocumentMeta(item) {
    document.title = `${item.titulo || "Artigo"} — Yuri Tucci`;

    setMeta('meta[name="description"]', "content", item.descricao || "");
    setMeta('meta[property="og:title"]', "content", `${item.titulo || "Artigo"} — Yuri Tucci`);
    setMeta('meta[property="og:description"]', "content", item.descricao || "");
    setMeta('meta[property="og:type"]', "content", "article");
    setMeta('meta[property="og:url"]', "content", window.location.href);
    setMeta('meta[property="og:image"]', "content", absoluteUrl(item.imagem || "./assets/images/jornais/organismo-vivo.jpg"));

    setMeta('meta[name="twitter:card"]', "content", "summary_large_image");
    setMeta('meta[name="twitter:title"]', "content", `${item.titulo || "Artigo"} — Yuri Tucci`);
    setMeta('meta[name="twitter:description"]', "content", item.descricao || "");
    setMeta('meta[name="twitter:image"]', "content", absoluteUrl(item.imagem || "./assets/images/jornais/organismo-vivo.jpg"));

    setCanonical(window.location.href);
    setJsonLd(item);
  }

  function setMeta(selector, attr, value) {
    let el = document.querySelector(selector);
    if (!el) {
      el = document.createElement("meta");

      if (selector.includes('property=')) {
        const property = selector.match(/property="([^"]+)"/)?.[1];
        if (property) el.setAttribute("property", property);
      }

      if (selector.includes('name=')) {
        const name = selector.match(/name="([^"]+)"/)?.[1];
        if (name) el.setAttribute("name", name);
      }

      document.head.appendChild(el);
    }

    el.setAttribute(attr, value);
  }

  function setCanonical(url) {
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", url);
  }

  function setJsonLd(item) {
    const existing = document.getElementById("article-jsonld");
    if (existing) existing.remove();

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "article-jsonld";

    const payload = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: item.titulo || "Artigo",
      description: item.descricao || "",
      author: {
        "@type": "Person",
        name: item.autor || "Yuri Tucci"
      },
      image: absoluteUrl(item.imagem || "./assets/images/jornais/organismo-vivo.jpg"),
      datePublished: item.data || undefined,
      dateModified: item.data || undefined,
      mainEntityOfPage: window.location.href,
      inLanguage: "pt-BR"
    };

    script.textContent = JSON.stringify(payload);
    document.head.appendChild(script);
  }

  function absoluteUrl(path) {
    try {
      return new URL(path, window.location.href).href;
    } catch {
      return window.location.href;
    }
  }

  function initShare() {
    const shareButton = document.querySelector("[data-share-article]");
    if (!shareButton) return;

    shareButton.addEventListener("click", async () => {
      const shareData = {
        title: document.title,
        text: refs.description?.textContent || "",
        url: window.location.href
      };

      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (_) {}
      } else {
        copyToClipboard(window.location.href, "Link do artigo copiado.");
      }
    });
  }

  function initCopyLink() {
    const copyButton = document.querySelector("[data-copy-link]");
    if (!copyButton) return;

    copyButton.addEventListener("click", () => {
      copyToClipboard(window.location.href, "Link copiado.");
    });
  }

  function copyToClipboard(text, message) {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => notify(message))
        .catch(() => fallbackCopy(text, message));
    } else {
      fallbackCopy(text, message);
    }
  }

  function fallbackCopy(text, message) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();

    try {
      document.execCommand("copy");
      notify(message);
    } catch (_) {
      notify("Não foi possível copiar o link.");
    }

    textarea.remove();
  }

  function notify(message) {
    let toast = document.querySelector(".article-toast");

    if (!toast) {
      toast = document.createElement("div");
      toast.className = "article-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("is-visible");

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 2200);
  }
});    dataFormatada: "14 de Maio, 2026",
    leitura: "Ensaio editorial",
    autor: "Yuri Tucci",
    imagem: "./assets/images/jornais/subversao-ambiental.jpg",
    imagemAlt: "Camada gráfica para artigo sobre subversão ambiental mundial",
    relacionados: [
      { slug: "arquitetura-de-um-organismo-vivo", titulo: "Arquitetura de um Organismo Vivo" },
      { slug: "convivencia-ambiental-em-contexto-urbano", titulo: "Convivência Ambiental em Contexto Urbano" }
    ],
    conteudo: `
      <p>Subversão ambiental mundial não é slogan. É uma pergunta sobre coerência: que tipo de infraestrutura digital sustenta um discurso ecológico sem repeti-lo apenas como ornamento moral?</p>

      <p>Quando o site fala de responsabilidade ambiental, mas carrega peso excessivo, scripts supérfluos e imagens sem tratamento, a forma contradiz o conteúdo. A crítica começa na arquitetura.</p>

      <h2>Código e coerência</h2>
      <p>O problema não é usar tecnologia. O problema é naturalizar desperdício computacional como se fosse inevitável. Um site editorial pode ser denso sem ser pesado, expressivo sem ser inflado, visualmente forte sem desperdiçar energia.</p>

      <p>Subverter, aqui, significa recusar a estética da performance vazia e construir presença técnica compatível com o que se afirma no texto.</p>
    `
  }
];
