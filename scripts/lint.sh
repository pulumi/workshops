#!/bin/bash

# Function to check UTM codes in URLs
check_utm_code() {
  local file=$1
  local url_pattern="http.*"
  local utm_code="utm_source=GitHub&utm_medium=referral&utm_campaign=workshops"
  local pulumi_domain="pulumi.com"
  local found_error=0
  local line_number=0
  local is_deployment="https://app.pulumi.com/new?template="

  while IFS= read -r line; do
    ((line_number++))
    if [[ $line =~ \]\($url_pattern\) ]]; then
      url=$(echo "$line" | sed -n 's/.*(\(http[^)]*\)).*/\1/p')
      if [[ $url == *"$pulumi_domain"* && ! $url == *"$utm_code"* ]]; then
        # Check if the URL starts with the deployment URL
        if [[ $url == "$is_deployment"* || $url == *".png" ]]; then
          continue  # Skip warning for deployment URLs
        fi
        echo "🚨 Missing or wrong UTM used code in ${file} at L${line_number} $url"
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

  check_utm_code "$file"
  # Check return code of check_utm_code
  # if [ $? -ne 0 ]; then
    # echo "Error: 🚨🚨🚨 Missing UTM code in $file"
    # exit 1 # Uncomment this line to fail the build if there is a missing UTM code
  # fi

done