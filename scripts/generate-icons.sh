#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SVG_FILE="$DIR/icons/icon.svg"

echo "Rendering PNG icons from $SVG_FILE..."

if command -v rsvg-convert &>/dev/null; then
  echo "Using rsvg-convert for high-precision SVG rasterization..."
  rsvg-convert -w 16 -h 16 "$SVG_FILE" -o "$DIR/icons/icon-16.png"
  rsvg-convert -w 48 -h 48 "$SVG_FILE" -o "$DIR/icons/icon-48.png"
  rsvg-convert -w 128 -h 128 "$SVG_FILE" -o "$DIR/icons/icon-128.png"
else
  echo "Using ImageMagick convert..."
  convert -background none -density 384 "$SVG_FILE" -resize 16x16 "$DIR/icons/icon-16.png"
  convert -background none -density 384 "$SVG_FILE" -resize 48x48 "$DIR/icons/icon-48.png"
  convert -background none -density 384 "$SVG_FILE" -resize 128x128 "$DIR/icons/icon-128.png"
fi

echo "Icons generated successfully:"
ls -lh "$DIR/icons/"
