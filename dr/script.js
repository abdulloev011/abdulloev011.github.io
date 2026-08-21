"use strict";

document.documentElement.classList.add("js");


/* =========================================================
   ОСНОВНАЯ НАСТРОЙКА
   ========================================================= */

const WEDDING_CONFIG = {
  weddingDate: "2026-08-31T18:00:00+05:00"
};


const prefersReducedMotion =
  window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;


/* =========================================================
   ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
   ========================================================= */

const qs = (
  selector,
  scope = document
) => scope.querySelector(selector);


const qsa = (
  selector,
  scope = document
) => [
  ...scope.querySelectorAll(selector)
];


let toastTimer;


function showToast(
  message,
  duration = 3400
) {

  const toast =
    qs("#toast");

  if (!toast) {
    return;
  }

  window.clearTimeout(
    toastTimer
  );

  toast.textContent =
    message;

  toast.classList.add(
    "is-visible"
  );

  toastTimer =
    window.setTimeout(
      () => {

        toast.classList.remove(
          "is-visible"
        );

      },
      duration
    );
}


/* =========================================================
   HEADER И МОБИЛЬНОЕ МЕНЮ
   ========================================================= */

const header =
  qs("#siteHeader");

const menuToggle =
  qs("#menuToggle");

const navMenu =
  qs("#navMenu");

const backToTop =
  qs("#backToTop");


function updateHeader() {

  const isScrolled =
    window.scrollY > 42;

  header?.classList.toggle(
    "is-scrolled",
    isScrolled
  );

  backToTop?.classList.toggle(
    "is-visible",
    window.scrollY > 650
  );
}


function setMenu(open) {

  if (
    !menuToggle ||
    !navMenu
  ) {
    return;
  }

  menuToggle.setAttribute(
    "aria-expanded",
    String(open)
  );

  menuToggle.setAttribute(
    "aria-label",
    open
      ? "Закрыть меню"
      : "Открыть меню"
  );

  navMenu.classList.toggle(
    "is-open",
    open
  );

  document.body.classList.toggle(
    "menu-open",
    open
  );

  if (open) {

    window.setTimeout(
      () =>
        qs(
          "a",
          navMenu
        )?.focus(),
      100
    );

  }
}


menuToggle?.addEventListener(
  "click",
  () => {

    const willOpen =
      menuToggle.getAttribute(
        "aria-expanded"
      ) !== "true";

    setMenu(
      willOpen
    );
  }
);


/* =========================================================
   ПЛАВНАЯ ПРОКРУТКА
   ========================================================= */

qsa('a[href^="#"]')
  .forEach(
    (link) => {

      link.addEventListener(
        "click",
        (event) => {

          const targetId =
            link.getAttribute(
              "href"
            );

          if (
            !targetId ||
            targetId === "#"
          ) {
            return;
          }

          const target =
            qs(targetId);

          if (!target) {
            return;
          }

          event.preventDefault();

          setMenu(false);

          target.scrollIntoView({
            behavior:
              prefersReducedMotion
                ? "auto"
                : "smooth",

            block:
              "start"
          });

        }
      );

    }
  );


/* =========================================================
   КНОПКА НАВЕРХ
   ========================================================= */

backToTop?.addEventListener(
  "click",
  () => {

    window.scrollTo({
      top: 0,

      behavior:
        prefersReducedMotion
          ? "auto"
          : "smooth"
    });

  }
);


window.addEventListener(
  "scroll",
  updateHeader,
  {
    passive: true
  }
);


updateHeader();


/* =========================================================
   АНИМАЦИЯ ПОЯВЛЕНИЯ БЛОКОВ
   ========================================================= */

const revealItems =
  qsa(".reveal");


if (
  prefersReducedMotion ||
  !(
    "IntersectionObserver"
    in window
  )
) {

  revealItems.forEach(
    (item) =>
      item.classList.add(
        "is-visible"
      )
  );

} else {

  const revealObserver =
    new IntersectionObserver(

      (
        entries,
        observer
      ) => {

        entries.forEach(
          (entry) => {

            if (
              !entry.isIntersecting
            ) {
              return;
            }

            entry.target.classList.add(
              "is-visible"
            );

            observer.unobserve(
              entry.target
            );

          }
        );

      },

      {
        threshold:
          0.12,

        rootMargin:
          "0px 0px -45px"
      }

    );


  revealItems.forEach(
    (item) =>
      revealObserver.observe(
        item
      )
  );

}


/* =========================================================
   АКТИВНЫЙ ПУНКТ МЕНЮ
   ========================================================= */

const trackedSections =
  qsa(
    "main section[id]"
  );


const navLinks =
  qsa(
    '.nav__menu a[href^="#"]'
  );


if (
  "IntersectionObserver"
  in window
) {

  const sectionObserver =
    new IntersectionObserver(

      (entries) => {

        const visibleEntry =
          entries
            .filter(
              (entry) =>
                entry.isIntersecting
            )

            .sort(
              (
                a,
                b
              ) =>
                b.intersectionRatio -
                a.intersectionRatio
            )[0];


        if (!visibleEntry) {
          return;
        }


        navLinks.forEach(
          (link) => {

            link.classList.toggle(
              "is-active",

              link.getAttribute(
                "href"
              ) ===
                `#${visibleEntry.target.id}`
            );

          }
        );

      },

      {
        threshold:
          [
            0.2,
            0.45,
            0.7
          ],

        rootMargin:
          "-20% 0px -55%"
      }

    );


  trackedSections.forEach(
    (section) =>
      sectionObserver.observe(
        section
      )
  );

}


/* =========================================================
   ОБРАТНЫЙ ОТСЧЁТ
   ========================================================= */

const weddingTimestamp =
  new Date(
    WEDDING_CONFIG.weddingDate
  ).getTime();


const countdown =
  qs("#countdown");


const countdownComplete =
  qs("#countdownComplete");


const countdownElements = {

  days:
    qs("#days"),

  hours:
    qs("#hours"),

  minutes:
    qs("#minutes"),

  seconds:
    qs("#seconds")

};


function formatNumber(value) {

  return String(
    value
  ).padStart(
    2,
    "0"
  );

}


function updateCountdown() {

  if (
    Number.isNaN(
      weddingTimestamp
    )
  ) {

    countdown?.setAttribute(
      "hidden",
      ""
    );

    if (
      countdownComplete
    ) {

      countdownComplete.hidden =
        false;

      countdownComplete.textContent =
        "Укажите правильную дату свадьбы в script.js";

    }

    return false;
  }


  const distance =
    weddingTimestamp -
    Date.now();


  if (
    distance <= 0
  ) {

    countdown?.setAttribute(
      "hidden",
      ""
    );

    if (
      countdownComplete
    ) {

      countdownComplete.hidden =
        false;

    }

    return false;
  }


  const day =
    1000 *
    60 *
    60 *
    24;


  const hour =
    1000 *
    60 *
    60;


  const minute =
    1000 *
    60;


  const values = {

    days:
      Math.floor(
        distance /
        day
      ),

    hours:
      Math.floor(
        (
          distance %
          day
        ) /
        hour
      ),

    minutes:
      Math.floor(
        (
          distance %
          hour
        ) /
        minute
      ),

    seconds:
      Math.floor(
        (
          distance %
          minute
        ) /
        1000
      )

  };


  Object.entries(
    values
  ).forEach(
    (
      [
        unit,
        value
      ]
    ) => {

      if (
        countdownElements[
          unit
        ]
      ) {

        countdownElements[
          unit
        ].textContent =
          formatNumber(
            value
          );

      }

    }
  );


  return true;
}


updateCountdown();


const countdownTimer =
  window.setInterval(
    () => {

      if (
        !updateCountdown()
      ) {

        window.clearInterval(
          countdownTimer
        );

      }

    },

    1000
  );


/* =========================================================
   ГАЛЕРЕЯ / LIGHTBOX
   ========================================================= */

const galleryButtons =
  qsa(
    ".gallery__item"
  );


const lightbox =
  qs(
    "#lightbox"
  );


const lightboxImage =
  qs(
    "#lightboxImage"
  );


const lightboxCaption =
  qs(
    "#lightboxCaption"
  );


const lightboxPrev =
  qs(
    "#lightboxPrev"
  );


const lightboxNext =
  qs(
    "#lightboxNext"
  );


const lightboxClose =
  qs(
    ".lightbox__close"
  );


let currentImageIndex =
  0;


let lightboxTrigger =
  null;


let touchStartX =
  0;


const galleryImages =
  galleryButtons.map(
    (button) => {

      const image =
        qs(
          "img",
          button
        );

      return {

        src:
          image?.getAttribute(
            "src"
          ) || "",

        alt:
          image?.getAttribute(
            "alt"
          ) ||
          "Фотография молодожёнов"

      };

    }
  );


function renderLightboxImage(
  index
) {

  if (
    !galleryImages.length ||
    !lightboxImage ||
    !lightboxCaption
  ) {
    return;
  }


  currentImageIndex =
    (
      index +
      galleryImages.length
    ) %
    galleryImages.length;


  const image =
    galleryImages[
      currentImageIndex
    ];


  lightboxImage.classList.add(
    "is-changing"
  );


  window.setTimeout(
    () => {

      lightboxImage.src =
        image.src;

      lightboxImage.alt =
        image.alt;

      lightboxCaption.textContent =
        `${
          currentImageIndex + 1
        } / ${
          galleryImages.length
        } — ${
          image.alt
        }`;


      lightboxImage.classList.remove(
        "is-changing"
      );

    },

    prefersReducedMotion
      ? 0
      : 90
  );

}


/* =========================================================
   ОТКРЫТИЕ LIGHTBOX
   ========================================================= */

function openLightbox(
  index,
  trigger
) {

  if (!lightbox) {
    return;
  }


  lightboxTrigger =
    trigger;


  renderLightboxImage(
    index
  );


  lightbox.classList.add(
    "is-open"
  );


  lightbox.setAttribute(
    "aria-hidden",
    "false"
  );


  document.body.classList.add(
    "lightbox-open"
  );


  window.setTimeout(
    () =>
      lightboxClose?.focus(),
    80
  );

}


/* =========================================================
   ЗАКРЫТИЕ LIGHTBOX
   ========================================================= */

function closeLightbox() {

  if (!lightbox) {
    return;
  }


  lightbox.classList.remove(
    "is-open"
  );


  lightbox.setAttribute(
    "aria-hidden",
    "true"
  );


  document.body.classList.remove(
    "lightbox-open"
  );


  if (
    lightboxImage
  ) {

    lightboxImage.src =
      "";

  }


  lightboxTrigger?.focus();

}


/* =========================================================
   КЛИК ПО ФОТОГРАФИИ
   ========================================================= */

galleryButtons.forEach(
  (
    button,
    index
  ) => {

    button.addEventListener(
      "click",
      () =>
        openLightbox(
          index,
          button
        )
    );

  }
);


/* ЗАКРЫТИЕ */

qsa(
  "[data-close-lightbox]"
).forEach(
  (element) =>
    element.addEventListener(
      "click",
      closeLightbox
    )
);


/* ПРЕДЫДУЩЕЕ ФОТО */

lightboxPrev?.addEventListener(
  "click",
  () =>
    renderLightboxImage(
      currentImageIndex -
      1
    )
);


/* СЛЕДУЮЩЕЕ ФОТО */

lightboxNext?.addEventListener(
  "click",
  () =>
    renderLightboxImage(
      currentImageIndex +
      1
    )
);


/* =========================================================
   SWIPE НА ТЕЛЕФОНЕ
   ========================================================= */

lightbox?.addEventListener(
  "touchstart",
  (event) => {

    touchStartX =
      event.changedTouches[
        0
      ].clientX;

  },
  {
    passive:
      true
  }
);


lightbox?.addEventListener(
  "touchend",
  (event) => {

    const delta =
      event.changedTouches[
        0
      ].clientX -
      touchStartX;


    if (
      Math.abs(delta) <
      55
    ) {
      return;
    }


    renderLightboxImage(

      currentImageIndex +
      (
        delta < 0
          ? 1
          : -1
      )

    );

  },
  {
    passive:
      true
  }
);


/* =========================================================
   КЛАВИАТУРА
   ========================================================= */

document.addEventListener(
  "keydown",
  (event) => {

    const lightboxIsOpen =
      lightbox?.classList.contains(
        "is-open"
      );


    if (
      event.key ===
      "Escape"
    ) {

      if (
        lightboxIsOpen
      ) {

        closeLightbox();

      } else {

        setMenu(
          false
        );

      }

    }


    if (
      !lightboxIsOpen
    ) {
      return;
    }


    if (
      event.key ===
      "ArrowLeft"
    ) {

      renderLightboxImage(
        currentImageIndex -
        1
      );

    }


    if (
      event.key ===
      "ArrowRight"
    ) {

      renderLightboxImage(
        currentImageIndex +
        1
      );

    }


    if (
      event.key ===
      "Tab"
    ) {

      const focusable =
        [
          lightboxClose,
          lightboxPrev,
          lightboxNext
        ].filter(
          Boolean
        );


      const first =
        focusable[0];


      const last =
        focusable[
          focusable.length -
          1
        ];


      if (
        event.shiftKey &&
        document.activeElement ===
          first
      ) {

        event.preventDefault();

        last.focus();

      } else if (
        !event.shiftKey &&
        document.activeElement ===
          last
      ) {

        event.preventDefault();

        first.focus();

      }

    }

  }
);


/* =========================================================
   ФОНОВАЯ МУЗЫКА
   ========================================================= */

const musicButton =
  qs(
    "#musicButton"
  );


const backgroundMusic =
  qs(
    "#backgroundMusic"
  );


let volumeTimer;


/* СОСТОЯНИЕ КНОПКИ */

function setMusicButtonState(
  isPlaying
) {

  if (
    !musicButton
  ) {
    return;
  }


  musicButton.classList.toggle(
    "is-playing",
    isPlaying
  );


  musicButton.setAttribute(
    "aria-pressed",
    String(
      isPlaying
    )
  );


  musicButton.setAttribute(
    "aria-label",

    isPlaying
      ? "Выключить музыку"
      : "Включить музыку"
  );


  musicButton.title =
    isPlaying
      ? "Выключить музыку"
      : "Включить музыку";

}


/* ПЛАВНОЕ ИЗМЕНЕНИЕ ГРОМКОСТИ */

function fadeAudio(
  targetVolume,
  callback
) {

  if (
    !backgroundMusic
  ) {
    return;
  }


  window.clearInterval(
    volumeTimer
  );


  const step =
    targetVolume >
    backgroundMusic.volume
      ? 0.05
      : -0.05;


  volumeTimer =
    window.setInterval(
      () => {

        const nextVolume =
          Math.min(
            1,

            Math.max(
              0,

              backgroundMusic.volume +
              step
            )
          );


        backgroundMusic.volume =
          nextVolume;


        const reachedTarget =
          step > 0

            ? nextVolume >=
              targetVolume

            : nextVolume <=
              targetVolume;


        if (
          reachedTarget
        ) {

          backgroundMusic.volume =
            targetVolume;


          window.clearInterval(
            volumeTimer
          );


          callback?.();

        }

      },

      prefersReducedMotion
        ? 1
        : 45
    );

}


/* =========================================================
   КНОПКА МУЗЫКИ
   ========================================================= */

musicButton?.addEventListener(
  "click",
  async () => {

    if (
      !backgroundMusic
    ) {
      return;
    }


    if (
      !backgroundMusic.paused
    ) {

      fadeAudio(
        0,
        () => {

          backgroundMusic.pause();

          setMusicButtonState(
            false
          );

        }
      );

      return;
    }


    try {

      backgroundMusic.volume =
        0;


      await backgroundMusic.play();


      setMusicButtonState(
        true
      );


      fadeAudio(
        0.55
      );

    } catch (
      error
    ) {

      setMusicButtonState(
        false
      );


      showToast(
        "Добавьте музыкальный файл: music/wedding-music.mp3",
        4500
      );

    }

  }
);


/* =========================================================
   МУЗЫКА ПРИ ОТКРЫТИИ ПРИГЛАШЕНИЯ
   ========================================================= */

const openInvitationButton =
  qs(
    "#openInvitationButton"
  );


openInvitationButton?.addEventListener(
  "click",
  async () => {

    if (
      !backgroundMusic ||
      !backgroundMusic.paused
    ) {
      return;
    }


    try {

      backgroundMusic.volume =
        0;


      await backgroundMusic.play();


      setMusicButtonState(
        true
      );


      fadeAudio(
        0.55
      );

    } catch (
      error
    ) {

      setMusicButtonState(
        false
      );


      showToast(
        "Добавьте музыкальный файл: music/wedding-music.mp3",
        4500
      );

    }

  }
);


/* ЕСЛИ МУЗЫКАЛЬНЫЙ ФАЙЛ НЕ НАЙДЕН */

backgroundMusic?.addEventListener(
  "error",
  () => {

    setMusicButtonState(
      false
    );

  }
);


/* =========================================================
   МОБИЛЬНОЕ МЕНЮ
   ========================================================= */

window.addEventListener(
  "resize",
  () => {

    if (
      window.innerWidth >
      900
    ) {

      setMenu(
        false
      );

    }

  }
);