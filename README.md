# Rusty Rack Burger & BBQ – weboldal

Statikus, egyoldalas weboldal a békásmegyeri Rusty Rack Burger & BBQ-nak (1039 Budapest, Heltai Jenő tér 2.).
Nincs szükség build lépésre: a `public/` mappa bármilyen statikus tárhelyen kiszolgálható (Cloudflare Workers, Netlify, GitHub Pages).

## Fájlok

- `public/` – maga a weboldal (ez kerül ki a netre):
  - `index.html` – az oldal szerkezete, szövegei és az étlap
  - `styles.css` – megjelenés (színek a `:root` változókban)
  - `script.js` – elérhetőség, nyitvatartás, és minden mozgás
  - `assets/` – ikonok és betűtípusok
  - `robots.txt` – a keresőknek
- `wrangler.jsonc` – Cloudflare-beállítás (a `public/` mappát teszi ki)

## Megjelenés

- Sötét, füstös, rozsdás hangulat: szén, rozsda, parázs és csont színek (`public/styles.css`, `:root`)
- Betűtípusok saját tárhelyről: Anton (címek), Space Grotesk (szöveg), Permanent Marker (kézírásos címkék,
  csak ő és ű nélküli szövegekhez) – `public/assets/fonts/`, SIL Open Font License
- A burger rajza kódból készül (SVG, `#burger-art` az `index.html` alján), így nincs szükség fotóra

## Szekciók és effektek

- **Nyitókép**: „Smashed. Smoked. Békásmegyer.” becsapódó felirat, rázkódás és szikrák, lebegő burger, élő nyitva/zárva jelzés
- **Parázs**: az egész oldalon felszálló parázs, kattintásra szikrák, parázsfény a kurzor körül (asztali gépen)
- **01 Anatómia**: görgetésre rétegeire szétnyíló burger, rétegenként bemutatva, a végén újra „összesmash-elve”.
  A **Hallgasd meg a platnit** gomb sercegő hangot kelt a böngészőben (WebAudio, nincs hangfájl)
- **02 Étlap**: szűrhető kártyák 3D billenéssel
- **03 Videók**: a Rusty Rack Facebook-videói és két TikTok-videó. Csak kattintásra töltődnek be
  (így a látogató addig nem kap Facebook- és TikTok-sütiket)
- **04 Sztori**, **05 Rólunk írták**, **06 Rendelés** (telefon, Wolt, foodora), **07 Hol vagyunk** (nyitvatartás, térkép kattintásra)
- Telefonon alul mindig ott a **Hívás**, **Útvonal** és **Rendelés** gomb
- Aki a rendszerében kikapcsolta az animációkat (`prefers-reduced-motion`), annak minden nyugodt marad

## Tartalom szerkesztése

- `public/script.js` eleje – `SHOP.phone` (ha `null`, eltűnnek a hívás gombok) és `SHOP.hours` (napokra bontott nyitvatartás,
  ebből számolja az oldal budapesti idő szerint, hogy most nyitva van-e)
- Étlap: `public/index.html`, `<section id="etlap">` – minden kártya egy `<article class="dish">`,
  a `data-cat` mondja meg a szűrőt (`burger`, `bbq`, `side`)
- Videók: `public/index.html`, `<section id="videok">` – új videóhoz másolj le egy `<article class="clip">` blokkot és írd át:
  - Facebook: `data-kind="facebook"` és `data-src="https://www.facebook.com/rusty.rack.burger/videos/<videó azonosító>/"`
  - TikTok: `data-kind="tiktok"` és `data-src="https://www.tiktok.com/embed/v2/<videó azonosító>"`

## Honnan jöttek az adatok (élesítés előtt egyeztesd a bolttal!)

A Facebook-oldal tartalmát nem lehetett közvetlenül letölteni, ezért nyilvános forrásokból gyűjtöttük össze az adatokat
(Wolt és foodora adatlap, We Love Budapest cikk, Csabi Konyhája Burger Mustra #220, keresőtalálatok):

- Cím: 1039 Budapest, Heltai Jenő tér 2. · Telefon: +36 30 726 6794 · Nyitvatartás: minden nap 10:30–21:00
- Árak: Rusty Rack burger 3 290 Ft, Húsimádó 4 690 Ft, pulled pork szendvics 3 290 Ft, hasábburgonya 780 Ft.
  A többi tétel ára és a három további burger neve nem volt elérhető, ezeknél az oldal a helyszíni étlapra utal
- Videók: három videó a Rusty Rack Facebook-oldaláról, valamint @erdodi_peter és @okosgrill TikTok-videója a helyről

## Saját fotók, videók

Ha a Facebook-oldalról letöltöd a saját képeidet vagy videóidat, tedd őket a `public/assets/` mappába,
és szólj: beépítjük őket a nyitóképbe és az étlapkártyákba.

## Helyi megtekintés

```sh
python3 -m http.server 8000 -d public
# majd: http://localhost:8000
```
