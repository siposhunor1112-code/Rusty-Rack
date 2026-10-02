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

- Letisztult, sötét stílus: szén háttér, csont színű szöveg, egyetlen kiemelőszín (parázs-narancs) – `public/styles.css`, `:root`
- Két betűtípus saját tárhelyről: Anton (címek) és Space Grotesk (szöveg) – `public/assets/fonts/`, SIL Open Font License
- A burger rajza kódból készül (SVG, `#burger-art` az `index.html` alján) – ez a „01 A burger” szekcióban látszik
- A fotók helyén addig helyjelölő látszik, amíg a képet fel nem töltöd (lásd lent: „Fotók”)
- Mozgás csak mértékkel: a nyitókép szövege finoman beúszik, fölötte halk parázs száll (csak amíg a nyitókép látszik),
  a szekciók görgetésre jelennek meg

## Szekciók

- **Nyitókép**: „Smashed. Smoked. Békásmegyer.”, rövid bemutatás, Rendelés és Étlap gomb, alatta „Rendezvényeket is vállalunk”
  link, jobbra nagy fotó, alul cím, nyitvatartás és telefon.
  A háttérben elhalványított, hangtalan, ismétlődő videó mehet (lásd lent: „Háttérvideó”)
- **01 A burger**: görgetésre rétegeire szétnyíló burger, a rétegek rövid leírásával
- **02 Étlap**: kiemelt Rusty Rack burger (fotóval), mellette kategóriánkénti árlista
- **03 Képek**: galéria hat fotóval (egy nagy, négy kicsi, egy széles)
- **04 Rendezvények**: alkalmak (céges rendezvény, születésnap, csapatépítő, ballagás, kerti parti, családi összejövetel),
  három ajánlat (kitelepülés, BBQ tálak/catering, egyedi ajánlat), és ajánlatkérés hívással vagy Messengeren
- **05 Videók**: élő előnézet – a Facebook- és TikTok-videók hang nélkül, ismétlődve mennek, amíg látszanak (a többi áll),
  mindegyiken hang be/ki gomb. Az előnézetek az oldal betöltése után azonnal elindulnak. Ha előbb engedélyt szeretnél kérni
  a látogatótól (a Facebook és a TikTok sütiket használhat): `SHOP.askVideoConsent = true` a `script.js` elején.
  **Csak feltöltött weboldalon (https://…) működnek**, helyi fájlként megnyitva az oldal ezt ki is írja.
  Asztali gépen minden látható videó megy; telefonon egyszerre csak a középen lévő TikTok-videó, és csak akkor vált,
  amikor a lapozás megállt. A Facebook telefonon nem engedi a kódból indított lejátszást, ezért ott a Facebook-videók
  a saját előnézeti képüket mutatják, és koppintásra, hanggal indulnak
- **06 Történet** (Gergő fotójával), **07 Rólunk írták**, **08 Rendelés** (telefon, Wolt, foodora), **09 Hol vagyunk**
  (a bejárat fotója, élő nyitva/zárva jelzés, nyitvatartás, térkép kattintásra)
- Telefonon alul mindig ott a **Hívás**, **Útvonal** és **Rendelés** gomb
- **Telefonra optimalizálva** (320 px-től, álló és fekvő helyzetben is): a címek a kijelző magasságához is igazodnak,
  fekvő telefonon kétoszlopos elrendezés, notch-os telefonokon a szélek szabadon maradnak, legalább 40 px-es érintési
  felületek; az adatforgalom-kímélő módot bekapcsolók nem töltik le a háttérvideót
- Aki a rendszerében kikapcsolta az animációkat (`prefers-reduced-motion`), annak minden mozdulatlan marad

## Tartalom szerkesztése

- `public/script.js` eleje – `SHOP.phone` (ha `null`, eltűnnek a hívás gombok) és `SHOP.hours` (napokra bontott nyitvatartás,
  ebből számolja az oldal budapesti idő szerint, hogy most nyitva van-e)
- Étlap: `public/index.html`, `<section id="etlap">` – a kiemelt burger az `<article class="feature">`,
  az árlista tételei a `menu__group` listák `<li>` sorai (név, rövid leírás, ár; ismeretlen árnál „—”)
- Rendezvények: `public/index.html`, `<section id="rendezvenyek">` – alkalmak a `events__tags` listában, ajánlatok az
  `<article class="offer">` blokkokban
- Videók: `public/index.html`, `<section id="videok">` – új videóhoz másolj le egy `<article class="clip">` blokkot és írd át:
  - Facebook: `data-kind="facebook"` és `data-href="<a videó vagy reel linkje>"` (pl. `https://www.facebook.com/reel/<szám>/`)
  - TikTok: `data-kind="tiktok"`, `data-href="<a videó linkje>"` és `data-id="<a link végén lévő szám>"`

## Honnan jöttek az adatok (élesítés előtt egyeztesd a bolttal!)

A Facebook-oldal tartalmát nem lehetett közvetlenül letölteni, ezért nyilvános forrásokból gyűjtöttük össze az adatokat
(Wolt és foodora adatlap, We Love Budapest cikk, Csabi Konyhája Burger Mustra #220, keresőtalálatok):

- Cím: 1039 Budapest, Heltai Jenő tér 2. · Telefon: +36 30 726 6794 · Nyitvatartás: minden nap 10:30–21:00
- Árak: Rusty Rack burger 3 290 Ft, Húsimádó 4 690 Ft, pulled pork szendvics 3 290 Ft, hasábburgonya 780 Ft.
  A többi tétel ára és a három további burger neve nem volt elérhető, ezeknél az oldal a helyszíni étlapra utal
- Rendezvények: a tulajdonos jelezte, hogy vállalnak rendezvényeket; a konkrét ajánlatok (kitelepülés, BBQ tálak, egyedi menü)
  és az alkalmak listája javaslat – élesítés előtt egyeztesd, mi az, amit tényleg vállalnak
- Videók: három videó a Rusty Rack Facebook-oldaláról, valamint @erdodi_peter és @okosgrill TikTok-videója a helyről

## Háttérvideó a nyitóképben

A nyitókép hátterében halványan egy hangtalan, ismétlődő videó megy (pl. ahogy sülnek a húsok a platnin).
A fájlok helye: `public/assets/video/hero.webm`, `hero.mp4` és `hero.jpg` (állókép, amíg a videó betölt).
Amíg ezek nincsenek feltöltve, a nyitókép videó nélkül jelenik meg.

Elkészítés a saját (pl. Facebookról letöltött) videóidból – a legjobb részleteket kivágja, összefűzi,
leveszi a hangot és kicsire tömöríti:

```sh
# videó, kezdés (mp), hossz (mp) – ahány részlet kell
tools/hero-video.sh sutes.mp4 3 4 grill.mp4 12 5
```

Kell hozzá az `ffmpeg`. A részletek legyenek egyformán fekvők vagy egyformán állók.

## Fotók

Minden fotó helyén egy helyjelölő látszik („Fotó helye”, rövid leírás arról, mi kerülne oda, és a fájl neve).
Kép beillesztéséhez elég a fájlt a megadott néven a `public/assets/photos/` mappába tenni – a kód nélkül is
magától a helyjelölő helyére kerül. Ami nincs feltöltve, ott a helyjelölő marad.

| Fájl | Hol látszik | Mi legyen rajta |
| --- | --- | --- |
| `hero.jpg` | nyitókép, jobb oldal (álló, kb. 4:5) | a Rusty Rack burger közelről |
| `rusty-rack-burger.jpg` | étlap, kiemelt kártya (4:3) | a ház burgere tányéron |
| `galeria-1.jpg` | képek, nagy kocka | smashed burger közelről, kettévágva |
| `galeria-2.jpg` … `galeria-5.jpg` | képek, kis csempék | platni sütés közben, oldalas, pulled pork, sajtszószos krumpli |
| `galeria-6.jpg` | képek, széles sáv (fekvő) | a hely belülről |
| `rendezveny.jpg` | rendezvények (3:2) | egy korábbi rendezvény vagy kitelepülés |
| `gergo.jpg` | történet (4:3) | Katona Gergő a platni mögött |
| `bejarat.jpg` | hol vagyunk (16:9) | a bejárat kívülről |

A képek kitöltik a helyüket (szélükből levághat), ezért a téma legyen középen. Elég 1600 px széles, jól tömörített JPG.
A kép leírása (amit a vakok felolvasóprogramja mond) a `figure` `data-alt` mezőjében van.

## Helyi megtekintés

```sh
python3 -m http.server 8000 -d public
# majd: http://localhost:8000
```
