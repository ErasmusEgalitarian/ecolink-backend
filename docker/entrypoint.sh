#!/bin/sh
set -e

# Backup criado na build a partir do GitHub (fora do path do volume).
SOURCE="/app/.uploads-from-git"
TARGET="/app/uploads"

mkdir -p "$TARGET/content" "$TARGET/perfil" "$TARGET/locations"

if [ -d "$SOURCE" ]; then
  for item in "$SOURCE"/*; do
    [ -e "$item" ] || continue

    name=$(basename "$item")
    case "$name" in
      content|perfil)
        # Runtime: só preenche o volume na primeira vez (não sobrescreve uploads).
        if [ -d "$item" ]; then
          mkdir -p "$TARGET/$name"
          find "$item" -type f | while read -r file; do
            rel="${file#$item/}"
            dest="$TARGET/$name/$rel"
            if [ ! -f "$dest" ]; then
              mkdir -p "$(dirname "$dest")"
              cp "$file" "$dest"
            fi
          done
        fi
        ;;
      *)
        # Versionado no GitHub: sincroniza a cada deploy.
        cp -a "$item" "$TARGET/"
        ;;
    esac
  done
fi

chown -R node:node "$TARGET" 2>/dev/null || chmod -R a+rwx "$TARGET"

if command -v runuser >/dev/null 2>&1; then
  exec runuser -u node -- "$@"
fi

exec su -s /bin/sh node -c 'exec "$@"' sh "$@"
