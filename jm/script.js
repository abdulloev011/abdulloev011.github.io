/* Измените данные здесь. Фото-примеры заменяются в папке images. */
const wedding = {
  groom: "Мамаджон",
  groomFull: "Джураев Мамаджон",
  bride: "Мехрона",
  brideFull: "Шарипова Мехрона",
  date: "2026-09-25T18:00:00+05:00",
  timeZone: "Asia/Dushanbe",
  venue: "Ресторан «Точи Заррин»",
  address: "г. Канибадам",
  mapUrl: "",
  organizer: "Имя организатора",
  phone: "",
  rsvpEndpoint: "" // URL вашего обработчика, например Formspree или PHP.
};
const weddingDate = wedding.date;
const eventDate = new Date(weddingDate);
const validDate = !Number.isNaN(eventDate.getTime());
const $ = (selector) => document.querySelector(selector);
const formatDate = (options) => new Intl.DateTimeFormat("ru-RU", {
  timeZone: wedding.timeZone, ...options
}).format(eventDate);
const data = {
  ...wedding,
  venueName: wedding.venue.replace(/^Ресторан\s*/i, ""),
  initials: `${wedding.groom.charAt(0)} & ${wedding.bride.charAt(0)}`,
  shortDate: validDate ? formatDate({day:"2-digit",month:"2-digit",year:"numeric"}) : "Дата уточняется",
  longDate: validDate ? formatDate({day:"numeric",month:"long",year:"numeric"}).replace(" г.", "") : "Дата уточняется",
  startTime: validDate ? formatDate({hour:"2-digit",minute:"2-digit"}) : "Время уточняется",
  year: validDate ? formatDate({year:"numeric"}) : ""
};
document.querySelectorAll("[data-bind]").forEach((element) => {
  element.textContent = data[element.dataset.bind] ?? "";
});
document.title = `${wedding.groom} & ${wedding.bride} — приглашение на свадьбу`;
$("meta[property='og:title']").content = document.title;
const description = `Свадьба ${wedding.groom} & ${wedding.bride}. ${data.longDate}, ${data.startTime}. ${wedding.address}, ${wedding.venue}.`;
$("meta[name='description']").content = description;
$("meta[property='og:description']").content = description;

// Проверяем внешние ссылки, чтобы незаполненные настройки не вели на #.
function httpUrl(value) {
  try { const url = new URL(value); return /^https?:$/.test(url.protocol) ? url.href : ""; }
  catch { return ""; }
}
const phone = wedding.phone.replace(/[^+\d]/g, "");
if (/^\+\d{7,15}$/.test(phone)) {
  $("#phone-link").href = `tel:${phone}`;
  $("#phone-link").textContent = wedding.phone;
  $("#phone-link").removeAttribute("aria-disabled");
  $("#whatsapp-link").href = `https://wa.me/${phone.slice(1)}`;
  $("#whatsapp-link").hidden = false;
}

// Календарь работает и на границах месяца/года, независимо от часового пояса гостя.
if (validDate) {
  $("#calendar-month").textContent = formatDate({month:"long",year:"numeric"}).replace(" г.", "");
  const parts = new Intl.DateTimeFormat("en-US", {timeZone:wedding.timeZone,year:"numeric",month:"numeric",day:"numeric"}).formatToParts(eventDate);
  const part = (type) => Number(parts.find((item) => item.type === type).value);
  [-1, 0, 1].forEach((offset) => {
    const day = new Date(Date.UTC(part("year"), part("month") - 1, part("day") + offset, 12));
    const element = document.createElement("div");
    element.className = `calendar-day${offset === 0 ? " selected" : ""}`;
    const weekday = document.createElement("small");
    weekday.textContent = day.toLocaleDateString("ru-RU", {weekday:"short",timeZone:"UTC"}).toUpperCase();
    const number = document.createElement("strong");
    number.textContent = day.getUTCDate();
    element.append(weekday, number);
    if (offset === 0) element.setAttribute("aria-label", `Свадьба: ${data.longDate}`);
    $("#calendar").append(element);
  });
}

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const invitation = $("#invitation");
const site = $("#site");
invitation.hidden = false;
document.body.classList.add("locked");
site.inert = true;
let opening = false;
const music = $("#wedding-music");
const musicToggle = $("#music-toggle");
music.volume = 0.4;
function updateMusicButton() {
  const playing = !music.paused;
  const label = playing ? "Выключить музыку" : "Включить музыку";
  musicToggle.setAttribute("aria-pressed", String(playing));
  musicToggle.setAttribute("aria-label", label);
  $("#music-label").textContent = label;
  $("#music-icon").textContent = playing ? "Ⅱ" : "♪";
}
async function playMusic() {
  try {
    await music.play();
  } catch {
    updateMusicButton();
    $("#music-label").textContent = music.error ? "Музыка недоступна" : "Включить музыку";
  }
}
music.addEventListener("play", updateMusicButton);
music.addEventListener("pause", updateMusicButton);
musicToggle.addEventListener("click", () => {
  if (music.paused) void playMusic();
  else music.pause();
});
$("#open-invitation").addEventListener("click", () => {
  if (opening) return;
  opening = true;
  musicToggle.hidden = false;
  void playMusic();
  invitation.classList.add("opening");
  setTimeout(() => {
    invitation.classList.add("leaving");
    document.body.classList.remove("locked");
    document.body.classList.add("site-open");
    site.inert = false;
    window.scrollTo({top:0,behavior:"instant"});
    $("#couple-title").focus({preventScroll:true});
    setTimeout(() => { invitation.hidden = true; }, reduceMotion.matches ? 0 : 650);
  }, reduceMotion.matches ? 0 : 1250);
});

if ("IntersectionObserver" in window && !reduceMotion.matches) {
  document.documentElement.classList.add("js-motion");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, {threshold:0.08});
  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
}

function updateCountdown() {
  const remaining = validDate ? eventDate.getTime() - Date.now() : 0;
  if (remaining <= 0) {
    $("#countdown").hidden = true;
    $("#wedding-today").hidden = false;
    $("#wedding-today").textContent = validDate ? "Сегодня наш особенный день 🤍" : "Дата свадьбы скоро появится";
    return;
  }
  const seconds = Math.floor(remaining / 1000);
  const values = {days:Math.floor(seconds/86400),hours:Math.floor(seconds/3600)%24,minutes:Math.floor(seconds/60)%60,seconds:seconds%60};
  Object.entries(values).forEach(([key,value]) => { $(`#${key}`).textContent = String(value).padStart(2,"0"); });
}
updateCountdown();
setInterval(updateCountdown, 1000);
document.addEventListener("visibilitychange", () => { if (!document.hidden) updateCountdown(); });

const form = $("#rsvp-form");
const status = $("#form-status");
const nameInput = $("#guest-name");
nameInput.addEventListener("input", () => nameInput.setCustomValidity(""));
form.addEventListener("change", (event) => {
  if (event.target.name === "drinks" && event.target.checked) {
    if (event.target.id === "no-alcohol") {
      form.querySelectorAll("[name='drinks']:not(#no-alcohol)").forEach((input) => { input.checked = false; });
    } else $("#no-alcohol").checked = false;
  }
  const absent = form.elements.attendance.value === "no";
  $("#drinks").hidden = absent;
  $("#drinks").disabled = absent;
});
if (httpUrl(wedding.rsvpEndpoint)) $("#form-note").textContent = "Нажимая «Отправить», вы передаёте ответы организатору свадьбы.";

async function sendRSVP(payload) {
  // ЗДЕСЬ ПОДКЛЮЧИТЬ ОТПРАВКУ ФОРМЫ НА СЕРВЕР
  // Telegram-токены и ключи Google храните на сервере, не в этом файле.
  // Обработчик должен разрешать CORS и возвращать успешный HTTP-статус после сохранения.
  const endpoint = httpUrl(wedding.rsvpEndpoint);
  if (!endpoint) return {demo:true};
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(endpoint, {
      method:"POST", headers:{"Content-Type":"application/json","Accept":"application/json"},
      body:JSON.stringify(payload), signal:controller.signal
    });
    if (!response.ok) throw new Error("Сервер не подтвердил получение ответа");
    return {demo:false};
  } finally { clearTimeout(timeout); }
}
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const fullName = nameInput.value.trim().replace(/\s+/g, " ");
  if (fullName.split(" ").length < 2) {
    nameInput.setCustomValidity("Пожалуйста, укажите имя и фамилию.");
    nameInput.reportValidity();
    return;
  }
  if (!form.reportValidity()) return;
  const fields = new FormData(form);
  const payload = {name:fullName,attendance:fields.get("attendance"),drinks:fields.getAll("drinks"),comment:String(fields.get("comment") || "").trim(),submittedAt:new Date().toISOString()};
  const button = form.querySelector("button[type='submit']");
  button.disabled = true;
  button.textContent = "ОТПРАВЛЯЕМ…";
  status.textContent = "";
  try {
    const result = await sendRSVP(payload);
    status.textContent = result.demo
      ? "Спасибо! Анкета заполнена.\nЭто демонстрация: ответ не отправлен. Для передачи организатору необходимо подключить отправку."
      : payload.attendance === "no"
        ? "Спасибо!\nВаш ответ получен. Нам будет вас не хватать 🤍"
        : "Спасибо!\nВаш ответ получен.\nДо встречи на нашей свадьбе 🤍";
    if (!result.demo) form.reset();
  } catch {
    status.textContent = "Не удалось отправить ответ. Ваши данные остались в форме. Попробуйте ещё раз или свяжитесь с организатором.";
  } finally {
    button.disabled = false;
    button.textContent = "ОТПРАВИТЬ ↗";
    status.focus({preventScroll:true});
  }
});
