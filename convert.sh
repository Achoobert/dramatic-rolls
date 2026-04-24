#!/bin/bash

# ffmpeg -i input.mp3 output.ogg
convert_images() {
  local dir="$1"
  local count=1

  find "$dir" -type f \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" \) | while read -r file; do
    # Get file extension and parent directory
    ext="${file##*.}"
    dir_name=$(basename "$(dirname "$file")")

    # Determine output filename
    if [[ $(basename "$file") =~ ^Screenshot ]]; then
      # Rename Screenshot files with parent dir + count
      new_name="${dir}/${dir_name}_$(printf "%03d" "$count").webp"
      ((count++))
    else
      # Default conversion keeping the original name
      new_name="${file%.*}.webp"
    fi

    # Convert to .webp
    if cwebp -q 80 "$file" -o "$new_name"; then
      echo "Converted: $file → $new_name"
      rm "$file" # Delete original
    else
      echo "Failed to convert: $file"
    fi
  done
}


convert_audio() {
  local dir="$1"

  find "$dir" -type f \( -iname "*.wav" -o -iname "*.mp3" \) | while read -r file; do
    new_name="${file%.*}.ogg"
    # Convert to .ogg
    if ffmpeg -y -i "$file" -acodec libvorbis "$new_name"; then
      echo "Converted: $file → $new_name"
      rm "$file" # Delete original
    else
      echo "Failed to convert: $file"
    fi
  done
}

# Run in current directory 
convert_images "$(pwd)"
convert_audio "$(pwd)"

echo "Conversion complete!"
