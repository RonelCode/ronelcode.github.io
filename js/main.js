// =====================
// Mobile menu toggle
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
// Projects carousel (desktop 2 / mobile 1) + autoplay
// =====================
(function initProjectsCarousel() {
  const root = document.querySelector("[data-projects-carousel]");
  if (!root) return;

  const track = root.querySelector("[data-projects-track]");
  if (!track) return;

  const slides = Array.from(track.querySelectorAll(".project-slide"));
  if (!slides.length) return;

  const prev = document.querySelector("[data-proj-prev]");
  const next = document.querySelector("[data-proj-next]");
  const dotsWrap = root.querySelector("[data-projects-dots]");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let index = 0;
  let perView = window.matchMedia("(max-width: 768px)").matches ? 1 : 2;

  function updatePerView() {
    perView = window.matchMedia("(max-width: 768px)").matches ? 1 : 2;
  }

  function maxIndex() {
    return Math.max(0, slides.length - perView);
  }

  function clampIndex() {
    index = Math.min(Math.max(index, 0), maxIndex());
  }

  function getGapPx() {
    return parseFloat(getComputedStyle(track).gap || "0") || 0;
  }

  function buildDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = "";
    for (let i = 0; i <= maxIndex(); i++) {
      const b = document.createElement("button");
      b.className = "projects-dot" + (i === index ? " active" : "");
      b.addEventListener("click", () => goTo(i, true));
      dotsWrap.appendChild(b);
    }
  }

  function updateTransform() {
    const slideW = slides[0].getBoundingClientRect().width;
    const offset = (slideW + getGapPx()) * index;
    track.style.transform = `translateX(-${offset}px)`;
    dotsWrap?.querySelectorAll(".projects-dot").forEach((d, i) =>
      d.classList.toggle("active", i === index)
    );
  }

  function goTo(i, user = false) {
    index = i;
    clampIndex();
    updateTransform();
    if (user) pauseTemporarily();
  }

  function nextStep(user = false) {
    goTo(index >= maxIndex() ? 0 : index + 1, user);
  }

  function prevStep(user = false) {
    goTo(index <= 0 ? maxIndex() : index - 1, user);
  }

  prev?.addEventListener("click", () => prevStep(true));
  next?.addEventListener("click", () => nextStep(true));

  // Autoplay
 /* let timer = null;
  let paused = false;

  function startAutoplay() {
    if (prefersReducedMotion) return;
    timer = setInterval(() => !paused && nextStep(), 4500);
  }*/

  function pauseTemporarily() {
    paused = true;
    setTimeout(() => (paused = false), 1800);
  }

  root.addEventListener("mouseenter", () => (paused = true));
  root.addEventListener("mouseleave", () => (paused = false));

  window.addEventListener("resize", () => {
    updatePerView();
    clampIndex();
    buildDots();
    updateTransform();
  });

  updatePerView();
  clampIndex();
  buildDots();
  requestAnimationFrame(() => {
    updateTransform();
    startAutoplay();
  });
})(); 

// ===========================
// Image Preview Lightbox
// ===========================
(() => {
  const preview = document.getElementById("imgPreview");
  const previewImg = document.getElementById("imgPreviewImg");
  const closeBtn = preview?.querySelector(".img-preview-close");
  const prevBtn = preview?.querySelector(".img-preview-nav.prev");
  const nextBtn = preview?.querySelector(".img-preview-nav.next");

  if (!preview || !previewImg) return;

  let currentImages = [];
  let currentIndex = -1;

  function openPreview(imgEl) {
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

  function showIndex(i) {
    if (!currentImages.length) return;
    currentIndex = (i + currentImages.length) % currentImages.length;
    previewImg.src = currentImages[currentIndex].src;
  }

  // Open on image click (ignore buttons)
  document.addEventListener("click", (e) => {
    if (e.target.closest("button")) return;
    const img = e.target.closest(".carousel img");
    if (img) openPreview(img);
  });

  // Buttons
  closeBtn?.addEventListener("click", closePreview);
  prevBtn?.addEventListener("click", () => showIndex(currentIndex - 1));
  nextBtn?.addEventListener("click", () => showIndex(currentIndex + 1));

  // Backdrop click
  preview.addEventListener("click", (e) => {
    if (
      e.target === preview ||
      e.target.classList.contains("img-preview-backdrop")
    ) {
      closePreview();
    }
  });

  // Keyboard support
  document.addEventListener("keydown", (e) => {
    if (preview.getAttribute("aria-hidden") !== "false") return;

    if (e.key === "Escape") closePreview();
    if (e.key === "ArrowLeft") showIndex(currentIndex - 1);
    if (e.key === "ArrowRight") showIndex(currentIndex + 1);
  });
})();
