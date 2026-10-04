#!/bin/bash
set -e

# Package VaiClean Chrome Extension into a clean ZIP ready for Chrome Web Store
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
DIST_DIR="$ROOT_DIR/dist"
VERSION=$(grep '"version"' "$ROOT_DIR/manifest.json" | head -1 | awk -F '"' '{print $4}')
ZIP_NAME="vaiclean-v${VERSION}.zip"

echo "📦 Packaging VaiClean v${VERSION} for Chrome Web Store..."

mkdir -p "$DIST_DIR"
rm -f "$DIST_DIR/$ZIP_NAME"

cd "$ROOT_DIR"

# Clean macOS metadata files if any
find . -name ".DS_Store" -delete 2>/dev/null || true

# Create clean ZIP excluding source control, tests, scripts, and docs
zip -r "$DIST_DIR/$ZIP_NAME" \
  manifest.json \
  icons/*.png \
  popup/*.html \
  popup/*.css \
  popup/*.js \
  src/ -x "*.DS_Store"

echo "✅ Đã tạo gói nén thành công: dist/$ZIP_NAME"
ls -lh "$DIST_DIR/$ZIP_NAME"
