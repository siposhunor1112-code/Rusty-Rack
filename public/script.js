/* =========================================================
   Rusty Rack Burger & BBQ – adatok és mozgás
   ========================================================= */

/* ---------- Adatok: ezeket kell módosítani, ha valami változik ---------- */
const SHOP = {
  name: "Rusty Rack Burger & BBQ",
  // Ha phone null, a weboldal nem mutatja a hívás gombokat.
  phone: "+36 30 726 6794",
  address: "1039 Budapest, Heltai Jenő tér 2.",
  // Nyitvatartás napokra bontva (0 = vasárnap … 6 = szombat); null = zárva
  hours: {
    1: ["10:30", "21:00"],
    2: ["10:30", "21:00"],
    3: ["10:30", "21:00"],
    4: ["10:30", "21:00"],
    5: ["10:30", "21:00"],
    6: ["10:30", "21:00"],
    0: ["10:30", "21:00"],
  },
};

const DAY_NAMES = ["Vasárnap", "Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat"];

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

document.documentElement.classList.remove("no-js");

/* ---------- Nyitvatartás (budapesti idő szerint) ---------- */
function budapestNow() {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Budapest", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false,
    }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t).value;
    const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
    const minutes = (Number(get("hour")) % 24) * 60 + Number(get("minute"));
    if (day < 0 || Number.isNaN(minutes)) throw new Error("hiányos időzóna-adat");
    return { day, minutes };
  } catch (err) {
    // Tartalék: CET, nyári időszámítás március utolsó vasárnapjától október utolsó vasárnapjáig
    const now = new Date();
    const y = now.getUTCFullYear();
    const lastSunday = (month) => { const d = new Date(Date.UTC(y, month + 1, 0, 1)); d.setUTCDate(d.getUTCDate() - d.getUTCDay()); return d; };
    const summer = now >= lastSunday(2) && now < lastSunday(9);
    const t = new Date(now.getTime() + (summer ? 2 : 1) * 3600e3);
    return { day: t.getUTCDay(), minutes: t.getUTCHours() * 60 + t.getUTCMinutes() };
  }
}
const toMinutes = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };

function openStatus() {
  const { day, minutes } = budapestNow();
  const today = SHOP.hours[day];
  if (today && minutes >= toMinutes(today[0]) && minutes < toMinutes(today[1])) {
    const left = toMinutes(today[1]) - minutes;
    return left <= 45
      ? { open: true, text: `Nyitva még ${left} percig`, short: `Még ${left} percig` }
      : { open: true, text: `Most nyitva · ${today[1]}-ig`, short: `Nyitva · ${today[1]}-ig` };
  }
  if (today && minutes < toMinutes(today[0])) return { open: false, text: `Zárva · ma ${today[0]}-kor nyitunk`, short: `Ma ${today[0]}-kor nyit` };
  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7;
    if (SHOP.hours[d]) return { open: false, text: `Zárva · ${i === 1 ? "holnap" : DAY_NAMES[d].toLowerCase()} ${SHOP.hours[d][0]}-kor nyitunk`, short: "Zárva" };
  }
  return { open: false, text: "Átmenetileg zárva", short: "Zárva" };
}

// Keskeny kijelzőn a fejlécbe rövidebb szöveg kerül
const narrow = window.matchMedia("(max-width: 420px)");
function renderStatus() {
  const s = openStatus();
  $$("[data-status]").forEach((el) => {
    el.classList.toggle("is-open", s.open);
    el.classList.toggle("is-closed", !s.open);
    $("[data-status-text]", el).textContent = narrow.matches && el.closest(".nav") ? s.short : s.text;
  });
}
narrow.addEventListener?.("change", renderStatus);

function renderHours() {
  const today = budapestNow().day;
  $("#hours").innerHTML = [1, 2, 3, 4, 5, 6, 0].map((d) => {
    const h = SHOP.hours[d];
    return `<li class="${d === today ? "is-today" : ""}"><span>${DAY_NAMES[d]}</span><span>${h ? `${h[0]} – ${h[1]}` : "Zárva"}</span></li>`;
  }).join("");
}

function initContact() {
  if (SHOP.phone) {
    const tel = "tel:" + SHOP.phone.replace(/[^\d+]/g, "");
    $$("[data-phone-link]").forEach((a) => (a.href = tel));
    $$("[data-phone-text]").forEach((el) => (el.textContent = SHOP.phone));
  } else {
    $$("[data-phone-link]").forEach((a) => a.remove());
  }
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
}

/* ---------- Navigáció ---------- */
function initNav() {
  const nav = $(".nav");
  const toggle = $(".nav__toggle");
  const setOpen = (open) => {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  };
  toggle.addEventListener("click", () => setOpen(!nav.classList.contains("is-open")));
  $$(".nav__links a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
  const onScroll = () => nav.classList.toggle("is-solid", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ---------- Halk parázs a nyitókép fölött ---------- */
const FX = (() => {
  const canvas = $("#fx");
  const ctx = canvas.getContext("2d");
  let w = 0, h = 0, dpr = 1, running = false, visible = true;
  const embers = [];

  // Előre megrajzolt izzó pötty: sokkal gyorsabb, mint minden képkockán shadowBlur-t számolni
  const sprite = document.createElement("canvas");
  sprite.width = sprite.height = 32;
  const sctx = sprite.getContext("2d");
  const grad = sctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, "rgba(255, 220, 150, 1)");
  grad.addColorStop(.18, "rgba(255, 150, 50, .9)");
  grad.addColorStop(.45, "rgba(255, 106, 31, .25)");
  grad.addColorStop(1, "rgba(255, 106, 31, 0)");
  sctx.fillStyle = grad;
  sctx.fillRect(0, 0, 32, 32);

  function resize() {
    // Telefonon kisebb felbontás is bőven elég
    dpr = Math.min(window.devicePixelRatio || 1, finePointer ? 2 : 1.5);
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function ember(initial) {
    return {
      x: Math.random() * w,
      y: initial ? Math.random() * h : h + 10,
      r: Math.random() * 1.5 + .5,
      vy: -(Math.random() * .5 + .2),
      vx: (Math.random() - .5) * .25,
      phase: Math.random() * Math.PI * 2,
      life: Math.random() * .4 + .4,
    };
  }

  function frame(t) {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);
    const target = w < 700 ? 16 : 32;
    while (embers.length < target) embers.push(ember(true));
    ctx.globalCompositeOperation = "lighter";
    for (const e of embers) {
      e.phase += .015;
      e.x += e.vx + Math.sin(e.phase) * .25;
      e.y += e.vy;
      const flicker = .6 + Math.sin(t * .004 + e.phase * 3) * .3;
      const size = e.r * 7;
      ctx.globalAlpha = clamp(clamp(e.y / h) * e.life * flicker);
      ctx.drawImage(sprite, e.x - size / 2, e.y - size / 2, size, size);
      if (e.y < -10) Object.assign(e, ember(false));
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    requestAnimationFrame(frame);
  }

  function update() {
    const should = visible && !document.hidden && !reduced;
    if (should && !running) { running = true; requestAnimationFrame(frame); }
    if (!should && running) { running = false; ctx.clearRect(0, 0, w, h); }
  }

  resize();
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", update);
  // Csak akkor fut, amíg a nyitókép látszik
  const hero = $(".hero");
  if ("IntersectionObserver" in window && hero) {
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; update(); }).observe(hero);
  }
  return { start: update };
})();

/* ---------- Nyitókép: egyszerű felúszás, amint a betűk megvannak ---------- */
function initHero() {
  const go = () => document.body.classList.add("is-ready");
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  Promise.race([fontsReady, new Promise((r) => setTimeout(r, 900))]).then(go);
}

/* ---------- Háttérvideó a nyitóképben ---------- */
// A forrásokat csak itt kapja meg a videó, így adatforgalom-kímélő módban semmit sem tölt le.
function initHeroVideo() {
  const box = $(".hero__video");
  const video = $("[data-hero-video]");
  if (!video) return;
  if (navigator.connection && navigator.connection.saveData) { box.remove(); return; }
  const sources = $$("source", video);
  // Csak akkor adjuk fel, ha az utolsó forrás (a tartalék) is hibás
  sources[sources.length - 1].addEventListener("error", () => box.remove());
  sources.forEach((src) => (src.src = src.dataset.src));
  video.poster = video.dataset.poster;
  video.preload = "auto";
  video.load();
  if (reduced) { video.addEventListener("loadeddata", () => box.classList.add("is-playing")); return; }
  video.addEventListener("playing", () => box.classList.add("is-playing"));
  const play = () => video.play().catch(() => {});
  // Ne fusson feleslegesen, ha már lejjebb görgettek
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([en]) => (en.isIntersecting ? play() : video.pause())).observe(box);
  } else play();
}

/* ---------- A burger rétegei: görgetésre szétnyílik ---------- */
function initAnatomy() {
  const section = $(".anatomy");
  const svg = $(".burger--explode");
  const items = $$(".anatomy__list li");
  if (!section || !svg) return;

  // A <use> helyett saját példány, hogy a rétegek külön mozgathatók legyenek
  const art = $("#burger-art");
  svg.innerHTML = "";
  art.querySelectorAll(":scope > .layer").forEach((layer) => svg.appendChild(layer.cloneNode(true)));
  const layers = $$(".layer", svg);

  let lastStep = -1, ticking = false;
  const update = () => {
    ticking = false;
    const r = section.getBoundingClientRect();
    const total = section.offsetHeight - window.innerHeight;
    const prog = clamp(-r.top / total);

    // 0–22%: szétnyílik · 22–86%: rétegenként bemutatjuk · 86–100%: újra összeáll
    let p;
    if (prog < .22) p = prog / .22;
    else if (prog < .86) p = 1;
    else p = 1 - (prog - .86) / .14;
    p = reduced ? (prog > .05 && prog < .95 ? 1 : 0) : 1 - Math.pow(1 - clamp(p), 3);
    svg.style.setProperty("--p", p.toFixed(4));
    section.style.setProperty("--p", p.toFixed(4));

    const step = prog < .22 ? 0 : prog >= .86 ? -1 : Math.min(5, Math.floor(((prog - .22) / .64) * 6));
    if (step !== lastStep) {
      lastStep = step;
      items.forEach((li, i) => li.classList.toggle("is-active", i === step || (step === -1 && i === 5)));
      svg.classList.toggle("has-focus", step >= 0 && p > .95);
      layers.forEach((l, i) => l.classList.toggle("is-focus", i === 5 - step));
    }

  };
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener("resize", update);
  update();
}

/* ---------- Videók: csak kattintásra töltődnek be (Facebook / TikTok) ---------- */
function initVideos() {
  $$("[data-clip]").forEach((clip) => {
    const btn = $(".clip__play", clip);
    const title = $(".clip__meta strong", clip).textContent;
    btn.setAttribute("aria-label", `Videó lejátszása: ${title}`);
    btn.addEventListener("click", () => {
      const f = document.createElement("iframe");
      if (clip.dataset.kind === "facebook") {
        const width = Math.round(clip.clientWidth);
        f.src = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(clip.dataset.src)}&show_text=false&autoplay=true&width=${width}`;
      } else {
        f.src = clip.dataset.src;
      }
      f.title = title;
      f.allow = "autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen";
      f.allowFullscreen = true;
      f.loading = "lazy";
      btn.replaceWith(f);
    });
  });

  // Egérrel húzva is lapozható a videósor
  const reel = $("[data-reel]");
  if (!reel || !finePointer) return;
  let down = false, sx = 0, sl = 0, moved = false;
  reel.addEventListener("pointerdown", (e) => { down = true; moved = false; sx = e.clientX; sl = reel.scrollLeft; });
  window.addEventListener("pointerup", () => { down = false; reel.style.scrollSnapType = ""; });
  reel.addEventListener("pointermove", (e) => {
    if (!down) return;
    const dx = e.clientX - sx;
    if (Math.abs(dx) > 6) { moved = true; reel.style.scrollSnapType = "none"; }
    reel.scrollLeft = sl - dx;
  });
  reel.addEventListener("click", (e) => { if (moved) { e.stopPropagation(); e.preventDefault(); } }, true);
}

/* ---------- Megjelenés görgetésre ---------- */
function initReveal() {
  const els = $$(".reveal");
  if (!("IntersectionObserver" in window)) { els.forEach((el) => el.classList.add("is-in")); return; }
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
  }), { rootMargin: "0px 0px -10% 0px" });
  els.forEach((el, i) => { el.style.transitionDelay = `${(i % 4) * 90}ms`; io.observe(el); });
}

/* ---------- Térkép: csak kattintásra tölti be a Google Maps-et ---------- */
function initMap() {
  $$(".mapbox__load").forEach((btn) => btn.addEventListener("click", () => {
    const f = document.createElement("iframe");
    f.title = "A Rusty Rack helye a térképen – Heltai Jenő tér 2.";
    f.src = btn.dataset.mapSrc;
    f.referrerPolicy = "no-referrer-when-downgrade";
    btn.replaceWith(f);
  }));
}

/* ---------- Indítás ---------- */
initContact();
renderHours();
renderStatus();
setInterval(renderStatus, 60 * 1000);
initNav();
initHero();
initAnatomy();
initHeroVideo();
initVideos();
initReveal();
initMap();
FX.start();
