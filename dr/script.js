"use strict";

document.documentElement.classList.add("js");

/* =========================================================
   ОСНОВНЫЕ НАСТРОЙКИ
   Замените дату, номер WhatsApp и имена на реальные данные.
   Номер WhatsApp указывается только цифрами, без +, пробелов и скобок.
   ========================================================= */
const WEDDING_CONFIG = {
  groomName: "Александр", // ЗАМЕНИТЕ: имя жениха
  brideName: "София", // ЗАМЕНИТЕ: имя невесты
  weddingDate: "2026-09-20T17:00:00+05:00", // ЗАМЕНИТЕ: YYYY-MM-DDTHH:mm:ss+часовой_пояс
  weddingDateText: "20 сентября 2026 года", // ЗАМЕНИТЕ: дата для сообщения
  venueName: "Ресторан «Белый сад»", // ЗАМЕНИТЕ: место проведения
  whatsappNumber: "992000000000" // ЗАМЕНИТЕ: номер WhatsApp, например 992901234567
};

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Вспомогательные функции ---------- */
const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];

let toastTimer;
function showToast(message, duration = 3400) {
  const toast = qs("#toast");
  if (!toast) return;

  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");

  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, duration);
}

/* ---------- Шапка, мобильное меню и плавная прокрутка ---------- */
const header = qs("#siteHeader");
const menuToggle = qs("#menuToggle");
const navMenu = qs("#navMenu");
const backToTop = qs("#backToTop");

function updateHeader() {
  const isScrolled = window.scrollY > 42;
  header?.classList.toggle("is-scrolled", isScrolled);
  backToTop?.classList.toggle("is-visible", window.scrollY > 650);
}

function setMenu(open) {
  if (!menuToggle || !navMenu) return;

  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
  navMenu.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open);

  if (open) {
    window.setTimeout(() => qs("a", navMenu)?.focus(), 100);
  }
}

menuToggle?.addEventListener("click", () => {
  const willOpen = menuToggle.getAttribute("aria-expanded") !== "true";
  setMenu(willOpen);
});

qsa('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    if (!targetId || targetId === "#") return;

    const target = qs(targetId);
    if (!target) return;

    event.preventDefault();
    setMenu(false);
    target.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start"
    });
  });
});

backToTop?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
});

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

/* ---------- Анимация появления разделов ---------- */
const revealItems = qsa(".reveal");

if (prefersReducedMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -45px" }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

/* ---------- Активный пункт меню ---------- */
const trackedSections = qsa("main section[id]");
const navLinks = qsa('.nav__menu a[href^="#"]');

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visibleEntry) return;
      navLinks.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${visibleEntry.target.id}`);
      });
    },
    { threshold: [0.2, 0.45, 0.7], rootMargin: "-20% 0px -55%" }
  );

  trackedSections.forEach((section) => sectionObserver.observe(section));
}

/* ---------- Обратный отсчёт ---------- */
const weddingTimestamp = new Date(WEDDING_CONFIG.weddingDate).getTime();
const countdown = qs("#countdown");
const countdownComplete = qs("#countdownComplete");
const countdownElements = {
  days: qs("#days"),
  hours: qs("#hours"),
  minutes: qs("#minutes"),
  seconds: qs("#seconds")
};

function formatNumber(value) {
  return String(value).padStart(2, "0");
}

function updateCountdown() {
  if (Number.isNaN(weddingTimestamp)) {
    countdown?.setAttribute("hidden", "");
    if (countdownComplete) {
      countdownComplete.hidden = false;
      countdownComplete.textContent = "Укажите правильную дату свадьбы в script.js";
    }
    return false;
  }

  const distance = weddingTimestamp - Date.now();

  if (distance <= 0) {
    countdown?.setAttribute("hidden", "");
    if (countdownComplete) countdownComplete.hidden = false;
    return false;
  }

  const day = 1000 * 60 * 60 * 24;
  const hour = 1000 * 60 * 60;
  const minute = 1000 * 60;

  const values = {
    days: Math.floor(distance / day),
    hours: Math.floor((distance % day) / hour),
    minutes: Math.floor((distance % hour) / minute),
    seconds: Math.floor((distance % minute) / 1000)
  };

  Object.entries(values).forEach(([unit, value]) => {
    if (countdownElements[unit]) countdownElements[unit].textContent = formatNumber(value);
  });

  return true;
}

updateCountdown();
const countdownTimer = window.setInterval(() => {
  if (!updateCountdown()) window.clearInterval(countdownTimer);
}, 1000);

/* ---------- Галерея Lightbox ---------- */
const galleryButtons = qsa(".gallery__item");
const lightbox = qs("#lightbox");
const lightboxImage = qs("#lightboxImage");
const lightboxCaption = qs("#lightboxCaption");
const lightboxPrev = qs("#lightboxPrev");
const lightboxNext = qs("#lightboxNext");
const lightboxClose = qs(".lightbox__close");
let currentImageIndex = 0;
let lightboxTrigger = null;
let touchStartX = 0;

const galleryImages = galleryButtons.map((button) => {
  const image = qs("img", button);
  return {
    src: image?.getAttribute("src") || "",
    alt: image?.getAttribute("alt") || "Фотография молодожёнов"
  };
});

function renderLightboxImage(index) {
  if (!galleryImages.length || !lightboxImage || !lightboxCaption) return;

  currentImageIndex = (index + galleryImages.length) % galleryImages.length;
  const image = galleryImages[currentImageIndex];
  lightboxImage.classList.add("is-changing");

  window.setTimeout(() => {
    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;
    lightboxCaption.textContent = `${currentImageIndex + 1} / ${galleryImages.length} — ${image.alt}`;
    lightboxImage.classList.remove("is-changing");
  }, prefersReducedMotion ? 0 : 90);
}

function openLightbox(index, trigger) {
  if (!lightbox) return;

  lightboxTrigger = trigger;
  renderLightboxImage(index);
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("lightbox-open");
  window.setTimeout(() => lightboxClose?.focus(), 80);
}

function closeLightbox() {
  if (!lightbox) return;

  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lightbox-open");
  if (lightboxImage) lightboxImage.src = "";
  lightboxTrigger?.focus();
}

galleryButtons.forEach((button, index) => {
  button.addEventListener("click", () => openLightbox(index, button));
});

qsa("[data-close-lightbox]").forEach((element) => element.addEventListener("click", closeLightbox));
lightboxPrev?.addEventListener("click", () => renderLightboxImage(currentImageIndex - 1));
lightboxNext?.addEventListener("click", () => renderLightboxImage(currentImageIndex + 1));

lightbox?.addEventListener("touchstart", (event) => {
  touchStartX = event.changedTouches[0].clientX;
}, { passive: true });

lightbox?.addEventListener("touchend", (event) => {
  const delta = event.changedTouches[0].clientX - touchStartX;
  if (Math.abs(delta) < 55) return;
  renderLightboxImage(currentImageIndex + (delta < 0 ? 1 : -1));
}, { passive: true });

document.addEventListener("keydown", (event) => {
  const lightboxIsOpen = lightbox?.classList.contains("is-open");

  if (event.key === "Escape") {
    if (lightboxIsOpen) closeLightbox();
    else setMenu(false);
  }

  if (!lightboxIsOpen) return;
  if (event.key === "ArrowLeft") renderLightboxImage(currentImageIndex - 1);
  if (event.key === "ArrowRight") renderLightboxImage(currentImageIndex + 1);

  if (event.key === "Tab") {
    const focusable = [lightboxClose, lightboxPrev, lightboxNext].filter(Boolean);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});

/* ---------- Фоновая музыка ---------- */
const musicButton = qs("#musicButton");
const backgroundMusic = qs("#backgroundMusic");
let volumeTimer;

function setMusicButtonState(isPlaying) {
  if (!musicButton) return;
  musicButton.classList.toggle("is-playing", isPlaying);
  musicButton.setAttribute("aria-pressed", String(isPlaying));
  musicButton.setAttribute("aria-label", isPlaying ? "Выключить музыку" : "Включить музыку");
  musicButton.title = isPlaying ? "Выключить музыку" : "Включить музыку";
}

function fadeAudio(targetVolume, callback) {
  if (!backgroundMusic) return;

  window.clearInterval(volumeTimer);
  const step = targetVolume > backgroundMusic.volume ? 0.05 : -0.05;

  volumeTimer = window.setInterval(() => {
    const nextVolume = Math.min(1, Math.max(0, backgroundMusic.volume + step));
    backgroundMusic.volume = nextVolume;

    const reachedTarget = step > 0 ? nextVolume >= targetVolume : nextVolume <= targetVolume;
    if (reachedTarget) {
      backgroundMusic.volume = targetVolume;
      window.clearInterval(volumeTimer);
      callback?.();
    }
  }, prefersReducedMotion ? 1 : 45);
}

musicButton?.addEventListener("click", async () => {
  if (!backgroundMusic) return;

  if (!backgroundMusic.paused) {
    fadeAudio(0, () => {
      backgroundMusic.pause();
      setMusicButtonState(false);
    });
    return;
  }

  try {
    backgroundMusic.volume = 0;
    await backgroundMusic.play();
    setMusicButtonState(true);
    fadeAudio(0.55);
  } catch (error) {
    setMusicButtonState(false);
    showToast("Добавьте музыкальный файл: music/wedding-music.mp3", 4500);
  }
});

backgroundMusic?.addEventListener("error", () => {
  setMusicButtonState(false);
});

/* ---------- RSVP и отправка в WhatsApp ---------- */
const rsvpForm = qs("#rsvpForm");
const guestName = qs("#guestName");
const guestPhone = qs("#guestPhone");
const guestCount = qs("#guestCount");
const guestComment = qs("#guestComment");
const commentCount = qs("#commentCount");

function getFieldWrapper(element) {
  return element?.closest(".field") || null;
}

function setFieldError(element, message) {
  const field = getFieldWrapper(element);
  if (!field) return false;

  const error = qs(".field__error", field);
  field.classList.toggle("has-error", Boolean(message));
  if (error) error.textContent = message;
  if (element && "setAttribute" in element) {
    element.setAttribute("aria-invalid", String(Boolean(message)));
  }
  return !message;
}

function validateName() {
  const value = guestName?.value.trim() || "";
  if (!value) return setFieldError(guestName, "Укажите имя и фамилию.");
  if (value.length < 3) return setFieldError(guestName, "Введите не менее 3 символов.");
  return setFieldError(guestName, "");
}

function validatePhone() {
  const value = guestPhone?.value.trim() || "";
  const digits = value.replace(/\D/g, "");
  if (!value) return setFieldError(guestPhone, "Укажите номер телефона.");
  if (digits.length < 9 || digits.length > 15) return setFieldError(guestPhone, "Проверьте номер телефона.");
  return setFieldError(guestPhone, "");
}

function validateGuestCount() {
  if (!guestCount?.value) return setFieldError(guestCount, "Выберите количество гостей.");
  return setFieldError(guestCount, "");
}

function validateAttendance() {
  const selected = qs('input[name="attendance"]:checked', rsvpForm);
  const firstRadio = qs('input[name="attendance"]', rsvpForm);
  const isValid = Boolean(selected);
  setFieldError(firstRadio, isValid ? "" : "Выберите один из вариантов.");
  return isValid;
}

guestName?.addEventListener("blur", validateName);
guestPhone?.addEventListener("blur", validatePhone);
guestCount?.addEventListener("change", validateGuestCount);
qsa('input[name="attendance"]', rsvpForm).forEach((radio) => radio.addEventListener("change", validateAttendance));

guestName?.addEventListener("input", () => {
  if (getFieldWrapper(guestName)?.classList.contains("has-error")) validateName();
});

guestPhone?.addEventListener("input", () => {
  if (getFieldWrapper(guestPhone)?.classList.contains("has-error")) validatePhone();
});

guestComment?.addEventListener("input", () => {
  if (commentCount) commentCount.textContent = String(guestComment.value.length);
});

rsvpForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const isValid = [validateName(), validatePhone(), validateGuestCount(), validateAttendance()].every(Boolean);
  if (!isValid) {
    const firstError = qs(".field.has-error input, .field.has-error select", rsvpForm);
    firstError?.focus();
    showToast("Пожалуйста, проверьте обязательные поля.");
    return;
  }

  const attendance = qs('input[name="attendance"]:checked', rsvpForm)?.value || "Не указано";
  const drinks = qsa('input[name="drinks"]:checked', rsvpForm).map((input) => input.value);
  const comment = guestComment?.value.trim() || "Нет";

  const message = [
    `Здравствуйте, ${WEDDING_CONFIG.groomName} и ${WEDDING_CONFIG.brideName}!`,
    "",
    `Ответ на приглашение на свадьбу ${WEDDING_CONFIG.weddingDateText}:`,
    `Имя гостя: ${guestName.value.trim()}`,
    `Телефон: ${guestPhone.value.trim()}`,
    `Количество гостей: ${guestCount.value}`,
    `Участие: ${attendance}`,
    `Напитки: ${drinks.length ? drinks.join(", ") : "Не указано"}`,
    `Комментарий: ${comment}`,
    "",
    `Место: ${WEDDING_CONFIG.venueName}`
  ].join("\n");

  const whatsappUrl = `https://wa.me/${WEDDING_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
  showToast("Спасибо! Ваш ответ подготовлен для отправки.", 4200);
  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
});

/* Закрываем мобильное меню при переходе на широкую версию. */
window.addEventListener("resize", () => {
  if (window.innerWidth > 900) setMenu(false);
});
