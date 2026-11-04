LANGUAGE ?= typescript

.PHONY: lint check build config package image
lint: check
	bash ../scripts/lint.sh

check:
	python3 scripts/check-versions.py
	python3 -m unittest discover -s tests

build: check
	bash scripts/build.sh "$(LANGUAGE)"

config:
	python3 scripts/local-config.py "$(LANGUAGE)"

package: build
	bash scripts/package.sh "$(LANGUAGE)"

image: check
	bash scripts/build-image.sh "$(LANGUAGE)"
