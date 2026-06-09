#!/bin/bash
# Usage: CLOUDINARY_KEY=xxx CLOUDINARY_SECRET=yyy bash scripts/upload-to-cloudinary.sh

CLOUD_NAME="dbsdu7dk5"
API_KEY="${CLOUDINARY_KEY}"
API_SECRET="${CLOUDINARY_SECRET}"

if [ -z "$API_KEY" ] || [ -z "$API_SECRET" ]; then
  echo "Error: Set CLOUDINARY_KEY and CLOUDINARY_SECRET env vars before running"
  exit 1
fi

upload() {
  local FILE=$1
  local FOLDER=$2
  local FILENAME=$(basename "$FILE" | sed 's/\.[^.]*$//')

  echo "Uploading $FILE -> $FOLDER/$FILENAME ..."

  curl -s -X POST \
    "https://api.cloudinary.com/v1_1/$CLOUD_NAME/image/upload" \
    -F "file=@$FILE" \
    -F "folder=$FOLDER" \
    -F "public_id=$FILENAME" \
    -F "api_key=$API_KEY" \
    -F "timestamp=$(date +%s)" \
    -u "$API_KEY:$API_SECRET" \
    | python3 -c "import sys,json; d=json.load(sys.stdin); print('  OK:', d.get('secure_url','ERROR: '+str(d)))"
}

# Logo
upload "public/logo.png" "easyfetcher/logo"

# Connector SVGs
for SVG in public/connectors/*.svg; do
  upload "$SVG" "easyfetcher/connectors"
done

echo ""
echo "All done! Check your Cloudinary Media Library."
