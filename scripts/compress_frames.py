"""
compress_frames.py
Converts all PNG frames in public/part1/ to WebP format at quality=75.
Outputs to public/part1-webp/ directory.
Reduces file size by 70-90% compared to original PNGs.
"""

import os
import sys
from PIL import Image
from pathlib import Path

INPUT_DIR  = Path("public/part1")
OUTPUT_DIR = Path("public/part1-webp")
QUALITY    = 72   # 0-100, higher = better quality but bigger file
MAX_WIDTH  = 1280 # Resize width to reduce resolution (optional)

def main():
    if not INPUT_DIR.exists():
        print(f"ERROR: Input directory not found: {INPUT_DIR}")
        sys.exit(1)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    png_files = sorted(INPUT_DIR.glob("*.png"))
    total = len(png_files)
    if total == 0:
        print("No PNG files found!")
        sys.exit(1)

    print(f"Found {total} PNG files. Converting to WebP (quality={QUALITY})...")

    total_original  = 0
    total_compressed = 0

    for i, png_path in enumerate(png_files, 1):
        webp_path = OUTPUT_DIR / (png_path.stem + ".webp")

        with Image.open(png_path) as img:
            # Resize proportionally
            if img.width > MAX_WIDTH:
                ratio  = MAX_WIDTH / img.width
                new_h  = int(img.height * ratio)
                img    = img.resize((MAX_WIDTH, new_h), Image.LANCZOS)

            # Convert to RGB (WebP doesn't support palette mode well)
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGBA")
            else:
                img = img.convert("RGB")

            img.save(webp_path, "WEBP", quality=QUALITY, method=4)

        orig_size = png_path.stat().st_size
        comp_size = webp_path.stat().st_size
        total_original  += orig_size
        total_compressed += comp_size

        if i % 50 == 0 or i == total:
            saved_pct = (1 - total_compressed / total_original) * 100
            print(f"  [{i}/{total}] Done — saved {saved_pct:.1f}% so far")

    saved_mb = (total_original - total_compressed) / 1_048_576
    saved_pct = (1 - total_compressed / total_original) * 100
    print(f"\n✓ Complete!")
    print(f"  Original:   {total_original / 1_048_576:.1f} MB")
    print(f"  Compressed: {total_compressed / 1_048_576:.1f} MB")
    print(f"  Saved:      {saved_mb:.1f} MB ({saved_pct:.1f}%)")

if __name__ == "__main__":
    main()
