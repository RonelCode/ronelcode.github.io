// =====================
// Mobile menu toggle (toggles class on <ul>#menu)
// =====================
const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");

menuBtn?.addEventListener("click", () => {
  const isOpen = menu.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", String(isOpen));
});

menu?.querySelectorAll("a").forEach((a) => {
  a.addEventListener("click", () => {
    menu.classList.remove("open");
    menuBtn?.setAttribute("aria-expanded", "false");
  });
});

// Close menu on Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && menu?.classList.contains("open")) {
    menu.classList.remove("open");
    menuBtn?.setAttribute("aria-expanded", "false");
    menuBtn?.focus();
  }
});

// =====================
// Footer year
// =====================
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

// =====================
// Contact form demo
// =====================
const form = document.getElementById("contactForm");
const note = document.getElementById("formNote");

form?.addEventListener("submit", (e) => {
  e.preventDefault();
  if (note) note.textContent = "Message sent.";
});

// =====================
// Image carousel (inside each project)
// =====================
document.querySelectorAll("[data-carousel]").forEach((carousel) => {
  const track = carousel.querySelector("[data-track]");
  const prevBtn = carousel.querySelector("[data-prev]");
  const nextBtn = carousel.querySelector("[data-next]");
  const dotsWrap = carousel.querySelector("[data-dots]");
  if (!track) return;

  const slides = Array.from(track.querySelectorAll("img"));

  if (slides.length <= 1) {
    prevBtn?.setAttribute("hidden", "true");
    nextBtn?.setAttribute("hidden", "true");
    dotsWrap?.setAttribute("hidden", "true");
    return;
  }

  let index = 0;

  const dots = dotsWrap
    ? slides.map((_, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "dot" + (i === 0 ? " active" : "");
        b.setAttribute("aria-label", `Go to image ${i + 1}`);
        b.addEventListener("click", () => goTo(i));
        dotsWrap.appendChild(b);
        return b;
      })
    : [];

  function update() {
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle("active", i === index));
  }

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    update();
  }

  prevBtn?.addEventListener("click", () => goTo(index - 1));
  nextBtn?.addEventListener("click", () => goTo(index + 1));

  carousel.setAttribute("tabindex", "0");
  carousel.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") goTo(index - 1);
    if (e.key === "ArrowRight") goTo(index + 1);
  });

  update();
});

// =====================
// Projects carousel (desktop: 2 per view, mobile: 1 per view) + autoplay
// Autoplay ONLY when mouse is NOT inside the projects area
// =====================
(function initProjectsCarousel() {
  const root = document.querySelector("[data-projects-carousel]");
  if (!root) return;

  const track = root.querySelector("[data-projects-track]");
  if (!track) return;

  const slides = Array.from(track.querySelectorAll(".project-slide"));
  if (slides.length === 0) return;

  const prev = document.querySelector("[data-proj-prev]");
  const next = document.querySelector("[data-proj-next]");
  const dotsWrap = root.querySelector("[data-projects-dots]");

  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  // ✅ Single source of truth for breakpoint
  const mobileMQ = window.matchMedia("(max-width: 900px)");

  let index = 0;
  let perView = mobileMQ.matches ? 1 : 2;

  function getGapPx() {
    const gap = getComputedStyle(track).gap || "0px";
    return Number.parseFloat(gap) || 0;
  }

 function updatePerView() {
  perView = window.matchMedia("(max-width: 768px)").matches ? 1 : 2;
}


  function maxIndex() {
    // move by 1 card per step, but clamp so last view stays filled
    return Math.max(0, slides.length - perView);
  }

  function clampIndex() {
    index = Math.min(Math.max(index, 0), maxIndex());
  }

  function buildDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = "";

    const pages = maxIndex() + 1;
    for (let i = 0; i < pages; i++) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "projects-dot" + (i === index ? " active" : "");
      b.setAttribute("aria-label", `Go to project set ${i + 1}`);
      b.addEventListener("click", () => goTo(i, true));
      dotsWrap.appendChild(b);
    }
  }

  function updateDots() {
    if (!dotsWrap) return;
    const dots = Array.from(dotsWrap.querySelectorAll(".projects-dot"));
    dots.forEach((d, i) => d.classList.toggle("active", i === index));
  }

  function updateTransform() {
    const first = slides[0];
    if (!first) return;

    // ✅ Use actual rendered card width (works for 1 or 2 per view)
    const slideW = first.getBoundingClientRect().width;
    const gap = getGapPx();
    const offset = (slideW + gap) * index;

    track.style.transform = `translateX(-${offset}px)`;
    updateDots();
  }

  function goTo(i, userInitiated = false) {
    index = i;
    clampIndex();
    updateTransform();
    if (userInitiated) softPause();
  }

  function nextStep(userInitiated = false) {
    if (index >= maxIndex()) goTo(0, userInitiated);
    else goTo(index + 1, userInitiated);
  }

  function prevStep(userInitiated = false) {
    if (index <= 0) goTo(maxIndex(), userInitiated);
    else goTo(index - 1, userInitiated);
  }

  prev?.addEventListener("click", () => prevStep(true));
  next?.addEventListener("click", () => nextStep(true));

  // Swipe support (pointer)
  let startX = 0;
  let isDown = false;

  root.addEventListener("pointerdown", (e) => {
    isDown = true;
    startX = e.clientX;
    pause();
  });

  root.addEventListener("pointerup", (e) => {
    if (!isDown) return;
    isDown = false;

    const diff = e.clientX - startX;
    if (Math.abs(diff) > 40) {
      if (diff < 0) nextStep(true);
      else prevStep(true);
    }
    resumeIfAllowed();
  });

  root.addEventListener("pointercancel", () => {
    isDown = false;
    resumeIfAllowed();
  });

  // Keyboard support
  root.setAttribute("tabindex", "0");
  root.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") prevStep(true);
    if (e.key === "ArrowRight") nextStep(true);
  });

  // ---------------------
  // Autoplay logic
  // ---------------------
  const autoplayMs = 4500;
  let timer = null;
  let paused = false;
  let softPauseTimer = null;

  function startAutoplay() {
    if (prefersReducedMotion) return;
    stopAutoplay();
    timer = setInterval(() => {
      if (!paused) nextStep(false);
    }, autoplayMs);
  }

  function stopAutoplay() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  function pause() {
    paused = true;
  }

  function resume() {
    paused = false;
  }

  function softPause() {
    pause();
    if (softPauseTimer) clearTimeout(softPauseTimer);
    softPauseTimer = setTimeout(() => {
      resumeIfAllowed();
    }, 1800);
  }

  function isPointerInsideRoot() {
    return root.matches(":hover");
  }

  function resumeIfAllowed() {
    if (!document.hidden && !isPointerInsideRoot() && !root.contains(document.activeElement)) {
      resume();
    }
  }

  root.addEventListener("mouseenter", () => pause());
  root.addEventListener("mouseleave", () => resumeIfAllowed());
  root.addEventListener("focusin", () => pause());
  root.addEventListener("focusout", () => resumeIfAllowed());

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pause();
    else resumeIfAllowed();
  });

  // ✅ Rebuild on breakpoint change AND resize (this is the real fix)
  function reflowCarousel() {
    updatePerView();
    clampIndex();
    buildDots();
    // measure after layout settles
    requestAnimationFrame(() => {
      updateTransform();
    });
  }

  window.addEventListener("resize", reflowCarousel);
  mobileMQ.addEventListener?.("change", reflowCarousel);

  // Init (double RAF avoids “wrong width” on first paint sometimes)
  updatePerView();
  clampIndex();
  buildDots();
  requestAnimationFrame(() => {
    updateTransform();
    requestAnimationFrame(() => startAutoplay());
  });
})();

// ===========================
// Image Preview Lightbox + Arrow Navigation
// ===========================
(() => {
  const preview = document.getElementById("imgPreview");
  const previewImg = document.getElementById("imgPreviewImg");

  if (!preview || !previewImg) return;

  // State for navigation
  let currentImages = [];
  let currentIndex = -1;

  function openPreview(imgEl) {
    // Only navigate within the same carousel
    const carousel = imgEl.closest(".carousel");
    if (!carousel) return;

    currentImages = Array.from(carousel.querySelectorAll("img"));
    currentIndex = currentImages.indexOf(imgEl);

    previewImg.src = imgEl.src;
    preview.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closePreview() {
    preview.setAttribute("aria-hidden", "true");
    previewImg.src = "";
    document.body.style.overflow = "";
    currentImages = [];
    currentIndex = -1;
  }

  function showIndex(nextIndex) {
    if (!currentImages.length) return;

    // Wrap around
    if (nextIndex < 0) nextIndex = currentImages.length - 1;
    if (nextIndex >= currentImages.length) nextIndex = 0;

    currentIndex = nextIndex;
    previewImg.src = currentImages[currentIndex].src;
  }

  // Open on click
  document.addEventListener("click", (e) => {
    const img = e.target.closest(".carousel img");
    if (!img) return;
    openPreview(img);
  });

  // Close when clicking backdrop/outside
  preview.addEventListener("click", (e) => {
    if (e.target === preview || e.target.classList.contains("img-preview-backdrop")) {
      closePreview();
    }
  });

  // Keyboard controls (ESC + arrows)
  document.addEventListener("keydown", (e) => {
    const isOpen = preview.getAttribute("aria-hidden") === "false";
    if (!isOpen) return;

    if (e.key === "Escape") {
      closePreview();
      return;
    }

    if (e.key === "ArrowRight") {
      e.preventDefault();
      showIndex(currentIndex + 1);
      return;
    }

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      showIndex(currentIndex - 1);
      return;
    }
  });
})();
