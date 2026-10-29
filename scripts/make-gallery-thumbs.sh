#!/bin/sh
# Builds the gallery images from the full-size web photos (macOS sips):
#   thumb/ — small tiles for the scrolling grid
#   large/ — lighter full-width copies for the opened photo
# Run again after adding or replacing photos in public/photo-final/web.
set -e
cd "$(dirname "$0")/../public/photo-final"
mkdir -p thumb large
for src in web/*.jpg; do
  name=$(basename "$src")
  sips --resampleWidth 500 -s format jpeg -s formatOptions 40 "$src" --out "thumb/$name" >/dev/null
  sips -s format jpeg -s formatOptions 75 "$src" --out "large/$name" >/dev/null
  # Already-compressed sources can come out bigger re-encoded; keep the smaller one
  if [ "$(stat -f %z "large/$name")" -gt "$(stat -f %z "$src")" ]; then cp "$src" "large/$name"; fi
done
du -sh web thumb large
