#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source_dir="${project_root}/assets/source"
# Remonta em assets/originais/, nao em public/. O PNG de 2 MB e o arquivo
# de origem para gerar as variantes; nao ha razao para servi-lo a ninguem.
target="${project_root}/assets/originais/brasa-do-vale-hero.png"
temporary="${target}.tmp"
expected_sha256="657a01081586b013616625860c0188711cca850e9a83997c556394504f2bb309"

mkdir -p "$(dirname "${target}")"
: > "${temporary}"

for part in "${source_dir}"/brasa-do-vale-hero.part-*.bin; do
  [[ -f "${part}" ]] || {
    echo "Faltam os fragmentos da imagem em assets/source." >&2
    exit 66
  }
  cat "${part}" >> "${temporary}"
done

actual_sha256="$(sha256sum "${temporary}" | awk '{print $1}')"
[[ "${actual_sha256}" == "${expected_sha256}" ]] || {
  echo "A imagem remontada nao passou na verificacao de integridade." >&2
  exit 65
}

mv "${temporary}" "${target}"
echo "Remontado assets/originais/brasa-do-vale-hero.png"
