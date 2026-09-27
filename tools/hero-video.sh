#!/usr/bin/env bash
# A nyitókép háttérvideójának elkészítése egy (vagy több) nyers videóból.
# A megadott részleteket kivágja, összefűzi, hang nélkül, kis méretűre tömöríti,
# és készít hozzá egy állóképet is (ez látszik, amíg a videó betölt).
#
# Használat:
#   tools/hero-video.sh <videó> <kezdés> <hossz> [<videó> <kezdés> <hossz> ...]
# Példa (a sütés.mp4 3. másodpercétől 4 mp, a grill.mp4 12. másodpercétől 5 mp):
#   tools/hero-video.sh sutes.mp4 3 4 grill.mp4 12 5
#
# Eredmény: public/assets/video/hero.webm, hero.mp4 és hero.jpg
# Kell hozzá: ffmpeg
set -euo pipefail
FFMPEG="${FFMPEG:-ffmpeg}"
cd "$(dirname "$0")/.."
if (( $# < 3 || $# % 3 != 0 )); then
  sed -n '2,13p' "$0"; exit 1
fi
OUT=public/assets/video
mkdir -p "$OUT"
TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
i=0
while (( $# )); do
  # Minden részlet: 1280 px széles (álló videónál 1280 magas), 30 fps, hang nélkül
  "$FFMPEG" -hide_banner -loglevel error -y -ss "$2" -t "$3" -i "$1" -an \
    -vf "scale='if(gt(iw,ih),min(1280,iw),-2)':'if(gt(iw,ih),-2,min(1280,ih))',fps=30,format=yuv420p" \
    -c:v libx264 -preset slow -crf 23 "$TMP/part$i.mp4"
  echo "file 'part$i.mp4'" >> "$TMP/list.txt"
  i=$((i + 1)); shift 3
done
# Összefűzés, majd végleges tömörítés (háttérnek elég a kisebb minőség, cserébe gyorsan tölt)
"$FFMPEG" -hide_banner -loglevel error -y -f concat -safe 0 -i "$TMP/list.txt" -an \
  -c:v libx264 -preset slow -crf 28 -pix_fmt yuv420p -movflags +faststart "$OUT/hero.mp4"
"$FFMPEG" -hide_banner -loglevel error -y -i "$OUT/hero.mp4" -an \
  -c:v libvpx-vp9 -b:v 0 -crf 40 -row-mt 1 -deadline good -cpu-used 2 "$OUT/hero.webm"
"$FFMPEG" -hide_banner -loglevel error -y -ss 0.5 -i "$OUT/hero.mp4" -frames:v 1 -q:v 4 "$OUT/hero.jpg"
ls -lh "$OUT"
