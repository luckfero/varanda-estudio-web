#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source_dir="${project_root}/assets/source"
target="${project_root}/public/images/brasa-do-vale-hero.png"
temporary="${target}.tmp"
expected_sha256="657a01081586b013616625860c0188711cca850e9a83997c556394504f2bb309"

mkdir -p "$(dirname "${target}")"
: > "${temporary}"

for part in "${source_dir}"/brasa-do-vale-hero.part-*.bin; do
  [[ -f "${part}" ]] || {
    echo "Missing image source fragments in assets/source." >&2
    exit 66
  }
  cat "${part}" >> "${temporary}"
done

actual_sha256="$(sha256sum "${temporary}" | awk '{print $1}')"
[[ "${actual_sha256}" == "${expected_sha256}" ]] || {
  echo "Restored image failed its integrity check." >&2
  exit 65
}

mv "${temporary}" "${target}"
echo "Restored public/images/brasa-do-vale-hero.png"
