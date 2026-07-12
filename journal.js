const newsletterForm = document.querySelector("[data-journal-newsletter]");

if (newsletterForm) {
  const status = newsletterForm.querySelector("[data-journal-status]");
  const button = newsletterForm.querySelector('button[type="submit"]');

  newsletterForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!newsletterForm.reportValidity()) return;

    const formData = new FormData(newsletterForm);
    button.disabled = true;
    button.textContent = "Confirmando...";
    status.textContent = "";

    try {
      const payload = { name: formData.get("name"), email: formData.get("email"), source: window.location.href };
      const response = await fetch("/.netlify/functions/subscribe-journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        const fallbackResponse = await fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            "form-name": "journal-newsletter",
            name: payload.name,
            email: payload.email,
            source: payload.source,
          }).toString(),
        });
        if (!fallbackResponse.ok) throw new Error(data.error || "Não foi possível concluir a inscrição.");
      }
      newsletterForm.reset();
      status.textContent = "Inscrição confirmada. Em breve você receberá novas perspectivas da Revee.";
      status.classList.add("is-success");
    } catch (error) {
      status.textContent = error.message || "Não foi possível concluir sua inscrição agora. Tente novamente em alguns instantes.";
      status.classList.remove("is-success");
    } finally {
      button.disabled = false;
      button.textContent = "Assinar Journal";
    }
  });
}

const journalFilters = [...document.querySelectorAll("[data-journal-filter]")];
const journalSearch = document.querySelector("[data-journal-search]");
const journalSearchSection = document.querySelector("[data-journal-results-section]");
const journalSearchGrid = document.querySelector("[data-journal-search-grid]");

if (journalSearch && journalSearchSection && journalSearchGrid) {
  const searchCards = [...journalSearchGrid.querySelectorAll("[data-journal-card]")];
  const standardSections = [...document.querySelectorAll("[data-journal-standard]")];
  const searchEmpty = document.querySelector("[data-journal-search-empty]");
  const resultCount = document.querySelector("[data-journal-result-count]");
  const suggestions = [...document.querySelectorAll("[data-journal-suggestion]")];
  const tagLinks = [...document.querySelectorAll("[data-journal-tag]")];
  const normalize = (value = "") => value.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  const showEditorial = () => {
    journalSearchSection.hidden = true;
    standardSections.forEach((section) => { section.hidden = false; });
    searchCards.forEach((card) => { card.hidden = false; });
    if (searchEmpty) searchEmpty.hidden = true;
  };

  const searchJournal = ({ term = "", category = "" } = {}) => {
    const normalizedTerm = normalize(term);
    const normalizedCategory = normalize(category);
    const hasFilter = Boolean(normalizedTerm || (normalizedCategory && normalizedCategory !== "todos"));
    if (!hasFilter) {
      showEditorial();
      if (resultCount) resultCount.textContent = "";
      return;
    }

    journalSearchSection.hidden = false;
    standardSections.forEach((section) => { section.hidden = true; });
    let visibleCount = 0;
    searchCards.forEach((card) => {
      const cardText = normalize(card.dataset.search);
      const cardCategory = normalize(card.dataset.category);
      const matchesTerm = !normalizedTerm || cardText.includes(normalizedTerm);
      const matchesCategory = !normalizedCategory || normalizedCategory === "todos" || cardCategory === normalizedCategory;
      const shouldShow = matchesTerm && matchesCategory;
      card.hidden = !shouldShow;
      if (shouldShow) visibleCount += 1;
    });
    if (searchEmpty) searchEmpty.hidden = visibleCount > 0;
    if (resultCount) resultCount.textContent = visibleCount === 1 ? "1 matéria encontrada" : `${visibleCount} matérias encontradas`;
  };

  journalSearch.addEventListener("input", () => {
    journalFilters.forEach((filter) => filter.setAttribute("aria-pressed", String(filter.dataset.journalFilter === "Todos")));
    searchJournal({ term: journalSearch.value });
  });

  suggestions.forEach((suggestion) => {
    suggestion.addEventListener("click", () => {
      journalSearch.value = suggestion.dataset.journalSuggestion;
      searchJournal({ term: journalSearch.value });
      journalSearchSection.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  tagLinks.forEach((tagLink) => {
    tagLink.addEventListener("click", (event) => {
      event.preventDefault();
      journalSearch.value = tagLink.dataset.journalTag;
      searchJournal({ term: journalSearch.value });
      document.querySelector(".journal-explore")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  journalFilters.forEach((filter) => {
    filter.addEventListener("click", () => {
      const category = filter.dataset.journalFilter;
      journalFilters.forEach((item) => item.setAttribute("aria-pressed", "false"));
      filter.setAttribute("aria-pressed", "true");
      journalSearch.value = "";
      searchJournal({ category });
      if (category !== "Todos") journalSearchSection.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  const requestedTag = new URLSearchParams(window.location.search).get("tag");
  if (requestedTag) {
    journalSearch.value = requestedTag;
    searchJournal({ term: requestedTag });
  }
}

const articleBody = document.querySelector(".article-body");

if (articleBody) {
  const title = articleBody.dataset.articleTitle;
  const category = articleBody.dataset.articleCategory;
  const author = articleBody.dataset.articleAuthor || "The Revee Journal";
  const summary = articleBody.dataset.articleSummary || "Uma perspectiva sobre marcas, negócios e cultura.";
  const url = articleBody.dataset.articleUrl || window.location.href;
  const encodedUrl = encodeURIComponent(url);
  const shareText = `${title}\n\nPor ${author}, no The Revee Journal.\n\n${summary}\n\nLeia a matéria completa:\n${url}`;
  const twitterText = `${title}\n\nPor ${author}, no The Revee Journal.\n\nLeia a matéria completa:`;

  const whatsapp = document.querySelector('[data-share="whatsapp"]');
  const linkedin = document.querySelector('[data-share="linkedin"]');
  const twitter = document.querySelector('[data-share="twitter"]');
  const copyButton = document.querySelector('[data-share="copy"]');

  if (whatsapp) whatsapp.href = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  if (linkedin) linkedin.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  if (twitter) twitter.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodedUrl}`;
  [whatsapp, linkedin, twitter].forEach((link) => {
    if (!link) return;
    link.target = "_blank";
    link.rel = "noreferrer";
  });

  const copyToClipboard = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand("copy");
      textarea.remove();
      return copied;
    }
  };

  copyButton?.addEventListener("click", async () => {
    const copied = await copyToClipboard(shareText);
    copyButton.textContent = copied ? "Chamada copiada" : "Copie pela barra do navegador";
    window.setTimeout(() => { copyButton.textContent = "Copiar chamada"; }, 2200);
  });

  linkedin?.addEventListener("click", async () => {
    const copied = await copyToClipboard(shareText);
    if (!copied) return;
    linkedin.textContent = "Texto copiado — cole no LinkedIn";
    window.setTimeout(() => { linkedin.textContent = "LinkedIn"; }, 3000);
  });

  const modal = document.querySelector("[data-story-modal]");
  const canvas = document.querySelector("[data-story-canvas]");
  const download = document.querySelector("[data-story-download]");
  const storyButton = document.querySelector("[data-share-story]");
  const closeButton = document.querySelector("[data-story-close]");
  const nativeShare = document.querySelector("[data-story-native]");
  const storyStatus = document.querySelector("[data-story-status]");

  const wrapCanvasText = (context, text, maxWidth) => {
    const words = text.split(" ");
    const lines = [];
    let line = "";
    words.forEach((word) => {
      const test = line ? `${line} ${word}` : word;
      if (context.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    });
    if (line) lines.push(line);
    return lines;
  };

  const drawStoryCard = () => {
    if (!canvas) return;
    const context = canvas.getContext("2d");
    context.fillStyle = "#070707";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = "#f4f3ef";
    context.font = "400 54px Arial";
    context.fillText("The Revee", 92, 132);
    context.font = "italic 64px Georgia";
    context.fillText("Journal", 347, 132);
    context.strokeStyle = "#343434";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(92, 190);
    context.lineTo(988, 190);
    context.stroke();

    context.fillStyle = "#9b9b98";
    context.font = "600 28px Arial";
    context.fillText(category.toUpperCase(), 92, 300);

    context.fillStyle = "#f4f3ef";
    context.font = "500 76px Arial";
    const titleLines = wrapCanvasText(context, title, 890);
    titleLines.slice(0, 6).forEach((line, index) => context.fillText(line, 92, 430 + index * 92));
    const summaryStart = 430 + Math.min(titleLines.length, 6) * 92 + 80;

    context.fillStyle = "#b8b8b4";
    context.font = "400 36px Arial";
    const summaryLines = wrapCanvasText(context, summary, 890);
    summaryLines.slice(0, 5).forEach((line, index) => context.fillText(line, 92, summaryStart + index * 54));

    const authorY = Math.min(summaryStart + Math.min(summaryLines.length, 5) * 54 + 90, 1420);
    context.fillStyle = "#f4f3ef";
    context.font = "500 30px Arial";
    context.fillText(`Por ${author}`, 92, authorY);

    context.strokeStyle = "#f4f3ef";
    context.strokeRect(92, 1510, 610, 104);
    context.font = "600 27px Arial";
    context.fillText("LEIA A MATÉRIA COMPLETA", 128, 1577);

    context.fillStyle = "#a2a29f";
    context.font = "400 27px Arial";
    const displayUrl = url.replace(/^https?:\/\//, "");
    wrapCanvasText(context, displayUrl, 890).slice(0, 2).forEach((line, index) => {
      context.fillText(line, 92, 1730 + index * 42);
    });
    context.font = "500 25px Arial";
    context.fillText("Acesse o link e continue a leitura no Journal.", 92, 1850);
  };

  storyButton?.addEventListener("click", async () => {
    if (!modal || !canvas || !download) return;
    drawStoryCard();
    download.href = canvas.toDataURL("image/png");
    await copyToClipboard(url);
    if (storyStatus) storyStatus.textContent = "O endereço da matéria já foi copiado para o adesivo de link.";
    modal.hidden = false;
    document.body.classList.add("story-is-open");
  });

  nativeShare?.addEventListener("click", async () => {
    if (!canvas) return;
    drawStoryCard();
    await copyToClipboard(url);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    const file = blob ? new File([blob], "the-revee-journal-story.png", { type: "image/png" }) : null;
    try {
      if (file && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title, text: shareText, url });
      } else if (navigator.share) {
        await navigator.share({ title, text: shareText, url });
      } else if (storyStatus) {
        storyStatus.textContent = "No computador, baixe o card. O endereço da matéria já está copiado.";
      }
    } catch (error) {
      if (error?.name !== "AbortError" && storyStatus) {
        storyStatus.textContent = "Baixe o card e use o endereço copiado no adesivo de link.";
      }
    }
  });

  const closeStory = () => {
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove("story-is-open");
  };
  closeButton?.addEventListener("click", closeStory);
  modal?.addEventListener("click", (event) => { if (event.target === modal) closeStory(); });
}
