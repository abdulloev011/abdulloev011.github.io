"use strict";

document.documentElement.classList.add("js");


/* =========================================
   НАСТРОЙКИ СВАДЬБЫ
========================================= */

const WEDDING_CONFIG = {
  weddingDate:
    "2026-08-31T18:00:00+05:00"
};


const prefersReducedMotion =
  window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;



/* =========================================
   ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
========================================= */

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



/* =========================================
   TOAST
========================================= */

let toastTimer;


function showToast(
  message,
  duration = 3500
) {

  const toast =
    qs("#toast");

  if (!toast) {
    return;
  }


  clearTimeout(
    toastTimer
  );


  toast.textContent =
    message;


  toast.classList.add(
    "is-visible"
  );


  toastTimer =
    setTimeout(
      () => {

        toast.classList.remove(
          "is-visible"
        );

      },
      duration
    );

}



/* =========================================
   HEADER
========================================= */

const header =
  qs("#siteHeader");


const menuToggle =
  qs("#menuToggle");


const navMenu =
  qs("#navMenu");


const backToTop =
  qs("#backToTop");


function updateHeader() {

  const scrolled =
    window.scrollY > 40;


  header?.classList.toggle(
    "is-scrolled",
    scrolled
  );


  backToTop?.classList.toggle(
    "is-visible",
    window.scrollY > 600
  );

}


window.addEventListener(
  "scroll",
  updateHeader,
  {
    passive: true
  }
);


updateHeader();



/* =========================================
   МОБИЛЬНОЕ МЕНЮ
========================================= */

function setMenu(
  open
) {

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

}


menuToggle?.addEventListener(
  "click",
  () => {

    const open =
      menuToggle.getAttribute(
        "aria-expanded"
      ) !== "true";


    setMenu(
      open
    );

  }
);



/* =========================================
   ПЛАВНАЯ ПРОКРУТКА
========================================= */

qsa(
  'a[href^="#"]'
).forEach(
  link => {

    link.addEventListener(
      "click",
      event => {

        const href =
          link.getAttribute(
            "href"
          );


        if (
          !href ||
          href === "#"
        ) {
          return;
        }


        const target =
          qs(href);


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



/* =========================================
   КНОПКА НАВЕРХ
========================================= */

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



/* =========================================
   АНИМАЦИЯ СЕКЦИЙ
========================================= */

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
    item => {

      item.classList.add(
        "is-visible"
      );

    }
  );

} else {

  const revealObserver =
    new IntersectionObserver(

      (
        entries,
        observer
      ) => {

        entries.forEach(
          entry => {

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
        threshold: .1,

        rootMargin:
          "0px 0px -40px"
      }

    );


  revealItems.forEach(
    item => {

      revealObserver.observe(
        item
      );

    }
  );

}



/* =========================================
   АКТИВНЫЙ ПУНКТ МЕНЮ
========================================= */

const sections =
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

  const menuObserver =
    new IntersectionObserver(

      entries => {

        const visible =
          entries
            .filter(
              entry =>
                entry.isIntersecting
            )
            .sort(
              (a,b) =>
                b.intersectionRatio -
                a.intersectionRatio
            )[0];


        if (!visible) {
          return;
        }


        navLinks.forEach(
          link => {

            link.classList.toggle(

              "is-active",

              link.getAttribute(
                "href"
              ) ===
              `#${visible.target.id}`

            );

          }
        );

      },

      {
        threshold:
          [.2,.5,.7],

        rootMargin:
          "-20% 0px -55%"
      }

    );


  sections.forEach(
    section => {

      menuObserver.observe(
        section
      );

    }
  );

}



/* =========================================
   ОБРАТНЫЙ ОТСЧЁТ
========================================= */

const weddingTime =
  new Date(
    WEDDING_CONFIG.weddingDate
  ).getTime();


const countdown =
  qs("#countdown");


const countdownComplete =
  qs("#countdownComplete");


const daysElement =
  qs("#days");


const hoursElement =
  qs("#hours");


const minutesElement =
  qs("#minutes");


const secondsElement =
  qs("#seconds");


function formatNumber(
  value
) {

  return String(
    value
  ).padStart(
    2,
    "0"
  );

}


function updateCountdown() {

  const distance =
    weddingTime -
    Date.now();


  if (
    Number.isNaN(
      weddingTime
    )
  ) {

    return false;
  }


  if (
    distance <= 0
  ) {

    if (countdown) {

      countdown.hidden =
        true;

    }


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


  const days =
    Math.floor(
      distance /
      day
    );


  const hours =
    Math.floor(
      (
        distance %
        day
      ) /
      hour
    );


  const minutes =
    Math.floor(
      (
        distance %
        hour
      ) /
      minute
    );


  const seconds =
    Math.floor(
      (
        distance %
        minute
      ) /
      1000
    );


  if (
    daysElement
  ) {

    daysElement.textContent =
      formatNumber(
        days
      );

  }


  if (
    hoursElement
  ) {

    hoursElement.textContent =
      formatNumber(
        hours
      );

  }


  if (
    minutesElement
  ) {

    minutesElement.textContent =
      formatNumber(
        minutes
      );

  }


  if (
    secondsElement
  ) {

    secondsElement.textContent =
      formatNumber(
        seconds
      );

  }


  return true;

}


updateCountdown();


const countdownTimer =
  setInterval(
    () => {

      if (
        !updateCountdown()
      ) {

        clearInterval(
          countdownTimer
        );

      }

    },

    1000
  );



/* =========================================
   ГАЛЕРЕЯ
========================================= */

const galleryButtons =
  qsa(
    ".gallery__item"
  );


const galleryImages =
  galleryButtons.map(
    button => {

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
          "Фотография"

      };

    }
  );



/* =========================================
   LIGHTBOX
========================================= */

const lightbox =
  qs("#lightbox");


const lightboxImage =
  qs("#lightboxImage");


const lightboxCaption =
  qs("#lightboxCaption");


const lightboxPrev =
  qs("#lightboxPrev");


const lightboxNext =
  qs("#lightboxNext");


let currentImage =
  0;


let touchStartX =
  0;


function showImage(
  index
) {

  if (
    !galleryImages.length ||
    !lightboxImage
  ) {
    return;
  }


  currentImage =
    (
      index +
      galleryImages.length
    ) %
    galleryImages.length;


  const item =
    galleryImages[
      currentImage
    ];


  lightboxImage.src =
    item.src;


  lightboxImage.alt =
    item.alt;


  if (
    lightboxCaption
  ) {

    lightboxCaption.textContent =
      `${
        currentImage + 1
      } / ${
        galleryImages.length
      }`;

  }

}



function openLightbox(
  index
) {

  if (!lightbox) {
    return;
  }


  showImage(
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

}



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

}



galleryButtons.forEach(
  (
    button,
    index
  ) => {

    button.addEventListener(
      "click",
      () => {

        openLightbox(
          index
        );

      }
    );

  }
);



qsa(
  "[data-close-lightbox]"
).forEach(
  element => {

    element.addEventListener(
      "click",
      closeLightbox
    );

  }
);



lightboxPrev?.addEventListener(
  "click",
  () => {

    showImage(
      currentImage - 1
    );

  }
);



lightboxNext?.addEventListener(
  "click",
  () => {

    showImage(
      currentImage + 1
    );

  }
);



/* =========================================
   SWIPE
========================================= */

lightbox?.addEventListener(
  "touchstart",
  event => {

    touchStartX =
      event.changedTouches[
        0
      ].clientX;

  },

  {
    passive: true
  }
);


lightbox?.addEventListener(
  "touchend",
  event => {

    const currentX =
      event.changedTouches[
        0
      ].clientX;


    const distance =
      currentX -
      touchStartX;


    if (
      Math.abs(
        distance
      ) < 50
    ) {
      return;
    }


    if (
      distance < 0
    ) {

      showImage(
        currentImage + 1
      );

    } else {

      showImage(
        currentImage - 1
      );

    }

  },

  {
    passive: true
  }
);



/* =========================================
   КЛАВИАТУРА
========================================= */

document.addEventListener(
  "keydown",
  event => {

    const isOpen =
      lightbox?.classList.contains(
        "is-open"
      );


    if (
      event.key ===
      "Escape"
    ) {

      if (
        isOpen
      ) {

        closeLightbox();

      } else {

        setMenu(
          false
        );

      }

    }


    if (
      !isOpen
    ) {
      return;
    }


    if (
      event.key ===
      "ArrowLeft"
    ) {

      showImage(
        currentImage - 1
      );

    }


    if (
      event.key ===
      "ArrowRight"
    ) {

      showImage(
        currentImage + 1
      );

    }

  }
);



/* =========================================
   МУЗЫКА
========================================= */

const musicButton =
  qs("#musicButton");


const backgroundMusic =
  qs("#backgroundMusic");


const invitationButton =
  qs(
    "#openInvitationButton"
  );


let musicLoaded =
  false;


let fadeTimer;



/*
  Важная оптимизация:
  MP3 не загружается до нажатия.
*/

function prepareMusic() {

  if (
    !backgroundMusic ||
    musicLoaded
  ) {
    return;
  }


  backgroundMusic.load();


  musicLoaded =
    true;

}



function setMusicButton(
  playing
) {

  if (
    !musicButton
  ) {
    return;
  }


  musicButton.classList.toggle(
    "is-playing",
    playing
  );


  musicButton.setAttribute(
    "aria-label",
    playing
      ? "Выключить музыку"
      : "Включить музыку"
  );

}



function fadeMusic(
  target,
  callback
) {

  if (
    !backgroundMusic
  ) {
    return;
  }


  clearInterval(
    fadeTimer
  );


  const step =
    target >
    backgroundMusic.volume
      ? .05
      : -.05;


  fadeTimer =
    setInterval(
      () => {

        let volume =
          backgroundMusic.volume +
          step;


        volume =
          Math.max(
            0,
            Math.min(
              1,
              volume
            )
          );


        backgroundMusic.volume =
          volume;


        const complete =
          step > 0
            ? volume >= target
            : volume <= target;


        if (
          complete
        ) {

          backgroundMusic.volume =
            target;


          clearInterval(
            fadeTimer
          );


          if (
            callback
          ) {

            callback();

          }

        }

      },

      prefersReducedMotion
        ? 1
        : 45
    );

}



async function playMusic() {

  if (
    !backgroundMusic
  ) {
    return;
  }


  prepareMusic();


  try {

    backgroundMusic.volume =
      0;


    await backgroundMusic.play();


    setMusicButton(
      true
    );


    fadeMusic(
      .5
    );

  } catch (
    error
  ) {

    setMusicButton(
      false
    );


    showToast(
      "Не удалось включить музыку"
    );

  }

}



musicButton?.addEventListener(
  "click",
  async () => {

    if (
      !backgroundMusic
    ) {
      return;
    }


    if (
      backgroundMusic.paused
    ) {

      await playMusic();

    } else {

      fadeMusic(
        0,
        () => {

          backgroundMusic.pause();


          setMusicButton(
            false
          );

        }
      );

    }

  }
);



/*
  Музыка начинается только
  после нажатия "Открыть приглашение".
*/

invitationButton?.addEventListener(
  "click",
  async () => {

    if (
      backgroundMusic &&
      backgroundMusic.paused
    ) {

      await playMusic();

    }

  }
);



backgroundMusic?.addEventListener(
  "error",
  () => {

    setMusicButton(
      false
    );

  }
);



/* =========================================
   RESIZE
========================================= */

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