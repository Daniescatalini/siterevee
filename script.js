const body = document.body;
const intro = document.querySelector(".intro");
const introLine = document.querySelector("#introLine");
const introTimer = document.querySelector("#introTimer");

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function typeText(text) {
  if (!introLine) return;
  introLine.textContent = "";
  for (const char of text) {
    introLine.textContent += char;
    await wait(42);
  }
}

async function runIntro() {
  if (!intro) return;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let hasSeenIntro = false;
  try {
    hasSeenIntro = sessionStorage.getItem("revee-intro-seen") === "true";
  } catch (error) {
    hasSeenIntro = false;
  }

  if (hasSeenIntro || prefersReducedMotion) {
    intro.classList.add("is-done");
    body.classList.remove("is-locked");
    return;
  }

  await typeText("Bem-vindo à Revee Brand");
  await wait(180);
  intro.classList.add("is-loading");

  const start = performance.now();
  const timer = setInterval(() => {
    const elapsed = Math.min(performance.now() - start, 900);
    const seconds = Math.floor(elapsed / 1000);
    const centiseconds = Math.floor((elapsed % 1000) / 10);
    if (introTimer) introTimer.textContent = `${String(seconds).padStart(2, "0")}:${String(centiseconds).padStart(2, "0")}`;
  }, 34);

  await wait(720);
  clearInterval(timer);
  if (introTimer) introTimer.textContent = "00:72";
  await wait(100);
  intro.classList.add("is-done");
  body.classList.remove("is-locked");
  try {
    sessionStorage.setItem("revee-intro-seen", "true");
  } catch (error) {
    // The experience still works when storage is unavailable.
  }
}

const introPromise = runIntro();

const heroTyped = document.querySelector("#heroTyped");

async function runHeroMethodSequence() {
  if (!heroTyped) return;
  if (!heroTyped.classList.contains("editorial-title")) return;
  const heroCopy = heroTyped.closest(".hero-copy");
  const finalMarkup = heroTyped.innerHTML.trim();
  const lines = [
    "Toda empresa cresce.",
    "Poucas constroem uma marca",
    "capaz de sustentar esse",
    "crescimento."
  ];

  await introPromise;
  await wait(180);

  heroTyped.innerHTML = "";
  heroTyped.classList.add("is-typing");

  for (const [lineIndex, line] of lines.entries()) {
    const typedLine = document.createElement("span");
    typedLine.className = "hero-line";
    heroTyped.append(typedLine);
    for (const char of line) {
      typedLine.append(char);
      await wait(char === " " ? 18 : 28);
    }
    if (lineIndex < lines.length - 1) {
      heroTyped.append(document.createElement("br"));
      await wait(90);
    }
  }

  await wait(180);
  heroTyped.innerHTML = finalMarkup;
  heroTyped.classList.remove("is-typing");
  heroCopy?.classList.add("is-sequencing");
  heroTyped.classList.add("is-complete");
}

runHeroMethodSequence();

async function runTypedPageHeroes() {
  const typedElements = document.querySelectorAll("[data-type-hero]");
  if (!typedElements.length) return;
  const typeElement = async (element) => {
    if (element.dataset.typedReady) return;
    element.dataset.typedReady = "true";
    const finalMarkup = element.innerHTML.trim();
    const lines = element.innerText.split("\n").map((line) => line.trim()).filter(Boolean);

    await introPromise;
    await wait(160);

    element.innerHTML = "";
    element.classList.add("is-typing");

    for (const [lineIndex, line] of lines.entries()) {
      for (const char of line) {
        element.append(char);
        await wait(char === " " ? 12 : 22);
      }
      if (lineIndex < lines.length - 1) {
        element.append(document.createElement("br"));
        await wait(90);
      }
    }

    await wait(160);
    element.innerHTML = finalMarkup;
    element.classList.remove("is-typing");
    element.classList.add("is-complete");
  };

  const typedObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        typeElement(entry.target);
        typedObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.35 }
  );

  typedElements.forEach((element) => {
    typedObserver.observe(element);
  });
}

runTypedPageHeroes();

const applicationForm = document.querySelector("#projectApplicationForm");
const applicationSteps = [...document.querySelectorAll(".application-step")];
const applicationCounter = document.querySelector("[data-application-counter]");
const applicationProgress = document.querySelector("[data-application-progress]");
const applicationError = document.querySelector("[data-application-error]");

if (applicationForm && applicationSteps.length) {
  let currentApplicationStep = 0;
  const numericSteps = applicationSteps.filter((step) => step.dataset.step !== "success");
  const totalApplicationSteps = numericSteps.length - 1;

  const updateApplicationProgress = () => {
    const visibleStep = Math.max(0, currentApplicationStep);
    const progress = totalApplicationSteps ? (visibleStep / totalApplicationSteps) * 100 : 0;
    if (applicationCounter) {
      applicationCounter.textContent = `${String(visibleStep).padStart(2, "0")} / ${String(totalApplicationSteps).padStart(2, "0")}`;
    }
    if (applicationProgress) applicationProgress.style.width = `${Math.min(100, progress)}%`;
  };

  const showApplicationStep = (index) => {
    currentApplicationStep = index;
    applicationSteps.forEach((step) => {
      step.classList.toggle("is-active", Number(step.dataset.step) === index);
      step.classList.remove("has-error");
    });
    if (applicationError) applicationError.textContent = "";
    updateApplicationProgress();
    const activePanel = applicationSteps.find((step) => Number(step.dataset.step) === index);
    const activeHeading = activePanel?.querySelector("h1, h2");
    if (activeHeading) activeHeading.setAttribute("tabindex", "-1");
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      activeHeading?.focus({ preventScroll: true });
    });
  };

  const showApplicationSuccess = () => {
    applicationSteps.forEach((step) => step.classList.toggle("is-active", step.dataset.step === "success"));
    if (applicationCounter) applicationCounter.textContent = "09 / 09";
    if (applicationProgress) applicationProgress.style.width = "100%";
  };

  const getCurrentApplicationPanel = () => applicationSteps.find((step) => Number(step.dataset.step) === currentApplicationStep);

  const validateApplicationStep = () => {
    const panel = getCurrentApplicationPanel();
    if (!panel) return true;
    const invalidGroup = [...panel.querySelectorAll("[data-required-group]")].find((group) => {
      return !group.querySelector("input:checked");
    });
    if (invalidGroup) {
      panel.classList.add("has-error");
      invalidGroup.classList.add("has-error");
      if (applicationError) applicationError.textContent = "Selecione pelo menos uma opção para continuar.";
      invalidGroup.querySelector("input")?.focus({ preventScroll: true });
      return false;
    }
    const fields = [...panel.querySelectorAll("input, textarea, select")];
    const invalid = fields.find((field) => !field.checkValidity());
    if (!invalid) return true;

    panel.classList.add("has-error");
    if (applicationError) applicationError.textContent = "Preencha esta etapa para continuar.";
    invalid.focus({ preventScroll: true });
    invalid.reportValidity();
    return false;
  };

  applicationForm.querySelectorAll(".application-next").forEach((button) => {
    button.addEventListener("click", () => {
      if (currentApplicationStep > 0 && !validateApplicationStep()) return;
      showApplicationStep(Math.min(totalApplicationSteps, currentApplicationStep + 1));
    });
  });

  applicationForm.querySelectorAll(".application-prev").forEach((button) => {
    button.addEventListener("click", () => {
      showApplicationStep(Math.max(0, currentApplicationStep - 1));
    });
  });

  applicationForm.querySelectorAll(".application-options input").forEach((input) => {
    input.addEventListener("change", () => {
      const panel = input.closest(".application-step");
      panel?.classList.remove("has-error");
      input.closest("[data-required-group]")?.classList.remove("has-error");
      if (applicationError) applicationError.textContent = "";
    });
  });

  applicationForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (currentApplicationStep < totalApplicationSteps) {
      if (!validateApplicationStep()) return;
      showApplicationStep(Math.min(totalApplicationSteps, currentApplicationStep + 1));
      return;
    }

    if (!validateApplicationStep()) return;

    const submitButton = applicationForm.querySelector('button[type="submit"]');
    const formData = new FormData(applicationForm);
    const payload = Object.fromEntries(formData.entries());
    payload.main_challenge = formData.getAll("main_challenge").join(", ");
    payload.project_need = formData.getAll("project_need").join(", ");
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Enviando...";
    }
    if (applicationError) applicationError.textContent = "";

    try {
      const response = await fetch("/.netlify/functions/submit-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Application submit failed");
      applicationForm.reset();
      showApplicationSuccess();
    } catch (error) {
      if (applicationError) {
        applicationError.textContent = "Não foi possível enviar sua aplicação agora. Tente novamente em alguns instantes.";
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Enviar aplicação";
      }
    }
  });

  showApplicationStep(0);
}

const editorialHero = document.querySelector("[data-hero-motion]");

function updateEditorialHero() {
  if (!editorialHero) return;
  const rect = editorialHero.getBoundingClientRect();
  const progress = Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height * 0.72)));
  editorialHero.style.setProperty("--hero-shift-a", `${progress * -26}px`);
  editorialHero.style.setProperty("--hero-shift-b", `${progress * 18}px`);
  editorialHero.style.setProperty("--hero-fade", `${1 - progress * 0.28}`);
}

window.addEventListener("scroll", updateEditorialHero, { passive: true });
window.addEventListener("resize", updateEditorialHero);
updateEditorialHero();

document.querySelectorAll(".word-reveal h1:not([data-type-hero]), .word-reveal h2:not([data-type-hero])").forEach((heading) => {
  if (heading.dataset.wordsReady) return;
  heading.dataset.wordsReady = "true";
  const nodes = [...heading.childNodes];
  heading.innerHTML = "";
  nodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          heading.append(document.createTextNode(part));
          return;
        }
        const span = document.createElement("span");
        span.textContent = part;
        heading.append(span);
      });
      return;
    }
    heading.append(node);
  });
});

const lineObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle("is-drawn", entry.isIntersecting);
    });
  },
  { threshold: 0.28 }
);

document.querySelectorAll(".draw-line, .formula-steps, [data-line-section]").forEach((element) => lineObserver.observe(element));

const smartCursor = document.createElement("div");
smartCursor.className = "smart-cursor";
document.body.append(smartCursor);

window.addEventListener("pointermove", (event) => {
  smartCursor.style.setProperty("--cursor-x", `${event.clientX}px`);
  smartCursor.style.setProperty("--cursor-y", `${event.clientY}px`);
});

document.querySelectorAll("a, button, .case-card, .difference-grid article").forEach((element) => {
  element.addEventListener("mouseenter", () => smartCursor.classList.add("is-active"));
  element.addEventListener("mouseleave", () => smartCursor.classList.remove("is-active"));
});

const menuButton = document.querySelector(".glass-menu-button");
const siteMenu = document.querySelector("#siteMenu");

if (menuButton && siteMenu) {
  menuButton.addEventListener("click", () => {
    const isOpen = siteMenu.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("click", (event) => {
    if (!siteMenu.classList.contains("is-open")) return;
    if (siteMenu.contains(event.target) || menuButton.contains(event.target)) return;
    siteMenu.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    siteMenu.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
  });
}

const currentPage = window.location.pathname.split("/").pop() || "index.html";
document.querySelectorAll(".glass-menu > a").forEach((link) => {
  if (link.getAttribute("href") === currentPage) link.setAttribute("aria-current", "page");
});

const siteHeader = document.querySelector(".site-header");
function updateHeaderState() {
  siteHeader?.classList.toggle("is-scrolled", window.scrollY > 18);
}
window.addEventListener("scroll", updateHeaderState, { passive: true });
updateHeaderState();

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("is-visible");
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
document.querySelectorAll(".reveal-sequence, .reveal-side").forEach((element) => revealObserver.observe(element));
document.querySelectorAll(".method-step, .word-reveal").forEach((element) => revealObserver.observe(element));

const serviceLab = document.querySelector("[data-service-lab]");

if (serviceLab) {
  serviceLab.addEventListener("pointermove", (event) => {
    const rect = serviceLab.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    serviceLab.style.setProperty("--service-x", `${x * 28}px`);
    serviceLab.style.setProperty("--service-y", `${y * 22}px`);
  });
}

document.querySelectorAll("[data-service-card]").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--card-x", `${event.clientX - rect.left}px`);
    card.style.setProperty("--card-y", `${event.clientY - rect.top}px`);
  });
});

const cultureHero = document.querySelector("[data-culture-hero]");
const cultureReact = document.querySelector("[data-culture-react]");

if (cultureHero && cultureReact) {
  cultureHero.addEventListener("mousemove", (event) => {
    const rect = cultureHero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    cultureReact.style.setProperty("--culture-x", `${x * 10}px`);
    cultureReact.style.setProperty("--culture-y", `${y * 8}px`);
  });

  cultureHero.addEventListener("mouseleave", () => {
    cultureReact.style.setProperty("--culture-x", "0px");
    cultureReact.style.setProperty("--culture-y", "0px");
  });
}

const principleObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle("is-visible", entry.isIntersecting);
    });
  },
  { rootMargin: "-22% 0px -22% 0px", threshold: 0.35 }
);

document.querySelectorAll("[data-principle-word]").forEach((element) => principleObserver.observe(element));

const workSection = document.querySelector("[data-work-words]");
const workWord = document.querySelector("[data-work-word]");
const workWords = ["compreensão.", "estratégia.", "direção.", "expressão.", "crescimento."];
let activeWorkWord = 0;

function updateWorkWord() {
  if (!workSection || !workWord) return;
  const rect = workSection.getBoundingClientRect();
  const progress = Math.max(0, Math.min(1, (window.innerHeight * 0.72 - rect.top) / Math.max(1, rect.height - window.innerHeight * 0.35)));
  const index = Math.min(workWords.length - 1, Math.floor(progress * workWords.length));
  if (index === activeWorkWord) return;
  activeWorkWord = index;
  workWord.classList.add("is-changing");
  setTimeout(() => {
    workWord.textContent = workWords[index];
    workWord.classList.remove("is-changing");
  }, 180);
}

window.addEventListener("scroll", updateWorkWord, { passive: true });
window.addEventListener("resize", updateWorkWord);
updateWorkWord();

const valueButtons = document.querySelectorAll(".values-list button");
const valueCopy = document.querySelector("#valueCopy");

valueButtons.forEach((button) => {
  const activateValue = () => {
    valueButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    if (!valueCopy) return;
    valueCopy.classList.add("is-changing");
    setTimeout(() => {
      valueCopy.textContent = button.dataset.valueCopy;
      valueCopy.classList.remove("is-changing");
    }, 150);
  };
  button.addEventListener("mouseenter", activateValue);
  button.addEventListener("click", activateValue);
  button.addEventListener("focus", activateValue);
});

const timelineScroll = document.querySelector("#timelineScroll");
const timelineItems = document.querySelectorAll("[data-timeline-item]");

const timelineObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      timelineItems.forEach((item) => item.classList.remove("is-active"));
      entry.target.classList.add("is-active");
    });
  },
  { rootMargin: "-35% 0px -45% 0px", threshold: 0.2 }
);

timelineItems.forEach((item) => timelineObserver.observe(item));

function updateTimelineProgress() {
  if (!timelineScroll) return;
  const rect = timelineScroll.getBoundingClientRect();
  const start = window.innerHeight * 0.42;
  const total = rect.height - window.innerHeight * 0.28;
  const progress = Math.max(0, Math.min(1, (start - rect.top) / Math.max(1, total)));
  timelineScroll.style.setProperty("--timeline-progress", `${progress * 100}%`);
}

window.addEventListener("scroll", updateTimelineProgress, { passive: true });
window.addEventListener("resize", updateTimelineProgress);
updateTimelineProgress();

const counters = document.querySelectorAll("[data-count]");
const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || entry.target.dataset.done) return;
      entry.target.dataset.done = "true";
      const target = Number(entry.target.dataset.count);
      const prefix = entry.target.dataset.prefix || "";
      const suffix = entry.target.dataset.suffix || "";
      const start = performance.now();
      const duration = 1400;

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(target * eased);
        entry.target.textContent = `${prefix}${value}${suffix}`;
        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
    });
  },
  { threshold: 0.45 }
);

counters.forEach((counter) => counterObserver.observe(counter));

const earthCanvas = document.querySelector("#earthCanvas");

if (earthCanvas) {
  const ctx = earthCanvas.getContext("2d");
  const accent = {
    line: "rgba(170,92,255,",
    glow: "rgba(203,84,255,",
    hot: "rgba(235,84,255,",
    blue: "rgba(112,116,255,"
  };
  const countries = [
    { name: "Brasil", lat: -14, lon: -51 },
    { name: "América Latina", lat: -18, lon: -62 },
    { name: "América do Norte", lat: 48, lon: -100 },
    { name: "Europa", lat: 50, lon: 12 }
  ];
  const worldDots = [
    { lat: 38, lon: -97 }, { lat: 23, lon: -102 }, { lat: 9, lon: -84 },
    { lat: 4, lon: -74 }, { lat: -9, lon: -75 }, { lat: -35, lon: -64 },
    { lat: -30, lon: -71 }, { lat: 40, lon: -4 }, { lat: 46, lon: 2 },
    { lat: 51, lon: 10 }, { lat: 42, lon: 12 }, { lat: 52, lon: 20 },
    { lat: 60, lon: 90 }, { lat: 39, lon: 35 }, { lat: 32, lon: 54 },
    { lat: 24, lon: 45 }, { lat: 21, lon: 78 }, { lat: 35, lon: 104 },
    { lat: 37, lon: 138 }, { lat: 16, lon: 106 }, { lat: -2, lon: 118 },
    { lat: -25, lon: 134 }, { lat: 9, lon: 8 }, { lat: 26, lon: 30 },
    { lat: 5, lon: 20 }, { lat: -2, lon: 23 }, { lat: -29, lon: 24 },
    { lat: 61, lon: -42 }, { lat: 65, lon: -18 }, { lat: -41, lon: 174 }
  ];
  const landmasses = [
    [
      { lat: 72, lon: -168 }, { lat: 66, lon: -148 }, { lat: 58, lon: -132 },
      { lat: 50, lon: -126 }, { lat: 39, lon: -122 }, { lat: 30, lon: -116 },
      { lat: 21, lon: -105 }, { lat: 18, lon: -94 }, { lat: 26, lon: -82 },
      { lat: 35, lon: -76 }, { lat: 45, lon: -62 }, { lat: 56, lon: -70 },
      { lat: 66, lon: -92 }, { lat: 72, lon: -122 }
    ],
    [
      { lat: 13, lon: -82 }, { lat: 7, lon: -74 }, { lat: 2, lon: -79 },
      { lat: -8, lon: -78 }, { lat: -18, lon: -73 }, { lat: -30, lon: -70 },
      { lat: -54, lon: -72 }, { lat: -44, lon: -62 }, { lat: -27, lon: -50 },
      { lat: -10, lon: -36 }, { lat: 2, lon: -45 }, { lat: 8, lon: -60 }
    ],
    [
      { lat: 82, lon: -74 }, { lat: 76, lon: -28 }, { lat: 66, lon: -20 },
      { lat: 60, lon: -44 }, { lat: 66, lon: -60 }
    ],
    [
      { lat: 72, lon: -11 }, { lat: 66, lon: 8 }, { lat: 58, lon: 25 },
      { lat: 48, lon: 33 }, { lat: 42, lon: 28 }, { lat: 36, lon: 18 },
      { lat: 37, lon: 2 }, { lat: 43, lon: -9 }, { lat: 54, lon: -8 },
      { lat: 61, lon: -3 }
    ],
    [
      { lat: 35, lon: -17 }, { lat: 31, lon: 8 }, { lat: 24, lon: 28 },
      { lat: 12, lon: 42 }, { lat: -3, lon: 44 }, { lat: -18, lon: 35 },
      { lat: -35, lon: 20 }, { lat: -28, lon: 13 }, { lat: -5, lon: 8 },
      { lat: 14, lon: -8 }, { lat: 27, lon: -14 }
    ],
    [
      { lat: 66, lon: 38 }, { lat: 62, lon: 72 }, { lat: 58, lon: 104 },
      { lat: 50, lon: 140 }, { lat: 35, lon: 138 }, { lat: 24, lon: 122 },
      { lat: 8, lon: 106 }, { lat: 6, lon: 78 }, { lat: 20, lon: 72 },
      { lat: 24, lon: 54 }, { lat: 38, lon: 44 }, { lat: 51, lon: 50 }
    ],
    [
      { lat: -10, lon: 112 }, { lat: -22, lon: 115 }, { lat: -39, lon: 143 },
      { lat: -27, lon: 154 }, { lat: -13, lon: 144 }
    ],
    [
      { lat: -62, lon: -160 }, { lat: -70, lon: -80 }, { lat: -68, lon: 10 },
      { lat: -72, lon: 90 }, { lat: -64, lon: 160 }, { lat: -58, lon: 40 }
    ]
  ];
  const countryBorders = [
    [{ lat: 49, lon: -124 }, { lat: 49, lon: -95 }, { lat: 46, lon: -84 }, { lat: 45, lon: -67 }],
    [{ lat: 32, lon: -117 }, { lat: 31, lon: -108 }, { lat: 29, lon: -103 }, { lat: 26, lon: -98 }],
    [{ lat: 18, lon: -95 }, { lat: 17, lon: -90 }, { lat: 15, lon: -88 }, { lat: 14, lon: -84 }],
    [{ lat: 8, lon: -78 }, { lat: 7, lon: -73 }, { lat: 4, lon: -70 }, { lat: 1, lon: -68 }],
    [{ lat: 3, lon: -73 }, { lat: -5, lon: -74 }, { lat: -12, lon: -72 }, { lat: -18, lon: -70 }],
    [{ lat: -5, lon: -66 }, { lat: -10, lon: -61 }, { lat: -16, lon: -58 }, { lat: -22, lon: -58 }],
    [{ lat: -10, lon: -50 }, { lat: -18, lon: -54 }, { lat: -26, lon: -53 }, { lat: -32, lon: -57 }],
    [{ lat: -22, lon: -68 }, { lat: -28, lon: -66 }, { lat: -36, lon: -66 }, { lat: -44, lon: -69 }],
    [{ lat: -16, lon: -69 }, { lat: -18, lon: -60 }, { lat: -23, lon: -58 }, { lat: -27, lon: -57 }],
    [{ lat: -23, lon: -58 }, { lat: -25, lon: -55 }, { lat: -27, lon: -54 }],
    [{ lat: 51, lon: -10 }, { lat: 50, lon: 2 }, { lat: 52, lon: 10 }, { lat: 55, lon: 20 }],
    [{ lat: 44, lon: -9 }, { lat: 43, lon: 2 }, { lat: 44, lon: 12 }, { lat: 46, lon: 18 }],
    [{ lat: 50, lon: 2 }, { lat: 50.5, lon: 4.5 }, { lat: 51, lon: 6 }],
    [{ lat: 42, lon: -8 }, { lat: 41, lon: 2 }, { lat: 39, lon: 9 }, { lat: 38, lon: 16 }],
    [{ lat: 52, lon: 14 }, { lat: 49, lon: 18 }, { lat: 47, lon: 24 }, { lat: 45, lon: 29 }],
    [{ lat: 31, lon: -8 }, { lat: 28, lon: 2 }, { lat: 25, lon: 13 }, { lat: 22, lon: 24 }, { lat: 22, lon: 34 }],
    [{ lat: 14, lon: -16 }, { lat: 13, lon: -3 }, { lat: 12, lon: 10 }, { lat: 12, lon: 24 }, { lat: 10, lon: 38 }],
    [{ lat: 4, lon: 8 }, { lat: 3, lon: 18 }, { lat: 1, lon: 30 }, { lat: -1, lon: 42 }],
    [{ lat: -5, lon: 12 }, { lat: -8, lon: 22 }, { lat: -10, lon: 32 }, { lat: -13, lon: 40 }],
    [{ lat: -18, lon: 12 }, { lat: -19, lon: 24 }, { lat: -22, lon: 32 }],
    [{ lat: -29, lon: 17 }, { lat: -25, lon: 25 }, { lat: -26, lon: 32 }],
    [{ lat: 38, lon: 44 }, { lat: 34, lon: 52 }, { lat: 31, lon: 62 }, { lat: 29, lon: 70 }],
    [{ lat: 50, lon: 50 }, { lat: 48, lon: 70 }, { lat: 47, lon: 90 }, { lat: 49, lon: 112 }, { lat: 51, lon: 128 }],
    [{ lat: 35, lon: 74 }, { lat: 30, lon: 82 }, { lat: 27, lon: 91 }, { lat: 24, lon: 100 }],
    [{ lat: 42, lon: 74 }, { lat: 39, lon: 92 }, { lat: 40, lon: 110 }, { lat: 44, lon: 124 }],
    [{ lat: 23, lon: 73 }, { lat: 20, lon: 84 }, { lat: 18, lon: 94 }],
    [{ lat: 16, lon: 102 }, { lat: 14, lon: 108 }, { lat: 12, lon: 118 }],
    [{ lat: -13, lon: 130 }, { lat: -24, lon: 133 }, { lat: -32, lon: 139 }],
    [{ lat: -25, lon: 116 }, { lat: -27, lon: 130 }, { lat: -27, lon: 146 }]
  ];
  let rotation = -0.8;
  let tilt = -0.12;
  let velocity = 0.0016;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;

  function project(lat, lon, radius, center) {
    const phi = (lat * Math.PI) / 180;
    const theta = (lon * Math.PI) / 180 + rotation;
    const cosPhi = Math.cos(phi);
    let x = cosPhi * Math.sin(theta);
    let y = Math.sin(phi);
    let z = cosPhi * Math.cos(theta);

    const tiltedY = y * Math.cos(tilt) - z * Math.sin(tilt);
    const tiltedZ = y * Math.sin(tilt) + z * Math.cos(tilt);

    return {
      x: center + x * radius,
      y: center - tiltedY * radius,
      z: tiltedZ
    };
  }

  function drawPath(points, radius, center) {
    ctx.beginPath();
    let started = false;
    points.forEach((point) => {
      const projected = project(point.lat, point.lon, radius, center);
      if (projected.z < -0.22) {
        started = false;
        return;
      }
      if (!started) {
        ctx.moveTo(projected.x, projected.y);
        started = true;
      } else {
        ctx.lineTo(projected.x, projected.y);
      }
    });
    ctx.stroke();
  }

  function drawLand(points, radius, center) {
    ctx.beginPath();
    let hasPoint = false;
    const detailed = points.flatMap((point, index) => {
      const next = points[(index + 1) % points.length];
      const nudge = index % 2 === 0 ? 1 : -1;
      return [
        point,
        {
          lat: (point.lat + next.lat) / 2 + nudge * 1.25,
          lon: (point.lon + next.lon) / 2 - nudge * 1.7
        }
      ];
    });

    detailed.forEach((point) => {
      const projected = project(point.lat, point.lon, radius, center);
      if (projected.z < -0.1) return;
      if (!hasPoint) {
        ctx.moveTo(projected.x, projected.y);
        hasPoint = true;
      } else {
        ctx.lineTo(projected.x, projected.y);
      }
    });
    if (!hasPoint) return;
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  function drawPill(text, x, y, align = "left") {
    ctx.font = "600 15px Montserrat, Arial, sans-serif";
    const paddingX = 15;
    const width = ctx.measureText(text).width + paddingX * 2;
    const height = 32;
    const left = align === "right" ? x - width : x;
    const radius = 16;

    ctx.beginPath();
    ctx.moveTo(left + radius, y);
    ctx.lineTo(left + width - radius, y);
    ctx.quadraticCurveTo(left + width, y, left + width, y + radius);
    ctx.lineTo(left + width, y + height - radius);
    ctx.quadraticCurveTo(left + width, y + height, left + width - radius, y + height);
    ctx.lineTo(left + radius, y + height);
    ctx.quadraticCurveTo(left, y + height, left, y + height - radius);
    ctx.lineTo(left, y + radius);
    ctx.quadraticCurveTo(left, y, left + radius, y);
    ctx.fillStyle = "rgba(8,8,8,0.82)";
    ctx.strokeStyle = `${accent.line}0.52)`;
    ctx.lineWidth = 1;
    ctx.shadowColor = `${accent.glow}0.26)`;
    ctx.shadowBlur = 18;
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(246,244,239,0.86)";
    ctx.fillText(text, left + paddingX, y + 21);
  }

  function drawEarth() {
    const size = earthCanvas.width;
    const center = size / 2;
    const radius = size * 0.41;
    ctx.clearRect(0, 0, size, size);

    const glow = ctx.createRadialGradient(center, center, radius * 0.25, center, center, radius * 1.3);
    glow.addColorStop(0, "rgba(255,255,255,0.055)");
    glow.addColorStop(0.72, "rgba(255,255,255,0.02)");
    glow.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(center, center, radius * 1.25, 0, Math.PI * 2);
    ctx.fill();

    const sphere = ctx.createRadialGradient(center - radius * 0.34, center - radius * 0.38, radius * 0.04, center, center, radius);
    sphere.addColorStop(0, "rgba(170,170,166,0.36)");
    sphere.addColorStop(0.36, "rgba(86,86,84,0.38)");
    sphere.addColorStop(0.74, "rgba(34,34,34,0.56)");
    sphere.addColorStop(1, "rgba(5,5,5,0.88)");
    ctx.fillStyle = sphere;
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.clip();

    ctx.fillStyle = "rgba(178,178,172,0.18)";
    ctx.strokeStyle = "rgba(255,255,255,0.11)";
    ctx.lineWidth = 1;
    landmasses.forEach((shape) => drawLand(shape, radius, center));

    ctx.strokeStyle = "rgba(255,255,255,0.13)";
    ctx.lineWidth = 0.72;
    countryBorders.forEach((border) => drawPath(border, radius, center));

    ctx.fillStyle = "rgba(255,255,255,0.16)";
    [
      { lat: 21, lon: -78 }, { lat: 18, lon: -66 }, { lat: 19, lon: -72 },
      { lat: 64, lon: -18 }, { lat: 55, lon: -4 }, { lat: 40, lon: 14 },
      { lat: 35, lon: 139 }, { lat: 23, lon: 121 }, { lat: -41, lon: 174 },
      { lat: -18, lon: 47 }, { lat: 7, lon: 81 }, { lat: 1, lon: 104 }
    ].forEach((island) => {
      const point = project(island.lat, island.lon, radius, center);
      if (point.z < -0.02) return;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3.2, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.strokeStyle = "rgba(255,255,255,0.045)";
    ctx.lineWidth = 0.75;
    for (let lat = -60; lat <= 60; lat += 20) {
      const points = [];
      for (let lon = -180; lon <= 180; lon += 4) points.push({ lat, lon });
      drawPath(points, radius, center);
    }

    for (let lon = -150; lon <= 180; lon += 30) {
      const points = [];
      for (let lat = -86; lat <= 86; lat += 3) points.push({ lat, lon });
      drawPath(points, radius, center);
    }

    worldDots.forEach((dot) => {
      const point = project(dot.lat, dot.lon, radius, center);
      if (point.z < -0.02) return;
      const alpha = 0.12 + Math.min(point.z, 1) * 0.16;
      ctx.fillStyle = `rgba(246,244,239,${alpha})`;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 2.4, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();

    const shade = ctx.createRadialGradient(center - radius * 0.32, center - radius * 0.35, radius * 0.2, center, center, radius);
    shade.addColorStop(0, "rgba(255,255,255,0)");
    shade.addColorStop(0.62, "rgba(0,0,0,0.06)");
    shade.addColorStop(1, "rgba(0,0,0,0.58)");
    ctx.fillStyle = shade;
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.clip();
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 0.65;
    for (let lon = -175; lon <= 175; lon += 17.5) {
      const points = [];
      for (let lat = -70; lat <= 70; lat += 7) points.push({ lat, lon: lon + Math.sin(lat * 0.12) * 2 });
      drawPath(points, radius, center);
    }
    ctx.restore();

    countries.forEach((country) => {
      const point = project(country.lat, country.lon, radius, center);
      if (point.z < -0.02) return;
      const alpha = 0.58 + Math.min(point.z, 1) * 0.4;
      ctx.strokeStyle = `${accent.line}${alpha * 0.62})`;
      ctx.setLineDash([2, 5]);
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
      ctx.setLineDash([]);
      const pointGradient = ctx.createRadialGradient(point.x - 2, point.y - 2, 1, point.x, point.y, 12);
      pointGradient.addColorStop(0, "rgba(255,255,255,0.96)");
      pointGradient.addColorStop(0.38, `${accent.hot}${alpha})`);
      pointGradient.addColorStop(1, `${accent.blue}0)`);
      ctx.fillStyle = pointGradient;
      ctx.shadowColor = `${accent.glow}0.78)`;
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      drawPill(country.name, point.x + 16, point.y - 16, point.x > center + radius * 0.58 ? "right" : "left");
    });

    if (!dragging) rotation += velocity;
    requestAnimationFrame(drawEarth);
  }

  earthCanvas.addEventListener("pointerdown", (event) => {
    dragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
    earthCanvas.setPointerCapture(event.pointerId);
  });

  earthCanvas.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    rotation += dx * 0.006;
    tilt = Math.max(-0.75, Math.min(0.75, tilt + dy * 0.004));
    lastX = event.clientX;
    lastY = event.clientY;
  });

  earthCanvas.addEventListener("pointerup", () => {
    dragging = false;
  });

  earthCanvas.addEventListener("pointercancel", () => {
    dragging = false;
  });

  drawEarth();
}

const aiAnswers = {
  position:
    "Uma hipótese provável é desalinhamento entre promessa, percepção e mercado. Isso costuma aparecer quando a marca precisa explicar demais, disputa por preço ou não consegue ser lembrada por uma ideia clara. Antes de mudar a comunicação, vale investigar: quem compra hoje, por que escolhe você e qual percepção deveria permanecer depois do primeiro contato.",
  value:
    "Valor percebido não nasce do que a empresa entrega, mas da forma como essa entrega é compreendida. Linguagem, prova, experiência, autoridade, ritmo visual e consistência precisam sustentar a mesma percepção. A pergunta central é: o mercado entende valor ou apenas compara preço?",
  sales:
    "Quando as vendas não crescem, nem sempre o problema está em tráfego ou oferta. Um padrão comum é marca, marketing e experiência contando histórias diferentes. Antes de aumentar volume, vale revisar clareza de posicionamento, confiança percebida e jornada de decisão.",
  identity:
    "Trocar identidade visual antes de entender posicionamento costuma tratar o sintoma, não a causa. Design é consequência. Primeiro investigamos significado, público, mercado, promessa e percepção desejada. Depois a forma visual pode nascer com mais precisão."
};

const aiOutput = document.querySelector("#aiOutput");
const aiForm = document.querySelector(".ai-chat-input");
const aiInput = aiForm?.querySelector("input");

function appendAiMessage(role, text) {
  if (!aiOutput) return null;
  const message = document.createElement("p");
  message.className = `ai-message ai-message-${role}`;
  message.textContent = text;
  aiOutput.append(message);
  aiOutput.scrollTop = aiOutput.scrollHeight;
  return message;
}

function buildStrategicReply(message) {
  const text = message.toLowerCase();
  const questions = "Para analisar melhor, eu começaria por três perguntas: qual é o segmento da empresa, como os clientes chegam hoje e o que você sente que o mercado ainda não percebe sobre a marca?";

  if (text.includes("preço") || text.includes("barato") || text.includes("valor")) {
    return `Existe um sinal de percepção de valor. Isso normalmente acontece quando a marca comunica entrega, mas não constrói significado suficiente para justificar escolha. ${questions}`;
  }

  if (text.includes("instagram") || text.includes("conteúdo") || text.includes("post") || text.includes("social")) {
    return `O Instagram pode ser apenas a superfície do problema. Vale investigar se a narrativa, a estética e a frequência estão sustentando uma posição clara ou apenas ocupando espaço. ${questions}`;
  }

  if (text.includes("logo") || text.includes("identidade") || text.includes("visual") || text.includes("design")) {
    return `A forma visual deve nascer de uma decisão estratégica. Antes de alterar logo, cores ou tipografia, vale entender qual percepção a marca precisa construir e quais sinais visuais hoje estão enfraquecendo essa leitura. ${questions}`;
  }

  if (text.includes("venda") || text.includes("cliente") || text.includes("crescer") || text.includes("crescimento")) {
    return `Crescimento exige consistência entre posicionamento, oferta, experiência e comunicação. Quando uma dessas camadas não sustenta a outra, a marca pode até aparecer mais, mas não necessariamente se tornar mais desejada. ${questions}`;
  }

  return `Uma leitura inicial: esse tema precisa ser analisado pela causa, não apenas pelo sintoma. Na Revee, observamos primeiro significado, posicionamento, expressão e sistema. ${questions}`;
}

document.querySelectorAll("[data-answer]").forEach((button) => {
  button.addEventListener("click", async () => {
    const answer = aiAnswers[button.dataset.answer];
    if (!aiOutput || !answer) return;
    appendAiMessage("user", button.textContent.trim());
    const thinking = appendAiMessage("assistant", "Analisando o sinal...");
    await wait(360);
    if (thinking) thinking.textContent = answer;
    aiOutput.scrollTop = aiOutput.scrollHeight;
  });
});

if (aiForm && aiOutput && aiInput) {
  aiForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = aiInput.value.trim();
    if (!message) return;
    appendAiMessage("user", message);
    const thinking = appendAiMessage("assistant", "Analisando o sinal por trás da pergunta...");
    await wait(420);
    if (thinking) thinking.textContent = buildStrategicReply(message);
    aiInput.value = "";
    aiOutput.scrollTop = aiOutput.scrollHeight;
  });
}

document.querySelectorAll(".service-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const row = button.closest(".service-row");
    document.querySelectorAll(".service-row").forEach((item) => {
      if (item !== row) item.classList.remove("is-open");
    });
    row.classList.toggle("is-open");
  });
});

const caseDetails = {
  moda: {
    category: "Identidade institucional / COP30",
    title: "Instituto Moda Regenerativa",
    challenge: "Organizar uma narrativa institucional capaz de comunicar impacto, moda regenerativa e relevância cultural em um contexto global.",
    strategy: "Estruturar posicionamento, linguagem e presença visual com foco em clareza, autoridade e leitura internacional.",
    delivery: "Sistema de comunicação institucional, direção visual e arquitetura de mensagens para apresentação pública.",
    result: "Uma marca com mais consistência, legitimidade e força para ocupar conversas estratégicas sobre futuro, cultura e regeneração."
  },
  beleza: {
    category: "Branding / Packaging",
    title: "Beleza Wellness",
    challenge: "Elevar percepção de valor em uma marca de bem-estar com potencial de produto e experiência.",
    strategy: "Criar uma identidade mais sensorial, premium e consistente entre marca, embalagem e comunicação.",
    delivery: "Branding, sistema visual, embalagem e direção de linguagem.",
    result: "Uma presença mais desejável, clara e preparada para competir por percepção, não apenas por preço."
  },
  calari: {
    category: "Experiência digital",
    title: "Calari",
    challenge: "Transformar presença digital em uma experiência mais elegante, funcional e alinhada ao posicionamento da marca.",
    strategy: "Desenhar uma jornada visual com foco em navegação, desejo e conversão.",
    delivery: "Interface, direção visual digital e estrutura de conteúdo.",
    result: "Um ambiente digital mais sofisticado, memorável e orientado à geração de oportunidades."
  },
  carq: {
    category: "Identidade visual / Arquitetura",
    title: "C.ARQ",
    challenge: "Construir uma identidade para um escritório de arquitetura com estética precisa, atemporal e institucional.",
    strategy: "Traduzir arquitetura, conexão e refinamento em um sistema visual minimalista e escalável.",
    delivery: "Identidade visual, aplicações institucionais, direção visual e materiais de apresentação.",
    result: "Uma marca com presença premium, maior clareza de atuação e linguagem visual coerente com o mercado de arquitetura."
  },
  maris: {
    category: "Direção editorial",
    title: "Maris Tavares",
    challenge: "Organizar uma presença visual autoral, com direção estética consistente e linguagem editorial.",
    strategy: "Criar uma narrativa de imagem que conecte autoridade, sensibilidade e posicionamento pessoal.",
    delivery: "Direção editorial, linguagem visual e estrutura de comunicação.",
    result: "Uma presença mais madura, reconhecível e preparada para sustentar autoridade."
  },
  amarante: {
    category: "Experiência digital / Reposicionamento",
    title: "Amarante do Brasil",
    challenge: "Atualizar a experiência digital e reposicionar a comunicação para um público mais exigente.",
    strategy: "Refinar narrativa, jornada e expressão visual para aumentar confiança e percepção de valor.",
    delivery: "Experiência digital, arquitetura de conteúdo e direção estratégica.",
    result: "Uma presença mais clara, institucional e conectada ao crescimento da empresa."
  }
};

const caseModal = document.querySelector(".case-modal");
const caseModalClose = document.querySelector(".case-modal-close");

document.querySelectorAll(".case-card").forEach((card) => {
  const media = card.querySelector(":scope > img, :scope > video");
  const video = media?.tagName === "VIDEO" ? media : null;

  if (video) {
    video.play().catch(() => {});
  }

  card.addEventListener("mouseenter", () => {
    if (!video) return;
    video.play().catch(() => {});
  });

  card.addEventListener("mousemove", (event) => {
    if (!media) return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    media.style.transform = `scale(1.06) translate(${x * 16}px, ${y * 16}px)`;
  });

  card.addEventListener("mouseleave", () => {
    if (media) media.style.transform = "scale(1) translate(0, 0)";
  });

  card.addEventListener("click", () => {
    const data = caseDetails[card.dataset.case];
    if (!caseModal || !data) return;
    document.querySelector("#caseModalCategory").textContent = data.category;
    document.querySelector("#caseModalTitle").textContent = data.title;
    document.querySelector("#caseChallenge").textContent = data.challenge;
    document.querySelector("#caseStrategy").textContent = data.strategy;
    document.querySelector("#caseDelivery").textContent = data.delivery;
    document.querySelector("#caseResult").textContent = data.result;
    caseModal.classList.add("is-open");
    caseModal.setAttribute("aria-hidden", "false");
  });
});

function closeCaseModal() {
  if (!caseModal) return;
  caseModal.classList.remove("is-open");
  caseModal.setAttribute("aria-hidden", "true");
}

if (caseModalClose) caseModalClose.addEventListener("click", closeCaseModal);

if (caseModal) {
  caseModal.addEventListener("click", (event) => {
    if (event.target === caseModal) closeCaseModal();
  });
}

const aiWidget = document.querySelector(".ai-widget");
const aiOrb = document.querySelector(".ai-orb");
const aiClose = document.querySelector(".ai-close");

if (aiWidget) {
  aiWidget.classList.remove("is-open");
}

if (aiWidget && aiOrb) {
  aiOrb.addEventListener("click", () => {
    const isOpen = aiWidget.classList.toggle("is-open");
    aiOrb.setAttribute("aria-expanded", String(isOpen));
  });
}

if (aiWidget && aiClose) {
  aiClose.addEventListener("click", () => {
    aiWidget.classList.remove("is-open");
    if (aiOrb) aiOrb.setAttribute("aria-expanded", "false");
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || !aiWidget?.classList.contains("is-open")) return;
  aiWidget.classList.remove("is-open");
  aiOrb?.setAttribute("aria-expanded", "false");
  aiOrb?.focus();
});

document.querySelectorAll(".accordion-item").forEach((item) => {
  item.addEventListener("click", () => {
    document.querySelectorAll(".accordion-item").forEach((other) => {
      if (other !== item) other.classList.remove("is-open");
    });
    item.classList.toggle("is-open");
  });
});
