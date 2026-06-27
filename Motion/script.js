class CARQMotionIntro {
  constructor(root, options = {}) {
    this.root = root;
    this.options = {
      symbolSrc: root.dataset.symbolSrc,
      wordmarkSrc: root.dataset.wordmarkSrc,
      ...options,
    };

    this.stage = root.querySelector(".carq-motion__stage");
    this.origin = root.querySelector(".carq-motion__origin");
    this.symbolSlot = root.querySelector("[data-symbol]");
    this.wordmarkSlot = root.querySelector("[data-wordmark]");
    this.guides = root.querySelector("[data-guides]");
    this.symbolGuides = root.querySelector("[data-symbol-guides]");
    this.wordmarkGuides = root.querySelector("[data-wordmark-guides]");
    this.replayButton = root.querySelector("[data-replay]");
    this.timeline = null;
    this.nativeAnimations = [];
    this.nativeTimers = [];
  }

  async init() {
    await Promise.all([
      this.injectSvg(this.options.symbolSrc, this.symbolSlot, "C.ARQ symbol", {
        fallbackTemplate: "carq-symbol-template",
      }),
      this.injectSvg(this.options.wordmarkSrc, this.wordmarkSlot, "C.ARQ wordmark", {
        keepMainGroupOnly: true,
        fallbackTemplate: "carq-wordmark-template",
      }),
    ]);

    this.symbolLines = this.prepareLines(this.symbolSlot);
    this.wordmarkLines = this.prepareLines(this.wordmarkSlot);
    this.guideLines = this.prepareGuideLines(this.guides);
    this.symbolGuideLines = this.prepareGuideLines(this.symbolGuides);
    this.wordmarkGuideLines = this.prepareGuideLines(this.wordmarkGuides);
    this.guideNodes = [...this.guides.querySelectorAll(".carq-motion__guide-node")];
    this.symbolGuideNodes = [...this.symbolGuides.querySelectorAll(".carq-motion__guide-node")];
    this.wordmarkGuideNodes = [...this.wordmarkGuides.querySelectorAll(".carq-motion__guide-node")];
    this.bindEvents();
    this.play();
  }

  async injectSvg(src, target, label, options = {}) {
    try {
      const response = await fetch(src);

      if (!response.ok) {
        throw new Error(`Nao foi possivel carregar ${src}`);
      }

      target.innerHTML = await response.text();
    } catch (error) {
      const template = document.getElementById(options.fallbackTemplate);

      if (!template) {
        throw error;
      }

      target.innerHTML = template.innerHTML;
    }

    const svg = target.querySelector("svg");
    svg.removeAttribute("width");
    svg.removeAttribute("height");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", label);
    svg.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));

    if (options.keepMainGroupOnly) {
      const groups = [...svg.children].filter((node) => node.tagName.toLowerCase() === "g");
      const mainGroup = groups[groups.length - 1];
      groups.forEach((group) => {
        if (group !== mainGroup) {
          group.remove();
        }
      });
    }
  }

  prepareLines(scope) {
    const lines = [...scope.querySelectorAll("path, polygon, circle, rect, line, polyline")];

    lines.forEach((line) => {
      const length = this.getLineLength(line);
      line.style.strokeDasharray = length;
      line.style.strokeDashoffset = length;
      line.style.strokeOpacity = 1;
      line.style.fillOpacity = 0;
      line.style.opacity = 1;
    });

    return lines;
  }

  prepareGuideLines(scope) {
    const lines = [...scope.querySelectorAll(".carq-motion__guide-line")];

    lines.forEach((line) => {
      const length = this.getLineLength(line);
      const styleDash = getComputedStyle(line).strokeDasharray;
      const hasCssDash = styleDash && styleDash !== "none";
      line.dataset.dash = line.classList.contains("carq-motion__guide-line--solid") || !hasCssDash
        ? String(length)
        : styleDash;
      line.dataset.length = String(length);
      line.style.strokeDasharray = length;
      line.style.strokeDashoffset = length;
    });

    return lines;
  }

  getLineLength(line) {
    if (typeof line.getTotalLength === "function") {
      return Math.max(line.getTotalLength(), 1);
    }

    const box = line.getBBox();
    return Math.max((box.width + box.height) * 2, 1);
  }

  play() {
    if (!window.gsap) {
      this.playNative();
      return;
    }

    this.cancelNative();

    if (this.timeline) {
      this.timeline.kill();
    }

    this.root.classList.remove("is-complete");
    const wordmarkY = this.getWordmarkOffset();
    gsap.set(this.origin, { scale: 0, autoAlpha: 1 });
    gsap.set(this.symbolSlot, {
      autoAlpha: 0,
      scale: 0.08,
      rotation: 0.001,
      transformOrigin: "50% 50%",
    });
    gsap.set(this.wordmarkSlot, {
      autoAlpha: 0,
      scale: 0.985,
      xPercent: -50,
      yPercent: -50,
      y: wordmarkY,
      transformOrigin: "50% 50%",
    });
    gsap.set([...this.symbolLines, ...this.wordmarkLines], {
      strokeDashoffset: (index, line) => line.style.strokeDasharray,
      strokeOpacity: 1,
      fillOpacity: 0,
    });
    gsap.set(this.guides, { autoAlpha: 0 });
    gsap.set([this.symbolGuides, this.wordmarkGuides], { autoAlpha: 0 });
    gsap.set(this.guideLines, {
      strokeDasharray: (index, line) => line.dataset.length,
      strokeDashoffset: (index, line) => line.dataset.length,
    });
    gsap.set(this.guideNodes, { autoAlpha: 0, scale: 0.4, transformOrigin: "50% 50%" });

    this.timeline = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      onComplete: () => this.root.classList.add("is-complete"),
    });

    this.timeline
      .to(this.origin, {
        scale: 1,
        duration: 0.55,
        ease: "power3.out",
      })
      .to(this.guides, {
        autoAlpha: 1,
        duration: 0.3,
        ease: "sine.out",
      }, 0.22)
      .to(this.symbolGuides, {
        autoAlpha: 1,
        duration: 0.4,
        ease: "sine.out",
      }, 0.24)
      .to(this.symbolGuideLines, {
        strokeDashoffset: 0,
        duration: 1.25,
        stagger: {
          each: 0.04,
          from: "center",
        },
        ease: "power2.inOut",
        onComplete: () => this.restoreGuideDashes(this.symbolGuideLines),
      }, 0.34)
      .to(this.symbolGuideNodes, {
        autoAlpha: 0.85,
        scale: 1,
        duration: 0.28,
        stagger: {
          each: 0.035,
          from: "center",
        },
        ease: "power2.out",
      }, 0.88)
      .to(this.origin, {
        scale: 0.62,
        duration: 0.55,
        ease: "sine.inOut",
      })
      .to(this.symbolSlot, {
        autoAlpha: 1,
        scale: 1,
        duration: 1.05,
        ease: "power3.out",
      }, 0.62)
      .to(this.symbolLines, {
        strokeDashoffset: 0,
        duration: 1.85,
        stagger: {
          each: 0.07,
          from: "center",
        },
        ease: "power2.inOut",
      }, 0.78)
      .to(this.symbolLines, {
        fillOpacity: 1,
        strokeOpacity: 0.42,
        duration: 0.7,
        stagger: {
          each: 0.04,
          from: "center",
        },
        ease: "sine.inOut",
      }, 2.28)
      .to([this.symbolGuideLines, this.symbolGuideNodes], {
        autoAlpha: 0,
        duration: 0.58,
        ease: "sine.inOut",
      }, 2.48)
      .to(this.origin, {
        autoAlpha: 0,
        scale: 0.18,
        duration: 0.65,
        ease: "power2.in",
      }, 1.2)
      .to({}, { duration: 0.9 })
      .to(this.symbolLines, {
        fillOpacity: 0,
        strokeOpacity: 1,
        duration: 0.42,
        ease: "sine.inOut",
      })
      .to(this.symbolLines, {
        strokeDashoffset: (index, line) => line.style.strokeDasharray,
        duration: 0.98,
        stagger: {
          each: 0.045,
          from: "edges",
        },
        ease: "power3.inOut",
      })
      .to(this.symbolSlot, {
        autoAlpha: 0,
        scale: 0.96,
        duration: 0.72,
        ease: "sine.inOut",
      }, "<0.15")
      .to(this.wordmarkGuides, {
        autoAlpha: 1,
        duration: 0.24,
        ease: "sine.out",
      }, "<0.12")
      .to(this.wordmarkGuideLines, {
        strokeDashoffset: 0,
        duration: 0.95,
        stagger: {
          each: 0.035,
          from: "start",
        },
        ease: "power2.inOut",
        onComplete: () => this.restoreGuideDashes(this.wordmarkGuideLines),
      }, "<0.02")
      .to(this.wordmarkGuideNodes, {
        autoAlpha: 0.9,
        scale: 1,
        duration: 0.25,
        stagger: 0.03,
        ease: "power2.out",
      }, "<0.44")
      .to(this.wordmarkSlot, {
        autoAlpha: 1,
        scale: 1,
        duration: 0.55,
        ease: "sine.out",
      }, "<0.34")
      .to(this.wordmarkLines, {
        strokeDashoffset: 0,
        duration: 1.8,
        stagger: {
          each: 0.035,
          from: "start",
        },
        ease: "power2.inOut",
      }, "<0.02")
      .to(this.wordmarkLines, {
        fillOpacity: 1,
        strokeOpacity: 0,
        duration: 0.86,
        stagger: {
          each: 0.025,
          from: "start",
        },
        ease: "sine.inOut",
      }, "-=0.48")
      .to([this.wordmarkGuideLines, this.wordmarkGuideNodes], {
        autoAlpha: 0,
        duration: 0.55,
        ease: "sine.inOut",
      }, "-=0.2")
      .to(this.guides, {
        autoAlpha: 0,
        duration: 0.2,
        ease: "sine.out",
      }, "<0.2")
      .set(this.symbolSlot, { autoAlpha: 0 })
      .set(this.symbolLines, {
        strokeDashoffset: (index, line) => line.style.strokeDasharray,
        fillOpacity: 0,
        strokeOpacity: 1,
      });
  }

  bindEvents() {
    this.replayButton?.addEventListener("click", () => this.play());
  }

  restoreGuideDashes(lines) {
    lines.forEach((line) => {
      line.style.strokeDasharray = line.dataset.dash;
      line.style.strokeDashoffset = "0";
    });
  }

  playNative() {
    if (this.timeline) {
      this.timeline.kill();
    }

    this.cancelNative();
    this.root.classList.remove("is-complete");
    this.setBaseState();
    const wordmarkTransform = this.getWordmarkTransform();

    this.nativeAnimate(this.guides, [
      { opacity: 0, visibility: "hidden" },
      { opacity: 1, visibility: "visible" },
    ], 220, 300, "ease-out");

    this.nativeAnimate(this.symbolGuides, [
      { opacity: 0, visibility: "hidden" },
      { opacity: 1, visibility: "visible" },
    ], 240, 400, "ease-out");

    this.animateGuideDashNative(this.symbolGuideLines, 340, 1250, 40, "center");
    this.animateNodesNative(this.symbolGuideNodes, 880, 280, 35, "center", 0.85);

    this.nativeAnimate(this.origin, [
      { opacity: 1, transform: "translate(-50%, -50%) scale(0)" },
      { opacity: 1, transform: "translate(-50%, -50%) scale(1)" },
    ], 0, 550, "cubic-bezier(0.22, 1, 0.36, 1)");

    this.nativeAnimate(this.origin, [
      { opacity: 1, transform: "translate(-50%, -50%) scale(1)" },
      { opacity: 1, transform: "translate(-50%, -50%) scale(0.62)" },
    ], 550, 550, "ease-in-out");

    this.nativeAnimate(this.symbolSlot, [
      { opacity: 0, visibility: "hidden", transform: "translate(-50%, -50%) scale(0.08)" },
      { opacity: 1, visibility: "visible", transform: "translate(-50%, -50%) scale(1)" },
    ], 620, 1050, "cubic-bezier(0.22, 1, 0.36, 1)");

    this.animateDashNative(this.symbolLines, 780, 1850, 70, "center", false);
    this.animatePaintNative(this.symbolLines, 2280, 700, 40, "center", 1, 0.42);
    this.fadeNative([...this.symbolGuideLines, ...this.symbolGuideNodes], 2480, 580, 0);

    this.nativeAnimate(this.origin, [
      { opacity: 1, transform: "translate(-50%, -50%) scale(0.62)" },
      { opacity: 0, transform: "translate(-50%, -50%) scale(0.18)" },
    ], 1200, 650, "ease-in");

    this.animatePaintNative(this.symbolLines, 3820, 420, 0, "start", 0, 1);
    this.animateDashNative(this.symbolLines, 4240, 980, 45, "edges", true);

    this.nativeAnimate(this.symbolSlot, [
      { opacity: 1, visibility: "visible", transform: "translate(-50%, -50%) scale(1)" },
      { opacity: 0, visibility: "hidden", transform: "translate(-50%, -50%) scale(0.96)" },
    ], 4390, 720, "ease-in-out");

    this.nativeAnimate(this.wordmarkGuides, [
      { opacity: 0, visibility: "hidden" },
      { opacity: 1, visibility: "visible" },
    ], 4500, 240, "ease-out");

    this.animateGuideDashNative(this.wordmarkGuideLines, 4520, 950, 35, "start");
    this.animateNodesNative(this.wordmarkGuideNodes, 4960, 250, 30, "start", 0.9);

    this.nativeAnimate(this.wordmarkSlot, [
      { opacity: 0, visibility: "hidden", transform: `${wordmarkTransform} scale(0.985)` },
      { opacity: 1, visibility: "visible", transform: `${wordmarkTransform} scale(1)` },
    ], 4560, 550, "ease-out");

    this.animateDashNative(this.wordmarkLines, 4580, 1800, 35, "start", false);
    this.animatePaintNative(this.wordmarkLines, 5900, 860, 25, "start", 1, 0);
    this.fadeNative([...this.wordmarkGuideLines, ...this.wordmarkGuideNodes], 6560, 550, 0);
    this.fadeNative([this.guides], 6760, 200, 0);

    this.nativeTimers.push(window.setTimeout(() => {
      this.symbolSlot.style.opacity = "0";
      this.symbolSlot.style.visibility = "hidden";
      this.symbolLines.forEach((line) => {
        line.style.strokeDashoffset = line.style.strokeDasharray;
        line.style.fillOpacity = "0";
        line.style.strokeOpacity = "1";
      });
      this.wordmarkSlot.style.opacity = "1";
      this.wordmarkSlot.style.visibility = "visible";
      this.wordmarkLines.forEach((line) => {
        line.style.strokeDashoffset = "0";
        line.style.fillOpacity = "1";
        line.style.strokeOpacity = "0";
      });
      this.guides.style.opacity = "0";
      this.guides.style.visibility = "hidden";
      this.root.classList.add("is-complete");
    }, 7100));
  }

  setBaseState() {
    this.origin.style.opacity = "1";
    this.origin.style.visibility = "visible";
    this.origin.style.transform = "translate(-50%, -50%) scale(0)";

    this.symbolSlot.style.opacity = "0";
    this.symbolSlot.style.visibility = "hidden";
    this.symbolSlot.style.transform = "translate(-50%, -50%) scale(0.08)";

    this.wordmarkSlot.style.opacity = "0";
    this.wordmarkSlot.style.visibility = "hidden";
    this.wordmarkSlot.style.transform = `${this.getWordmarkTransform()} scale(0.985)`;

    this.guides.style.opacity = "0";
    this.guides.style.visibility = "hidden";
    this.symbolGuides.style.opacity = "0";
    this.symbolGuides.style.visibility = "hidden";
    this.wordmarkGuides.style.opacity = "0";
    this.wordmarkGuides.style.visibility = "hidden";

    [...this.symbolLines, ...this.wordmarkLines].forEach((line) => {
      line.style.strokeDashoffset = line.style.strokeDasharray;
      line.style.strokeOpacity = "1";
      line.style.fillOpacity = "0";
    });

    this.guideLines.forEach((line) => {
      line.style.opacity = "1";
      line.style.strokeDasharray = line.dataset.length;
      line.style.strokeDashoffset = line.dataset.length;
    });

    this.guideNodes.forEach((node) => {
      node.style.opacity = "0";
      node.style.transform = "scale(0.4)";
    });
  }

  nativeAnimate(target, keyframes, delay, duration, easing) {
    this.nativeTimers.push(window.setTimeout(() => {
      const animation = target.animate(keyframes, {
        duration,
        easing,
        fill: "forwards",
      });
      this.nativeAnimations.push(animation);
    }, delay));
  }

  getWordmarkOffset() {
    return Math.min(Math.max(window.innerWidth * 0.024, 18), 34);
  }

  getWordmarkTransform() {
    return `translate(-50%, calc(-50% + ${this.getWordmarkOffset()}px))`;
  }

  animateDashNative(lines, delay, duration, stagger, from, reverse) {
    const orderedLines = this.orderLines(lines, from);

    orderedLines.forEach((line, index) => {
      const length = line.style.strokeDasharray;
      const keyframes = reverse
        ? [{ strokeDashoffset: "0" }, { strokeDashoffset: length }]
        : [{ strokeDashoffset: length }, { strokeDashoffset: "0" }];

      this.nativeTimers.push(window.setTimeout(() => {
        const animation = line.animate(keyframes, {
          duration,
          easing: "ease-in-out",
          fill: "forwards",
        });
        animation.onfinish = () => {
          line.style.strokeDashoffset = reverse ? length : "0";
        };
        this.nativeAnimations.push(animation);
      }, delay + index * stagger));
    });
  }

  animatePaintNative(lines, delay, duration, stagger, from, fillOpacity, strokeOpacity) {
    const orderedLines = this.orderLines(lines, from);

    orderedLines.forEach((line, index) => {
      this.nativeTimers.push(window.setTimeout(() => {
        const animation = line.animate([
          {
            fillOpacity: line.style.fillOpacity || "0",
            strokeOpacity: line.style.strokeOpacity || "1",
          },
          {
            fillOpacity: String(fillOpacity),
            strokeOpacity: String(strokeOpacity),
          },
        ], {
          duration,
          easing: "ease-in-out",
          fill: "forwards",
        });
        animation.onfinish = () => {
          line.style.fillOpacity = String(fillOpacity);
          line.style.strokeOpacity = String(strokeOpacity);
        };
        this.nativeAnimations.push(animation);
      }, delay + index * stagger));
    });
  }

  animateGuideDashNative(lines, delay, duration, stagger, from) {
    const orderedLines = this.orderLines(lines, from);

    orderedLines.forEach((line, index) => {
      const length = line.dataset.length;

      this.nativeTimers.push(window.setTimeout(() => {
        const animation = line.animate([
          { strokeDasharray: length, strokeDashoffset: length },
          { strokeDasharray: length, strokeDashoffset: "0" },
        ], {
          duration,
          easing: "ease-in-out",
          fill: "forwards",
        });
        animation.onfinish = () => {
          line.style.strokeDasharray = line.dataset.dash;
          line.style.strokeDashoffset = "0";
        };
        this.nativeAnimations.push(animation);
      }, delay + index * stagger));
    });
  }

  animateNodesNative(nodes, delay, duration, stagger, from, opacity) {
    const orderedNodes = this.orderLines(nodes, from);

    orderedNodes.forEach((node, index) => {
      this.nativeTimers.push(window.setTimeout(() => {
        const animation = node.animate([
          { opacity: 0, transform: "scale(0.4)" },
          { opacity, transform: "scale(1)" },
        ], {
          duration,
          easing: "ease-out",
          fill: "forwards",
        });
        animation.onfinish = () => {
          node.style.opacity = String(opacity);
          node.style.transform = "scale(1)";
        };
        this.nativeAnimations.push(animation);
      }, delay + index * stagger));
    });
  }

  fadeNative(targets, delay, duration, opacity) {
    targets.forEach((target) => {
      this.nativeTimers.push(window.setTimeout(() => {
        const animation = target.animate([
          { opacity: getComputedStyle(target).opacity },
          { opacity },
        ], {
          duration,
          easing: "ease-in-out",
          fill: "forwards",
        });
        animation.onfinish = () => {
          target.style.opacity = String(opacity);
          if (opacity === 0) {
            target.style.visibility = "hidden";
          }
        };
        this.nativeAnimations.push(animation);
      }, delay));
    });
  }

  orderLines(lines, from) {
    if (from === "center") {
      const center = (lines.length - 1) / 2;
      return [...lines].sort((a, b) => {
        return Math.abs(lines.indexOf(a) - center) - Math.abs(lines.indexOf(b) - center);
      });
    }

    if (from === "edges") {
      const center = (lines.length - 1) / 2;
      return [...lines].sort((a, b) => {
        return Math.abs(lines.indexOf(b) - center) - Math.abs(lines.indexOf(a) - center);
      });
    }

    return [...lines];
  }

  cancelNative() {
    this.nativeAnimations.forEach((animation) => animation.cancel());
    this.nativeTimers.forEach((timer) => window.clearTimeout(timer));
    this.nativeAnimations = [];
    this.nativeTimers = [];
  }
}

window.CARQMotionIntro = CARQMotionIntro;

document.addEventListener("DOMContentLoaded", async () => {
  const roots = [...document.querySelectorAll("[data-carq-motion]")];

  await Promise.all(
    roots.map(async (root) => {
      const intro = new CARQMotionIntro(root);
      root.carqMotionIntro = intro;
      await intro.init();
    }),
  );
});
