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
    return { open: true, text: left <= 45 ? `Nyitva még ${left} percig` : `Most nyitva · ${today[1]}-ig` };
  }
  if (today && minutes < toMinutes(today[0])) return { open: false, text: `Zárva · ma ${today[0]}-kor nyitunk` };
  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7;
    if (SHOP.hours[d]) return { open: false, text: `Zárva · ${i === 1 ? "holnap" : DAY_NAMES[d].toLowerCase()} ${SHOP.hours[d][0]}-kor nyitunk` };
  }
  return { open: false, text: "Átmenetileg zárva" };
}

function renderStatus() {
  const s = openStatus();
  $$("[data-status]").forEach((el) => {
    el.classList.toggle("is-open", s.open);
    el.classList.toggle("is-closed", !s.open);
    $("[data-status-text]", el).textContent = s.text;
  });
}

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

/* ---------- Parázs, füst és szikrák (egy vászon az egész oldalra) ---------- */
const FX = (() => {
  const canvas = $("#fx");
  const ctx = canvas.getContext("2d");
  let w = 0, h = 0, dpr = 1, running = false;
  const embers = [];
  const sparks = [];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function ember(initial) {
    return {
      x: Math.random() * w,
      y: initial ? Math.random() * h : h + 10,
      r: Math.random() * 1.8 + .6,
      vy: -(Math.random() * .7 + .25),
      vx: (Math.random() - .5) * .3,
      phase: Math.random() * Math.PI * 2,
      life: Math.random() * .5 + .5,
    };
  }

  function burst(x, y, n = 26, power = 1) {
    if (reduced) return;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = (Math.random() * 6 + 2) * power;
      sparks.push({ x, y, px: x, py: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 2 * power, life: 1, decay: Math.random() * .025 + .018 });
    }
    start();
  }

  function frame(t) {
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";

    // A hero alatt sűrűbb, lejjebb ritkább a parázs
    const target = Math.round((w < 700 ? 28 : 60) * (window.scrollY < h ? 1 : .45));
    while (embers.length < target) embers.push(ember(embers.length < target * .6));
    if (embers.length > target + 10) embers.length = target;

    for (const e of embers) {
      e.phase += .02;
      e.x += e.vx + Math.sin(e.phase) * .35;
      e.y += e.vy;
      const flicker = .55 + Math.sin(t * .006 + e.phase * 3) * .35;
      const fade = clamp(e.y / h) * e.life * flicker;
      ctx.beginPath();
      ctx.fillStyle = `rgba(255, ${120 + Math.round(e.r * 30)}, 40, ${fade})`;
      ctx.shadowBlur = 12; ctx.shadowColor = "rgba(255, 106, 31, .9)";
      ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
      ctx.fill();
      if (e.y < -10) Object.assign(e, ember(false));
    }
    ctx.shadowBlur = 0;

    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.px = s.x; s.py = s.y;
      s.vy += .18; s.vx *= .98;
      s.x += s.vx; s.y += s.vy;
      s.life -= s.decay;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      ctx.strokeStyle = `rgba(255, ${150 + Math.round(s.life * 90)}, 60, ${s.life})`;
      ctx.lineWidth = 2 * s.life + .4;
      ctx.beginPath(); ctx.moveTo(s.px, s.py); ctx.lineTo(s.x, s.y); ctx.stroke();
    }
    ctx.globalCompositeOperation = "source-over";
    if (running) requestAnimationFrame(frame);
  }

  function start() {
    if (running || reduced || document.hidden) return;
    running = true;
    requestAnimationFrame(frame);
  }
  function stop() { running = false; }

  resize();
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  return { start, burst };
})();

/* ---------- Nyitó „smash” ---------- */
function initHero() {
  const title = $(".hero__title");
  const go = () => {
    document.body.classList.add("is-ready");
    if (reduced) return;
    // A harmadik sor „becsapódásakor” megrázkódik a cím és szikrák repülnek
    setTimeout(() => {
      title.classList.add("is-shaking");
      const r = title.getBoundingClientRect();
      FX.burst(r.left + r.width * .45, r.bottom - 20, 60, 1.3);
      setTimeout(() => title.classList.remove("is-shaking"), 400);
    }, 950);
  };
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  Promise.race([fontsReady, new Promise((r) => setTimeout(r, 900))]).then(go);

  // A burger enyhén követi az egeret
  const burger = $(".hero__burger");
  if (finePointer && !reduced) {
    window.addEventListener("pointermove", (e) => {
      const x = e.clientX / window.innerWidth - .5;
      const y = e.clientY / window.innerHeight - .5;
      burger.style.transform = `translate(${x * -24}px, ${y * -18}px) rotate(${x * -6}deg)`;
    }, { passive: true });
  }
}

/* ---------- Háttérvideó a nyitóképben ---------- */
function initHeroVideo() {
  const box = $(".hero__video");
  const video = $("[data-hero-video]");
  if (!video) return;
  // Csak akkor adjuk fel, ha az utolsó forrás (a tartalék) is hibás
  const source = $$("source", video).pop();
  // Ha nincs feltöltve videó, eltüntetjük a helyét
  const fail = () => box.remove();
  source.addEventListener("error", fail);
  if (video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) return fail();
  video.addEventListener("error", fail);
  if (reduced) { video.removeAttribute("autoplay"); video.pause(); video.addEventListener("loadeddata", () => box.classList.add("is-playing")); return; }
  video.addEventListener("playing", () => box.classList.add("is-playing"));
  // Ne fusson feleslegesen, ha már lejjebb görgettek
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([en]) => { if (en.isIntersecting) video.play().catch(() => {}); else video.pause(); }).observe(box);
  }
}

/* ---------- Kurzor körüli parázsfény + kattintásra szikra ---------- */
function initCursor() {
  if (!finePointer || reduced) return;
  const glow = $(".cursor");
  let x = -500, y = -500, cx = x, cy = y;
  window.addEventListener("pointermove", (e) => {
    x = e.clientX; y = e.clientY;
    document.body.classList.add("has-cursor");
  }, { passive: true });
  document.addEventListener("pointerleave", () => document.body.classList.remove("has-cursor"));
  const loop = () => {
    cx += (x - cx) * .15; cy += (y - cy) * .15;
    glow.style.transform = `translate(${cx}px, ${cy}px)`;
    requestAnimationFrame(loop);
  };
  loop();
  window.addEventListener("pointerdown", (e) => FX.burst(e.clientX, e.clientY, 18, .8));
}

/* ---------- Mágneses gombok ---------- */
function initMagnets() {
  if (!finePointer || reduced) return;
  $$(".magnet").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${dx * .18}px, ${dy * .28}px)`;
    });
    el.addEventListener("pointerleave", () => (el.style.transform = ""));
  });
}

/* ---------- Anatómia: görgetésre szétnyíló burger ---------- */
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

  let lastStep = -1, ticking = false, collapsed = false;
  const update = () => {
    ticking = false;
    const r = section.getBoundingClientRect();
    const total = section.offsetHeight - window.innerHeight;
    const prog = clamp(-r.top / total);

    // 0–22%: szétnyílik · 22–86%: rétegenként bemutatjuk · 86–100%: összecsapjuk
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

    // Amikor összeáll, egy „smash”: szikrák a burger közepéből
    if (prog > .985 && !collapsed) {
      collapsed = true;
      const b = svg.getBoundingClientRect();
      FX.burst(b.left + b.width / 2, b.top + b.height * .45, 40, 1.1);
    } else if (prog < .9) collapsed = false;
  };
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener("resize", update);
  update();
}

/* ---------- Étlap: szűrés és 3D billenés ---------- */
function initMenu() {
  const tabs = $$(".menu__filters button");
  const dishes = $$(".dish");
  tabs.forEach((tab) => tab.addEventListener("click", () => {
    tabs.forEach((t) => t.setAttribute("aria-selected", String(t === tab)));
    const f = tab.dataset.filter;
    dishes.forEach((d) => d.classList.toggle("is-dim", f !== "all" && d.dataset.cat !== f));
  }));

  if (!finePointer || reduced) return;
  $$(".tilt").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      card.style.setProperty("--ry", `${(x - .5) * 10}deg`);
      card.style.setProperty("--rx", `${(.5 - y) * 10}deg`);
      card.style.setProperty("--mx", `${x * 100}%`);
      card.style.setProperty("--my", `${y * 100}%`);
    });
    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
    });
  });
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

/* ---------- Idézet: görgetésre „izzik fel” ---------- */
function initQuote() {
  const q = $(".story__quote p");
  if (!q) return;
  if (reduced) { q.style.setProperty("--fill", "100%"); return; }
  let ticking = false;
  const update = () => {
    ticking = false;
    const r = q.getBoundingClientRect();
    const vh = window.innerHeight;
    const prog = clamp((vh * .85 - r.top) / (vh * .6));
    q.style.setProperty("--fill", `${(prog * 100).toFixed(1)}%`);
  };
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();
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
initCursor();
initMagnets();
initAnatomy();
initHeroVideo();
initMenu();
initVideos();
initQuote();
initReveal();
initMap();
FX.start();
