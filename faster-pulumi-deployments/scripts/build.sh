#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
language="${1:?Usage: build.sh typescript|python|go|dotnet|java}"
case "$language" in typescript|python|go|dotnet|java) ;; *) exit 2 ;; esac
source_dir="$root/programs/$language"
output="$root/dist/$language"
python3 "$root/scripts/check-versions.py"
rm -rf "$output"
mkdir -p "$output"

case "$language" in
    typescript)
        (cd "$source_dir" && npm ci --ignore-scripts && npm run build)
        cp "$source_dir/build/index.js" "$source_dir/package.json" "$source_dir/package-lock.json" "$output/"
        (cd "$output" && npm ci --omit=dev --ignore-scripts)
        ;;
    go)
        (cd "$source_dir" && go mod download && CGO_ENABLED=0 go build -buildvcs=false -trimpath -o "$output/infra" .)
        ;;
    dotnet)
        (cd "$source_dir" && dotnet restore --locked-mode && dotnet publish --no-restore --configuration Release -p:UseAppHost=false --output "$output")
        ;;
    java)
        (cd "$source_dir" && mvn --batch-mode --no-transfer-progress package)
        cp "$source_dir/target/program.jar" "$output/program.jar"
        ;;
    python)
        (cd "$source_dir" && uv export --locked --no-dev --format requirements-txt --output-file "$output/requirements.txt" > /dev/null && \
            uv run --locked --no-dev --with pip==25.3 python -m pip download \
                --only-binary=:all: --require-hashes --dest "$output/wheels" --requirement "$output/requirements.txt")
        cp "$source_dir/__main__.py" "$root/scripts/prepare-python.sh" "$output/"
        ;;
esac

cp "$source_dir/Pulumi.prebuilt.yaml" "$output/Pulumi.yaml"
cp "$root/provider-plugins.txt" "$output/provider-plugins.txt"
printf 'Prepared %s in %s\n' "$language" "$output"
