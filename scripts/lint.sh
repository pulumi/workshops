#!/bin/bash
npm install -g markdownlint-cli markdown-link-check > /dev/null 2>&1

# Function to check UTM codes in URLs
check_utm_code() {
  local file=$1
  local url_pattern="http.*"
  local utm_code="utm_source=GitHub&utm_medium=referral&utm_campaign=workshops"
  local pulumi_domain="pulumi.com"
  local found_error=0

  while IFS= read -r line; do
    if [[ $line =~ \]\($url_pattern\) ]]; then
      url=$(echo "$line" | sed -n 's/.*(\(http[^)]*\)).*/\1/p')
      if [[ $url == *"$pulumi_domain"* && ! $url == *"$utm_code"* ]]; then
        echo "Missing UTM code in $file: $url"
        found_error=1
      fi
    fi
  done < "$file"
  return $found_error
}

# Find all markdown files in the current directory and its subdirectories
find . -name "*.md" | while read file; do
  # Check if the file starts with ./archive/ or ./fundamentals
  if [[ $file == ./archive/* || $file == ./fundamentals* || $file == */node_modules/* ]]; then
    # echo "Skipping $file"
    continue
  fi

  NODE_OPTIONS="--no-deprecation"  markdown-link-check -c scripts/.markdown-link-check.json -q "$file"
  # Check return code of markdown-link-check
  if [ $? -ne 0 ]; then
    echo "Warning: Broken link in $file"
    # exit 1 # Uncomment this line to fail the build if there is a missing UTM code
  fi

  npx markdownlint --config scripts/.markdownlint.json "$file"
  # Check return code of markdownlint
  if [ $? -ne 0 ]; then
    echo "Warning: Markdown violation(s) in $file"
    # exit 1 # Uncomment this line to fail the build if there is a missing UTM code
  fi

  check_utm_code "$file"
  # Check return code of check_utm_code
  if [ $? -ne 0 ]; then
    echo "Warning: 🚨🚨🚨 Missing UTM code in $file"
    # exit 1 # Uncomment this line to fail the build if there is a missing UTM code
  fi

done